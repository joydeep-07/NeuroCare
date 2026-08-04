const express = require("express");
const router = express.Router();
const {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");

// Import the correct middleware function from auth.middleware.js
const { protect } = require("../middlewares/auth.middleware");

// Public routes
router.get("/", getAllReviews);

// Protected routes (Require login)
router.post("/", protect, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
