const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const reviewSchema = new mongoose.Schema({
  product: {
    type: ObjectId,
    ref: "Book",
    required: true,
  },
  user: {
    type: ObjectId,
    ref: "users",
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
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
