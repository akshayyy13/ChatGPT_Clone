import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/app/lib/db";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { name, email, password } = await req.json();
  if (!email || !password)
    return new Response("Email and password required", { status: 400 });
  const exists = await User.findOne({ email });
  if (exists) return new Response("Email already in use", { status: 409 });
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ name: name || "", email, passwordHash });
  return new Response("OK", { status: 201 });
}
