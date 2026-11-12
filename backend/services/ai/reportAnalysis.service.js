const Document = require("../../models/document.model");
const FamilyMember = require("../../models/familyMember.model");
const { callGroqWithFallback } = require("./aiClient");

const REPORT_SYSTEM_PROMPT = `You are NeuroCare Medical Document & Lab Test AI Analyzer.
Analyze the provided medical report details, document title, category, and clinical description.
Provide an objective, structured analysis with:
1. Document Type & Key Extracted Findings
2. Identified or Inferred Health Indicators (Normal vs Attention/Out-of-range considerations)
3. Simplified Plain-Language Explanation for Patient (Easy to understand, reassurance, actionable next steps)
4. Key Questions to Discuss with Your Treating Doctor
5. Clinical Disclaimer (Educational interpretation only; clinician review required)`;

/**
 * Verify if requestingUser is authorized to view/analyze this document.
 */
const verifyDocumentAccess = async (requestingUser, document) => {
  if (requestingUser.role === "admin") return true;
  if (String(document.patient) === String(requestingUser._id)) return true;

  // Check if it's a family member managed by requesting user
  const isFamily = await FamilyMember.findOne({
    family: requestingUser.family,
    user: document.patient,
    isActive: true,
  });
  if (isFamily) return true;

  return false;
};

/**
 * Analyze a single medical document and persist the generated AI summary.
 */
const analyzeMedicalDocument = async ({ requestingUser, documentId }) => {
  const document = await Document.findById(documentId).populate("patient", "fullName gender dateOfBirth");
  if (!document) {
    throw Object.assign(new Error("Medical record document not found."), { statusCode: 404 });
  }

  const isAuthorized = await verifyDocumentAccess(requestingUser, document);
  if (!isAuthorized) {
    throw Object.assign(new Error("Unauthorized: You can only analyze documents belonging to your medical file."), { statusCode: 403 });
  }

  const prompt = `DOCUMENT METADATA:
- Title: ${document.title}
- Document Category: ${document.documentType}
- Description / Patient Notes: ${document.description || "No patient notes provided."}
- Patient: ${document.patient?.fullName || "Patient"}
- Upload Date: ${new Date(document.createdAt).toLocaleDateString()}
- File Location: ${document.fileUrl}

Task: Produce a structured, patient-friendly AI medical report interpretation. If numeric lab values or diagnostic imaging terminology are mentioned in the title/description, extract and explain them clearly.`;

  let aiSummary = null;
  try {
    aiSummary = await callGroqWithFallback({
      messages: [
        { role: "system", content: REPORT_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      maxTokens: 800,
    });
  } catch (err) {
    console.error("[reportAnalysis] AI call failed:", err.message);
  }

  if (!aiSummary) {
    aiSummary = `### AI Analysis: ${document.title} (${document.documentType})
- **Summary:** Verified record for ${document.patient?.fullName || "patient"}.
- **Category:** ${document.documentType}.
- **Patient Advice:** Keep this document organized in your NeuroCare vault. Show this original record to your specialist during consultation for clinical correlation.`;
  }

  // Save the generated summary directly to MongoDB
  document.aiSummary = aiSummary;
  await document.save();

  return {
    documentId: String(document._id),
    title: document.title,
    documentType: document.documentType,
    aiSummary,
    fileUrl: document.fileUrl,
    createdAt: document.createdAt,
  };
};

/**
 * Compare two or more medical reports (Historical Comparison over time).
 */
const compareHistoricalReports = async ({ requestingUser, documentIds }) => {
  if (!Array.isArray(documentIds) || documentIds.length < 2) {
    throw Object.assign(new Error("Please select at least 2 medical documents to compare."), { statusCode: 400 });
  }

  const documents = await Document.find({ _id: { $in: documentIds } })
    .populate("patient", "fullName")
    .sort({ createdAt: 1 });

  if (documents.length < 2) {
    throw Object.assign(new Error("Selected documents could not be found."), { statusCode: 404 });
  }

  for (const doc of documents) {
    const isAuthorized = await verifyDocumentAccess(requestingUser, doc);
    if (!isAuthorized) {
      throw Object.assign(new Error("Unauthorized: One or more selected records do not belong to you."), { statusCode: 403 });
    }
  }

  const docSummaries = documents.map((doc, idx) => `Record #${idx + 1} (${new Date(doc.createdAt).toISOString().split("T")[0]}):
- Title: ${doc.title}
- Category: ${doc.documentType}
- Recorded Notes/Summary: ${doc.aiSummary || doc.description || "None"}`).join("\n\n");

  const prompt = `Task: Compare these ${documents.length} historical medical records chronologically for patient ${documents[0].patient?.fullName || ""}.
${docSummaries}

Please structure your comparative analysis into:
1. Chronological Timeline & Test Progression
2. Key Observed Changes or Value Shifts Between Reports
3. Clinical Stability, Improvement, or Deterioration Indicators
4. Priority Questions for Doctor Consultation
5. Medical Disclaimer`;

  let comparison = null;
  try {
    comparison = await callGroqWithFallback({
      messages: [
        { role: "system", content: "You are NeuroCare Historical Medical Report Comparison Assistant. Provide thorough chronological comparisons." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      maxTokens: 1000,
    });
  } catch (err) {
    console.error("[reportAnalysis] Historical comparison error:", err.message);
  }

  if (!comparison) {
    comparison = `### Historical Report Comparison
Comparing ${documents.length} records from ${new Date(documents[0].createdAt).toLocaleDateString()} to ${new Date(documents[documents.length - 1].createdAt).toLocaleDateString()}.
- **Record 1:** ${documents[0].title} (${documents[0].documentType})
- **Record 2:** ${documents[1].title} (${documents[1].documentType})
Please consult your specialist for detailed quantitative longitudinal tracking.`;
  }

  return {
    comparedCount: documents.length,
    documents: documents.map((d) => ({ id: d._id, title: d.title, date: d.createdAt, type: d.documentType })),
    comparison,
  };
};

module.exports = {
  analyzeMedicalDocument,
  compareHistoricalReports,
};
