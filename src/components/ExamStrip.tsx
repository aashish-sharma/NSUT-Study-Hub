import { Calendar } from "lucide-react";

interface ExamStripProps {
  date: Date;
  label?: string;
}

export function ExamStrip({ date, label = "Exam" }: ExamStripProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let statusText = "";
  if (diffDays === 0) statusText = "Today";
  else if (diffDays === 1) statusText = "Tomorrow";
  else if (diffDays > 1) statusText = `in ${diffDays} days`;
  else statusText = "Past";

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] text-[var(--color-text)] w-full">
      <Calendar size={18} className="text-[var(--color-accent)] shrink-0" />
      <span className="font-medium text-[var(--text-sm-fluid)] flex-1">{label}</span>
      <span className="text-[var(--text-sm-fluid)] font-semibold bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 rounded-[var(--radius-full)] whitespace-nowrap">
        {statusText}
      </span>
    </div>
  );
}
