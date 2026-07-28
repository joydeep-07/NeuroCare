const User = require("../models/user.model");
const Family = require("../models/family.model");
const FamilyMember = require("../models/familyMember.model");

const RELATIONSHIPS = new Set(["Father", "Mother", "Son", "Daughter", "Brother", "Sister", "Grandfather", "Grandmother", "Grandson", "Granddaughter", "Guardian", "Spouse", "Other"]);
const INVERSE_RELATIONSHIP = { Father: "Son/Daughter", Mother: "Son/Daughter", Son: "Father/Mother", Daughter: "Father/Mother", Brother: "Brother/Sister", Sister: "Brother/Sister", Grandfather: "Grandson/Granddaughter", Grandmother: "Grandson/Granddaughter", Grandson: "Grandfather/Grandmother", Granddaughter: "Grandfather/Grandmother", Guardian: "Other", Spouse: "Spouse", Other: "Other" };

// =======================================
// Add Family Member (with Auto-Link Detection)
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
        message: "Email address is required to add a family member.",
      });
    }
    if (relationship && !RELATIONSHIPS.has(relationship)) {
      return res.status(400).json({ success: false, message: "Please choose a supported family relationship." });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (cleanEmail === req.user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "You cannot add yourself as a separate family member.",
      });
    }

    // Ensure primary family exists
    let family = req.user.family ? await Family.findById(req.user.family._id) : null;
    if (!family) {
      family = await Family.create({
        familyName: `${req.user.fullName || "My"} Family`,
        primaryMember: req.user._id,
        members: [req.user._id],
      });
      req.user.family = family._id;
      await req.user.save();
    }

    let targetUser = await User.findOne({ email: cleanEmail });
    let isLinkedAccount = false;

    if (targetUser) {
      // Automatic linking with existing NeuroCare user
      isLinkedAccount = true;

      // Ensure reciprocal family container exists for targetUser
      if (!targetUser.family) {
        const targetFamily = await Family.create({
          familyName: `${targetUser.fullName || "My"} Family`,
          primaryMember: targetUser._id,
          members: [targetUser._id],
        });
        targetUser.family = targetFamily._id;
        await targetUser.save();
      }

      // Check if relationship already exists
      const existingLink = await FamilyMember.findOne({
        family: family._id,
        user: targetUser._id,
      });

      if (existingLink && existingLink.isActive) {
        return res.status(400).json({
          success: false,
          message: "This family member is already linked to your account.",
        });
      }

      // Create primary link
      if (existingLink) {
        existingLink.isActive = true;
        existingLink.relationship = relationship || "Family Member";
        await existingLink.save();
      } else {
        await FamilyMember.create({
          family: family._id,
          user: targetUser._id,
          addedBy: req.user._id,
          relationship: relationship || "Family Member",
          isActive: true,
        });
      }

      // Create bidirectional link in targetUser's family list
      const targetFamilyObj = await Family.findById(targetUser.family);
      if (targetFamilyObj) {
        const targetExistingLink = await FamilyMember.findOne({
          family: targetFamilyObj._id,
          user: req.user._id,
        });

        const inverseRel = INVERSE_RELATIONSHIP[relationship] || "Other";

        if (targetExistingLink) {
          targetExistingLink.isActive = true;
          targetExistingLink.relationship = inverseRel;
          await targetExistingLink.save();
        } else {
          await FamilyMember.create({
            family: targetFamilyObj._id,
            user: req.user._id,
            addedBy: req.user._id,
            relationship: inverseRel,
            isActive: true,
          });
        }
        if (!targetFamilyObj.members.some((id) => String(id) === String(req.user._id))) {
          targetFamilyObj.members.push(req.user._id);
          await targetFamilyObj.save();
        }
      }
    } else {
      // Unlinked family member record creation
      targetUser = await User.create({
        email: cleanEmail,
        fullName: fullName || cleanEmail.split("@")[0],
        phone: phone || "",
        relationship: relationship || "Family Member",
        gender: gender || null,
        dateOfBirth: dateOfBirth || null,
        bloodGroup: bloodGroup || "",
        height: height || null,
        weight: weight || null,
        illness: illness || "",
        notes: notes || "",
        medicalHistory: medicalHistory || [],
        doctorRecommendations: doctorRecommendations || [],
        avatar: avatar || "",
        provider: "otp",
        role: "patient",
        family: family._id,
      });

      await FamilyMember.create({
        family: family._id,
        user: targetUser._id,
        addedBy: req.user._id,
        relationship: relationship || "Family Member",
        isActive: true,
      });
    }

    if (!family.members.includes(targetUser._id)) {
      family.members.push(targetUser._id);
      await family.save();
    }

    const memberDoc = await FamilyMember.findOne({
      family: family._id,
      user: targetUser._id,
    })
      .populate("user", "-password -__v")
      .populate("addedBy", "fullName email");

    return res.status(201).json({
      success: true,
      message: isLinkedAccount
        ? "Existing NeuroCare account linked as family member successfully!"
        : "Family member added successfully.",
      isLinkedAccount,
      member: memberDoc,
    });
  } catch (error) {
    console.error("addMember error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add family member.",
    });
  }
};

