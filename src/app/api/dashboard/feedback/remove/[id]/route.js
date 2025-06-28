import { Feedback } from "@/models/Feedback";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";
// import { delete_image } from "@/services/feedback/feedbackServices";

export const DELETE = asyncHandler(async (req, context) => {
  await dbConnect();

  const { id } = await context.params;

  if (!id) {
    return send_response(
      false,
      null,
      "Feedback ID is required",
      StatusCodes.BAD_REQUEST
    );
  }

  // Check if feedback exists
  const existingFeedback = await Feedback.findById(id);
  if (!existingFeedback) {
    return send_response(
      false,
      null,
      "Feedback not found",
      StatusCodes.NOT_FOUND
    );
  }
  try {
    if (existingFeedback.user_image) {
      const imageResponse = await delete_image(existingFeedback._id);
      console.log("Image deletion response:", imageResponse);
      
      if (!imageResponse?.data?.success) {
        console.log("Image deletion failed:", imageResponse);
        return send_response(
          false,
          null,
          "Failed to delete associated image",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
    }

    const deletedFeedback = await Feedback.findByIdAndDelete(id);
    
    return send_response(
      true,
      deletedFeedback,
      "Feedback deleted successfully",
      StatusCodes.OK
    );
  } catch (error) {
    return send_response(
      false,
      null,
      error.message.includes('Cloudinary') 
        ? "Failed to delete associated image. Please try again later." 
        : "Failed to delete feedback",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});