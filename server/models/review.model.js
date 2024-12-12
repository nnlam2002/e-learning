import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Bắt buộc
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true, // Bắt buộc
    },
    comment: {
      type: String,
      required: true, // Bắt buộc
    },
    star: {
      type: Number,
      min: 1,
      max: 5,
      required: true, // Bắt buộc
    },
  },
  { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);