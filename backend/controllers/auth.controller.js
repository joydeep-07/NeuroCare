const User = require("../models/user.model");
const Family = require("../models/family.model");
const FamilyMember = require("../models/familyMember.model");
const OTP = require("../models/otp.model");

const generateOTP = require("../utils/generateOTP");
const sendOTP = require("../utils/sendOTP");
const generateToken = require("../utils/generateToken");

// =======================
// Send OTP (Patient / Doctor)
// =======================
const sendEmailOTP = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // If logging in as Doctor, verify that Doctor account exists
    if (role === "doctor") {
      const doctorUser = await User.findOne({ email: cleanEmail, role: "doctor" });
      if (!doctorUser) {
        return res.status(404).json({
          success: false,
          message: "No registered doctor account found with this email. Doctor accounts are created by Administrators only.",
        });
      }
    }

    await OTP.deleteMany({ email: cleanEmail });

    const otp = generateOTP();

    await OTP.create({
      email: cleanEmail,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    let delivery;
    try {
      delivery = await sendOTP(cleanEmail, otp);
    } catch (deliveryError) {
      await OTP.deleteMany({ email: cleanEmail });
      throw deliveryError;
    }

    return res.status(200).json({
      success: true,
      message: delivery?.delivered === false
        ? "SMTP is not configured. Use the development OTP printed in the backend terminal."
        : `Verification code sent to ${cleanEmail}`,
    });
  } catch (error) {
    console.error("sendEmailOTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send the verification code. Please check the email address and try again.",
    });
  }
};

// =======================
// Verify OTP
// =======================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, targetRole } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP code are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const savedOTP = await OTP.findOne({ email: cleanEmail });

    if (!savedOTP) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired or is invalid. Please request a new code.",
      });
    }

    if (savedOTP.expiresAt <= new Date()) {
      await OTP.deleteOne({ _id: savedOTP._id });
      return res.status(400).json({ success: false, message: "Verification code has expired. Please request a new code." });
    }

    if (savedOTP.attempts >= 5) {
      await OTP.deleteOne({ _id: savedOTP._id });
      return res.status(429).json({ success: false, message: "Too many invalid attempts. Please request a new code." });
    }

    if (String(savedOTP.otp).trim() !== String(otp).trim()) {
      savedOTP.attempts += 1;
      await savedOTP.save();
      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    await OTP.deleteOne({ _id: savedOTP._id });

    let user = await User.findOne({ email: cleanEmail });

    // Clear the malformed geo value created by earlier schema versions. It has
    // a Point type but no [longitude, latitude] tuple and breaks 2dsphere writes.
    if (user?.coordinates?.type === "Point" && !Array.isArray(user.coordinates.coordinates)) {
      user.coordinates = undefined;
    }

    // Handle Doctor target role validation
    if (targetRole === "doctor") {
      if (!user || user.role !== "doctor") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: Only pre-authorized doctor accounts created by an Admin can sign in here.",
        });
      }
    }

    // Create new patient account if non-existent
    if (!user) {
      const requestedRole = targetRole === "admin" ? "admin" : "patient";

      user = await User.create({
        email: cleanEmail,
        provider: "otp",
        role: requestedRole,
        isProfileComplete: false,
      });
    }

    // Auto-create Family container for patient accounts
    if (user.role === "patient" && !user.family) {
      const family = await Family.create({
        familyName: `${user.fullName || "My"} Family`,
        primaryMember: user._id,
        members: [user._id],
      });

      user.family = family._id;
      await user.save();

      const existingMember = await FamilyMember.findOne({
        family: family._id,
        user: user._id,
      });

      if (!existingMember) {
        await FamilyMember.create({
          family: family._id,
          user: user._id,
          addedBy: user._id,
          relationship: "Self",
        });
      }
    }

    user.lastLogin = new Date();
    await user.save();

    user = await User.findById(user._id).populate("family");

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Sign in successful",
      token,
      isProfileComplete: !!(user.fullName && user.phone),
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isProfileComplete: !!(user.fullName && user.phone),
        family: user.family,
        specialization: user.specialization,
        hospital: user.hospital,
      },
    });
  } catch (error) {
    console.error("verifyOTP error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Authentication error",
    });
  }
};

// =======================
// Admin Authentication (Password or Default Admin Credentials)
// =======================
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Admin email and password required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Default system admin check or existing database admin user
    let admin = await User.findOne({ email: cleanEmail, role: "admin" });

    // Allow default admin sign in if matching default env / master credentials
    if (!admin && cleanEmail === "admin@neurocare.com" && password === "Admin@123") {
      admin = await User.create({
        email: "admin@neurocare.com",
        fullName: "System Admin",
        phone: "+91 98765 43210",
        role: "admin",
        password: "Admin@123", // In prod, hash with bcrypt
        isProfileComplete: true,
      });
    } else if (admin && admin.password && admin.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials.",
      });
    } else if (!admin) {
      return res.status(401).json({
        success: false,
        message: "No administrator account found with these credentials.",
      });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      user: {
        _id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        avatar: admin.avatar,
      },
    });
  } catch (error) {
    console.error("adminLogin error:", error);
    return res.status(500).json({
      success: false,
      message: "Admin authentication failed",
    });
  }
};

// =======================
// Get Current Authenticated User Profile
// =======================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("family");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user data.",
    });
  }
};

// =======================
// Complete / Update Profile
// =======================
const completeProfile = async (req, res) => {
  try {
    const { fullName, phone, gender, dateOfBirth, bloodGroup, height, weight, illness, notes, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (height !== undefined) user.height = height;
    if (weight !== undefined) user.weight = weight;
    if (illness !== undefined) user.illness = illness;
    if (notes !== undefined) user.notes = notes;
    if (avatar !== undefined) user.avatar = avatar;

    user.isProfileComplete = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating profile." });
  }
};

module.exports = {
  sendEmailOTP,
  verifyOTP,
  adminLogin,
  getMe,
  completeProfile,
};
