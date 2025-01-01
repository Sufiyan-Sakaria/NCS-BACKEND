import { Router } from "express";
import {
  CreateBrand,
  DeleteBrand,
  GetAllBrands,
  GetSingleBrand,
  UpdateBrand,
} from "../controllers/BrandController";

const router = Router();

// Get all Brands
router.get("/all", GetAllBrands);

// Create a new Brand
router.post("/add", CreateBrand);

// Delete a Brand
router.delete("/delete", DeleteBrand);

// Update a Brand
router.patch("/update/:id", UpdateBrand);

// Get Single Brand
router.get("/:id", GetSingleBrand);

export default router;
