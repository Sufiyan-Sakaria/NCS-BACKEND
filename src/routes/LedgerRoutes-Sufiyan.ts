import express from "express";
import {
  createLedgerEntry,
  deleteLedgerEntry,
  getAllLedgers,
  getSingleLedger,
  getLedgerEntriesByAccountAndDateRange,
} from "../controllers/LedgerController";

const router = express.Router();

// Create a new Ledger entry
router.post("/add", createLedgerEntry);

// Fetch all Ledger entries
router.get("/all", getAllLedgers);

// Fetch ledger entries for a single account within a date range
router.get("/account-entries", getLedgerEntriesByAccountAndDateRange);

// Fetch a single Ledger entry by ID
router.get("/:id", getSingleLedger);

// Delete a Ledger entry by ID
router.delete("/:id", deleteLedgerEntry);

export default router;
