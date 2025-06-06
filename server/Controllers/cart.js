const Cart = require("../Models/Cart");
const Book = require("../Models/Book");

exports.getCart = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;

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
    const { productId, quantity, price, name, image } = req.body;
    const userId = req.user ? req.user._id : null;

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

exports.updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!itemId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid item ID or quantity" });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId, "items._id": itemId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeItemFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({ message: "จำเป็นต้องระบุ ID สินค้า" });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: "ไม่พบตะกร้าสินค้า" });
    }

    cart.totalQuantity = cart.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    cart.subtotal = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลบสินค้าออกจากตะกร้า:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [], totalQuantity: 0, subtotal: 0 },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: "ไม่พบตะกร้าสินค้า" });
    }

    res.json({ message: "ล้างตะกร้าสินค้าเรียบร้อยแล้ว", cart });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการล้างตะกร้าสินค้า:", error);
    res.status(500).json({ message: error.message });
  }
};
