"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserUpdate = exports.validateUserID = void 0;
const AppError_1 = require("../utils/AppError");
const validateUserID = (req, res, next) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        return next(new AppError_1.AppError("Invalid user ID", 400));
    }
    next();
};
exports.validateUserID = validateUserID;
const validateUserUpdate = (req, res, next) => {
    const { firstname, lastname, email, role } = req.body;
    if (!firstname && !lastname && !email && !role) {
        return next(new AppError_1.AppError("At least one field is required to update", 400));
    }
    next();
};
exports.validateUserUpdate = validateUserUpdate;
//# sourceMappingURL=validators.js.map