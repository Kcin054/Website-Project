const Order = require("../Models/Order");
const Book = require("../Models/Book");

exports.createOrder = async (req, res) => {
  try {
    const { cartItems, paymentIntent, shippingAddress, totalAmount } = req.body;
    const userId = req.user._id; // สมมติว่ามีการยืนยันตัวตนแล้ว
    console.log("Receiving cartItems for order creation:", cartItems);

    const order = new Order({
      products: cartItems.map((item) => ({
        product: item.productId, // หรือ item.product._id ถ้าโครงสร้างตะกร้าเป็นแบบนั้น
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
      .populate({
        path: "products.product",
        model: "books", // **สำคัญมาก!** ระบุชื่อ Model ที่ถูกต้อง
        select: "_id name price file category type", // ระบุ fields ที่คุณต้องการจาก Book Model ให้ครบถ้วน
      })
      .sort({ createdAt: -1 })
      .exec(); // อย่าลืม .exec() เพื่อให้ Query ทำงาน

    res.json(orders);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อของผู้ใช้:", error);
    res.status(500).json({ message: error.message });
  }
};

// exports.getOrderByOrderId = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const order = await Order.findById(orderId).populate(
//       "products.product",
//       "_id name price"
//     );
//     if (!order) {
//       return res.status(404).json({ message: "ไม่พบคำสั่งซื้อ" });
//     }
//     res.json(order);
//   } catch (error) {
//     console.error("เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

exports.getOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate({
        path: "products.product", // **นี่คือ key point!** ชี้ไปที่ฟิลด์ 'product' ที่อยู่ใน array 'products'
        model: "books", // **สำคัญมาก!** ระบุชื่อ Model ที่คุณ export ไว้ใน bookSchema (คือ "books")
        select: "_id name price file category type", // เลือกฟิลด์ที่ต้องการจาก Book Model
      })
      .populate("orderBy", "name email") // Optional: ถ้าต้องการ populate ข้อมูลผู้ใช้ด้วย
      .exec(); // execute query

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // console.log("Populated Order:", order); // ลอง console.log ดูว่าข้อมูลถูก populate หรือยัง

    res.json(order);
  } catch (err) {
    console.error("Error fetching order by ID:", err);
    res.status(500).send("Server Error");
  }
};
