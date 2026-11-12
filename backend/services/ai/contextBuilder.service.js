const User = require("../../models/user.model");
const Appointment = require("../../models/appointment.model");
const Document = require("../../models/document.model");
const FamilyMember = require("../../models/familyMember.model");

/**
 * Calculates approximate age from Date of Birth.
 */
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

/**
 * Calculates BMI from height (cm) and weight (kg).
 */
const calculateBMI = (heightCm, weightKg) => {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let category = "Normal";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi >= 25 && bmi < 30) category = "Overweight";
  else if (bmi >= 30) category = "Obese";
  return { value: Number(bmi.toFixed(1)), category };
};

/**
 * Retrieves sanitized, authenticated patient context for AI generation.
 * Role-Based Access Control enforced:
 * - Patient: can access self or managed family member records only.
 * - Doctor: can access patient records ONLY if the doctor has an authorized appointment with that patient.
 */
const buildPatientContext = async ({ requestingUser, targetPatientId = null }) => {
  if (!requestingUser) return null;

  let patientId = targetPatientId || requestingUser._id;

  // Enforce access control
  if (requestingUser.role === "patient") {
    if (String(patientId) !== String(requestingUser._id)) {
      // Must be a managed family member
      const isManagedMember = await FamilyMember.findOne({
        family: requestingUser.family,
        user: patientId,
        isActive: true,
      });
      if (!isManagedMember) {
        throw Object.assign(new Error("Unauthorized: You can only view health records for yourself or managed family members."), { statusCode: 403 });
      }
    }
  } else if (requestingUser.role === "doctor") {
    if (!targetPatientId) {
      throw Object.assign(new Error("Doctor must specify an authorized patient ID."), { statusCode: 400 });
    }
    // Verify this doctor has at least one valid appointment with the patient
    const hasAuthorizedAppointment = await Appointment.findOne({
      doctor: requestingUser._id,
      $or: [{ patient: targetPatientId }, { familyMember: targetPatientId }],
      status: { $in: ["Confirmed", "Rescheduled", "Checked In", "In Consultation", "Completed"] },
    });
    if (!hasAuthorizedAppointment) {
      throw Object.assign(new Error("Unauthorized: Doctor does not have an active consultation assignment for this patient."), { statusCode: 403 });
    }
  }

  // Fetch patient profile
  const patient = await User.findById(patientId).select(
    "fullName gender dateOfBirth bloodGroup height weight illness notes medicalHistory city state location"
  );
  if (!patient) return null;

  const age = calculateAge(patient.dateOfBirth);
  const bmi = calculateBMI(patient.height, patient.weight);

  // Fetch appointments (latest 8)
  const appointments = await Appointment.find({
    $or: [{ patient: patient._id }, { familyMember: patient._id }],
  })
    .populate("doctor", "fullName specialization hospital")
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  const formattedAppointments = appointments.map((appt) => ({
    id: appt.appointmentId,
    doctorName: appt.doctor?.fullName || "Specialist",
    specialization: appt.doctor?.specialization || "",
    hospital: appt.hospital || appt.doctor?.hospital || "",
    symptoms: appt.symptoms,
    status: appt.status,
    date: appt.confirmedDate || (appt.requestedDate ? new Date(appt.requestedDate).toISOString().split("T")[0] : null),
    diagnosis: appt.diagnosis || "",
    prescriptions: (appt.prescription || []).map((p) => `${p.medicine} (${p.dosage || ""}, ${p.frequency || ""}, ${p.duration || ""})`).filter(Boolean),
    doctorNotes: appt.doctorNotes || "",
  }));

  // Fetch uploaded medical documents
  const documents = await Document.find({ patient: patient._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const formattedDocuments = documents.map((doc) => ({
    id: String(doc._id),
    title: doc.title,
    documentType: doc.documentType,
    uploadDate: new Date(doc.createdAt).toISOString().split("T")[0],
    summary: doc.aiSummary || doc.description || "Uploaded medical file.",
  }));

  return {
    patient: {
      id: String(patient._id),
      fullName: patient.fullName,
      gender: patient.gender || "Not specified",
      age: age ? `${age} years` : "Not specified",
      bloodGroup: patient.bloodGroup || "Not specified",
      height: patient.height ? `${patient.height} cm` : "Not specified",
      weight: patient.weight ? `${patient.weight} kg` : "Not specified",
      bmi: bmi ? `${bmi.value} (${bmi.category})` : "Not calculated",
      chronicIllnesses: patient.illness ? [patient.illness] : [],
      medicalHistory: patient.medicalHistory || [],
      allergiesAndNotes: patient.notes || "None recorded",
      location: patient.city || patient.location || "Not specified",
    },
    appointments: formattedAppointments,
    documents: formattedDocuments,
  };
};

module.exports = {
  calculateAge,
  calculateBMI,
  buildPatientContext,
};
