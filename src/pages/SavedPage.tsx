import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { storage } from "../lib/storage";
import { loadSubjects } from "../data/loader";
import { LinkRow } from "../components/LinkRow";
import { Bookmark } from "lucide-react";
import type { Subject, Link as LinkType } from "../data/schema";

export function SavedPage() {
  const subjects = useMemo(() => loadSubjects(), []);
  const [savedData, setSavedData] = useState<{ subject: Subject; link: LinkType }[]>([]);

  useEffect(() => {
    document.title = "Saved Links | Study Hub";
    const loadSaved = () => {
      const saved = storage.readSavedLinks(subjects);
      const data: { subject: Subject; link: LinkType }[] = [];
      
      saved.forEach(s => {
        const subject = subjects.find(sub => sub.id === s.subjectId);
        if (subject) {
          const link = subject.links.find(l => l.url === s.url);
          if (link) {
            data.push({ subject, link });
          }
        }
      });
      setSavedData(data);
    };

    loadSaved();
    window.addEventListener("studyhub:storage-update", loadSaved);
    return () => window.removeEventListener("studyhub:storage-update", loadSaved);
  }, [subjects]);

  const grouped = useMemo(() => {
    const groups: Record<string, { subject: Subject; links: LinkType[] }> = {};
    savedData.forEach(({ subject, link }) => {
      if (!groups[subject.id]) {
        groups[subject.id] = { subject, links: [] };
      }
      groups[subject.id].links.push(link);
    });
    return Object.values(groups).sort((a, b) => a.subject.index_no - b.subject.index_no);
  }, [savedData]);

  return (
    <main id="main-content" className="max-w-[1120px] mx-auto px-4 py-8 w-full">
      <h1 className="text-[var(--text-xl-fluid)] font-bold text-[var(--color-text)] mb-8">
        Saved Links
      </h1>

      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bookmark size={48} strokeWidth={1.5} className="text-[var(--color-muted)] mb-4" />
          <h2 className="text-[var(--text-lg-fluid)] font-medium text-[var(--color-text)] mb-2">
            No saved links yet
          </h2>
          <p className="text-[var(--color-muted)] text-[var(--text-sm-fluid)] max-w-sm">
            Click the bookmark icon on any resource to save it here for quick access.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {grouped.map(({ subject, links }) => (
            <section key={subject.id}>
              <Link 
                to={`/subject/${subject.id}`}
                className="inline-block text-[var(--text-lg-fluid)] font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors mb-4 px-1"
              >
                {subject.name}
              </Link>
              <div className="flex flex-col">
                {links.map(link => (
                  <LinkRow key={link.url} link={link} subjectId={subject.id} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
