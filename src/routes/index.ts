import { Router } from "express";
import UserRoutes from "./UserRoutes";
import AuthRoutes from "./AuthRoutes";
import CategoryRoutes from "./CategoryRoutes";
import BrandRoutes from "./BrandRoutes";
import { authenticate } from "../middlewares/Authenticate";

const router = Router();

// Auth Routes
router.use("/auth", AuthRoutes);

// User Routes
router.use("/users", authenticate, UserRoutes);

// Category Routes
router.use("/categories", authenticate, CategoryRoutes);

// Brand Routes
router.use("/brands", authenticate, BrandRoutes);

export default router;
