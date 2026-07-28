const aiService = require("../services/ai.service");

const handleAIChat = async (req, res, next) => {
  try {
    const { prompt, sessionId, language, city } = req.body;
    if (typeof prompt !== "string" || !prompt.trim()) return res.status(400).json({ success: false, message: "A health question is required." });
    if (prompt.length > 2000) return res.status(400).json({ success: false, message: "Please keep your message under 2,000 characters." });
    const result = await aiService.chat({ userId: String(req.user._id), sessionId, prompt: prompt.trim(), language, city });
    return res.json({ success: true, mode: "health_navigation", ...result });
  } catch (error) { return next(error); }
};

module.exports = { handleAIChat };
