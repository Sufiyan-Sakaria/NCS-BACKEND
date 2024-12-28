import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";

// Fetch all brands
export const GetAllBrands = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const brands = await prisma.brands.findMany();
    if (!brands.length) {
      return next(new AppError("No brands found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Brands fetched successfully",
      brands,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Fetch single brand by id
export const GetSingleBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const brand = await prisma.brands.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!brand) {
      return next(new AppError("Brand not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Brand fetched successfully",
      brand,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Create a new brand
export const CreateBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return next(new AppError("Brand name is required", 400));
    }

    const newBrand = await prisma.brands.create({
      data: { name, description },
    });

    res.status(201).json({
      status: "success",
      message: "Brand created successfully",
      brand: newBrand,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Update an existing brand
export const UpdateBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name && !description) {
      return next(
        new AppError("At least one of name or description is required", 400)
      );
    }

    const updatedBrand = await prisma.brands.update({
      where: { id: Number(id) },
      data: { ...(name && { name }), ...(description && { description }) },
    });

    res.status(200).json({
      status: "success",
      message: "Brand updated successfully",
      brand: updatedBrand,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return next(new AppError("Brand not found", 404));
    }
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Delete a brand
export const DeleteBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.brands.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      status: "success",
      message: "Brand deleted successfully",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return next(new AppError("Brand not found", 404));
    }
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};
