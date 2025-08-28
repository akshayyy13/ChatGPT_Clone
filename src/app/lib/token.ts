// lib/token.ts
export function estimatedTokens(text: string) {
  // Quick heuristic: ~4 chars per token
  return Math.ceil((text || "").length / 4);
}

export function modelContextLimit(model: string) {
  if (model.startsWith("gpt-4o") || model.includes("gemini-2.0")) return 128000;
  if (model.startsWith("gpt-4-turbo")) return 128000;
  return 32000;
}
