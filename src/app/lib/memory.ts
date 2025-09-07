// app/lib/memory.ts
import Mem0AI from "mem0ai";

const client = new Mem0AI({
  apiKey: process.env.MEM0_API_KEY!,
});

// ✅ COMPLETELY FIXED: Use unknown type for mem0ai responses and handle them properly
interface MemoryResponse {
  [key: string]: unknown; // Allow any property
}

interface MemorySearchResponse {
  results?: MemoryResponse[];
  [key: string]: unknown;
}

interface MemoryGetAllResponse {
  results?: MemoryResponse[];
  memories?: MemoryResponse[];
  [key: string]: unknown;
}

export async function addMemories(
  threadId: string,
  text: string,
  userId?: string
) {
  console.log("🔄 addMemories called:", {
    threadId,
    userId,
    textLength: text.length,
  });

  let plainText = text;

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "string") {
      plainText = parsed;
    } else if (typeof parsed === "object" && parsed.content) {
      plainText =
        typeof parsed.content === "string"
          ? parsed.content
          : JSON.stringify(parsed.content);
    } else {
      plainText = JSON.stringify(parsed);
    }
  } catch {
    // Not JSON, assume plain string
  }

  try {
    const result = await client.add(
      [
        {
          role: "user",
          content: plainText,
        },
      ],
      {
        user_id: userId || threadId,
        metadata: {
          thread_id: threadId,
          source: "chatgpt_clone",
        },
      }
    );

    console.log("✅ Memory added successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to add memory:", error);
    throw error;
  }
}

export async function getMemories(
  threadId: string,
  userId?: string
): Promise<string[]> {
  // console.log("🔍 getMemories called:", { threadId, userId });

  try {
    // ✅ FIXED: Use unknown type and handle response safely
    const memoriesResponse: unknown = await client.getAll({
      user_id: userId || threadId,
    });

    // console.log("Raw memories response:", memoriesResponse);

    // ✅ Safe type handling with proper checks
    let memoryList: MemoryResponse[] = [];

    if (Array.isArray(memoriesResponse)) {
      memoryList = memoriesResponse as MemoryResponse[];
    } else if (memoriesResponse && typeof memoriesResponse === "object") {
      const response = memoriesResponse as MemoryGetAllResponse;
      memoryList = (response.results ||
        response.memories ||
        []) as MemoryResponse[];
    }

    // ✅ Extract memory content safely from any possible field
    const result = memoryList
      .map((mem: MemoryResponse) => {
        // Try multiple possible field names for memory content
        const content =
          (mem.memory as string) ||
          (mem.content as string) ||
          (mem.text as string) ||
          (mem.message as string) ||
          String(mem.data || "");
        return content;
      })
      .filter((text: string) => Boolean(text && text.trim().length > 0))
      .slice(0, 10);

    console.log("✅ Processed memories:", result);
    return result;
  } catch (error) {
    console.error("❌ Memory retrieval error:", error);

    // ✅ Fallback: Try search method
    try {
      console.log("🔄 Trying search method as fallback...");
      const searchResponse: unknown = await client.search("conversation", {
        user_id: userId || threadId,
        limit: 10,
      });

      // console.log("Search response:", searchResponse);

      // ✅ Handle search response safely
      let searchMemories: MemoryResponse[] = [];

      if (Array.isArray(searchResponse)) {
        searchMemories = searchResponse as MemoryResponse[];
      } else if (searchResponse && typeof searchResponse === "object") {
        const response = searchResponse as MemorySearchResponse;
        searchMemories = (response.results || []) as MemoryResponse[];
      }

      const fallbackResult = searchMemories
        .map((mem: MemoryResponse) => {
          const content =
            (mem.memory as string) ||
            (mem.content as string) ||
            (mem.text as string) ||
            (mem.message as string) ||
            String(mem.data || "");
          return content;
        })
        .filter((text: string) => Boolean(text && text.trim().length > 0));

      console.log("✅ Fallback search results:", fallbackResult);
      return fallbackResult;
    } catch (fallbackError) {
      console.error("❌ Both getAll and search failed:", fallbackError);
      return [];
    }
  }
}
