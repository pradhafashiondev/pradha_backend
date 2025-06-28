import { Feedback } from "@/models/Feedback";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { uploadFileToCloudinary } from "@/helper/api/uploadFileToCloudinary";
import { StatusCodes } from "@/helper/api/statusCode";

export const POST = asyncHandler(async (req) => {
  await dbConnect();

  const formData = await req.formData();

  const _id = formData.get("_id");
  const name = formData.get("name");
  const feedback = formData.get("feedback");
  const user_image = formData.get("user_image");
  const show_on_website = formData.get("show_on_website") === "true";
  const feedback_date = formData.get("feedback_date");


  if (!name || !feedback || !feedback_date) {
    return send_response(
      false,
      null,
      "Name, Feedback, and Feedback date are required!",
      StatusCodes.BAD_REQUEST
    );
  }

  let feedbackData = {
    name,
    feedback,
    feedback_date: new Date(feedback_date),
    show_on_website
  };

  if (_id) {    
    const existingFeedback = await Feedback.findById(_id);
    
    if (user_image  && user_image.size > 0 && user_image.name !== '') {
      try {
        feedbackData.user_image = await uploadFileToCloudinary(user_image);
      } catch (error) {
        return send_response(
          false,
          null,
          `Image upload failed: ${error.message}`,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
    } else {
      feedbackData.user_image = existingFeedback.user_image;
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      _id,
      feedbackData,
      { new: true, runValidators: true }
    );

    return send_response(
      true,
      updatedFeedback,
      "Feedback updated successfully",
      StatusCodes.OK
    );
  }

  if (user_image  && user_image.size > 0) {
    try {
      feedbackData.user_image = await uploadFileToCloudinary(user_image);
    } catch (error) {
      return send_response(
        false,
        null,
        `Image upload failed: ${error.message}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  const newFeedback = await Feedback.create(feedbackData);
    return send_response(
      true,
      newFeedback,
      "Feedback created successfully",
      StatusCodes.CREATED
    );

});
