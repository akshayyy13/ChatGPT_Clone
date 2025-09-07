// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/db";
import { Thread } from "@/models/Thread";
import { Message } from "@/models/Message";

import { getModel, type ChatContent } from "@/app/lib/ai";
import { getMemories, addMemories } from "@/app/lib/memory";
import { auth } from "@/lib/auth";
import { streamText } from "ai";
import type { CoreMessage } from "ai";

// Type for message documents from database
type MessageDocument = {
  _id: string;
  threadId: string;
  userId: string;
  role: "user" | "assistant";
  content: ChatContent[];
  createdAt: Date;
  updatedAt: Date;
};
interface MessageContent {
  type: "text" | "image" | "file";
  text?: string;
  image?: string;
  url?: string;
  mimeType?: string;
  mime?: string;
  name?: string;
}

type MessageContentType = string | MessageContent | MessageContent[];
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await dbConnect();

  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const userId = String(session.user.id);

  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");
  if (!threadId) return new Response("threadId is required", { status: 400 });

  const body = await req.json();
  const {
    message,
    model,
    fileUrl,
    fileName,
    fileType,
    // ✅ NEW: Accept Google File URI for Gemini
    googleFileUri,
    googleFileName,
  } = body;

  // Fetch thread
  const thread = await Thread.findOne({ _id: threadId, userId });
  if (!thread) return new Response("Thread not found", { status: 404 });

  // Prepare user message content
  const userContent: ChatContent[] = [];

  // Add text message
  if (message && message.trim()) {
    userContent.push({
      type: "text",
      text: message.trim(),
    });
  }

  // Add file if provided (keeping existing structure for DB)
  if (fileUrl) {
    if (fileType?.startsWith("image/")) {
      userContent.push({
        type: "image",
        url: fileUrl,
        mimeType: fileType,
      });
    } else {
      userContent.push({
        type: "file",
        url: fileUrl,
        mime: fileType,
        name: fileName,
      });
    }

    // ✅ Store Google File URI in DB for future use
    if (googleFileUri) {
      userContent.push({
        type: "text",
        text: `Google File URI: ${googleFileUri}`,
      });
    }

    userContent.push({
      type: "text",
      text: fileName ? `File: ${fileName}` : "File attached",
    });
  }

  // Don't save empty messages
  if (userContent.length === 0) {
    return new Response("Message content is required", { status: 400 });
  }

  // Save user message
  let savedUserMessage;
  try {
    savedUserMessage = await Message.create({
      userId,
      threadId,
      role: "user",
      content: userContent,
    });
    console.log("✅ User message saved:", savedUserMessage._id);
  } catch (error) {
    console.error("❌ Failed to save user message:", error);
    return new Response("Failed to save message", { status: 500 });
  }

  // Update thread title if it's the first real message
  if (message && message.trim() && thread.title === "New Chat") {
    try {
      const updatedTitle =
        message.substring(0, 50) + (message.length > 50 ? "..." : "");
      await Thread.findByIdAndUpdate(threadId, { title: updatedTitle });
      console.log("✅ Thread title updated:", updatedTitle);
    } catch (error) {
      console.error("❌ Failed to update thread title:", error);
    }
  }

  // Fetch chat history
  const history = await Message.find({ threadId }).sort({ createdAt: 1 });

  // Process messages for conversation history
  const msgs = history.map((m: MessageDocument) => {
    const textContent = m.content.filter(
      (c): c is { type: "text"; text: string } => c.type === "text"
    );
    const fileContent = m.content.filter(
      (c): c is ChatContent => c.type === "file" || c.type === "image"
    );

    const combinedContent: ChatContent[] = [...textContent];

    // Add file descriptions as text (for conversation history)
    if (fileContent.length > 0) {
      const fileDescriptions = fileContent
        .map((f) => {
          if (f.type === "image") {
            return `[Image uploaded: ${
              (f as { name?: string }).name || "image"
            }]`;
          }
          if (f.type === "file") {
            return `[File uploaded: ${f.name || "document"}]`;
          }
          return "";
        })
        .join("\n");

      combinedContent.push({ type: "text", text: fileDescriptions });
    }

    return {
      role: m.role,
      content: combinedContent,
    };
  });

  // Safely retrieve memories with fallback
  // Enhanced debugging for memory retrieval
  console.log("🔍 Debug Info:");
  console.log("ThreadId:", threadId);
  console.log("UserId:", userId);
  console.log("Message:", message?.substring(0, 100) + "...");

  let mems: string[] = [];
