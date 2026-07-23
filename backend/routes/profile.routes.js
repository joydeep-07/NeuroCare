const express = require("express");

const protect = require("../middlewares/auth.middleware");

const {
  completeProfile,
  getProfile,
} = require("../controllers/profile.controller");

const router = express.Router();

router.use(protect);

router.get("/", getProfile);

router.put("/complete", completeProfile);

module.exports = router;
