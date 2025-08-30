import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import mongoose from "mongoose";
import { dbConnect } from "@/app/lib/db";
import { Message } from "@/models/Message";
import { auth } from "@/app/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const threadId = formData.get("threadId") as string | null;
    // Remove: const userId = formData.get("userId") as string | null;

    if (!file || !threadId) {
      return NextResponse.json(
        { error: "File or threadId missing" },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(threadId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return NextResponse.json(
        { error: "Invalid threadId or userId" },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Max 5MB allowed." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "chatgpt" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as UploadApiResponse);
        }
      );
      uploadStream.end(buffer);
    });

    // Connect to DB
    await dbConnect();

    // Create a new Message document with ObjectId conversion
    const newMessage = await Message.create({
      threadId: new mongoose.Types.ObjectId(threadId),
      userId: new mongoose.Types.ObjectId(userId),
      role: "user", // or get from session/auth
      content: [
        {
          type: "file",
          text: `Uploaded file: ${file.name}`,
          url: result.secure_url,
          publicId: result.public_id,
          mime: file.type,
          name: file.name,
          size: file.size,
        },
      ],
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
