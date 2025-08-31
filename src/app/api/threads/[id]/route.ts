// app/api/chat/threads/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/db";
import { Thread } from "@/models/Thread";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 must be Promise
) {
  const { id } = await params; // 👈 await here
  console.log("Deleting thread with ID:", id);
  console.log("Request URL:", req.url);

  try {
    await dbConnect();
    const deleted = await Thread.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
