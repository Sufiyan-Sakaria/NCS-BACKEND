"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const isProduction = process.env.NODE_ENV === "production";
// Global error handler middleware
const globalErrorHandler = (err, req, res, next) => {
    // Set default status code and message
    const status = err.status || "Error";
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    // Log error stack in development mode
    if (!isProduction) {
        console.error("Error 🔥:", err.message);
    }
    // Response object
    res.status(statusCode).json({
        status,
        message,
        ...(isProduction ? {} : { stack: err.stack }),
    });
};
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map