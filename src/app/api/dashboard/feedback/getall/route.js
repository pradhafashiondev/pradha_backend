import { Feedback } from "@/models/Feedback";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";

export const GET = asyncHandler(async (req) => {
  await dbConnect();
  const searchParams = req.nextUrl.searchParams;

  const pageNumber = Math.max(1, parseInt(searchParams.get("page"))) || 1;
  const limitNumber = Math.max(1, parseInt(searchParams.get("limit"))) || 10;
  const search = searchParams.get("search") || "";
  const skip = (pageNumber - 1) * limitNumber;

  let filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { feedback: { $regex: search, $options: "i" } }
    ];
  }

  const [feedbacks, total] = await Promise.all([
    Feedback.find(filter).sort({ feedback_date: -1 }).skip(skip).limit(limitNumber).lean().exec(),
    Feedback.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limitNumber);

  return send_response(
    true,
    {
      feedbacks,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        itemsPerPage: limitNumber,
        totalItems: total,
        hasNextPage: pageNumber < totalPages
      }
    },
    "Feedbacks fetched successfully",
    StatusCodes.OK
  );
});
