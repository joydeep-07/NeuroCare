import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaCamera, FaSpinner } from "react-icons/fa";
import { updateUser } from "../../redux/authSlice";
import type { AppDispatch, RootState } from "../../redux/store";
import api from "../../api/axios";
import ENDPOINTS from "../../api/endPoints";

interface UploadAvatarProps {
  onUploadSuccess?: (updatedUser: any) => void;
  size?: string; // Tailwind size classes e.g. "w-20 h-20"
}

const UploadAvatar: React.FC<UploadAvatarProps> = ({
  onUploadSuccess,
  size = "w-20 h-20",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image must be 5 MB or smaller.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading(true);
      setErrorMsg(null);

      const response = await api.patch(ENDPOINTS.PROFILE.AVATAR, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        dispatch(updateUser(updatedUser));
        if (onUploadSuccess) {
          onUploadSuccess(updatedUser);
        }
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || "Unable to upload profile picture.",
      );
    } finally {
      setLoading(false);
      // Reset input value so same file can be re-selected if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const userAvatar =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.fullName || user?.name || user?.email || "User",
    )}&background=1a73e8&color=ffffff&size=256`;

  return (
    <div className="relative inline-block">
      <div
        className={`relative rounded-full overflow-hidden border-2 border-[var(--border-light)] bg-[var(--bg-secondary)] shadow-md ${size} group cursor-pointer`}
        onClick={() => fileInputRef.current?.click()}
      >
        <img
          src={userAvatar}
          alt={user?.fullName || "User Avatar"}
          className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-75"
        />

        {/* Overlay Spinner or Camera Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {loading ? (
            <FaSpinner className="animate-spin text-white text-lg" />
          ) : (
            <FaCamera className="text-white text-lg" />
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg, image/png, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {errorMsg && (
        <p className="mt-1 text-center text-xs text-[var(--danger)]">
          {errorMsg}
        </p>
      )}
    </div>
  );
};

export default UploadAvatar;
