const express = require("express");
const router = express.Router();
const { addReview, getProductReviews } = require("../Controllers/review");
const { auth } = require("../Middleware/auth");

router.post("/review/:productId", auth, addReview);

router.get("/reviews/:productId", getProductReviews);

module.exports = router;
