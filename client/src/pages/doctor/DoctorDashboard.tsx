import { useState, useEffect } from "react";
import { Stethoscope, Plus, Pill, Eye } from "lucide-react";
import api from "../../api/axios";
import ENDPOINTS from "../../api/endPoints";

interface Appointment {
  _id: string;
  appointmentId: string;
  symptoms: string;
  reason?: string;
  hospital: string;
  department: string;
  confirmedDate?: string;
  confirmedTime?: string;
  consultationMode: "In-Person" | "Video Consultation";
  status: string;
  patient: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    gender: string;
    dateOfBirth: string;
    bloodGroup: string;
    height: number;
    weight: number;
    illness: string;
    medicalHistory?: string[];
    avatar?: string;
  };
  familyMember?: {
    fullName: string;
    relationship: string;
    gender: string;
    dateOfBirth: string;
    bloodGroup: string;
    illness: string;
    medicalHistory?: string[];
  };
  diagnosis?: string;
  prescription?: Array<{ medicine: string; dosage: string; frequency: string; duration: string }>;
  doctorNotes?: string;
  followUpDate?: string;
}

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState<{
    stats: { totalAppointments: number; confirmedCount: number; completedCount: number; pendingCount: number };
    appointments: Appointment[];
  }>({
    stats: { totalAppointments: 0, confirmedCount: 0, completedCount: 0, pendingCount: 0 },
    appointments: [],
  });
  const [loading, setLoading] = useState(true);

  // Selected Patient History Review Modal
  const [selectedApptForReview, setSelectedApptForReview] = useState<Appointment | null>(null);

  // Consultation Completion Form Modal
  const [selectedApptForConsultation, setSelectedApptForConsultation] = useState<Appointment | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [medicines, setMedicines] = useState<Array<{ medicine: string; dosage: string; frequency: string; duration: string }>>([
    { medicine: "", dosage: "", frequency: "Once daily", duration: "5 days" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboard = async () => {
   try {
     setLoading(true);

     const res = await api.get(
       ENDPOINTS.DOCTOR.GET_ALL.replace(
         "/doctors",
         "/doctors/portal/dashboard",
       ),
     );

     if (res.data.success) {
       setDashboardData({
         stats: res.data.stats,
         appointments: res.data.appointments,
       });
     }
   } catch (err) {
     console.log("Error loading doctor dashboard:", err);
   } finally {
     setLoading(false);
   }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAddMedicineRow = () => {
    setMedicines((prev) => [...prev, { medicine: "", dosage: "", frequency: "Twice daily", duration: "7 days" }]);
  };

  const handleMedicineChange = (index: number, field: string, value: string) => {
    setMedicines((prev) => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      return updated;
    });
  };

  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApptForConsultation) return;

    try {
      setSubmitting(true);
      const res = await api.put(
        ENDPOINTS.DOCTOR.GET_ALL.replace('/doctors', `/doctors/portal/consultation/${selectedApptForConsultation._id}`),
        {
          diagnosis,
          prescription: medicines.filter((m) => m.medicine.trim() !== ""),
          doctorNotes,
          followUpDate,
        }
      );

      if (res.data.success) {
        alert("Consultation record completed successfully.");
        setSelectedApptForConsultation(null);
        fetchDashboard();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to complete consultation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-950 text-white shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-start md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-2">
              <Stethoscope size={16} /> Doctor Portal Workspace
            </span>
            <h1 className="text-3xl font-bold font-heading">Consultation Dashboard</h1>
            <p className="text-xs text-emerald-100/80 mt-1">
              Review assigned patient medical records, symptoms, family info, and complete digital prescriptions.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-sm">
          <span className="text-xs font-semibold text-[var(--text-secondary)] block">Total Consultations</span>
          <span className="text-3xl font-bold text-[var(--text-main)] font-heading mt-1 block">
            {dashboardData.stats.totalAppointments}
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">Confirmed Queue</span>
          <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-heading mt-1 block">
            {dashboardData.stats.confirmedCount}
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-sm">
          <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 block">Completed</span>
          <span className="text-3xl font-bold text-teal-600 dark:text-teal-400 font-heading mt-1 block">
            {dashboardData.stats.completedCount}
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-sm">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block">Pending Admin</span>
          <span className="text-3xl font-bold text-amber-600 dark:text-amber-400 font-heading mt-1 block">
            {dashboardData.stats.pendingCount}
          </span>
        </div>
      </div>

      {/* Patient History Review Modal */}
      {selectedApptForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)] shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-light)]">
              <h3 className="text-lg font-bold font-heading text-[var(--text-main)]">
                Patient Clinical Profile & History
              </h3>
              <button onClick={() => setSelectedApptForReview(null)} className="text-[var(--text-secondary)]">✕</button>
            </div>

            {/* Target Patient Info */}
            {(() => {
              const target = selectedApptForReview.familyMember || selectedApptForReview.patient;
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-light)]">
                    <img
                      src={selectedApptForReview.patient.avatar || "https://ui-avatars.com/api/?name=Patient"}
                      alt=""
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                    <div>
                      <h4 className="text-base font-bold text-[var(--text-main)] font-heading">
                        {target.fullName} {selectedApptForReview.familyMember && `(${selectedApptForReview.familyMember.relationship})`}
                      </h4>
                      <p className="text-[var(--text-secondary)]">{selectedApptForReview.patient.email} • {selectedApptForReview.patient.phone}</p>
                      <p className="text-[var(--text-secondary)] font-semibold mt-0.5">
                        Blood Group: <span className="text-rose-500">{target.bloodGroup || "N/A"}</span> | Gender: {target.gender || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-[var(--text-secondary)] block uppercase tracking-wider">Reported Symptoms for Consultation:</span>
                    <p className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 font-medium">
                      {selectedApptForReview.symptoms}
                    </p>
                  </div>

                  {target.illness && (
                    <div className="space-y-1">
                      <span className="font-bold text-[var(--text-secondary)] block">Known Chronic Illnesses:</span>
                      <p className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-light)]">
                        {target.illness}
                      </p>
                    </div>
                  )}

                  {target.medicalHistory && target.medicalHistory.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-bold text-[var(--text-secondary)] block">Medical History:</span>
                      <ul className="list-disc pl-5 space-y-1 text-[var(--text-main)]">
                        {target.medicalHistory.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="pt-3 border-t border-[var(--border-light)] flex justify-end">
              <button
                onClick={() => setSelectedApptForReview(null)}
                className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-semibold"
              >
                Close Medical File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Consultation Modal */}
      {selectedApptForConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-light)]">
              <h3 className="text-lg font-bold font-heading text-[var(--text-main)]">
                Complete Consultation - {selectedApptForConsultation.patient.fullName}
              </h3>
              <button onClick={() => setSelectedApptForConsultation(null)} className="text-[var(--text-secondary)]">✕</button>
            </div>

            <form onSubmit={handleCompleteConsultation} className="space-y-4">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  placeholder="e.g. Acute Migraine Episode with Vestibular Dysfunction"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] font-medium"
                  required
                />
              </div>

              {/* Medicines Builder */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-semibold text-[var(--text-secondary)]">Digital Prescription / Medications</label>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="text-[var(--accent-primary)] font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus size={14} /> Add Medicine
                  </button>
                </div>

                <div className="space-y-2">
                  {medicines.map((med, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-light)]">
                      <input
                        type="text"
                        placeholder="Medicine (e.g. Sumatriptan)"
                        value={med.medicine}
                        onChange={(e) => handleMedicineChange(idx, "medicine", e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] text-[var(--text-main)]"
                      />
                      <input
                        type="text"
                        placeholder="Dosage (50mg)"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(idx, "dosage", e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] text-[var(--text-main)]"
                      />
                      <input
                        type="text"
                        placeholder="Frequency (Twice daily)"
                        value={med.frequency}
                        onChange={(e) => handleMedicineChange(idx, "frequency", e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] text-[var(--text-main)]"
                      />
                      <input
                        type="text"
                        placeholder="Duration (5 days)"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(idx, "duration", e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] text-[var(--text-main)]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Doctor Advice / Clinical Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Advised 8 hours sleep, hydration, avoid screen time 1 hour before sleep..."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Follow-up Date (Optional)</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[var(--border-light)]">
                <button
                  type="button"
                  onClick={() => setSelectedApptForConsultation(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-light)] text-[var(--text-main)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-md hover:bg-emerald-700"
                >
                  {submitting ? "Saving..." : "Complete & Issue Digital Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-[var(--text-main)]">Assigned Patient Appointments</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] animate-pulse" />
            ))}
          </div>
        ) : dashboardData.appointments.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] text-xs text-[var(--text-secondary)]">
            No patient appointments assigned yet.
          </div>
        ) : (
          <div className="space-y-4">
            {dashboardData.appointments.map((appt) => (
              <div
                key={appt._id}
                className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--text-main)] font-heading">
                      {appt.familyMember ? appt.familyMember.fullName : appt.patient.fullName}
                    </span>
                    <span className="text-[var(--text-secondary)] font-mono">({appt.appointmentId})</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                      {appt.status}
                    </span>
                  </div>

                  <p className="text-[var(--text-secondary)]">
                    📅 Schedule: <strong>{appt.confirmedDate || "Pending Date"}</strong> at <strong>{appt.confirmedTime || "Pending Time"}</strong> ({appt.consultationMode})
                  </p>
                  <p className="text-[var(--text-main)] font-medium">
                    🩺 <strong>Symptoms</strong>: {appt.symptoms}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedApptForReview(appt)}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-light)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 hover:bg-[var(--bg-secondary)]"
                  >
                    <Eye size={14} /> View Medical Record
                  </button>

                  {appt.status !== "Completed" && (
                    <button
                      onClick={() => {
                        setSelectedApptForConsultation(appt);
                        setDiagnosis(appt.diagnosis || "");
                        setDoctorNotes(appt.doctorNotes || "");
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-700 shadow-md"
                    >
                      <Pill size={14} /> Start / Complete Consultation
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
