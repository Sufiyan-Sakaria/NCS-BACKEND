"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ErrorHandler_1 = require("./middlewares/ErrorHandler"); // Make sure this import matches your actual export
const index_1 = __importDefault(require("./routes/index"));
const AppError_1 = require("./utils/AppError");
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const Port = process.env.APP_PORT || 3000;
app.use((0, cors_1.default)());
// Middleware to parse JSON
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Welcome TO NCS Server");
});
// Use the routes from the index.ts router
app.use("/api/v1", index_1.default);
// Catch-all for unhandled routes (404)
app.use((req, res, next) => {
    next(new AppError_1.AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});
// Global error handler middleware
app.use(ErrorHandler_1.globalErrorHandler);
app.listen(Port, () => {
    console.log(`Server is running on port : ${Port}`);
});
//# sourceMappingURL=server.js.map