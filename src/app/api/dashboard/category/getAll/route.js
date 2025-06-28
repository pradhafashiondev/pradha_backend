import dbConnect from "@/lib/db";
import { Category } from "@/models/Categories";
import { asyncHandler } from "@/utils/asyncHandler";
import { send_response } from "@/utils/apiResponse";
import { StatusCodes } from "@/helper/api/statusCode";

export const GET = asyncHandler(async (req) => {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  let limit = parseInt(searchParams.get("limit")) || 10;

  limit = limit > 20 ? 20 : limit;
  limit = limit < 1 ? 10 : limit;

  const skip = (Math.max(1, page) - 1) * limit;

  const searchCondition = q ? { name: { $regex: new RegExp(q, "i") } } : {};

  const total = await Category.countDocuments(searchCondition);

  const categories = await Category.find(searchCondition).skip(skip).limit(limit);

  const totalPages = Math.ceil(total / limit);

  return send_response(
    true,
    {
      categories,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages,
        itemsPerPage: limit
      }
    },
    "Categories fetched successfully",
    StatusCodes.OK
  );
});
