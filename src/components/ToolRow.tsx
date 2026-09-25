import { Link } from "react-router";

interface ToolRowProps {
  to: string;
  title: string;
  description: string;
}

/**
 * Row component for the /tools index page.
 * Mirrors SubjectRow's visual style exactly: surface bg, border,
 * rounded corners, hover bg transition. Only the data differs.
 */
export function ToolRow({ to, title, description }: ToolRowProps) {
  return (
    <Link
      to={to}
      className="block w-full min-h-[48px] py-3 px-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] hover:bg-[var(--color-border)] transition-[background-color] duration-[150ms] text-left"
    >
      <div className="flex flex-col justify-center h-full gap-1">
        <span className="font-medium text-[var(--color-text)] text-[var(--text-base-fluid)] leading-tight">
          {title}
        </span>
        <span className="text-[var(--color-muted)] text-[var(--text-sm-fluid)] leading-tight">
          {description}
        </span>
      </div>
    </Link>
  );
}
