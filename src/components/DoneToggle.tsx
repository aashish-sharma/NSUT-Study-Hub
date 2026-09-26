import { Check } from "lucide-react";
import { useRef } from "react";

interface DoneToggleProps {
  isDone: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
}

/* ------------------------------------------------------------------ *
 * Visually-hidden styles applied inline so we never depend on        *
 * Tailwind generating `sr-only`.  Keeps the native checkbox in the   *
 * DOM for screen-readers while rendering a custom visual square.     *
 * ------------------------------------------------------------------ */
const srOnlyStyle: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
};

export function DoneToggle({ isDone, onToggle, className }: DoneToggleProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isDone}
      aria-label={isDone ? "Mark as undone" : "Mark as done"}
      className={[
        "flex items-center justify-center",
        "min-w-[44px] min-h-[44px]",
        "rounded-[var(--radius-base)] cursor-pointer",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
        className ?? "",
      ].join(" ")}
    >
      {/* Hidden native checkbox for assistive tech */}
      <input
        ref={inputRef}
        type="checkbox"
        checked={isDone}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
        style={srOnlyStyle}
      />

      {/* Custom visual checkbox */}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          borderRadius: 4,
          border: isDone ? "1px solid var(--color-success)" : "1px solid var(--color-border)",
          backgroundColor: isDone ? "var(--color-success)" : "transparent",
          transition: "background-color 150ms, border-color 150ms",
          flexShrink: 0,
        }}
      >
        {isDone && (
          <Check size={14} strokeWidth={1.75} color="white" />
        )}
      </span>
    </button>
  );
}
