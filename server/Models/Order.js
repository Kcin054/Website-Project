const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: ObjectId,
          ref: "books",
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        file: {
          type: String,
          default: "noimage.jpg",
        },
        isEbook: {
          type: Boolean,
          default: false,
        },
        pdfFile: {
          type: String,
        },
      },
    ],
    paymentIntent: {},
    orderStatus: {
      type: String,
      default: "รอตรวจสอบการชำระเงิน",
      enum: [
        "รอตรวจสอบการชำระเงิน",
        "ตรวจสอบการชำระเงินแล้ว",
        "กำลังดำเนินการจัดส่ง",
        "จัดส่งแล้ว",
        "ยกเลิกแล้ว",
        "เสร็จสมบูรณ์",
      ],
    },
    orderBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    shippingAddress: {
      address: String,
      province: String,
      postalCode: String,
      phoneNumber: String,
    },
    totalAmount: Number,
    slipFile: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
