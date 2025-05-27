import { Product } from "@/models/Product";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";

export const GET = asyncHandler(async (req) => {
  await dbConnect();
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category");
  const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
  const limit = Math.max(parseInt(searchParams.get("limit")) || 10, 1);
  const searchTerm = searchParams.get("searchTerm");
  const sortOption = searchParams.get("sortOption"); // 'asc' or 'desc'

  const skip = (page - 1) * limit;

  const matchStage = {
    show_on_website: true,
    ...(category?.trim() ? { category_id: category } : {}), // ✅ skip if category is ""
  };

  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm, "i");
    matchStage.$or = [{ name: searchRegex }];
  }

  // Sorting logic
  const sortStage = {};
  if (sortOption === "asc") {
    sortStage.actual_price = 1;
  } else if (sortOption === "desc") {
    sortStage.actual_price = -1;
  }

  const total = await Product.countDocuments(matchStage);
  const totalPages = Math.ceil(total / limit);
  const products = await Product.find(matchStage).populate({
    path: "category_id",
    select: "name", 
  })
    .sort(sortStage)
    .skip(skip)
    .limit(limit);

  return send_response(
    true,
    {
      products,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    },
    "Products fetched successfully.",
    StatusCodes.OK
  );
});
