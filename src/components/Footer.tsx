import { SITE } from "../config/site";

export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--color-border)] py-6 mt-12 text-center text-[var(--color-muted)] text-[var(--text-sm)]">
      <div className="max-w-[1120px] mx-auto px-4">
        <p>{SITE.footer.credit}</p>
        
        {SITE.links.feedback && (
          <div className="mt-4">
            <a 
              href={SITE.links.feedback}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-[var(--radius-base)] border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-[background-color] duration-[150ms] text-[var(--color-text)]"
            >
              Report broken link
            </a>
          </div>
        )}
      </div>
    </footer>
  );
}
