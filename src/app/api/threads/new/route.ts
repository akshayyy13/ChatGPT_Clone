import { auth } from "@/app/lib/auth";
import { dbConnect } from "@/app/lib/db";
import { Thread } from "@/models/Thread";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const t = await Thread.create({
    userId: session.user.id,
    // Default to Gemini 2.0 Flash (free/fast tier)
    model: "flash-2.0",
  });

  return Response.json({ id: String(t._id) });
}
