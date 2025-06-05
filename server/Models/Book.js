const mongoose = require("mongoose");

const bookSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
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
      required: true,
      default: 0,
      min: 0,
    },
    isEbook: { type: Boolean, default: false },
    pdfFile: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("books", bookSchema);
