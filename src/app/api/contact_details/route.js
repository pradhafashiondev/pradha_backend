import { ContactDetails } from "@/models/ContactDetials";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import redis from "@/lib/redis";
import { redis_expiry } from "@/helper/api/commonHelper";

export const GET = asyncHandler(async (req) => {
  await dbConnect();

  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
  const limit = Math.max(parseInt(searchParams.get("limit")) || 10, 1);
  const search = searchParams.get("search") || "";

  const cacheKey = `contacts_page_${page}_limit_${limit}_search_${search}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return send_response(
      true,
      JSON.parse(cached),
      "Contacts retrieved from cache",
      StatusCodes.OK
    );
  }

  const filter = {};
  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { name: regex },
      { email: regex },
      { number: regex },
      { section: regex },
    ];
  }

  const skip = (page - 1) * limit;

  const contacts = await ContactDetails.find(filter)
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await ContactDetails.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const result = {
    contacts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };

  if (redis_expiry === -1) {
    await redis.set(cacheKey, JSON.stringify(result));
  } else {
    await redis.set(cacheKey, JSON.stringify(result), { EX: redis_expiry });
  }

  return send_response(
    true,
    result,
    "Contacts retrieved successfully",
    StatusCodes.OK
  );
});
