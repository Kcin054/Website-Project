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
      type: String,
      // default: "-",
    },
    postalCode: {
      type: String,
      // default: "-",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
