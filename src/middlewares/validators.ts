import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const validateUserID = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) {
    return next(new AppError("Invalid user ID", 400));
  }
  next();
};

export const validateUserUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { firstname, lastname, email, role } = req.body;
  if (!firstname && !lastname && !email && !role) {
    return next(new AppError("At least one field is required to update", 400));
  }
  next();
};
