import { Link } from "react-router";
import type { Subject } from "../data/schema";

interface SubjectRowProps {
  subject: Subject;
}

export function SubjectRow({ subject }: SubjectRowProps) {
  const notesCount = subject.links.filter((l) => l.category === "notes").length;
  const playlistsCount = subject.links.filter((l) => l.category === "playlist").length;
  const pyqsCount = subject.links.filter((l) => l.category === "pyq").length;

  const counts = [];
  if (notesCount > 0) counts.push(`${notesCount} notes`);
  if (playlistsCount > 0) counts.push(`${playlistsCount} playlists`);
  if (pyqsCount > 0) counts.push(`${pyqsCount} PYQs`);

  const metaText = counts.length > 0 ? counts.join(", ") : "No resources yet";

  return (
    <Link
      to={`/subject/${subject.id}`}
      className="block w-full min-h-[48px] py-3 px-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] hover:bg-[var(--color-border)] transition-[background-color] duration-[150ms] text-left"
    >
      <div className="flex flex-col justify-center h-full gap-1">
        <span className="font-medium text-[var(--color-text)] text-[var(--text-base-fluid)] leading-tight">
          {subject.name}
        </span>
        <span className="text-[var(--color-muted)] text-[var(--text-sm-fluid)] leading-tight">
          {metaText}
        </span>
      </div>
    </Link>
  );
}
