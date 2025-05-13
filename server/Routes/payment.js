const express = require("express");
const router = express.Router();
const paymentController = require("../Controllers/payment"); // นำเข้า Controller สำหรับการจัดการการชำระเงิน
const { authMiddleware } = require("../Middleware/auth"); // สมมติว่ามีการยืนยันตัวตน

router.post(
  "/payment/process",
  authMiddleware,
  paymentController.processPayment
);

module.exports = router;
