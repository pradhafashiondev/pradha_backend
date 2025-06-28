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
  const { email, password } = body;
  console.log(body)
  if (!email || !password) {
    return send_response(false, null, "Email or Password is Missing!", StatusCodes.BAD_REQUEST);
  }

  const user = await User.findOne({ email });
  if (!user) {
    return send_response(false, null, "User not found", StatusCodes.NOT_FOUND);
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    return send_response(false, null, "Invalid user credentials", StatusCodes.UNAUTHORIZED);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookieStore = await cookies();
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  return send_response(
    true,
    {
      user: loggedInUser,
      accessToken,
      refreshToken,
    },
    "User logged In Successfully",
    StatusCodes.OK
  );
});
