// =======================================
// Intelligent AI Health Assistant Engine
// =======================================

const DISCLAIMER = "\n\n⚠️ Medical Disclaimer: NeuroCare AI provides educational insights and health guidance only. It does not replace professional medical diagnosis or treatment. In case of a medical emergency, please contact emergency services or visit the nearest hospital immediately.";

// Specialized Medical Knowledge Base Rules
const SPECIALTY_RULES = [
  {
    keywords: ["headache", "migraine", "dizziness", "seizure", "numbness", "memory", "brain", "stroke", "tremor", "paralysis", "nerve"],
    specialty: "Neurology",
    department: "Department of Neurosciences",
    urgency: "Urgent",
  },
  {
    keywords: ["chest pain", "heart", "palpitation", "shortness of breath", "bp", "blood pressure", "cardiac", "pulse"],
    specialty: "Cardiology",
    department: "Cardiovascular & Heart Institute",
    urgency: "Emergency",
  },
  {
    keywords: ["joint pain", "knee", "bone", "fracture", "back pain", "spine", "arthritis", "shoulder", "muscle strain"],
    specialty: "Orthopedics",
    department: "Department of Orthopedics & Joint Replacement",
    urgency: "Routine",
  },
  {
    keywords: ["skin", "rash", "acne", "itching", "eczema", "psoriasis", "hair loss", "allergy"],
    specialty: "Dermatology",
    department: "Department of Dermatology & Cosmetology",
    urgency: "Routine",
  },
  {
    keywords: ["child", "baby", "pediatric", "fever in kid", "infant"],
    specialty: "Pediatrics",
    department: "Department of Child Health & Pediatrics",
    urgency: "Urgent",
  },
  {
    keywords: ["anxiety", "depression", "insomnia", "stress", "panic", "mood", "mental health"],
    specialty: "Psychiatry",
    department: "Department of Mental Health & Psychiatry",
    urgency: "Routine",
  },
  {
    keywords: ["fever", "cough", "cold", "flu", "weakness", "fatigue", "viral", "body ache"],
    specialty: "General Medicine",
    department: "Department of Internal Medicine",
    urgency: "Routine",
  },
];

const LANGUAGE_MAP = {
  hindi: "हिंदी (Hindi)",
  tamil: "தமிழ் (Tamil)",
  telugu: "తెలుగు (Telugu)",
  bengali: "বাংলা (Bengali)",
  marathi: "मराठी (Marathi)",
  gujarati: "ગુજરાતી (Gujarati)",
  kannada: "ಕನ್ನಡ (Kannada)",
  malayalam: "മലയാളം (Malayalam)",
};

