const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "books", // อ้างอิงไปยัง Model สินค้า
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
  // สามารถเพิ่ม fields อื่นๆ ที่เกี่ยวข้องกับ item ในตะกร้าได้
});

const CartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users", // อ้างอิงไปยัง Model ผู้ใช้ (สำหรับผู้ใช้ที่ลงทะเบียน)
  },
  sessionId: String, // สำหรับผู้ใช้ทั่วไป (อาจใช้ session ID)
  items: [CartItemSchema], // Array ของสินค้าในตะกร้า
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

// Middleware เพื่ออัปเดต totalQuantity และ subtotal ก่อนบันทึก
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
