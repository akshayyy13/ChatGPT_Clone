// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("🔍 Middleware - Path:", pathname);

  // ✅ Allow auth routes and static files
  if (
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/" ||
    pathname === "/auth"
  ) {
    return NextResponse.next();
  }

  // 🔧 Get session from cookies (Edge-compatible, no NextAuth imports)
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  const hasSession = !!sessionToken;
  console.log("🔍 Middleware - Session exists:", hasSession);

  // ✅ Protect chat and API routes
  if (
    pathname.startsWith("/chat") ||
    (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/"))
  ) {
    // Session check
    if (!hasSession) {
      console.log("❌ No session - redirecting to auth");
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      } else {
        return NextResponse.redirect(new URL("/auth", request.url));
      }
    }

    // Database user check via API
    try {
      const userCheckResponse = await fetch(
        `${request.nextUrl.origin}/api/user-exists`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-middleware-check": "true",
            Cookie: request.headers.get("cookie") || "",
          },
        }
      );

      if (!userCheckResponse.ok) {
        console.log("❌ User not in database - redirecting");
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        } else {
          return NextResponse.redirect(new URL("/auth", request.url));
        }
      }

      console.log("✅ User verified in database");
    } catch (error) {
      console.error("❌ User check failed:", error);
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Authentication error" },
          { status: 500 }
        );
      } else {
        return NextResponse.redirect(new URL("/auth", request.url));
      }
    }
  }

  console.log("✅ Allowing access to:", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
