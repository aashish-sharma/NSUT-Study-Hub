interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  if (total === 0) return null;
  const percentage = Math.max(0, Math.min(100, (completed / total) * 100));

  return (
    <div className="flex items-center gap-3 w-full mt-2">
      <div className="flex-1 h-1 bg-[var(--color-border)] rounded-[var(--radius-base)] overflow-hidden">
        <div 
          className="h-full bg-[var(--color-accent)] transition-all duration-300 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[var(--text-xs-fluid)] text-[var(--color-muted)] font-medium shrink-0">
        {completed} of {total} done
      </span>
    </div>
  );
}
