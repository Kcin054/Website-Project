const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: String,
    password: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
    phoneNumber: {
      type: String,
      // default: "-",
    },
    email: {
      type: String,
      // default: "-",
    },
    address: {
      type: String,
      // default: "-",
    },
    city: {
      // เพิ่มฟิลด์เมืองในโมเดลผู้ใช้
      type: String,
      // default: "-",
    },
    postalCode: {
      // เพิ่มฟิลด์รหัสไปรษณีย์ในโมเดลผู้ใช้
      type: String,
      // default: "-",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
