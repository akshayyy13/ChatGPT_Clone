import { Message } from "@/models/Message";
import { Thread } from "@/models/Thread";

export async function revalidateThreadIndex(threadId: string) {
  // Fetch remaining messages
  const docs = await Message.find({ threadId })
    .sort({ createdAt: 1 })
    .select({ _id: 1, role: 1, content: 1 })
    .lean();

  const messages = docs.map((d) => ({
    _id: String(d._id),
    role: d.role as "user" | "assistant",
    content: d.content as any,
  }));

  // Update thread index if you keep summary / metadata
  await Thread.updateOne(
    { _id: threadId },
    { $set: { lastUpdatedAt: new Date(), messageCount: messages.length } }
  );

  return messages;
}
