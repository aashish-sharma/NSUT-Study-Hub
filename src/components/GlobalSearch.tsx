import { useEffect, useState, useRef, useMemo } from "react";
import { Search, X } from "lucide-react";
import { loadSubjects } from "../data/loader";
import Fuse from "fuse.js";
import { useNavigate } from "react-router";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const subjects = useMemo(() => loadSubjects(), []);
  
  const searchData = useMemo(() => {
    return subjects.flatMap(s => [
      { type: "subject" as const, subjectId: s.id, name: s.name, label: s.name, url: `/subject/${s.id}` },
      ...s.links.map(l => ({
        type: "link" as const,
        subjectId: s.id,
        name: s.name,
        label: l.label,
        category: l.category,
        url: `/subject/${s.id}`
      }))
    ]);
  }, [subjects]);

  const fuse = useMemo(() => {
    return new Fuse(searchData, {
      keys: ["name", "label"],
      threshold: 0.3
    });
  }, [searchData]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).slice(0, 10).map(r => r.item);
  }, [query, fuse]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !isOpen) {
        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA"
        ) return;
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const closeAndNavigate = (url: string) => {
    setIsOpen(false);
    setQuery("");
    navigate(url);
  };

  return (
    <div className="relative flex items-center h-full" ref={containerRef}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[var(--text-sm-fluid)] font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] rounded-[var(--radius-base)] transition-colors min-h-[44px]"
          aria-label="Search"
        >
          <Search size={16} strokeWidth={2} />
          <span className="hidden lg:inline">Search</span>
          <span className="hidden lg:inline text-[10px] bg-[var(--color-border)] px-1.5 rounded text-[var(--color-muted)] font-mono ml-1">/</span>
        </button>
      ) : (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-[var(--color-surface)] border border-[var(--color-accent)] rounded-[var(--radius-base)] w-[260px] sm:w-[320px] shadow-sm z-50">
          <Search size={16} className="text-[var(--color-muted)] ml-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search resources..."
            className="w-full bg-transparent border-none outline-none text-[var(--text-sm-fluid)] text-[var(--color-text)] px-2 py-2 min-h-[44px]"
          />
          <button
            onClick={() => { setIsOpen(false); setQuery(""); }}
            className="p-2 text-[var(--color-muted)] hover:text-[var(--color-text)] shrink-0 focus-visible:outline-none"
          >
            <X size={16} />
          </button>
          
          {query.trim() && (
            <div className="absolute top-full right-0 mt-2 w-full max-h-[400px] overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] shadow-lg py-2">
              {results.length > 0 ? (
                results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => closeAndNavigate(r.url)}
                    className="w-full text-left px-4 py-3 hover:bg-[var(--color-bg)] transition-colors border-b border-[var(--color-border)] last:border-0"
                  >
                    <div className="text-[var(--text-sm-fluid)] font-medium text-[var(--color-text)] truncate">
                      {r.type === "subject" ? r.name : r.label}
                    </div>
                    <div className="text-[var(--text-xs-fluid)] text-[var(--color-muted)] mt-1 flex items-center gap-1.5">
                      <span className="truncate">{r.name}</span>
                      {r.type === "link" && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-[var(--color-border)] shrink-0" />
                          <span className="capitalize">{r.category}</span>
                        </>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-center text-[var(--text-sm-fluid)] text-[var(--color-muted)]">
                  No results for "{query}".
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
