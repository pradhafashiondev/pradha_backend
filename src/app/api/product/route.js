import { Product } from "@/models/Product";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import redis from "@/lib/redis";
import { redis_expiry } from "@/helper/api/commonHelper";


export const GET = asyncHandler(async (req) => {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  // console.log('fehfoh')
  const category = searchParams.get("category") || "";
  const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
  const limit = Math.max(parseInt(searchParams.get("limit")) || 10, 1);
  const searchTerm = searchParams.get("searchTerm") || "";
  const sortOption = searchParams.get("sortOption") || "";

  const skip = (page - 1) * limit;

  // const cacheKey = `products_${category}_${page}_${limit}_${searchTerm}_${sortOption}`;
  // const cached = await redis.get(cacheKey);

  // if (cached) {
  //   return send_response(
  //     true,
  //     JSON.parse(cached),
  //     "Products from cache",
  //     StatusCodes.OK
  //   );
  // }

  const matchStage = {
    show_on_website: true,
    ...(category.trim() ? { category_id: category } : {}),
  };

  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm, "i");
    matchStage.$or = [{ name: searchRegex }];
  }

  const sortStage = {};
  if (sortOption === "asc") sortStage.actual_price = 1;
  else if (sortOption === "desc") sortStage.actual_price = -1;

  const total = await Product.countDocuments(matchStage);
  const totalPages = Math.ceil(total / limit);

  const products = await Product.find(matchStage)
    .populate({ path: "category_id", select: "name" })
    .sort(sortStage)
    .skip(skip)
    .limit(limit);

  const response = {
    products,
    pagination: { total, totalPages, currentPage: page, limit },
  };

    //   if (redis_expiry === -1) {
    //   await redis.set(cacheKey, JSON.stringify(response));
    // } else {
    //   await redis.set(cacheKey, JSON.stringify(response), { EX: redis_expiry });
    // }

  return send_response(true, response, "Products fetched", StatusCodes.OK);
});

