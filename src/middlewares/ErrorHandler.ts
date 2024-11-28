import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

const isProduction = process.env.NODE_ENV === "production";

// Global error handler middleware
export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default status code and message
  const status = err.status || "Error";
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error stack in development mode
  if (!isProduction) {
    console.error("Error 🔥:", err.message);
  }

  // Response object
  res.status(statusCode).json({
    status,
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
