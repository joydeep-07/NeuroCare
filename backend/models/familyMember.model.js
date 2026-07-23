const mongoose = require("mongoose");

const familyMemberSchema = new mongoose.Schema(
  {
    family: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      required: true,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    relationship: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    bloodGroup: {
      type: String,
      default: "",
    },

    height: {
      type: Number,
      default: null,
    },

    weight: {
      type: Number,
      default: null,
    },

    allergies: [
      {
        type: String,
      },
    ],

    illness: {
      type: String,
      default: "",
    },

    medicalHistory: [
      {
        type: String,
      },
    ],

    doctorRecommendations: [
      {
        type: String,
      },
    ],

    medicines: [
      {
        medicineName: {
          type: String,
        },

        dosage: {
          type: String,
        },

        frequency: {
          type: String,
        },

        duration: {
          type: String,
        },
      },
    ],

    reports: [
      {
        reportName: {
          type: String,
        },

        reportUrl: {
          type: String,
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    appointmentStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },

    appointmentDate: {
      type: Date,
      default: null,
    },

    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("FamilyMember", familyMemberSchema);
