import { useState, useEffect } from "react";
import { X, Stethoscope, AlertCircle } from "lucide-react";
import api from "../../api/axios";
import ENDPOINTS from "../../api/endPoints";

interface Doctor {
  _id: string;
  fullName: string;
  specialization: string;
  hospital: string;
  department: string;
  consultationFee: number;
  avatar?: string;
  availability?: Array<{ day: string; slots: string[] }>;
}

interface FamilyMember {
  _id: string;
  relationship: string;
  user?: {
    _id: string;
    fullName: string;
    email: string;
  };
}

interface Props {
  doctor: Doctor;
  onClose: () => void;
  onSuccess: () => void;
}

const BookAppointmentModal = ({ doctor, onClose, onSuccess }: Props) => {
  const [symptoms, setSymptoms] = useState("");
  const [reason, setReason] = useState("");
  const [requestedDate, setRequestedDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [preferredTime, setPreferredTime] = useState("");
  const [familyMemberId, setFamilyMemberId] = useState("");
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [reportTitle, setReportTitle] = useState("");
  const [reportUrl, setReportUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedDay = new Date(`${requestedDate}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" });
  const availableSlots = doctor.availability?.find((item) => item.day === selectedDay)?.slots || [];

  useEffect(() => {
    setPreferredTime(availableSlots[0] || "");
  }, [requestedDate, doctor._id]);

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const res = await api.get(ENDPOINTS.MEMBER.GET_ALL);
        if (res.data.success) {
          setFamilyMembers(res.data.members);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchFamily();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || !preferredTime) {
      setErrorMsg("Please describe your symptoms and select an available time slot.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const uploadedReports = reportUrl
        ? [{ title: reportTitle || "Attached Medical Record", fileUrl: reportUrl }]
        : [];

      const res = await api.post(ENDPOINTS.APPOINTMENT.BOOK, {
        doctorId: doctor._id,
        symptoms,
        reason,
        requestedDate,
        preferredTime,
        familyMemberId: familyMemberId || null,
        uploadedReports,
      });

      if (res.data.success) {
        alert("Appointment request submitted! Status: Pending Approval. Our Admin team will assign your exact appointment time slot.");
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to submit appointment request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-cyan-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <Stethoscope size={16} /> Request Appointment
            </div>
            <h2 className="text-xl font-bold font-heading">{doctor.fullName}</h2>
            <p className="text-sm text-cyan-100/90">{doctor.specialization} • {doctor.hospital}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-[var(--text-main)]">
            ℹ️ <strong>Admin-Managed Scheduling Workflow</strong>: Your request will be stored with status <strong>Pending Approval</strong>. Hospital Admin will confirm the exact time slot, consultation mode, and instructions.
          </div>

          {/* Book For Whom */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Appointment Patient (Self or Family Member)
            </label>
            <select
              value={familyMemberId}
              onChange={(e) => setFamilyMemberId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] text-sm font-medium outline-none focus:border-[var(--accent-primary)]"
            >
              <option value="">Myself (Account Holder)</option>
              {familyMembers.map((m) => (
                <option key={m._id} value={m.user?._id || m._id}>
                  Family Member: {m.user?.fullName || "Member"} ({m.relationship})
                </option>
              ))}
            </select>
          </div>

          {/* Symptoms Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Primary Symptoms / Medical Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Severe headache for 3 days, nausea, dizziness when standing up..."
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] text-sm outline-none focus:border-[var(--accent-primary)]"
              required
            />
          </div>

          {/* Preferred Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Preferred Date
            </label>
            <input
              type="date"
              value={requestedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setRequestedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] text-sm outline-none focus:border-[var(--accent-primary)]"
            />
            </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Available Time Slot <span className="text-red-500">*</span>
            </label>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              disabled={availableSlots.length === 0}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] text-sm outline-none focus:border-[var(--accent-primary)] disabled:opacity-60"
              required
            >
              {availableSlots.length === 0 ? (
                <option value="">No slots available on {selectedDay}</option>
              ) : (
                availableSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)
              )}
            </select>
          </div>

          {/* Medical Report Attachment (Optional) */}
          <div className="pt-2 border-t border-[var(--border-light)]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Attach Medical Report / Prescription (Optional Cloudinary Link)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Report Title (e.g. Brain MRI Scan)"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] text-xs outline-none"
              />
              <input
                type="text"
                placeholder="File URL (e.g. https://res.cloudinary.com/...)"
                value={reportUrl}
                onChange={(e) => setReportUrl(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] text-xs outline-none"
              />
            </div>
          </div>

          {/* Consultation Fee Note */}
          <div className="flex justify-between items-center p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-light)] text-sm">
            <span className="text-[var(--text-secondary)]">Consultation Fee:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">₹{doctor.consultationFee}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[var(--border-light)] text-[var(--text-main)] text-sm font-semibold hover:bg-[var(--bg-main)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? "Submitting Request..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
