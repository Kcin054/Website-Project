// Models/Review.js
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema; // สำหรับอ้างอิงถึง User และ Book

const reviewSchema = new mongoose.Schema({
  product: {
    type: ObjectId,
    ref: "Book", // อ้างอิงถึง Book Model
    required: true,
  },
  user: {
    type: ObjectId,
    ref: "users", // อ้างอิงถึง User Model
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500, // ความยาวสูงสุดของรีวิว
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
