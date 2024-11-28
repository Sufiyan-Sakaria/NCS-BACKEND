"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../utils/AppError");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError_1.AppError("Authentication token is missing or invalid", 401);
        }
        const token = authHeader.split(" ")[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded || !decoded.userId) {
            throw new AppError_1.AppError("Invalid token payload", 401);
        }
        const user = await prisma.users.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                role: true,
            },
        });
        if (!user) {
            throw new AppError_1.AppError("User not found", 404);
        }
        req.user = user;
        next();
    }
    catch (error) {
        next(error instanceof AppError_1.AppError ? error : new AppError_1.AppError("Unauthorized", 401));
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=Authentication.js.map