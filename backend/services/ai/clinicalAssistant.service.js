const Appointment = require("../../models/appointment.model");
const Document = require("../../models/document.model");
const { buildPatientContext } = require("./contextBuilder.service");
const { callGroqWithFallback } = require("./aiClient");

const CLINICAL_SYSTEM_PROMPT = `You are NeuroCare Clinical Decision Support Assistant, an AI system designed to assist registered medical doctors in evaluating patient health records prior to or during consultation.
Your output must be strictly evidence-based, medically structured, objective, and cautious.
CRITICAL SAFETY RULES:
1. You are a clinical decision-support tool, NOT a diagnostician. Never present considerations as definitive diagnoses.
2. Clearly highlight red-flag symptoms or findings requiring immediate evaluation.
3. Explicitly state uncertainty and highlight any missing clinical history.
4. Structure your response into the 6 mandated clinical sections:
   Section A: Patient Health Summary
   Section B: Symptoms Analysis
   Section C: Medical Report Analysis
   Section D: Potential Clinical Considerations (Differential Considerations)
   Section E: Suggested Follow-up (Questions to ask, diagnostic tests to consider, urgent red flags)
   Section F: Consultation Summary (Concise pre-consultation executive case summary)`;

/**
 * Generate Clinical Intelligence Overview for a Doctor regarding an authorized Appointment.
 */
