import { useState, useEffect } from "react";
import { Search, Stethoscope, Star, MapPin, Building, Calendar, ArrowRight } from "lucide-react";
import api from "../../api/axios";
import ENDPOINTS from "../../api/endPoints";
import BookAppointmentModal from "../../components/patient/BookAppointmentModal";

interface Doctor {
  _id: string;
  fullName: string;
  specialization: string;
  degree: string;
  hospital: string;
  department: string;
  yearsOfExperience: number;
  consultationFee: number;
  biography: string;
  avatar?: string;
  rating: number;
  reviewsCount: number;
  location: string;
  availability?: Array<{ day: string; slots: string[] }>;
}

const SPECIALTIES = [
  "All Specialties",
  "Neurology",
  "Cardiology",
  "Orthopedics",
  "Dermatology",
  "Pediatrics",
  "Psychiatry",
  "General Medicine",
];

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [loading, setLoading] = useState(true);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery.trim()) params.query = searchQuery;
      if (selectedSpecialty !== "All Specialties") params.specialty = selectedSpecialty;

      const res = await api.get(ENDPOINTS.DOCTOR.GET_ALL, { params });
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (err) {
      console.log("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="max-w-8xl mx-auto px-12 py-8 md:py-12 space-y-8">
      {/* Hero Header */}
      <div className="relative rounded-lg p-8 md:p-12 bg-gradient-to-r from-cyan-900 via-blue-900 to-indigo-950 text-white shadow-2xl overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-semibold uppercase tracking-wider mb-4">
            <Stethoscope size={14} /> Certified Specialists
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-heading mb-4 leading-tight">
            Discover Top Doctors & Request Appointments
          </h1>
          <p className="text-cyan-100/80 text-sm md:text-base leading-relaxed">
            Search qualified healthcare experts by symptoms, medical specialty,
            hospital, or city. Submit your request for swift administrative
            confirmation.
          </p>
        </div>
      </div>

      {/* Search & Specialty Bar */}
      <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--border-light)] shadow-lg space-y-6">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col md:flex-row gap-2"
        >
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by doctor name, symptoms (e.g. migraine, chest pain), or hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-l-full rounded-r-sm border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] text-sm outline-none focus:border-[var(--accent-primary)] transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3.5 rounded-r-sm bg-[var(--accent-primary)] text-white text-sm font-semibold hover:opacity-90 shadow-md shadow-blue-500/20 transition-all"
          >
            Search Doctors
          </button>
        </form>

        {/* Specialty Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SPECIALTIES.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSpecialty === spec
                  ? "bg-[var(--accent-primary)] text-white shadow-sm"
                  : "bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border-light)] hover:text-[var(--text-main)]"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] animate-pulse"
              />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)]">
            <Stethoscope
              size={48}
              className="mx-auto text-[var(--text-secondary)] mb-4"
            />
            <h3 className="text-xl font-bold text-[var(--text-main)] font-heading">
              No Doctors Found
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Try refining your search query or selecting a different medical
              specialty.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="group rounded-lg bg-[var(--card-bg)]/50 border border-[var(--border-light)]/50 p-6 shadow-sm hover:shadow-xl hover:border-[var(--accent-primary)]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-4 items-center mb-4">
                    <img
                      src={
                        doctor.avatar ||
                        "https://i.pinimg.com/1200x/5d/90/30/5d90305c3e338f4b17a52fd8dccf83b8.jpg"
                      }
                      alt={doctor.fullName}
                      className="w-16 h-16 rounded-full object-top object-cover border border-[var(--border-light)] shadow-xs"
                    />
                    <div className="flex-1">
                      {/* <div className="flex items-center gap-1.5 text-amber-500 font-semibold text-xs mb-1">
                        <Star size={14} className="fill-amber-500" />
                        <span>{doctor.rating || 4.8}</span>
                        <span className="text-[var(--text-secondary)]">({doctor.reviewsCount || 18} reviews)</span>
                      </div> */}
                      <h3 className="text-xl font-bold text-[var(--text-main)] font-heading leading-snug">
                        {doctor.fullName}
                      </h3>
                      <p className="text-xs font-semibold text-[var(--accent-primary)]">
                        {doctor.specialization}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-3 text-justify">
                    {doctor.biography}
                  </p>

                  <div className="space-y-2 text-xs text-[var(--text-secondary)] mb-6 pt-3 border-t border-[var(--border-light)]">
                    <div className="flex items-center gap-2">
                      <Building
                        size={14}
                        className="text-[var(--accent-primary)] shrink-0"
                      />
                      <span className="truncate">{doctor.hospital}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin
                        size={14}
                        className="text-[var(--accent-primary)] shrink-0"
                      />
                      <span>{doctor.location || "New Delhi, India"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar
                        size={14}
                        className="text-[var(--accent-primary)] shrink-0"
                      />
                      <span>{doctor.yearsOfExperience} Years Experience</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)]">
                  <div>
                    <span className="text-xs text-[var(--text-secondary)] block">
                      Consultation Fee
                    </span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{doctor.consultationFee}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedDoctorForBooking(doctor)}
                    className="px-5 py-2.5 rounded-sm bg-[var(--accent-primary)] text-white text-xs font-semibold hover:opacity-90 shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                  >
                    Request Appointment <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointment Booking Modal Trigger */}
      {selectedDoctorForBooking && (
        <BookAppointmentModal
          doctor={selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          onSuccess={() => {
            fetchDoctors();
          }}
        />
      )}
    </div>
  );
};

export default DoctorSearch;
