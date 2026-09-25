import clsx from "clsx";

export function Badge({ type }: { type: "preferred" | "most_important" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-[var(--radius-full)] text-[var(--text-xs)] font-medium whitespace-nowrap",
        type === "preferred"
          ? "border border-[var(--color-accent)] text-[var(--color-accent)]"
          : "bg-[var(--color-badge-imp)] text-[var(--color-surface)] dark:text-[var(--color-bg)]"
      )}
    >
      {type === "preferred" ? "Preferred" : "Most Important"}
    </span>
  );
}
