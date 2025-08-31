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
export const dynamic = "force-dynamic"; // ADD THIS LINE

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

  // Prepare user message content - ALWAYS INCLUDE TEXT MESSAGE
  const userContent: {
    type: string;
    text: string;
    url?: string;
    mime?: string;
    name?: string;
  }[] = [];

  // ALWAYS add the text message (this was missing!)
  if (message && message.trim()) {
    userContent.push({
      type: "text",
      text: message.trim(),
    });
  }

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

  // Don't save empty messages
  if (userContent.length === 0) {
    return new Response("Message content is required", { status: 400 });
  }

  // Save user message with proper error handling
  let savedUserMessage;
  try {
    savedUserMessage = await Message.create({
      userId,
      threadId,
      role: "user",
      content: userContent,
    });
    console.log("✅ User message saved:", savedUserMessage._id);
  } catch (error) {
    console.error("❌ Failed to save user message:", error);
    return new Response("Failed to save message", { status: 500 });
  }

  // Update thread title if it's the first real message
  if (message && message.trim() && thread.title === "New Chat") {
    try {
      const updatedTitle =
        message.substring(0, 50) + (message.length > 50 ? "..." : "");
      await Thread.findByIdAndUpdate(threadId, { title: updatedTitle });
      console.log("✅ Thread title updated:", updatedTitle);
    } catch (error) {
      console.error("❌ Failed to update thread title:", error);
    }
  }

  // Fetch chat history
  const history = await Message.find({ threadId }).sort({ createdAt: 1 });

  // Process messages for Gemini
  const msgs = history.map((m: any) => {
    const textContent = m.content.filter((c: any) => c.type === "text");
    const fileContent = m.content.filter(
      (c: any) => c.type === "file" || c.type === "image"
    );

    const combinedContent = [...textContent];

    // Add file descriptions as text
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

    // Save assistant message with proper error handling
    try {
      const savedAssistantMessage = await Message.create({
        userId,
        threadId,
        role: "assistant",
        content: [{ type: "text", text: fullText }],
      });
      console.log("✅ Assistant message saved:", savedAssistantMessage._id);
    } catch (error) {
      console.error("❌ Failed to save assistant message:", error);
    }

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
