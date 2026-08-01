const User = require("../models/user.model");
const Appointment = require("../models/appointment.model");
const Notification = require("../models/notification.model");

// =======================================
// Admin Dashboard Analytics
// =======================================
const getAdminDashboard = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalDoctors = await User.countDocuments({ role: "doctor" });
    const totalAppointments = await Appointment.countDocuments();
    const pendingRequests = await Appointment.countDocuments({ status: "Pending Approval" });
    const completedConsultations = await Appointment.countDocuments({ status: "Completed" });
    const confirmedAppointments = await Appointment.countDocuments({ status: "Confirmed" });

    const recentAppointments = await Appointment.find()
      .populate("patient", "fullName firstName lastName dob dateOfBirth gender avatar email phone")
      .populate("familyMember", "fullName firstName lastName dob dateOfBirth gender avatar relationship")
      .populate("doctor", "fullName specialization hospital")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        pendingRequests,
        completedConsultations,
        confirmedAppointments,
      },
      recentAppointments,
    });
  } catch (error) {
    console.error("getAdminDashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load admin analytics.",
    });
  }
};

// =======================================
// Create Doctor Account (Admin Only)
// =======================================
const createDoctor = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      medicalRegNo,
      specialization,
      degree,
      hospital,
      department,
      yearsOfExperience,
      consultationFee,
      biography,
      avatar,
      availability,
      location,
    } = req.body;

    if (!email || !fullName || !medicalRegNo || !specialization || !hospital) {
      return res.status(400).json({
        success: false,
        message: "Full Name, Email, Medical Registration Number, Specialization, and Hospital are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account with email ${cleanEmail} already exists.`,
      });
    }

    const defaultAvailability = availability || [
      { day: "Monday", slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"] },
      { day: "Tuesday", slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"] },
      { day: "Wednesday", slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"] },
      { day: "Thursday", slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"] },
      { day: "Friday", slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"] },
      { day: "Saturday", slots: ["10:00 AM", "01:00 PM"] },
    ];

    const doctor = await User.create({
      email: cleanEmail,
      fullName,
      phone: phone || "",
      medicalRegNo,
      specialization,
      degree: degree || "MBBS, MD",
      hospital,
      department: department || specialization,
      yearsOfExperience: Number(yearsOfExperience) || 5,
      consultationFee: Number(consultationFee) || 500,
      biography:
        biography ||
        `Dr. ${fullName} is a distinguished specialist in ${specialization} at ${hospital}.`,
      avatar:
        avatar ||
        "https://i.pinimg.com/1200x/5d/90/30/5d90305c3e338f4b17a52fd8dccf83b8.jpg",
      location: location || "New Delhi, India",
      availability: defaultAvailability,
      provider: "otp",
      role: "doctor",
      isVerified: true,
      isProfileComplete: true,
    });

    return res.status(201).json({
      success: true,
      message: `Doctor account for Dr. ${fullName} created successfully. Login ID: ${cleanEmail}`,
      doctor,
    });
  } catch (error) {
    console.error("createDoctor error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create doctor account.",
    });
  }
};

// =======================================
// Get All Appointments (Admin Management Queue)
// =======================================
const getAllAppointments = async (req, res) => {
  try {
    const { status, doctorId, patientId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (doctorId) filter.doctor = doctorId;
    if (patientId) filter.patient = patientId;

    const appointments = await Appointment.find(filter)
      .populate("patient", "fullName firstName lastName dob dateOfBirth gender avatar email phone bloodGroup height weight illness medicalHistory")
      .populate("familyMember", "fullName firstName lastName dob dateOfBirth gender avatar relationship phone bloodGroup height weight illness medicalHistory")
      .populate("doctor", "fullName email phone specialization hospital department consultationFee avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("getAllAppointments error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching appointments.",
    });
  }
};

// =======================================
// Admin Appointment Scheduling Workflow: Confirm / Assign Date, Time, Mode, Instructions
// =======================================
const scheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmedDate, confirmedTime, consultationMode, adminInstructions, status } = req.body;

    const appointment = await Appointment.findById(id)
      .populate("patient", "fullName email")
      .populate("doctor", "fullName specialization hospital");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment record not found.",
      });
    }

    if (confirmedDate) appointment.confirmedDate = confirmedDate;
    if (confirmedTime) appointment.confirmedTime = confirmedTime;
    if (consultationMode) appointment.consultationMode = consultationMode;
    if (adminInstructions !== undefined) appointment.adminInstructions = adminInstructions;

    const targetStatus = status || "Confirmed";
    const activeStatuses = ["Pending Approval", "Confirmed", "Rescheduled", "Checked In", "In Consultation"];
    const targetDate = confirmedDate || appointment.confirmedDate;
    const targetTime = confirmedTime || appointment.confirmedTime;
    if (activeStatuses.includes(targetStatus)) {
      if (!targetDate || !targetTime) return res.status(400).json({ success: false, message: "A date and time are required for an active appointment." });
      const conflict = await Appointment.exists({
        _id: { $ne: appointment._id },
        doctor: appointment.doctor._id,
        confirmedDate: targetDate,
        confirmedTime: targetTime,
        status: { $in: activeStatuses },
      });
      if (conflict) return res.status(409).json({ success: false, message: "The selected doctor already has an appointment at that time." });
    }
    appointment.status = targetStatus;

    await appointment.save();

    // Create notifications for patient and doctor
    await Notification.create({
      recipient: appointment.patient._id,
      title: `Appointment ${targetStatus}`,
      message: `Your appointment with Dr. ${appointment.doctor.fullName} at ${appointment.hospital} has been ${targetStatus.toLowerCase()} for ${appointment.confirmedDate} at ${appointment.confirmedTime} (${appointment.consultationMode}).`,
      type: "appointment",
    });

    if (["Confirmed", "Rescheduled", "Checked In", "In Consultation"].includes(targetStatus)) {
      const actualPatient = appointment.familyMember || appointment.patient;
      await Notification.create({
        recipient: appointment.doctor._id,
        title: "New Approved Patient Appointment",
        message: `Approved appointment with patient ${actualPatient.fullName} for ${appointment.confirmedDate} at ${appointment.confirmedTime} (${appointment.consultationMode}).`,
        type: "appointment",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Appointment successfully ${targetStatus.toLowerCase()}.`,
      appointment,
    });
  } catch (error) {
    console.error("scheduleAppointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to schedule appointment.",
    });
  }
};

// =======================================
// Admin Toggle User / Doctor Status
// =======================================
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.fullName || user.email} ${user.isActive ? "activated" : "deactivated"}.`,
      isActive: user.isActive,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error toggling user status." });
  }
};

module.exports = {
  getAdminDashboard,
  createDoctor,
  getAllAppointments,
  scheduleAppointment,
  toggleUserStatus,
};
