import express from "express";
import {
  CreateVoucher,
  DeleteVoucher,
  GetAllVouchers,
  GetSingleVoucher,
  UpdateVoucher,
  GetVoucherNo,
} from "../controllers/VoucherController";

const router = express.Router();

router.post("/add", CreateVoucher);
router.get("/all", GetAllVouchers);
router.get("/voucher-no", GetVoucherNo);
router.get("/:id", GetSingleVoucher);
router.patch("/update/:id", UpdateVoucher);
router.delete("/:id", DeleteVoucher);

export default router;
