import { useState, useEffect } from "react";
import { Stethoscope, Plus, Pill, Eye, Sparkles, Copy, CheckCircle2 } from "lucide-react";
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

interface MedicalRecord {
  _id: string;
  title: string;
  documentType: string;
  description?: string;
  fileUrl: string;
  fileType?: string;
  createdAt: string;
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
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // Consultation Completion Form Modal
  const [selectedApptForConsultation, setSelectedApptForConsultation] = useState<Appointment | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [medicines, setMedicines] = useState<Array<{ medicine: string; dosage: string; frequency: string; duration: string }>>([
    { medicine: "", dosage: "", frequency: "Once daily", duration: "5 days" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  // AI Clinical Overview Modal State
  const [selectedApptForAI, setSelectedApptForAI] = useState<Appointment | null>(null);
  const [clinicalOverviewData, setClinicalOverviewData] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);

  const openClinicalOverview = async (appointment: Appointment) => {
    setSelectedApptForAI(appointment);
    setClinicalOverviewData(null);
    setAiLoading(true);
    try {
      const res = await api.get(ENDPOINTS.AI.CLINICAL_OVERVIEW(appointment._id));
      if (res.data.success) {
        setClinicalOverviewData(res.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to generate AI clinical overview.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAIToConsultation = (overviewText: string) => {
    let summary = overviewText;
    const matchF = overviewText.match(/### Section F: Consultation Summary[\s\S]*?(?=(?:###|$))/i);
    if (matchF) {
      summary = matchF[0].replace(/### Section F: Consultation Summary/i, "").trim();
    }
    setDoctorNotes((prev) => (prev ? `${prev}\n\n[AI Clinical Summary]:\n${summary}` : `[AI Clinical Summary]:\n${summary}`));
    if (!diagnosis && selectedApptForAI?.symptoms) {
      setDiagnosis(`Clinical Evaluation: ${selectedApptForAI.symptoms.slice(0, 80)}`);
    }
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
    setSelectedApptForConsultation(selectedApptForAI);
    setSelectedApptForAI(null);
  };

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

  const openMedicalRecord = async (appointment: Appointment) => {
    setSelectedApptForReview(appointment);
    setMedicalRecords([]);
    setRecordsLoading(true);
    try {
      const res = await api.get(ENDPOINTS.DOCTOR.APPOINTMENT_RECORDS(appointment._id));
      if (res.data.success) setMedicalRecords(res.data.documents);
    } finally {
      setRecordsLoading(false);
    }
  };

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

                  <div className="space-y-2">
                    <span className="font-bold text-[var(--text-secondary)] block">Uploaded Medical Records:</span>
                    {recordsLoading ? <p className="text-[var(--text-secondary)]">Loading records…</p> : medicalRecords.length === 0 ? <p className="text-[var(--text-secondary)]">No uploaded records for this patient.</p> : (
                      <div className="space-y-2">
                        {medicalRecords.map((record) => (
                          <div key={record._id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-light)]">
                            <div><p className="font-semibold text-[var(--text-main)]">{record.title}</p><p className="text-[var(--text-secondary)]">{record.documentType} · {new Date(record.createdAt).toLocaleDateString("en-IN")}</p></div>
                            <a href={record.fileUrl} target="_blank" rel="noreferrer" download className="text-[var(--accent-primary)] font-semibold">Preview / Download</a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="pt-3 border-t border-[var(--border-light)] flex justify-between items-center">
              <button
                onClick={() => {
                  const targetAppt = selectedApptForReview;
                  setSelectedApptForReview(null);
                  openClinicalOverview(targetAppt);
                }}
                className="px-4 py-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-500/20 transition-all"
              >
                <Sparkles size={14} /> Generate AI Clinical Overview
              </button>
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

      {/* AI Clinical Assistant Modal */}
      {selectedApptForAI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)] shadow-2xl p-6 md:p-8 space-y-4 max-h-[88vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-start pb-4 border-b border-[var(--border-light)]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Sparkles size={16} />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    NeuroCare Clinical Decision Support
                  </span>
                </div>
                <h3 className="text-xl font-bold font-heading text-[var(--text-main)]">
                  AI Clinical Overview – {selectedApptForAI.patient.fullName}
                </h3>
                <p className="text-[var(--text-secondary)] mt-0.5">
                  Appt #{selectedApptForAI.appointmentId} · Symptoms: &quot;{selectedApptForAI.symptoms}&quot;
                </p>
              </div>
              <button
                onClick={() => setSelectedApptForAI(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-main)] p-1 text-base font-bold"
              >
                ✕
              </button>
            </div>

            {aiLoading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                <p className="text-sm font-semibold text-[var(--text-main)]">
                  Synthesizing patient health history, reported symptoms, and medical reports...
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Grounding in real database records and previous NeuroCare consultations.
                </p>
              </div>
            ) : clinicalOverviewData ? (
              <div className="space-y-4">
                {/* Clinical Disclaimer Notice */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed">
                  <strong>⚠️ Clinical Decision Support Notice:</strong> This AI overview assists qualified doctors by structuring available patient history and highlighting patterns. All diagnostic evaluations, prescriptions, and therapeutic plans remain strictly under your clinical judgment.
                </div>

                {/* Patient Quick Vitals Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-light)] text-[11px]">
                  <div>
                    <span className="text-[var(--text-secondary)] block">Patient</span>
                    <strong className="text-[var(--text-main)]">{clinicalOverviewData.patientName}</strong>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)] block">Age / Gender</span>
                    <strong className="text-[var(--text-main)]">{clinicalOverviewData.age || "N/A"} · {clinicalOverviewData.gender || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)] block">Blood Group / BMI</span>
                    <strong className="text-rose-500">{clinicalOverviewData.bloodGroup || "N/A"}</strong> · {typeof clinicalOverviewData.bmi === "object" ? clinicalOverviewData.bmi.value : clinicalOverviewData.bmi || "N/A"}
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)] block">Uploaded Records</span>
                    <strong className="text-[var(--accent-primary)]">{clinicalOverviewData.documentsCount} documents</strong>
                  </div>
                </div>

                {/* AI Markdown Content */}
                <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-light)] text-xs leading-relaxed text-[var(--text-main)] space-y-3 whitespace-pre-wrap font-sans">
                  {clinicalOverviewData.clinicalOverview}
                </div>

                {/* Action Toolbar */}
                <div className="pt-3 border-t border-[var(--border-light)] flex flex-col sm:flex-row justify-between items-center gap-3">
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    Generated: {new Date(clinicalOverviewData.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleApplyAIToConsultation(clinicalOverviewData.clinicalOverview)}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      {copiedNote ? (
                        <>
                          <CheckCircle2 size={15} /> Transferred to Notes!
                        </>
                      ) : (
                        <>
                          <Copy size={15} /> Use in Consultation Notes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedApptForAI(null)}
                      className="px-4 py-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-light)] text-[var(--text-main)] font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
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

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => openClinicalOverview(appt)}
                    className="px-3.5 py-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-500/20 transition-all shadow-xs"
                    title="Generate AI Clinical Overview"
                  >
                    <Sparkles size={14} /> AI Clinical Overview
                  </button>

                  <button
                    onClick={() => openMedicalRecord(appt)}
                    className="px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-light)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 hover:bg-[var(--bg-secondary)]"
                  >
                    <Eye size={14} /> View Records
                  </button>

                  {appt.status !== "Completed" && (
                    <button
                      onClick={() => {
                        setSelectedApptForConsultation(appt);
                        setDiagnosis(appt.diagnosis || "");
                        setDoctorNotes(appt.doctorNotes || "");
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-700 shadow-md"
                    >
                      <Pill size={14} /> Complete Consultation
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
