const Cart = require("../Models/Cart");

exports.getCart = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    console.log("userId", req.uses);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (cart.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addItemToCart = async (req, res) => {
  try {
    const { productId, quantity, price, name, image, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, price, name, image });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
