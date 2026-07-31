import { useState, useEffect, useRef } from "react";
import {
  Search,
  Stethoscope,
  MapPin,
  Building,
  Calendar,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import api from "../api/axios";
import ENDPOINTS from "../api/endPoints";
import AppointmentForm from "./AppointmentForm";

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

const AllDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] =
    useState<Doctor | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setShowAll(false); // Reset show all on new search/filter
      const params: any = {};
      if (searchQuery.trim()) params.query = searchQuery;
      if (selectedSpecialty !== "All Specialties")
        params.specialty = selectedSpecialty;

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

  // GSAP animation when toggling "Show All" / "Show Less"
  const handleToggleShowAll = () => {
    const nextState = !showAll;
    setShowAll(nextState);

    if (nextState && gridRef.current) {
      setTimeout(() => {
        gsap.fromTo(
          gridRef.current?.querySelectorAll(".doctor-card-extra") || [],
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" }
        );
      }, 50);
    }
  };

  // Sliced list for default vs expanded view
  const displayedDoctors = showAll ? doctors : doctors.slice(0, 3);

  return (
    <div
      className="min-h-screen font-sans transition-colors duration-300"
      style={{
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      <div className="px-4 md:px-12 py-8 md:py-12 space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden transition-colors duration-300">
          <div className="relative z-10 max-w-3xl">
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{
                color: "var(--accent-primary)",
              }}
            >
              <Stethoscope size={14} /> Certified Specialists
            </span>
            <h1
              className="text-3xl md:text-5xl font-light mb-4 leading-tight"
              style={{ color: "var(--text-main)" }}
            >
              Discover Top Doctors & Request For Early Appointments
            </h1>
          </div>
        </div>

        {/* Search & Specialty Bar */}
        <div className="space-y-6">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col md:flex-row gap-2"
          >
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-secondary)" }}
                size={20}
              />
              <input
                type="text"
                placeholder="Search by doctor name, symptoms (e.g. migraine, chest pain), or hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-sm border text-sm outline-none transition-all shadow-sm"
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--border-light)",
                  color: "var(--text-main)",
                }}
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3.5 rounded-sm text-white text-sm font-semibold hover:opacity-90 shadow-md transition-all cursor-pointer"
              style={{
                backgroundColor: "var(--accent-primary)",
              }}
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
                className={`px-4 py-2 rounded-sm text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedSpecialty === spec
                    ? "text-white shadow-sm"
                    : "hover:opacity-100 opacity-80"
                }`}
                style={{
                  backgroundColor:
                    selectedSpecialty === spec
                      ? "var(--accent-primary)"
                      : "var(--card-bg)",
                  color:
                    selectedSpecialty === spec
                      ? "#ffffff"
                      : "var(--text-secondary)",
                  borderColor:
                    selectedSpecialty === spec
                      ? "var(--accent-primary)"
                      : "var(--border-light)",
                }}
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
                  className="h-64 rounded-lg border animate-pulse"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--border-light)",
                  }}
                />
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-16 p-8">
              <Stethoscope
                size={48}
                className="mx-auto mb-4"
                style={{ color: "var(--text-secondary)" }}
              />
              <h3
                className="text-xl font-bold"
                style={{ color: "var(--text-main)" }}
              >
                No Doctors Found
              </h3>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Try refining your search query or selecting a different medical
                specialty.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div
                ref={gridRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {displayedDoctors.map((doctor, index) => (
                  <motion.div
                    key={doctor._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`group rounded-lg border p-6 shadow-sm transition-all flex flex-col justify-between ${
                      index >= 3 ? "doctor-card-extra" : ""
                    }`}
                    style={{
                      backgroundColor: "var(--card-bg)",
                      borderColor: "var(--border-light)",
                    }}
                  >
                    <div>
                      <div className="flex gap-4 items-center mb-4">
                        <img
                          src={
                            doctor.avatar ||
                            "https://i.pinimg.com/1200x/5d/90/30/5d90305c3e338f4b17a52fd8dccf83b8.jpg"
                          }
                          alt={doctor.fullName}
                          className="w-16 h-16 rounded-full object-top object-cover border shadow-xs"
                          style={{ borderColor: "var(--border-light)" }}
                        />
                        <div className="flex-1">
                          <h3
                            className="text-xl font-semibold leading-snug"
                            style={{ color: "var(--text-main)" }}
                          >
                            {doctor.fullName}
                          </h3>
                          <p
                            className="text-xs font-semibold mt-0.5"
                            style={{ color: "var(--accent-primary)" }}
                          >
                            {doctor.specialization}
                          </p>
                        </div>
                      </div>

                      <p
                        className="text-xs mb-4 line-clamp-3 text-justify leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {doctor.biography}
                      </p>

                      <div
                        className="space-y-2 text-xs mb-6 pt-3 border-t"
                        style={{
                          borderColor: "var(--border-light)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Building
                            size={14}
                            className="shrink-0"
                            style={{ color: "var(--accent-primary)" }}
                          />
                          <span className="truncate">{doctor.hospital}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={14}
                            className="shrink-0"
                            style={{ color: "var(--accent-primary)" }}
                          />
                          <span>{doctor.location || "New Delhi, India"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar
                            size={14}
                            className="shrink-0"
                            style={{ color: "var(--accent-primary)" }}
                          />
                          <span>{doctor.yearsOfExperience} Years Experience</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-between pt-4 border-t"
                      style={{ borderColor: "var(--border-light)" }}
                    >
                      <div>
                        <span
                          className="text-xs block"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Consultation Fee
                        </span>
                        <span
                          className="text-lg font-bold"
                          style={{ color: "var(--success)" }}
                        >
                          ₹{doctor.consultationFee}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedDoctorForBooking(doctor)}
                        className="px-5 py-2.5 rounded-sm text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
                        style={{
                          backgroundColor: "var(--accent-primary)",
                        }}
                      >
                        Request Appointment <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Show More / Show Less Button */}
              {doctors.length > 3 && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleToggleShowAll}
                    className="px-6 py-2.5 rounded-sm text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:opacity-80"
                    style={{
                    
                      color: "var(--text-main)",
                    }}
                  >
                    {showAll ? (
                      <>
                        Show Less <ChevronUp size={14} />
                      </>
                    ) : (
                      <>
                        Show All ({doctors.length - 3} More){" "}
                        <ChevronDown size={14} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Left-Side Drawer for Appointment Booking */}
      <AnimatePresence>
        {selectedDoctorForBooking && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDoctorForBooking(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[600px] h-full shadow-2xl z-10 flex flex-col border-r overflow-y-auto"
              style={{
                backgroundColor: "var(--modal-bg)",
                borderColor: "var(--border-light)",
                color: "var(--text-main)",
              }}
            >
              {/* Drawer Header */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-20 backdrop-blur-md"
                style={{
                  backgroundColor: "var(--modal-bg)",
                  borderColor: "var(--border-light)",
                }}
              >
                <div>
                  <h2
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    Appointment Request
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {selectedDoctorForBooking.fullName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDoctorForBooking(null)}
                  className="p-2 rounded-full border transition-colors cursor-pointer"
                  style={{
                    borderColor: "var(--border-light)",
                    backgroundColor: "var(--surface-hover)",
                    color: "var(--text-main)",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Content / Modal Form Injection */}
              <div className="flex-1">
                <AppointmentForm
                  doctor={selectedDoctorForBooking}
                  onClose={() => setSelectedDoctorForBooking(null)}
                  onSuccess={() => {
                    fetchDoctors();
                    setSelectedDoctorForBooking(null);
                  }}
                  embedded={true}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllDoctors;