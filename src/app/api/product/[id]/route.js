import { Product } from "@/models/Product";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import mongoose from "mongoose";

export const GET = asyncHandler(async (request,context) => {
  await dbConnect();
  const { id } = await context.params;

  // Validate if ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return send_response(
      false,
      null,
      "Invalid product ID.",
      StatusCodes.BAD_REQUEST
    );
  }

  // Aggregate product with its images
  const productWithImages = await Product.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
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

  // Check if product exists
  if (productWithImages.length === 0) {
    return send_response(
      false,
      null,
      "Product not found.",
      StatusCodes.NOT_FOUND
    );
  }

  // Return the product data
  return send_response(
    true,
    productWithImages[0],
    "Product fetched successfully.",
    StatusCodes.OK
  );
});