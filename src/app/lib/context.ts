// lib/context.ts
import { estimatedTokens, modelContextLimit } from "./token";

export function sliceForContext(
  messages: {
    role: string;
    content: { type: "text" | "image" | "file"; text?: string }[];
  }[],
  model: string,
  systemPrompt?: string
) {
  const limit = modelContextLimit(model);
  const sysTokens = systemPrompt ? estimatedTokens(systemPrompt) : 0;
  let total = sysTokens;

  const history: typeof messages = [];
  const dropped: typeof messages = [];

  // We'll iterate from oldest to newest and keep adding until token budget exceeded
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    const t = estimatedTokens(m.content.map((c) => c.text || "").join("\n"));
    if (total + t > limit * 0.9) {
      // Drop the remainder
      dropped.push(...messages.slice(i));
      break;
    }
    history.push(m);
    total += t;
  }

  return {
    system: systemPrompt,
    history,
    dropped,
  };
}
