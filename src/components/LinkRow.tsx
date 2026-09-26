import type { Link as LinkType } from "../data/schema";
import { SourceIcon } from "./SourceIcon";
import { Badge } from "./Badge";
import { BookmarkToggle } from "./BookmarkToggle";
import { DoneToggle } from "./DoneToggle";
import { useState, useEffect } from "react";
import { storage } from "../lib/storage";
import { loadSubjects } from "../data/loader";

interface LinkRowProps {
  link: LinkType;
  subjectId: string;
}

export function LinkRow({ link, subjectId }: LinkRowProps) {
  const isPreferred = link.tags.includes("preferred");
  const isMostImportant = link.tags.includes("most_important");

  // Determine source text based on source
  let sourceText = "Link";
  switch (link.source) {
    case "drive_file": sourceText = "Drive file"; break;
    case "drive_folder": sourceText = "Drive folder"; break;
    case "youtube": sourceText = "YouTube"; break;
    case "google_doc": sourceText = "Google Doc"; break;
  }

  const [isSaved, setIsSaved] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const checkState = () => {
      const allSubjects = loadSubjects();
      const saved = storage.readSavedLinks(allSubjects);
      const completed = storage.readCompletedLinks(allSubjects);
      setIsSaved(saved.some(s => s.subjectId === subjectId && s.url === link.url));
      setIsDone(completed.some(s => s.subjectId === subjectId && s.url === link.url));
    };
    checkState();
    window.addEventListener("studyhub:storage-update", checkState);
    return () => window.removeEventListener("studyhub:storage-update", checkState);
  }, [subjectId, link.url]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const allSubjects = loadSubjects();
    const saved = storage.readSavedLinks(allSubjects);
    const exists = saved.some(s => s.subjectId === subjectId && s.url === link.url);
    const next = exists 
      ? saved.filter(s => !(s.subjectId === subjectId && s.url === link.url))
      : [...saved, { subjectId, url: link.url }];
    storage.writeSavedLinks(next);
  };

  const handleToggleDone = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const allSubjects = loadSubjects();
    const completed = storage.readCompletedLinks(allSubjects);
    const exists = completed.some(s => s.subjectId === subjectId && s.url === link.url);
    const next = exists 
      ? completed.filter(s => !(s.subjectId === subjectId && s.url === link.url))
      : [...completed, { subjectId, url: link.url }];
    storage.writeCompletedLinks(next);
  };

  return (
    <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] hover:bg-[var(--color-border)] transition-[background-color] duration-[150ms] -mt-[1px] first:mt-0 relative group">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center min-h-[48px] py-3 pl-4 pr-2 text-[var(--color-text)]"
      >
        <div className="flex items-center justify-center shrink-0 w-8 h-full mr-1 text-[var(--color-muted)]">
          <SourceIcon source={link.source} />
        </div>
        
        <div className="flex-1 flex flex-wrap items-center gap-2 min-w-0 pr-4">
          <span className="font-medium text-[var(--text-base-fluid)] leading-tight break-words">
            {link.label}
          </span>
          {isPreferred && <Badge type="preferred" />}
          {isMostImportant && <Badge type="most_important" />}
        </div>
        
        <div className="shrink-0 text-[var(--text-xs-fluid)] text-[var(--color-muted)]">
          {sourceText}
        </div>
      </a>
      <div className="flex items-center pr-1 shrink-0">
        <DoneToggle isDone={isDone} onToggle={handleToggleDone} />
        <BookmarkToggle isSaved={isSaved} onToggle={handleToggleSave} />
      </div>
    </div>
  );
}
