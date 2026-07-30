import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  UserCheck,
  AlertCircle,
  FileText,
  CheckCircle2,
  XCircle,
  Ban,
  Stethoscope,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import ENDPOINTS from "../../api/endPoints";
import { Link } from "react-router-dom";
import { formatDate } from "../../hooks/useDate";

interface Appointment {
  _id: string;
  appointmentId: string;
  symptoms: string;
  reason?: string;
  hospital: string;
  department: string;
  requestedDate: string;
  confirmedDate?: string;
  confirmedTime?: string;
  consultationMode: "In-Person" | "Video Consultation";
  adminInstructions?: string;
  status:
    | "Requested"
    | "Pending Approval"
    | "Confirmed"
    | "Rescheduled"
    | "Checked In"
    | "In Consultation"
    | "Completed"
    | "Cancelled"
    | "Rejected"
    | "No Show";
  doctor: {
    _id: string;
    fullName: string;
    specialization: string;
    hospital: string;
    consultationFee: number;
    avatar?: string;
  };
  familyMember?: {
    fullName: string;
    relationship: string;
  };
  diagnosis?: string;
  prescription?: Array<{
    medicine: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
}

const statusBadgeStyles: Record<string, string> = {
  "Pending Approval":
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Requested:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Confirmed:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Rescheduled:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "Checked In":
    "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  "In Consultation":
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Completed:
    "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  Cancelled:
    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  Rejected:
    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  "No Show":
    "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.APPOINTMENT.GET_ALL);
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.log("Error loading appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to cancel this appointment request?",
      )
    )
      return;
    try {
      const res = await api.put(ENDPOINTS.APPOINTMENT.CANCEL(id));
      if (res.data.success) {
        alert("Appointment cancelled.");
        fetchAppointments();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel appointment.");
    }
  };

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="max-w-8xl mx-auto md:px-12 px-4 py-8 md:py-12 space-y-8">
      {/* Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-8 rounded-lg bg-[var(--card-bg)]/50 border border-[var(--border-light)]/50 shadow-lg">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)] mb-2">
            <Calendar size={16} /> Patient Consultation Queue
          </span>
          <h1 className="text-3xl font-bold font-heading text-[var(--text-main)]">
            My Appointments
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Track confirmed time slots, admin scheduling instructions, and
            digital prescriptions.
          </p>
        </div>

        <Link
          to="/doctors"
          className="px-6 py-3 rounded-sm bg-[var(--accent-primary)] text-white text-xs font-semibold shadow-md hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Stethoscope size={16} /> Request New Appointment
        </Link>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-lg bg-[var(--card-bg)]/50 border border-[var(--border-light)]/50 animate-pulse"
            />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-lg bg-[var(--card-bg)]/50 border border-[var(--border-light)]/50">
          <Calendar
            size={48}
            className="mx-auto text-[var(--text-secondary)] mb-4"
          />
          <h3 className="text-xl font-bold text-[var(--text-main)] font-heading">
            No Appointments Found
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 mb-6">
            You haven't requested any medical appointments yet.
          </p>
          <Link
            to="/doctors"
            className="px-6 py-3 rounded-sm bg-[var(--accent-primary)] text-white text-xs font-semibold"
          >
            Find a Doctor & Book Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => {
            const isOpen = openId === appt._id;
            return (
              <div
                key={appt._id}
                className="rounded-lg bg-[var(--card-bg)]/50 border border-[var(--border-light)]/50 shadow-sm transition-all overflow-hidden"
              >
                {/* Accordion Header (Always Visible: Doctor Data & Status) */}
                <div
                  onClick={() => toggleAccordion(appt._id)}
                  className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-[var(--card-bg)] transition-all"
                >
                  <div className="flex gap-4 items-center">
                    <img
                      src={appt.doctor.avatar}
                      alt={appt.doctor.fullName}
                      className="w-14 h-14 rounded-full object-top object-cover border border-[var(--border-light)]/50"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-[var(--text-main)] font-heading">
                          {appt.doctor.fullName}
                        </h3>
                        <span className="text-xs text-[var(--text-secondary)] font-mono">
                          ({appt.appointmentId})
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[var(--accent-primary)]">
                        {appt.doctor.specialization} • {appt.hospital}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <span
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                        statusBadgeStyles[appt.status] ||
                        "bg-gray-500/10 text-gray-600"
                      }`}
                    >
                      ● {appt.status}
                    </span>

                    {(appt.status === "Pending Approval" ||
                      appt.status === "Requested") && (
                      <button
                        onClick={(e) => handleCancel(e, appt._id)}
                        className="px-3.5 py-1.5 rounded-sm border border-red-500/30 text-red-500 text-xs font-semibold hover:bg-red-500/10 transition-all"
                      >
                        Cancel Request
                      </button>
                    )}

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <ChevronDown
                        size={18}
                        className="text-[var(--text-secondary)]"
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Accordion Content with Framer Motion Animation */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.04, 0.62, 0.23, 0.98],
                      }}
                    >
                      <div className="px-6 pb-6 md:px-8 md:pb-8 pt-2 border-t border-[var(--border-light)]/50 space-y-6">
                        {/* Middle Row: Schedule Details & Mode */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-4">
                          <div className="p-4 rounded-sm bg-[var(--bg-main)]/50 border border-[var(--border-light)]/50 space-y-1">
                            <span className="text-[var(--text-secondary)] block">
                              Confirmed Date & Time
                            </span>
                            <div className="flex items-center gap-2 text-[var(--text-main)] font-semibold">
                              <Calendar
                                size={14}
                                className="text-[var(--accent-primary)]"
                              />
                              <span>
                                {appt.confirmedDate
                                  ? `${formatDate(appt.confirmedDate)} at ${
                                      appt.confirmedTime
                                    }`
                                  : "Pending Admin Assignment"}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 rounded-sm bg-[var(--bg-main)]/50 border border-[var(--border-light)]/50 space-y-1">
                            <span className="text-[var(--text-secondary)] block">
                              Consultation Mode
                            </span>
                            <div className="flex items-center gap-2 text-[var(--text-main)] font-semibold">
                              {appt.consultationMode ===
                              "Video Consultation" ? (
                                <Video size={14} className="text-cyan-500" />
                              ) : (
                                <MapPin
                                  size={14}
                                  className="text-emerald-500"
                                />
                              )}
                              <span>{appt.consultationMode}</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-sm bg-[var(--bg-main)]/50 border border-[var(--border-light)]/50 space-y-1">
                            <span className="text-[var(--text-secondary)] block">
                              Patient
                            </span>
                            <div className="flex items-center gap-2 text-[var(--text-main)] font-semibold">
                              <UserCheck
                                size={14}
                                className="text-[var(--accent-primary)]"
                              />
                              <span>
                                {appt.familyMember
                                  ? `Family Member: ${appt.familyMember.fullName} (${appt.familyMember.relationship})`
                                  : "Self"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Symptoms & Reason */}
                        <div className="text-xs space-y-1">
                          <span className="text-[var(--text-secondary)] font-semibold uppercase tracking-wider block">
                            Reported Symptoms:
                          </span>
                          <p className="text-[var(--text-main)] bg-[var(--bg-main)]/50 p-3 rounded-sm border border-[var(--border-light)]/50">
                            {appt.symptoms}
                          </p>
                        </div>

                        {/* Admin Instructions (if assigned) */}
                        {appt.adminInstructions && (
                          <div className="p-4 rounded-sm bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                            <span className="font-bold flex items-center gap-1.5">
                              <AlertCircle size={14} /> Hospital Admin
                              Instructions:
                            </span>
                            <p>{appt.adminInstructions}</p>
                          </div>
                        )}

                        {/* Doctor Diagnosis & Prescription (if completed) */}
                        {appt.status === "Completed" && (
                          <div className="p-5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 space-y-3 text-xs">
                            <h4 className="font-bold text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
                              <CheckCircle2 size={16} /> Consultation Completed
                            </h4>
                            {appt.diagnosis && (
                              <div>
                                <span className="font-semibold text-[var(--text-secondary)]">
                                  Clinical Diagnosis:
                                </span>
                                <p className="text-[var(--text-main)] font-medium mt-0.5">
                                  {appt.diagnosis}
                                </p>
                              </div>
                            )}
                            {appt.prescription &&
                              appt.prescription.length > 0 && (
                                <div>
                                  <span className="font-semibold text-[var(--text-secondary)]">
                                    Prescribed Medicines:
                                  </span>
                                  <ul className="mt-1 space-y-1">
                                    {appt.prescription.map((p, idx) => (
                                      <li
                                        key={idx}
                                        className="bg-[var(--card-bg)]/50 p-2 rounded-sm border border-emerald-500/20 text-[var(--text-main)] font-mono"
                                      >
                                        💊 <strong>{p.medicine}</strong> -{" "}
                                        {p.dosage} ({p.frequency}) for{" "}
                                        {p.duration}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
