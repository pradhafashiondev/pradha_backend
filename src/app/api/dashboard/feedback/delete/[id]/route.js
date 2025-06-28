import { Feedback } from "@/models/Feedback";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
import { deleteOnCloudinary } from "@/utils/cloudinary";

export const DELETE = asyncHandler(async (req, context) => {
  await dbConnect();
  const { id } = await context.params;

  const feedback = await Feedback.findById(id);
  if (!feedback) {
    return send_response(false, null, "Feedback not found", StatusCodes.NOT_FOUND);
  }

  try {
    if (feedback.user_image) {
      await deleteOnCloudinary(feedback.user_image);
    }
    
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { $set: { user_image: null } },
      { new: true }
    );

    return send_response(
      true,
      updatedFeedback,
      "Image deleted successfully",
      StatusCodes.OK
    );
  } catch (error) {
    return send_response(
      false,
      null,
      `Image deletion failed: ${error.message}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});