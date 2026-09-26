import { useState, useMemo, useEffect } from "react";
import { loadSubjects } from "../data/loader";
import { SearchInput } from "../components/SearchInput";
import { SubjectRow } from "../components/SubjectRow";
import { ExamStrip } from "../components/ExamStrip";
import { storage } from "../lib/storage";

export function SubjectsPage() {
  const [search, setSearch] = useState("");
  const subjects = useMemo(() => {
    try {
      const data = loadSubjects();
      // Sort by index_no
      return data.sort((a, b) => a.index_no - b.index_no);
    } catch (e) {
      console.error(e);
      return [];
    }
  }, []);

  const filteredSubjects = useMemo(() => {
    if (!search.trim()) return subjects;
    const lowerSearch = search.toLowerCase();
    return subjects.filter((s) => s.name.toLowerCase().includes(lowerSearch));
  }, [search, subjects]);

  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setPinnedIds(storage.readPinned(subjects));
    setRecentIds(storage.readRecents(subjects));

    const handleUpdate = () => {
      setPinnedIds(storage.readPinned(subjects));
      setRecentIds(storage.readRecents(subjects));
    };
    window.addEventListener("studyhub:storage-update", handleUpdate);
    return () => window.removeEventListener("studyhub:storage-update", handleUpdate);
  }, [subjects]);

  useEffect(() => {
    document.title = "Study Hub | NSUT First Year Resources";
  }, []);

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = pinnedIds.includes(id) 
      ? pinnedIds.filter(p => p !== id) 
      : [...pinnedIds, id];
    storage.writePinned(next);
  };

  const pinnedSubjects = useMemo(() => 
    filteredSubjects.filter((s) => pinnedIds.includes(s.id)),
  [filteredSubjects, pinnedIds]);

  const recentSubjects = useMemo(() => 
    filteredSubjects.filter((s) => recentIds.includes(s.id) && !pinnedIds.includes(s.id)),
  [filteredSubjects, recentIds, pinnedIds]);

  return (
    <main id="main-content" className="max-w-[1120px] mx-auto px-4 py-8">
      <ExamStrip />
      <SearchInput value={search} onChange={setSearch} />
      
      <div className="mb-4 text-[var(--color-muted)] text-[var(--text-sm-fluid)] font-medium px-1">
        {filteredSubjects.length} {filteredSubjects.length === 1 ? "subject" : "subjects"}
      </div>

      <div className="flex flex-col gap-8">
        {pinnedSubjects.length > 0 && (
          <section>
            <h2 className="text-[var(--text-lg-fluid)] font-semibold text-[var(--color-text)] mb-4 px-1">Pinned</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pinnedSubjects.map((subject) => (
                <SubjectRow key={subject.id} subject={subject} isPinned={true} onTogglePin={(e) => handleTogglePin(subject.id, e)} />
              ))}
            </div>
          </section>
        )}

        {recentSubjects.length > 0 && (
          <section>
            <h2 className="text-[var(--text-lg-fluid)] font-semibold text-[var(--color-text)] mb-4 px-1">Continue where you left off</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {recentSubjects.map((subject) => (
                <SubjectRow key={subject.id} subject={subject} isPinned={false} onTogglePin={(e) => handleTogglePin(subject.id, e)} />
              ))}
            </div>
          </section>
        )}

        <section>
          {(pinnedSubjects.length > 0 || recentSubjects.length > 0) && (
            <h2 className="text-[var(--text-lg-fluid)] font-semibold text-[var(--color-text)] mb-4 px-1">All subjects</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSubjects.map((subject) => (
              <SubjectRow key={subject.id} subject={subject} isPinned={pinnedIds.includes(subject.id)} onTogglePin={(e) => handleTogglePin(subject.id, e)} />
            ))}
          </div>
        </section>
      </div>
      
      {filteredSubjects.length === 0 && (
        <div className="text-center py-12 text-[var(--color-muted)]">
          No subjects found matching "{search}".
        </div>
      )}
    </main>
  );
}
