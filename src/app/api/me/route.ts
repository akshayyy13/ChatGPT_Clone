// app/api/me/route.ts
import { auth } from "@/lib/auth";
import { dbConnect } from "@/app/lib/db";
import { User, IUser } from "@/models/User";
import { NextResponse } from "next/server";

export const GET = auth(async function GET(req) {
  try {
    console.log("🔍 API /me - Auth exists:", !!req.auth);
    console.log("🔍 API /me - User email:", req.auth?.user?.email);

    if (!req.auth?.user?.email) {
      console.log("❌ No auth or email found in /api/me");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = (await User.findOne({ email: req.auth.user.email })
      .select({ name: 1, image: 1, _id: 0 })
      .lean()) as Pick<IUser, "name" | "image"> | null;

    if (!user) {
      console.log("❌ User not found in database:", req.auth.user.email);
      // Instead of 404, return a special status that client can handle
      return NextResponse.json(
        { error: "User not found", redirect: "/auth" },
        { status: 404 }
      );
    }

    console.log("✅ /api/me success for:", req.auth.user.email);
    return NextResponse.json({
      name: user.name || "",
      image: user.image || "",
    });
  } catch (error) {
    console.error("🚨 API /me error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
