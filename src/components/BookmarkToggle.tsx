import { Bookmark } from "lucide-react";
import clsx from "clsx";

interface BookmarkToggleProps {
  isSaved: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
}

export function BookmarkToggle({ isSaved, onToggle, className }: BookmarkToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove bookmark" : "Add bookmark"}
      className={clsx(
        "flex items-center justify-center min-w-[44px] min-h-[44px] rounded-[var(--radius-base)] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
        isSaved ? "text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10" : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]",
        className
      )}
    >
      <Bookmark size={20} strokeWidth={isSaved ? 2.5 : 2} className={clsx("transition-transform duration-200", isSaved && "fill-current")} />
    </button>
  );
}
