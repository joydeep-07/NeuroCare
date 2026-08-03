const User = require("../models/user.model");
const { cloudinary, uploadAvatar } = require("../utils/cloudinary");

const isSupportedImage = (buffer) => {
  const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp = buffer.length >= 12 && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
  return isJpeg || isPng || isWebp;
};

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

const updateAvatar = async (req, res) => {
  let uploadResult;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please select an image to upload." });
    }
    if (!isSupportedImage(req.file.buffer)) {
      return res.status(400).json({ success: false, message: "The selected file is not a valid JPG, PNG, or WEBP image." });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    uploadResult = await uploadAvatar(req.file.buffer);
    const previousPublicId = user.avatarSource === "uploaded" ? user.avatarPublicId : "";

    user.avatar = uploadResult.secure_url;
    user.avatarSource = "uploaded";
    user.avatarPublicId = uploadResult.public_id;
    await user.save();

    if (previousPublicId) {
      cloudinary.uploader.destroy(previousPublicId, { resource_type: "image" }).catch((error) => {
        console.error("Previous avatar cleanup failed:", error.message);
      });
    }

    return res.status(200).json({ success: true, message: "Profile picture updated.", user });
  } catch (error) {
    if (uploadResult?.public_id) {
      cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: "image" }).catch(() => {});
    }
    console.error("updateAvatar error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to upload profile picture. Please try again." });
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
  updateAvatar,
};
