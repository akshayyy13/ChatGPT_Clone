// src/app/api/user-exists/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/app/lib/db";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  // Only allow middleware calls
  if (request.headers.get("x-middleware-check") !== "true") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Get session using NextAuth (this runs in API route, not middleware)
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });

    if (user) {
      return NextResponse.json({
        exists: true,
        user: { id: user._id, email: user.email },
      });
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("User check error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
