const express = require("express");

const protect = require("../middlewares/auth.middleware");

const {
  addMember,
  getMembers,
  getMember,
  updateMember,
  deleteMember,
} = require("../controllers/member.controller");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Add Member
router.post("/", addMember);

// Get All Members
router.get("/", getMembers);

// Get Single Member
router.get("/:id", getMember);

// Update Member
router.put("/:id", updateMember);

// Delete Member (Soft Delete)
router.delete("/:id", deleteMember);

module.exports = router;
