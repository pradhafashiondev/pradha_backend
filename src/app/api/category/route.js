import { Category } from "@/models/Categories";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import { ProductImages } from "@/models/Product_related_images";


export const GET = asyncHandler(async (req) => {
  await dbConnect();

  const categories = await Category.find({ show_on_website: true });

  return send_response(
    true,
    { categories },
    "Categories fetched successfully",
    StatusCodes.OK
  );
});