import express from "express";
// import { getUserProfile, login, forgot, logout, register, updateProfile } from "../controllers/user.controller.js";
import { getUserProfile, login, forgot, logout, register, updateProfile, updateUserRole, getUserProfileById, updatePassword, getAllUser, registerInstructor } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/register-instructor").post(registerInstructor);
router.route("/login").post(login);
router.route("/forgot").post(forgot);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/:userId").get(isAuthenticated, getUserProfileById);
router.route("/profile/update").put(isAuthenticated, upload.single("profilePhoto"), updateProfile);
router.route("/role/update").put(isAuthenticated, updateUserRole);
router.route("/password/update").put(isAuthenticated, updatePassword);
router.route("/user").get(isAuthenticated, getAllUser);

export default router;