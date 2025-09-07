import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/app/lib/db";
import { User } from "@/models/User";
import { OTP } from "@/models/Otp"; // ✅ Capital letters
import { sendOTPEmail } from "@/lib/emailService"; // ✅ Correct path

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    console.log("Signup attempt for email:", email);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 12) {
      return NextResponse.json(
        { error: "Password must be at least 12 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP for", email, ":", otp);

    // Save OTP to database (replace existing if any)
    await OTP.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
        attempts: 0,
      },
      { upsert: true, new: true }
    );
    console.log("OTP saved to database");

    // Hash password and create user (unverified)
    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email,
      passwordHash,
      emailVerified: false,
      provider: "credentials",
    });
    console.log("User created:", newUser._id);

    // Send OTP email
    console.log("Attempting to send OTP email...");
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send verification email: " + emailResult.error },
        { status: 500 }
      );
    }

    console.log("Email sent successfully");
    return NextResponse.json({
      success: true,
      message: "OTP sent to email",
      email: email,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
