// app/api/threads/new/route.ts
import { auth } from "@/lib/auth";
import { dbConnect } from "@/app/lib/db";
import { Thread } from "@/models/Thread";
import { NextResponse } from "next/server";

export const POST = auth(async function POST(req) {
  try {
    console.log("🔍 New thread API - Auth exists:", !!req.auth);
    console.log("🔍 New thread API - User ID:", req.auth?.user?.id);

    if (!req.auth?.user?.id) {
      console.log("❌ No auth or user ID found in new thread API");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const t = await Thread.create({
      userId: req.auth.user.id,
      model: "flash-2.0",
    });

    console.log("✅ Created new thread:", t._id);
    return NextResponse.json({ id: String(t._id) });
  } catch (error) {
    console.error("🚨 Error creating thread:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
