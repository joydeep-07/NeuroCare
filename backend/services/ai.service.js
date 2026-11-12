const AIConversation = require("../models/aiConversation.model");
const User = require("../models/user.model");
const { callGroqWithFallback } = require("./ai/aiClient");
const { buildPatientContext } = require("./ai/contextBuilder.service");
const { classifyIntent, INTENTS } = require("./ai/intentClassifier.service");
const { recommendDoctors, inferSpecialtyFromSymptoms, extractLocationFromQuery } = require("./ai/doctorRecommendation.service");
const { generateClinicalOverview } = require("./ai/clinicalAssistant.service");
const { analyzeMedicalDocument, compareHistoricalReports } = require("./ai/reportAnalysis.service");

const DISCLAIMER = "Educational information only. It does not replace an examination, diagnosis, or treatment plan from a qualified clinician.";

/**
 * Enhanced AI Chat: fully database-connected, context-aware, and intent-driven.
 */
const chat = async ({ userId, sessionId, prompt, language = "English", city = "" }) => {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User account not found."), { statusCode: 404 });

  // 1. Manage Conversation Session
  const requestedStoredConversation = sessionId && !String(sessionId).startsWith("session-");
  let conversation = requestedStoredConversation ? await AIConversation.findOne({ _id: sessionId, user: userId }) : null;
  if (requestedStoredConversation && !conversation) {
    throw Object.assign(new Error("Conversation not found."), { statusCode: 404 });
  }
  if (!conversation) {
    conversation = await AIConversation.create({
      user: userId,
      title: `${prompt.slice(0, 50)}${prompt.length > 50 ? "..." : ""}`,
    });
  }

  // 2. Classify intent & extract context
  const intent = classifyIntent(prompt);
  const patientContext = await buildPatientContext({ requestingUser: user, targetPatientId: user._id });

  const inferredSpecialty = inferSpecialtyFromSymptoms(prompt);
  const preferredCity = city || extractLocationFromQuery(prompt) || user.city || user.location;

  // 3. If query involves seeking a doctor or reporting physical symptoms
  let recommendedDoctorsList = [];
  if (intent === INTENTS.DOCTOR_RECOMMENDATION || (intent === INTENTS.GENERAL_MEDICAL && inferredSpecialty !== "General Medicine")) {
    try {
      const recResult = await recommendDoctors({
        symptoms: prompt,
        preferredLocation: preferredCity,
        userProfile: user,
        limit: 4,
      });
      recommendedDoctorsList = recResult.doctors || [];
    } catch (err) {
      console.warn("[chat] Doctor recommendation error:", err.message);
    }
  }

  // 4. Construct System & Context Prompt
  const triageLevel = /chest pain|difficulty breathing|stroke|unconscious|severe bleeding|seizure/i.test(prompt)
    ? "Emergency"
    : "Routine";

  const systemInstructions = `You are NeuroCare's AI Clinical & Health Navigation Assistant.
You have SECURE, direct access to the authenticated user's actual MongoDB healthcare profile at NeuroCare.
You must use this patient context when relevant to provide personalized, accurate, empathetic guidance.
CRITICAL GUIDELINES:
- User Intent: ${intent}
- Language: ${language}
- If the user asks about their own medical history, medications, past appointments, or reports, answer using the provided patient context.
- If the user has uploaded reports or previous diagnoses, refer to them accurately.
- Never invent fictional doctors or treatments.
- If recommending care, mention that you've found verified NeuroCare specialists for them.
- Always include helpful lifestyle and monitoring advice.
- End with the standard clinical disclaimer: "${DISCLAIMER}"`;

  const contextData = {
    patientName: user.fullName,
    age: patientContext?.patient?.age,
    gender: patientContext?.patient?.gender,
    bloodGroup: patientContext?.patient?.bloodGroup,
    bmi: patientContext?.patient?.bmi,
    chronicConditions: patientContext?.patient?.chronicIllnesses,
    recordedMedicalHistory: patientContext?.patient?.medicalHistory,
    allergiesNotes: patientContext?.patient?.allergiesAndNotes,
    appointmentsCount: patientContext?.appointments?.length || 0,
    recentAppointments: patientContext?.appointments?.slice(0, 4),
    recentDocuments: patientContext?.documents?.slice(0, 4),
    doctorsAvailable: recommendedDoctorsList.map((d) => ({
      name: d.fullName,
      specialty: d.specialization,
      hospital: d.hospital,
      experience: `${d.yearsOfExperience} yrs`,
      location: d.location,
      reason: d.recommendationReason,
    })),
  };

  const conversationHistory = conversation.messages.slice(-8).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const messages = [
    { role: "system", content: `${systemInstructions}\n\nPATIENT REAL-TIME DATABASE CONTEXT:\n${JSON.stringify(contextData, null, 2)}` },
    ...conversationHistory,
    { role: "user", content: prompt },
  ];

  conversation.messages.push({ role: "user", content: prompt });

  let aiResponse = null;
  try {
    aiResponse = await callGroqWithFallback({
      messages,
      temperature: 0.25,
      maxTokens: 800,
    });
  } catch (err) {
    console.error("[chat] Groq error:", err.message);
  }

  if (!aiResponse) {
    // Graceful fallback tailored to intent
    if (intent === INTENTS.PATIENT_HEALTH) {
      aiResponse = `Here is your recorded health overview, ${user.fullName}:\n\n` +
        `- **Chronic Illnesses:** ${patientContext?.patient?.chronicIllnesses?.join(", ") || "None recorded"}\n` +
        `- **Documented History:** ${patientContext?.patient?.medicalHistory?.join(", ") || "None recorded"}\n` +
        `- **Blood Group:** ${patientContext?.patient?.bloodGroup || "Not specified"}\n` +
        `- **BMI:** ${patientContext?.patient?.bmi || "Not recorded"}\n\n` +
        `${DISCLAIMER}`;
    } else if (intent === INTENTS.APPOINTMENT_QUERY) {
      const apptList = (patientContext?.appointments || []).map((a) => `- **${a.date || "Scheduled"}**: with ${a.doctorName} (${a.specialization}) - Status: ${a.status}`).join("\n");
      aiResponse = `Here are your recent appointment records:\n\n${apptList || "You currently have no past or pending appointments recorded."}\n\n${DISCLAIMER}`;
    } else {
      aiResponse = `Based on your query, a consultation in **${inferredSpecialty}** may be appropriate. ` +
        (recommendedDoctorsList.length > 0 ? "I have identified verified NeuroCare doctors matching your criteria below." : "Please consult a registered physician for full clinical evaluation.") +
        `\n\nStay hydrated, follow balanced nutrition, and keep a log of symptom triggers and frequency.\n\n${DISCLAIMER}`;
    }
  } else {
    if (!aiResponse.includes("Educational information only")) {
      aiResponse = `${aiResponse}\n\n${DISCLAIMER}`;
    }
  }

  conversation.messages.push({
    role: "assistant",
    content: aiResponse,
    specialty: inferredSpecialty,
    triageLevel,
    doctors: recommendedDoctorsList,
  });

  await conversation.save();

  return {
    response: aiResponse,
    suggestedSpecialty: inferredSpecialty,
    doctors: recommendedDoctorsList,
    triageLevel,
    intent,
    conversationId: String(conversation._id),
    conversation,
  };
};

