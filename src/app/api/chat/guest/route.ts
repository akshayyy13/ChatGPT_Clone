import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_GUEST_MESSAGES = 2;

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const used = Number(cookieStore.get("guest-chat-count")?.value || 0);
  if (used >= MAX_GUEST_MESSAGES) {
    return NextResponse.json({ error: "Your two free messages have been used. Please log in to continue." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length > 5 || messages.length < 1) {
    return NextResponse.json({ error: "Invalid guest conversation." }, { status: 400 });
  }
  const validMessages = messages.every((message) =>
    message && ["user", "assistant"].includes(message.role) && typeof message.content === "string" && message.content.length <= 8000
  );
  if (!validMessages || messages.at(-1)?.role !== "user") {
    return NextResponse.json({ error: "Please send a valid text message." }, { status: 400 });
  }
  const userMessageCount = messages.filter((message: { role: string }) => message.role === "user").length;
  if (userMessageCount > used + 1 || userMessageCount > MAX_GUEST_MESSAGES) {
    return NextResponse.json({ error: "Invalid guest conversation." }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Guest chat is not configured. Set GEMINI_API_KEY on the server." }, { status: 503 });
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    const conversation = messages
      .map(({ role, content }: { role: "user" | "assistant"; content: string }) => `${role === "user" ? "User" : "Assistant"}: ${content}`)
      .join("\n\n");
    const interaction = await client.interactions.create(
      {
        model: "gemini-3.5-flash-lite",
        input: conversation,
        system_instruction: "You are a helpful assistant. Respond clearly and directly.",
        generation_config: { thinking_level: "low", max_output_tokens: 512 },
      },
      { timeout_ms: 25000, retries: { strategy: "none" } }
    );
    const reply = interaction.output_text?.trim();
    if (!reply) throw new Error("Gemini returned an empty response.");
    const remaining = MAX_GUEST_MESSAGES - used - 1;
    const response = NextResponse.json({ reply, remaining });
    response.cookies.set("guest-chat-count", String(used + 1), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error) {
    console.error("Guest chat generation failed:", error);
    return NextResponse.json({ error: "The assistant took too long or is temporarily unavailable. Please try again." }, { status: 502 });
  }
}
