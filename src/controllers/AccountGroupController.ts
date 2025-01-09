import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";

export const GetAllAccountGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accountGroups = await prisma.accountGroup.findMany();
    if (!accountGroups.length) {
      return next(new AppError("No Account Groups found", 404));
    }
    res.status(200).json({
      status: "success",
      message: "Accounts Groups fetched successfully",
      accountGroups,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  }
};

export const GetSingleAccountGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accountGroup = await prisma.accountGroup.findUnique({
      where: { id: req.params.id },
    });
    if (!accountGroup) {
      return next(new AppError("Account Group not found", 404));
    }
    res.status(200).json({
      status: "success",
      message: "Accounts Group fetched successfully",
      accountGroup,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  }
};

export const CreateAccountGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, parentId, description, type } = req.body;

    // Generate code based on parentId
    let code;
    if (parentId) {
      const parentGroup = await prisma.accountGroup.findUnique({
        where: { id: parentId },
      });
      if (!parentGroup)
        return next(new AppError("Parent group not found", 404));

      // Find the max sibling code under the parent
      const siblings = await prisma.accountGroup.findMany({
        where: { parentId },
      });
      const siblingCodes = siblings.map((s) =>
        parseFloat(s.code.split(".").pop() || "0")
      );
      const maxSiblingCode = Math.max(0, ...siblingCodes);

      code = `${parentGroup.code}.${maxSiblingCode + 1}`;
    } else {
      // Root group: Find max code among all root groups
      const rootGroups = await prisma.accountGroup.findMany({
        where: { parentId: null },
      });
      const rootCodes = rootGroups.map((r) => parseFloat(r.code));
      const maxRootCode = Math.max(0, ...rootCodes);

      code = `${maxRootCode + 1}`;
    }

    const newAccountGroup = await prisma.accountGroup.create({
      data: { name, parentId, description, type, code },
    });

    res.status(201).json({ status: "success", accountGroup: newAccountGroup });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  }
};

export const UpdateAccountGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedAccountGroup = await prisma.accountGroup.update({
      where: { id },
      data: updates,
    });
    res.status(200).json({
      status: "success",
      message: "Account Group updated successfully",
      accountGroup: updatedAccountGroup,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  }
};

export const DeleteAccountGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await prisma.accountGroup.delete({ where: { id: req.params.id } });
    res.status(200).json({
      status: "success",
      message: "Account Group deleted successfully",
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  }
};
