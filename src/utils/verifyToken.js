// utils/verifyToken.js
import { jwtVerify } from "jose";

export async function verifyToken(request) {
  try {
    const token = request.cookies.get("accessToken")?.value;
    console.log("Token from cookies:", token);
    if (!token) {
      return {
        success: false,
        status: 401,
        verified: false,
        message: "Authentication token is missing",
      };
    }

    const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

    const { payload } = await jwtVerify(token, secret);
    request.user = payload; // optional
    return { success: true, verified: true, user: payload };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return {
      success: false,
      status: 401,
      verified: false,
      message: "Invalid or expired token",
    };
  }
}
