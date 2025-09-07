// src/lib/ai.ts
import { google } from "@ai-sdk/google";
import { type CoreMessage } from "ai";

// Define proper content types
export type ChatContent =
  | { type: "text"; text: string }
  | { type: "image"; url: string; image?: string; mimeType?: string }
  | { type: "file"; url: string; mime?: string; name?: string };

export type Msg = {
  role: "system" | "user" | "assistant";
  content: ChatContent[];
};

// Type guard to check if content is text type
function isTextContent(
  content: ChatContent
): content is { type: "text"; text: string } {
  return content.type === "text";
}

// Type guard to check if content is image type
function isImageContent(content: ChatContent): content is {
  type: "image";
  url: string;
  image?: string;
  mimeType?: string;
} {
  return content.type === "image";
}

// Convert your app messages to Gemini-compatible messages
export function toGeminiMessages(messages: Msg[]): CoreMessage[] {
  return messages.map((m): CoreMessage => {
    // Convert content array to a single string for AI SDK
    const textParts = m.content
      .filter(isTextContent)
      .map((c) => c.text || "")
      .join("\n");

    // For images, add them as separate content in the message
    const imageParts = m.content.filter(isImageContent);

    // If there are images, handle them differently
    if (imageParts.length > 0) {
      const content: Array<
        | { type: "text"; text: string }
        | { type: "image"; image: string; mimeType: string }
      > = [];

      // Add text content
      if (textParts.trim()) {
        content.push({ type: "text", text: textParts });
      }

      // Add image content
      imageParts.forEach((img) => {
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
      } as CoreMessage;
    }

    // For text-only messages, return as string content
    return {
      role: m.role,
      content: textParts || "",
    } as CoreMessage;
  });
}

// Use Gemini 2.0 Flash for better multimodal support
export function getModel(id?: string) {
  const name = (id || "").toLowerCase();

  // Force use of Gemini 2.0 Flash-exp for better image support
  if (name.includes("flash") || name.includes("2.0") || name.includes("pro")) {
    return google("models/gemini-2.5-flash");
  }

  // Default to Gemini 2.0 Flash-exp
  return google("models/gemini-2.5-flash");
}
