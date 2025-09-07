import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/db";
import { User } from "@/models/User";
import { OTP } from "@/models/Otp";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find OTP record
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return NextResponse.json(
        { error: "OTP expired or not found" },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ email });
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ email });
      return NextResponse.json(
        { error: "Too many failed attempts" },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      await OTP.updateOne({ email }, { $inc: { attempts: 1 } });
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // OTP is valid - verify user and cleanup
    await User.updateOne({ email }, { emailVerified: true });
    await OTP.deleteOne({ email });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
