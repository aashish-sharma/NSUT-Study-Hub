import clsx from "clsx";

interface Section {
  id: string;
  label: string;
}

interface SectionNavProps {
  sections: Section[];
  activeId: string;
}

export function SectionNav({ sections, activeId }: SectionNavProps) {
  if (sections.length === 0) return null;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav 
      className="sticky top-[48px] z-30 bg-[var(--color-bg)]/95 backdrop-blur-sm pt-4 pb-4 border-b border-[var(--color-border)] min-[900px]:border-none min-[900px]:pt-8 min-[900px]:pb-0 min-[900px]:bg-transparent min-[900px]:backdrop-blur-none"
      aria-label="Table of contents"
    >
      <div className="relative">
        <div className="overflow-x-auto no-scrollbar edge-fade-right px-4 min-[900px]:px-0 min-[900px]:edge-fade-none min-[900px]:overflow-visible">
          <ul className="flex items-center gap-2 min-[900px]:flex-col min-[900px]:items-start min-[900px]:gap-1 w-max min-[900px]:w-full pr-8 min-[900px]:pr-0">
            {sections.map((sec) => {
              const isActive = activeId === sec.id;
              return (
                <li key={sec.id} className="min-[900px]:w-full">
                  <button
                    onClick={() => scrollTo(sec.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={clsx(
                      "px-4 py-2 min-[900px]:px-3 min-[900px]:py-2 text-[var(--text-sm-fluid)] min-[900px]:text-[var(--text-base-fluid)] font-medium rounded-full min-[900px]:rounded-[var(--radius-base)] transition-colors duration-[150ms] whitespace-nowrap min-[900px]:w-full min-[900px]:text-left min-[900px]:whitespace-normal",
                      isActive
                        ? "bg-[var(--color-accent)] text-[var(--color-surface)] dark:text-[var(--color-bg)]"
                        : "bg-[var(--color-surface)] min-[900px]:bg-transparent border border-[var(--color-border)] min-[900px]:border-transparent text-[var(--color-text)] hover:bg-[var(--color-border)] min-[900px]:hover:bg-[var(--color-border)]/50"
                    )}
                  >
                    {sec.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
