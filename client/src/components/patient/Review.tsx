// Reviews.tsx
import React, { useEffect, useState, useRef } from "react";
import { ArrowUp, Stethoscope, User } from "lucide-react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import { LeaveReview } from "./LeaveReview";

const SLIDE_DURATION = 10000;
const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Mock data array replacing the Supabase fetch
const mockReviews = [
  {
    id: "1",
    name: "Alex Morgan",
    role: "Senior Software Engineer",
    image_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    review:
      "Working together has been an absolute pleasure. Their attention to detail, code quality, and commitment to delivering smooth user experiences are truly top-notch. Every milestone was met ahead of schedule with clean, maintainable code.",
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Sarah Jenkins",
    role: "Product Manager",
    image_url:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    review:
      "An exceptional developer who understands both design and technical implementation deeply. They brought our product vision to life with stunning micro-animations and robust responsiveness across all devices.",
    created_at: "2026-02-15T00:00:00Z",
  },
  {
    id: "3",
    name: "David Chen",
    role: "Lead UI/UX Designer",
    image_url: "", // Tests fallback avatar
    review:
      "It's rare to find a developer who respects design systems as thoroughly as they do code architecture. The handoff was seamless, and the final animated interface exceeded all our expectations.",
    created_at: "2026-01-20T00:00:00Z",
  },
];

const slideVariants = {
  enter:  ( direction : number) => ({
    x: direction > 0 ? 300 : -400,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction : number) => ({
    x: direction > 0 ? -400 : 300,
    opacity: 0,
  }),
};

const Reviews = () => {
  const [loadedImages, setLoadedImages] = useState({});
  const [[index, direction], setIndex] = useState([0, 1]);
  const [expandedId, setExpandedId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState(mockReviews);

  // Side Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const holdTimeoutRef = useRef(null);
  const isHoldingRef = useRef(false);

  // Auto slide
  useEffect(() => {
    if (isPaused || reviews.length === 0 || isPanelOpen) return;

    const interval = setInterval(() => {
      setIndex(([prev]) => [(prev + 1) % reviews.length, 1]);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [isPaused, reviews, isPanelOpen]);

  const swipeConfidenceThreshold = 100;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const toggleReadMore = (id) => {
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

  const handleAddReview = (formData) => {
    const newReview = {
      id: String(Date.now()),
      name: formData.name,
      role: formData.role || "Patient",
      review: formData.review,
      image_url: formData.image_url,
      created_at: new Date().toISOString(),
    };

    setReviews([newReview, ...reviews]);
  };

  const totalSlides = reviews.length;
  const currentSlide = totalSlides > 0 ? index + 1 : 0;

  const item = reviews[index] || {};
  const words = item.review ? item.review.split(" ") : [];
  const shortText = words.slice(0, 40).join(" ");
  const isExpanded = expandedId === item.id;

  const handleImageLoad = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

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
            What People choose <span className="text-(--accent-primary)">Neuro</span>Care ?
          </h1>

          <p className="text-xs opacity-80 max-w-sm mb-6 lg:mb-0">
            I've worked with some amazing people over the years here's what they
            have to say about me.
          </p>

          <div className="hidden md:flex mt-5">
            <button
              onClick={() => setIsPanelOpen(true)}
              className="px-6 py-3 border border-[var(--border-light)] rounded-full text-xs font-medium hover:border-[var(--accent-primary)] transition-colors"
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
                  key={item.id}
                  layout
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  /* DRAG SUPPORT */
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragStart={() => setIsPaused(true)}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);

                    if (swipe < -swipeConfidenceThreshold) {
                      // Swipe Left → Next
                      setIndex(([prev]) => [(prev + 1) % reviews.length, 1]);
                    } else if (swipe > swipeConfidenceThreshold) {
                      // Swipe Right → Previous
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
                  className="border border-[var(--border-light)]/50 bg-[var(--bg-secondary)]/50 rounded-lg min-h-88 md:min-h-59 overflow-hidden select-none cursor-grab active:cursor-grabbing"
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

                      {item.image_url && item.image_url.startsWith("http") ? (
                        <div className="relative h-16 w-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          {/* Skeleton */}
                          {!loadedImages[item.id] && (
                            <div className="absolute inset-0 rounded-full p-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--accent-primary)] animate-pulse flex justify-center items-center">
                              <User />
                            </div>
                          )}

                          {/* Image */}
                          <img
                            loading="lazy"
                            src={item.image_url}
                            alt={item.name}
                            onLoad={() => handleImageLoad(item.id)}
                            className={`h-16 w-16 rounded-full object-cover z-10 border border-[var(--border-light)] transition-opacity duration-500 ${
                              loadedImages[item.id]
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
                      <p className="text-sm opacity-70 mt-1">{item.role}</p>
                    </div>
                  </div>

                  <motion.p
                    layout
                    className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm text-justify"
                  >
                    {isExpanded ? item.review : shortText}
                    {words.length > 45 && (
                      <span
                        onClick={() => toggleReadMore(item.id)}
                        className="cursor-pointer text-[var(--accent-primary)] font-medium ml-1"
                      >
                        {isExpanded ? " read less" : " ...read more"}
                      </span>
                    )}
                  </motion.p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 flex justify-end items-start sm:items-center gap-4 px-2 sm:px-4">
                <div className="flex items-center gap-10">
                  <div className="text-sm tracking-wider text-[var(--text-secondary)]/70">
                    <span className="font-medium text-[var(--text-main)]">
                      {String(currentSlide).padStart(2, "0")}
                    </span>
                    {" / "}
                    <span>{String(totalSlides).padStart(2, "0")}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="md:hidden justify-center flex">
          <button
            onClick={() => setIsPanelOpen(true)}
            className="px-6 py-3 border border-[var(--border-light)] rounded-lg text-sm font-medium hover:border-[var(--accent-primary)] transition-colors"
          >
            Leave a Review
          </button>
        </div>
      </div>

      {/* Extracted Side Panel Form Component */}
      <LeaveReview
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSubmit={handleAddReview}
      />
    </div>
  );
};

export default Reviews;
