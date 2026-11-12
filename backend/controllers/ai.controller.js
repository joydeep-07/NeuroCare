const aiService = require("../services/ai.service");

// ==========================================
// 1. Context-Aware AI Chat (Patient / Member)
// ==========================================
const handleAIChat = async (req, res, next) => {
  try {
    const { prompt, sessionId, language, city } = req.body;
    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ success: false, message: "A health question is required." });
    }
    if (prompt.length > 3000) {
      return res.status(400).json({ success: false, message: "Please keep your message under 3,000 characters." });
    }

    const result = await aiService.chat({
      userId: String(req.user._id),
      sessionId,
      prompt: prompt.trim(),
      language,
      city,
    });

    return res.json({ success: true, mode: "health_navigation", ...result });
  } catch (error) {
    return next(error);
  }
};

// ==========================================
// 2. Intelligent Doctor Recommendation System
// ==========================================
const handleDoctorRecommendation = async (req, res, next) => {
  try {
    const { symptoms, preferredLocation, limit } = req.body;
    if (!symptoms || typeof symptoms !== "string" || !symptoms.trim()) {
      return res.status(400).json({ success: false, message: "Please describe your symptoms or medical requirements." });
    }

    const result = await aiService.recommendDoctors({
      symptoms: symptoms.trim(),
      preferredLocation: preferredLocation ? preferredLocation.trim() : "",
      userProfile: req.user,
      limit: Number(limit) || 6,
    });

    return res.json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

// ==========================================
// 3. Patient Health Profile & History Summary
// ==========================================
const handlePatientHealthSummary = async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const result = await aiService.getPatientHealthSummary({
      requestingUser: req.user,
      targetPatientId: patientId,
    });

    return res.json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

// ==========================================
// 4. AI Doctor Assistant – Clinical Overview
// ==========================================
const handleClinicalOverview = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is required." });
    }

    const result = await aiService.generateClinicalOverview({
      doctor: req.user,
      appointmentId,
    });

    return res.json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

// ==========================================
// 5. Medical Report Document Analysis
// ==========================================
const handleAnalyzeDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Document ID is required." });
    }

    const result = await aiService.analyzeMedicalDocument({
      requestingUser: req.user,
      documentId: id,
    });

    return res.json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

// ==========================================
// 6. Historical Medical Reports Comparison
// ==========================================
const handleCompareDocuments = async (req, res, next) => {
  try {
    const { documentIds } = req.body;
    if (!Array.isArray(documentIds) || documentIds.length < 2) {
      return res.status(400).json({ success: false, message: "Please provide an array of at least 2 document IDs to compare." });
    }

    const result = await aiService.compareHistoricalReports({
      requestingUser: req.user,
      documentIds,
    });

    return res.json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  handleAIChat,
  handleDoctorRecommendation,
  handlePatientHealthSummary,
  handleClinicalOverview,
  handleAnalyzeDocument,
  handleCompareDocuments,
};
