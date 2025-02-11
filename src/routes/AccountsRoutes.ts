import { Router } from "express";
import {
  GetAccountsHierarchy,
  CreateAccountGroup,
  UpdateAccountGroup,
  DeleteAccountGroup,
  CreateAccount,
  UpdateAccount,
  DeleteAccount,
  GetAllAccounts,
  GetAccountsByType,
} from "../controllers/AccountController"; // Adjust path if necessary

const router = Router();

// 🏦 Account Groups Routes
router.get("/groups", GetAccountsHierarchy); // Get hierarchical structure
router.post("/groups", CreateAccountGroup); // Create new account group
router.put("/groups/:id", UpdateAccountGroup); // Update existing account group
router.delete("/groups/:id", DeleteAccountGroup); // Delete account group

// 📊 Accounts Routes
router.get("/accounts", GetAllAccounts);
router.get("/accounts/type", GetAccountsByType);
router.post("/accounts", CreateAccount); // Create new account
router.put("/accounts/:id", UpdateAccount); // Update existing account
router.delete("/accounts/:id", DeleteAccount); // Delete account

export default router;
