import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";

// Fetch all Ledger entries
export const GetAllLedgers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ledgers = await prisma.ledger.findMany({
      include: { account: true, voucher: true },
    });

    res.status(200).json({
      status: "success",
      message: "Ledger entries fetched successfully",
      ledgers,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Fetch single Ledger by id
export const GetSingleLedger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const ledger = await prisma.ledger.findUnique({
      where: { id },
      include: { account: true, voucher: true },
    });

    if (!ledger) return next(new AppError("Ledger entry not found", 404));

    res.status(200).json({
      status: "success",
      message: "Ledger entry fetched successfully",
      ledger,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Create a new Ledger entry
export const CreateLedgerEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accountId, voucherId, transactionType, amount, description } =
      req.body;

    if (!accountId || !voucherId || !transactionType || !amount) {
      return next(new AppError("All fields are required", 400));
    }

    const newLedger = await prisma.ledger.create({
      data: {
        accountId,
        voucherId,
        transactionType,
        amount,
        description,
      },
    });

    // Update account balance
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });
    if (account) {
      const updatedBalance =
        transactionType === "CREDIT"
          ? account.currentBalance + amount
          : account.currentBalance - amount;

      await prisma.account.update({
        where: { id: accountId },
        data: { currentBalance: updatedBalance },
      });
    }

    res.status(201).json({
      status: "success",
      message: "Ledger entry created successfully",
      ledger: newLedger,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Delete a Ledger entry
export const DeleteLedgerEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const ledger = await prisma.ledger.findUnique({ where: { id } });
    if (!ledger) return next(new AppError("Ledger entry not found", 404));

    // Update account balance before deleting
    const account = await prisma.account.findUnique({
      where: { id: ledger.accountId },
    });
    if (account) {
      const updatedBalance =
        ledger.transactionType === "CREDIT"
          ? account.currentBalance - ledger.amount
          : account.currentBalance + ledger.amount;

      await prisma.account.update({
        where: { id: ledger.accountId },
        data: { currentBalance: updatedBalance },
      });
    }

    await prisma.ledger.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      message: "Ledger entry deleted successfully",
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};
