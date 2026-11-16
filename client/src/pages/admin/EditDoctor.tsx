import { useState, useEffect } from "react";
import { UserCog, AlertCircle, CheckCircle2, ShieldAlert, ArrowLeft, RefreshCw, Stethoscope, Search } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import ENDPOINTS from "../../api/endPoints";
import type { RootState } from "../../redux/store";

interface DoctorItem {
  _id: string;
  fullName: string;
  email: string;
  specialization: string;
  hospital: string;
  location?: string;
  isActive?: boolean;
}

const EditDoctor = () => {
  const navigate = useNavigate();
  const { id: paramDoctorId } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Doctor selection & list
  const [doctorsList, setDoctorsList] = useState<DoctorItem[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(paramDoctorId || "");
  const [fetchingList, setFetchingList] = useState(false);
  const [searchDoctorTerm, setSearchDoctorTerm] = useState("");

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [medicalRegNo, setMedicalRegNo] = useState("");
  const [specialization, setSpecialization] = useState("Neurology");
  const [degree, setDegree] = useState("");
  const [hospital, setHospital] = useState("");
  const [department, setDepartment] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("0");
  const [consultationFee, setConsultationFee] = useState("0");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState("");
  const [biography, setBiography] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Status State
  const [loadingDoctor, setLoadingDoctor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch all doctors for admin selector
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") return;

    const fetchAllDoctors = async () => {
      try {
        setFetchingList(true);
        const res = await api.get(ENDPOINTS.ADMIN.DOCTORS);
        if (res.data.success) {
          setDoctorsList(res.data.doctors || []);
          // If no doctor is selected yet, default to the first one
          if (!selectedDoctorId && res.data.doctors?.length > 0) {
            setSelectedDoctorId(res.data.doctors[0]._id);
          }
        }
      } catch (err) {
        console.error("Error fetching doctors list for admin:", err);
      } finally {
        setFetchingList(false);
      }
    };

    fetchAllDoctors();
  }, [isAuthenticated, user?.role]);

  // When paramDoctorId changes from URL, update selectedDoctorId
  useEffect(() => {
    if (paramDoctorId) {
      setSelectedDoctorId(paramDoctorId);
    }
  }, [paramDoctorId]);

  // Load doctor details when selectedDoctorId changes
  useEffect(() => {
    if (!selectedDoctorId || !isAuthenticated || user?.role !== "admin") return;

    const fetchDoctorData = async () => {
      try {
        setLoadingDoctor(true);
        setErrorMsg("");
        setSuccessMsg("");

        const res = await api.get(ENDPOINTS.ADMIN.DOCTOR_BY_ID(selectedDoctorId));
        if (res.data.success && res.data.doctor) {
          const doc = res.data.doctor;
          setFullName(doc.fullName || "");
          setEmail(doc.email || "");
          setPhone(doc.phone || "");
          setMedicalRegNo(doc.medicalRegNo || "");
          setSpecialization(doc.specialization || "Neurology");
          setDegree(doc.degree || "");
          setHospital(doc.hospital || "");
          setDepartment(doc.department || "");
          setYearsOfExperience(String(doc.yearsOfExperience ?? 0));
          setConsultationFee(String(doc.consultationFee ?? 0));
          setLocation(doc.location || "New Delhi, India");
          setAvatar(doc.avatar || "");
          setBiography(doc.biography || "");
          setIsActive(doc.isActive !== undefined ? doc.isActive : true);
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || "Failed to load doctor profile details.");
      } finally {
        setLoadingDoctor(false);
      }
    };

    fetchDoctorData();
  }, [selectedDoctorId, isAuthenticated, user?.role]);

  // Access Control: ONLY admin can access this page
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-xl">
          <ShieldAlert size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-heading text-[var(--text-main)]">Access Restricted</h1>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
            This module is restricted to Hospital Administrators only. Please sign in with an authorized Administrator account to edit doctor credentials.
          </p>
        </div>
        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl border border-[var(--border-light)] text-[var(--text-main)] text-xs font-semibold hover:bg-[var(--bg-main)] transition-all"
          >
            Go to Home
          </button>
          <button
            onClick={() => navigate("/signin")}
            className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-lg transition-all"
          >
            Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !medicalRegNo.trim() || !specialization.trim() || !hospital.trim() || !location.trim()) {
      setErrorMsg("Full Name, Email, Medical Registration Number, Specialization, Hospital, and Location are required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await api.put(ENDPOINTS.ADMIN.UPDATE_DOCTOR(selectedDoctorId), {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        medicalRegNo: medicalRegNo.trim(),
        specialization: specialization.trim(),
        degree: degree.trim(),
        hospital: hospital.trim(),
        department: department.trim(),
        yearsOfExperience: Number(yearsOfExperience),
        consultationFee: Number(consultationFee),
        location: location.trim(),
        avatar: avatar.trim(),
        biography: biography.trim(),
        isActive,
      });

      if (res.data.success) {
        setSuccessMsg(`Doctor profile for ${fullName} updated successfully!`);
        // Refresh local doctors list item
        setDoctorsList((prev) =>
          prev.map((d) =>
            d._id === selectedDoctorId
              ? {
                  ...d,
                  fullName: fullName.trim(),
                  email: email.trim().toLowerCase(),
                  specialization: specialization.trim(),
                  hospital: hospital.trim(),
                  location: location.trim(),
                  isActive,
                }
              : d
          )
        );
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to update doctor profile.");
    } finally {
      setSaving(false);
    }
  };

  const filteredDoctors = doctorsList.filter(
    (d) =>
      d.fullName.toLowerCase().includes(searchDoctorTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchDoctorTerm.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchDoctorTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <UserCog size={16} /> Admin Doctor Management
            </div>
            <h1 className="text-3xl font-bold font-heading">Edit Doctor Profile</h1>
            <p className="text-xs text-amber-100/80 mt-1">
              Update doctor credentials, location, hospital affiliations, consultation fees, and account status.
            </p>
          </div>
          <Link
            to="/admin/dashboard"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Doctor Selection Bar */}
      <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
              Select Doctor to Edit
            </label>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Choose from all registered doctors or search by name / specialty
            </span>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search doctor..."
                value={searchDoctorTerm}
                onChange={(e) => setSearchDoctorTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] outline-none"
              />
            </div>

            <select
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                navigate(`/admin/edit-doctor/${e.target.value}`);
              }}
              className="flex-1 md:w-64 px-3 py-2 text-xs rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] outline-none font-medium"
              disabled={fetchingList}
            >
              {filteredDoctors.length === 0 ? (
                <option value="">No doctors found</option>
              ) : (
                filteredDoctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.fullName} ({doc.specialization}) {doc.isActive === false ? "[Inactive]" : ""}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-xl relative">
        {loadingDoctor ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw size={32} className="mx-auto text-amber-500 animate-spin" />
            <p className="text-xs text-[var(--text-secondary)]">Loading doctor credentials...</p>
          </div>
        ) : !selectedDoctorId ? (
          <div className="py-16 text-center space-y-3 text-[var(--text-secondary)]">
            <Stethoscope size={36} className="mx-auto opacity-50" />
            <p className="text-sm font-semibold">No Doctor Selected</p>
            <p className="text-xs">Please select a doctor from the dropdown above to edit their profile.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-semibold flex items-center gap-2">
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} /> {successMsg}
              </div>
            )}

            {/* Account Status Switch */}
            <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-light)] flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-[var(--text-main)] block">Doctor Account Status</span>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  {isActive
                    ? "Active: Doctor appears in search results and can accept appointments."
                    : "Inactive: Doctor is deactivated and hidden from public search."}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    : "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                }`}
              >
                {isActive ? "Active (Enabled)" : "Deactivated"}
              </button>
            </div>

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
                      if (!department) setDepartment(`Department of ${e.target.value}`);
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
                    <option value="Gastroenterology">Gastroenterology</option>
                    <option value="Pulmonology">Pulmonology</option>
                    <option value="ENT">ENT</option>
                    <option value="Ophthalmology">Ophthalmology</option>
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
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Location *</label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi, Delhi, India"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
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
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Profile Photo URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Biography / Summary</label>
                  <textarea
                    rows={4}
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
                disabled={saving}
                className="flex-1 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? "Saving Changes..." : "Save Doctor Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditDoctor;
