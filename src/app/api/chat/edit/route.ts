// app/api/chat/route.ts
import { NextRequest } from "next/server";
import { dbConnect } from "@/app/lib/db";
import { Thread } from "@/models/Thread";
import { Message } from "@/models/Message";
import { getModel, toGeminiMessages } from "@/app/lib/ai";
import { sliceForContext } from "@/app/lib/context";
import { getMemories, addMemories } from "@/app/lib/memory";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId")!;
  const { message, model } = await req.json();
  const toCoreMessages=toGeminiMessages;
  const thread = await Thread.findById(threadId);
  if (!thread) return new Response("Thread not found", { status: 404 });

  // Save user message
  await Message.create({
    threadId,
    role: "user",
    content: [{ type: "text", text: message }],
  });

  // EARLY MOCK EXIT: stop here when DISABLE_AI=true
  if (process.env.DISABLE_AI === "true") {
    const mockText = `Mock reply: ${message.slice(0, 60)}...`;
    await Message.create({
      threadId,
      role: "assistant",
      content: [{ type: "text", text: mockText }],
    });
    // Plain text response so your UI streaming reader still works (single chunk)
    return new Response(mockText, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Normal path (live AI) – will not run when DISABLE_AI=true
  const history = await Message.find({ threadId }).sort({ createdAt: 1 });
  const msgs = history.map((m: any) => ({ role: m.role, content: m.content }));
  const mems = await getMemories(threadId);
  const memBlock = mems.length ? `Relevant conversation facts:\n- ${mems.join("\n- ")}` : "";
  const systemPrompt = `You are ChatGPT. Answer helpfully and concisely.\n${memBlock}`;
  const { history: sliced } = sliceForContext(msgs, model || thread.model, systemPrompt);
  const final = [{ role: "system" as const, content: [{ type: "text", text: systemPrompt }] }, ...sliced];
  const core = toCoreMessages(final as any);
  const selectedModel = getModel(model || thread.model);

  const { streamText } = await import("ai");
  const { textStream } = await streamText({ model: selectedModel, messages: core });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let acc = "";
      for await (const chunk of textStream) {
        acc += chunk;
        controller.enqueue(encoder.encode(chunk));
      }
      await Message.create({ threadId, role: "assistant", content: [{ type: "text", text: acc }] });
      addMemories(threadId, acc).catch(() => {});
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
