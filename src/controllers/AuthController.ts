import { NextFunction, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { CustomRequest } from "../types/UserType";
import { AppError } from "../utils/AppError";
import { comparePassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";

const prisma = new PrismaClient();

export const Login = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    // Find user in the database
    const user = await prisma.users.findUnique({
      where: { email },
    });

    // Check if user exists
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Verify the password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate a JWT token
    const token = generateToken(user.id, user.email, user.role);

    // Send response
    res.status(200).json({
      status: "success",
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Login failed", 500));
  }
};
