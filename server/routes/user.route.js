import express from "express";
import { getUserProfile, login, logout, register, updateProfile, updatePassword } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/password/update").put(isAuthenticated, updatePassword); // Route mới

export default router;