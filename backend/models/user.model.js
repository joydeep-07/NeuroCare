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
      enum: ["Male", "Female", "Other", null],
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
      enum: ["otp", "google", "password"],
      default: "otp",
    },

    password: {
      type: String,
      default: null,
    },

    googleId: {
      type: String,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
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

    // Doctor Specific Fields
    medicalRegNo: {
      type: String,
      default: "",
    },

    specialization: {
      type: String,
      default: "",
    },

    degree: {
      type: String,
      default: "",
    },

    hospital: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "",
    },

    yearsOfExperience: {
      type: Number,
      default: 0,
    },

    consultationFee: {
      type: Number,
      default: 0,
    },

    biography: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 4.8,
    },

    reviewsCount: {
      type: Number,
      default: 18,
    },

    location: {
      type: String,
      default: "New Delhi, India",
    },

    availability: [
      {
        day: { type: String },
        slots: [{ type: String }],
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
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

