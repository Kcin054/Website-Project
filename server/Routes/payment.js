const express = require("express");
const router = express.Router();
const paymentController = require("../Controllers/payment");
const { auth, authMiddleware } = require("../Middleware/auth");
const { uploadSlip } = require("../Middleware/uploadSlip");
const { confirmPayment } = require("../Controllers/user");

router.post(
  "/payment/process",
  authMiddleware,
  paymentController.processPayment
);
router.post(
  "/user/confirm-payment",
  auth,
  uploadSlip.single("slip"),
  confirmPayment
);

module.exports = router;
