const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    phoneNumber: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: (props) =>
          `เบอร์โทรศัพท์ ${props.value} ไม่ถูกต้อง! ต้องเป็นตัวเลข 10 หลัก`,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 5,
      validate: {
        validator: function (v) {
          return /^\d{5}$/.test(v);
        },
        message: (props) =>
          `รหัสไปรษณีย์ ${props.value} ไม่ถูกต้อง! ต้องเป็นตัวเลข 5 หลัก`,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
