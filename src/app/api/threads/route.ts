import { auth } from "@/app/lib/auth";
import { dbConnect } from "@/app/lib/db";
import { Thread } from "@/models/Thread";
import { Message } from "@/models/Message";

type ThreadListItem = { _id: string; preview: string };

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const userId = session.user.id;
  const threads = await Thread.find({ userId })
    .sort({ updatedAt: -1 })
    .select({ _id: 1 })
    .lean();

  if (threads.length === 0) {
    return Response.json({ threads: [] as ThreadListItem[] });
  }

  const threadIds = threads.map((t) => t._id);

  // Find the first message per thread (user or assistant)
  const firstMessages = await Message.aggregate([
    {
      $match: {
        threadId: { $in: threadIds },
        role: { $in: ["user", "assistant"] },
      },
    },
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: "$threadId",
        first: { $first: "$content" }, // content: array of { type, text, ... }
      },
    },
  ]);

  const previewByThread: Record<string, string> = {};
  for (const f of firstMessages as Array<{
    _id: any;
    first: Array<{ type: string; text?: string }>;
  }>) {
    const text =
      (f.first || []).find((c) => c.type === "text")?.text?.trim() ?? "";
    const words = text.split(/\s+/).filter(Boolean);
    const preview = words.slice(0, 5).join(" ");
    previewByThread[String(f._id)] = preview || "New chat";
  }

  // Only threads with a preview are returned
  const list: ThreadListItem[] = threads
    .map((t) => {
      const p = previewByThread[String(t._id)];
      if (!p) return null;
      return { _id: String(t._id), preview: p };
    })
    .filter(Boolean) as ThreadListItem[];

  return Response.json({ threads: list });
}
