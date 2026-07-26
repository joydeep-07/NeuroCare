const User = require("../models/user.model");
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
      illness,
      notes,
      medicalHistory,
      doctorRecommendations,
      avatar,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const family = await Family.findById(req.user.family._id);

    if (!family) {
      return res.status(404).json({
        success: false,
        message: "Family not found.",
      });
    }

    let user = await User.findOne({
      email: email.toLowerCase(),
    });

    // ===========================
    // Existing User
    // ===========================
    if (user) {
      if (user.family && user.family.toString() !== family._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "This user already belongs to another family.",
        });
      }
    } else {
      // ===========================
      // Create New User
      // ===========================
      user = await User.create({
        email: email.toLowerCase(),
        fullName,
        phone,
        relationship,
        gender,
        dateOfBirth,
        bloodGroup,
        height,
        weight,
        illness,
        notes,
        medicalHistory: medicalHistory || [],
        doctorRecommendations: doctorRecommendations || [],
        avatar: avatar || "",
        provider: "otp",
        family: family._id,
      });

      await FamilyMember.create({
        family: family._id,
        user: user._id,
        addedBy: req.user._id,
        relationship: "Self",
      });
    }

    // ===========================
    // Attach User to Family
    // ===========================
    user.family = family._id;

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (relationship) user.relationship = relationship;
    if (gender) user.gender = gender;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (height !== undefined) user.height = height;
    if (weight !== undefined) user.weight = weight;
    if (illness !== undefined) user.illness = illness;
    if (notes !== undefined) user.notes = notes;
    if (medicalHistory) user.medicalHistory = medicalHistory;
    if (doctorRecommendations)
      user.doctorRecommendations = doctorRecommendations;
    if (avatar) user.avatar = avatar;

    await user.save();

    // ===========================
    // Add User to Family
    // ===========================
    if (
      !family.members.some(
        (memberId) => memberId.toString() === user._id.toString(),
      )
    ) {
      family.members.push(user._id);
      await family.save();
    }

    // ===========================
    // Create Relationship
    // ===========================
    let member = await FamilyMember.findOne({
      family: family._id,
      user: user._id,
    });

    if (member) {
      member.relationship = relationship;
      member.isActive = true;
      await member.save();
    } else {
      member = await FamilyMember.create({
        family: family._id,
        user: user._id,
        addedBy: req.user._id,
        relationship,
      });
    }

    member = await FamilyMember.findById(member._id)
      .populate("user")
      .populate("addedBy", "fullName email");

    return res.status(201).json({
      success: true,
      message: "Family member added successfully.",
      member,
    });
  } catch (error) {
    console.error(error);

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
      family: req.user.family._id,
      isActive: true,
    })
      .populate("user", "-__v")
      .populate("addedBy", "fullName email")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error(error);

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
      family: req.user.family._id,
      isActive: true,
    })
      .populate("user", "-__v")
      .populate("addedBy", "fullName email");

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
    console.error(error);

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
      family: req.user.family._id,
      isActive: true,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    const user = await User.findById(member.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const {
      fullName,
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

    // Update relationship
    if (relationship) {
      member.relationship = relationship;
      user.relationship = relationship;
    }

    // Update User details
    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (height !== undefined) user.height = height;
    if (weight !== undefined) user.weight = weight;
    if (illness !== undefined) user.illness = illness;
    if (notes !== undefined) user.notes = notes;
    if (medicalHistory !== undefined) user.medicalHistory = medicalHistory;
    if (doctorRecommendations !== undefined)
      user.doctorRecommendations = doctorRecommendations;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    await member.save();

    const updatedMember = await FamilyMember.findById(member._id)
      .populate("user", "-__v")
      .populate("addedBy", "fullName email");

    return res.status(200).json({
      success: true,
      message: "Member updated successfully.",
      member: updatedMember,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =======================================
// Delete Member (Remove Relationship)
// =======================================
const deleteMember = async (req, res) => {
  try {
    const member = await FamilyMember.findOne({
      _id: req.params.id,
      family: req.user.family._id,
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

    await Family.findByIdAndUpdate(req.user.family._id, {
      $pull: {
        members: member.user,
      },
    });

    await User.findByIdAndUpdate(member.user, {
      family: null,
    });

    return res.status(200).json({
      success: true,
      message: "Member removed from family successfully.",
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
  addMember,
  getMembers,
  getMember,
  updateMember,
  deleteMember,
};
