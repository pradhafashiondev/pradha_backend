import mongoose from "mongoose";
import dbConnect from "@/lib/db";

await dbConnect();

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    image_url: {
      type: String,
      required: true,
    },
    show_on_website: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.models.Category || mongoose.model("Category",categorySchema)