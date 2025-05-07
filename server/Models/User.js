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
    tol: {
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
