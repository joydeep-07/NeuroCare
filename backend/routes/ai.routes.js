const express = require("express");
const { handleAIChat } = require("../controllers/ai.controller");
const { listConversations, createConversation, getConversation } = require("../controllers/aiConversation.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);
router.get("/conversations", listConversations);
router.post("/conversations", createConversation);
router.get("/conversations/:id", getConversation);
router.post("/chat", handleAIChat);

module.exports = router;
