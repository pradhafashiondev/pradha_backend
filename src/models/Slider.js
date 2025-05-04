import mongoose from "mongoose";
import dbConnect from "@/lib/db";

await dbConnect();

const sliderSchema = new mongoose.Schema(
  {
    image_url:{
      type:String,
      required:true,
    },   
    show_on_website:{
      type:Boolean,
      default:true,
    },        
  },
  {
    timestamps:true
  }
)

export const Slider =
  mongoose.models.Slider || mongoose.model("Slider", sliderSchema);