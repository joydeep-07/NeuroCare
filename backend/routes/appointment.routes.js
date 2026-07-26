const express = require("express");
const {
  requestAppointment,
  getPatientAppointments,
  getAppointmentById,
  cancelAppointment,
} = require("../controllers/appointment.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.post("/request", requestAppointment);
router.get("/my-appointments", getPatientAppointments);
router.get("/:id", getAppointmentById);
router.put("/:id/cancel", cancelAppointment);

module.exports = router;
