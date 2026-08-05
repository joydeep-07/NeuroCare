import React from "react";
import {
  Building,
  MapPin,
  Calendar,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Doctor {
  _id: string;
  fullName: string;
  specialization: string;
  degree: string;
  hospital: string;
  department: string;
  yearsOfExperience: number;
  consultationFee: number;
  biography: string;
  avatar?: string;
  rating: number;
  reviewsCount: number;
  location: string;
  availability?: Array<{ day: string; slots: string[] }>;
}

interface DoctorsCardProps {
  doctor: Doctor;
  index: number;
  isExtra?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onBookAppointment: (doctor: Doctor) => void;
}

export const DoctorsCard: React.FC<DoctorsCardProps> = ({
  doctor,
  index,
  isExtra = false,
  isExpanded,
  onToggleExpand,
  onBookAppointment,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`group rounded-lg border p-4 md:p-6 shadow-sm transition-all flex flex-col justify-between ${
        isExtra ? "doctor-card-extra" : ""
      }`}
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border-light)",
      }}
    >
      {/* CARD HEADER (Always Visible - Triggers accordion toggle on mobile) */}
      <div
        onClick={onToggleExpand}
        className="flex items-center justify-between md:cursor-default cursor-pointer"
      >
        <div className="flex gap-3.5 md:gap-4 items-center w-full">
          <img
            src={
              doctor.avatar ||
              "https://i.pinimg.com/1200x/5d/90/30/5d90305c3e338f4b17a52fd8dccf83b8.jpg"
            }
            alt={doctor.fullName}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full object-top object-cover border shadow-xs shrink-0"
            style={{ borderColor: "var(--border-light)" }}
          />
          <div className="flex-1 min-w-0">
            <h3
              className="text-base md:text-xl font-semibold leading-snug truncate"
              style={{ color: "var(--text-main)" }}
            >
              {doctor.fullName}
            </h3>
            <p
              className="text-[11px] md:text-xs font-semibold mt-0.5 truncate"
              style={{ color: "var(--accent-primary)" }}
            >
              {doctor.specialization}
            </p>
          </div>

          {/* Mobile Accordion Toggle Icon */}
          <div
            className="md:hidden shrink-0"
            style={{ color: "var(--text-secondary)" }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={18} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* DESKTOP CONTENT (Always visible on desktop screens) */}
      <div className="hidden md:block">
        <CardBodyContent
          doctor={doctor}
          onBookAppointment={onBookAppointment}
        />
      </div>

      {/* MOBILE ACCORDION CONTENT (Exclusive open/close state) */}
      <div className="md:hidden">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div
                className="pt-3 border-t mt-3"
                style={{ borderColor: "var(--border-light)" }}
              >
                <CardBodyContent
                  doctor={doctor}
                  onBookAppointment={onBookAppointment}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Reusable Inner Content Component with optimized mobile font sizes
interface CardBodyContentProps {
  doctor: Doctor;
  onBookAppointment: (doctor: Doctor) => void;
}

const CardBodyContent: React.FC<CardBodyContentProps> = ({
  doctor,
  onBookAppointment,
}) => {
  return (
    <>
      <p
        className="text-[11px] md:text-xs mb-3 md:mb-4 line-clamp-3 text-justify leading-relaxed pt-2 md:pt-0"
        style={{ color: "var(--text-secondary)" }}
      >
        {doctor.biography}
      </p>

      <div
        className="space-y-1.5 md:space-y-2 text-[11px] md:text-xs mb-4 md:mb-6 pt-2.5 md:pt-3 border-t"
        style={{
          borderColor: "var(--border-light)",
          color: "var(--text-secondary)",
        }}
      >
        <div className="flex items-center gap-2">
          <Building
            size={13}
            className="shrink-0"
            style={{ color: "var(--accent-primary)" }}
          />
          <span className="truncate">{doctor.hospital}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin
            size={13}
            className="shrink-0"
            style={{ color: "var(--accent-primary)" }}
          />
          <span className="truncate">
            {doctor.location || "New Delhi, India"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar
            size={13}
            className="shrink-0"
            style={{ color: "var(--accent-primary)" }}
          />
          <span>{doctor.yearsOfExperience} Years Experience</span>
        </div>
      </div>

      <div
        className="flex items-center justify-between pt-3 md:pt-4 border-t"
        style={{ borderColor: "var(--border-light)" }}
      >
        <div>
          <span
            className="text-[10px] md:text-xs block"
            style={{ color: "var(--text-secondary)" }}
          >
            Consultation Fee
          </span>
          <span
            className="text-sm md:text-lg font-bold"
            style={{ color: "var(--success)" }}
          >
            ₹{doctor.consultationFee}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookAppointment(doctor);
          }}
          className="px-3.5 py-2 md:px-5 md:py-2.5 rounded-sm text-white text-[11px] md:text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
          style={{
            backgroundColor: "var(--accent-primary)",
          }}
        >
          Request Appointment <ArrowRight size={13} />
        </button>
      </div>
    </>
  );
};
