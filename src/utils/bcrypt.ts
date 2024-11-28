import bcrypt from "bcrypt";
import { AppError } from "./AppError"; // Import your AppError class

// Function to hash a password
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    // Throw a custom AppError with a message and status code (e.g., 500 for internal error)
    throw new AppError("Error hashing password", 500);
  }
};

// Function to compare the plain password with the hashed password
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    // Throw a custom AppError with a message and status code (e.g., 500 for internal error)
    throw new AppError("Error comparing passwords", 500);
  }
};
