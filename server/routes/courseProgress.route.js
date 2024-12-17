import express from "express"
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getCourseProgress, markAsCompleted, markAsInCompleted, updateLectureProgress,submitFeedback, getFeedback,submitComment, getCoursesProgress } from "../controllers/courseProgress.controller.js";

const router = express.Router()

router.route("/:courseId").get(isAuthenticated, getCourseProgress);
router.route("/").get(isAuthenticated, getCoursesProgress);
router.route("/:courseId/lecture/:lectureId/view").post(isAuthenticated, updateLectureProgress);
router.route("/:courseId/complete").post(isAuthenticated, markAsCompleted);
router.route("/:courseId/feedback").post(isAuthenticated,submitFeedback,);
router.route("/:courseId/comment").post(isAuthenticated,submitComment,);
router.route("/:courseId/feedback").get(isAuthenticated, getFeedback);
router.route("/:courseId/incomplete").post(isAuthenticated, markAsInCompleted);

export default router;