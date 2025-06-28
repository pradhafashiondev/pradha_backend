import { Banner } from "@/models/Banner";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import { ProductImages } from "@/models/Product_related_images";
import redis from "@/lib/redis";
import { redis_expiry } from "@/helper/api/commonHelper";

export const GET = asyncHandler(async (req) => {
  await dbConnect();
  // console.log("redis_expiry", redis_expiry);
  // const CACHE_KEY = "website_banners";

  // const cachedData = await redis.get(CACHE_KEY);

  // if (cachedData) {
  //   const banners = JSON.parse(cachedData);
  //   return send_response(
  //     true,
  //     banners,
  //     "Banners retrieved from cache",
  //     StatusCodes.OK
  //   );
  // }

  const banners = await Banner.find({ show_on_website: true });

  // if (redis_expiry === -1) {
  //   await redis.set(CACHE_KEY, JSON.stringify(banners));
  // } else {
  //   await redis.set(CACHE_KEY, JSON.stringify(banners), { EX: redis_expiry });
  // }

  return send_response(
    true,
    banners,
    "Banners retrieved from database",
    StatusCodes.OK
  );
});
