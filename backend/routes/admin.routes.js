const express = require("express");
const {
  getAdminDashboard,
  createDoctor,
  getAllAppointments,
  scheduleAppointment,
  toggleUserStatus,
} = require("../controllers/admin.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// All admin routes require authentication and "admin" role
router.use(protect, authorize("admin"));

router.get("/dashboard", getAdminDashboard);
router.post("/doctors", createDoctor);
router.get("/appointments", getAllAppointments);
router.put("/appointments/:id/schedule", scheduleAppointment);
router.patch("/users/:userId/toggle-status", toggleUserStatus);

module.exports = router;
