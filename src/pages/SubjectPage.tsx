import { useMemo, useEffect } from "react";
import { useParams, Link } from "react-router";
import { loadSubjects } from "../data/loader";
import { CategorySection } from "../components/CategorySection";
import { SectionNav } from "../components/SectionNav";
import { useActiveSection } from "../hooks/useActiveSection";
import { ExamBanner, useExamMode } from "../components/ExamBanner";
import knownGaps from "../data/known-gaps.json";

const CATEGORIES = [
  { id: "syllabus", label: "Syllabus", grouping: false },
  { id: "notes", label: "Notes", grouping: true },
  { id: "handwritten", label: "Handwritten notes", grouping: false },
  { id: "playlist", label: "Playlists", grouping: true },
  { id: "tutorial", label: "Tutorials", grouping: false },
  { id: "assignment", label: "Assignments", grouping: false },
  { id: "practical", label: "Practical", grouping: false },
  { id: "book", label: "Books", grouping: false },
  { id: "revision", label: "Revision", grouping: false },
  { id: "extra", label: "Extra", grouping: false },
  { id: "pyq", label: "PYQs", grouping: false },
  { id: "other", label: "More", grouping: false },
];

export function SubjectPage() {
  const { id } = useParams<{ id: string }>();

  const subject = useMemo(() => {
    try {
      return loadSubjects().find((s) => s.id === id);
    } catch {
      return undefined;
    }
  }, [id]);

  useEffect(() => {
    if (subject) {
      document.title = `${subject.name} | Study Hub`;
    } else {
      document.title = "Subject Not Found | Study Hub";
    }
  }, [subject]);

  const examMode = useExamMode(subject?.id ?? "");

  const sectionsData = useMemo(() => {
    if (!subject) return [];
    
    const sections = CATEGORIES.map((cat) => {
      const links = subject.links.filter((l) => l.category === cat.id);
      return { ...cat, links };
    }).filter((cat) => cat.links.length > 0);

    // Exam mode: reorder so PYQs and Revision appear first
    if (examMode) {
      const priority = new Set(["pyq", "revision"]);
      const prioritySections = sections.filter((s) => priority.has(s.id));
      const rest = sections.filter((s) => !priority.has(s.id));
      return [...prioritySections, ...rest];
    }

    return sections;
  }, [subject, examMode]);

  const activeId = useActiveSection(sectionsData.map((s) => s.id));

  if (!subject) {
    return (
      <main id="main-content" className="max-w-[1120px] mx-auto px-4 py-16 text-center">
        <h1 className="text-[var(--text-xl-fluid)] font-semibold mb-4">Subject Not Found</h1>
        <p className="text-[var(--color-muted)] mb-8">The subject you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="text-[var(--color-accent)] hover:underline">
          Return to home
        </Link>
      </main>
    );
  }

  const subjectGaps = (knownGaps as Record<string, string[]>)[subject.id] || [];

  return (
    <main id="main-content" className="max-w-[1120px] mx-auto min-h-screen">
      <div className="flex flex-col min-[900px]:flex-row min-[900px]:items-start">
        {/* Left rail on desktop, sticky horizontal scroll on mobile */}
        <div className="w-full min-[900px]:w-[240px] min-[900px]:shrink-0 min-[900px]:sticky min-[900px]:top-[48px] min-[900px]:h-[calc(100vh-48px)] min-[900px]:overflow-y-auto no-scrollbar">
          <SectionNav sections={sectionsData} activeId={activeId} />
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4 py-6 min-[900px]:py-8 min-[900px]:px-8 min-w-0">
          <h1 className="text-[var(--text-xl-fluid)] font-bold text-[var(--color-text)] mb-6">
            {subject.name}
          </h1>

          {examMode && <ExamBanner subjectId={subject.id} />}

          {subject.notes.length > 0 && (
            <div className="bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 rounded-[var(--radius-base)] p-4 mb-8">
              {subject.notes.map((note, i) => (
                <p key={i} className="text-[var(--color-text)] text-[var(--text-sm-fluid)] leading-relaxed mb-2 last:mb-0">
                  {note}
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-col">
            {sectionsData.map((sec) => (
              <CategorySection
                key={sec.id}
                id={sec.id}
                title={sec.label}
                links={sec.links}
                grouping={sec.grouping}
              />
            ))}

            {subjectGaps.length > 0 && (
              <section className="pt-8 mb-8 border-t border-[var(--color-border)] mt-8">
                <p className="text-[var(--text-sm-fluid)] text-[var(--color-muted)] font-medium mb-3">
                  Not available yet
                </p>
                <ul className="list-disc pl-5 text-[var(--color-muted)] text-[var(--text-sm-fluid)] space-y-1.5">
                  {subjectGaps.map((gap, i) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
