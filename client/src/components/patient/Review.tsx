// Reviews.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  Stethoscope,
  User,
  Edit3,
  Trash2,
  Star,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LeaveReview } from "./LeaveReview";
import { ENDPOINTS } from "../../api/endPoints";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import axios from "axios";

const SLIDE_DURATION = 10000;
const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const Reviews = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [index, setIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const holdTimeoutRef = useRef<any>(null);
  const isHoldingRef = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // If click is not inside any menu button or dropdown → close
      if (!target.closest("[data-menu-root]")) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch reviews
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

  // Auto-slide
  useEffect(() => {
    if (isPaused || reviews.length <= 1 || isPanelOpen) return;

    const interval = setInterval(() => {
      goToNext();
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [isPaused, reviews.length, isPanelOpen, index]);

  // ─── Infinite helpers ───────────────────────────────────────
  const goToNext = () => {
    setIsTransitioning(true);
    setIndex((prev) => prev + 1);
  };

  const goToPrev = () => {
    setIsTransitioning(true);
    setIndex((prev) => prev - 1);
  };

  // Seamless jump
  useEffect(() => {
    if (reviews.length === 0) return;

    if (index === reviews.length) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setIndex(0);
      }, 500);
      return () => clearTimeout(timer);
    }

    if (index === -1) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setIndex(reviews.length - 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [index, reviews.length]);

  useEffect(() => {
    if (!isTransitioning) {
      requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
    }
  }, [isTransitioning]);

  // Drag support
  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Don't start drag if user clicked the menu
    if ((e.target as HTMLElement).closest("[data-menu-root]")) return;

    isDragging.current = true;
    dragStartX.current = e.clientX;
    setIsPaused(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const diff = e.clientX - dragStartX.current;

    if (diff < -60) goToNext();
    else if (diff > 60) goToPrev();

    setIsPaused(false);
  };

  // ─── Other handlers ────────────────────────────────────────
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

  const handleDelete = async (reviewId: string) => {
    setMenuOpenId(null);
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(ENDPOINTS.REVIEW.DELETE(reviewId), {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      fetchReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete review.");
    }
  };

  const handleOpenCreate = () => {
    setEditingReview(null);
    setIsPanelOpen(true);
  };

  const handleOpenEdit = (rev: any) => {
    setMenuOpenId(null);
    setEditingReview(rev);
    setIsPanelOpen(true);
    setIsPaused(true);
  };

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  // Original + clone of first card
  const slides = reviews.length > 0 ? [...reviews, reviews[0]] : [];

  const totalSlides = reviews.length;
  const currentSlide = totalSlides > 0 ? (index % totalSlides) + 1 : 0;

  return (
    <div className="relative py-8 md:py-12 lg:py-16 bg-[var(--bg-main)] flex justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* LEFT */}
        <div className="w-full lg:w-1/3 px-2 sm:px-4">
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ color: "var(--accent-primary)" }}
          >
            <Stethoscope size={14} /> What people say ?
          </span>

          <h1
            className="text-2xl md:text-4xl font-light mb-4 leading-tight"
            style={{ color: "var(--text-main)" }}
          >
            Why People choose{" "}
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
        <div className="w-full lg:w-2/3 px-2 sm:px-4">
          {loading ? (
            <div className="h-64 sm:h-72 md:h-80 flex items-center justify-center border border-[var(--border-light)] bg-[var(--bg-secondary)] rounded-xl animate-pulse">
              <p className="text-sm opacity-70">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="h-40 sm:h-55 md:h-55 flex items-center justify-center border border-[var(--border-light)] bg-[var(--bg-secondary)] rounded-xl">
              <p className="text-sm opacity-70 tracking-wide px-4 text-center">
                No Reviews found
              </p>
            </div>
          ) : (
            <>
              <div className="relative w-full overflow-hidden">
                <div
                  ref={trackRef}
                  className="flex"
                  style={{
                    transform: `translateX(-${index * 100}%)`,
                    transition: isTransitioning
                      ? "transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)"
                      : "none",
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  {slides.map((item, i) => {
                    const isActive =
                      i === index || (index === reviews.length && i === 0);
                    const realId = item._id;

                    const isOwner =
                      user &&
                      item.user &&
                      (item.user === user._id || item.user._id === user._id);

                    const words = item.comment ? item.comment.split(" ") : [];
                    const shortText = words.slice(0, 40).join(" ");
                    const isExpanded = expandedId === realId;

                    return (
                      <div
                        key={`${realId}-${i}`}
                        className="w-full flex-shrink-0 border-l-3 border-[var(--accent-primary)]/50 bg-[var(--bg-secondary)]/30 rounded-lg min-h-50 md:min-h-55 overflow-hidden select-none relative"
                        onDoubleClick={handleDoubleClick}
                        onMouseUp={handleHoldRelease}
                        onMouseLeave={handleHoldRelease}
                        onTouchEnd={handleHoldRelease}
                      >
                        {/* Header */}
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
                              {isActive && (
                                <motion.circle
                                  key={`progress-${index % reviews.length}`}
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
                                      isPaused || isPanelOpen
                                        ? CIRCUMFERENCE
                                        : 0,
                                  }}
                                  transition={{
                                    duration:
                                      isPaused || isPanelOpen
                                        ? 0
                                        : SLIDE_DURATION / 1000,
                                    ease: "linear",
                                  }}
                                />
                              )}
                            </svg>

                            {item.avatar && item.avatar.startsWith("http") ? (
                              <div className="relative h-16 w-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                {!loadedImages[realId] && (
                                  <div className="absolute inset-0 rounded-full p-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--accent-primary)] animate-pulse flex justify-center items-center">
                                    <User />
                                  </div>
                                )}
                                <img
                                  loading="lazy"
                                  src={item.avatar}
                                  alt={item.name}
                                  onLoad={() => handleImageLoad(realId)}
                                  className={`h-16 w-16 rounded-full object-cover z-10 border border-[var(--border-light)] transition-opacity duration-500 ${
                                    loadedImages[realId]
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
                            <h1 className="font-normal font-heading text-lg sm:text-xl">
                              {item.name}
                            </h1>
                            <p className="text-xs text-(--text-secondary)">
                              {item.email}
                            </p>

                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: 5 }).map((_, starIdx) => {
                                const ratingValue = item.rating || 5;
                                const isFilled =
                                  starIdx < Math.floor(ratingValue);
                                return (
                                  <Star
                                    key={starIdx}
                                    size={12}
                                    className={`${
                                      isFilled
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-gray-300 dark:text-gray-600"
                                    }`}
                                  />
                                );
                              })}
                            </div>
                          </div>

                          {/* Owner menu – FIXED */}
                          {isOwner && (
                            <div
                              className="absolute top-4 right-4"
                              data-menu-root // ← important for click-outside + drag ignore
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(
                                    menuOpenId === realId ? null : realId,
                                  );
                                }}
                                onPointerDown={(e) => e.stopPropagation()} // ← prevent drag from starting
                                className="p-2 rounded-full bg-[var(--bg-main)] text-[var(--text-main)] transition-colors cursor-pointer"
                                title="Options"
                              >
                                <MoreVertical size={16} />
                              </button>

                              <AnimatePresence>
                                {menuOpenId === realId && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-32 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-sm shadow-lg overflow-hidden z-20"
                                    onPointerDown={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEdit(item);
                                      }}
                                      className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-[var(--text-main)] hover:bg-[var(--accent-primary)]/15 transition-colors text-left cursor-pointer"
                                    >
                                      <Edit3 size={14} /> Edit
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(realId);
                                      }}
                                      className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-red-500 hover:bg-red-500/15 transition-colors text-left cursor-pointer border-t border-[var(--border-light)]/40"
                                    >
                                      <Trash2 size={14} /> Delete
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>

                        <p className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm text-justify">
                          {isExpanded ? item.comment : shortText}
                          {words.length > 45 && (
                            <span
                              onClick={() => toggleReadMore(realId)}
                              className="cursor-pointer text-[var(--accent-primary)] font-medium ml-1"
                            >
                              {isExpanded ? " read less" : " ...read more"}
                            </span>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Counter */}
              <div className="mt-6 flex justify-end items-center px-2 sm:px-4">
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
