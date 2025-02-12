import { Response, NextFunction, Request } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Extend the Request interface
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication token is missing or invalid", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      throw new AppError("Invalid token payload", 401);
    }

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    req.user = user; // Attach user to the request

    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Unauthorized", 401));
  }
};
