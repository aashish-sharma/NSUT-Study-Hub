import { useMemo } from "react";
import { Link } from "react-router";
import { Calendar } from "lucide-react";
import { loadSubjects } from "../data/loader";
import { readExams } from "../lib/storage";
import { daysUntil, daysUntilLabel } from "../lib/dates";

interface ExamStripProps {
  /** Landing-page preview mode: pass a Date to show a static preview strip. */
  date?: Date;
  /** Landing-page preview mode: label for the static preview. */
  label?: string;
}

/**
 * Static preview strip used on the landing page.
 * Renders date-based countdown without reading from storage.
 */
function ExamStripPreview({ date, label = "Exam" }: { date: Date; label?: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  let statusText = "";
  if (diffDays === 0) statusText = "Today";
  else if (diffDays === 1) statusText = "Tomorrow";
  else if (diffDays > 1) statusText = `in ${diffDays} days`;
  else statusText = "Past";

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] text-[var(--color-text)] w-full">
      <Calendar size={18} className="text-[var(--color-accent)] shrink-0" />
      <span className="font-medium text-[var(--text-sm-fluid)] flex-1">
        {label}
      </span>
      <span className="text-[var(--text-sm-fluid)] font-semibold bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded-[var(--radius-full)] whitespace-nowrap">
        {statusText}
      </span>
    </div>
  );
}

/**
 * Data-driven strip that reads exams from storage.
 * Shows the single nearest upcoming exam and links to /exams.
 * Returns null if no exams exist.
 */
function ExamStripData() {
  const nearest = useMemo(() => {
    const subjects = loadSubjects();
    const exams = readExams(subjects);
    const upcoming = exams
      .filter((e) => daysUntil(e.date) >= 0)
      .sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
    return upcoming.length > 0 ? upcoming[0] : null;
  }, []);

  if (!nearest) return null;

  return (
    <Link
      to="/exams"
      className="flex items-center gap-3 px-4 py-3 mb-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] hover:bg-[var(--color-border)] transition-[background-color] duration-[150ms]"
    >
      <Calendar size={18} className="text-[var(--color-accent)] shrink-0" />
      <span className="font-medium text-[var(--color-text)] text-[var(--text-sm-fluid)] flex-1 truncate">
        {nearest.label}
      </span>
      <span className="text-[var(--text-sm-fluid)] font-semibold bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded-[var(--radius-full)] whitespace-nowrap">
        {daysUntilLabel(nearest.date)}
      </span>
    </Link>
  );
}

/**
 * ExamStrip — two modes:
 * - With {date, label} props: static preview (landing page). No hooks called.
 * - Without props: data-driven (subjects page). Reads from storage.
 */
export function ExamStrip({ date, label }: ExamStripProps = {}) {
  if (date !== undefined) {
    return <ExamStripPreview date={date} label={label} />;
  }
  return <ExamStripData />;
}
