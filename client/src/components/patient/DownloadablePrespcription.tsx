import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
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

interface PatientInfo {
  fullName: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  dateOfBirth?: string;
  gender?: string;
  avatar?: string;
  relationship?: string;
}

interface Appointment {
  appointmentId: string;
  diagnosis?: string;
  doctorNotes?: string;
  treatmentPlan?: string;
  followUpDate?: string;
  prescription?: Medicine[];
  doctor: { fullName: string; specialization: string; hospital: string };
  patient?: PatientInfo;
  familyMember?: PatientInfo;
}

interface Props {
  appointment: Appointment;
}

const styles = StyleSheet.create({
  page: { paddingTop: 48, paddingRight: 48, paddingBottom: 76, paddingLeft: 48, fontFamily: "Helvetica", fontSize: 10, color: "#1f2937" },
  header: { marginBottom: 26 },
  hospital: { textAlign: "center", color: "#2563eb", fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 24 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  doctorName: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  specialization: { color: "#4b5563", marginTop: 3 },
  patient: { textAlign: "right" },
  patientName: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  muted: { color: "#4b5563", marginTop: 3 },
  section: { marginBottom: 22 },
  heading: { fontFamily: "Helvetica-Bold", fontSize: 12, marginBottom: 10 },
  label: { color: "#6b7280", fontFamily: "Helvetica-Bold", fontSize: 8, textTransform: "uppercase", marginBottom: 4 },
  paragraph: { lineHeight: 1 },
  detail: { marginTop: 10 },
  medicine: { flexDirection: "row", marginBottom: 8, paddingLeft: 8 },
  medicineNumber: { width: 18, color: "#2563eb", fontFamily: "Helvetica-Bold" },
  medicineText: { flex: 1, lineHeight: 1 },
  signature: { position: "absolute", right: 48, bottom: 32, alignItems: "flex-end" },
  signatureName: { fontSize: 19, fontFamily: "Times-Italic" },
  signatureLabel: { marginTop: 3, fontSize: 7, letterSpacing: 1.4, color: "#6b7280" },
});

const DownloadablePrescription: React.FC<Props> = ({ appointment }) => {
  const patientInfo = appointment.familyMember || appointment.patient;
  const patientName = patientInfo?.fullName || [patientInfo?.firstName, patientInfo?.lastName].filter(Boolean).join(" ") || "Patient";
  const age = calculateAge(patientInfo?.dateOfBirth || patientInfo?.dob);
  const patientMeta = `${age === null ? "N/A" : `${age} Years`} · ${patientInfo?.gender || "-"}`;

  return (
    <Document title={`Prescription-${appointment.appointmentId}`} author={appointment.doctor.fullName}>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.hospital}>{appointment.doctor.hospital}</Text>
          <View style={styles.row}>
            <View>
              <Text style={styles.doctorName}>{appointment.doctor.fullName}</Text>
              <Text style={styles.specialization}>{appointment.doctor.specialization}</Text>
            </View>
            <View style={styles.patient}>
              <Text style={styles.patientName}>{patientName}</Text>
              <Text style={styles.muted}>{patientMeta}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Clinical Assessment</Text>
          <Text style={styles.label}>Diagnosis</Text>
          <Text style={styles.paragraph}>{appointment.diagnosis || "Standard Consultation Evaluation"}</Text>
          {appointment.doctorNotes && <View style={styles.detail}><Text style={styles.label}>Clinical Notes</Text><Text style={styles.paragraph}>{appointment.doctorNotes}</Text></View>}
          {appointment.treatmentPlan && <View style={styles.detail}><Text style={styles.label}>Advice</Text><Text style={styles.paragraph}>{appointment.treatmentPlan}</Text></View>}
          {appointment.followUpDate && <View style={styles.detail}><Text style={styles.label}>Follow-up</Text><Text>{appointment.followUpDate}</Text></View>}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Prescribed Medicines</Text>
          {appointment.prescription?.length ? appointment.prescription.map((medicine, index) => {
            const name = medicine.medicineName || medicine.medicine || "Prescribed Medicine";
            const details = [medicine.strength, medicine.route && `(${medicine.route})`, medicine.dosage, medicine.frequency, medicine.duration && `for ${medicine.duration}`].filter(Boolean).join(" · ");
            return <View key={`${name}-${index}`} style={styles.medicine} wrap={false}><Text style={styles.medicineNumber}>{index + 1}.</Text><Text style={styles.medicineText}>{name}{details ? ` — ${details}` : ""}</Text></View>;
          }) : <Text style={styles.muted}>No medicines prescribed for this appointment.</Text>}
        </View>

        <View style={styles.signature} fixed>
          <Text style={styles.signatureName}>{appointment.doctor.fullName}</Text>
          <Text style={styles.signatureLabel}>DIGITALLY SIGNED</Text>
        </View>
      </Page>
    </Document>
  );
};

export default DownloadablePrescription;
