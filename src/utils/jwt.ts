import jwt from "jsonwebtoken";
import { AppError } from "./AppError";

// Get the JWT secret key from environment variables
const JWT_SECRET_KEY =
  process.env.JWT_SECRET_KEY || "asnkdaudnjncibwbfjc%473183427kaADYQWGE&@d783s"; // Replace "your-secret-key" with a secure fallback for local dev

// Function to generate a JWT token
export const generateToken = (
  userId: number,
  email: string,
  role: string
): string => {
  try {
    const payload = { userId, email, role }; // Payload for the token
    const options = { expiresIn: "30d" }; // Token expires in 30 days

    const token = jwt.sign(payload, JWT_SECRET_KEY, options); // Generate the token
    return token;
  } catch (error) {
    throw new AppError("Error generating token", 500); // Throw structured error
  }
};

// Function to verify a JWT token
export const verifyToken = (token: string): any => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY); // Verifies the token using the secret key
    return decoded; // Return decoded token payload
  } catch (error) {
    throw new AppError("Invalid or expired token", 401); // Handle invalid token error
  }
};
