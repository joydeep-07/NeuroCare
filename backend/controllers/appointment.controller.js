const Appointment = require("../models/appointment.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");

// Helper to generate readable appointment ID (e.g. NC-84920)
const generateAppointmentId = () => {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `NC-${rand}`;
};

// =======================================
// Submit Appointment Request (Patient)
// =======================================
const requestAppointment = async (req, res) => {
  try {
    const { doctorId, familyMemberId, symptoms, reason, uploadedReports, requestedDate } = req.body;

    if (!doctorId || !symptoms) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID and Symptoms are required.",
      });
    }

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Selected doctor not found.",
      });
    }

    let familyMember = null;
    if (familyMemberId) {
      familyMember = await User.findById(familyMemberId);
    }

    const appointmentId = generateAppointmentId();

    const appointment = await Appointment.create({
      appointmentId,
      patient: req.user._id,
      familyMember: familyMember ? familyMember._id : null,
      doctor: doctor._id,
      hospital: doctor.hospital || "NeuroCare General Hospital",
      department: doctor.department || doctor.specialization,
      symptoms,
      reason: reason || "",
      uploadedReports: uploadedReports || [],
      requestedDate: requestedDate ? new Date(requestedDate) : new Date(),
      status: "Pending Approval",
    });

    // Send Notification to Patient
    await Notification.create({
      recipient: req.user._id,
      title: "Appointment Request Submitted",
      message: `Your appointment request for Dr. ${doctor.fullName} (${doctor.specialization}) is under review by our hospital administration. Appointment ID: ${appointmentId}`,
      type: "appointment",
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "fullName email phone")
      .populate("familyMember", "fullName relationship")
      .populate("doctor", "fullName specialization hospital consultationFee avatar");

    return res.status(201).json({
      success: true,
      message: "Appointment request submitted successfully. Status: Pending Approval",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("requestAppointment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit appointment request.",
    });
  }
};

// =======================================
// Get Patient's Appointments
// =======================================
const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate("doctor", "fullName email phone specialization hospital department consultationFee avatar location")
      .populate("familyMember", "fullName relationship phone gender avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("getPatientAppointments error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching appointments.",
    });
  }
};

// =======================================
// Get Appointment Details By ID
// =======================================
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "fullName email phone gender dateOfBirth bloodGroup height weight illness medicalHistory avatar")
      .populate("familyMember", "fullName relationship phone gender dateOfBirth bloodGroup height weight illness medicalHistory avatar")
      .populate("doctor", "fullName email phone specialization hospital department consultationFee location avatar biography");

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    return res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching appointment details." });
  }
};

// =======================================
// Cancel Appointment (Patient)
// =======================================
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    if (String(appointment.patient) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled.",
      appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error cancelling appointment." });
  }
};

module.exports = {
  requestAppointment,
  getPatientAppointments,
  getAppointmentById,
  cancelAppointment,
};
