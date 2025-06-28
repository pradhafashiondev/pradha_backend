// app/api/products/[productId]/main-image/route.js
import { Product } from "@/models/Product";
import { send_response } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import dbConnect from "@/lib/db";
import { deleteOnCloudinary } from "@/utils/cloudinary";
import { StatusCodes } from "@/helper/api/statusCode";

export const DELETE = asyncHandler(async (req, context) => {
  await dbConnect();
  const { productId } = await context.params;

  const product = await Product.findById(productId);
  if (!product) {
    return send_response(false, null, "Product not found", StatusCodes.NOT_FOUND);
  }

  if (!product.product_main_image) {
    return send_response(false, null, "No main image to delete", StatusCodes.BAD_REQUEST);
  }
  console.log(product.product_main_image);
  await deleteOnCloudinary(product.product_main_image);
  product.product_main_image = null;
  // console.log(product)
  await product.save();

  return send_response(true, null, "Main image deleted successfully", StatusCodes.OK);
});