// =======================================
// Get All Members for Current User
// =======================================
const getMembers = async (req, res) => {
  try {
    if (!req.user.family) {
      return res.status(200).json({
        success: true,
        count: 0,
        members: [],
      });
    }

    const members = await FamilyMember.find({
      family: req.user.family._id,
      isActive: true,
    })
      .populate("user", "-password -__v")
      .populate("addedBy", "fullName email")
      .sort({ createdAt: -1 });

    // Mark whether each member is a separate registered account
    const formattedMembers = members.map((m) => {
      const isRegisteredAccount = m.user && m.user.isProfileComplete;
      const isSelf = String(m.user._id) === String(req.user._id);

      return {
        _id: m._id,
        relationship: m.relationship,
        addedBy: m.addedBy,
        user: m.user,
        isLinkedAccount: isRegisteredAccount && !isSelf,
        isSelf,
        createdAt: m.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedMembers.length,
      members: formattedMembers,
    });
  } catch (error) {
    console.error("getMembers error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving family members.",
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
      .populate("user", "-password -__v")
      .populate("addedBy", "fullName email");

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Family member not found.",
      });
    }

    return res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    console.error("getMember error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch family member.",
    });
  }
};

// =======================================
// Update Member Details (Strict Linking Rules)
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
        message: "Family member record not found.",
      });
    }

    const user = await User.findById(member.user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    const isSelf = String(user._id) === String(req.user._id);
    const isLinkedRegisteredUser = user.isProfileComplete && !isSelf;

    const {
      relationship,
      fullName,
      phone,
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

    if (relationship) {
      if (!RELATIONSHIPS.has(relationship)) return res.status(400).json({ success: false, message: "Please choose a supported family relationship." });
      member.relationship = relationship;
      const linkedUser = await User.findById(member.user).select("family");
      if (linkedUser?.family) {
        await FamilyMember.updateOne(
          { family: linkedUser.family, user: req.user._id, isActive: true },
          { $set: { relationship: INVERSE_RELATIONSHIP[relationship] || "Other" } },
        );
      }
    }

    // Protection rule: Linked registered users can ONLY manage their own personal profile
    if (isLinkedRegisteredUser) {
      await member.save();
      return res.status(200).json({
        success: true,
        message: "Relationship updated. Linked user's personal profile can only be edited by themselves.",
        member,
      });
    }

    // Unlinked or self member update
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
    if (doctorRecommendations !== undefined) user.doctorRecommendations = doctorRecommendations;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    await member.save();

    const updatedMember = await FamilyMember.findById(member._id)
      .populate("user", "-password -__v")
      .populate("addedBy", "fullName email");

    return res.status(200).json({
      success: true,
      message: "Family member updated successfully.",
      member: updatedMember,
    });
  } catch (error) {
    console.error("updateMember error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update member.",
    });
  }
};

// =======================================
// Delete / Remove Family Relationship
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
        message: "Member link not found.",
      });
    }

    member.isActive = false;
    await member.save();

    // Pull from primary family members list
    await Family.findByIdAndUpdate(req.user.family._id, {
      $pull: { members: member.user },
    });

    // A relationship is an edge shared by two users; remove the reciprocal edge too.
    const targetUser = await User.findById(member.user).select("family");
    if (targetUser?.family) {
      await FamilyMember.updateOne(
        { family: targetUser.family, user: req.user._id, isActive: true },
        { $set: { isActive: false } },
      );
      await Family.findByIdAndUpdate(targetUser.family, { $pull: { members: req.user._id } });
    }

    return res.status(200).json({
      success: true,
      message: "Family relationship removed successfully. User account remains intact.",
    });
  } catch (error) {
    console.error("deleteMember error:", error);
    return res.status(500).json({
      success: false,
      message: "Error removing family relationship.",
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
