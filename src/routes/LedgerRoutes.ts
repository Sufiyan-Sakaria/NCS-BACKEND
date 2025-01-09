import express from "express";
import {
  CreateLedgerEntry,
  DeleteLedgerEntry,
  GetAllLedgers,
  GetSingleLedger,
} from "../controllers/LedgerController";

const router = express.Router();

router.post("/add", CreateLedgerEntry);

router.get("/all", GetAllLedgers);

router.get("/:id", GetSingleLedger);

router.delete("/:id", DeleteLedgerEntry);

export default router;
