import mongoose from "mongoose";
import dbConnect from "@/lib/db";

await dbConnect();

const contactDetailsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    number: {
      type: String,
      required: true
    },
    section:{
      type: String,
      required: true
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

export const ContactDetails =
  mongoose.models.ContactDetails || mongoose.model("ContactDetails", contactDetailsSchema);
