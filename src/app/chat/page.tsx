// src/app/chat/page.tsx
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { dbConnect } from "@/app/lib/db";
import { Thread } from "@/models/Thread";

export default async function ChatIndex() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  await dbConnect();

  // Route to most recent thread if any
  const existing = await Thread.findOne({ userId: session.user.id })
    .sort({ updatedAt: -1 })
    .select({ _id: 1 })
    .lean();

  if (existing?._id) {
    redirect(`/chat/${existing._id}`);
  }

  // Otherwise create a new thread and go there
  const created = await Thread.create({ userId: session.user.id });
  redirect(`/chat/${created._id}`);
}
