"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const AppError_1 = require("./AppError"); // Import your AppError class
// Function to hash a password
const hashPassword = async (password) => {
    try {
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        return hashedPassword;
    }
    catch (error) {
        // Throw a custom AppError with a message and status code (e.g., 500 for internal error)
        throw new AppError_1.AppError("Error hashing password", 500);
    }
};
exports.hashPassword = hashPassword;
// Function to compare the plain password with the hashed password
const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt_1.default.compare(password, hashedPassword);
    }
    catch (error) {
        // Throw a custom AppError with a message and status code (e.g., 500 for internal error)
        throw new AppError_1.AppError("Error comparing passwords", 500);
    }
};
exports.comparePassword = comparePassword;
//# sourceMappingURL=bcrypt.js.map