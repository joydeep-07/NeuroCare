const User = require("../models/user.model");

const symptomSpecialties = [
  {
    specialty: "Neurology",
    keywords: [
      "neurology", "neurologist", "neuro",
      "migraine", "headache", "seizure", "dizziness", "numbness", "stroke", "memory", "nerve", "tremor"
    ],
  },
  {
    specialty: "Cardiology",
    keywords: [
      "cardiology", "cardiologist", "cardiac", "heart",
      "chest pain", "palpitation", "blood pressure", "hypertension", "angina"
    ],
  },
  {
    specialty: "Orthopedics",
    keywords: [
      "orthopedics", "orthopedic", "orthopaedics", "bone specialist",
      "joint", "knee", "bone", "fracture", "back pain", "spine", "arthritis", "sprain"
    ],
  },
  {
    specialty: "Dermatology",
    keywords: [
      "dermatology", "dermatologist", "skin specialist",
      "skin", "rash", "acne", "eczema", "itching", "psoriasis", "allergy"
    ],
  },
  {
    specialty: "Pediatrics",
    keywords: [
      "pediatrics", "pediatrician", "paediatrics", "child specialist",
      "child", "baby", "infant", "toddler"
    ],
  },
  {
    specialty: "Psychiatry",
    keywords: [
      "psychiatry", "psychiatrist", "mental health",
      "anxiety", "depression", "panic", "insomnia", "stress"
    ],
  },
  {
    specialty: "General Medicine",
    keywords: [
      "general medicine", "physician", "general physician",
      "fever", "cough", "cold", "flu", "fatigue", "body ache", "chills"
    ],
  },
  {
    specialty: "Gastroenterology",
    keywords: [
      "gastroenterology", "gastroenterologist",
      "stomach pain", "acid reflux", "gerd", "constipation", "diarrhea", "bloating", "nausea"
    ],
  },
  {
    specialty: "Pulmonology",
    keywords: [
      "pulmonology", "pulmonologist",
      "asthma", "wheezing", "respiratory", "lung", "breathing difficulty"
    ],
  },
  {
    specialty: "ENT",
    keywords: [
      "ent", "ear nose throat", "otolaryngologist",
      "ear pain", "sinus", "tonsil", "sore throat", "nasal"
    ],
  },
  {
    specialty: "Ophthalmology",
    keywords: [
      "ophthalmology", "ophthalmologist", "eye specialist",
      "eye", "vision", "blur", "cataract", "glaucoma"
    ],
  },
];

/**
 * Returns matched specialty or null (NEVER defaults to General Medicine).
 */
const inferSpecialty = (text = "") => {
  if (!text || typeof text !== "string") return null;
  const lower = text.toLowerCase();
  const matched = symptomSpecialties.find((rule) =>
    rule.keywords.some((kw) => {
      if (kw.length <= 4) {
        return new RegExp(`\\b${kw}\\b`, "i").test(lower);
      }
      return lower.includes(kw);
    })
  );
  return matched ? matched.specialty : null;
};

const extractLocation = (text = "") => {
  if (!text || typeof text !== "string") return "";
  return text.match(/(?:in|near|from|live in|around|at)\s+([a-z][a-z\s-]{2,40})/i)?.[1]?.trim().replace(/[?.!,;]+$/, "") || "";
};

const toDoctorCard = (doctor) => ({
  id: String(doctor._id),
  _id: String(doctor._id),
  name: doctor.fullName,
  fullName: doctor.fullName,
  specialization: doctor.specialization,
  hospital: doctor.hospital || "NeuroCare Specialist Network",
  department: doctor.department || `${doctor.specialization} Clinic`,
  availability: Array.isArray(doctor.availability) ? doctor.availability : [],
  rating: Number(doctor.rating) || 0,
  yearsOfExperience: Number(doctor.yearsOfExperience) || 0,
  consultationFee: Number(doctor.consultationFee) || 0,
  location: doctor.location || [doctor.city, doctor.state, doctor.country].filter(Boolean).join(", ") || "",
  city: doctor.city || (doctor.location ? doctor.location.split(",")[0]?.trim() : ""),
  state: doctor.state || (doctor.location ? doctor.location.split(",")[1]?.trim() : ""),
  profilePhoto: doctor.profilePhoto || doctor.avatar || "",
  avatar: doctor.avatar || doctor.profilePhoto || "",
});

const findDoctors = async ({ query = "", specialty = "", city = "" }) => {
  const requestedCity = city || extractLocation(query);
  const filter = { role: "doctor", isActive: true, verificationStatus: { $ne: "rejected" } };

  const effectiveSpecialty = specialty || inferSpecialty(query);
  if (effectiveSpecialty) {
    filter.specialization = { $regex: effectiveSpecialty, $options: "i" };
  } else if (query && query.trim()) {
    const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { specialization: { $regex: escapedQuery, $options: "i" } },
      { department: { $regex: escapedQuery, $options: "i" } },
    ];
  }

  if (requestedCity) {
    const cityEscaped = requestedCity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cityClause = [
      { city: { $regex: cityEscaped, $options: "i" } },
      { state: { $regex: cityEscaped, $options: "i" } },
      { location: { $regex: cityEscaped, $options: "i" } },
    ];
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: cityClause }];
      delete filter.$or;
    } else {
      filter.$or = cityClause;
    }
  }

  const doctors = await User.find(filter)
    .select("fullName specialization department hospital availability rating yearsOfExperience consultationFee location city state country profilePhoto avatar")
    .sort({ rating: -1, yearsOfExperience: -1 })
    .limit(12);

  return doctors.map(toDoctorCard);
};

module.exports = {
  inferSpecialty,
  extractLocation,
  findDoctors,
  toDoctorCard,
};
