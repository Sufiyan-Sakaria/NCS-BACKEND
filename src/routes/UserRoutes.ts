import { Router } from "express";
import {
  GetAllUser,
  GetSingleUserByID,
  EditUser,
  DeleteUser,
  AddUser,
  LoginUser,
} from "../controllers/UserController";
import { validateUserID, validateUserUpdate } from "../middlewares/validators";

const router = Router();

// Fetch Login User Details
router.get("/me", LoginUser);

// Fetch all users
router.get("/all", GetAllUser);

// Fetch a single user by ID
router.get("/:id", validateUserID, GetSingleUserByID);

// Add a user
router.post("/add", AddUser);

// Update a user by ID
router.patch("/update/:id", validateUserID, validateUserUpdate, EditUser);

// Delete a user by ID
router.delete("/:id", validateUserID, DeleteUser);

export default router;
