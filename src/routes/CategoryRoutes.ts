import { Router } from "express";
import {
  CreateCategory,
  DeleteCategory,
  GetAllCategories,
  GetSingleCategory,
  UpdateCategory,
} from "../controllers/CategoryController";

const router = Router();

// Get all Categories
router.get("/all", GetAllCategories);

// Create a new Category
router.post("/add", CreateCategory);

// Delete a Category
router.delete("/delete/:id", DeleteCategory);

// Update a Category
router.patch("/update/:id", UpdateCategory);

// Get Single Category
router.get("/:id", GetSingleCategory);

export default router;
