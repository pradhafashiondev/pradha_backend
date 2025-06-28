import { Banner } from "@/models/Banner";
import { send_response } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import dbConnect from "@/lib/db";
import { deleteOnCloudinary } from "@/utils/cloudinary";
import { StatusCodes } from "@/helper/api/statusCode";

export const DELETE = asyncHandler(async (req, context) => {
  await dbConnect();
  const { bannerId } = await context.params;

  const banner = await Banner.findById(bannerId);
  if (!banner) {
    return send_response(false, null, "Banner not found", StatusCodes.NOT_FOUND);
  }

  if (banner.image_url) {
    await deleteOnCloudinary(banner.image_url);
  }

  await Banner.findByIdAndDelete(bannerId);
  return send_response(true, null, "Banner deleted successfully", StatusCodes.OK);
});
