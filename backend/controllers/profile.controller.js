const User = require("../models/user.model");

const completeProfile = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      relationship,
      gender,
      dateOfBirth,
      bloodGroup,
      height,
      weight,
      illness,
      notes,
      medicalHistory,
      doctorRecommendations,
      avatar,
    } = req.body;

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.fullName = fullName;
    user.email = email;
    user.phone = phone;
    user.relationship = relationship;
    user.gender = gender;
    user.dateOfBirth = dateOfBirth;
    user.bloodGroup = bloodGroup;
    user.height = height;
    user.weight = weight;
    user.illness = illness;
    user.notes = notes;
    user.medicalHistory = medicalHistory || [];
    user.doctorRecommendations = doctorRecommendations || [];

    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("family")
      .select("-__v");

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      relationship,
      gender,
      dateOfBirth,
      bloodGroup,
      height,
      weight,
      illness,
      notes,
      medicalHistory,
      doctorRecommendations,
      avatar,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.fullName = fullName;
    user.email = email;
    user.phone = phone;
    user.relationship = relationship;
    user.gender = gender;
    user.dateOfBirth = dateOfBirth;
    user.bloodGroup = bloodGroup;
    user.height = height;
    user.weight = weight;
    user.illness = illness;
    user.notes = notes;
    user.medicalHistory = medicalHistory || [];
    user.doctorRecommendations = doctorRecommendations || [];

    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  completeProfile,
  updateProfile,
  getProfile,
};
