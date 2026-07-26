const User = require("../models/user.model");

const DEFAULT_DOCTORS = [
  {
    fullName: "Dr. Rajesh Sharma",
    email: "rajesh.sharma@neurocare.com",
    phone: "+91 98112 34567",
    medicalRegNo: "MCI-2012-98421",
    specialization: "Neurology",
    degree: "MBBS, MD (General Medicine), DM (Neurology)",
    hospital: "NeuroCare Institute of Brain & Spine, New Delhi",
    department: "Department of Neurosciences",
    yearsOfExperience: 16,
    consultationFee: 1200,
    biography: "Dr. Rajesh Sharma is a leading Neurologist with extensive expertise in stroke management, epilepsy, movement disorders, and neuro-rehabilitation.",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400",
    location: "New Delhi, India",
    rating: 4.9,
    reviewsCount: 42,
    role: "doctor",
    isProfileComplete: true,
    availability: [
      { day: "Monday", slots: ["09:00 AM", "11:00 AM", "02:00 PM"] },
      { day: "Wednesday", slots: ["10:00 AM", "01:00 PM", "04:00 PM"] },
      { day: "Friday", slots: ["09:00 AM", "12:00 PM", "03:00 PM"] },
    ],
  },
  {
    fullName: "Dr. Ananya Sen",
    email: "ananya.sen@neurocare.com",
    phone: "+91 98765 11223",
    medicalRegNo: "MCI-2015-44312",
    specialization: "Cardiology",
    degree: "MBBS, MD, DM (Cardiology), FACC",
    hospital: "NeuroCare Heart & Vascular Hospital, Mumbai",
    department: "Cardiovascular & Heart Institute",
    yearsOfExperience: 12,
    consultationFee: 1500,
    biography: "Dr. Ananya Sen specializes in interventional cardiology, heart failure management, and preventive cardiac wellness.",
    avatar: "https://images.unsplash.com/photo-1594824813566-78a933758f46?w=400",
    location: "Mumbai, India",
    rating: 4.8,
    reviewsCount: 38,
    role: "doctor",
    isProfileComplete: true,
    availability: [
      { day: "Tuesday", slots: ["10:00 AM", "02:00 PM", "05:00 PM"] },
      { day: "Thursday", slots: ["09:00 AM", "01:00 PM", "04:00 PM"] },
      { day: "Saturday", slots: ["10:00 AM", "01:00 PM"] },
    ],
  },
  {
    fullName: "Dr. Vikram Patel",
    email: "vikram.patel@neurocare.com",
    phone: "+91 98220 99887",
    medicalRegNo: "MCI-2010-77812",
    specialization: "Orthopedics",
    degree: "MBBS, MS (Orthopedics), M.Ch (UK)",
    hospital: "NeuroCare Joint Replacement Center, Bengaluru",
    department: "Department of Orthopedics & Spine",
    yearsOfExperience: 18,
    consultationFee: 1000,
    biography: "Dr. Vikram Patel is a renowned orthopedic surgeon specializing in robotic joint replacement, arthroscopy, and spine care.",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400",
    location: "Bengaluru, India",
    rating: 4.9,
    reviewsCount: 56,
    role: "doctor",
    isProfileComplete: true,
    availability: [
      { day: "Monday", slots: ["10:00 AM", "02:00 PM", "04:00 PM"] },
      { day: "Thursday", slots: ["09:00 AM", "11:30 AM", "03:00 PM"] },
      { day: "Friday", slots: ["10:00 AM", "01:00 PM"] },
    ],
  },
  {
    fullName: "Dr. Priya Nair",
    email: "priya.nair@neurocare.com",
    phone: "+91 97441 55667",
    medicalRegNo: "MCI-2018-12998",
    specialization: "Dermatology",
    degree: "MBBS, MD (Dermatology, Venereology & Leprosy)",
    hospital: "NeuroCare Wellness & Skin Center, Chennai",
    department: "Department of Dermatology & Aesthetics",
    yearsOfExperience: 8,
    consultationFee: 800,
    biography: "Dr. Priya Nair provides expert clinical dermatology, trichology, and advanced aesthetic skin treatments.",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
    location: "Chennai, India",
    rating: 4.7,
    reviewsCount: 29,
    role: "doctor",
    isProfileComplete: true,
    availability: [
      { day: "Wednesday", slots: ["11:00 AM", "03:00 PM", "06:00 PM"] },
      { day: "Friday", slots: ["10:00 AM", "02:00 PM"] },
      { day: "Saturday", slots: ["09:30 AM", "12:30 PM"] },
    ],
  },
];

const seedInitialData = async () => {
  try {
    const doctorCount = await User.countDocuments({ role: "doctor" });
    if (doctorCount === 0) {
      console.log("[NeuroCare Seed] Seeding initial doctor accounts...");
      await User.insertMany(DEFAULT_DOCTORS);
      console.log("[NeuroCare Seed] 4 doctors seeded successfully!");
    }

    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount === 0) {
      await User.create({
        email: "admin@neurocare.com",
        fullName: "Hospital Administrator",
        phone: "+91 98765 43210",
        password: "Admin@123",
        role: "admin",
        isProfileComplete: true,
      });
      console.log("[NeuroCare Seed] Default admin seeded (admin@neurocare.com)");
    }
  } catch (error) {
    console.error("[NeuroCare Seed Error]:", error.message);
  }
};

module.exports = seedInitialData;
