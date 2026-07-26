import { useState, useEffect } from "react";
import { Calendar, Edit3 } from "lucide-react";
import api from "../../api/axios";
import ENDPOINTS from "../../api/endPoints";

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
  status: string;
  patient: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  doctor: {
    _id: string;
    fullName: string;
    specialization: string;
    hospital: string;
  };
  familyMember?: {
    fullName: string;
    relationship: string;
  };
}

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState("Pending Approval");
  const [loading, setLoading] = useState(true);

  // Scheduling Modal State
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [confirmedDate, setConfirmedDate] = useState("");
  const [confirmedTime, setConfirmedTime] = useState("10:00 AM");
  const [consultationMode, setConsultationMode] = useState<"In-Person" | "Video Consultation">("In-Person");
  const [adminInstructions, setAdminInstructions] = useState("");
  const [newStatus, setNewStatus] = useState("Confirmed");
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== "All") params.status = statusFilter;

      const res = await api.get(ENDPOINTS.ADMIN.APPOINTMENTS, { params });
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.log("Error fetching admin appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const handleOpenScheduleModal = (appt: Appointment) => {
    setSelectedAppt(appt);
    setConfirmedDate(
      appt.confirmedDate ||
      new Date(appt.requestedDate || Date.now()).toISOString().split("T")[0]
    );
    setConfirmedTime(appt.confirmedTime || "10:30 AM");
    setConsultationMode(appt.consultationMode || "In-Person");
    setAdminInstructions(appt.adminInstructions || "Please arrive 15 minutes early and bring recent medical reports.");
    setNewStatus("Confirmed");
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    try {
      setSubmitting(true);
      const res = await api.put(
        `${ENDPOINTS.ADMIN.APPOINTMENTS}/${selectedAppt._id}/schedule`,
        {
          confirmedDate,
          confirmedTime,
          consultationMode,
          adminInstructions,
          status: newStatus,
        }
      );

      if (res.data.success) {
        alert(`Appointment ${selectedAppt.appointmentId} has been successfully ${newStatus.toLowerCase()}! Notifications dispatched.`);
        setSelectedAppt(null);
        fetchAppointments();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to schedule appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 text-white shadow-2xl">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">
          <Calendar size={16} /> Admin Scheduling Workflow Queue
        </span>
        <h1 className="text-3xl font-bold font-heading">Appointment Queue Management</h1>
        <p className="text-xs text-amber-100/80 mt-1">
          Review patient appointment requests, check doctor availability, assign time slots, consultation modes, and issue admin instructions.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {["Pending Approval", "Confirmed", "Completed", "Cancelled", "All"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === tab
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border-light)] hover:text-[var(--text-main)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Schedule Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-light)]">
              <h3 className="text-lg font-bold font-heading text-[var(--text-main)]">
                Schedule & Confirm Appointment ({selectedAppt.appointmentId})
              </h3>
              <button onClick={() => setSelectedAppt(null)} className="text-[var(--text-secondary)]">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[var(--text-main)]">
              <strong>Patient</strong>: {selectedAppt.patient.fullName} | <strong>Doctor</strong>: Dr. {selectedAppt.doctor.fullName} ({selectedAppt.doctor.specialization})
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Confirmed Date *</label>
                  <input
                    type="date"
                    value={confirmedDate}
                    onChange={(e) => setConfirmedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Confirmed Time Slot *</label>
                  <select
                    value={confirmedTime}
                    onChange={(e) => setConfirmedTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Consultation Mode *</label>
                  <select
                    value={consultationMode}
                    onChange={(e) => setConsultationMode(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                  >
                    <option value="In-Person">In-Person Consultation</option>
                    <option value="Video Consultation">Video Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Target Status *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Admin Instructions / Preparation Notes for Patient</label>
                <textarea
                  rows={3}
                  value={adminInstructions}
                  onChange={(e) => setAdminInstructions(e.target.value)}
                  placeholder="e.g. Please arrive 15 minutes before the appointment time. Fasting for 8 hours required if blood tests needed."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[var(--border-light)]">
                <button
                  type="button"
                  onClick={() => setSelectedAppt(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-light)] text-[var(--text-main)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white font-semibold shadow-md hover:bg-amber-700"
                >
                  {submitting ? "Processing..." : "Confirm & Send Notifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] animate-pulse" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] text-xs text-[var(--text-secondary)]">
          No appointments matching filter "{statusFilter}".
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt._id}
              className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[var(--text-main)] font-heading">
                    {appt.patient.fullName} {appt.familyMember && `(Booking for: ${appt.familyMember.fullName})`}
                  </span>
                  <span className="text-[var(--text-secondary)] font-mono">({appt.appointmentId})</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
                    {appt.status}
                  </span>
                </div>

                <p className="text-[var(--text-secondary)]">
                  Doctor: <strong>Dr. {appt.doctor.fullName}</strong> ({appt.doctor.specialization}) • {appt.hospital}
                </p>
                <p className="text-[var(--text-main)]">
                  🩺 <strong>Symptoms</strong>: {appt.symptoms}
                </p>
                {appt.confirmedDate && (
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    📅 Schedule: {appt.confirmedDate} at {appt.confirmedTime} ({appt.consultationMode})
                  </p>
                )}
              </div>

              <button
                onClick={() => handleOpenScheduleModal(appt)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 shadow-md transition-all flex items-center gap-1.5 shrink-0"
              >
                <Edit3 size={14} /> Assign Time & Confirm
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
