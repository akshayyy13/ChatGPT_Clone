import { auth } from "@/app/lib/auth";
import { dbConnect } from "@/app/lib/db";
import { Thread } from "@/models/Thread";
import { Message } from "@/models/Message";

// GET /api/messages/[threadId]
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ threadId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { threadId } = await ctx.params;

  await dbConnect();

  // Verify ownership
  const thread = await Thread.findOne({
    _id: threadId,
    userId: session.user.id,
  })
    .select({ _id: 1 })
    .lean();
  if (!thread) return new Response("Not Found", { status: 404 });

  // Oldest → newest
  const docs = await Message.find({ threadId })
    .sort({ createdAt: 1 })
    .select({ _id: 1, role: 1, content: 1 })
    .lean();

  const messages = docs.map((d) => ({
    _id: String(d._id),
    role: d.role as "user" | "assistant",
    content: d.content as Array<{
      type: "text" | "image" | "file";
      text?: string;
      url?: string;
      mime?: string;
      name?: string;
      publicId?: string;
    }>,
  }));

  return Response.json({ messages });
}
