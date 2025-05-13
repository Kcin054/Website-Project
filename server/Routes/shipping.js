const express = require("express");
const router = express.Router();
const shippingController = require("../Controllers/shipping"); // นำเข้า Controller สำหรับการจัดการข้อมูลการจัดส่ง
const { authMiddleware } = require("../Middleware/auth"); // สมมติว่าคุณมี Middleware สำหรับยืนยันตัวตน

router.post(
  "/shipping/add",
  authMiddleware,
  shippingController.saveShippingInfo
);
router.get("/shipping", authMiddleware, shippingController.getShippingInfo);
router.put(
  "/shipping/update",
  authMiddleware,
  shippingController.updateShippingInfo
);

module.exports = router;
