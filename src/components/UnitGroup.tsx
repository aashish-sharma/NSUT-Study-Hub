import type { Link } from "../data/schema";
import { LinkRow } from "./LinkRow";

interface UnitGroupProps {
  unit: number | null;
  links: Link[];
}

export function UnitGroup({ unit, links }: UnitGroupProps) {
  const label = unit === null ? "General" : `Unit ${unit}`;

  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center gap-4 mb-3">
        <span className="text-[var(--text-sm-fluid)] font-medium text-[var(--color-muted)] shrink-0">
          {label}
        </span>
        <div className="h-[1px] w-full bg-[var(--color-border)]" />
      </div>
      <div className="flex flex-col">
        {links.map((link) => (
          <LinkRow key={link.url} link={link} />
        ))}
      </div>
    </div>
  );
}
