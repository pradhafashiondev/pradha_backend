import dbConnect from "@/lib/db";
import { Category } from "@/models/Categories";
import { asyncHandler } from "@/utils/asyncHandler";
import { send_response } from "@/utils/apiResponse";
import { StatusCodes } from "@/helper/api/statusCode";

export const DELETE = asyncHandler(async (req) => {
  await dbConnect();

  const body = await req.json();
  const { categoryId } = body;

  if (!categoryId) {
    return send_response(false, null, "Category ID is required", StatusCodes.BAD_REQUEST);
  }

  const deletedCategory = await Category.findByIdAndDelete(categoryId);

  if (!deletedCategory) {
    return send_response(false, null, "Category not found", StatusCodes.NOT_FOUND);
  }

  return send_response(true, { deletedCategory }, "Category deleted successfully", StatusCodes.OK);
});
