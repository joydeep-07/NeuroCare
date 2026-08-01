import { useState, useEffect } from "react";
import { FileText, Upload, Sparkles, Trash2, Eye, ExternalLink, Search } from "lucide-react";
import api from "../../api/axios";
import ENDPOINTS from "../../api/endPoints";

interface DocumentItem {
  _id: string;
  title: string;
  documentType: string;
  fileUrl: string;
  aiSummary?: string;
  createdAt: string;
  familyMember?: {
    fullName: string;
    relationship: string;
  };
}

const DOCUMENT_TYPES = [
  "All Types",
  "Prescription",
  "Blood Report",
  "MRI",
  "CT Scan",
  "ECG",
  "Ultrasound",
  "X-Ray",
  "Other",
];

const MedicalRecords = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");

  // Upload Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("Prescription");
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // AI Summary Modal
  const [selectedDocForSummary, setSelectedDocForSummary] = useState<DocumentItem | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedType !== "All Types") params.documentType = selectedType;

      const res = await api.get(ENDPOINTS.REPORT.GET_ALL, { params });
      if (res.data.success) {
        setDocuments(res.data.documents);
      }
    } catch (err) {
      console.log("Error loading documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedType]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fileUrl) {
      alert("Title and File URL are required.");
      return;
    }

    try {
      setUploading(true);
      const res = await api.post(ENDPOINTS.REPORT.UPLOAD, {
        title,
        documentType,
        fileUrl,
      });

      if (res.data.success) {
        alert("Medical record uploaded and analyzed by AI!");
        setShowUploadModal(false);
        setTitle("");
        setFileUrl("");
        fetchDocuments();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await api.delete(ENDPOINTS.REPORT.DELETE(id));
      if (res.data.success) {
        alert("Document deleted.");
        fetchDocuments();
      }
    } catch (err) {
      alert("Failed to delete document.");
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-lg">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)] mb-2">
            <FileText size={16} /> Cloud Vault & AI Summarizer
          </span>
          <h1 className="text-3xl font-bold font-heading text-[var(--text-main)]">Medical Records</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Store prescriptions, MRI, CT scans, blood reports & ECGs securely. Click any record to generate a simplified AI clinical summary.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 rounded-2xl bg-[var(--accent-primary)] text-white text-xs font-semibold shadow-md hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Upload size={16} /> Upload New Record
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)] shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-light)]">
              <h3 className="text-lg font-bold font-heading text-[var(--text-main)]">Upload Medical Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-[var(--text-secondary)]">✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Document Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Brain MRI Scan / Complete Blood Count"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Document Category</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                >
                  {DOCUMENT_TYPES.filter((t) => t !== "All Types").map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">File URL / Cloudinary Asset URL *</label>
                <input
                  type="text"
                  placeholder="e.g. https://res.cloudinary.com/demo/image/upload/v12345/mri_report.pdf"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-light)] text-[var(--text-main)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-semibold shadow-md"
                >
                  {uploading ? "Analyzing & Uploading..." : "Upload Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Summary Modal */}
      {selectedDocForSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[var(--card-bg)] rounded-3xl border border-[var(--border-light)] shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-[var(--border-light)]">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary)] mb-1">
                  <Sparkles size={16} /> AI Document Insights
                </span>
                <h3 className="text-xl font-bold font-heading text-[var(--text-main)]">
                  {selectedDocForSummary.title}
                </h3>
              </div>
              <button onClick={() => setSelectedDocForSummary(null)} className="text-[var(--text-secondary)]">✕</button>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs leading-relaxed text-[var(--text-main)]">
              {selectedDocForSummary.aiSummary}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[var(--border-light)]">
              <a
                href={selectedDocForSummary.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[var(--accent-primary)] flex items-center gap-1 hover:underline"
              >
                <ExternalLink size={14} /> Open Original File
              </a>
              <button
                onClick={() => setSelectedDocForSummary(null)}
                className="px-5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-light)] text-xs font-semibold text-[var(--text-main)]"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-lg flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <input
            type="text"
            placeholder="Search records by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] text-sm outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {DOCUMENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedType === type
                  ? "bg-[var(--accent-primary)] text-white shadow-sm"
                  : "bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border-light)] hover:text-[var(--text-main)]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] animate-pulse" />
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)]">
          <FileText size={48} className="mx-auto text-[var(--text-secondary)] mb-4" />
          <h3 className="text-xl font-bold text-[var(--text-main)] font-heading">No Medical Documents Found</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 mb-6">
            Upload your first prescription or lab test report to generate AI insights.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 rounded-2xl bg-[var(--accent-primary)] text-white text-xs font-semibold"
          >
            Upload Document Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc._id}
              className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] p-6 shadow-sm hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[10px] font-bold uppercase tracking-wider">
                    {doc.documentType}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    {new Date(doc.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--text-main)] font-heading leading-snug mb-1">
                  {doc.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                  {doc.aiSummary ? doc.aiSummary.replace(/###/g, "").slice(0, 100) + "..." : "Medical Record"}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)] text-xs">
                <button
                  onClick={() => setSelectedDocForSummary(doc)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-semibold flex items-center gap-1 hover:bg-cyan-500/20 transition-all"
                >
                  <Sparkles size={14} /> AI Summary
                </button>

                <div className="flex items-center gap-3">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--accent-primary)] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Eye size={14} /> View
                  </a>
                  <button onClick={() => handleDelete(doc._id)} className="text-rose-500 hover:text-rose-700">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
