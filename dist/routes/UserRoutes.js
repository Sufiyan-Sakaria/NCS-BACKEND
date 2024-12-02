"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const Validators_1 = require("../middlewares/Validators");
const router = (0, express_1.Router)();
// Fetch Login User Details
router.get("/me", UserController_1.LoginUser);
// Fetch all users
router.get("/all", UserController_1.GetAllUser);
// Fetch a single user by ID
router.get("/:id", Validators_1.validateUserID, UserController_1.GetSingleUserByID);
// Add a user
router.post("/add", UserController_1.AddUser);
// Update a user by ID
router.patch("/:id", Validators_1.validateUserID, Validators_1.validateUserUpdate, UserController_1.EditUser);
// Delete a user by ID
router.delete("/:id", Validators_1.validateUserID, UserController_1.DeleteUser);
exports.default = router;
//# sourceMappingURL=UserRoutes.js.map