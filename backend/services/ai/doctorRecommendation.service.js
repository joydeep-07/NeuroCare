const User = require("../../models/user.model");
const { callGroqWithFallback } = require("./aiClient");

const SPECIALTY_RULES = [
  {
    specialty: "Neurology",
    keywords: [
      "neurology", "neurologist", "neuro",
      "migraine", "headache", "seizure", "epilepsy", "dizziness", "vertigo", "numbness",
      "stroke", "memory loss", "alzheimer", "parkinson", "nerve", "tremor", "neuropathy",
      "tingling", "brain", "paralysis", "concussion", "neuralgia"
    ],
  },
  {
    specialty: "Cardiology",
    keywords: [
      "cardiology", "cardiologist", "cardiac", "heart",
      "chest pain", "palpitation", "high blood pressure", "hypertension", "angina",
      "shortness of breath", "cholesterol", "arrhythmia", "artery", "pulse"
    ],
  },
  {
    specialty: "Orthopedics",
    keywords: [
      "orthopedics", "orthopedic", "orthopaedics", "orthopaedist", "bone specialist",
      "joint pain", "knee", "bone", "fracture", "back pain", "spine", "arthritis", "ligament",
      "shoulder", "hip pain", "swollen joint", "osteoporosis", "slip disc", "sprain"
    ],
  },
  {
    specialty: "Dermatology",
    keywords: [
      "dermatology", "dermatologist", "skin specialist",
      "skin", "rash", "acne", "eczema", "itching", "psoriasis", "hives", "dandruff", "hair loss",
      "alopecia", "blister", "mole", "dermatitis", "fungal", "skin allergy"
    ],
  },
  {
    specialty: "Pediatrics",
    keywords: [
      "pediatrics", "pediatrician", "paediatrics", "child specialist",
      "child", "baby", "infant", "toddler", "pediatric", "growth issue", "vaccination", "colic"
    ],
  },
  {
    specialty: "Psychiatry",
    keywords: [
      "psychiatry", "psychiatrist", "psychology", "mental health",
      "anxiety", "depression", "panic", "insomnia", "bipolar", "stress",
      "adhd", "ptsd", "hallucination", "obsessive", "mood swing"
    ],
  },
  {
    specialty: "General Medicine",
    keywords: [
      "general medicine", "physician", "general physician", "internal medicine",
      "fever", "cough", "cold", "flu", "fatigue", "weakness", "body ache", "chills",
      "infection", "malaise", "viral", "unexplained weight loss", "loss of appetite"
    ],
  },
  {
    specialty: "Gastroenterology",
    keywords: [
      "gastroenterology", "gastroenterologist", "gastro",
      "stomach pain", "acid reflux", "gerd", "constipation", "diarrhea", "bloating",
      "vomiting", "nausea", "gastric", "ulcer", "indigestion", "liver", "jaundice"
    ],
  },
  {
    specialty: "Pulmonology",
    keywords: [
      "pulmonology", "pulmonologist", "chest specialist", "respiratory",
      "asthma", "wheezing", "chronic cough", "bronchitis", "copd", "lung", "pneumonia",
      "breathing difficulty"
    ],
  },
  {
    specialty: "ENT",
    keywords: [
      "ent", "ear nose throat", "otolaryngologist",
      "ear pain", "ear discharge", "hearing", "tinnitus", "sinus", "tonsil", "sore throat",
      "nasal", "nosebleed", "voice hoarseness"
    ],
  },
  {
    specialty: "Ophthalmology",
    keywords: [
      "ophthalmology", "ophthalmologist", "eye specialist", "eye doctor",
      "eye", "vision", "blur", "cataract", "glaucoma", "red eye", "conjunctivitis", "squint"
    ],
  },
  {
    specialty: "Oncology",
    keywords: [
      "oncology", "oncologist", "cancer", "tumor", "chemotherapy"
    ],
  },
  {
    specialty: "Nephrology",
    keywords: [
      "nephrology", "nephrologist", "kidney", "renal", "dialysis"
    ],
  },
  {
    specialty: "Urology",
    keywords: [
      "urology", "urologist", "urinary", "prostate", "bladder"
    ],
  },
  {
    specialty: "Gynecology",
    keywords: [
      "gynecology", "gynecologist", "obstetrics", "obgyn", "pregnancy", "menstrual", "period pain"
    ],
  },
  {
    specialty: "Dentistry",
    keywords: [
      "dentistry", "dentist", "tooth", "teeth", "gum", "cavity", "dental"
    ],
  },
];

/**
 * Infer medical specialty based on text and keywords.
 * Returns null if no relevant specialty matches. NEVER defaults to General Medicine.
 */
