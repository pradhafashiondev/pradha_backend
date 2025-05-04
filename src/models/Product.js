import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    trim: true,
    required: true,
  },
  actual_price: {
    type: Number,
    trim: true,
    required: true,
  },
  product_main_image: {
    type: String,
    trim: true,
  },
  show_on_website: {
    type: Boolean,
    default: true
  },
  category_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Category",
    required:true
  }
},
{
  timestamps:true
});

export const Product = mongoose.models.Product || mongoose.model("Product",productSchema);