const generateClinicalOverview = async ({ doctor, appointmentId }) => {
  if (!doctor || doctor.role !== "doctor") {
    throw Object.assign(new Error("Access restricted: Only verified doctors can access clinical intelligence."), { statusCode: 403 });
  }

  // 1. Fetch appointment and verify authorization
  const appointment = await Appointment.findById(appointmentId)
    .populate("patient", "fullName gender dateOfBirth bloodGroup height weight illness notes medicalHistory avatar phone email")
    .populate("familyMember", "fullName relationship gender dateOfBirth bloodGroup height weight illness notes medicalHistory avatar phone")
    .populate("doctor", "fullName specialization hospital");

  if (!appointment) {
    throw Object.assign(new Error("Appointment not found."), { statusCode: 404 });
  }

  const doctorVisibleStatuses = ["Confirmed", "Rescheduled", "Checked In", "In Consultation", "Completed"];
  if (String(appointment.doctor._id) !== String(doctor._id) || !doctorVisibleStatuses.includes(appointment.status)) {
    throw Object.assign(new Error("Unauthorized: You can only view clinical intelligence for approved appointments assigned to you."), { statusCode: 403 });
  }

  const targetPatient = appointment.familyMember || appointment.patient;
  const targetPatientId = targetPatient._id;

  // 2. Fetch full patient medical context securely
  const patientContext = await buildPatientContext({
    requestingUser: doctor,
    targetPatientId,
  });

  // 3. Fetch all uploaded medical reports for this patient
  const documents = await Document.find({ patient: targetPatientId })
    .sort({ createdAt: -1 })
    .lean();

  const documentsSummary = documents.length > 0
    ? documents.map((d, i) => `${i + 1}. [${d.documentType}] ${d.title} (Date: ${new Date(d.createdAt).toISOString().split("T")[0]}): ${d.aiSummary || d.description || "No written summary"}`).join("\n")
    : "No uploaded reports available on file.";

  // 4. Construct prompt for clinical overview
  const prompt = `PATIENT DOSSIER:
- Name: ${targetPatient.fullName}
- Gender: ${targetPatient.gender || "Not recorded"}
- Age: ${patientContext.patient.age || "Not recorded"}
- Blood Group: ${targetPatient.bloodGroup || "Not recorded"}
- BMI: ${patientContext.patient.bmi || "Not recorded"} (Height: ${targetPatient.height || "N/A"} cm, Weight: ${targetPatient.weight || "N/A"} kg)
- Known Chronic Conditions: ${patientContext.patient.chronicIllnesses.join(", ") || "None recorded"}
- Documented Medical History: ${patientContext.patient.medicalHistory.join("; ") || "None recorded"}
- Clinical Notes/Allergies: ${targetPatient.notes || "None recorded"}

CURRENT CONSULTATION DETAILS:
- Appointment ID: ${appointment.appointmentId}
- Current Reported Symptoms: "${appointment.symptoms}"
- Consultation Mode: ${appointment.consultationMode}
- Reason: ${appointment.reason || "Scheduled clinical consultation"}

PREVIOUS NEUROCARE CONSULTATIONS:
${patientContext.appointments.length > 0
  ? patientContext.appointments.map((a) => `- Date: ${a.date || "N/A"}, Specialty: ${a.specialization}, Symptoms: ${a.symptoms}, Diagnosis: ${a.diagnosis || "Pending"}, Prescriptions: ${a.prescriptions.join(", ") || "None"}`).join("\n")
  : "First consultation at NeuroCare platform."}

AVAILABLE MEDICAL REPORTS & LAB TESTS:
${documentsSummary}

Please generate the structured Clinical Intelligence Overview following the 6 mandated sections (A to F) with clear Markdown headings and bullet points.`;

  let aiContent = null;
  try {
    aiContent = await callGroqWithFallback({
      messages: [
        { role: "system", content: CLINICAL_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      maxTokens: 1600,
    });
  } catch (err) {
    console.error("[clinicalAssistant] AI Generation error:", err.message);
  }

  // Fallback clinical overview if AI provider is momentarily unreachable
  if (!aiContent) {
    aiContent = `### Section A: Patient Health Summary
- **Patient Profile:** ${targetPatient.fullName}, ${patientContext.patient.age || "Age not specified"}, ${targetPatient.gender || "Gender not specified"}.
- **Existing Conditions:** ${patientContext.patient.chronicIllnesses.join(", ") || "None documented"}.
- **Recorded Medical History:** ${patientContext.patient.medicalHistory.join(", ") || "None documented"}.
- **Prior Consultations:** ${patientContext.appointments.length} prior recorded appointments.

### Section B: Symptoms Analysis
- **Reported Symptoms:** ${appointment.symptoms}
- **Clinical Observation:** Patient presents with above symptoms requiring physical evaluation and correlation with vitals.
- **Missing Information:** Onset timeline, exact trigger factors, and current over-the-counter medication usage require clarification.

### Section C: Medical Report Analysis
- **Available Records:** ${documents.length} uploaded medical documents.
- **Key Findings:** Review uploaded records tab for specific imaging or blood panels.

### Section D: Potential Clinical Considerations
- Symptoms warrant differential evaluation based on physical examination and specialist assessment.
- *Clinical Notice:* All considerations require clinician verification.

### Section E: Suggested Follow-up
- Confirm duration, progression, and severity scale of symptoms.
- Check baseline vitals (BP, pulse, SpO2, temperature).
- Consider targeted diagnostic investigations if symptoms persist.

### Section F: Consultation Summary
Patient ${targetPatient.fullName} scheduled for ${appointment.consultationMode} consultation for: "${appointment.symptoms}". Known background: ${patientContext.patient.chronicIllnesses.join(", ") || "None"}.`;
  }

  return {
    appointmentId: appointment.appointmentId,
    patientName: targetPatient.fullName,
    patientId: String(targetPatient._id),
    age: patientContext.patient.age,
    gender: targetPatient.gender,
    bloodGroup: targetPatient.bloodGroup,
    bmi: patientContext.patient.bmi,
    chronicIllnesses: patientContext.patient.chronicIllnesses,
    medicalHistory: patientContext.patient.medicalHistory,
    symptoms: appointment.symptoms,
    documentsCount: documents.length,
    clinicalOverview: aiContent,
    generatedAt: new Date().toISOString(),
  };
};

module.exports = {
  generateClinicalOverview,
};
