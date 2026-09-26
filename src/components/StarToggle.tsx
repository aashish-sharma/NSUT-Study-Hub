import { Star } from "lucide-react";
import clsx from "clsx";

interface StarToggleProps {
  isPinned: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
}

export function StarToggle({ isPinned, onToggle, className }: StarToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={isPinned}
      aria-label={isPinned ? "Unpin subject" : "Pin subject"}
      className={clsx(
        "flex items-center justify-center min-w-[44px] min-h-[44px] rounded-[var(--radius-base)] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
        isPinned ? "text-yellow-500 hover:bg-yellow-500/10" : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]",
        className
      )}
    >
      <Star size={20} strokeWidth={isPinned ? 2.5 : 2} className={clsx("transition-transform duration-200", isPinned && "fill-current")} />
    </button>
  );
}
