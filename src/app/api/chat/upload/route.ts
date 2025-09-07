import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import mongoose from "mongoose";
import { dbConnect } from "@/app/lib/db";
import { Message } from "@/models/Message";
import { auth } from "@/lib/auth";

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

    const createMessage = formData.get("createMessage") !== "false";

    if (!file) {
      return NextResponse.json({ error: "File missing" }, { status: 400 });
    }

    if (createMessage && !threadId) {
      return NextResponse.json({ error: "threadId missing" }, { status: 400 });
    }

    if (
      createMessage &&
      (!mongoose.Types.ObjectId.isValid(threadId!) ||
        !mongoose.Types.ObjectId.isValid(userId))
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

    // ✅ MANUAL FILENAME CONTROL
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, ""); // Remove extension

    // Upload to Cloudinary with filename preservation
    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "chatgpt",
          public_id: `${Date.now()}-${fileNameWithoutExt}`, // ✅ Unique + original name
          use_filename: true, // ✅ Use original filename
          unique_filename: false, // ✅ Don't add random chars
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as UploadApiResponse);
        }
      );
      uploadStream.end(buffer);
    });

    // ✅ Conditionally create DB message
    if (createMessage) {
      await dbConnect();

      const newMessage = await Message.create({
        threadId: new mongoose.Types.ObjectId(threadId!),
        userId: new mongoose.Types.ObjectId(userId),
        role: "user",
        content: [
          {
            type: "file",
            text: `Uploaded file: ${file.name}`,
            url: result.secure_url,
            publicId: result.public_id,
            mime: file.type,
            name: file.name, // ✅ Original filename
            size: file.size,
          },
        ],
      });

      return NextResponse.json({ success: true, message: newMessage });
    } else {
      // ✅ Return file info with original filename
      return NextResponse.json({
        success: true,
        file: {
          url: result.secure_url,
          publicId: result.public_id,
          fileName: file.name, // ✅ Original filename
          fileType: file.type, // ✅ Original mime type
          name: file.name, // ✅ Backup field
          mime: file.type, // ✅ Backup field
          size: file.size,
        },
      });
    }
  } catch (err: unknown) {
    console.error("Upload error:", err);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
