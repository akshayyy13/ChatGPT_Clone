// middleware.ts
import { auth } from "./src/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // console.log("🔍 Middleware - Path:", pathname);
  // console.log("🔍 Middleware - Auth exists:", isLoggedIn);

  // ✅ CRITICAL FIX: Allow ALL /api/auth/* routes (including checkEmail)
  if (pathname.startsWith("/api/auth/")) {
    console.log("✅ Allowing auth API route:", pathname);
    return NextResponse.next();
  }

  // ✅ Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/" ||
    pathname === "/auth"
  ) {
    return NextResponse.next();
  }

  // ✅ Protect /chat routes
  if (pathname.startsWith("/chat")) {
    if (!isLoggedIn) {
      console.log("❌ Redirecting to auth - no session for chat");
      return NextResponse.redirect(new URL("/auth", req.url));
    }
    console.log("✅ Allowing authenticated chat access");
    return NextResponse.next();
  }

  // ✅ Protect API routes (except /api/auth/*)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    if (!isLoggedIn) {
      console.log("❌ Blocking API access - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("✅ Allowing authenticated API access");
    return NextResponse.next();
  }

  // ✅ Allow all other routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    // More precise matching to avoid conflicts
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
