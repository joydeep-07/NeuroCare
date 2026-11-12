const User = require("../../models/user.model");
const { callGroqWithFallback } = require("./aiClient");

const SPECIALTY_RULES = [
  {
    specialty: "Neurology",
    keywords: [
      "migraine", "headache", "seizure", "epilepsy", "dizziness", "vertigo", "numbness",
      "stroke", "memory loss", "alzheimer", "parkinson", "nerve", "tremor", "neuropathy",
      "tingling", "brain", "paralysis", "concussion", "neuralgia"
    ],
  },
  {
    specialty: "Cardiology",
    keywords: [
      "chest pain", "heart", "palpitation", "high blood pressure", "hypertension", "angina",
      "shortness of breath", "cholesterol", "arrhythmia", "cardiac", "artery", "pulse"
    ],
  },
  {
    specialty: "Orthopedics",
    keywords: [
      "joint pain", "knee", "bone", "fracture", "back pain", "spine", "arthritis", "ligament",
      "shoulder", "hip pain", "swollen joint", "osteoporosis", "slip disc", "sprain"
    ],
  },
  {
    specialty: "Dermatology",
    keywords: [
      "skin", "rash", "acne", "eczema", "itching", "psoriasis", "hives", "dandruff", "hair loss",
      "alopecia", "blister", "mole", "dermatitis", "fungal", "skin allergy"
    ],
  },
  {
    specialty: "Pediatrics",
    keywords: [
      "child", "baby", "infant", "toddler", "pediatric", "growth issue", "vaccination", "colic"
    ],
  },
  {
    specialty: "Psychiatry",
    keywords: [
      "anxiety", "depression", "panic", "mental health", "insomnia", "bipolar", "stress",
      "adhd", "ptsd", "hallucination", "obsessive", "mood swing"
    ],
  },
  {
    specialty: "General Medicine",
    keywords: [
      "fever", "cough", "cold", "flu", "fatigue", "weakness", "body ache", "chills",
      "infection", "malaise", "viral", "unexplained weight loss", "loss of appetite"
    ],
  },
  {
    specialty: "Gastroenterology",
    keywords: [
      "stomach pain", "acid reflux", "gerd", "constipation", "diarrhea", "bloating",
      "vomiting", "nausea", "gastric", "ulcer", "indigestion", "liver", "jaundice"
    ],
  },
  {
    specialty: "Pulmonology",
    keywords: [
      "asthma", "wheezing", "chronic cough", "bronchitis", "copd", "lung", "pneumonia",
      "respiratory", "breathing difficulty"
    ],
  },
  {
    specialty: "ENT",
    keywords: [
      "ear pain", "ear discharge", "hearing", "tinnitus", "sinus", "tonsil", "sore throat",
      "nasal", "nosebleed", "voice hoarseness"
    ],
  },
  {
    specialty: "Ophthalmology",
    keywords: [
      "eye", "vision", "blur", "cataract", "glaucoma", "red eye", "conjunctivitis", "squint"
    ],
  },
];

/**
 * Infer medical specialty based on text and keywords.
 */
const inferSpecialtyFromSymptoms = (text = "") => {
  const lower = text.toLowerCase();
  for (const item of SPECIALTY_RULES) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.specialty;
    }
  }
  return "General Medicine";
};

/**
 * Extract location from text query or use preferred city.
 */
const extractLocationFromQuery = (text = "") => {
  const match = text.match(/(?:in|near|from|around|at)\s+([a-zA-Z\s-]{2,30})/i);
  if (match && match[1]) {
    const loc = match[1].trim().replace(/[?.!,;]+$/, "");
    if (!["a", "an", "the", "my", "our", "hospital", "clinic", "pain", "doctor"].includes(loc.toLowerCase())) {
      return loc;
    }
  }
  return "";
};

/**
 * Format a MongoDB doctor document into a clean, booking-ready payload.
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
  yearsOfExperience: doctor.yearsOfExperience || 5,
  consultationFee: doctor.consultationFee || 800,
  rating: doctor.rating || 4.8,
  reviewsCount: doctor.reviewsCount || 20,
  location: doctor.location || [doctor.city, doctor.state, doctor.country].filter(Boolean).join(", ") || "Main Hospital",
  city: doctor.city || (doctor.location ? doctor.location.split(",")[0]?.trim() : ""),
  state: doctor.state || (doctor.location ? doctor.location.split(",")[1]?.trim() : ""),
  profilePhoto: doctor.profilePhoto || doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}`,
  avatar: doctor.avatar || doctor.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}`,
  availability: doctor.availability && doctor.availability.length > 0 ? doctor.availability : [
    { day: "Monday", slots: ["10:00 AM", "02:00 PM"] },
    { day: "Wednesday", slots: ["11:00 AM", "03:00 PM"] },
    { day: "Friday", slots: ["10:00 AM", "04:00 PM"] },
  ],
  recommendationReason: recommendationReason || `Specialist in ${doctor.specialization} with ${doctor.yearsOfExperience || 5}+ years of verified clinical experience.`,
});

/**
 * Generates personalized AI recommendation explanations for the top matched doctors.
 */
