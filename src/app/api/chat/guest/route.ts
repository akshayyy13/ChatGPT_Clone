import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_GUEST_MESSAGES = 2;

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const used = Number(cookieStore.get("guest-chat-count")?.value || 0);
  if (!Number.isInteger(used) || used < 0 || used >= MAX_GUEST_MESSAGES) {
    return NextResponse.json(
      { error: "You’ve used your two free messages. Log in or sign up to keep chatting." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 4) {
    return NextResponse.json({ error: "Invalid guest conversation." }, { status: 400 });
  }

  const validMessages = messages.every(
    (message) =>
      message &&
      ["user", "assistant"].includes(message.role) &&
      typeof message.content === "string" &&
      message.content.trim().length > 0 &&
      message.content.length <= 8000
  );
  const userMessages = messages.filter((message) => message.role === "user").length;
  const assistantMessages = messages.filter((message) => message.role === "assistant").length;
  if (
    !validMessages ||
    messages.at(-1)?.role !== "user" ||
    userMessages > used + 1 ||
    userMessages > MAX_GUEST_MESSAGES ||
    assistantMessages > used
  ) {
    return NextResponse.json({ error: "Invalid guest conversation." }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Guest chat is not configured. Add a Gemini API key to the server environment." },
      { status: 503 }
    );
  }

  try {
    const input = messages.map(
      ({ role, content }: { role: "user" | "assistant"; content: string }) => ({
        type: role === "assistant" ? "model_output" : "user_input",
        content: [{ type: "text", text: content }],
      })
    );
    const modelResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
          "Api-Revision": "2026-05-20",
        },
        body: JSON.stringify({
          model: "gemini-3.5-flash-lite",
          input,
          store: false,
          system_instruction: "You are a helpful assistant. Respond clearly and directly.",
          generation_config: { thinking_level: "low", max_output_tokens: 1024 },
        }),
        signal: AbortSignal.timeout(60000),
      }
    );
    const interaction = await modelResponse.json();
    if (!modelResponse.ok) {
      throw new Error(interaction.error?.message || "Gemini request failed.");
    }

    const reply = interaction.steps
      ?.filter((step: { type?: string }) => step.type === "model_output")
      .flatMap((step: { content?: Array<{ type?: string; text?: string }> }) => step.content || [])
      .filter((part: { type?: string }) => part.type === "text")
      .map((part: { text?: string }) => part.text || "")
      .join("")
      .trim();
    if (!reply) throw new Error("Gemini returned an empty response.");

    const remaining = MAX_GUEST_MESSAGES - used - 1;
    const response = NextResponse.json({ reply, remaining });
    response.cookies.set("guest-chat-count", String(used + 1), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Guest chat generation failed:", error);
    return NextResponse.json(
      { error: "The assistant could not reply right now. Please try again." },
      { status: 502 }
    );
  }
}
