import { Category } from "@/models/Categories";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import { ProductImages } from "@/models/Product_related_images";
import redis from "@/lib/redis";
import { redis_expiry } from "@/helper/api/commonHelper";


export const GET = asyncHandler(async (req) => {
  await dbConnect();

  // const cacheKey = "all_categories";
  // const cached = await redis.get(cacheKey);

  // if (cached) {
  //   return send_response(
  //     true,
  //     JSON.parse(cached),
  //     "Categories from cache",
  //     StatusCodes.OK
  //   );
  // }

  const categories = await Category.find({ show_on_website: true });

  const response = { categories };
  // if (redis_expiry === -1) {
  //   await redis.set(cacheKey, JSON.stringify(response));
  // } else {
  //   await redis.set(cacheKey, JSON.stringify(response), { EX: redis_expiry });
  // }

  return send_response(true, response, "Categories fetched", StatusCodes.OK);
});
