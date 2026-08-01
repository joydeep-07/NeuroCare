import React from "react";
import { Download as DownloadIcon } from "lucide-react";

interface DownloadProps {
  onDownload?: () => void;
  label?: string;
  className?: string;
}

const Download: React.FC<DownloadProps> = ({
  onDownload,
  label = "Download Prescription",
  className = "",
}) => {
  const handlePrintOrDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      window.print();
    }
  };

  return (
    <button
      onClick={handlePrintOrDownload}
      className={`px-4 py-2 rounded-sm bg-[var(--accent-primary)] text-white text-xs font-semibold shadow-sm hover:opacity-95 transition-all flex items-center gap-2 ${className}`}
    >
      <DownloadIcon size={14} />
      <span>{label}</span>
    </button>
  );
};

export default Download;
