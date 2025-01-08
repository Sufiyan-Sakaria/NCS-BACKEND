import express from "express";
import {
  CreateAccount,
  DeleteAccount,
  GetAllAccounts,
  GetSingleAccount,
  UpdateAccount,
} from "../controllers/AccountsController";

const router = express.Router();

router.post("/add", CreateAccount);

router.get("/all", GetAllAccounts);

router.get("/:id", GetSingleAccount);

router.patch("/update/:id", UpdateAccount);

router.delete("/:id", DeleteAccount);

export default router;
