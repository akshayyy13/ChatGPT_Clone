// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/db";
import { Thread } from "@/models/Thread";
import { Message } from "@/models/Message";
import { getModel, toGeminiMessages } from "@/app/lib/ai";
import { sliceForContext } from "@/app/lib/context";
import { getMemories, addMemories } from "@/app/lib/memory";
import { auth } from "@/app/lib/auth";
import { streamText } from "ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  await dbConnect();

  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const userId = String(session.user.id);

  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");
  if (!threadId) return new Response("threadId is required", { status: 400 });

  const body = await req.json();
  const { message, model, fileUrl, fileName, fileType } = body;

  // Fetch thread
  const thread = await Thread.findOne({ _id: threadId, userId });
  if (!thread) return new Response("Thread not found", { status: 404 });

  // Prepare user message content
  const userContent = [{ type: "text", text: message }];

  // Add file if provided
  if (fileUrl) {
    userContent.push({
      type: fileType?.startsWith("image/") ? "image" : "file",
      text: fileName ? `File: ${fileName}` : "File attached",
      url: fileUrl,
      mime: fileType,
      name: fileName,
    });
  }

  // Save user message
  await Message.create({
    userId,
    threadId,
    role: "user",
    content: userContent,
  });

  // Fetch chat history
  const history = await Message.find({ threadId }).sort({ createdAt: 1 });

  // Process messages for Gemini - keep it simple for text
  const msgs = history.map((m: any) => {
    const textContent = m.content.filter((c: any) => c.type === "text");
    const fileContent = m.content.filter(
      (c: any) => c.type === "file" || c.type === "image"
    );

    let combinedContent = [...textContent];

    // For now, just add file descriptions as text to avoid complexity
    if (fileContent.length > 0) {
      const fileDescriptions = fileContent
        .map((f: any) => {
          if (f.type === "image") {
            return `[Image uploaded: ${f.name || "image"} - ${f.url}]`;
          }
          return `[File uploaded: ${f.name || "document"} - ${f.url}]`;
        })
        .join("\n");

      combinedContent.push({ type: "text", text: fileDescriptions });
    }

    return {
      role: m.role,
      content: combinedContent,
    };
  });

  const mems = await getMemories(threadId);
  const memBlock = mems.length ? `Relevant facts:\n- ${mems.join("\n- ")}` : "";
  const systemPrompt = `You are a helpful AI assistant. When users mention uploaded files or images, acknowledge them and provide helpful responses based on the file information provided.\n${memBlock}`;

  const { history: sliced } = sliceForContext(
    msgs,
    model || thread.model || "gemini-2.0-flash",
    systemPrompt
  );

  const final = [
    {
      role: "system" as const,
      content: [{ type: "text", text: systemPrompt }],
    },
    ...sliced,
  ];

  const core = toGeminiMessages(final as any);
  const selectedModel = getModel(model || thread.model || "gemini-2.0-flash");

  try {
    const result = await streamText({
      model: selectedModel,
      messages: core,
    });

    let fullText = "";
    for await (const chunk of result.textStream) {
      fullText += chunk;
    }

    // Save assistant message
    await Message.create({
      userId,
      threadId,
      role: "assistant",
      content: [{ type: "text", text: fullText }],
    });
    addMemories(threadId, fullText).catch(() => {});

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({
      role: "assistant",
      content:
        "⚠️ There was an issue connecting to Gemini API. Here's a mock reply so you can keep testing.",
    });
  }
}
