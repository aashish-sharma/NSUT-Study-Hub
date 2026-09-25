export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-[var(--color-surface)] text-[var(--color-text)] px-4 py-2 rounded-[var(--radius-base)] border border-[var(--color-border)] shadow-md"
    >
      Skip to content
    </a>
  );
}
