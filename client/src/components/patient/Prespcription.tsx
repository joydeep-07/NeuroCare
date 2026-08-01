import React from "react";
import { FileText, Pill } from "lucide-react";
import { calculateAge } from "../../utils/calculateAge";

interface Medicine {
  medicineName?: string;
  medicine?: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;
}

interface Appointment {
  appointmentId: string;
  diagnosis?: string;
  doctorNotes?: string;
  treatmentPlan?: string;
  prescription?: Medicine[];
  doctor: {
    fullName: string;
    specialization: string;
    hospital: string;
  };
  patient?: {
    fullName: string;
    firstName?: string;
    lastName?: string;
    dob?: string;
    gender?: string;
    dateOfBirth?: string;
    avatar?: string;
  };
  familyMember?: {
    fullName: string;
    firstName?: string;
    lastName?: string;
    dob?: string;
    relationship: string;
    gender?: string;
    dateOfBirth?: string;
    avatar?: string;
  };
}

interface Props {
  appointment: Appointment | null;
}

const Prespcription: React.FC<Props> = ({ appointment }) => {
  if (!appointment) {
    return (
      <div className="text-center py-12 text-[var(--text-secondary)] text-xs">
        No appointment data available.
      </div>
    );
  }

  const patientInfo = appointment.familyMember || appointment.patient;
  const patientName =
    patientInfo?.fullName ||
    [patientInfo?.firstName, patientInfo?.lastName].filter(Boolean).join(" ") ||
    "Patient";
  const patientGender = patientInfo?.gender || "-";
  const patientAge = calculateAge(patientInfo?.dateOfBirth || patientInfo?.dob);

  return (
    <div className="space-y-6 text-xs text-[var(--text-main)] pb-8">
      {/* Hospital & Doctor Header */}
      <div className="p-4 rounded-sm bg-[var(--bg-main)]/50 border border-[var(--border-light)]/50 space-y-1">
        <span className="text-[var(--accent-primary)] text-center font-semibold tracking-wider uppercase text-sm block">
          {appointment.doctor.hospital}
        </span>
        <div className="flex justify-between pt-5">
          <div className="lext">
            <h3 className="text-base font-bold font-heading text-[var(--text-main)]">
              {appointment.doctor.fullName}
            </h3>
            <p className="text-[var(--text-secondary)]">
              {appointment.doctor.specialization}
            </p>
          </div>

          <div className="right text-right">
            <h3 className="text-base font-bold font-heading text-[var(--text-main)]">
              {patientName}
            </h3>
            <p className="text-[var(--text-secondary)]">
              {patientAge === null ? "N/A" : `${patientAge} Years`} ·{" "}
              {patientGender}
            </p>
          </div>
        </div>
      </div>

      {/* Patient Meta Details */}

      {/* Assessment & Diagnosis */}
      <div className="space-y-3">
        <h4 className="font-bold font-heading text-sm flex items-center gap-1.5 text-[var(--text-main)] border-b border-[var(--border-light)]/50 pb-2">
          <FileText size={14} className="text-[var(--accent-primary)]" />{" "}
          Clinical Assessment
        </h4>
        <div className="space-y-2 p-4 rounded-sm bg-[var(--bg-main)]/50 border border-[var(--border-light)]/50">
          <div>
            <span className="text-[var(--text-secondary)] font-semibold uppercase text-[10px]">
              Diagnosis:
            </span>
            <p className="font-medium mt-0.5 text-[var(--text-main)]">
              {appointment.diagnosis || "Standard Consultation Evaluation"}
            </p>
          </div>
          {appointment.doctorNotes && (
            <div className="pt-2 border-t border-[var(--border-light)]/30">
              <span className="text-[var(--text-secondary)] font-semibold uppercase text-[10px]">
                Doctor Notes:
              </span>
              <p className="font-normal mt-0.5 text-[var(--text-secondary)]">
                {appointment.doctorNotes}
              </p>
            </div>
          )}
          {appointment.treatmentPlan && (
            <div className="pt-2 border-t border-[var(--border-light)]/30">
              <span className="text-[var(--text-secondary)] font-semibold uppercase text-[10px]">
                Treatment Plan:
              </span>
              <p className="font-normal mt-0.5 text-[var(--text-secondary)]">
                {appointment.treatmentPlan}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prescribed Medicines */}
      <div className="space-y-3">
        <h4 className="font-bold font-heading text-sm flex items-center gap-1.5 text-[var(--text-main)] border-b border-[var(--border-light)]/50 pb-2">
          <Pill size={14} className="text-[var(--accent-primary)]" />
          Prescribed Medicines
        </h4>

        {appointment.prescription && appointment.prescription.length > 0 ? (
          <div className="space-y-2">
            {appointment.prescription.map((med, index) => {
              const name =
                med.medicineName || med.medicine || "Prescribed Medicine";
              return (
                <div
                  key={index}
                  className="p-3.5 rounded-sm bg-[var(--bg-main)]/50 border border-[var(--border-light)]/50 flex flex-col gap-1 font-mono"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[var(--text-main)] text-xs flex items-center gap-1.5">
                      <span className="text-[var(--accent-primary)] font-sans">
                        {index + 1}.
                      </span>{" "}
                      💊 {name}
                      {med.strength && (
                        <span className="text-[var(--text-secondary)] font-normal">
                          ({med.strength})
                        </span>
                      )}
                    </span>
                    {med.route && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-sans">
                        {med.route}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] pl-4 flex flex-wrap gap-x-4 gap-y-1 font-sans mt-1">
                    {med.dosage && (
                      <span>
                        <strong>Dosage:</strong> {med.dosage}
                      </span>
                    )}
                    {med.frequency && (
                      <span>
                        <strong>Frequency:</strong> {med.frequency}
                      </span>
                    )}
                    {med.duration && (
                      <span>
                        <strong>Duration:</strong> {med.duration}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="p-4 text-right absolute bottom-0 right-0">
              <h1 className="text-3xl hand-writting text-(--text-main)">
                {appointment.doctor.fullName}
              </h1>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-(--text-secondary)">
                Digitally Signed
              </p>
            </div>
          </div>
        ) : (
          <p className="text-[var(--text-secondary)] p-4 bg-[var(--bg-main)]/50 rounded-sm border border-[var(--border-light)]/50">
            No medicines prescribed for this appointment.
          </p>
        )}
      </div>
    </div>
  );
};

export default Prespcription;
