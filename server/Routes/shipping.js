const express = require("express");
const router = express.Router();
const shippingController = require("../Controllers/shipping");
const { authMiddleware } = require("../Middleware/auth");

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
