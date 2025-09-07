import nodemailer from "nodemailer";

export async function sendOTPEmail(email: string, otp: string) {
  // Debug environment variables
  console.log("=== EMAIL SERVICE DEBUG ===");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_USER:", process.env.SMTP_USER ? "✓ Set" : "✗ Missing");
  console.log(
    "SMTP_PASSWORD:",
    process.env.SMTP_PASSWORD
      ? "✓ Set (length: " + process.env.SMTP_PASSWORD.length + ")"
      : "✗ Missing"
  );
  console.log("FROM_EMAIL:", process.env.FROM_EMAIL);
  console.log("========================");

  // Check if all required env vars exist
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error("Missing SMTP credentials in environment variables");
    return { success: false, error: "SMTP credentials not configured" };
  }

  // Create transporter with explicit configuration
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `"ChatGPT Clone" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: "Your ChatGPT Clone Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Verify your email address</h2>
          
          <p style="color: #666; text-align: center; font-size: 16px; margin-bottom: 30px;">
            Enter the verification code we just sent to <strong>${email}</strong>
          </p>
          
          <div style="background-color: #f8f9fa; border: 2px dashed #28a745; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
            <h1 style="font-size: 36px; letter-spacing: 8px; margin: 0; color: #28a745; font-family: 'Courier New', monospace;">${otp}</h1>
          </div>
          
          <p style="color: #666; text-align: center; font-size: 14px; margin-bottom: 10px;">
            This code expires in <strong>2 minutes</strong>.
          </p>
          
          <p style="color: #999; text-align: center; font-size: 12px;">
            If you didn't request this code, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; text-align: center; font-size: 12px;">
            ChatGPT Clone - Email Verification System
          </p>
        </div>
      </div>
    `,
  };

  try {
    // Test connection first
    console.log("Testing SMTP connection...");
    await transporter.verify();
    console.log("✓ SMTP connection verified successfully");

    // Send email
    console.log("Sending email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✓ Email sent successfully. Message ID:", info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("✗ Email sending failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}
