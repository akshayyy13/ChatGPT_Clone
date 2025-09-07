// app/api/threads/[id]/route.ts
//! used esline
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/db";
import { Thread } from "@/models/Thread";

export const DELETE = auth(async function DELETE(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: NextRequest & { auth?: any }, // ✅ Specific type instead of any
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("🔍 Delete thread API - Auth exists:", !!request.auth);
    console.log("🔍 Delete thread API - User ID:", request.auth?.user?.id);

    if (!request.auth?.user?.id) {
      console.log("❌ No auth or user ID found in delete thread API");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    console.log("🗑️ Deleting thread with ID:", id);

    await dbConnect();

    // Only allow users to delete their own threads
    const thread = await Thread.findOne({
      _id: id,
      userId: request.auth.user.id,
    });

    if (!thread) {
      console.log("❌ Thread not found or not owned by user:", id);
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    await Thread.findByIdAndDelete(id);

    console.log("✅ Successfully deleted thread:", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🚨 Error deleting thread:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
