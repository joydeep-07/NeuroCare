/**
 * Intent classification for health queries.
 * Determines what category of information the user is seeking.
 */

const INTENTS = {
  GENERAL_MEDICAL: "GENERAL_MEDICAL",
  PATIENT_HEALTH: "PATIENT_HEALTH",
  APPOINTMENT_QUERY: "APPOINTMENT_QUERY",
  REPORT_EXPLANATION: "REPORT_EXPLANATION",
  DOCTOR_RECOMMENDATION: "DOCTOR_RECOMMENDATION",
  PLATFORM_ASSISTANCE: "PLATFORM_ASSISTANCE",
};

const classifyIntent = (prompt = "") => {
  const text = prompt.toLowerCase().trim();

  // Doctor search / recommendation
  if (
    /recommend|find|suggest|search|look for|book (?:a )?doctor|need a doctor|which doctor|specialist for|neurologist|cardiologist|dermatologist|orthopedic|pediatrician|psychiatrist/i.test(text) &&
    !/explain my|my prescription|my report|what did my doctor say/i.test(text)
  ) {
    return INTENTS.DOCTOR_RECOMMENDATION;
  }

  // Appointment-related queries
  if (
    /my appointment|next visit|consultation date|booked visit|pending appointment|when is my|schedule with dr|cancel appointment|reschedule/i.test(text)
  ) {
    return INTENTS.APPOINTMENT_QUERY;
  }

  // Medical report explanations
  if (
    /report|mri|ct scan|blood test|ecg|x-ray|ultrasound|cbc|hemoglobin|lab result|test result|values in my/i.test(text) &&
    /my|uploaded|latest|recent|explain|show|tell me about/i.test(text)
  ) {
    return INTENTS.REPORT_EXPLANATION;
  }

  // Patient personal health / history
  if (
    /my (?:health|history|medication|medicine|prescription|record|illness|disease|condition|blood group|weight|bmi|profile)|what (?:am i taking|medicines|drugs|diseases do i have)|summarize my/i.test(text)
  ) {
    return INTENTS.PATIENT_HEALTH;
  }

  // Platform assistance
  if (
    /how (?:do i|to) (?:use|upload|book|cancel|navigate|download)|where can i find|help with (?:the )?website|contact support/i.test(text)
  ) {
    return INTENTS.PLATFORM_ASSISTANCE;
  }

  // Default to general medical
  return INTENTS.GENERAL_MEDICAL;
};

module.exports = {
  INTENTS,
  classifyIntent,
};
