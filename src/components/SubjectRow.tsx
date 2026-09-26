import { Link } from "react-router";
import type { Subject } from "../data/schema";
import { StarToggle } from "./StarToggle";
import { ProgressBar } from "./ProgressBar";
import { useEffect, useState } from "react";
import { storage } from "../lib/storage";
import { loadSubjects } from "../data/loader";

interface SubjectRowProps {
  subject: Subject;
  isPinned: boolean;
  onTogglePin: (e: React.MouseEvent) => void;
}

export function SubjectRow({ subject, isPinned, onTogglePin }: SubjectRowProps) {
  const notesCount = subject.links.filter((l) => l.category === "notes").length;
  const playlistsCount = subject.links.filter((l) => l.category === "playlist").length;
  const pyqsCount = subject.links.filter((l) => l.category === "pyq").length;

  const counts = [];
  if (notesCount > 0) counts.push(`${notesCount} notes`);
  if (playlistsCount > 0) counts.push(`${playlistsCount} playlists`);
  if (pyqsCount > 0) counts.push(`${pyqsCount} PYQs`);

  const metaText = counts.length > 0 ? counts.join(", ") : "No resources yet";

  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const checkState = () => {
      const allSubjects = loadSubjects();
      const completed = storage.readCompletedLinks(allSubjects);
      setCompletedCount(completed.filter(c => c.subjectId === subject.id).length);
    };
    checkState();
    window.addEventListener("studyhub:storage-update", checkState);
    return () => window.removeEventListener("studyhub:storage-update", checkState);
  }, [subject.id]);

  return (
    <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] hover:bg-[var(--color-border)] transition-[background-color] duration-[150ms]">
      <Link
        to={`/subject/${subject.id}`}
        className="flex-1 min-h-[48px] py-3 pl-4 pr-2 text-left"
      >
        <div className="flex flex-col justify-center h-full gap-1">
          <span className="font-medium text-[var(--color-text)] text-[var(--text-base-fluid)] leading-tight">
            {subject.name}
          </span>
          <span className="text-[var(--color-muted)] text-[var(--text-sm-fluid)] leading-tight">
            {metaText}
          </span>
          <ProgressBar completed={completedCount} total={subject.links.length} />
        </div>
      </Link>
      <div className="flex items-center pr-2 shrink-0">
        <StarToggle isPinned={isPinned} onToggle={onTogglePin} />
      </div>
    </div>
  );
}