const inferSpecialtyFromSymptoms = (text = "") => {
  if (!text || typeof text !== "string") return null;
  const lower = text.toLowerCase();
  for (const item of SPECIALTY_RULES) {
    if (item.keywords.some((kw) => {
      // Use boundary-aware check or word match for short keywords
      if (kw.length <= 4) {
        const regex = new RegExp(`\\b${kw}\\b`, "i");
        return regex.test(lower);
      }
      return lower.includes(kw);
    })) {
      return item.specialty;
    }
  }
  return null;
};

/**
 * Extract location from text query.
 */
const extractLocationFromQuery = (text = "") => {
  if (!text || typeof text !== "string") return "";
  const match = text.match(/(?:in|near|from|around|at)\s+([a-zA-Z\s-]{2,30})/i);
  if (match && match[1]) {
    const loc = match[1].trim().replace(/[?.!,;]+$/, "");
    if (!["a", "an", "the", "my", "our", "hospital", "clinic", "pain", "doctor", "specialist"].includes(loc.toLowerCase())) {
      return loc;
    }
  }
  return "";
};

/**
 * Format a MongoDB doctor document into a clean, booking-ready payload.
 * Availability is strictly sourced from verified database records.
 */
const formatDoctorRecord = (doctor, recommendationReason = "") => ({
  id: String(doctor._id),
  _id: String(doctor._id),
  name: doctor.fullName,
  fullName: doctor.fullName,
  specialization: doctor.specialization,
  degree: doctor.degree || "MBBS",
  hospital: doctor.hospital || "NeuroCare Specialist Network",
  department: doctor.department || `${doctor.specialization} Clinic`,
  yearsOfExperience: Number(doctor.yearsOfExperience) || 0,
  consultationFee: Number(doctor.consultationFee) || 0,
  rating: Number(doctor.rating) || 0,
  reviewsCount: Number(doctor.reviewsCount) || 0,
  location: doctor.location || [doctor.city, doctor.state, doctor.country].filter(Boolean).join(", ") || "",
  city: doctor.city || (doctor.location ? doctor.location.split(",")[0]?.trim() : ""),
  state: doctor.state || (doctor.location ? doctor.location.split(",")[1]?.trim() : ""),
  profilePhoto: doctor.profilePhoto || doctor.avatar || "",
  avatar: doctor.avatar || doctor.profilePhoto || "",
  availability: Array.isArray(doctor.availability) ? doctor.availability : [],
  recommendationReason: recommendationReason || `Specialist in ${doctor.specialization} with ${doctor.yearsOfExperience || 0} years of verified clinical experience.`,
});

/**
 * Generates personalized AI recommendation explanations for the top matched doctors.
 */
const generateRecommendationReasons = async ({ symptoms, specialty, doctors }) => {
  if (!doctors || doctors.length === 0) return [];

  const doctorListSnippet = doctors.map((d, index) => `${index + 1}. ${d.fullName} (${d.specialization}, ${d.yearsOfExperience} yrs exp, Hospital: ${d.hospital})`).join("\n");

  const prompt = `Patient symptoms / query: "${symptoms}"
Relevant Specialty: ${specialty || "Specialist Care"}
Available Verified Doctors from Database:
${doctorListSnippet}

Task: For each doctor above, provide a 1-sentence clinical recommendation reason explaining why their credentials and specialty suit the patient's requirement. Output valid JSON in this format:
[
  { "id": 1, "reason": "Recommended because Dr. ... specializes in ... and can evaluate ..." }
]
Only output valid JSON.`;

  try {
    const rawAiOutput = await callGroqWithFallback({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      maxTokens: 400,
    });

    if (rawAiOutput) {
      const jsonMatch = rawAiOutput.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return doctors.map((doc, idx) => {
          const match = parsed.find((p) => p.id === idx + 1);
          return formatDoctorRecord(doc, match?.reason);
        });
      }
    }
  } catch (err) {
    console.warn("[doctorRecommendation] AI reason generation error, falling back to rule reason:", err.message);
  }

  // Fallback to formatted rule-based clinical explanation
  return doctors.map((doc) =>
    formatDoctorRecord(
      doc,
      `Recommended specialist for ${symptoms.slice(0, 45)}. ${doc.fullName} brings ${doc.yearsOfExperience || 0} years of verified experience in ${doc.specialization} at ${doc.hospital || "NeuroCare"}.`
    )
  );
};

/**
 * Main doctor recommendation function.
 * Matches symptoms, finds real registered MongoDB doctors, filters by location, and ranks results.
 * Strictly avoids irrelevant fallbacks: no auto-General Medicine and no unrelated doctors.
 */
