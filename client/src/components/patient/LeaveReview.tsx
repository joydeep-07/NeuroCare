// LeaveReview.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, X, User as UserIcon } from "lucide-react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store"; // Adjust the path if needed

interface LeaveReviewProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewData: {
    name: string;
    role: string;
    review: string;
    image_url: string;
  }) => void;
}

export const LeaveReview: React.FC<LeaveReviewProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  // Extract user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    review: "",
    image_url: "",
  });

  // Sync user details into formData when the modal opens or user updates
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || user.name || "",
        role: user.role || "Patient", // Adjust based on your user schema fields
        image_url: user.avatar || "",
      }));
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.review) return;

    onSubmit(formData);
    // Keep user's name/avatar intact, just clear the review
    setFormData((prev) => ({ ...prev, review: "" }));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with smooth fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={onClose}
            className="absolute inset-0 bg-black"
          />

          {/* Sliding Panel with butter-smooth spring physics */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="absolute top-0 left-0 h-full w-full max-w-md bg-[var(--bg-secondary)] border-r border-[var(--border-light)] shadow-2xl flex flex-col p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-normal font-heading text-[var(--text-main)] flex items-center gap-2">
                <Stethoscope
                  size={18}
                  className="text-[var(--accent-primary)]"
                />
                Leave Your Review
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[var(--border-light)]/20 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Info Header */}
            <div className="flex items-center gap-4 py-6 border-b border-[var(--border-light)]/30 mb-4">
              <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden border-2 border-[var(--border-light)] bg-[var(--card-bg)] flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon
                    size={24}
                    className="text-[var(--text-secondary)]"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-[var(--text-main)] font-heading text-lg font-normal truncate">
                  {user?.fullName || user?.name || "User"}
                </h1>
                <p className="text-xs text-[var(--text-secondary)] truncate">
                  {user?.email || "No email available"}
                </p>
              </div>
            </div>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <TextField
                label="Your Review"
                variant="outlined"
                multiline
                rows={4}
                required
                fullWidth
                value={formData.review}
                onChange={(e) =>
                  setFormData({ ...formData, review: e.target.value })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "var(--text-main)",
                    "& fieldset": { borderColor: "var(--border-light)" },
                    "&:hover fieldset": {
                      borderColor: "var(--accent-primary)",
                    },
                  },
                  "& .MuiInputLabel-root": { color: "var(--text-secondary)" },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "var(--accent-primary)",
                  color: "#fff",
                  py: 1.5,
                  fontWeight: "bold",
                  "&:hover": {
                    opacity: 0.9,
                  },
                }}
              >
                Submit Review
              </Button>
            </Box>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
