import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  feedback: {
    type: String,
    required: true,
    trim: true,
  },
  user_image: {
    type: String,
    default: null,
    trim: true,
  },
  show_on_website: {
    type: Boolean,
    default: true
  },
  feedback_date:{
    type: Date,
    required: true,
  }
},
{
  timestamps:true
});

export const Feedback = mongoose.models.Feedback || mongoose.model("Feedback",feedbackSchema);