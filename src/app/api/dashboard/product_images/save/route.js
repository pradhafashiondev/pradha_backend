import { Product } from "@/models/Product";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { uploadFileToCloudinary } from "@/helper/api/uploadFileToCloudinary";
import { StatusCodes } from "@/helper/api/statusCode";
import { ProductImages } from "@/models/Product_related_images";
import { deleteOnCloudinary } from "@/utils/cloudinary";

export const POST = asyncHandler(async(req)=>{
  await dbConnect();

  const formData = await req.formData();

  const product_id = formData.get("_id");
  const product_related_image_files = formData.getAll("product_related_image_files");

  const product_related_image_docs = [];
  for (const file of product_related_image_files) {
    const cloudinary_url = await uploadFileToCloudinary(file);
    product_related_image_docs.push({
      product_id: product_id,
      image_url: cloudinary_url,
    });
  }

  await ProductImages.insertMany(product_related_image_docs);

  return send_response(true, null, "Success", StatusCodes.OK);
})