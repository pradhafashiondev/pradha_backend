import { Banner } from "@/models/Banner";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { uploadFileToCloudinary } from "@/helper/api/uploadFileToCloudinary";
import { StatusCodes } from "@/helper/api/statusCode";
import { deleteOnCloudinary } from "@/utils/cloudinary";
import mongoose from "mongoose";
export const POST = asyncHandler(async (req) => {
  await dbConnect();
  const formData = await req.formData();

  const name = formData.get("name");
  const category_id = formData.get("category_id");
  const show_on_website = formData.get("show_on_website") === "true";
  const image_file = formData.get("image_file");
  const image_file_mobile = formData.get("image_file_mobile");
  const _id = formData.get("_id");
  console.log("category_id", category_id);
  const data = { name, category_id, show_on_website };

  if (_id) {
    const existingBanner = await Banner.findById(_id);
    if (!existingBanner) {
      return send_response(false, null, "Banner not found", StatusCodes.NOT_FOUND);
    }

    // Update fields
    if (name !== null) {
      if (!name.trim())
        return send_response(false, null, "Name cannot be empty", StatusCodes.BAD_REQUEST);
      existingBanner.name = name;
    }
    if (category_id !== null) {
      if (!category_id.trim())
        return send_response(false, null, "category_id cannot be empty", StatusCodes.BAD_REQUEST);
      existingBanner.category_id = category_id;
    }
    existingBanner.show_on_website = show_on_website;

    // Handle image update
    if (image_file) {
      const newImageUrl = await uploadFileToCloudinary(image_file);
      if (existingBanner.image_url) {
        await deleteOnCloudinary(existingBanner.image_url);
      }
      existingBanner.image_url = newImageUrl;
    }
    if (image_file_mobile) {
      const newImageUrl_mobile = await uploadFileToCloudinary(image_file_mobile);
      if (existingBanner.image_url_mobile) {
        await deleteOnCloudinary(existingBanner.image_url_mobile);
      }
      existingBanner.image_url_mobile = newImageUrl_mobile;
    }

    await existingBanner.save();
    return send_response(true, null, "Banner updated successfully", StatusCodes.OK);
  } else {
    // Create new banner
    if (!name || !category_id || !image_file || !image_file_mobile) {
      return send_response(
        false,
        null,
        "Name, category_id, and image are required!",
        StatusCodes.BAD_REQUEST
      );
    }

    const imageUrl = await uploadFileToCloudinary(image_file);
    data.image_url = imageUrl;

    const imageUrl_mobile = await uploadFileToCloudinary(image_file_mobile);
    data.image_url_mobile = imageUrl_mobile;
    console.log(data);
    await Banner.create(data);
    
    return send_response(true, data, "Banner created successfully", StatusCodes.CREATED);
  }
});

export const GET = asyncHandler(async (req) => {
  await dbConnect();

  const searchParams = req.nextUrl.searchParams;

  const filter = {};
  if (searchParams.has("search")) {
    filter.name = { $regex: new RegExp(searchParams.get("search"), "i") };
  }
  const category = searchParams.get("category") || "all";
  const parsedPage = Math.max(1, parseInt(searchParams.get("page"), 10)) || 1;
  const parsedLimit = Math.max(1, parseInt(searchParams.get("limit"), 10)) || 10;
  if (category && category !== "all") {
    filter.category_id = new mongoose.Types.ObjectId(category);
  }
  const totalBanners = await Banner.countDocuments(filter);

  const skip = (parsedPage - 1) * parsedLimit;

  const banners = await Banner.find(filter).skip(skip).limit(parsedLimit).populate("category_id"); // Optional: populate category details if needed

  return send_response(
    true,
    {
      banners,
      pagination: {
        total: totalBanners,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(totalBanners / parsedLimit)
      }
    },
    "Banners retrieved successfully",
    StatusCodes.OK
  );
});