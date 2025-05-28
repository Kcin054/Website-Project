const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "books",
    required: true,
  },
  quantity: {
    type: Number,
    min: 1,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  name: String,
  image: String,
});

const CartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  sessionId: String,
  items: [CartItemSchema],
  totalQuantity: {
    type: Number,
    default: 0,
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

CartSchema.pre("save", function (next) {
  this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.subtotal = this.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  this.updatedAt = new Date();
  next();
});

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;
