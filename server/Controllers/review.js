// Controllers/reviewController.js
const Review = require("../Models/Review");
const Book = require("../Models/Book"); // อาจจะต้องอัปเดตคะแนนเฉลี่ยใน Book
const mongoose = require("mongoose");
const User = require("../Models/User");

// @route   POST /api/review/:productId
// @desc    Add a review to a product
// @access  Private (User)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId; // ID ของสินค้าที่จะรีวิว
    const userId = new mongoose.Types.ObjectId(req.user.id);
    // ตรวจสอบว่าผู้ใช้เคยรีวิวสินค้านี้แล้วหรือยัง (ถ้าต้องการให้รีวิวได้แค่ครั้งเดียว)
    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ msg: "You have already reviewed this product." });
    }

    const newReview = new Review({
      product: productId,
      user: userId,
      rating,
      comment,
    });

    await newReview.save();

    // (Optional) อัปเดตคะแนนเฉลี่ยของสินค้าใน Book Model
    const reviews = await Review.find({ product: productId });
    const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Book.findByIdAndUpdate(
      productId,
      { averageRating: averageRating },
      { new: true }
    );

    res.json({ msg: "Review added successfully!", review: newReview });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @route   GET /api/review/:productId
// @desc    Get all reviews for a specific product
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviews = await Review.find({ product: productId })
      .populate("user", "name") // ดึงแค่ชื่อผู้ใช้
      .sort({ createdAt: -1 }); // เรียงจากรีวิวล่าสุด

    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// (Optional) @route   DELETE /api/review/:reviewId
// (Optional) @desc    Delete a review (by user or admin)
// (Optional) @access  Private
// ...
