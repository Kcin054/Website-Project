const Order = require("../Models/Order");

exports.createOrder = async (req, res) => {
  try {
    const { cartItems, paymentIntent, shippingAddress, totalAmount } = req.body;
    const userId = req.user._id; // สมมติว่ามีการยืนยันตัวตนแล้ว

    const order = new Order({
      products: cartItems.map((item) => ({
        product: item._id, // หรือ item.product._id ถ้าโครงสร้างตะกร้าเป็นแบบนั้น
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

    // **(ทางเลือก) อัปเดต Stock สินค้า**
    // ...

    // **(ทางเลือก) ส่ง Email ยืนยัน**
    // ...
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id; // สมมติว่ามีการยืนยันตัวตนแล้ว
    const orders = await Order.find({ orderBy: userId })
      .populate("products.product", "_id name price") // ดึงข้อมูลสินค้าที่เกี่ยวข้อง
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อของผู้ใช้:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate(
      "products.product",
      "_id name price"
    );
    if (!order) {
      return res.status(404).json({ message: "ไม่พบคำสั่งซื้อ" });
    }
    res.json(order);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ:", error);
    res.status(500).json({ message: error.message });
  }
};
