"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const router = (0, express_1.Router)();
// Login route
router.post("/login", AuthController_1.Login);
exports.default = router;
//# sourceMappingURL=AuthRoutes.js.map