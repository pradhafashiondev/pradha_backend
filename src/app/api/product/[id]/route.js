import { Product } from "@/models/Product";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import mongoose from "mongoose";
import redis from "@/lib/redis";
import { redis_expiry } from "@/helper/api/commonHelper";

export const GET = asyncHandler(async (request, context) => {
  await dbConnect();
  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return send_response(
      false,
      null,
      "Invalid product ID.",
      StatusCodes.BAD_REQUEST
    );
  }

  // const cacheKey = `product_with_images_${id}`;
  // const cached = await redis.get(cacheKey);

  // if (cached) {
  //   return send_response(
  //     true,
  //     JSON.parse(cached),
  //     "Product fetched from cache.",
  //     StatusCodes.OK
  //   );
  // }

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

  if (productWithImages.length === 0) {
    return send_response(
      false,
      null,
      "Product not found.",
      StatusCodes.NOT_FOUND
    );
  }

  // if (redis_expiry === -1) {
  //   await redis.set(cacheKey, JSON.stringify(productWithImages[0]));
  // } else {
  //   await redis.set(cacheKey, JSON.stringify(productWithImages[0]), {
  //     EX: redis_expiry,
  //   });
  // }

  return send_response(
    true,
    productWithImages[0],
    "Product fetched successfully.",
    StatusCodes.OK
  );
});
