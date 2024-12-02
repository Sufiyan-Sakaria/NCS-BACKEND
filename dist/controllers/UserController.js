"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUser = exports.DeleteUser = exports.EditUser = exports.AddUser = exports.GetSingleUserByID = exports.GetAllUser = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../utils/AppError");
const bcrypt_1 = require("../utils/bcrypt");
const prisma = new client_1.PrismaClient();
// Get all users
const GetAllUser = async (req, res, next) => {
    try {
        const users = await prisma.users.findMany({
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!users.length) {
            return next(new AppError_1.AppError("No users found", 404));
        }
        res.status(200).json({
            status: "success",
            message: "Users fetched succesfully",
            users,
        });
    }
    catch (error) {
        next(new AppError_1.AppError("Internal server error", 500));
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.GetAllUser = GetAllUser;
const GetSingleUserByID = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await prisma.users.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return next(new AppError_1.AppError("User does not exist", 404));
        }
        res.status(200).json({
            status: "success",
            message: "User fetched succesfully",
            user,
        });
    }
    catch (error) {
        next(new AppError_1.AppError("Internal server error", 500));
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.GetSingleUserByID = GetSingleUserByID;
const AddUser = async (req, res, next) => {
    try {
        const { firstname, lastname, email, password, role } = req.body;
        // Validate required fields
        if (!firstname || !lastname || !email || !password) {
            return next(new AppError_1.AppError("Firstname, lastname, email, and password are required", 400));
        }
        // Validate role (if provided)
        const validRoles = ["Admin", "User"];
        if (role && !validRoles.includes(role)) {
            return next(new AppError_1.AppError("Invalid role provided", 400));
        }
        // Check if the email is already in use
        const existingUser = await prisma.users.findUnique({
            where: { email },
        });
        if (existingUser) {
            return next(new AppError_1.AppError("Email is already in use", 400));
        }
        // Ensure role has a default value
        const userRole = role || "User";
        // Getting Hashed Password
        const hashedPassword = await (0, bcrypt_1.hashPassword)(password);
        // Create the new user
        const newUser = await prisma.users.create({
            data: {
                firstname,
                lastname,
                email,
                password: hashedPassword,
                role: userRole,
            },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        // Respond with success message and user data
        res.status(201).json({
            status: "success",
            message: "User created successfully",
            newUser,
        });
    }
    catch (error) {
        // Handle Prisma errors
        if (error.code === "P2002") {
            return next(new AppError_1.AppError("Duplicate field value: email already exists", 400));
        }
        // Pass other errors to the global error handler
        next(new AppError_1.AppError("Internal server error", 500));
    }
    finally {
        // Disconnect Prisma client
        await prisma.$disconnect();
    }
};
exports.AddUser = AddUser;
const EditUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { firstname, lastname, email, role } = req.body;
        const validRoles = ["Admin", "User"];
        if (role && !validRoles.includes(role)) {
            return next(new AppError_1.AppError("Invalid role provided", 400));
        }
        const updatedUser = await prisma.users.update({
            where: { id: parseInt(id) },
            data: { firstname, lastname, email, role },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.status(200).json({
            status: "success",
            message: "User updated succesfully",
            updatedUser,
        });
    }
    catch (error) {
        if (error.code === "P2025") {
            return next(new AppError_1.AppError("User not found", 404));
        }
        next(new AppError_1.AppError("Internal server error", 500));
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.EditUser = EditUser;
const DeleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.users.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({
            status: "success",
            message: "User deleted successfully",
        });
    }
    catch (error) {
        if (error.code === "P2025") {
            return next(new AppError_1.AppError("User not found", 404));
        }
        next(new AppError_1.AppError("Internal server error", 500));
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.DeleteUser = DeleteUser;
const LoginUser = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return next(new AppError_1.AppError("Unauthorized access", 401));
        }
        res.status(200).json({
            status: "success",
            message: "User details fetched successfully",
            user, // Send the user details
        });
    }
    catch (error) {
        next(new AppError_1.AppError("Internal server error", 500));
    }
};
exports.LoginUser = LoginUser;
//# sourceMappingURL=UserController.js.map