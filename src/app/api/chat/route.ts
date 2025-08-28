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
  const { message, model } = body;

  // Fetch thread
  const thread = await Thread.findOne({ _id: threadId, userId });
  if (!thread) return new Response("Thread not found", { status: 404 });

  // Save user message
  await Message.create({
    userId,
    threadId,
    role: "user",
    content: [{ type: "text", text: message }],
  });

  // Fetch chat history
  const history = await Message.find({ threadId }).sort({ createdAt: 1 });
  const msgs = history.map((m: any) => ({
    role: m.role,
    content: m.content.filter((c: any) => c.type === "text"),
  }));

  const mems = await getMemories(threadId);
  const memBlock = mems.length ? `Relevant facts:\n- ${mems.join("\n- ")}` : "";
  const systemPrompt = `Answer concisely.\n${memBlock}`;

  const { history: sliced } = sliceForContext(
    msgs,
    model || thread.model || "flash",
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
  const selectedModel = getModel(model || thread.model || "flash");

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
        "⚠️ There was an issue connecting to Gemini API. Here’s a mock reply so you can keep testing.",
    });
  }
}
