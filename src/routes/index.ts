import { Router } from "express";
import UserRoutes from "./UserRoutes";
import AuthRoutes from "./AuthRoutes";
import CategoryRoutes from "./CategoryRoutes";
import BrandRoutes from "./BrandRoutes";
import AccountGroupRoutes from "./AccountGroupRoutes";
import AccountRoutes from "./AccountsRoutes";
import VoucherRoutes from "./VoucherRoutes";
import LedgerRoutes from "./LedgerRoutes";
import { authenticate } from "../middlewares/Authenticate";

const router = Router();

// Auth Routes
router.use("/auth", AuthRoutes);

// User Routes
router.use("/users", authenticate, UserRoutes);

// Category Routes
router.use("/categories", authenticate, CategoryRoutes);

// Brand Routes
router.use("/brands", authenticate, BrandRoutes);

// Account Group Routes
router.use("/account-group", authenticate, AccountGroupRoutes);

// Account Routes
router.use("/account", authenticate, AccountRoutes);

// Voucher Routes
router.use("/voucher", authenticate, VoucherRoutes);

// Ledger Routes
router.use("/ledger", authenticate, LedgerRoutes);

export default router;
