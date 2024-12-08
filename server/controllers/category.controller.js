import { Category } from "../models/category.model.js";

export const createCategory = async (req, res) => {
    try {
        const { categoryName, isActive } = req.body;

        if (!categoryName) {
            return res.status(400).json({
                message: "Category name is required.",
            });
        }

        const existingCategory = await Category.findOne({ categoryName });
        if (existingCategory) {
            return res.status(400).json({
                message: "Category name already exists.",
            });
        }

        const category = await Category.create({
            categoryName,
            isActive
        });

        return res.status(201).json({
            category,
            message: "Category created successfully.",
        });
    } catch (error) {
        console.error("Error in createCategory:", error);
        return res.status(500).json({
            message: "Failed to create category.",
        });
    }
};

export const editCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { categoryName, isActive } = req.body;

        let category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                message: "Category not found!",
            });
        }

        const updateData = {};
        if (categoryName) updateData.categoryName = categoryName;
        if (typeof isActive !== "undefined") {
            if (typeof isActive !== "boolean") {
                return res.status(400).json({
                    message: "isActive must be a boolean.",
                });
            }
            updateData.isActive = isActive;
        }

        category = await Category.findByIdAndUpdate(categoryId, updateData, { new: true });

        return res.status(200).json({
            category,
            message: "Category updated successfully.",
        });
    } catch (error) {
        console.error("Error in editCategory:", error);
        return res.status(500).json({
            message: "Failed to update category.",
        });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({
                message: "Category not found!",
            });
        }

        return res.status(200).json({
            category,
        });
    } catch (error) {
        console.error("Error in getCategoryById:", error);
        return res.status(500).json({
            message: "Failed to get category by id.",
        });
    }
};

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find()

        return res.status(200).json({
            categories
        });
    } catch (error) {
        console.error("Error in getAllCategories:", error);
        return res.status(500).json({
            message: "Failed to get categories.",
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const category = await Category.findByIdAndDelete(categoryId);

        if (!category) {
            return res.status(404).json({
                message: "Category not found!",
            });
        }

        return res.status(200).json({
            message: "Category deleted successfully.",
        });
    } catch (error) {
        console.error("Error in deleteCategory:", error);
        return res.status(500).json({
            message: "Failed to delete category.",
        });
    }
};
