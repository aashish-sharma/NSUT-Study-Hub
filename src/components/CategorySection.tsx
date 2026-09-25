import type { Link } from "../data/schema";
import { LinkRow } from "./LinkRow";
import { UnitGroup } from "./UnitGroup";

interface CategorySectionProps {
  id: string;
  title: string;
  links: Link[];
  grouping?: boolean;
  gaps?: string[];
}

export function CategorySection({ id, title, links, grouping, gaps = [] }: CategorySectionProps) {
  if (links.length === 0 && gaps.length === 0) return null;

  return (
    <section id={id} className="pt-8 mb-8 scroll-mt-24 lg:scroll-mt-8">
      <h2 className="text-[var(--text-lg-fluid)] font-semibold text-[var(--color-text)] mb-4">
        {title}
      </h2>
      
      {links.length > 0 && (
        <div className="mb-6">
          {grouping ? (
            // Group by unit
            (() => {
              const byUnit = links.reduce((acc, link) => {
                const u = link.unit;
                const key = u === null ? "null" : u.toString();
                if (!acc[key]) acc[key] = { unit: u, links: [] };
                acc[key].links.push(link);
                return acc;
              }, {} as Record<string, { unit: number | null; links: Link[] }>);

              // Sort units: numbers 1-5 first, then null ("General")
              const sortedGroups = Object.values(byUnit).sort((a, b) => {
                if (a.unit === null && b.unit === null) return 0;
                if (a.unit === null) return 1;
                if (b.unit === null) return -1;
                return a.unit - b.unit;
              });

              return sortedGroups.map((g) => (
                <UnitGroup key={g.unit ?? "general"} unit={g.unit} links={g.links} />
              ));
            })()
          ) : (
            // Flat list
            <div className="flex flex-col">
              {links.map((link) => (
                <LinkRow key={link.url} link={link} />
              ))}
            </div>
          )}
        </div>
      )}

      {gaps.length > 0 && (
        <div className="mt-4">
          <p className="text-[var(--text-sm-fluid)] text-[var(--color-muted)] font-medium mb-2">
            Not available yet
          </p>
          <ul className="list-disc pl-5 text-[var(--color-muted)] text-[var(--text-sm-fluid)] space-y-1">
            {gaps.map((gap, i) => (
              <li key={i}>{gap}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
