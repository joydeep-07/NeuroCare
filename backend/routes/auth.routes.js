const express = require("express");

const { sendEmailOTP, verifyOTP } = require("../controllers/auth.controller");

const router = express.Router();

// Send OTP
router.post("/send-otp", sendEmailOTP);

// Verify OTP
router.post("/verify-otp", verifyOTP);

module.exports = router;
