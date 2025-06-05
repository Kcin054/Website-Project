const Review = require("../Models/Review");
const Book = require("../Models/Book");
const mongoose = require("mongoose");
const User = require("../Models/User");
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;
    const userId = new mongoose.Types.ObjectId(req.user.id);
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

exports.getProductReviews = async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
