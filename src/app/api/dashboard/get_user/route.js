import { send_response } from "@/utils/apiResponse";
import { User } from "@/models/User";
import { generateAccessAndRefreshTokens } from "@/lib/generateAccessAndRefreshToken";
import { cookies } from "next/headers";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import dbConnect from "@/lib/db";

export const POST = asyncHandler(async (req) => {
  await dbConnect();
  const body = await req.json();
  const { email } = body;
  console.log(body);
  if (!email) {
    return send_response(false, null, "Email is Missing!", StatusCodes.BAD_REQUEST);
  }

  const user = await User.findOne({ email });
  if (!user) {
    return send_response(false, null, "User not found", StatusCodes.NOT_FOUND);
  }

  return send_response(
    true,
    {
      user: user
    },
    "User Details fetched Successfully",
    StatusCodes.OK
  );
});
