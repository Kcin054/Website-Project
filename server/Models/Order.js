const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: ObjectId,
          ref: "books", // อ้างอิงไปยัง Product Model
        },
        name: {
          // *** เพิ่มฟิลด์ name ตรงนี้ ***
          type: String,
          required: true, // แนะนำให้เป็น required เพื่อให้ข้อมูลสมบูรณ์
        },
        quantity: {
          // ควรระบุ type และ required
          type: Number,
          required: true,
        },
        price: {
          // ราคา ณ เวลาที่สั่งซื้อ
          type: Number,
          required: true,
        },
        file: {
          // *** เพิ่มฟิลด์ file ตรงนี้ ***
          type: String,
          default: "noimage.jpg", // ตั้งค่า default ถ้าไม่มี
        },
      },
    ],
    paymentIntent: {}, // ข้อมูลการชำระเงินจาก Payment Gateway
    orderStatus: {
      type: String,
      default: "Not Processed",
      enum: [
        "Not Processed",
        "Cash On Delivery",
        "Processing",
        "Dispatched",
        "Cancelled",
        "Completed",
      ],
    },
    orderBy: {
      type: Schema.Types.ObjectId,
      ref: "users", // อ้างอิงไปยัง User Model
      required: true,
    },
    shippingAddress: {
      address: String,
      city: String,
      postalCode: String,
      phoneNumber: String,
    },
    totalAmount: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
