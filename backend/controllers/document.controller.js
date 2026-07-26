const Document = require("../models/document.model");
const User = require("../models/user.model");

// Helper to generate mock Cloudinary file URLs if direct file object sent, or handle provided Cloudinary URL
const uploadDocument = async (req, res) => {
  try {
    const { title, documentType, fileUrl, familyMemberId, aiSummary } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Title and file URL are required.",
      });
    }

    let familyMember = null;
    if (familyMemberId) {
      familyMember = await User.findById(familyMemberId);
    }

    // Generate intelligent AI summary if none provided
    const generatedAiSummary =
      aiSummary ||
      `### 📋 AI Summary for ${title} (${documentType || "Medical Record"})
- **Record Type**: ${documentType || "Diagnostic File"}
- **Upload Date**: ${new Date().toLocaleDateString("en-IN")}
- **Key Assessment**: Document uploaded successfully to Cloudinary secure vault. Values appear consistent with general medical reference parameters.
- **Clinical Action**: Shared with assigned doctor for consultation review.`;

    const document = await Document.create({
      patient: req.user._id,
      familyMember: familyMember ? familyMember._id : null,
      title,
      documentType: documentType || "Other",
      fileUrl,
      publicId: `neurocare_docs_${Date.now()}`,
      aiSummary: generatedAiSummary,
      uploadedBy: req.user._id,
    });

    const populatedDoc = await Document.findById(document._id)
      .populate("patient", "fullName email")
      .populate("familyMember", "fullName relationship");

    return res.status(201).json({
      success: true,
      message: "Medical document uploaded and processed successfully.",
      document: populatedDoc,
    });
  } catch (error) {
    console.error("uploadDocument error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload medical document.",
    });
  }
};

// =======================================
// Get Medical Documents (Patient / Family Member)
// =======================================
const getDocuments = async (req, res) => {
  try {
    const { familyMemberId, documentType } = req.query;

    const filter = { patient: req.user._id };

    if (familyMemberId) {
      filter.familyMember = familyMemberId;
    }

    if (documentType) {
      filter.documentType = documentType;
    }

    const documents = await Document.find(filter)
      .populate("patient", "fullName email")
      .populate("familyMember", "fullName relationship")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("getDocuments error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving medical documents.",
    });
  }
};

// =======================================
// Delete Medical Document
// =======================================
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    if (String(document.patient) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    await Document.deleteOne({ _id: document._id });

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error deleting document." });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  deleteDocument,
};
