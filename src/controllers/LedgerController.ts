import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";
import { TransactionType } from "@prisma/client";

// Fetch all Ledger entries
export const getAllLedgers = async (
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
      data: { ledgers },
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Fetch single Ledger by id
export const getSingleLedger = async (
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

    if (!ledger) {
      return next(new AppError("Ledger entry not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Ledger entry fetched successfully",
      data: { ledger },
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Create a new Ledger entry
export const createLedgerEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date, accountId, voucherId, transactionType, amount, description } =
      req.body;

    if (!accountId || !voucherId || !transactionType || !amount) {
      return next(new AppError("All fields are required", 400));
    }

    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return next(new AppError("Account not found", 404));
    }

    const voucher = await prisma.voucher.findUnique({
      where: { id: voucherId },
    });

    if (!voucher) {
      return next(new AppError("Voucher not found", 404));
    }

    const newLedger = await prisma.ledger.create({
      data: {
        date,
        accountId,
        voucherId,
        transactionType,
        amount,
        description,
        previousBalance: account.currentBalance,
      },
    });

    const updatedBalance =
      transactionType === TransactionType.CREDIT
        ? account.currentBalance + amount
        : account.currentBalance - amount;

    await prisma.account.update({
      where: { id: accountId },
      data: { currentBalance: updatedBalance },
    });

    res.status(201).json({
      status: "success",
      message: "Ledger entry created successfully",
      data: { ledger: newLedger },
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Delete a Ledger entry
export const deleteLedgerEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const ledger = await prisma.ledger.findUnique({ where: { id } });
    if (!ledger) {
      return next(new AppError("Ledger entry not found", 404));
    }

    const account = await prisma.account.findUnique({
      where: { id: ledger.accountId },
    });

    if (account) {
      const updatedBalance =
        ledger.transactionType === TransactionType.CREDIT
          ? account.currentBalance - ledger.amount
          : account.currentBalance + ledger.amount;

      await prisma.account.update({
        where: { id: ledger.accountId },
        data: { currentBalance: updatedBalance },
      });
    }

    await prisma.ledger.delete({ where: { id } });

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
