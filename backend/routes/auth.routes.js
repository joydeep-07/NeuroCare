const express = require("express");
const {
  sendEmailOTP,
  verifyOTP,
  adminLogin,
  getMe,
  completeProfile,
} = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/send-otp", sendEmailOTP);
router.post("/verify-otp", verifyOTP);
router.post("/admin/login", adminLogin);
router.get("/me", protect, getMe);
router.put("/complete-profile", protect, completeProfile);

module.exports = router;
