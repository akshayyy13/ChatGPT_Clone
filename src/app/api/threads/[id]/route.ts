// app/api/chat/threads/[id]/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/db";
import { Thread } from "@/models/Thread";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("Deleting thread with ID:", params.id); // <-- should print
  try {
    await dbConnect();
    const deleted = await Thread.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
