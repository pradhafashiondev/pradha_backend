import { Product } from "@/models/Product";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import { ProductImages } from "@/models/Product_related_images";

export const GET = asyncHandler(async () => {
  await dbConnect();

  const productsWithImages = await Product.aggregate([
    {
      $match: {
        show_on_website: true,
      },
    },
    {
      $lookup: {
        from: "productimages",
        localField: "_id",
        foreignField: "product_id",
        as: "product_images",
      },
    },
  ]);

  return send_response(
    true,
    productsWithImages,
    "All products fetched successfully.",
    StatusCodes.OK
  );
});
