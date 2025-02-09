import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";

// Function to generate the next account group code
const getNextGroupCode = async (parentId: string | null) => {
  if (!parentId) {
    const lastTopLevelGroup = await prisma.accountGroup.findFirst({
      where: { parentId: null },
      orderBy: { code: "desc" },
    });
    return lastTopLevelGroup ? `${parseInt(lastTopLevelGroup.code) + 1}` : "1";
  }

  const parentGroup = await prisma.accountGroup.findUnique({
    where: { id: parentId },
  });
  if (!parentGroup) throw new Error("Parent group not found");

  const lastChild = await prisma.accountGroup.findFirst({
    where: { parentId },
    orderBy: { code: "desc" },
  });

  const nextNumber = lastChild
    ? parseInt(lastChild.code.split(".").pop()!) + 1
    : 1;
  return `${parentGroup.code}.${nextNumber}`;
};

// Create Account Group
export const CreateAccountGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, parentId, description, type } = req.body;

    if (!name || !type) {
      return next(new AppError("Name and type are required fields", 400));
    }

    const code = await getNextGroupCode(parentId);

    const newGroup = await prisma.accountGroup.create({
      data: {
        name,
        parentId,
        description,
        type,
        code,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Account group created successfully",
      data: newGroup,
    });
  } catch (error) {
    console.error("Error creating account group:", error);
    next(new AppError("Internal server error", 500));
  }
};

// Function to generate the next account code
const getNextAccountCode = async (groupId: string) => {
  const group = await prisma.accountGroup.findUnique({
    where: { id: groupId },
  });
  if (!group) throw new Error("Account group not found");

  const lastAccount = await prisma.account.findFirst({
    where: { groupId },
    orderBy: { code: "desc" },
  });

  const nextNumber = lastAccount
    ? parseInt(lastAccount.code.split(".").pop()!) + 1
    : 1;
  return `${group.code}.${nextNumber}`;
};

// Create Account
export const CreateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, groupId, accountType, openingBalance } = req.body;

    if (!name || !groupId || !accountType) {
      return next(new AppError("Missing required fields", 400));
    }

    const code = await getNextAccountCode(groupId);

    const newAccount = await prisma.account.create({
      data: {
        name,
        code,
        groupId,
        accountType,
        openingBalance: openingBalance || 0,
        currentBalance: openingBalance || 0,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Account created successfully",
      data: newAccount,
    });
  } catch (error) {
    console.error("Error creating account:", error);
    next(new AppError("Internal server error", 500));
  }
};

// Get Accounts Hierarchy
export const GetAccountsHierarchy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accountGroups = await prisma.accountGroup.findMany({
      include: {
        accounts: true,
        children: true,
      },
    });

    if (!accountGroups.length) {
      return next(new AppError("No Account Groups found", 404));
    }

    const buildHierarchy = (
      groups: any[],
      parentId: string | null = null
    ): any[] => {
      return groups
        .filter((group) => group.parentId === parentId)
        .map((group) => ({
          id: group.id,
          name: group.name,
          code: group.code,
          groupId: group.parentId,
          accountType: group.type,
          currentBalance: group.balance,
          children: [
            ...buildHierarchy(groups, group.id),
            ...group.accounts.map((account: any) => ({
              id: account.id,
              name: account.name,
              currentBalance: account.currentBalance,
              code: account.code,
              accountType: account.accountType,
              children: [],
            })),
          ],
        }));
    };

    const hierarchicalData = buildHierarchy(accountGroups);

    res.status(200).json({
      status: "success",
      message: "Accounts Hierarchy fetched successfully",
      data: hierarchicalData,
    });
  } catch (error) {
    console.error("Error fetching account hierarchy:", error);
    next(new AppError("Internal server error", 500));
  }
};

// Update Account Group
export const UpdateAccountGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedGroup = await prisma.accountGroup.update({
      where: { id },
      data: updates,
    });

    res.status(200).json({
      status: "success",
      message: "Account group updated successfully",
      data: updatedGroup,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  }
};

// Update Account
export const UpdateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedAccount = await prisma.account.update({
      where: { id },
      data: updates,
    });

    res.status(200).json({
      status: "success",
      message: "Account updated successfully",
      data: updatedAccount,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  }
};

// Delete Account Group
export const DeleteAccountGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await prisma.accountGroup.delete({ where: { id } });
    res.status(200).json({
      status: "success",
      message: "Account group deleted successfully",
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  }
};

// Delete Account
export const DeleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await prisma.account.delete({ where: { id } });
    res
      .status(200)
      .json({ status: "success", message: "Account deleted successfully" });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  }
};
