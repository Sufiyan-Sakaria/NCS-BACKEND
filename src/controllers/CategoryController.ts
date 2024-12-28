import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import { AppError } from "../utils/AppError";

// Fetch all categories
export const GetAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await prisma.categories.findMany();
    if (!categories.length) {
      return next(new AppError("No categories found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Fetch single category by id
export const GetSingleCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await prisma.categories.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!category) {
      return next(new AppError("Category not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Category fetched successfully",
      category,
    });
  } catch (error) {
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Create a new category
export const CreateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return next(new AppError("Category name is required", 400));
    }

    const newCategory = await prisma.categories.create({
      data: { name, description },
    });

    res.status(201).json({
      status: "success",
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    next(new AppError("Internal server error : " + error, 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Update an existing category
export const UpdateCategory = async (
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

    const updatedCategory = await prisma.categories.update({
      where: { id: Number(id) },
      data: { ...(name && { name }), ...(description && { description }) },
    });

    res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return next(new AppError("Category not found", 404));
    }
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};

// Delete a category
export const DeleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.categories.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return next(new AppError("Category not found", 404));
    }
    next(new AppError("Internal server error", 500));
  } finally {
    await prisma.$disconnect();
  }
};
