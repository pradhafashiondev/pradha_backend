import { send_response } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import { cookies } from "next/headers";

export const POST = asyncHandler(async () => {
  const cookieStore = await cookies();

  // Clear accessToken cookie
  cookieStore.set("accessToken", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    expires: new Date(0) // Expire immediately
  });

  // Clear refreshToken cookie
  cookieStore.set("refreshToken", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    expires: new Date(0) // Expire immediately
  });

  return send_response(true, null, "User logged out successfully", StatusCodes.OK);
});
