import express from "express";
import {
  CreateVoucher,
  DeleteVoucher,
  GetAllVouchers,
  GetSingleVoucher,
  UpdateVoucher,
  GetVoucherNo, // Import the GetVoucherNo function
} from "../controllers/VoucherController";

const router = express.Router();

router.post("/add", CreateVoucher);
router.get("/all", GetAllVouchers);
router.get("/voucher-no", GetVoucherNo); // New route to get the next voucher number
router.get("/:id", GetSingleVoucher);
router.patch("/update/:id", UpdateVoucher);
router.delete("/:id", DeleteVoucher);

export default router;
