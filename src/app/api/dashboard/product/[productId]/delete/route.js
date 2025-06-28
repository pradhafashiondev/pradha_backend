// app/api/products/[productId]/route.js
import { Product } from "@/models/Product";
import { ProductImages } from "@/models/Product_related_images";
import { send_response } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import dbConnect from "@/lib/db";
import { deleteOnCloudinary } from "@/utils/cloudinary";
import { StatusCodes } from "@/helper/api/statusCode";

export const DELETE = asyncHandler(async (req, context ) => {
  await dbConnect();
  const { productId } = await context.params;

  const product = await Product.findById(productId);
  if (!product) {
    return send_response(false, null, "Product not found", StatusCodes.NOT_FOUND);
  }

  // Delete main image
  if (product.product_main_image) {
    await deleteOnCloudinary(product.product_main_image);
  }

  // Delete related images
  const relatedImages = await ProductImages.find({ product_id: productId });
  for (const image of relatedImages) {
    await deleteOnCloudinary(image.image_url);
  }
  await ProductImages.deleteMany({ product_id: productId });

  await Product.findByIdAndDelete(productId);

  return send_response(true, null, "Product deleted successfully", StatusCodes.OK);
});
