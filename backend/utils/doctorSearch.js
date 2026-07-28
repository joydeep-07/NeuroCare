const User = require("../models/user.model");

const symptomSpecialties = [
  { specialty: "Neurology", keywords: ["migraine", "headache", "seizure", "dizziness", "numbness", "stroke", "memory", "nerve"] },
  { specialty: "Cardiology", keywords: ["chest pain", "heart", "palpitation", "blood pressure"] },
  { specialty: "Orthopedics", keywords: ["joint", "knee", "bone", "fracture", "back pain", "spine"] },
  { specialty: "Dermatology", keywords: ["skin", "rash", "acne", "eczema", "itching"] },
  { specialty: "Pediatrics", keywords: ["child", "baby", "infant"] },
  { specialty: "Psychiatry", keywords: ["anxiety", "depression", "panic", "mental health"] },
  { specialty: "General Medicine", keywords: ["fever", "cough", "cold", "flu", "fatigue", "body ache"] },
];

const inferSpecialty = (text = "") => symptomSpecialties.find((rule) => rule.keywords.some((keyword) => text.toLowerCase().includes(keyword)))?.specialty || "General Medicine";
const extractLocation = (text = "") => text.match(/(?:in|near|from|live in)\s+([a-z][a-z\s-]{2,40})/i)?.[1]?.trim().replace(/[?.!,]+$/, "") || "";
const toDoctorCard = (doctor) => ({ id: doctor._id, name: doctor.fullName, specialization: doctor.specialization, hospital: doctor.hospital, availability: doctor.availability || [], rating: doctor.rating, yearsOfExperience: doctor.yearsOfExperience, consultationFee: doctor.consultationFee, location: doctor.location || [doctor.city, doctor.state, doctor.country].filter(Boolean).join(", "), profilePhoto: doctor.profilePhoto || doctor.avatar });

const findDoctors = async ({ query, specialty, city }) => {
  const requestedCity = city || extractLocation(query);
  const filter = { role: "doctor", isActive: true, verificationStatus: { $ne: "rejected" } };
  if (specialty) filter.specialization = { $regex: specialty, $options: "i" };
  if (requestedCity) filter.$or = [{ city: { $regex: requestedCity, $options: "i" } }, { state: { $regex: requestedCity, $options: "i" } }, { location: { $regex: requestedCity, $options: "i" } }];
  const doctors = await User.find(filter).select("fullName specialization hospital availability rating yearsOfExperience consultationFee location city state country profilePhoto avatar").sort({ rating: -1, yearsOfExperience: -1 }).limit(12);
  return doctors.map(toDoctorCard);
};

module.exports = { inferSpecialty, extractLocation, findDoctors };
