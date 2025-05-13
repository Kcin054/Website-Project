const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/order");
const { authMiddleware } = require("../Middleware/auth"); // สมมติว่ามีการยืนยันตัวตน

router.post("/orders", authMiddleware, orderController.createOrder);
router.get("/orders/user", authMiddleware, orderController.getUserOrders);
router.get(
  "/orders/:orderId",
  authMiddleware,
  orderController.getOrderByOrderId
);

module.exports = router;
