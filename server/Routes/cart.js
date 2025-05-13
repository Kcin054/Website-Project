const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../Middleware/auth");
const cartController = require("../Controllers/cart");

router.get("/cart", authMiddleware, cartController.getCart);
router.post("/cart/add", authMiddleware, cartController.addItemToCart);
router.delete(
  "/cart/remove/:itemId",
  authMiddleware,
  cartController.removeItemFromCart
);
router.delete("/cart/clear", authMiddleware, cartController.clearCart);
router.put(
  "/cart/update/:itemId",
  authMiddleware,
  cartController.updateCartItemQuantity
);

module.exports = router;
