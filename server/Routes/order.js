const express = require("express");
const router = express.Router();
const orderController = require("../Controllers/order");
const { auth, adminCheck, authMiddleware } = require("../Middleware/auth"); // สมมติว่ามีการยืนยันตัวตน

router.post("/orders", authMiddleware, orderController.createOrder);
router.get("/orders/user", authMiddleware, orderController.getUserOrders);
router.get(
  "/orders/:orderId",
  authMiddleware,
  orderController.getOrderByOrderId
);

router.get("/admin/orders", auth, adminCheck, orderController.getAllOrders);
router.put(
  "/admin/order-status/:orderId",
  auth,
  adminCheck,
  orderController.updateOrderStatus
);

module.exports = router;
