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

    console.log("========== VERIFY OTP ==========");
    console.log("Email:", email);
    console.log("OTP:", otp);

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const savedOTP = await OTP.findOne({
      email: email.toLowerCase(),
    });

    console.log("Saved OTP:", savedOTP);

    if (!savedOTP) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found.",
      });
    }

    if (String(savedOTP.otp).trim() !== String(otp).trim()) {
      savedOTP.attempts += 1;
      await savedOTP.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    console.log("✅ OTP verified");

    await OTP.deleteOne({
      _id: savedOTP._id,
    });

    console.log("✅ OTP deleted");

    let user = await User.findOne({
      email: email.toLowerCase(),
    });

    console.log("Existing User:", user);

    if (!user) {
      console.log("🟡 Creating new user...");

      user = await User.create({
        email: email.toLowerCase(),
        provider: "otp",
      });

      console.log("✅ User created:", user);

      const family = await Family.create({
        familyName: "My Family",
        primaryMember: user._id,
        members: [user._id],
      });

      console.log("✅ Family created:", family);

      user.family = family._id;
      await user.save();

      console.log("✅ User updated with family");
    }

    user.lastLogin = new Date();
    await user.save();

    console.log("✅ Last login updated");

    const token = generateToken(user._id);

    console.log("✅ Token generated");

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      isProfileComplete: !!user.fullName,
      token,
      user,
    });
  } catch (error) {
    console.error("========== VERIFY OTP ERROR ==========");
    console.error(error);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  sendEmailOTP,
  verifyOTP,
};
