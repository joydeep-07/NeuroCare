const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
      unique: true,
    },
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
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hospital: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      default: "",
    },
    symptoms: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    uploadedReports: [
      {
        title: String,
        fileUrl: String,
      },
    ],
    requestedDate: {
      type: Date,
      default: Date.now,
    },
    confirmedDate: {
      type: String,
      default: null,
    },
    confirmedTime: {
      type: String,
      default: null,
    },
    consultationMode: {
      type: String,
      enum: ["In-Person", "Video Consultation"],
      default: "In-Person",
    },
    adminInstructions: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "Requested",
        "Pending Approval",
        "Confirmed",
        "Rescheduled",
        "Checked In",
        "In Consultation",
        "Completed",
        "Cancelled",
        "Rejected",
        "No Show",
      ],
      default: "Pending Approval",
    },
    diagnosis: {
      type: String,
      default: "",
    },
    prescription: [
      {
        medicine: String,
        dosage: String,
        frequency: String,
        duration: String,
        notes: String,
      },
    ],
    digitalPrescriptionUrl: {
      type: String,
      default: "",
    },
    followUpDate: {
      type: String,
      default: null,
    },
    doctorNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index(
  { doctor: 1, confirmedDate: 1, confirmedTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      confirmedDate: { $type: "string" },
      confirmedTime: { $type: "string" },
      status: { $in: ["Pending Approval", "Confirmed", "Rescheduled", "Checked In", "In Consultation"] },
    },
  },
);
appointmentSchema.index({ patient: 1, createdAt: -1 });
appointmentSchema.index({ doctor: 1, status: 1, confirmedDate: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
