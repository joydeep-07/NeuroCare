const express = require("express");

const { protect } = require("../middlewares/auth.middleware");

const {
  completeProfile,
  getProfile,
  updateProfile,
} = require("../controllers/profile.controller");

const router = express.Router();

// Protect all profile routes
router.use(protect);

// Get Profile
router.get("/", getProfile);

// Complete Profile
router.put("/complete", completeProfile);

// Update Profile
router.put("/update", updateProfile);

module.exports = router;
