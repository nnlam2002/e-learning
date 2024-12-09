import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCategory, editCategory, getCategoryById, getAllCategories, deleteCategory } from "../controllers/category.controller.js";

const router = express.Router();

router.route("/").get(isAuthenticated, getAllCategories)
router.route("/").post(isAuthenticated, createCategory);
router.route("/:categoryId").get(isAuthenticated, getCategoryById)
router.route("/:categoryId").put(isAuthenticated, editCategory)
router.route("/:categoryId").delete(isAuthenticated, deleteCategory);

export default router;
