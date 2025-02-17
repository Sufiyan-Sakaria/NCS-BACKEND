import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";
import { VoucherType, TransactionType } from "@prisma/client";

// Fetch all Vouchers
export const GetAllVouchers = async (
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
      vouchers,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Fetch single Voucher by id
export const GetSingleVoucher = async (
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

    if (!voucher) return next(new AppError("Voucher not found", 404));

    res.status(200).json({
      status: "success",
      message: "Voucher fetched successfully",
      voucher,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Create Voucher
export const CreateVoucher = async (
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
      date,
    } = req.body;

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

    // Generate voucher number based on type
    const lastVoucher = await prisma.voucher.findFirst({
      where: { voucherType },
      orderBy: { voucherNo: "desc" },
    });
    const voucherNo = lastVoucher ? lastVoucher.voucherNo + 1 : 1;

    // Create the ledger entries
    const newLedgerEntries = await Promise.all(
      ledgerEntries.map(async (entry: any) => {
        const account = await prisma.account.findUnique({
          where: { id: entry.accountId },
        });
        return {
          accountId: entry.accountId,
          transactionType: entry.transactionType,
          amount: entry.amount,
          description: entry.description,
          previousBalance: account ? account.currentBalance : 0,
          date,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      })
    );

    // Add the voucher account entry to the ledger entries
    const voucherAccount = await prisma.account.findUnique({
      where: { id: voucherAccId },
    });

    const voucherPreviousBalance = voucherAccount
      ? voucherAccount.currentBalance
      : 0;

    // Set transaction type based on voucher type
    const voucherEntryTransactionType =
      voucherType === "RECEIPT" ? "DEBIT" : "CREDIT";

    newLedgerEntries.push({
      accountId: voucherAccId,
      transactionType: voucherEntryTransactionType,
      amount: totalAmount,
      description: `Voucher account entry for ${voucherType}`,
      previousBalance: voucherPreviousBalance,
      date,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create the voucher with ledger entries
    const newVoucher = await prisma.voucher.create({
      data: {
        voucherType,
        voucherNo,
        description,
        totalAmount,
        voucherAccId,
        date,
        ledgerEntries: {
          create: newLedgerEntries,
        },
      },
      include: { ledgerEntries: true },
    });

    // Update balances based on voucher type
    if (voucherType === "RECEIPT") {
      for (const entry of ledgerEntries) {
        await prisma.account.update({
          where: { id: entry.accountId },
          data: { currentBalance: { decrement: entry.amount } },
        });
      }
      await prisma.account.update({
        where: { id: voucherAccId },
        data: { currentBalance: { increment: totalAmount } },
      });
    } else {
      // PAYMENT (CREDIT)
      for (const entry of ledgerEntries) {
        await prisma.account.update({
          where: { id: entry.accountId },
          data: { currentBalance: { increment: entry.amount } },
        });
      }
      await prisma.account.update({
        where: { id: voucherAccId },
        data: { currentBalance: { decrement: totalAmount } },
      });
    }

    res.status(201).json({
      status: "success",
      message: "Voucher created successfully",
      voucher: newVoucher,
    });
  } catch (error) {
    console.error("Error creating voucher:", error);
    next(new AppError("Internal server error" + error, 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Update a Voucher (PATCH)
export const UpdateVoucher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { voucherType, description, ledgerEntries } = req.body;

    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) return next(new AppError("Voucher not found", 404));

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
      voucher: updatedVoucher,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Delete a Voucher
export const DeleteVoucher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.voucher.delete({
      where: { id },
    });

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
export const GetVoucherNo = async (
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

    // Cast the string to the Prisma Enum Type
    const parsedVoucherType = voucherType as VoucherType;

    const lastVoucher = await prisma.voucher.findFirst({
      where: { voucherType: parsedVoucherType },
      orderBy: { voucherNo: "desc" },
    });

    const voucherNo = lastVoucher ? lastVoucher.voucherNo + 1 : 1;

    res.status(200).json({
      status: "success",
      voucherNo,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};
