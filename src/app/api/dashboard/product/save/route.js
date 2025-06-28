import { Product } from "@/models/Product";
import { send_response } from "@/utils/apiResponse";
import dbConnect from "@/lib/db";
import { asyncHandler } from "@/utils/asyncHandler";
import { uploadFileToCloudinary } from "@/helper/api/uploadFileToCloudinary";
import { StatusCodes } from "@/helper/api/statusCode";
import { ProductImages } from "@/models/Product_related_images";
import { deleteOnCloudinary } from "@/utils/cloudinary";
import { clearRedisKeysByPrefix } from "@/utils/clearRedisPrefix";

export const POST = asyncHandler(async (req) => {
  await dbConnect();

  const formData = await req.formData();

  const name = formData.get("name");
  const description = formData.get("description");
  const price = parseInt(formData.get("price"));
  const actual_price = parseInt(formData.get("actual_price"));
  const product_main_image_file = formData.get("product_main_image_file");
  const show_on_website = formData.get("show_on_website") === "true";
  const category_id = formData.get("category_id");
  const _id = formData.get("_id");
  let product_related_image_files = formData.getAll("product_related_image_files");
  console.log("category_id", category_id);
  const data = {
    name,
    description,
    price,
    actual_price,
    show_on_website,
    category_id
  };

  if (_id) {
    const existingProduct = await Product.findById(_id);
    if (!existingProduct) {
      return send_response(false, null, "Product not found", StatusCodes.NOT_FOUND);
    }

    // Update fields only if they are provided (not null)
    existingProduct.name = name ?? existingProduct.name;
    existingProduct.description = description ?? existingProduct.description;
    existingProduct.price = isNaN(price) ? existingProduct.price : price;
    existingProduct.actual_price = isNaN(actual_price)
      ? existingProduct.actual_price
      : actual_price;
    existingProduct.show_on_website = show_on_website;
    existingProduct.category_id = category_id ?? existingProduct.category_id;

    // Handle main image
    if (product_main_image_file) {
      const newMainImageUrl = await uploadFileToCloudinary(product_main_image_file);
      if (existingProduct.product_main_image) {
        await deleteOnCloudinary(existingProduct.product_main_image);
      }
      existingProduct.product_main_image = newMainImageUrl;
    }

    await existingProduct.save();

    // Handle related images
    if (product_related_image_files.length > 0) {
      // Delete existing related images
      // const oldRelatedImages = await ProductImages.find({ product_id: _id });
      // for (const img of oldRelatedImages) {
      //   await deleteOnCloudinary(img.image_url);
      // }
      // await ProductImages.deleteMany({ product_id: _id });

      // Upload new related images
      const newImages = [];
      for (const file of product_related_image_files) {
        const url = await uploadFileToCloudinary(file);
        newImages.push({ product_id: _id, image_url: url });
      }
      await ProductImages.insertMany(newImages);
    }
    
    return send_response(true, null, "Product updated successfully", StatusCodes.OK);
  } else {
    // Create new product
    if (!name || !price || !product_main_image_file) {
      return send_response(
        false,
        null,
        "Name, price, Category, and product main image are required!",
        StatusCodes.BAD_REQUEST
      );
    }

    const cloudinaryUrl = await uploadFileToCloudinary(product_main_image_file);
    data.product_main_image = cloudinaryUrl;

    const product = await Product.create(data);

    if (product_related_image_files.length > 0) {
      const product_related_image_docs = [];
      for (const file of product_related_image_files) {
        const url = await uploadFileToCloudinary(file);
        product_related_image_docs.push({
          product_id: product._id,
          image_url: url
        });
      }
      await ProductImages.insertMany(product_related_image_docs);
    }

    return send_response(true, null, "Product created successfully", StatusCodes.CREATED);
  }
});
