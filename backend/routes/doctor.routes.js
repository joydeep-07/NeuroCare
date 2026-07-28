const express = require("express");
const {
  getDoctors,
  getDoctorById,
  getDoctorDashboard,
  updateAvailability,
  completeConsultation,
} = require("../controllers/doctor.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// Doctor protected routes
router.get("/portal/dashboard", protect, authorize("doctor"), getDoctorDashboard);
router.put("/portal/availability", protect, authorize("doctor"), updateAvailability);
router.put("/portal/consultation/:appointmentId", protect, authorize("doctor"), completeConsultation);

// Public discovery routes must remain after named portal routes.
router.get("/", getDoctors);
router.get("/:id", getDoctorById);

module.exports = router;
