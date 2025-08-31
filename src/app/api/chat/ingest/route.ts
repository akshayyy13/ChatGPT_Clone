import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/db";
import { Message } from "@/models/Message";

export async function POST(req: NextRequest) {
  await dbConnect();
  const formData = await req.formData();
  const threadId = formData.get("threadId") as string;
  const file = formData.get("file") as File;

  if (!file || !threadId) return new NextResponse("Invalid", { status: 400 });

  let text = "";

  // PDF parsing with dynamic import
  if (file.type === "application/pdf") {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Dynamically import pdf-parse to avoid build-time issues
    const { default: pdfParse } = await import("pdf-parse");
    const data = await pdfParse(buffer);
    text = data.text;
  } else {
    // TXT or simple text files
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
