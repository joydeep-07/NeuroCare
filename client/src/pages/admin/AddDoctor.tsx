import { useState } from "react";
import { UserPlus, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ENDPOINTS from "../../api/endPoints";

const AddDoctor = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [medicalRegNo, setMedicalRegNo] = useState("");
  const [specialization, setSpecialization] = useState("Neurology");
  const [degree, setDegree] = useState("MBBS, MD, DM");
  const [hospital, setHospital] = useState("NeuroCare Institute of Brain & Spine, New Delhi");
  const [department, setDepartment] = useState("Department of Neurosciences");
  const [yearsOfExperience, setYearsOfExperience] = useState("10");
  const [consultationFee, setConsultationFee] = useState("1000");
  const [location] = useState("New Delhi, India");
  const [avatar, setAvatar] = useState("");
  const [biography, setBiography] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !medicalRegNo || !specialization || !hospital) {
      setErrorMsg("Full Name, Email, Medical Registration Number, Specialization, and Hospital are required.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await api.post(ENDPOINTS.ADMIN.DOCTORS, {
        fullName,
        email,
        phone,
        medicalRegNo,
        specialization,
        degree,
        hospital,
        department,
        yearsOfExperience: Number(yearsOfExperience),
        consultationFee: Number(consultationFee),
        location,
        avatar: avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400",
        biography,
      });

      if (res.data.success) {
        alert(`Doctor account for ${fullName} created successfully!\nLogin ID: ${email.toLowerCase()}\nDoctor authenticates via Email OTP only.`);
        navigate("/admin/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to create doctor account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 text-white shadow-2xl">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <UserPlus size={16} /> Doctor Onboarding Module
        </div>
        <h1 className="text-3xl font-bold font-heading">Register New Doctor Account</h1>
        <p className="text-xs text-amber-100/80 mt-1">
          Only Administrators can add doctor accounts. The registered email will serve as the doctor's login ID using Email OTP authentication.
        </p>
      </div>

      {/* Form Card */}
      <div className="p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-semibold flex items-center gap-2">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {/* Personal & Account Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold font-heading text-[var(--accent-primary)] uppercase tracking-wider">
              1. Basic Credentials & Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Doctor Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Official Doctor Email (Login ID) *</label>
                <input
                  type="email"
                  placeholder="doctor.name@neurocare.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98112 34567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Medical Registration Number *</label>
                <input
                  type="text"
                  placeholder="e.g. MCI-2012-98421"
                  value={medicalRegNo}
                  onChange={(e) => setMedicalRegNo(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Professional Credentials */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-light)]">
            <h3 className="text-sm font-bold font-heading text-[var(--accent-primary)] uppercase tracking-wider">
              2. Specialization & Hospital Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Specialization *</label>
                <select
                  value={specialization}
                  onChange={(e) => {
                    setSpecialization(e.target.value);
                    setDepartment(`Department of ${e.target.value}`);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] outline-none"
                >
                  <option value="Neurology">Neurology</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Degrees & Qualifications</label>
                <input
                  type="text"
                  placeholder="e.g. MBBS, MD, DM (Neurology)"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Assigned Hospital *</label>
                <input
                  type="text"
                  placeholder="Hospital Name"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Department</label>
                <input
                  type="text"
                  placeholder="Department Name"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Years of Experience</label>
                <input
                  type="number"
                  placeholder="e.g. 12"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Consultation Fee (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Photo & Biography */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-light)]">
            <h3 className="text-sm font-bold font-heading text-[var(--accent-primary)] uppercase tracking-wider">
              3. Profile Photo & Professional Biography
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Profile Photo URL (Cloudinary / Image URL)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Biography / Professional Profile Summary</label>
                <textarea
                  rows={3}
                  placeholder="Enter detailed clinical biography..."
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-[var(--border-light)]">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="flex-1 py-3.5 rounded-xl border border-[var(--border-light)] text-[var(--text-main)] text-sm font-semibold hover:bg-[var(--bg-main)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Registering Doctor Account..." : "Create Doctor Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctor;
