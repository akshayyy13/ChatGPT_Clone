// lib/memory.ts
import Mem0AI from "mem0ai";

const client = new Mem0AI({ apiKey: process.env.MEM0_API_KEY! });

export async function addMemories(threadId: string, text: string) {
  // If text is JSON string or contains JSON, parse and extract just the text content
  let plainText = text;

  // If text is stringified JSON, parse it safely
  try {
    const parsed = JSON.parse(text);
    // Extract text from known structure or fallback to string
    if (typeof parsed === "string") {
      plainText = parsed;
    } else if (typeof parsed === "object" && parsed.content) {
      // For example, if your AI response is structured as { content: "..." }
      plainText =
        typeof parsed.content === "string"
          ? parsed.content
          : JSON.stringify(parsed.content);
    } else {
      plainText = JSON.stringify(parsed);
    }
  } catch {
    // Not JSON, assume plain string, do nothing
  }

  await client.add([{ role: "assistant", content: plainText }], {
    user_id: threadId,
  });

}

// Replace .list() with .get() or .query() as appropriate:
export async function getMemories(threadId: string) {
  // Check docs for proper API! Example, if it's .getAll or .query:
  // const res = await client.getAll({ namespace: threadId });

  // If only .get() exists:
  // const res = await client.get({ namespace: threadId });
  // return [res?.content];

  // If nothing works for bulk query, stub for now:
  return []; // or throw new Error('Listing not supported');
}
