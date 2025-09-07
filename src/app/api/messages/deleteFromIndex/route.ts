// app/api/messages/deleteFromIndex/route.ts
import { auth } from "@/lib/auth";
import { dbConnect } from "@/app/lib/db";
import { Thread } from "@/models/Thread";
import { Message } from "@/models/Message";
import { revalidateThreadIndex } from "@/app/lib/revalidate";

type Anchor = { _id: string; createdAt: Date };

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { threadId, fromMessageId, inclusive } = await req.json();
  if (!threadId || !fromMessageId)
    return new Response("threadId and fromMessageId required", { status: 400 });

  await dbConnect();

  // Verify ownership of thread
  const thread = await Thread.findOne({
    _id: threadId,
    userId: session.user.id,
  })
    .select({ _id: 1 })
    .lean();
  if (!thread) return new Response("Not Found", { status: 404 });

  // Single-document query + typed lean result
  const anchor = await Message.findOne({ _id: fromMessageId, threadId })
    .select({ _id: 1, createdAt: 1 })
    .lean<Anchor>();
  if (!anchor) return new Response("Anchor message not found", { status: 404 });

  // Build a typed date range for createdAt
  const range: { $gte?: Date; $gt?: Date } = inclusive
    ? { $gte: anchor.createdAt }
    : { $gt: anchor.createdAt };

  // Bulk delete from the anchor onward
  const op = await Message.deleteMany({ threadId, createdAt: range });

  await revalidateThreadIndex(threadId);

  return Response.json({ success: true, deletedCount: op?.deletedCount ?? 0 });
}