/**
 * Dedicated Patient Health Summary generator for Patient Dashboard / Profile.
 */
const getPatientHealthSummary = async ({ requestingUser, targetPatientId = null }) => {
  const patientContext = await buildPatientContext({
    requestingUser,
    targetPatientId,
  });

  if (!patientContext) {
    throw Object.assign(new Error("Patient record not found."), { statusCode: 404 });
  }

  const prompt = `Task: Provide an intelligent, encouraging, and structured Clinical Health Summary for the patient based on their database records:
${JSON.stringify(patientContext, null, 2)}

Provide:
1. Executive Health Status (Age, BMI evaluation, Blood group)
2. Chronic Conditions & Active Medical History Highlights
3. Consultation History & Care Continuity Overview
4. Uploaded Records Status
5. Personalized Preventative Care & Lifestyle Recommendations`;

  let summary = null;
  try {
    summary = await callGroqWithFallback({
      messages: [
        { role: "system", content: "You are NeuroCare Patient Health Record Summarizer. Generate structured, empathetic summaries." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      maxTokens: 800,
    });
  } catch (err) {
    console.warn("[getPatientHealthSummary] AI call error:", err.message);
  }

  if (!summary) {
    summary = `### Health Record Summary for ${patientContext.patient.fullName}
- **Vitals & Profile:** Age ${patientContext.patient.age || "N/A"}, Blood Group ${patientContext.patient.bloodGroup || "N/A"}, BMI: ${patientContext.patient.bmi || "N/A"}.
- **Active Conditions:** ${patientContext.patient.chronicIllnesses.join(", ") || "No active chronic illnesses reported."}
- **Recorded Consultations:** ${patientContext.appointments.length} appointment records in NeuroCare.
- **Uploaded Documents:** ${patientContext.documents.length} medical records stored.`;
  }

  return {
    patient: patientContext.patient,
    summary,
    appointmentsCount: patientContext.appointments.length,
    documentsCount: patientContext.documents.length,
    generatedAt: new Date().toISOString(),
  };
};

module.exports = {
  chat,
  recommendDoctors,
  getPatientHealthSummary,
  generateClinicalOverview,
  analyzeMedicalDocument,
  compareHistoricalReports,
};
