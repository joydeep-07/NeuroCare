// LeaveReview.tsx
import React, { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ENDPOINTS } from "../../api/endPoints";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import axios from "axios";

interface LeaveReviewProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reviewData?: {
    _id: string;
    rating: number;
    comment: string;
  } | null;
}

export const LeaveReview: React.FC<LeaveReviewProps> = ({
  isOpen,
  onClose,
  onSuccess,
  reviewData = null,
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(reviewData);

  useEffect(() => {
    if (reviewData) {
      setRating(reviewData.rating || 5);
      setReview(reviewData.comment || "");
    } else {
      setRating(5);
      setReview("");
    }
    setError("");
  }, [reviewData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim() || !rating) return;

    try {
      setLoading(true);
      setError("");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      };

      if (isEditing && reviewData) {
        await axios.put(
          ENDPOINTS.REVIEW.UPDATE(reviewData._id),
          {
            rating,
            comment: review,
          },
          config,
        );
      } else {
        await axios.post(
          ENDPOINTS.REVIEW.CREATE,
          {
            rating,
            comment: review,
          },
          config,
        );
      }

      setReview("");
      setRating(5);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (isEditing ? "Failed to update review." : "Failed to submit review."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Slide-over Panel from Left */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 left-0 max-w-full flex pr-10"
          >
            <div className="w-screen max-w-md bg-[var(--bg-secondary)] border-r border-[var(--border-light)] shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-6 border-b border-[var(--border-light)]">
                <h2 className="text-xl font-light text-[var(--text-main)]">
                  {isEditing ? "Edit Your " : "Leave a "}
                  <span className="text-[var(--accent-primary)] font-normal">
                    Review
                  </span>
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-[var(--border-light)]/20 text-[var(--text-main)] transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-500 font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {/* Rating Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-[var(--text-secondary)]">
                      Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star
                            size={24}
                            className={`${
                              (hoverRating || rating) >= star
                                ? "text-[var(--accent-primary)] fill-[var(--accent-primary)]"
                                : "text-[var(--border-light)]"
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text Area */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-[var(--text-secondary)]">
                      Your Review
                    </label>
                    <textarea
                      rows={6}
                      required
                      placeholder="Share your experience..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="w-full rounded-xl bg-[var(--bg-main)] border border-[var(--border-light)] p-4 text-sm text-[var(--text-main)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[var(--accent-primary)] text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-lg shadow-[var(--accent-primary)]/20"
                  >
                    {loading
                      ? isEditing
                        ? "Updating..."
                        : "Submitting..."
                      : isEditing
                        ? "Update Review"
                        : "Submit Review"}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
