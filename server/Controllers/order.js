const Order = require("../Models/Order");
const Book = require("../Models/Book");
// const mongoose = require("mongoose");
const Cart = require("../Models/Cart");

// exports.createOrder = async (req, res) => {
//   try {
//     const { cartItems, paymentIntent, shippingAddress, totalAmount } = req.body;
//     const userId = req.user._id;

//     const order = new Order({
//       products: cartItems.map((item) => ({
//         product: item.productId,
//         quantity: item.quantity,
//         price: item.price,
//       })),
//       paymentIntent,
//       orderStatus:
//         paymentIntent?.status === "succeeded" ? "Completed" : "Not Processed",
//       orderBy: userId,
//       shippingAddress,
//       totalAmount,
//     });

//     const savedOrder = await order.save();
//     res.status(201).json(savedOrder);
//   } catch (error) {
//     console.error("เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

exports.createOrder = async (req, res) => {
  const { cartItems, paymentIntent, shippingAddress, totalAmount } = req.body;
  const userId = req.user._id;

  if (!cartItems || cartItems.length === 0) {
    return res
      .status(400)
      .json({ message: "ตะกร้าสินค้าว่างเปล่า ไม่สามารถสร้างคำสั่งซื้อได้" });
  }
  if (!shippingAddress || !shippingAddress.address) {
    return res.status(400).json({ message: "ข้อมูลที่อยู่จัดส่งไม่สมบูรณ์" });
  }

  // *** ไม่มี session.startTransaction() แล้ว ***
  try {
    const orderProducts = [];
    const productsToUpdate = []; // เก็บ product และ quantity สำหรับการลด stock ทีหลัง

    // 1. ตรวจสอบ Stock สำหรับแต่ละรายการ (ยังไม่ลด stock จริง)
    for (const item of cartItems) {
      const product = await Book.findById(item.productId);
      console.log("Product fetched from DB:", product);
      console.log("Product Name (from DB):", product?.name);
      console.log("Product File (from DB):", product?.file);
      console.log("Product isEbook (from DB):", product?.isEbook);
      console.log("Product pdfFile (from DB):", product?.pdfFile);

      if (!product) {
        // ถ้าไม่พบสินค้า ให้แจ้งเตือนและยกเลิก
        return res.status(404).json({
          message: `ไม่พบสินค้า "${item.name}" (ID: ${item.productId}) ในระบบ`,
        });
      }

      if (product.stock < item.quantity) {
        // ถ้า stock ไม่พอ ให้แจ้งเตือนและยกเลิก
        return res.status(400).json({
          message: `สินค้า "${product.name}" มีจำนวนไม่พอ. คงเหลือ: ${product.stock} ชิ้น, ต้องการ: ${item.quantity} ชิ้น`,
        });
      }

      productsToUpdate.push({ product, quantity: item.quantity }); // เก็บไว้เพื่อลด stock ในภายหลัง

      orderProducts.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        file: product.file,
        isEbook: product.isEbook || false, // <--- เพิ่ม Field นี้
        pdfFile: product.pdfFile || null, // <--- เพิ่ม Field นี้
      });
    }

    // 2. สร้างคำสั่งซื้อ (ถ้า stock พอทั้งหมด)
    const newOrder = new Order({
      orderBy: userId,
      products: orderProducts,
      paymentIntent,
      shippingAddress,
      totalAmount,
      status: "Pending",
    });

    const savedOrder = await newOrder.save(); // บันทึกคำสั่งซื้อก่อน

    // *** 3. ลด Stock (ทำหลังจากบันทึก Order สำเร็จ) ***
    // จุดนี้คือความเสี่ยง: ถ้าการลด stock ล้มเหลวหลังจาก order ถูกสร้างแล้ว
    // stock จะไม่ถูกอัปเดต แต่ order ถูกสร้างไปแล้ว
    for (const { product, quantity } of productsToUpdate) {
      product.stock -= quantity;
      await product.save();
    }

    // 4. ล้างตะกร้าสินค้าของผู้ใช้
    await Cart.findOneAndUpdate(
      { userId },
      { items: [], totalQuantity: 0, subtotal: 0 },
      { new: true }
    );

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error creating order (without transaction):", error);
    // ในกรณีที่ไม่มี Transaction
    // หาก error เกิดขึ้นระหว่างการลด stock หรือล้าง cart หลังจาก Order ถูกสร้างแล้ว
    // คุณอาจมีปัญหาข้อมูลไม่สอดคล้องกัน (เช่น stock ลดไป แต่ Order ไม่สำเร็จ)
    // หรือ Order สร้างสำเร็จ แต่ stock ไม่ลด หรือ cart ไม่ถูกล้าง
    // การแก้ไขอัตโนมัติใน Production อาจต้องใช้ Worker Queue หรือ Log System
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง",
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ orderBy: userId })
      .populate("products.product")
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
      .populate("products.product")
      .populate("orderBy", "name email")
      .exec();

    console.log(
      "------------------- Order fetched for Frontend -------------------"
    );
    console.log(JSON.stringify(order, null, 2)); // แสดงผลลัพธ์เป็น JSON ที่อ่านง่าย
    console.log(
      "------------------------------------------------------------------"
    );

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
        "ยังไม่ดำเนินการ",
        "ตรวจสอบการชำระเงิน",
        "กำลังดำเนินการ",
        "จัดส่งแล้ว",
        "ยกเลิกแล้ว",
        "เสร็จสมบูรณ์",
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
      .populate("orderBy", "name email phoneNumber")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Error getting all orders:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
