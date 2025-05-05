import { Product } from "@/models/Product";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import { ProductImages } from "@/models/Product_related_images";

export const GET = asyncHandler(async () => {
  await dbConnect();

  const productsWithImages = await Product.find({show_on_website: true});

  return send_response(
    true,
    productsWithImages,
    "All products fetched successfully.",
    StatusCodes.OK
  );
});
