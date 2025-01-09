import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";

// Fetch all Accounts
export const GetAllAccounts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const Accounts = await prisma.account.findMany();
    if (!Accounts.length) {
      return next(new AppError("No Accounts found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Accounts fetched successfully",
      Accounts,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Fetch single Account by id
export const GetSingleAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const Account = await prisma.account.findUnique({
      where: { id: req.params.id },
    });
    if (!Account) {
      return next(new AppError("Account not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Account fetched successfully",
      Account,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Create a new Account
export const CreateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, groupId, accountType, openingBalance } = req.body;

    // Find the parent group
    const parentGroup = await prisma.accountGroup.findUnique({
      where: { id: groupId },
    });
    if (!parentGroup) return next(new AppError("Account group not found", 404));

    // Find the max sibling code under the group
    const siblingAccounts = await prisma.account.findMany({
      where: { groupId },
    });
    const siblingCodes = siblingAccounts.map((s) =>
      parseFloat(s.code.split(".").pop() || "0")
    );
    const maxSiblingCode = Math.max(0, ...siblingCodes);

    const code = `${parentGroup.code}.${maxSiblingCode + 1}`;

    const newAccount = await prisma.account.create({
      data: { name, groupId, accountType, openingBalance, code },
    });

    res.status(201).json({ status: "success", account: newAccount });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  }
};

// Update an existing Account
export const UpdateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, groupId, accountType, currentBalance } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid account ID format" });
    }

    // Check if the account exists
    const existingAccount = await prisma.account.findUnique({ where: { id } });
    if (!existingAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (!name || !groupId || !accountType || !currentBalance) {
      return next(
        new AppError(
          "At least one of name, group, type or balance is required",
          400
        )
      );
    }
    const updatedAccount = await prisma.account.update({
      where: { id },
      data: {
        name: name ?? existingAccount.name,
        groupId: groupId ?? existingAccount.groupId,
        accountType: accountType ?? existingAccount.accountType,
        currentBalance: currentBalance ?? existingAccount.currentBalance,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Account updated successfully",
      Account: updatedAccount,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return next(new AppError("Account not found", 404));
    }
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Delete a Account
export const DeleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.account.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      message: "Account deleted successfully",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return next(new AppError("Account not found", 404));
    }
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};
