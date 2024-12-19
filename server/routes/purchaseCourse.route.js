import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCheckoutSession,createCartCheckoutSession, getAllPurchasedCourse, getCourseDetailWithPurchaseStatus,addCourseToCart, stripeWebhook } from "../controllers/coursePurchase.controller.js";

const router = express.Router();

router.route("/checkout/create-checkout-session").post(isAuthenticated, createCheckoutSession);
router.route("/checkout/create-cart-checkout-session").post(isAuthenticated, createCartCheckoutSession);
router.route("/add-to-cart").post(isAuthenticated, addCourseToCart);
router.route("/webhook").post(express.raw({type:"application/json"}), stripeWebhook);
router.route("/course/:courseId/detail-with-status").get(isAuthenticated,getCourseDetailWithPurchaseStatus);

router.route("/").get(isAuthenticated,getAllPurchasedCourse);

export default router;