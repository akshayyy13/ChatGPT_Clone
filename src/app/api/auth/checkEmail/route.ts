// app/api/auth/checkEmail/route.ts

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/db";
import { User } from "@/models/User";

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    await dbConnect();
    const user = await User.findOne({ email });

    return NextResponse.json(
      {
        exists: !!user,
        hasPassword: user ? !!user.passwordHash : false,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Check email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
