import React from "react";
import { Building, MapPin, Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
  onBookAppointment: (doctor: Doctor) => void;
}

export const DoctorsCard: React.FC<DoctorsCardProps> = ({
  doctor,
  index,
  isExtra = false,
  onBookAppointment,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`group rounded-lg border p-6 shadow-sm transition-all flex flex-col justify-between ${
        isExtra ? "doctor-card-extra" : ""
      }`}
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border-light)",
      }}
    >
      <div>
        <div className="flex gap-4 items-center mb-4">
          <img
            src={
              doctor.avatar ||
              "https://i.pinimg.com/1200x/5d/90/30/5d90305c3e338f4b17a52fd8dccf83b8.jpg"
            }
            alt={doctor.fullName}
            className="w-16 h-16 rounded-full object-top object-cover border shadow-xs"
            style={{ borderColor: "var(--border-light)" }}
          />
          <div className="flex-1">
            <h3
              className="text-xl font-semibold leading-snug"
              style={{ color: "var(--text-main)" }}
            >
              {doctor.fullName}
            </h3>
            <p
              className="text-xs font-semibold mt-0.5"
              style={{ color: "var(--accent-primary)" }}
            >
              {doctor.specialization}
            </p>
          </div>
        </div>

        <p
          className="text-xs mb-4 line-clamp-3 text-justify leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {doctor.biography}
        </p>

        <div
          className="space-y-2 text-xs mb-6 pt-3 border-t"
          style={{
            borderColor: "var(--border-light)",
            color: "var(--text-secondary)",
          }}
        >
          <div className="flex items-center gap-2">
            <Building
              size={14}
              className="shrink-0"
              style={{ color: "var(--accent-primary)" }}
            />
            <span className="truncate">{doctor.hospital}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin
              size={14}
              className="shrink-0"
              style={{ color: "var(--accent-primary)" }}
            />
            <span>{doctor.location || "New Delhi, India"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar
              size={14}
              className="shrink-0"
              style={{ color: "var(--accent-primary)" }}
            />
            <span>{doctor.yearsOfExperience} Years Experience</span>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between pt-4 border-t"
        style={{ borderColor: "var(--border-light)" }}
      >
        <div>
          <span
            className="text-xs block"
            style={{ color: "var(--text-secondary)" }}
          >
            Consultation Fee
          </span>
          <span
            className="text-lg font-bold"
            style={{ color: "var(--success)" }}
          >
            ₹{doctor.consultationFee}
          </span>
        </div>

        <button
          onClick={() => onBookAppointment(doctor)}
          className="px-5 py-2.5 rounded-sm text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
          style={{
            backgroundColor: "var(--accent-primary)",
          }}
        >
          Request Appointment <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};
