import express from "express";
import {
  CreateAccountGroup,
  CreateAccountGroupsBulk,
  DeleteAccountGroup,
  GetAllAccountGroups,
  GetSingleAccountGroup,
  UpdateAccountGroup,
} from "../controllers/AccountGroupController";

const router = express.Router();

router.post("/add", CreateAccountGroup);

router.post("/add/bulk",CreateAccountGroupsBulk)

router.get("/all", GetAllAccountGroups);

router.get("/:id", GetSingleAccountGroup);

router.patch("/update/:id", UpdateAccountGroup);

router.delete("/:id", DeleteAccountGroup);

export default router;
