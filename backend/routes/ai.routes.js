const express = require("express");
const {
  handleAIChat,
  handleDoctorRecommendation,
  handlePatientHealthSummary,
  handleClinicalOverview,
  handleAnalyzeDocument,
  handleCompareDocuments,
} = require("../controllers/ai.controller");
const {
  listConversations,
  createConversation,
  getConversation,
} = require("../controllers/aiConversation.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

// Conversation management
router.get("/conversations", listConversations);
router.post("/conversations", createConversation);
router.get("/conversations/:id", getConversation);

// Core AI endpoints
router.post("/chat", handleAIChat);
router.post("/recommend-doctors", handleDoctorRecommendation);
router.get("/patient-summary", handlePatientHealthSummary);
router.get("/clinical-overview/:appointmentId", authorize("doctor", "admin"), handleClinicalOverview);
router.post("/analyze-document/:id", handleAnalyzeDocument);
router.post("/compare-documents", handleCompareDocuments);

module.exports = router;
