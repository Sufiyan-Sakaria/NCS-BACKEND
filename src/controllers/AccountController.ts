import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";
import { AccountType } from "@prisma/client";

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

// Fetch all Accounts
export const GetAllAccounts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { code: "asc" },
    });
    res.status(200).json({
      status: "success",
      message: "Accounts fetched successfully",
      accounts,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

//Fetch Accounts By Type
export const GetAccountsByType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accountType } = req.query;

    if (!AccountType || typeof accountType !== "string") {
      return next(
        new AppError(
          "Account type is required and must be a valid enum value",
          400
        )
      );
    }

    // Cast the string to the Prisma Enum Type
    const parsedAccountType = accountType as AccountType;

    const Accounts = await prisma.account.findMany({
      where: { accountType: parsedAccountType },
    });

    res.status(200).json({
      status: "success",
      Accounts,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
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

    // Check if an account with the same name already exists
    const existingAccount = await prisma.account.findUnique({
      where: { name },
    });

    if (existingAccount) {
      return next(
        new AppError("An account with this name already exists", 400)
      );
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

    console.log("New Account Created:", newAccount);

    let transactionType: string;

    if (newAccount.openingBalance > 0) {
      transactionType = "DEBIT";
    } else if (newAccount.openingBalance < 0) {
      transactionType = "CREDIT";
    } else {
      transactionType = "NONE"; // Handle zero balance case
    }

    // Create the ledger entry without a voucherId
    const ledgerEntry = await prisma.ledger.create({
      data: {
        date: new Date(),
        accountId: newAccount.id,
        transactionType,
        amount: newAccount.openingBalance,
        description: "Opening Balance",
      },
    });

    console.log("Ledger Entry Created:", ledgerEntry);

    res.status(201).json({
      status: "success",
      message: "Account created successfully",
      data: newAccount,
    });
  } catch (error) {
    console.error("Error creating account or ledger:", error);
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
      orderBy: { code: "asc" },
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
