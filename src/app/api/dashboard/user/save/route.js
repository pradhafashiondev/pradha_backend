import { send_response } from "@/utils/apiResponse";
import { User } from "@/models/User";
import { uploadFileToCloudinary } from "@/helper/api/uploadFileToCloudinary";
import { generateAccessAndRefreshTokens } from "@/lib/generateAccessAndRefreshToken";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import dbConnect from "@/lib/db";

export const POST = asyncHandler(async (req) => {
  await dbConnect();
  const formData = await req.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const file = formData.get("avatar");

  if (!email || !password || !file) {
    return send_response(false, null,"All Fields are required!",StatusCodes.BAD_REQUEST)
  }
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    return send_response(
      false,
      null,
      "User with email already exists",
      StatusCodes.CONFLICT
    );
  }

  const cloudinaryUrl = await uploadFileToCloudinary(file);

  const user = await User.create({ email, password, avatar: cloudinaryUrl });


  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  //  const data = { user: createdUser, accessToken, refreshToken };
   const data = { user: createdUser, accessToken,refreshToken };
  return send_response(true, data, "User registered Successfully", StatusCodes.CREATED);
});
