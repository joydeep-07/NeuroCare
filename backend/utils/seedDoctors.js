const User = require("../models/user.model");

const DEFAULT_DOCTORS = [
  {
    fullName: "Dr. Rajesh Sharma",
    email: "joydeeprnp8821@gmail.com",
    phone: "+91 98112 34567",
    medicalRegNo: "MCI-2012-98421",
    specialization: "Neurology",
    degree: "MBBS, MD (General Medicine), DM (Neurology)",
    hospital: "NeuroCare Institute of Brain & Spine, New Delhi",
    department: "Department of Neurosciences",
    yearsOfExperience: 16,
    consultationFee: 1200,
    biography:
      "Dr. Rajesh Sharma is a leading Neurologist with extensive expertise in stroke management, epilepsy, movement disorders, and neuro-rehabilitation.",
    avatar:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400",
    location: "New Delhi, Delhi, India",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    rating: 4.9,
    reviewsCount: 42,
    role: "doctor",
    isActive: true,
    verificationStatus: "verified",
    isProfileComplete: true,
    availability: [
      { day: "Monday", slots: ["09:00 AM", "11:00 AM", "02:00 PM"] },
      { day: "Wednesday", slots: ["10:00 AM", "01:00 PM", "04:00 PM"] },
      { day: "Friday", slots: ["09:00 AM", "12:00 PM", "03:00 PM"] },
    ],
  },
  {
    fullName: "Dr. Ananya Sen",
    email: "joydeeprnp8822@gmail.com",
    phone: "+91 98765 11223",
    medicalRegNo: "MCI-2015-44312",
    specialization: "Cardiology",
    degree: "MBBS, MD, DM (Cardiology), FACC",
    hospital: "NeuroCare Heart & Vascular Hospital, Mumbai",
    department: "Cardiovascular & Heart Institute",
    yearsOfExperience: 12,
    consultationFee: 1500,
    biography:
      "Dr. Ananya Sen specializes in interventional cardiology, heart failure management, and preventive cardiac wellness.",
    avatar:
      "https://i.pinimg.com/736x/ad/6c/b0/ad6cb07e44a5e63ffc89d7723b181052.jpg",
    location: "Mumbai, Maharashtra, India",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    rating: 4.8,
    reviewsCount: 38,
    role: "doctor",
    isActive: true,
    verificationStatus: "verified",
    isProfileComplete: true,
    availability: [
      { day: "Tuesday", slots: ["10:00 AM", "02:00 PM", "05:00 PM"] },
      { day: "Thursday", slots: ["09:00 AM", "01:00 PM", "04:00 PM"] },
      { day: "Saturday", slots: ["10:00 AM", "01:00 PM"] },
    ],
  },
  {
    fullName: "Dr. Vikram Patel",
    email: "joydeeprnp8823@gmail.com",
    phone: "+91 98220 99887",
    medicalRegNo: "MCI-2010-77812",
    specialization: "Orthopedics",
    degree: "MBBS, MS (Orthopedics), M.Ch (UK)",
    hospital: "NeuroCare Joint Replacement Center, Bengaluru",
    department: "Department of Orthopedics & Spine",
    yearsOfExperience: 18,
    consultationFee: 1000,
    biography:
      "Dr. Vikram Patel is a renowned orthopedic surgeon specializing in robotic joint replacement, arthroscopy, and spine care.",
    avatar:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400",
    location: "Bengaluru, Karnataka, India",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    rating: 4.9,
    reviewsCount: 56,
    role: "doctor",
    isActive: true,
    verificationStatus: "verified",
    isProfileComplete: true,
    availability: [
      { day: "Monday", slots: ["10:00 AM", "02:00 PM", "04:00 PM"] },
      { day: "Thursday", slots: ["09:00 AM", "11:30 AM", "03:00 PM"] },
      { day: "Friday", slots: ["10:00 AM", "01:00 PM"] },
    ],
  },
  {
    fullName: "Dr. Priya Nair",
    email: "joydeeprnp8824@gmail.com",
    phone: "+91 97441 55667",
    medicalRegNo: "MCI-2018-12998",
    specialization: "Dermatology",
    degree: "MBBS, MD (Dermatology, Venereology & Leprosy)",
    hospital: "NeuroCare Wellness & Skin Center, Chennai",
    department: "Department of Dermatology & Aesthetics",
    yearsOfExperience: 8,
    consultationFee: 800,
    biography:
      "Dr. Priya Nair provides expert clinical dermatology, trichology, and advanced aesthetic skin treatments.",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
    location: "Chennai, Tamil Nadu, India",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    rating: 4.7,
    reviewsCount: 29,
    role: "doctor",
    isActive: true,
    verificationStatus: "verified",
    isProfileComplete: true,
    availability: [
      { day: "Wednesday", slots: ["11:00 AM", "03:00 PM", "06:00 PM"] },
      { day: "Friday", slots: ["10:00 AM", "02:00 PM"] },
      { day: "Saturday", slots: ["09:30 AM", "12:30 PM"] },
    ],
  },
  {
    fullName: "Dr. Kavita Rao",
    email: "dr.kavita.rao@neurocare.com",
    phone: "+91 98490 12345",
    medicalRegNo: "MCI-2014-65432",
    specialization: "General Medicine",
    degree: "MBBS, MD (General Medicine)",
    hospital: "NeuroCare Multispecialty Hospital, Hyderabad",
    department: "Department of Internal Medicine",
    yearsOfExperience: 14,
    consultationFee: 700,
    biography:
      "Dr. Kavita Rao specializes in adult internal medicine, lifestyle illnesses, diabetic care, and comprehensive preventative health.",
    avatar: "https://images.unsplash.com/photo-1594824813593-1b9a147a4697?w=400",
    location: "Hyderabad, Telangana, India",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    rating: 4.8,
    reviewsCount: 35,
    role: "doctor",
    isActive: true,
    verificationStatus: "verified",
    isProfileComplete: true,
    availability: [
      { day: "Monday", slots: ["09:00 AM", "12:00 PM", "04:00 PM"] },
      { day: "Tuesday", slots: ["10:00 AM", "02:00 PM", "05:00 PM"] },
      { day: "Thursday", slots: ["09:00 AM", "01:00 PM"] },
    ],
  },
  {
    fullName: "Dr. Sameer Verma",
    email: "dr.sameer.verma@neurocare.com",
    phone: "+91 98230 67890",
    medicalRegNo: "MCI-2016-87654",
    specialization: "Psychiatry",
    degree: "MBBS, MD (Psychiatry)",
    hospital: "NeuroCare Behavioral & Mental Wellness Clinic, Pune",
    department: "Department of Psychiatry & Behavioral Health",
    yearsOfExperience: 10,
    consultationFee: 1100,
    biography:
      "Dr. Sameer Verma offers empathetic, evidence-based psychiatric support for stress, mood disorders, insomnia, and cognitive wellness.",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
    location: "Pune, Maharashtra, India",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    rating: 4.9,
    reviewsCount: 48,
    role: "doctor",
    isActive: true,
    verificationStatus: "verified",
    isProfileComplete: true,
    availability: [
      { day: "Tuesday", slots: ["11:00 AM", "03:00 PM", "06:00 PM"] },
      { day: "Thursday", slots: ["10:00 AM", "02:00 PM"] },
      { day: "Saturday", slots: ["10:00 AM", "01:00 PM"] },
    ],
  },
  {
    fullName: "Dr. Arishta Ganguly",
    email: "dr.arishta.ganguly@neurocare.com",
    phone: "+91 98300 24680",
    medicalRegNo: "MCI-2017-31415",
    specialization: "Pediatrics",
    degree: "MBBS, MD (Pediatrics), DNB",
    hospital: "NeuroCare Children & Adolescent Clinic, Kolkata",
    department: "Department of Pediatrics",
    yearsOfExperience: 9,
    consultationFee: 900,
    biography:
      "Dr. Arishta Ganguly is dedicated to infant healthcare, pediatric neuro-development, childhood allergies, and adolescent well-being.",
    avatar: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400",
    location: "Kolkata, West Bengal, India",
    city: "Kolkata",
    state: "West Bengal",
    country: "India",
    rating: 4.8,
    reviewsCount: 31,
    role: "doctor",
    isActive: true,
    verificationStatus: "verified",
    isProfileComplete: true,
    availability: [
      { day: "Monday", slots: ["10:00 AM", "01:00 PM", "05:00 PM"] },
      { day: "Wednesday", slots: ["10:00 AM", "02:00 PM"] },
      { day: "Friday", slots: ["11:00 AM", "04:00 PM"] },
    ],
  },
];

const seedInitialData = async () => {
  try {
    for (const docData of DEFAULT_DOCTORS) {
      const existing = await User.findOne({ email: docData.email });
      if (!existing) {
        await User.create(docData);
        console.log(`[NeuroCare Seed] Seeded doctor: ${docData.fullName}`);
      } else {
        // Backfill city/state/verification if missing
        let changed = false;
        if (!existing.city && docData.city) {
          existing.city = docData.city;
          changed = true;
        }
        if (!existing.state && docData.state) {
          existing.state = docData.state;
          changed = true;
        }
        if (existing.verificationStatus !== "verified") {
          existing.verificationStatus = "verified";
          changed = true;
        }
        if (changed) {
          await existing.save();
        }
      }
    }

    // Also backfill any other existing doctors who have empty city
    const doctorsWithoutCity = await User.find({ role: "doctor", city: { $in: ["", null] } });
    for (const d of doctorsWithoutCity) {
      if (d.location) {
        const parts = d.location.split(",").map((s) => s.trim());
        if (parts[0]) d.city = parts[0];
        if (parts[1]) d.state = parts[1];
        d.verificationStatus = "verified";
        await d.save();
      }
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
