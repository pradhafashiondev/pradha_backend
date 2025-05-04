import { Feedback } from "@/models/Feedback";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";

export const GET = asyncHandler(async () => {
  await dbConnect();

  const feedbacks = await Feedback.find({show_on_website: true})
    .sort({ feedback_date: -1 })
    .lean()
    .exec();

  return send_response(
    true,
    feedbacks,
    "All feedbacks fetched successfully.",
    StatusCodes.OK
  );
});
