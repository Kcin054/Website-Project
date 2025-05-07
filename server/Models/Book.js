const mongoose = require("mongoose");

const bookSchema = mongoose.Schema(
  {
    name: String,
    tag: {
      type: String,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("books", bookSchema);
