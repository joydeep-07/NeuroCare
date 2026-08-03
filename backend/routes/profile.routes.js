const express = require("express");
const multer = require("multer");

const { protect } = require("../middlewares/auth.middleware");

const {
  completeProfile,
  getProfile,
  updateProfile,
  updateAvatar,
} = require("../controllers/profile.controller");

const router = express.Router();

// Protect all profile routes
router.use(protect);

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed."));
    }
    callback(null, true);
  },
});

// Get Profile
router.get("/", getProfile);

// Complete Profile
router.put("/complete", completeProfile);

// Update Profile
router.put("/update", updateProfile);
router.patch("/avatar", (req, res, next) => {
  upload.single("avatar")(req, res, (error) => {
    if (!error) return next();
    const message = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
      ? "Image must be 5 MB or smaller."
      : error.message || "Invalid image upload.";
    return res.status(400).json({ success: false, message });
  });
}, updateAvatar);

module.exports = router;
