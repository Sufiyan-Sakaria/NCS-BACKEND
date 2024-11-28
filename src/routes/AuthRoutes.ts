import { Router } from "express";
import { Login } from "../controllers/AuthController";

const router = Router();

// Login route
router.get("/login", Login);

export default router;
