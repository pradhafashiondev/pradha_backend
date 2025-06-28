import { Feedback } from "@/models/Feedback";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import redis from "@/lib/redis";
import { redis_expiry } from "@/helper/api/commonHelper";

export const GET = asyncHandler(async () => {
  await dbConnect();

  // const cacheKey = "all_feedbacks";
  // const cached = await redis.get(cacheKey);

  // if (cached) {
  //   return send_response(
  //     true,
  //     JSON.parse(cached),
  //     "Feedbacks from cache",
  //     StatusCodes.OK
  //   );
  // }

  const feedbacks = await Feedback.find({ show_on_website: true })
    .sort({ feedback_date: -1 })
    .lean()
    .exec();

  // if (redis_expiry === -1) {
  //   await redis.set(cacheKey, JSON.stringify(feedbacks));
  // } else {
  //   await redis.set(cacheKey, JSON.stringify(feedbacks), { EX: redis_expiry });
  // }

  return send_response(
    true,
    feedbacks,
    "All feedbacks fetched",
    StatusCodes.OK
  );
});
