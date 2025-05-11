const express = require("express");
const router = express.Router();
// const { getCart, addItemToCart } = require("../Controllers/cart");
// const authMiddleware = require('../middleware/auth'); // ถ้ามีการ authentication
const cartController = require("../Controllers/cart");
const { authMiddleware } = require("../Middleware/auth");

router.get("/cart", authMiddleware, cartController.getCart);
router.post("/cart/add", cartController.addItemToCart);
// router.delete('/cart/remove/:itemId', cartController.removeItemFromCart);
// router.put("/cart/update/:itemId", cartController.updateCartItemQuantity);
// router.delete('/cart/clear', cartController.clearCart);

module.exports = router;
