import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCourse, createLecture, editCourse,removeCourseFromCart, editLecture, getCourseById, getCourseInCart, getCourseLecture, getCreatorCourses, getCreatorCoursesById, getAllCourses, getLectureById, getPublishedCourse, removeLecture, searchCourse, togglePublishCourse, deleteCourse, recommendCourses } from "../controllers/course.controller.js";
import upload from "../utils/multer.js";
const router = express.Router();

router.route("/").post(isAuthenticated,createCourse);
router.route("/search").get(isAuthenticated, searchCourse);
router.route("/published-courses").get( getPublishedCourse);
router.route("/cart").get(isAuthenticated, getCourseInCart);
router.delete("/cart/:courseId", isAuthenticated, removeCourseFromCart);
router.route("/").get(isAuthenticated,getCreatorCourses);
router.route("/recommend").post(isAuthenticated, recommendCourses);
router.route("/course/:userId").get(isAuthenticated,getCreatorCoursesById);
router.route("/all-course").get(isAuthenticated,getAllCourses);
router.route("/:courseId").put(isAuthenticated,upload.single("courseThumbnail"),editCourse);
router.route("/:courseId").get(isAuthenticated, getCourseById);
router.route("/:courseId").delete(isAuthenticated, deleteCourse); // New route for deleting course
router.route("/:courseId/lecture").post(isAuthenticated, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);
router.route("/:courseId/lecture/:lectureId").post(isAuthenticated, editLecture);
router.route("/lecture/:lectureId").delete(isAuthenticated, removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);
router.route("/:courseId").patch(isAuthenticated, togglePublishCourse);

export default router;