// Routes/review.js
const express = require("express");
const router = express.Router();
const { addReview, getProductReviews } = require("../Controllers/review");
const { auth } = require("../Middleware/auth"); // Middleware สำหรับยืนยันตัวตน

// เพิ่มรีวิว (ต้อง Login ก่อน)
router.post("/review/:productId", auth, addReview);

// ดึงรีวิวทั้งหมดของสินค้า
router.get("/reviews/:productId", getProductReviews);

module.exports = router;
