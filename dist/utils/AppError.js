"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    status;
    isOperational;
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        // Set status based on statusCode
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        // Preserve the prototype chain
        Object.setPrototypeOf(this, new.target.prototype);
        // Only capture stack trace for operational errors
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.AppError = AppError;
//# sourceMappingURL=AppError.js.map