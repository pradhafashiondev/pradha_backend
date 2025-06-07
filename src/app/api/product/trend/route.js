import { Product } from "@/models/Product";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import { ProductImages } from "@/models/Product_related_images";
import redis from "@/lib/redis";
import { redis_expiry } from "@/helper/api/commonHelper";

export const GET = asyncHandler(async () => {
  await dbConnect();

  const cacheKey = "all_products_with_category";
  const cached = await redis.get(cacheKey);
  const ttl = await redis.ttl(cacheKey);
  console.log(ttl); // Should return ~300 if set correctly
  if (cached) {
    return send_response(
      true,
      JSON.parse(cached),
      "All products fetched from cache.",
      StatusCodes.OK
    );
  }

  const productsWithImages = await Product.find({
    show_on_website: true,
  }).populate({ path: "category_id", select: "name" });

  if (redis_expiry === -1) {
    await redis.set(cacheKey, JSON.stringify(productsWithImages));
  } else {
    await redis.set(cacheKey, JSON.stringify(productsWithImages), {
      EX: redis_expiry,
    });
  }

  return send_response(
    true,
    productsWithImages,
    "All products fetched successfully.",
    StatusCodes.OK
  );
});
