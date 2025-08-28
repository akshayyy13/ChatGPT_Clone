import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/db";
import { Message } from "@/models/Message";
import pdfParse from "pdf-parse";

export async function POST(req: NextRequest) {
  await dbConnect();
  const formData = await req.formData();
  const threadId = formData.get("threadId") as string;
  const file = formData.get("file") as File;

  if (!file || !threadId) return new NextResponse("Invalid", { status: 400 });

  let text = "";

  // PDF parsing
  if (file.type === "application/pdf") {
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer);
    text = data.text;
  } else {
    // TXT or simple DOCX (can add more libraries for .docx)
    text = await file.text();
  }

  // Optional summarization for long documents
  const summary = text.length > 2000 ? text.slice(0, 2000) + "..." : text;

  // Store as system message
  await Message.create({
    threadId,
    role: "system",
    content: [{ type: "text", text: summary }],
  });

  return NextResponse.json({ ok: true, text: summary });
}
