import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    image_url: {
      type: String,
      trim: true
    },
    show_on_website: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const Banner = mongoose.models.Banner || mongoose.model("Banner", bannerSchema);
