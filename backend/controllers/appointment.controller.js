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
    const { doctorId, familyMemberId, symptoms, reason, uploadedReports, requestedDate, preferredTime } = req.body;

    if (req.user.role !== "patient") {
      return res.status(403).json({ success: false, message: "Only patient accounts can book appointments." });
    }
    if (!doctorId || !symptoms || !requestedDate || !preferredTime) {
      return res.status(400).json({
        success: false,
        message: "Doctor, symptoms, appointment date, and an available time slot are required.",
      });
    }

    const doctor = await User.findOne({ _id: doctorId, role: "doctor", isActive: true });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Selected doctor not found.",
      });
    }

    const appointmentDate = new Date(`${requestedDate}T00:00:00`);
    if (Number.isNaN(appointmentDate.getTime()) || appointmentDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      return res.status(400).json({ success: false, message: "Please choose a valid future appointment date." });
    }
    const weekday = appointmentDate.toLocaleDateString("en-US", { weekday: "long" });
    const schedule = doctor.availability.find((item) => item.day === weekday);
    if (!schedule?.slots.includes(preferredTime)) {
      return res.status(400).json({ success: false, message: "That time is not available for the selected doctor." });
    }
    const occupied = await Appointment.exists({ doctor: doctor._id, confirmedDate: requestedDate, confirmedTime: preferredTime, status: { $nin: ["Cancelled", "Rejected"] } });
    if (occupied) return res.status(409).json({ success: false, message: "That time slot was just booked. Please select another slot." });

    let familyMember = null;
    if (familyMemberId) {
      const FamilyMember = require("../models/familyMember.model");
      const relation = await FamilyMember.findOne({ family: req.user.family, user: familyMemberId, isActive: true });
      if (!relation) return res.status(403).json({ success: false, message: "You can only book for members of your own family." });
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
      requestedDate: appointmentDate,
      confirmedDate: requestedDate,
      confirmedTime: preferredTime,
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
    // One document is shared by its booking owner and its actual patient.
    // This keeps family histories in sync without duplicating appointments.
    const appointments = await Appointment.find({
      $or: [{ patient: req.user._id }, { familyMember: req.user._id }],
    })
      .populate("doctor", "fullName email phone specialization hospital department consultationFee avatar location")
      .populate("patient", "fullName email phone gender dateOfBirth bloodGroup avatar")
      .populate("familyMember", "fullName relationship phone gender dateOfBirth bloodGroup avatar")
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

    const isBookingOwner = String(appointment.patient._id) === String(req.user._id);
    const isActualPatient = appointment.familyMember && String(appointment.familyMember._id) === String(req.user._id);
    const isDoctor = String(appointment.doctor._id) === String(req.user._id);
    const doctorVisibleStatuses = ["Confirmed", "Rescheduled", "Checked In", "In Consultation", "Completed"];
    if (req.user.role === "doctor" && (!isDoctor || !doctorVisibleStatuses.includes(appointment.status))) {
      return res.status(403).json({ success: false, message: "This appointment has not been approved for doctor access." });
    }
    if (req.user.role !== "admin" && !isBookingOwner && !isActualPatient && !isDoctor) {
      return res.status(403).json({ success: false, message: "You are not allowed to view this appointment." });
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