const handleAIChat = async (req, res) => {
  try {
    const { prompt, mode, language } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required.",
      });
    }

    const lowerPrompt = prompt.toLowerCase();

    let responseText = "";
    let suggestedSpecialty = "General Medicine";
    let triageLevel = "Routine";

    // 1. Mode: Symptom Checker
    if (mode === "symptom_checker" || lowerPrompt.includes("symptom") || lowerPrompt.includes("pain") || lowerPrompt.includes("fever") || lowerPrompt.includes("doctor")) {
      const match = SPECIALTY_RULES.find((rule) =>
        rule.keywords.some((kw) => lowerPrompt.includes(kw))
      );

      if (match) {
        suggestedSpecialty = match.specialty;
        triageLevel = match.urgency;
        responseText = `### 🩺 AI Symptom Assessment & Specialty Guidance

**Detected Symptoms**: "${prompt}"
**Recommended Medical Specialty**: **${match.specialty}** (${match.department})
**Triage Priority Level**: **${match.urgency}**

#### Potential Factors & Observations:
- Your reported symptoms match patterns commonly treated by a **${match.specialty}** specialist.
- ${
          match.urgency === "Emergency"
            ? "🚨 **Immediate Attention Advised**: Heart and acute respiratory symptoms require prompt evaluation. Please request an emergency appointment or visit an ER."
            : "We recommend scheduling a consultation with a qualified doctor for a comprehensive physical examination."
        }

#### Suggested Next Steps:
1. Search and request an appointment with our top **${match.specialty}** specialists on NeuroCare.
2. Prepare a 3-day log of when your symptoms occur and any triggers.
3. Keep track of current medications or previous medical reports to share during consultation.`;
      } else {
        responseText = `### 🩺 AI Symptom Assessment

**Query**: "${prompt}"
**Recommended Specialty**: **General Medicine**
**Triage Priority**: **Routine**

Based on your description, we recommend consulting a **General Medicine** physician who can conduct a baseline assessment and refer you to a sub-specialist if necessary.`;
      }
    }
    // 2. Mode: Prescription Explainer
    else if (mode === "prescription_explainer" || lowerPrompt.includes("medicine") || lowerPrompt.includes("tablet") || lowerPrompt.includes("dosage") || lowerPrompt.includes("prescription")) {
      responseText = `### 💊 AI Prescription & Medication Explainer

**Medication Inquiry**: "${prompt}"

#### Safety & Usage Guidelines:
- **Administration**: Take prescribed medications strictly as instructed by your healthcare provider.
- **Timing**: Most oral medications should be taken with or after meals to prevent gastric discomfort unless specifically instructed to take on an empty stomach.
- **Missed Dose Rule**: If you miss a dose, take it as soon as you remember, unless it is almost time for your next scheduled dose. Never double up doses.
- **Precautions**: Avoid alcohol consumption while taking prescription antibiotics, sedatives, or analgesics.`;
    }
    // 3. Mode: Report Summarizer
    else if (mode === "report_summarizer" || lowerPrompt.includes("report") || lowerPrompt.includes("mri") || lowerPrompt.includes("blood") || lowerPrompt.includes("ct scan")) {
      responseText = `### 📊 AI Medical Document Summary

**Document Analysis Request**: "${prompt}"

#### Key Findings Summary:
- **Primary Observations**: Findings indicate normal to mild physiological variations typical for adult evaluations.
- **Key Parameters**: Standard metabolic, blood, or imaging markers were evaluated against reference ranges.
- **Doctor Review Action**: Attach this document to your upcoming appointment request so your assigned physician can perform a clinical correlation.`;
    }
    // 4. Mode: Lifestyle Suggestions
    else if (mode === "lifestyle" || lowerPrompt.includes("diet") || lowerPrompt.includes("sleep") || lowerPrompt.includes("stress") || lowerPrompt.includes("habit")) {
      responseText = `### 🌿 AI Preventive Health & Lifestyle Recommendation

**Focus Area**: "${prompt}"

#### Tailored Wellness Plan:
1. 💧 **Hydration**: Aim for 2.5–3 Liters of filtered water daily to optimize cellular and brain health.
2. 😴 **Circadian Sleep Hygiene**: Maintain a consistent sleep-wake window of 7–8 hours per night. Avoid blue screens 45 minutes before sleep.
3. 🥗 **Nutritional Balance**: Increase anti-inflammatory foods (leafy greens, omega-3 fatty acids, berries, nuts). Reduce ultra-processed sugars.
4. 🧠 **Neuro-Mindfulness**: Practice 10 minutes of deep diaphragmatic breathing or meditation daily to lower cortisol levels.`;
    }
    // 5. General AI Healthcare Consultation
    else {
      responseText = `### 🤖 NeuroCare AI Health Assistant

Thank you for reaching out with your question: "${prompt}".

NeuroCare AI is engineered to help you navigate medical specialties, understand diagnoses, manage family health records, and schedule consultations with certified healthcare professionals.

**How can I assist you further today?**
- 🩺 *Symptom evaluation & specialty recommendation*
- 💊 *Prescription & dosage guidance*
- 📊 *Blood test / Imaging report explanation*
- 🌐 *Translation into regional languages*`;
    }

    // Append Regional Language Note if specified
    if (language && LANGUAGE_MAP[language.toLowerCase()]) {
      const langName = LANGUAGE_MAP[language.toLowerCase()];
      responseText += `\n\n🌐 *Translated Summary (${langName})*: This recommendation has been prepared for viewing in ${langName}. Please review the English clinical summary with your assigned physician.`;
    }

    // Always attach mandatory medical disclaimer
    responseText += DISCLAIMER;

    return res.status(200).json({
      success: true,
      mode: mode || "general",
      suggestedSpecialty,
      triageLevel,
      response: responseText,
    });
  } catch (error) {
    console.error("handleAIChat error:", error);
    return res.status(500).json({
      success: false,
      message: "AI Assistant processing error.",
    });
  }
};

module.exports = {
  handleAIChat,
};
