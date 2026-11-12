import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { isAxiosError } from "axios";
import { Sparkles, RefreshCw } from "lucide-react";
import UserAvatar from "./UserAvatar";
import api from "../api/axios";
import ENDPOINTS from "../api/endPoints";
import { updateUser } from "../redux/authSlice";
import type { AppDispatch } from "../redux/store";

interface User {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  illness?: string;
  notes?: string;
  medicalHistory?: string[];
  doctorRecommendations?: string[];
  avatar?: string;
  family?: unknown;
}

const UserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [aiSummary, setAiSummary] = useState<any | null>(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const fetchAiSummary = useCallback(async () => {
    try {
      setLoadingAiSummary(true);
      const res = await api.get(ENDPOINTS.AI.PATIENT_SUMMARY);
      if (res.data.success) {
        setAiSummary(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch AI patient summary:", err);
    } finally {
      setLoadingAiSummary(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get(ENDPOINTS.PROFILE.GET);

      setUser(data.user);
    } catch (error: unknown) {
      console.error(isAxiosError(error) ? error.response?.data || error : error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchAiSummary();
  }, [fetchProfile, fetchAiSummary]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || uploading) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please select a JPG, JPEG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be 5 MB or smaller.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await api.patch(ENDPOINTS.PROFILE.AVATAR, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(data.user);
      dispatch(updateUser(data.user));
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      setUploadError(message || "Unable to upload profile picture. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <button
        onClick={fetchProfile}
        className="px-4 py-2 rounded bg-blue-600 text-white"
      >
        Refresh Profile
      </button>

      <h1 className="text-3xl font-bold">User Profile</h1>

      <section className="flex flex-col items-start gap-3 rounded-xl border border-[var(--border-light)] p-4 sm:flex-row sm:items-center">
        <UserAvatar
          src={user.avatar}
          alt={user.fullName || "Profile"}
          name={user.fullName || "User"}
          size="h-20 w-20"
          iconSize={32}
        />
        <div>
          <label className={`inline-flex cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white ${uploading ? "pointer-events-none opacity-50" : ""}`}>
            {uploading ? "Uploading..." : "Upload profile picture"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              onChange={handleAvatarUpload}
              disabled={uploading}
              className="sr-only"
            />
          </label>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">JPG, PNG, or WEBP. Maximum 5 MB.</p>
          {uploadError && <p role="alert" className="mt-1 text-xs text-red-500">{uploadError}</p>}
        </div>
      </section>

      {/* AI Health Profile & Clinical Insights Card */}
      <section className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 via-cyan-500/5 to-transparent p-6 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[var(--border-light)]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold font-heading text-[var(--text-main)]">
                AI Health Profile & Clinical Summary
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Synthesized dynamically from your MongoDB medical records, BMI, and consultation history
              </p>
            </div>
          </div>
          <button
            onClick={fetchAiSummary}
            disabled={loadingAiSummary}
            className="px-3 py-1.5 rounded-xl border border-[var(--border-light)] hover:bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 transition-all"
          >
            <RefreshCw size={13} className={loadingAiSummary ? "animate-spin" : ""} />
            {loadingAiSummary ? "Analyzing..." : "Refresh Insights"}
          </button>
        </div>

        {loadingAiSummary ? (
          <div className="py-6 text-center text-xs text-[var(--text-secondary)] space-y-2">
            <div className="w-6 h-6 mx-auto rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            <p>Evaluating medical history and chronic conditions with AI...</p>
          </div>
        ) : aiSummary ? (
          <div className="space-y-3 text-xs leading-relaxed text-[var(--text-main)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-light)] text-[11px]">
              <div>
                <span className="text-[var(--text-secondary)] block">BMI Calculation</span>
                <strong className="text-[var(--accent-primary)] font-semibold">{aiSummary.patient?.bmi || "N/A"}</strong>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block">Past Consultations</span>
                <strong className="text-[var(--text-main)]">{aiSummary.appointmentsCount || 0} visits</strong>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block">Stored Documents</span>
                <strong className="text-[var(--text-main)]">{aiSummary.documentsCount || 0} records</strong>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-light)] whitespace-pre-wrap font-sans text-xs">
              {aiSummary.summary}
            </div>
          </div>
        ) : (
          <p className="text-xs text-[var(--text-secondary)]">
            Click &quot;Refresh Insights&quot; to generate your personalized AI health analysis.
          </p>
        )}
      </section>

      <div>
        <strong>Full Name:</strong> {user.fullName}
      </div>
      <div>
        <strong>Email:</strong> {user.email}
      </div>
      <div>
        <strong>Phone:</strong> {user.phone}
      </div>
      <div>
        <strong>Relationship:</strong> {user.relationship}
      </div>
      <div>
        <strong>Gender:</strong> {user.gender}
      </div>
      <div>
        <strong>Date of Birth:</strong> {user.dateOfBirth}
      </div>
      <div>
        <strong>Blood Group:</strong> {user.bloodGroup}
      </div>
      <div>
        <strong>Height:</strong> {user.height} cm
      </div>
      <div>
        <strong>Weight:</strong> {user.weight} kg
      </div>
      <div>
        <strong>Current Problem:</strong> {user.illness}
      </div>
      <div>
        <strong>Notes:</strong> {user.notes}
      </div>

      <div>
        <strong>Medical History:</strong>
        <ul className="list-disc ml-6">
          {user.medicalHistory?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <strong>Doctor Recommendations:</strong>
        <ul className="list-disc ml-6">
          {user.doctorRecommendations?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <strong>Family:</strong>
        <pre>{JSON.stringify(user.family, null, 2)}</pre>
      </div>
    </div>
  );
};

export default UserData;
