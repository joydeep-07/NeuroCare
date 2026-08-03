import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { isAxiosError } from "axios";
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
  const dispatch = useDispatch<AppDispatch>();

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
    // The request is intentionally initiated when this profile view mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

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
        {user.avatar ? (
          <img src={user.avatar} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-main)] text-xs text-[var(--text-secondary)]">No photo</div>
        )}
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
