const Document = require("../models/document.model");
const User = require("../models/user.model");
const FamilyMember = require("../models/familyMember.model");

const getManagedPatient = async (owner, patientId) => {
  if (!patientId || String(patientId) === String(owner._id)) return owner;
  const relation = await FamilyMember.findOne({ family: owner.family, user: patientId, isActive: true });
  if (!relation) return null;
  return User.findById(patientId);
};

const uploadDocument = async (req, res) => {
  try {
    const { title, documentType, description, fileUrl, fileType, patientId, familyMemberId } = req.body;
    if (!title || !fileUrl) return res.status(400).json({ success: false, message: "Title and a file URL are required." });
    const patient = await getManagedPatient(req.user, patientId || familyMemberId);
    if (!patient) return res.status(403).json({ success: false, message: "You can only upload records for yourself or a family member you manage." });
    const document = await Document.create({ patient: patient._id, title, description: description || "", documentType: documentType || "Other", fileUrl, fileType: fileType || "", uploadedBy: req.user._id });
    const populated = await Document.findById(document._id).populate("patient", "fullName").populate("uploadedBy", "fullName");
    return res.status(201).json({ success: true, message: "Medical record uploaded successfully.", document: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to upload medical record." });
  }
};

const getDocuments = async (req, res) => {
  try {
    const { patientId, familyMemberId, documentType } = req.query;
    const patient = await getManagedPatient(req.user, patientId || familyMemberId);
    if (!patient) return res.status(403).json({ success: false, message: "You are not allowed to view these records." });
    const filter = { patient: patient._id };
    if (documentType) filter.documentType = documentType;
    const documents = await Document.find(filter).populate("patient", "fullName").populate("uploadedBy", "fullName").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: documents.length, documents });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error retrieving medical records." });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: "Medical record not found." });
    const patient = await getManagedPatient(req.user, document.patient);
    if (!patient || String(document.uploadedBy) !== String(req.user._id)) return res.status(403).json({ success: false, message: "You are not allowed to delete this record." });
    await document.deleteOne();
    return res.status(200).json({ success: true, message: "Medical record deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error deleting medical record." });
  }
};

module.exports = { uploadDocument, getDocuments, deleteDocument };
