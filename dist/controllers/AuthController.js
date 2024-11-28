"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../utils/AppError");
const bcrypt_1 = require("../utils/bcrypt");
const jwt_1 = require("../utils/jwt");
const prisma = new client_1.PrismaClient();
const Login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            throw new AppError_1.AppError("Email and password are required", 400);
        }
        // Find user in the database
        const user = await prisma.users.findUnique({
            where: { email },
        });
        // Check if user exists
        if (!user) {
            throw new AppError_1.AppError("Invalid email or password", 401);
        }
        // Verify the password
        const isPasswordValid = await (0, bcrypt_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            throw new AppError_1.AppError("Invalid email or password", 401);
        }
        // Generate a JWT token
        const token = (0, jwt_1.generateToken)(user.id, user.email, user.role);
        // Send response
        res.status(200).json({
            status: "success",
            message: "Login successful",
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
            },
            token,
        });
    }
    catch (error) {
        next(error instanceof AppError_1.AppError ? error : new AppError_1.AppError("Login failed", 500));
    }
};
exports.Login = Login;
//# sourceMappingURL=AuthController.js.map