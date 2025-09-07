import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/db";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { email, name, birthday } = await request.json();

    console.log("Profile update request for:", email, { name, birthday });

    if (!email || !name || !birthday) {
      return NextResponse.json(
        { error: "Email, name, and birthday are required" },
        { status: 400 }
      );
    }

    // Validate birthday format (MM/DD/YYYY)
    const birthdayRegex =
      /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;
    if (!birthdayRegex.test(birthday)) {
      return NextResponse.json(
        { error: "Invalid birthday format. Use MM/DD/YYYY" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Update user profile
    const user = await User.findOneAndUpdate(
      { email },
      {
        name: name.trim(),
        birthday,
        profileCompleted: true,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("✅ Profile updated successfully for:", email);
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
