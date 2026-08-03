const mongoose = require("mongoose");

const geoPointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length === 2 && value.every(Number.isFinite),
        message: "Coordinates must contain longitude and latitude.",
      },
    },
  },
  { _id: false },
);

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

    avatarSource: {
      type: String,
      enum: ["default", "google", "uploaded"],
      default: "default",
    },

    avatarPublicId: {
      type: String,
      default: "",
    },

    provider: {
      type: String,
      // Keep "otp" for existing records while using "email" for new OTP accounts.
      enum: ["email", "otp", "google", "password"],
      default: "email",
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

    city: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true },
    country: { type: String, default: "India", trim: true },
    languages: [{ type: String, trim: true }],
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    profilePhoto: { type: String, default: "" },
    // Optional GeoJSON point. Do not default `type` to Point: a 2dsphere index
    // rejects an incomplete { type: "Point" } value with no coordinate array.
    coordinates: { type: geoPointSchema, default: undefined },

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

// Supports fast doctor discovery without exposing or duplicating doctor data.
userSchema.index({ role: 1, isActive: 1, specialization: 1, city: 1 });
userSchema.index({ role: 1, isActive: 1, rating: -1, yearsOfExperience: -1 });
userSchema.index({ coordinates: "2dsphere" }, { sparse: true });

module.exports = mongoose.model("User", userSchema);

