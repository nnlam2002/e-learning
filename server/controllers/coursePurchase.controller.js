import Stripe from "stripe";
import { Course } from "../models/course.model.js";
import { Cart } from "../models/cart.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.courseTitle,
              images: [course.courseThumbnail],
            },
            unit_amount: Math.round(course.coursePrice * 100), // Amount in paise (lowest denomination)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173/course-progress/${courseId}`, // once payment successful redirect to course progress page
      cancel_url: `http://localhost:5173/course-detail/${courseId}`,
      metadata: {
        courseId: courseId,
        userId: userId,
      },
      shipping_address_collection: {
        allowed_countries: ["VN"], // Optionally restrict allowed countries
      },
    });

    if (!session.url) {
      return res
        .status(400)
        .json({ success: false, message: "Error while creating session" });
    }

    const checkoutCourse = await CoursePurchase.findOne({userId, courseId});
    if(!checkoutCourse) {
        // Create a new course purchase record
        const newPurchase = new CoursePurchase({
          courseId,
          userId,
          amount: course.coursePrice,
          status: "pending",
        });
        // Save the purchase record
        newPurchase.paymentId = session.id;
        await newPurchase.save();
    }
    else {
      // Create a new course purchase record
      checkoutCourse.paymentId = session.id;
      await checkoutCourse.save();
    }

    return res.status(200).json({
      success: true,
      url: session.url, // Return the Stripe checkout URL
    });
  } catch (error) {
    console.log(error);
  }
};
export const createCartCheckoutSession = async (req, res) => {
  try {
    const userId = req.id; // Lấy userId từ middleware xác thực

    // Lấy các mục trong giỏ hàng của người dùng
    const cartItems = await Cart.find({ userId }).populate("courseId");
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty!" });
    }

    // Lấy danh sách khóa học từ các mục giỏ hàng
    const courses = cartItems.map((item) => item.courseId);
    if (!courses || courses.some((course) => !course || !course._id)) {
      return res.status(400).json({ success: false, message: "Invalid courses in your cart." });
    }

    // Tạo `line_items` cho Stripe
    const lineItems = courses.map((course) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: course.courseTitle,
          images: [course.courseThumbnail],
        },
        unit_amount: Math.round(course.coursePrice * 100), // Giá theo cent
      },
      quantity: 1,
    }));

    // Tạo phiên thanh toán với Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `http://localhost:5173/cart/success`,
      cancel_url: `http://localhost:5173/cart`,
      metadata: {
        userId,
        courseIds: JSON.stringify(courses.map((course) => course._id.toString())),
      },
    });

    if (!session.url) {
      return res.status(400).json({ success: false, message: "Error while creating session" });
    }

    // Lưu các khóa học vào bảng `CoursePurchase` với trạng thái "pending"
    for (const course of courses) {
      const existingPurchase = await CoursePurchase.findOne({ userId, courseId: course._id });
      if (!existingPurchase) {
        const newPurchase = new CoursePurchase({
          courseId: course._id,
          userId,
          amount: course.coursePrice,
          status: "pending",
          paymentId: session.id,
        });
        await newPurchase.save();
      }
    }

    return res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Error creating cart checkout session:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const addCourseToCart = async (req, res) => {
  try {
    const userId = req.id; // Giả sử `req.id` chứa ID của người dùng (middleware xác thực đã xử lý)
    const { courseId } = req.body;

    // Kiểm tra nếu khóa học đã tồn tại trong giỏ hàng của người dùng
    const existingCartItem = await Cart.findOne({ userId, courseId });
    if (existingCartItem) {
      return res.status(400).json({
        success: false,
        message: "Course is already in the cart",
      });
    }

    // Thêm khóa học vào giỏ hàng
    const cartItem = new Cart({
      userId,
      courseId,
    });

    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: "Course added to cart successfully",
      cartItem,
    });
  } catch (error) {
    console.error("Error adding course to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add course to cart",
    });
  }
};
export const stripeWebhook = async (req, res) => {
  let event;

  try {
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    });

    event = stripe.webhooks.constructEvent(payloadString, header, secret);
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    console.log("check session complete is called");

    try {
      const session = event.data.object;

      const purchase = await CoursePurchase.findOne({
        paymentId: session.id,
      }).populate({ path: "courseId" });

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      if (session.amount_total) {
        purchase.amount = session.amount_total / 100;
      }
      purchase.status = "completed";

      // Make all lectures visible by setting `isPreviewFree` to true
      // if (purchase.courseId && purchase.courseId.lectures.length > 0) {
      //   await Lecture.updateMany(
      //     { _id: { $in: purchase.courseId.lectures } },
      //     { $set: { isPreviewFree: true } }
      //   );
      // }

      await purchase.save();

      // Update user's enrolledCourses
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } }, // Add course ID to enrolledCourses
        { new: true }
      );

      // Update course to add user ID to enrolledStudents
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } }, // Add user ID to enrolledStudents
        { new: true }
      );
    } catch (error) {
      console.error("Error handling event:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  res.status(200).send();
};
export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" })
      .populate({ path: "category" });

    const purchased = await CoursePurchase.findOne({ userId, courseId });
    console.log(purchased);

    if (!course) {
      return res.status(404).json({ message: "course not found!" });
    }

    return res.status(200).json({
      course,
      purchased: purchased ? (purchased.status === 'completed' ? true : false) : false, // true if purchased, false otherwise
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPurchasedCourse = async (_, res) => {
  try {
    const purchasedCourse = await CoursePurchase.find({
      status: "completed",
    }).populate("courseId");
    if (!purchasedCourse) {
      return res.status(404).json({
        purchasedCourse: [],
      });
    }
    return res.status(200).json({
      purchasedCourse,
    });
  } catch (error) {
    console.log(error);
  }
};
