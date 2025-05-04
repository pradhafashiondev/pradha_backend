import { verifyToken } from "@/utils/verifyToken"; // adjust path
import { NextResponse } from "next/server";
import { send_response } from "@/utils/apiResponse";

export function withAuth(handler) {
  return async function (req, ...args) {
    const verification = await verifyToken(req);

    // If verification failed
    if (!verification?.verified) {
      return send_response(false,null,"Unauthorized",401)
    }

    // Attach user to request if you want
    req.user = verification.user;

    // Call original handler
    return handler(req, ...args);
  };
}
