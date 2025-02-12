import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { hashPassword } from "../utils/bcrypt";
import prisma from "../config/prisma";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

// Get all users
export const GetAllUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!users.length) {
      return next(new AppError("No users found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Users fetched succesfully",
      users,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

export const GetSingleUserByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await prisma.users.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return next(new AppError("User does not exist", 404));
    }

    res.status(200).json({
      status: "success",
      message: "User fetched succesfully",
      user,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

export const AddUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return next(
        new AppError("Username, email, and password are required", 400)
      );
    }

    // Validate role (if provided)
    const validRoles = ["Admin", "User"];
    if (role && !validRoles.includes(role)) {
      return next(new AppError("Invalid role provided", 400));
    }

    // Check if the email is already in use
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      return next(new AppError("Email is already in use", 400));
    }

    // Ensure role has a default value
    const userRole = role || "User";

    // Getting Hashed Password
    const hashedPassword = await hashPassword(password);

    // Create the new user
    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: userRole,
      },
      select: {
        id: true,
        username: true,
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
  } catch (error: any) {
    // Handle Prisma errors
    if (error.code === "P2002") {
      return next(
        new AppError("Duplicate field value: email already exists", 400)
      );
    }
    // Pass other errors to the global error handler
    next(new AppError("Internal server error", 500));
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
};

export const EditUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    const validRoles = ["Admin", "User"];
    if (role && !validRoles.includes(role)) {
      return next(new AppError("Invalid role provided", 400));
    }

    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: { username, email, role },
      select: {
        id: true,
        username: true,
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
  } catch (error: any) {
    if (error.code === "P2025") {
      return next(new AppError("User not found", 404));
    }
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

export const DeleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.users.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return next(new AppError("User not found", 404));
    }
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

export const LoginUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      return next(new AppError("Unauthorized access", 401));
    }

    res.status(200).json({
      status: "success",
      message: "User details fetched successfully",
      user,
    });
  } catch (error: any) {
    next(new AppError("Internal server error", 500));
  }
};
