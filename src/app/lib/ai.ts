// src/lib/ai.ts
import { google } from "@ai-sdk/google";
import { type CoreMessage } from "ai";

// Convert your app messages to Gemini-compatible messages
export function toGeminiMessages(
  messages: {
    role: "system" | "user" | "assistant";
    content: any[];
  }[]
): CoreMessage[] {
  return messages.map((m) => {
    // Convert content array to a single string for AI SDK
    const textParts = m.content
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text || "")
      .join("\n");

    // For images, add them as separate content in the message
    const imageParts = m.content.filter((c: any) => c.type === "image");

    // If there are images, handle them differently
    if (imageParts.length > 0) {
      const content: any[] = [];

      // Add text content
      if (textParts.trim()) {
        content.push({ type: "text", text: textParts });
      }

      // Add image content
      imageParts.forEach((img: any) => {
        if (img.image) {
          content.push({
            type: "image",
            image: img.image,
            mimeType: img.mimeType || "image/jpeg",
          });
        }
      });

      return {
        role: m.role,
        content: content,
      };
    }

    // For text-only messages, return as string
    return {
      role: m.role,
      content: textParts || "",
    };
  });
}

// Use Gemini 2.0 Flash for better multimodal support
export function getModel(id?: string) {
  const name = (id || "").toLowerCase();

  // Force use of Gemini 2.0 Flash for better image support
  if (name.includes("flash") || name.includes("2.0") || name.includes("pro")) {
    return google("models/gemini-2.0-flash-exp");
  }

  // Default to Gemini 2.0 Flash
  return google("models/gemini-2.0-flash-exp");
}

export type ChatContent =
  | { type: "text"; text: string }
  | { type: "image"; url: string; image?: string; mimeType?: string }
  | { type: "file"; url: string; mime?: string; name?: string };

export type Msg = {
  role: "system" | "user" | "assistant";
  content: ChatContent[];
};
