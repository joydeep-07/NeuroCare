const express = require("express");
const {
  sendEmailOTP,
  verifyOTP,
  googleLogin,
  adminLogin,
  getMe,
  completeProfile,
} = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/send-otp", sendEmailOTP);
router.post("/verify-otp", verifyOTP);
router.post("/google", googleLogin);
router.post("/admin/login", adminLogin);
router.get("/me", protect, getMe);
router.put("/complete-profile", protect, completeProfile);

module.exports = router;
