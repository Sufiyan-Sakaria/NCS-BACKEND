import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";
import { VoucherType, TransactionType } from "@prisma/client";
import { DateTime } from "luxon";

// Fetch all Vouchers
export const getAllVouchers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vouchers = await prisma.voucher.findMany({
      include: { ledgerEntries: true },
    });

    res.status(200).json({
      status: "success",
      message: "Vouchers fetched successfully",
      data: { vouchers },
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Fetch single Voucher by id
export const getSingleVoucher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const voucher = await prisma.voucher.findUnique({
      where: { id },
      include: { ledgerEntries: true },
    });

    if (!voucher) {
      return next(new AppError("Voucher not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Voucher fetched successfully",
      data: { voucher },
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Create Voucher
export const createVoucher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      voucherType,
      description,
      totalAmount,
      voucherAccId,
      ledgerEntries,
    } = req.body;

    // Validate required fields
    if (
      !voucherType ||
      !ledgerEntries ||
      !Array.isArray(ledgerEntries) ||
      ledgerEntries.length === 0 ||
      !voucherAccId
    ) {
      return next(
        new AppError(
          "VoucherType, VoucherAccId, and LedgerEntries are required",
          400
        )
      );
    }

    // Fetch the last voucher number for the given type
    const lastVoucher = await prisma.voucher.findFirst({
      where: { voucherType },
      orderBy: { voucherNo: "desc" },
    });
    const voucherNo = lastVoucher ? lastVoucher.voucherNo + 1 : 1;

    // Get the current date and time in Asia/Karachi timezone
    const dateInKarachi = DateTime.now().setZone("Asia/Karachi");

    // Create ledger entries for the voucher
    const newLedgerEntries = [];

    for (const entry of ledgerEntries) {
      const account = await prisma.account.findUnique({
        where: { id: entry.accountId },
      });

      if (!account) {
        throw new AppError(`Account with ID ${entry.accountId} not found`, 404);
      }

      // Fetch the current balance of the account
      const currentBalance = account.currentBalance;

      // Create the ledger entry
      newLedgerEntries.push({
        accountId: entry.accountId,
        transactionType: entry.transactionType,
        amount: entry.amount,
        description: entry.description,
        previousBalance: currentBalance, // Use the current balance
        date: dateInKarachi.toJSDate(), // Use the Asia/Karachi date
      });

      // Update the account balance
      const updatedBalance =
        entry.transactionType === TransactionType.CREDIT
          ? currentBalance - entry.amount
          : currentBalance + entry.amount;

      await prisma.account.update({
        where: { id: entry.accountId },
        data: { currentBalance: updatedBalance },
      });
    }

    // Create the voucher with ledger entries
    const newVoucher = await prisma.voucher.create({
      data: {
        voucherType,
        voucherNo,
        description,
        totalAmount,
        date: dateInKarachi.toJSDate(), // Use the Asia/Karachi date
        ledgerEntries: {
          create: newLedgerEntries,
        },
      },
      include: { ledgerEntries: true },
    });

    res.status(201).json({
      status: "success",
      message: "Voucher created successfully",
      data: { voucher: newVoucher },
    });
  } catch (error) {
    console.error("Error creating voucher:", error);
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};
// Update a Voucher (PATCH)
export const updateVoucher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { voucherType, description, ledgerEntries } = req.body;

    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) {
      return next(new AppError("Voucher not found", 404));
    }

    // Delete existing ledger entries and create new ones
    const updatedVoucher = await prisma.voucher.update({
      where: { id },
      data: {
        voucherType: voucherType ?? voucher.voucherType,
        description: description ?? voucher.description,
        ledgerEntries: {
          deleteMany: {}, // Delete existing ledger entries
          create: ledgerEntries.map((entry: any) => ({
            accountId: entry.accountId,
            transactionType: entry.transactionType,
            amount: entry.amount,
            description: entry.description,
          })),
        },
      },
      include: { ledgerEntries: true },
    });

    res.status(200).json({
      status: "success",
      message: "Voucher updated successfully",
      data: { voucher: updatedVoucher },
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Delete a Voucher
export const deleteVoucher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) {
      return next(new AppError("Voucher not found", 404));
    }

    await prisma.voucher.delete({ where: { id } });

    res.status(200).json({
      status: "success",
      message: "Voucher deleted successfully",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return next(new AppError("Voucher not found", 404));
    }
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Fetch next voucher number
export const getVoucherNo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { voucherType } = req.query;

    if (!voucherType || typeof voucherType !== "string") {
      return next(
        new AppError(
          "Voucher type is required and must be a valid enum value",
          400
        )
      );
    }

    const parsedVoucherType = voucherType as VoucherType;

    const lastVoucher = await prisma.voucher.findFirst({
      where: { voucherType: parsedVoucherType },
      orderBy: { voucherNo: "desc" },
    });

    const voucherNo = lastVoucher ? lastVoucher.voucherNo + 1 : 1;

    res.status(200).json({
      status: "success",
      data: { voucherNo },
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};
