const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    description: {
      type: String,
      default: "",
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: "",
    },
    fileType: {
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

documentSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model("Document", documentSchema);
