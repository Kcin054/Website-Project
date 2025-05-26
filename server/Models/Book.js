const mongoose = require("mongoose");

const bookSchema = mongoose.Schema(
  {
    name: String,
    tag: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
    },
    file: {
      type: String,
      default: "noimage.jpg",
    },
    type: {
      type: String,
      default: "Book",
    },
    category: {
      type: String,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true, // ทำให้ stock เป็นฟิลด์ที่จำเป็นต้องมี
      default: 0, // ตั้งค่าเริ่มต้นเป็น 0
      min: 0, // จำนวน stock ต้องไม่ติดลบ
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("books", bookSchema);
