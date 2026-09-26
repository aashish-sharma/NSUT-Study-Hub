import { useMemo } from "react";
import { Calendar } from "lucide-react";
import { loadSubjects } from "../data/loader";
import { readExams } from "../lib/storage";
import { daysUntil } from "../lib/dates";

interface ExamBannerProps {
  subjectId: string;
}

/**
 * Shows "Exam in N days" banner on a subject page when the subject has
 * at least one exam within 7 days (and >= 0, i.e. not past).
 * If multiple exams qualify, shows the nearest one only.
 * Returns null if no qualifying exam.
 */
export function ExamBanner({ subjectId }: ExamBannerProps) {
  const nearest = useMemo(() => {
    const subjects = loadSubjects();
    const exams = readExams(subjects);
    const qualifying = exams
      .filter(
        (e) =>
          e.subjectId === subjectId &&
          daysUntil(e.date) >= 0 &&
          daysUntil(e.date) <= 7
      )
      .sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
    return qualifying.length > 0 ? qualifying[0] : null;
  }, [subjectId]);

  if (!nearest) return null;

  const days = daysUntil(nearest.date);
  let text: string;
  if (days === 0) text = "Exam Today";
  else if (days === 1) text = "Exam Tomorrow";
  else text = `Exam in ${days} days`;

  return (
    <div className="flex items-center gap-3 px-4 py-3 mb-6 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 rounded-[var(--radius-base)]">
      <Calendar size={18} className="text-[var(--color-accent)] shrink-0" />
      <span className="font-semibold text-[var(--color-accent)] text-[var(--text-sm-fluid)]">
        {text}
      </span>
      <span className="text-[var(--color-muted)] text-[var(--text-sm-fluid)]">
        — {nearest.label}
      </span>
    </div>
  );
}

/**
 * Returns whether the subject has an upcoming exam within 7 days.
 * Used by SubjectPage to decide whether to reorder sections.
 */
export function useExamMode(subjectId: string): boolean {
  return useMemo(() => {
    const subjects = loadSubjects();
    const exams = readExams(subjects);
    return exams.some(
      (e) =>
        e.subjectId === subjectId &&
        daysUntil(e.date) >= 0 &&
        daysUntil(e.date) <= 7
    );
  }, [subjectId]);
}
