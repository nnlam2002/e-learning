import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Tham chiếu đến Review
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến User
      required: true, // Bắt buộc
    },
    createdAt: {
      type: Date,
      default: Date.now, // Thời gian tạo comment
    },
  },
  { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);
