// src/app/chat/[threadId]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { dbConnect } from "@/app/lib/db";
import { Thread } from "@/models/Thread";
import ChatView from "./ui/ChatView";

type PageProps = { params: Promise<{ threadId: string }> };

export default async function ThreadPage({ params }: PageProps) {
  const { threadId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  await dbConnect();
  const thread = await Thread.findOne({
    _id: threadId,
    userId: session.user.id,
  })
    .lean()
    .exec() as { model: string } | null;
  if (!thread) notFound();

  return <ChatView threadId={threadId} model={String(thread.model)} />;
}
