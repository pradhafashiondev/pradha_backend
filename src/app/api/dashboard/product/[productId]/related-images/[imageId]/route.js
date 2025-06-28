// app/api/products/[productId]/related-images/[imageId]/route.js
import { ProductImages } from "@/models/Product_related_images";
import { send_response } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import dbConnect from "@/lib/db";
import { deleteOnCloudinary } from "@/utils/cloudinary";
import { StatusCodes } from "@/helper/api/statusCode";

export const DELETE = asyncHandler(async (req, context) => {
  console.log(StatusCodes)
  await dbConnect();
  const { productId, imageId } = await context.params;

  const imageDoc = await ProductImages.findOne({
    _id: imageId,
    // product_id: productId
  });

  if (!imageDoc) {
    return send_response(false, null, "Image not found", StatusCodes.NOT_FOUND);
  }

  await deleteOnCloudinary(imageDoc.image_url);
  await ProductImages.findByIdAndDelete(imageId);

  return send_response(true, null, "Related image deleted successfully", StatusCodes.OK);
});
