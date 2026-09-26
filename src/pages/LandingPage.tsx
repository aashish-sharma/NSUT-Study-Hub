import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { SITE } from "../config/site";
import { loadSubjects } from "../data/loader";
import { storage } from "../lib/storage";
import { NameDialog } from "../components/NameDialog";
import { SubjectRow } from "../components/SubjectRow";
import { ExamStrip } from "../components/ExamStrip";
import { ThemeToggle } from "../components/ThemeToggle";
import type { Subject } from "../data/schema";

export function LandingPage() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  const { stats, previewSubject } = useMemo(() => {
    let subs: Subject[] = [];
    try {
      subs = loadSubjects();
    } catch (e) {
      console.error(e);
    }

    let playlists = 0;
    let pyqs = 0;
    let totalLinks = 0;

    subs.forEach(s => {
      totalLinks += s.links.length;
      playlists += s.links.filter(l => l.category === "playlist").length;
      pyqs += s.links.filter(l => l.category === "pyq").length;
    });

    return {
      stats: {
        subjects: subs.length,
        playlists,
        pyqs,
        totalLinks
      },
      previewSubject: subs[0] || null
    };
  }, []);

  useEffect(() => {
    document.title = `${SITE.name} | ${SITE.tagline}`;
    setHasUser(storage.hasUserCompletedOnboarding());
    const handleUpdate = () => setHasUser(storage.hasUserCompletedOnboarding());
    window.addEventListener("studyhub:storage-update", handleUpdate);
    return () => window.removeEventListener("studyhub:storage-update", handleUpdate);
  }, []);

  const handleCTA = () => {
    if (storage.hasUserCompletedOnboarding()) {
      navigate("/subjects");
    } else {
      setDialogOpen(true);
    }
  };

  const previewDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d;
  }, []);

  return (
    <div className="landing flex-1 flex flex-col w-full min-w-0">
      
      {/* Custom Landing Header */}
      <header className="w-full h-[48px] border-b border-[var(--l-border)] bg-[var(--l-bg)]">
        <div className="max-w-[1120px] mx-auto h-full px-4 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[var(--l-text)] tracking-wide">
            {SITE.name}
          </span>
          <div className="flex items-center gap-4">
            <Link to="/subjects" className="l-link text-[var(--text-sm-fluid)] font-medium hover:text-[var(--l-text)] transition-colors">
              Subjects
            </Link>
            <Link to="/tools" className="l-link text-[var(--text-sm-fluid)] font-medium hover:text-[var(--l-text)] transition-colors">
              Tools
            </Link>
            <ThemeToggle />
            <button
              onClick={handleCTA}
              className="l-btn px-3 py-1.5 text-[var(--text-sm-fluid)]"
            >
              <span className="l-btn__label">Start studying</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main id="main-content" className="flex-1 flex flex-col items-center w-full">
        <section className="w-full max-w-[1120px] mx-auto px-4 py-16 md:py-24 lg:py-32 flex flex-col lg:flex-row gap-12 lg:gap-8 items-center lg:items-start text-left">
          <div className="flex-1 w-full flex flex-col items-start max-w-2xl">
            <h1 className="text-[clamp(2.5rem,5vw+1rem,4rem)] font-bold tracking-tight text-[var(--l-text)] leading-[1.15] mb-6">
              Stop hunting for notes. <br />
              <span className="bg-[var(--l-lime)] text-[#14231A] px-2 rounded-sm box-decoration-clone leading-snug">
                Start studying.
              </span>
            </h1>
            <p className="text-[var(--text-lg-fluid)] text-[var(--l-muted)] leading-relaxed mb-8 max-w-prose">
              {SITE.landing.hero.subline}
            </p>
            <button
              onClick={handleCTA}
              className="l-btn px-8 py-4 text-[var(--text-lg-fluid)]"
            >
              <span className="l-btn__label">{hasUser ? SITE.landing.hero.ctaStored : SITE.landing.hero.cta}</span>
            </button>
          </div>

          {/* Live Preview */}
          {previewSubject && (
            <div className="w-full max-w-sm lg:w-[400px] shrink-0 relative mt-8 lg:mt-0 z-10">
              <div className="absolute inset-0 bg-[var(--l-lime)] translate-x-3 translate-y-3 rounded-[var(--radius-base)] -z-10 hidden sm:block border border-transparent"></div>
              <div className="bg-[var(--l-surface)] border border-[var(--l-border)] p-6 rounded-[var(--radius-base)] relative z-10 flex flex-col gap-6">
                <div className="absolute top-4 right-4 bg-[var(--l-btn)] text-[var(--l-btn-text)] text-xs font-bold px-3 py-1 rounded-[var(--radius-full)]">
                  Example
                </div>
                
                <div>
                  <div className="text-[var(--text-sm-fluid)] font-medium text-[var(--l-muted)] mb-2 mt-6">
                    Exam countdown
                  </div>
                  <ExamStrip date={previewDate} label={`${previewSubject.name} Exam`} />
                </div>
                
                <div>
                  <div className="text-[var(--text-sm-fluid)] font-medium text-[var(--l-muted)] mb-2">
                    Pinned subject
                  </div>
                  <SubjectRow 
                    subject={previewSubject} 
                    isPinned={true} 
                    onTogglePin={(e) => { e.preventDefault(); e.stopPropagation(); }} 
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Stats Strip */}
        <section className="w-full border-y border-[var(--l-border)] bg-[var(--l-surface)]">
          <div className="max-w-[1120px] mx-auto px-4 py-8 md:py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-[var(--l-border)]">
              <div className="flex flex-col">
                <span className="text-[clamp(2rem,3vw+1rem,3rem)] font-bold text-[var(--l-text)]">{stats.subjects}</span>
                <span className="text-[var(--text-sm-fluid)] text-[var(--l-muted)] font-medium">Subjects</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[clamp(2rem,3vw+1rem,3rem)] font-bold text-[var(--l-text)]">{stats.playlists}</span>
                <span className="text-[var(--text-sm-fluid)] text-[var(--l-muted)] font-medium">Playlists</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[clamp(2rem,3vw+1rem,3rem)] font-bold text-[var(--l-text)]">{stats.pyqs}</span>
                <span className="text-[var(--text-sm-fluid)] text-[var(--l-muted)] font-medium">PYQ links</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[clamp(2rem,3vw+1rem,3rem)] font-bold text-[var(--l-text)]">{stats.totalLinks}</span>
                <span className="text-[var(--text-sm-fluid)] text-[var(--l-muted)] font-medium">Total links</span>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="w-full max-w-[1120px] mx-auto px-4 py-16 md:py-24 text-left bg-[var(--l-bg)] border-b border-[var(--l-border)]">
          <h2 className="text-[clamp(2rem,3vw+1rem,2.5rem)] font-bold text-[var(--l-text)] mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SITE.landing.howItWorks.map((step, i) => (
              <div key={i} className="flex flex-col items-start bg-[var(--l-surface)] border border-[var(--l-border)] rounded-xl p-6 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[var(--l-accent)]/10 text-[var(--l-accent)] flex items-center justify-center font-bold text-lg mb-6">
                  {i + 1}
                </div>
                <h3 className="text-[var(--text-lg-fluid)] font-semibold text-[var(--l-text)] mb-3">{step.title}</h3>
                <p className="text-[var(--l-muted)] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="landing-lime-section w-full bg-[var(--l-lime)] text-[#14231A] py-16 md:py-24 text-center px-4">
          <h2 className="text-[clamp(2rem,3vw+1rem,2.5rem)] font-bold mb-8">
            {SITE.landing.cta}
          </h2>
          <button
            onClick={handleCTA}
            className="l-btn px-8 py-4 text-[var(--text-lg-fluid)]"
          >
            <span className="l-btn__label">{hasUser ? SITE.landing.hero.ctaStored : SITE.landing.hero.cta}</span>
          </button>
        </section>
      </main>

      {/* Landing Footer */}
      <footer className="w-full border-t border-[var(--l-border)] py-6 bg-[var(--l-surface)] text-center text-[var(--l-muted)] text-[var(--text-sm-fluid)] mt-auto">
        <div className="max-w-[1120px] mx-auto px-4">
          <p>{SITE.footer.credit} © {new Date().getFullYear()}</p>
        </div>
      </footer>

      <NameDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          setDialogOpen(false);
          navigate("/subjects");
        }}
      />
    </div>
  );
}
