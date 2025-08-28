// src/app/chat/new/page.tsx
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { dbConnect } from "@/app/lib/db";
import { Thread } from "@/models/Thread";

export default async function NewChat() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  await dbConnect();
  const t = await Thread.create({ userId: session.user.id });
  redirect(`/chat/${t._id}`);
}
