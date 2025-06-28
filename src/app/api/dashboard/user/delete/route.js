import dbConnect from "@/lib/db";
import { User } from "lucide-react";
import { asyncHandler } from "@/utils/asyncHandler";
import { send_response } from "@/utils/apiResponse";
import { StatusCodes } from "@/helper/api/statusCode";

export const DELETE = asyncHandler(async (req) => {
  await dbConnect();

  const body = await req.json();
  const { userId } = body;

  if (!userId) {
    return send_response(false, null, "User ID is required", StatusCodes.BAD_REQUEST);
  }

  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    return send_response(false, null, "User not found", StatusCodes.NOT_FOUND);
  }

  return send_response(true, { deletedUser }, "User deleted successfully", StatusCodes.OK);
});
