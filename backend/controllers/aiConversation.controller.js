const mongoose = require("mongoose");
const AIConversation = require("../models/aiConversation.model");

const listConversations = async (req, res, next) => {
  try {
    const conversations = await AIConversation.find({ user: req.user._id })
      .select("title createdAt updatedAt messages")
      .sort({ updatedAt: -1 });
    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

const createConversation = async (req, res, next) => {
  try {
    const conversation = await AIConversation.create({
      user: req.user._id,
      title: "New Health Consultation",
    });
    res.status(201).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

const getConversation = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }
    const conversation = await AIConversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }
    return res.json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

const updateConversation = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }
    const { title } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ success: false, message: "Chat title cannot be empty." });
    }
    const trimmedTitle = title.trim().slice(0, 80);
    const conversation = await AIConversation.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title: trimmedTitle },
      { new: true }
    );
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }
    return res.json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

const deleteConversation = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }
    const conversation = await AIConversation.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }
    return res.json({
      success: true,
      message: "Conversation and messages deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listConversations,
  createConversation,
  getConversation,
  updateConversation,
  deleteConversation,
};
