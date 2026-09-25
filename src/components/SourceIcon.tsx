import { FileText, FolderOpen, Play, FileSpreadsheet, ExternalLink } from "lucide-react";

export function SourceIcon({ source, className }: { source: string; className?: string }) {
  switch (source) {
    case "drive_file":
      return <FileText size={18} strokeWidth={1.75} className={className} />;
    case "drive_folder":
      return <FolderOpen size={18} strokeWidth={1.75} className={className} />;
    case "youtube":
      return <Play size={18} strokeWidth={1.75} className={className} />;
    case "google_doc":
      return <FileSpreadsheet size={18} strokeWidth={1.75} className={className} />;
    case "other":
    default:
      return <ExternalLink size={18} strokeWidth={1.75} className={className} />;
  }
}
