// Reviews.tsx
import React, { useEffect, useState, useRef } from "react";
import { Stethoscope, User, Edit3, Trash2 } from "lucide-react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import { LeaveReview } from "./LeaveReview";
import { ENDPOINTS } from "../../api/endPoints";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import axios from "axios";
import Rating from "@mui/material/Rating";

const SLIDE_DURATION = 10000;
const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -400,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -400 : 300,
    opacity: 0,
  }),
};

const Reviews = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [[index, direction], setIndex] = useState([0, 1]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);

  // Side Panel state for adding & editing reviews
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);

  const holdTimeoutRef = useRef<any>(null);
  const isHoldingRef = useRef(false);

  // Fetch reviews from backend
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ENDPOINTS.REVIEW.GET_ALL);
      if (response.data && response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Auto slide
  useEffect(() => {
    if (isPaused || reviews.length === 0 || isPanelOpen) return;

    const interval = setInterval(() => {
      setIndex(([prev]) => [(prev + 1) % reviews.length, 1]);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [isPaused, reviews, isPanelOpen]);

  const swipeConfidenceThreshold = 100;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const toggleReadMore = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setIsPaused(false);
    } else {
      setExpandedId(id);
      setIsPaused(true);
    }
  };

  const handleDoubleClick = () => {
    holdTimeoutRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      setIsPaused(true);
    }, 120);
  };

  const handleHoldRelease = () => {
    clearTimeout(holdTimeoutRef.current);
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      setIsPaused(false);
    }
  };

  // Delete review handler with Auth Token
  const handleDelete = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(ENDPOINTS.REVIEW.DELETE(reviewId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete review.");
    }
  };

  // Open Panel for Creating
  const handleOpenCreate = () => {
    setEditingReview(null);
    setIsPanelOpen(true);
  };

  // Open Panel for Editing
  const handleOpenEdit = (rev: any) => {
    setEditingReview(rev);
    setIsPanelOpen(true);
    setIsPaused(true);
  };

  const totalSlides = reviews.length;
  const currentSlide = totalSlides > 0 ? index + 1 : 0;

  const item = reviews[index] || {};
  const words = item.comment ? item.comment.split(" ") : [];
  const shortText = words.slice(0, 40).join(" ");
  const isExpanded = expandedId === item._id;

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  // Check if logged-in user owns the current displayed review
  const isOwner =
    user && item.user && (item.user === user._id || item.user._id === user._id);

  return (
    <div className="relative py-8 md:py-12 lg:py-16 bg-[var(--bg-main)] flex justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* LEFT */}
        <div className="w-full lg:w-1/3 px-2 sm:px-4">
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            style={{
              color: "var(--accent-primary)",
            }}
          >
            <Stethoscope size={14} /> Patient's Reviews
          </span>

          <h1
            className="text-2xl md:text-5xl font-light mb-4 leading-tight"
            style={{ color: "var(--text-main)" }}
          >
            What People choose{" "}
            <span className="text-(--accent-primary)">Neuro</span>Care ?
          </h1>

          <p className="text-xs opacity-80 max-w-sm mb-6 lg:mb-0">
            I've worked with some amazing people over the years here's what they
            have to say about me.
          </p>

          <div className="hidden md:flex mt-5">
            <button
              onClick={handleOpenCreate}
              className="px-6 py-3 border border-[var(--border-light)] rounded-full text-xs font-medium hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
            >
              Leave a Review
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-2/3 px-2 sm:px-4 overflow-hidden">
          {loading ? (
            <div className="h-64 sm:h-72 md:h-80 flex items-center justify-center border border-[var(--border-light)] bg-[var(--bg-secondary)] rounded-xl animate-pulse">
              <p className="text-sm opacity-70">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="h-64 sm:h-72 md:h-80 flex items-center justify-center border border-[var(--border-light)] bg-[var(--bg-secondary)] rounded-xl">
              <p className="text-sm opacity-70 tracking-wide px-4 text-center">
                No Reviews found
              </p>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={item._id || index}
                  layout
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragStart={() => setIsPaused(true)}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);

                    if (swipe < -swipeConfidenceThreshold) {
                      setIndex(([prev]) => [(prev + 1) % reviews.length, 1]);
                    } else if (swipe > swipeConfidenceThreshold) {
                      setIndex(([prev]) => [
                        prev === 0 ? reviews.length - 1 : prev - 1,
                        -1,
                      ]);
                    }

                    setIsPaused(false);
                  }}
                  onDoubleClick={handleDoubleClick}
                  onMouseUp={handleHoldRelease}
                  onMouseLeave={handleHoldRelease}
                  onTouchEnd={handleHoldRelease}
                  transition={{
                    layout: { duration: 0.45, ease: easeInOut },
                  }}
                  className="border border-[var(--border-light)]/50 bg-[var(--bg-secondary)]/50 rounded-lg min-h-88 md:min-h-59 overflow-hidden select-none cursor-grab active:cursor-grabbing relative"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6">
                    <div className="relative mb-4 sm:mb-0 sm:mr-6 w-[88px] h-[88px] flex-shrink-0">
                      <svg className="absolute w-full h-full rotate-[-90deg]">
                        <circle
                          cx="44"
                          cy="44"
                          r={RADIUS}
                          fill="none"
                          stroke="var(--bg-main)"
                          strokeWidth="3"
                        />
                        <motion.circle
                          key={index}
                          cx="44"
                          cy="44"
                          r={RADIUS}
                          fill="none"
                          stroke="var(--accent-primary)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={CIRCUMFERENCE}
                          initial={{ strokeDashoffset: CIRCUMFERENCE }}
                          animate={{
                            strokeDashoffset:
                              isPaused || isPanelOpen ? CIRCUMFERENCE : 0,
                          }}
                          transition={{
                            duration:
                              isPaused || isPanelOpen
                                ? 0
                                : SLIDE_DURATION / 1000,
                            ease: "linear",
                          }}
                        />
                      </svg>

                      {item.avatar && item.avatar.startsWith("http") ? (
                        <div className="relative h-16 w-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          {!loadedImages[item._id] && (
                            <div className="absolute inset-0 rounded-full p-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--accent-primary)] animate-pulse flex justify-center items-center">
                              <User />
                            </div>
                          )}

                          <img
                            loading="lazy"
                            src={item.avatar}
                            alt={item.name}
                            onLoad={() => handleImageLoad(item._id)}
                            className={`h-16 w-16 rounded-full object-cover z-10 border border-[var(--border-light)] transition-opacity duration-500 ${
                              loadedImages[item._id]
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 flex items-center justify-center rounded-full bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <User
                            size={26}
                            className="text-[var(--accent-primary)]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h1 className="font-semibold text-lg sm:text-xl">
                        {item.name}
                      </h1>
                      <p className="text-sm text-(--text-secondary) ">{item.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Rating
                          value={item.rating || 5}
                          readOnly
                          size="small"
                        />
                      </div>
                    </div>

                    {/* Owner Actions */}
                    {isOwner && (
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(item);
                          }}
                          className="p-2 rounded-full bg-[var(--bg-main)] hover:bg-[var(--accent-primary)]/20 text-[var(--text-main)] transition-colors cursor-pointer"
                          title="Edit Review"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item._id);
                          }}
                          className="p-2 rounded-full bg-[var(--bg-main)] hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <motion.p
                    layout
                    className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm text-justify"
                  >
                    {isExpanded ? item.comment : shortText}
                    {words.length > 45 && (
                      <span
                        onClick={() => toggleReadMore(item._id)}
                        className="cursor-pointer text-[var(--accent-primary)] font-medium ml-1"
                      >
                        {isExpanded ? " read less" : " ...read more"}
                      </span>
                    )}
                  </motion.p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 flex justify-between items-center px-2 sm:px-4">
                <div className="text-sm tracking-wider text-[var(--text-secondary)]/70">
                  <span className="font-medium text-[var(--text-main)]">
                    {String(currentSlide).padStart(2, "0")}
                  </span>
                  {" / "}
                  <span>{String(totalSlides).padStart(2, "0")}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="md:hidden justify-center flex">
          <button
            onClick={handleOpenCreate}
            className="px-6 py-3 border border-[var(--border-light)] rounded-lg text-sm font-medium hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
          >
            Leave a Review
          </button>
        </div>
      </div>

      {/* Leave / Edit Review Drawer */}
      <LeaveReview
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setIsPaused(false);
          setEditingReview(null);
        }}
        onSuccess={fetchReviews}
        reviewData={editingReview}
      />
    </div>
  );
};

export default Reviews;