try {
  console.log("🔍 Attempting to retrieve memories for user:", userId);
  mems = await getMemories(threadId, userId);
  // console.log(`📚 Retrieved ${mems.length} memories for user ${userId}:`);
  // console.log("Memory content:", mems);
} catch (memoryError) {
  console.error("⚠️ Memory retrieval failed:", memoryError);
  console.error("Error details:", memoryError);
}

const selectedModel = getModel(model || thread.model || "gemini-2.5-flash");

try {
  // ✅ USE PROPER AI SDK MESSAGE TYPE
  const conversationMessages: CoreMessage[] = [];

  // ✅ INJECT MEMORY AS FAKE CONVERSATION HISTORY FIRST
  if (mems.length > 0) {
    conversationMessages.push({
      role: "user",
      content: `Hi! Just so you remember from our previous conversations: ${mems.join(". ")}`,
    });

    conversationMessages.push({
      role: "assistant",
      content: "Thanks for reminding me! I'll keep that information in mind for our conversation.",
    });

    console.log("🧠 Injected memory as conversation history");
  }

  // Add existing conversation history
  msgs.forEach((msg) => {
    const textContent = msg.content
      .filter(
        (c): c is { type: "text"; text: string } =>
          c.type === "text" &&
          Boolean(c.text) &&
          !c.text.startsWith("Google File URI:")
      )
      .map((c) => c.text)
      .join(" ");

    if (textContent.trim().length > 0) {
      conversationMessages.push({
        role: msg.role as "user" | "assistant",
        content: textContent,
      });
    }
  });

  // ✅ Add current message with multimodal content
  if (message || googleFileUri) {
    const currentMessageContent = [];

    // Add text content
    if (message && message.trim()) {
      currentMessageContent.push({
        type: "text",
        text: message.trim(),
      });
    }

    // Enhanced file processing
    if (fileUrl) {
      try {
        console.log(`🔄 Processing ${fileType} file: ${fileName}`);

        if (fileType?.startsWith("image/")) {
          const response = await fetch(fileUrl);
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");

          currentMessageContent.push({
            type: "image",
            image: `data:${fileType};base64,${base64}`,
            // ✅ ADD THESE LINES TO PRESERVE METADATA
            name: fileName,
            mime: fileType,
            url: fileUrl, // Keep original URL as backup
          });

          console.log("✅ Image converted to base64 for Gemini");
        } else if (fileType === "text/plain" || fileName?.endsWith(".txt")) {
          const response = await fetch(fileUrl);
          const textContent = await response.text();

          currentMessageContent.push({
            type: "text",
            text: `Content of uploaded text file "${fileName}":\n\n\`\`\`\n${textContent}\n\`\`\`\n\n${
              message?.trim() || "Please analyze this content."
            }`,
          });

          console.log("✅ Text file content loaded for analysis");
        } else if (fileType === "text/csv" || fileName?.endsWith(".csv")) {
          const response = await fetch(fileUrl);
          const csvContent = await response.text();

          currentMessageContent.push({
            type: "text",
            text: `CSV data from "${fileName}":\n\n\`\`\`csv\n${csvContent}\n\`\`\`\n\n${
              message?.trim() ||
              "Please analyze this data and provide insights."
            }`,
          });

          console.log("✅ CSV file content loaded for analysis");
        } else if (
          fileType === "application/pdf" ||
          fileName?.endsWith(".pdf")
        ) {
          currentMessageContent.push({
            type: "text",
            text: `I see you uploaded a PDF file "${fileName}". Currently, I can't read PDFs from external URLs. Please copy and paste the text from the PDF so I can help analyze it. ${
              message?.trim() || ""
            }`,
          });

          console.log("ℹ️ PDF uploaded — mock reply added for Gemini");
        } else {
          try {
            const response = await fetch(fileUrl);
            const content = await response.text();

            currentMessageContent.push({
              type: "text",
              text: `Content of "${fileName}" (${fileType}):\n\n\`\`\`\n${content}\n\`\`\`\n\n${
                message?.trim() || "Please analyze this content."
              }`,
              name: fileName,
              mime: fileType,
              url: fileUrl,
            });

            console.log(`✅ File content loaded as text for ${fileType}`);
          } catch (readError) {
            currentMessageContent.push({
              type: "text",
              text: `I received your file "${fileName}" but cannot read its content format (${fileType}). Please describe what you'd like me to help you with or share the content in text format. ${
                message?.trim() || ""
              }`,
            });

            console.log(`⚠️ Could not read ${fileType} file as text`);
          }
        }
      } catch (error) {
        console.error(`❌ Failed to process file:`, error);
        currentMessageContent.push({
          type: "text",
          text: `I encountered an error processing your file "${fileName}". Please try uploading again. ${
            message?.trim() || ""
          }`,
        });
      }
    }

    conversationMessages.push({
      role: "user",
      content:
        currentMessageContent.length === 1 && currentMessageContent[0].type === "text"
          ? currentMessageContent[0].text
          : currentMessageContent,
    });
  }

  // Ensure we have at least one message
  if (conversationMessages.length === 0) {
    conversationMessages.push({
      role: "user",
      content: "Hello",
    });
  }

  console.log("📤 Sending to Gemini:", {
    messageCount: conversationMessages.length,
    hasFile: !!googleFileUri || !!fileUrl,
    hasGoogleFileUri: !!googleFileUri,
    fileType,
    fileName,
    hasMemoryInjection: mems.length > 0,
  });

  // ✅ PROPER AI SDK CALL WITH CORRECT MESSAGE TYPE
  const result = await streamText({
    model: selectedModel,
    messages: conversationMessages, // ✅ Now properly typed as CoreMessage[]
  });

  let fullText = "";
  for await (const chunk of result.textStream) {
    fullText += chunk;
  }

  // Save assistant message
  try {
    const savedAssistantMessage = await Message.create({
      userId,
      threadId,
      role: "assistant",
      content: [{ type: "text", text: fullText }],
    });
    console.log("✅ Assistant message saved:", savedAssistantMessage._id);
  } catch (error) {
    console.error("❌ Failed to save assistant message:", error);
  }

  // Enhanced memory storage
  try {
    console.log("💾 Attempting to store memories for user:", userId);

    if (message && message.trim()) {
      console.log("Storing user message:", message.substring(0, 100) + "...");
      await addMemories(threadId, `User: ${message.trim()}`, userId);
      console.log("✅ User message stored successfully");
    }

    console.log("Storing assistant response:", fullText.substring(0, 100) + "...");
    await addMemories(threadId, `Assistant: ${fullText}`, userId);
    console.log("✅ Assistant response stored successfully");

    console.log("✅ All memories stored successfully for user:", userId);
  } catch (memoryError) {
    console.error("⚠️ Memory storage failed for user:", userId);
    console.error("Error details:", memoryError);
  }

  return result.toTextStreamResponse();
} catch (error) {
  console.error("Gemini API Error:", error);
  return NextResponse.json({
    role: "assistant",
    content: "⚠️ There was an issue connecting to Gemini API. Here's a mock reply so you can keep testing.",
  });
}
}