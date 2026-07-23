const Family = require("../models/family.model");
const FamilyMember = require("../models/familyMember.model");

// =======================================
// Add Family Member
// =======================================
const addMember = async (req, res) => {
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
      allergies,
      illness,
      medicalHistory,
      doctorRecommendations,
      medicines,
    } = req.body;

    const family = await Family.findById(req.user.family);

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family not found.",
      });
    }

    const member = await FamilyMember.create({
      family: family._id,
      addedBy: req.user._id,

      fullName,
      email,
      phone,
      relationship,
      gender,
      dateOfBirth,
      bloodGroup,
      height,
      weight,
      allergies,
      illness,
      medicalHistory,
      doctorRecommendations,
      medicines,
    });

    return res.status(201).json({
      success: true,
      message: "Family member added successfully.",
      member,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================================
// Get All Members
// =======================================
const getMembers = async (req, res) => {
  try {
    const members = await FamilyMember.find({
      family: req.user.family,
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================================
// Get Single Member
// =======================================
const getMember = async (req, res) => {
  try {
    const member = await FamilyMember.findOne({
      _id: req.params.id,
      family: req.user.family,
      isActive: true,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    return res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================================
// Update Member
// =======================================
const updateMember = async (req, res) => {
  try {
    const member = await FamilyMember.findOne({
      _id: req.params.id,
      family: req.user.family,
      isActive: true,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    Object.assign(member, req.body);

    await member.save();

    return res.status(200).json({
      success: true,
      message: "Member updated successfully.",
      member,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================================
// Delete Member (Soft Delete)
// =======================================
const deleteMember = async (req, res) => {
  try {
    const member = await FamilyMember.findOne({
      _id: req.params.id,
      family: req.user.family,
      isActive: true,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    member.isActive = false;

    await member.save();

    return res.status(200).json({
      success: true,
      message: "Member deleted successfully.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  addMember,
  getMembers,
  getMember,
  updateMember,
  deleteMember,
};
