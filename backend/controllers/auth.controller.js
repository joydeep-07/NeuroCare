const User = require("../models/user.model");
const Family = require("../models/family.model");
const OTP = require("../models/otp.model");

const generateOTP = require("../utils/generateOTP");
const sendOTP = require("../utils/sendOTP");
const generateToken = require("../utils/generateToken");

// =======================
// Send OTP
// =======================
const sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Remove previous OTP
    await OTP.deleteMany({
      email: email.toLowerCase(),
    });

    const otp = generateOTP();

    await OTP.create({
      email: email.toLowerCase(),
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOTP(email.toLowerCase(), otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP.",
    });
  }
};

// =======================
// Verify OTP
// =======================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const savedOTP = await OTP.findOne({
      email: email.toLowerCase(),
    });

    if (!savedOTP) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found.",
      });
    }

    if (savedOTP.otp !== otp) {
      savedOTP.attempts += 1;
      await savedOTP.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Delete OTP after successful verification
    await OTP.deleteOne({
      _id: savedOTP._id,
    });

    let user = await User.findOne({
      email: email.toLowerCase(),
    });

    // ============================
    // First Login → Create Account
    // ============================
    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
        provider: "otp",
      });

      const family = await Family.create({
        familyName: "My Family",
        primaryMember: user._id,
        members: [user._id],
      });

      user.family = family._id;

      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      isProfileComplete: !!user.fullName,
      token,
      user,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

module.exports = {
  sendEmailOTP,
  verifyOTP,
};
