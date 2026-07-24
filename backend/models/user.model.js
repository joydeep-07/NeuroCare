const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    relationship: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: null,
    },

    dateOfBirth: {
      type: Date,
      default: null,
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

    illness: {
      type: String,
      default: "",
    },

    notes: {
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

    avatar: {
      type: String,
      default: "",
    },

    provider: {
      type: String,
      enum: ["otp", "google"],
      default: "otp",
    },

    googleId: {
      type: String,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    family: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      default: null,
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },

    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
