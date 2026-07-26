const express = require("express");
const { handleAIChat } = require("../controllers/ai.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/chat", protect, handleAIChat);

module.exports = router;
