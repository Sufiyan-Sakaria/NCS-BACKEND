import { Router } from "express";
import UserRoutes from "./UserRoutes";
import AuthRoutes from "./AuthRoutes";
import { authenticate } from "../middlewares/Authentication";

const router = Router();

// Auth Routes
router.use("/auth", AuthRoutes);

// User Routes
router.use("/users", authenticate, UserRoutes);

export default router;
