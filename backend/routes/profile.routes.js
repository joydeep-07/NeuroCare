const express = require("express");

const protect = require("../middlewares/auth.middleware");

const {
  completeProfile,
  getProfile,
  updateProfile,
} = require("../controllers/profile.controller");

const router = express.Router();

router.use(protect);

router.get("/", getProfile);

router.put("/complete", completeProfile);

router.put("/update", updateProfile);

module.exports = router;
