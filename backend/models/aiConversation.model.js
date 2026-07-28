const mongoose = require("mongoose");

const aiMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true, trim: true, maxlength: 6000 },
  specialty: { type: String, default: "" },
  triageLevel: { type: String, default: "" },
  doctors: [{ type: mongoose.Schema.Types.Mixed }],
}, { timestamps: true, _id: true });

const aiConversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 80 },
  messages: { type: [aiMessageSchema], default: [] },
}, { timestamps: true });

aiConversationSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model("AIConversation", aiConversationSchema);
