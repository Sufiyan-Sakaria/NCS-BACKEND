"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = require("./AppError");
// Get the JWT secret key from environment variables
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "asnkdaudnjncibwbfjc%473183427kaADYQWGE&@d783s"; // Replace "your-secret-key" with a secure fallback for local dev
// Function to generate a JWT token
const generateToken = (userId, email, role) => {
    try {
        const payload = { userId, email, role }; // Payload for the token
        const options = { expiresIn: "30d" }; // Token expires in 30 days
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET_KEY, options); // Generate the token
        return token;
    }
    catch (error) {
        throw new AppError_1.AppError("Error generating token", 500); // Throw structured error
    }
};
exports.generateToken = generateToken;
// Function to verify a JWT token
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET_KEY); // Verifies the token using the secret key
        return decoded; // Return decoded token payload
    }
    catch (error) {
        throw new AppError_1.AppError("Invalid or expired token", 401); // Handle invalid token error
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map