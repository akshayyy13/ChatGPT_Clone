import { auth } from "@/app/lib/auth";
import { dbConnect } from "@/app/lib/db";
import { User } from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email)
    return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const user = await User.findOne<{ name?: string; image?: string }>({ email: session.user.email })
    .select({ name: 1, image: 1, _id: 0 })
    .lean();

  if (!user) return new Response("Not found", { status: 404 });
  return Response.json({ name: user.name || "", image: user.image || "" });
}
