import express from "express";
import {
  createVoucher,
  deleteVoucher,
  getAllVouchers,
  getSingleVoucher,
  getVoucherNo,
  updateVoucher,
} from "../controllers/VoucherController";

const router = express.Router();

router.post("/add", createVoucher);
router.get("/all", getAllVouchers);
router.get("/voucher-no", getVoucherNo);
router.get("/:id", getSingleVoucher);
router.patch("/update/:id", updateVoucher);
router.delete("/:id", deleteVoucher);

export default router;
