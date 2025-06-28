import { uploadFileToCloudinary } from "@/helper/api/uploadFileToCloudinary";
import dbConnect from "@/lib/db";
import { Category } from "@/models/Categories";
import { send_response } from "@/utils/apiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "@/helper/api/statusCode";

export const POST = asyncHandler(async (req) => {
  await dbConnect();
  const formData = await req.formData();
  const categoryId = formData.get("categoryId");
  const name = formData.get("name");
  const imageFile = formData.get("image_url");
  const show_on_website = formData.get("show_on_website");

 
  if (categoryId) {
    const updateData = {};

    if (name) updateData.name = name;

    if (imageFile && typeof imageFile === "object") {
      const cloudinaryUrl = await uploadFileToCloudinary(imageFile);
      updateData.image_url = cloudinaryUrl;
    }

    if (show_on_website !== null) {
      updateData.show_on_website = show_on_website === "true";
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedCategory) {
      return send_response(false, null, "Category not found", StatusCodes.NOT_FOUND);
    }

    return send_response(true, null, "Category updated successfully", StatusCodes.OK);
  }

  

  if (!name || !imageFile) {
    return send_response(false, null, "Name and Image are required!", StatusCodes.BAD_REQUEST);
  }

  const existedCategory = await Category.findOne({ name });
  if (existedCategory) {
    return send_response(false, null, "Category already exists!", StatusCodes.CONFLICT);
  }

  const cloudinaryUrl = await uploadFileToCloudinary(imageFile);

  const categoryData = {
    name,
    image_url: cloudinaryUrl,
    
  };
  

  const newCategory = await Category.create(categoryData);

  

  return send_response(true, null, "Category created successfully", StatusCodes.CREATED);
});
