// middleware.js
import { NextResponse } from "next/server";
import { verifyToken } from "./utils/verifyToken";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/user")) {
    return NextResponse.next();
  }

  const verification = await verifyToken(request); // 👉 wait for token verification

  if (!verification?.verified) {
    return NextResponse.json(
      { success: false, message: verification?.message || "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
