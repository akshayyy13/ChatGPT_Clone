import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/db";
import { OTP } from "@/models/Otp"; // ✅ Fixed import - capital letters
import { sendOTPEmail } from "@/lib/emailService";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    console.log("🔄 Resend OTP request for:", email); // ✅ Added logging

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();

    // ✅ FIRST: Delete/expire any existing OTP for this email
    await OTP.deleteOne({ email });
    console.log("🗑️ Previous OTP expired for:", email);

    // ✅ Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("🆕 New OTP generated for", email, ":", otp);

    // ✅ Create new OTP with fresh 2-minute expiry (not update)
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000), // Fresh 2-minute expiry
      attempts: 0,
    });
    console.log("💾 New OTP saved to database");

    // Send OTP email
    console.log("📧 Attempting to send resend OTP email..."); // ✅ Added logging
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      console.error("❌ Resend email failed:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    console.log("✅ OTP resent successfully to:", email);
    return NextResponse.json({
      success: true,
      message: "New verification code sent to email", // ✅ Updated message
    });
  } catch (error) {
    console.error("❌ Resend OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
