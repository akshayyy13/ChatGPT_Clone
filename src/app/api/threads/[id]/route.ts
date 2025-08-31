// app/api/threads/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/db";
import { Thread } from "@/models/Thread";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  console.log("Deleting thread with ID:", id);
  console.log("Request URL:", request.url);

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
