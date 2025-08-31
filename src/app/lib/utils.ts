// lib/utils.ts
import { getModel, toGeminiMessages, type Msg } from "@/app/lib/ai";

async function generateSummary(messages: Msg[]) {
  const core = toGeminiMessages([
    {
      role: "system",
      content: [{ type: "text", text: "Summarize concisely." }],
    },
    ...messages,
  ]);

  const { text } = await (
    await import("ai")
  ).generateText({
    model: getModel("gemini-2.0"), // or your default
    messages: core,
  });

  return text;
}

export { generateSummary };
