import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";
import { VoucherType } from "@prisma/client";

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

// Create a new Voucher
export const CreateVoucher = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { voucherType, description, ledgerEntries } = req.body;

    if (
      !voucherType ||
      !ledgerEntries ||
      !Array.isArray(ledgerEntries) ||
      ledgerEntries.length === 0
    ) {
      return next(
        new AppError("VoucherType and LedgerEntries are required", 400)
      );
    }

    // Generate voucher number based on type
    const lastVoucher = await prisma.voucher.findFirst({
      where: { voucherType },
      orderBy: { voucherNo: "desc" },
    });
    const voucherNo = lastVoucher ? lastVoucher.voucherNo + 1 : 1;

    const newVoucher = await prisma.voucher.create({
      data: {
        voucherType,
        voucherNo,
        description,
        ledgerEntries: {
          create: ledgerEntries,
        },
      },
      include: { ledgerEntries: true },
    });

    res.status(201).json({
      status: "success",
      message: "Voucher created successfully",
      voucher: newVoucher,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
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
    const { voucherType, description } = req.body;

    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) return next(new AppError("Voucher not found", 404));

    const updatedVoucher = await prisma.voucher.update({
      where: { id },
      data: {
        voucherType: voucherType ?? voucher.voucherType,
        description: description ?? voucher.description,
      },
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

export const GetVoucherNo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { voucherType } = req.query;

    if (!VoucherType || typeof voucherType !== "string") {
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
