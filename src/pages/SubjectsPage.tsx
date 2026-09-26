import { useState, useMemo, useEffect } from "react";
import { loadSubjects } from "../data/loader";
import { SearchInput } from "../components/SearchInput";
import { SubjectRow } from "../components/SubjectRow";
import { ExamStrip } from "../components/ExamStrip";

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

  useEffect(() => {
    document.title = "Study Hub | NSUT First Year Resources";
  }, []);

  return (
    <main id="main-content" className="max-w-[1120px] mx-auto px-4 py-8">
      <ExamStrip />
      <SearchInput value={search} onChange={setSearch} />
      
      <div className="mb-4 text-[var(--color-muted)] text-[var(--text-sm-fluid)] font-medium px-1">
        {filteredSubjects.length} {filteredSubjects.length === 1 ? "subject" : "subjects"}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSubjects.map((subject) => (
          <SubjectRow key={subject.id} subject={subject} />
        ))}
      </div>
      
      {filteredSubjects.length === 0 && (
        <div className="text-center py-12 text-[var(--color-muted)]">
          No subjects found matching "{search}".
        </div>
      )}
    </main>
  );
}
