import { useState, useEffect } from "react";
import { ShieldCheck, Calendar, AlertCircle, UserPlus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import ENDPOINTS from "../../api/endPoints";

interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  pendingRequests: number;
  completedConsultations: number;
  confirmedAppointments: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingRequests: 0,
    completedConsultations: 0,
    confirmedAppointments: 0,
  });
  const [recentAppts, setRecentAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.ADMIN.DASHBOARD);
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentAppts(res.data.recentAppointments);
      }
    } catch (err) {
      console.log("Error loading admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">
              <ShieldCheck size={16} /> Central Hospital Administration
            </span>
            <h1 className="text-3xl font-bold font-heading">NeuroCare Platform Control</h1>
            <p className="text-xs text-amber-100/80 mt-1">
              Oversee doctor registrations, hospital scheduling workflows, user management, and platform clinical metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/add-doctor"
              className="px-5 py-2.5 rounded-2xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 shadow-md transition-all flex items-center gap-1.5"
            >
              <UserPlus size={16} /> Add Doctor Account
            </Link>
            <Link
              to="/admin/appointments"
              className="px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-white text-xs font-semibold border border-white/20 hover:bg-white/20 transition-all flex items-center gap-1.5"
            >
              <Calendar size={16} /> Schedule Queue ({stats.pendingRequests})
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-xs">
          <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">Total Patients</span>
          <span className="text-2xl font-bold text-[var(--text-main)] font-heading mt-1 block">{stats.totalPatients}</span>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-xs">
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Active Doctors</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-heading mt-1 block">{stats.totalDoctors}</span>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-xs">
          <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">Total Appointments</span>
          <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-heading mt-1 block">{stats.totalAppointments}</span>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-xs">
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Pending Approval</span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-heading mt-1 block">{stats.pendingRequests}</span>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-xs">
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Confirmed Schedule</span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-heading mt-1 block">{stats.confirmedAppointments}</span>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-xs">
          <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">Completed</span>
          <span className="text-2xl font-bold text-teal-600 dark:text-teal-400 font-heading mt-1 block">{stats.completedConsultations}</span>
        </div>
      </div>

      {/* Quick Action Queue Banner */}
      {stats.pendingRequests > 0 && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-amber-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Action Required: {stats.pendingRequests} Appointment Requests Pending</h4>
              <p className="text-xs opacity-90">Assign doctor time slots, consultation modes, and admin instructions to confirm.</p>
            </div>
          </div>
          <Link
            to="/admin/appointments"
            className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-all shrink-0 flex items-center gap-1"
          >
            Manage Queue <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Recent Platform Appointments */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold font-heading text-[var(--text-main)]">Recent Appointment Stream</h2>
          <Link to="/admin/appointments" className="text-xs text-[var(--accent-primary)] font-semibold hover:underline">
            View All Appointments →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-light)] animate-pulse" />
            ))}
          </div>
        ) : recentAppts.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] text-xs text-[var(--text-secondary)]">
            No appointments recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {recentAppts.map((appt) => (
              <div
                key={appt._id}
                className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-light)] flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--text-main)] font-heading">
                      Patient: {appt.patient?.fullName || "Patient"}
                    </span>
                    <span className="text-[var(--text-secondary)] font-mono">({appt.appointmentId})</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-300 font-semibold text-[10px]">
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] mt-0.5">
                    Doctor: Dr. {appt.doctor?.fullName || "Doctor"} ({appt.doctor?.specialization}) • {appt.hospital}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[var(--text-secondary)] block">Requested: {new Date(appt.createdAt).toLocaleDateString()}</span>
                  <span className="font-semibold text-[var(--text-main)]">
                    {appt.confirmedDate ? `${appt.confirmedDate} at ${appt.confirmedTime}` : "Pending Slot"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
