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
    from: `"ChatGPT " <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: `Your ChatGPT Code is ${otp}`,
    html: `
      <div style=" padding: 2rem">Your ChatGPT Code is ${otp}</div>
<div style="font-family: Arial, sans-serif;  margin: 0 auto; padding:0rem 6rem; text-align:left;">
  <h1 style="color: #333; font-size:2.5rem; font-weight:600">OpenAI</h1>

  <p style="color: #666; text-align: left; font-size: 16px; margin-top: 30px;">
Enter this temporary verification code to continue:</p>

  <div style="background-color: #e8e8e8; border-radius: 8px; padding: 20px; text-align: left; margin: 30px 0;">
    <h1 style="font-size: 36px; letter-spacing: 4px; margin: 0;  font-family: 'Courier New', monospace;">${otp}</h1>
  </div>

  <p style="color: #666; text-align: left; font-size: 18px; margin-bottom: 10px;">Please ignore this email if this wasn’t you trying to create a ChatGPT account.</p>

  <p style="color: #999; margin-top:2rem; text-align: left; font-size: 14px;">
    Best,
    <br>
    The ChatGPT team
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
    <h2 class=" font-bold">
      OpenAI
    </h2>
    <br>
  <p style="color: #999; text-align: left; font-size: 12px;">ChatGPT <br>
  Help center</p>
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
