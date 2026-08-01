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

const DownloadablePrescription: React.FC<Props> = ({ appointment }) => {
  if (!appointment) {
    return (
      <div className="text-center py-12 text-gray-500 text-xs bg-white">
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
    <div className="bg-white text-gray-900 p-8 max-w-3xl mx-auto space-y-6 text-xs shadow-sm print:shadow-none print:p-0">
      {/* Hospital & Doctor Header */}
      <div className="py-4 border-b border-gray-100 bg-white space-y-3">
        <span className="text-blue-600 text-center font-heading font-bold tracking-wider uppercase text-lg block border-b border-gray-300 pb-2">
          {appointment.doctor.hospital}
        </span>
        <div className="flex justify-between items-start pt-2">
          <div>
            <h3 className="text-base font-heading font-bold text-gray-900">
              {appointment.doctor.fullName}
            </h3>
            <p className="text-gray-600 font-medium">
              {appointment.doctor.specialization}
            </p>
          </div>

          <div className="text-right">
            <h3 className="text-base font-bold  font-heading text-gray-900">
              {patientName}
            </h3>
            <p className="text-gray-600">
              {patientAge === null ? "N/A" : `${patientAge} Years`} ·{" "}
              {patientGender}
            </p>
          </div>
        </div>
      </div>

      {/* Assessment & Diagnosis */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm flex items-center gap-1.5 text-gray-900 pb-2">
          <FileText size={14} className="text-blue-600" />
          Clinical Assessment
        </h4>
        <div className="space-y-3 rounded bg-white">
          <div>
            <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              Diagnosis:
            </span>
            <p className="font-medium mt-0.5 text-justify text-gray-900">
              {appointment.diagnosis || "Standard Consultation Evaluation"}
            </p>
          </div>
          {appointment.doctorNotes && (
            <div className="pt-3 border-t border-gray-100">
              <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                Doctor Notes:
              </span>
              <p className="font-normal text-justify mt-0.5 text-gray-700">
                {appointment.doctorNotes}
              </p>
            </div>
          )}
          {appointment.treatmentPlan && (
            <div className="pt-3 border-t border-gray-100">
              <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                Treatment Plan:
              </span>
              <p className="font-normal mt-0.5 text-gray-700">
                {appointment.treatmentPlan}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prescribed Medicines */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm flex items-center gap-1.5 text-gray-900 pb-2">
          <Pill size={14} className="text-blue-600" />
          Prescribed Medicines
        </h4>

        {appointment.prescription && appointment.prescription.length > 0 ? (
          <div className="space-y-3 relative pb-12">
            {appointment.prescription.map((med, index) => {
              const name =
                med.medicineName || med.medicine || "Prescribed Medicine";

              return (
                <div key={index} className="pl-4 flex flex-col font-mono">
                  <p className="text-xs text-gray-800 leading-4">
                    <span className="text-blue-600 font-semibold">
                      {index + 1}.
                    </span>{" "}
                    <span className="font-semibold">
                      {name} {med.strength && <span>{med.strength}</span>}
                    </span>
                    {med.route && ` (${med.route})`}
                    {med.dosage && ` ${med.dosage},`}
                    {med.frequency && ` ${med.frequency}`}
                    {med.duration && ` for ${med.duration}`}
                  </p>
                </div>
              );
            })}

            {/* Digital Signature Section */}
            <div className="mt-12">
              <div className="p-4 text-right absolute right-0 bottom-0">
                <h1 className="text-3xl hand-writting italic text-gray-800">
                  {appointment.doctor.fullName}
                </h1>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-sans">
                  Digitally Signed
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 p-4 bg-white rounded border border-gray-200">
            No medicines prescribed for this appointment.
          </p>
        )}
      </div>
    </div>
  );
};

export default DownloadablePrescription;