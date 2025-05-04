import mongoose from "mongoose";

const productImagesSchema = new mongoose.Schema(
  {
    image_url: {
      type: String,
      required: true,
      trim: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ProductImages =
  mongoose.models.ProductImages ||
  mongoose.model("ProductImages", productImagesSchema);