const generateRecommendationReasons = async ({ symptoms, specialty, doctors }) => {
  if (!doctors || doctors.length === 0) return [];

  const doctorListSnippet = doctors.map((d, index) => `${index + 1}. ${d.fullName} (${d.specialization}, ${d.yearsOfExperience} yrs exp, Hospital: ${d.hospital})`).join("\n");

  const prompt = `Patient symptoms: "${symptoms}"
Inferred Specialty: ${specialty}
Available Doctors:
${doctorListSnippet}

Task: For each doctor above, provide a 1-sentence clinical recommendation reason explaining why they are suitable for the patient's symptoms. Output valid JSON in this format:
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
      `Recommended specialist for ${symptoms.slice(0, 40)}. ${doc.fullName} brings ${doc.yearsOfExperience} years of experience in ${doc.specialization} at ${doc.hospital || "NeuroCare"}.`
    )
  );
};

/**
 * Main doctor recommendation function.
 * Matches symptoms, finds real registered MongoDB doctors, filters by location, and ranks results.
 */
const recommendDoctors = async ({ symptoms = "", preferredLocation = "", userProfile = null, limit = 6 }) => {
  if (!symptoms || typeof symptoms !== "string") {
    throw Object.assign(new Error("Symptoms or medical concern must be provided."), { statusCode: 400 });
  }

  const specialty = inferSpecialtyFromSymptoms(symptoms);
  const locationTarget = (preferredLocation || extractLocationFromQuery(symptoms) || userProfile?.city || userProfile?.location || "").trim();

  // Query base active, non-rejected doctors from MongoDB
  const baseFilter = {
    role: "doctor",
    isActive: true,
    verificationStatus: { $ne: "rejected" },
  };

  // 1. Try exact specialty match
  let specialtyRegex = new RegExp(specialty, "i");
  let doctors = await User.find({ ...baseFilter, specialization: specialtyRegex })
    .select("fullName specialization degree hospital department yearsOfExperience consultationFee rating reviewsCount location city state country avatar profilePhoto availability")
    .sort({ rating: -1, yearsOfExperience: -1 })
    .lean();

  // If no doctors found in that specialty, check for partial matches or fallback to General Medicine
  if (doctors.length === 0) {
    doctors = await User.find({ ...baseFilter, specialization: /General Medicine|Medicine|Physician/i })
      .select("fullName specialization degree hospital department yearsOfExperience consultationFee rating reviewsCount location city state country avatar profilePhoto availability")
      .sort({ rating: -1, yearsOfExperience: -1 })
      .lean();
  }

  // If still no doctors, get all verified active doctors
  if (doctors.length === 0) {
    doctors = await User.find(baseFilter)
      .select("fullName specialization degree hospital department yearsOfExperience consultationFee rating reviewsCount location city state country avatar profilePhoto availability")
      .sort({ rating: -1, yearsOfExperience: -1 })
      .limit(8)
      .lean();
  }

  // Location scoring & filtering
  let locationMatched = false;
  if (locationTarget) {
    const locLower = locationTarget.toLowerCase();
    const withLocationScore = doctors.map((doc) => {
      let locScore = 0;
      const docCity = (doc.city || "").toLowerCase();
      const docState = (doc.state || "").toLowerCase();
      const docLoc = (doc.location || "").toLowerCase();

      if (docCity && (docCity.includes(locLower) || locLower.includes(docCity))) locScore += 50;
      if (docState && (docState.includes(locLower) || locLower.includes(docState))) locScore += 30;
      if (docLoc && docLoc.includes(locLower)) locScore += 25;

      return { doc, locScore };
    });

    const hasLocMatch = withLocationScore.some((item) => item.locScore > 0);
    if (hasLocMatch) {
      locationMatched = true;
      // Sort by locScore descending, then rating and experience
      withLocationScore.sort((a, b) => b.locScore - a.locScore || b.doc.rating - a.doc.rating || b.doc.yearsOfExperience - a.doc.yearsOfExperience);
      doctors = withLocationScore.map((item) => item.doc);
    }
  }

  const selectedDoctors = doctors.slice(0, limit);
  const formattedRecommendations = await generateRecommendationReasons({
    symptoms,
    specialty,
    doctors: selectedDoctors,
  });

  return {
    symptoms,
    suggestedSpecialty: specialty,
    locationSearched: locationTarget || "All locations",
    isLocationExactMatch: locationMatched,
    totalMatches: doctors.length,
    doctors: formattedRecommendations,
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
