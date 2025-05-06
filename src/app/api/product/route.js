import { Product } from "@/models/Product";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import { ProductImages } from "@/models/Product_related_images";

export const GET = asyncHandler(async (req) => {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  // console.log(searchParams)
  // console.log(id);
  const matchStage = {
    show_on_website: true,
    ...(id && { category_id: id }), // only include category_id match if id is present
  };
  // console.log("fweofhoweifh", matchStage.category_id);
  const productsWithImages = await Product.find(matchStage);

  return send_response(
    true,
    productsWithImages,
    "Products fetched successfully.",
    StatusCodes.OK
  );
});
