const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: ObjectId,
          ref: "Product", // อ้างอิงไปยัง Product Model
        },
        quantity: Number,
        price: Number, // ราคา ณ เวลาที่สั่งซื้อ
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
      type: ObjectId,
      ref: "users", // อ้างอิงไปยัง User Model
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
