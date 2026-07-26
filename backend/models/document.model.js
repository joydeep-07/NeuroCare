const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    familyMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    documentType: {
      type: String,
      enum: [
        "Prescription",
        "Blood Report",
        "MRI",
        "CT Scan",
        "ECG",
        "Ultrasound",
        "X-Ray",
        "Other",
      ],
      default: "Other",
    },
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: "",
    },
    aiSummary: {
      type: String,
      default: "",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Document", documentSchema);
