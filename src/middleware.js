// middleware.js
import { NextResponse } from "next/server";
import { verifyToken } from "./utils/verifyToken";
import { send_response } from "./utils/apiResponse";

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.DASHBOARD_FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3002",
].filter(Boolean);

// Unified CORS handling function
function applyCorsHeaders(request, response) {
  const origin = request.headers.get("origin");

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Vary", "Origin");

  return response;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Handle preflight requests for ALL API routes
  if (request.method === "OPTIONS") {
    const response = new Response(null);
    return applyCorsHeaders(request, response);
  }

  // Handle CORS for all API routes
  if (pathname.startsWith("/api")) {
    const response = NextResponse.next();
    return applyCorsHeaders(request, response);
  }

  // Token verification for protected dashboard routes
  if (pathname.startsWith("/api/dashboard")) {
    if (
      ["/api/dashboard/user/login", "/api/dashboard/user/save"].includes(
        pathname
      )
    ) {
      return NextResponse.next();
    }

    const verification = await verifyToken(request);
    if (!verification?.verified) {
      const errorResponse = send_response(
        false,
        null,
        verification?.message,
        401
      );
      return applyCorsHeaders(request, errorResponse);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/main/:path*", "/api/dashboard/:path*"],
};
