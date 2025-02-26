import express from "express";
import { createLedgerEntry, deleteLedgerEntry, getAllLedgers, getSingleLedger } from "../controllers/LedgerController";

const router = express.Router();

router.post("/add", createLedgerEntry);

router.get("/all", getAllLedgers);

router.get("/:id", getSingleLedger);

router.delete("/:id", deleteLedgerEntry);

export default router;
