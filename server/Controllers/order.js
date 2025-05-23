const Order = require("../Models/Order");
const Book = require("../Models/Book");

exports.createOrder = async (req, res) => {
  try {
    const { cartItems, paymentIntent, shippingAddress, totalAmount } = req.body;
    const userId = req.user._id;

    const order = new Order({
      products: cartItems.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      paymentIntent,
      orderStatus:
        paymentIntent?.status === "succeeded" ? "Completed" : "Not Processed",
      orderBy: userId,
      shippingAddress,
      totalAmount,
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ orderBy: userId })
      .populate({
        path: "products.product",
        model: "books",
        select: "_id name price file category type",
      })
      .sort({ createdAt: -1 })
      .exec();

    res.json(orders);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อของผู้ใช้:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate({
        path: "products.product",
        model: "books",
        select: "_id name price file category type",
      })
      .populate("orderBy", "name email")
      .exec();

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("Error fetching order by ID:", err);
    res.status(500).send("Server Error");
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (
      ![
        "Not Processed",
        "Cash On Delivery",
        "Processing",
        "Dispatched",
        "Cancelled",
        "Completed",
      ].includes(status)
    ) {
      return res.status(400).json({ msg: "Invalid order status" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    )
      .populate("products.product", "name file price")
      .populate("orderedBy", "name email phoneNumber");

    if (!updatedOrder) {
      return res.status(404).json({ msg: "Order not found" });
    }

    res.json({ msg: "Order status updated successfully", order: updatedOrder });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("products.product", "name file price")
      .populate("orderedBy", "name email phoneNumber")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Error getting all orders:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
