const User = require("../models/user.model");
const Appointment = require("../models/appointment.model");

// =======================================
// Get / Search Doctors (Public / Patient)
// =======================================
const getDoctors = async (req, res) => {
  try {
    const { query, specialty, hospital, location, city, state, availability } = req.query;

    const filter = {
      role: "doctor",
      isActive: true,
    };

    if (specialty) {
      filter.specialization = { $regex: specialty, $options: "i" };
    }

    if (hospital) {
      filter.hospital = { $regex: hospital, $options: "i" };
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }
    if (city) filter.city = { $regex: city, $options: "i" };
    if (state) filter.state = { $regex: state, $options: "i" };
    if (availability) filter.availability = { $elemMatch: { day: { $regex: availability, $options: "i" } } };

    if (query) {
      filter.$or = [
        { fullName: { $regex: query, $options: "i" } },
        { specialization: { $regex: query, $options: "i" } },
        { hospital: { $regex: query, $options: "i" } },
        { department: { $regex: query, $options: "i" } },
        { biography: { $regex: query, $options: "i" } },
      ];
    }

    const doctors = await User.find(filter)
      .select("-password -__v")
      .sort({ rating: -1, yearsOfExperience: -1 });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("getDoctors error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve doctors list.",
    });
  }
};

// =======================================
// Get Doctor Profile By ID
// =======================================
const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" }).select("-password -__v");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching doctor details.",
    });
  }
};

// =======================================
// Doctor Portal Dashboard Stats & Appointments
// =======================================
const getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Strict privacy rule: Doctor sees ONLY appointments assigned to them!
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "fullName email phone gender dateOfBirth bloodGroup height weight illness medicalHistory avatar")
      .populate("familyMember", "fullName relationship phone gender dateOfBirth bloodGroup height weight illness medicalHistory avatar")
      .sort({ createdAt: -1 });

    const totalAppointments = appointments.length;
    const confirmedAppointments = appointments.filter((a) => a.status === "Confirmed" || a.status === "Checked In" || a.status === "In Consultation");
    const completedAppointments = appointments.filter((a) => a.status === "Completed");
    const pendingAppointments = appointments.filter((a) => a.status === "Pending Approval" || a.status === "Requested");

    return res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        confirmedCount: confirmedAppointments.length,
        completedCount: completedAppointments.length,
        pendingCount: pendingAppointments.length,
      },
      appointments,
    });
  } catch (error) {
    console.error("getDoctorDashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Error loading doctor dashboard.",
    });
  }
};

// =======================================
// Update Doctor Availability
// =======================================
const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body; // array of { day, slots }

    const doctor = await User.findById(req.user._id);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Only doctors can update availability." });
    }

    doctor.availability = availability || doctor.availability;
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Availability schedule updated successfully.",
      availability: doctor.availability,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating schedule." });
  }
};

// =======================================
// Complete Patient Consultation (Add Diagnosis & Prescription)
// =======================================
const completeConsultation = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { diagnosis, prescription, digitalPrescriptionUrl, followUpDate, doctorNotes } = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment record not found." });
    }

    // Verify appointment belongs to this doctor
    if (String(appointment.doctor) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only complete consultations assigned to you.",
      });
    }

    if (diagnosis !== undefined) appointment.diagnosis = diagnosis;
    if (prescription !== undefined) appointment.prescription = prescription;
    if (digitalPrescriptionUrl !== undefined) appointment.digitalPrescriptionUrl = digitalPrescriptionUrl;
    if (followUpDate !== undefined) appointment.followUpDate = followUpDate;
    if (doctorNotes !== undefined) appointment.doctorNotes = doctorNotes;

    appointment.status = "Completed";
    await appointment.save();

    const updatedAppt = await Appointment.findById(appointment._id)
      .populate("patient", "fullName email phone")
      .populate("familyMember", "fullName relationship")
      .populate("doctor", "fullName specialization hospital");

    return res.status(200).json({
      success: true,
      message: "Consultation marked as completed successfully.",
      appointment: updatedAppt,
    });
  } catch (error) {
    console.error("completeConsultation error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating consultation details.",
    });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getDoctorDashboard,
  updateAvailability,
  completeConsultation,
};
