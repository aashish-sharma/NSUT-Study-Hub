import type { Link as LinkType } from "../data/schema";
import { SourceIcon } from "./SourceIcon";
import { Badge } from "./Badge";

interface LinkRowProps {
  link: LinkType;
}

export function LinkRow({ link }: LinkRowProps) {
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

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center min-h-[48px] px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] hover:bg-[var(--color-border)] transition-[background-color] duration-[150ms] text-[var(--color-text)] -mt-[1px] first:mt-0"
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
      
      <div className="shrink-0 text-[var(--text-xs-fluid)] text-[var(--color-muted)] ml-auto">
        {sourceText}
      </div>
    </a>
  );
}