const recommendDoctors = async ({ symptoms = "", preferredLocation = "", userProfile = null, limit = 6 }) => {
  if (!symptoms || typeof symptoms !== "string" || !symptoms.trim()) {
    throw Object.assign(new Error("Symptoms or medical concern must be provided."), { statusCode: 400 });
  }

  const cleanSymptoms = symptoms.trim();
  const specialty = inferSpecialtyFromSymptoms(cleanSymptoms);
  const locationTarget = (preferredLocation || extractLocationFromQuery(cleanSymptoms) || "").trim();

  // Query base active, non-rejected doctors from MongoDB
  const baseFilter = {
    role: "doctor",
    isActive: true,
    verificationStatus: { $ne: "rejected" },
  };

  let doctors = [];

  if (specialty) {
    // 1. Exact or regex specialty matching
    const specialtyRegex = new RegExp(specialty, "i");
    doctors = await User.find({
      ...baseFilter,
      $or: [
        { specialization: specialtyRegex },
        { department: specialtyRegex },
      ],
    })
      .select("fullName specialization degree hospital department yearsOfExperience consultationFee rating reviewsCount location city state country avatar profilePhoto availability")
      .sort({ rating: -1, yearsOfExperience: -1 })
      .lean();
  } else {
    // 2. No rule-based specialty inferred: search if symptoms mention a doctor's specialization or department
    const escapedQuery = cleanSymptoms.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    doctors = await User.find({
      ...baseFilter,
      $or: [
        { specialization: new RegExp(escapedQuery, "i") },
        { department: new RegExp(escapedQuery, "i") },
      ],
    })
      .select("fullName specialization degree hospital department yearsOfExperience consultationFee rating reviewsCount location city state country avatar profilePhoto availability")
      .sort({ rating: -1, yearsOfExperience: -1 })
      .lean();
  }

  // STRICT REQUIREMENT: If no relevant doctors match the medical criteria, DO NOT fallback to General Medicine or random doctors!
  if (doctors.length === 0) {
    return {
      symptoms: cleanSymptoms,
      suggestedSpecialty: specialty || null,
      locationSearched: locationTarget || "All locations",
      isLocationExactMatch: false,
      totalMatches: 0,
      doctors: [],
      message: "No relevant doctors found for your search.",
      clinicalDisclaimer: "AI specialist recommendations are based on your reported symptoms and registered doctor credentials. This does not constitute a medical diagnosis.",
    };
  }

  // Location filtering if requested
  let locationMatched = false;
  if (locationTarget) {
    const locLower = locationTarget.toLowerCase();
    const withLocationMatch = doctors.filter((doc) => {
      const docCity = (doc.city || "").toLowerCase();
      const docState = (doc.state || "").toLowerCase();
      const docLoc = (doc.location || "").toLowerCase();
      return (
        (docCity && (docCity.includes(locLower) || locLower.includes(docCity))) ||
        (docState && (docState.includes(locLower) || locLower.includes(docState))) ||
        (docLoc && docLoc.includes(locLower))
      );
    });

    if (withLocationMatch.length > 0) {
      locationMatched = true;
      doctors = withLocationMatch;
    } else {
      // User searched with a specific location constraint and no relevant doctors match that location.
      // Return empty results with clear message rather than unrelated doctors.
      return {
        symptoms: cleanSymptoms,
        suggestedSpecialty: specialty || null,
        locationSearched: locationTarget,
        isLocationExactMatch: false,
        totalMatches: 0,
        doctors: [],
        message: "No relevant doctors found for your search.",
        clinicalDisclaimer: "AI specialist recommendations are based on your reported symptoms and registered doctor credentials. This does not constitute a medical diagnosis.",
      };
    }
  }

  const selectedDoctors = doctors.slice(0, limit);
  const formattedRecommendations = await generateRecommendationReasons({
    symptoms: cleanSymptoms,
    specialty: specialty || selectedDoctors[0]?.specialization,
    doctors: selectedDoctors,
  });

  return {
    symptoms: cleanSymptoms,
    suggestedSpecialty: specialty || selectedDoctors[0]?.specialization,
    locationSearched: locationTarget || "All locations",
    isLocationExactMatch: locationMatched,
    totalMatches: doctors.length,
    doctors: formattedRecommendations,
    message: formattedRecommendations.length === 0 ? "No relevant doctors found for your search." : undefined,
    clinicalDisclaimer: "AI specialist recommendations are based on your reported symptoms and registered doctor credentials. This does not constitute a medical diagnosis. In case of emergency or severe chest pain/stroke symptoms, seek emergency in-person medical care immediately.",
  };
};

module.exports = {
  SPECIALTY_RULES,
  inferSpecialtyFromSymptoms,
  extractLocationFromQuery,
  formatDoctorRecord,
  recommendDoctors,
};
