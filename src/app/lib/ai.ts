// src/lib/ai.ts
import { google } from "@ai-sdk/google";
import { type CoreMessage } from "ai";

// Convert your app messages to Gemini-compatible messages
export function toGeminiMessages(
  messages: {
    role: "system" | "user" | "assistant";
    content: { type: "text"; text: string }[];
  }[]
): CoreMessage[] {
  return messages.map((m) => ({
    role: m.role,
    content: m.content
      .map((c) => {
        return c.text || ""; // Gemini expects plain strings
      })
      .join("\n"),
  }));
}

// Choose the free-tier safe model
export function getModel(id?: string) {
  const name = (id || "").toLowerCase();
  if (name.includes("flash") || name.includes("pro")) {
    return google("models/gemini-1.5-flash");
  }
  if (name.includes("2.5-flash")) {
    return google("models/gemini-2.5-flash");
  }
  return google("models/gemini-1.5-flash");
}

export type ChatContent =
  | { type: "text"; text: string }
  | { type: "image"; url: string }
  | { type: "file"; url: string; mime?: string; name?: string };

export type Msg = {
  role: "system" | "user" | "assistant";
  content: ChatContent[];
};
