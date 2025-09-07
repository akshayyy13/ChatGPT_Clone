// src/app/api/profile/avatar/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/app/lib/db";
import { User } from "@/models/User";

type AvatarBody = { url: string; publicId: string };

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { url, publicId } = (await req.json()) as AvatarBody;
  if (!url || !publicId) return new Response("Invalid body", { status: 400 });

  await dbConnect();
  await User.updateOne(
    { _id: session.user.id },
    { $set: { image: url, imagePublicId: publicId } }
  );

  return new Response("OK");
}
