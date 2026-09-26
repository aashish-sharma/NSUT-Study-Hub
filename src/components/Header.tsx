import { Link, useLocation, useNavigate } from "react-router";
import { ArrowLeft, User, ChevronDown } from "lucide-react";
import { SITE } from "../config/site";
import { ThemeToggle } from "./ThemeToggle";
import { useEffect, useState, useRef } from "react";
import { storage } from "../lib/storage";
import { NameDialog } from "./NameDialog";
import clsx from "clsx";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === "/";
  const isSubjects = location.pathname === "/subjects";
  const showBack = !isLanding && !isSubjects;

  const [firstName, setFirstName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const loadName = () => {
      const state = storage.read();
      setFirstName(state.user?.firstName || null);
    };
    loadName();

    const handleUpdate = () => loadName();
    window.addEventListener("studyhub:storage-update", handleUpdate);
    return () => window.removeEventListener("studyhub:storage-update", handleUpdate);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all your saved data? This cannot be undone.")) {
      storage.clear();
      setMenuOpen(false);
      navigate("/");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-[48px] bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-border)]">
        <div className="max-w-[1120px] mx-auto h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <Link
                to="/subjects"
                className="p-1 -ml-1 rounded-[var(--radius-base)] hover:bg-[var(--color-border)] text-[var(--color-text)] flex items-center justify-center min-w-[44px] min-h-[44px]"
                aria-label="Back to subjects"
              >
                <ArrowLeft size={20} strokeWidth={1.75} />
              </Link>
            )}
            
            <Link to="/" className="text-[13px] font-semibold text-[var(--color-text)] tracking-wide flex items-center min-h-[44px]">
              {SITE.name}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/exams"
              className="text-[var(--text-sm-fluid)] font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors flex items-center min-h-[44px]"
            >
              Exams
            </Link>
            <Link
              to="/tools"
              className="text-[var(--text-sm-fluid)] font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors flex items-center min-h-[44px]"
            >
              Tools
            </Link>
            {firstName && (
              <div className="relative" ref={menuRef}>
                <button
                  ref={buttonRef}
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 text-[var(--text-sm-fluid)] font-medium rounded-[var(--radius-base)] transition-colors duration-[150ms] min-h-[44px]",
                    menuOpen ? "bg-[var(--color-border)] text-[var(--color-text)]" : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]"
                  )}
                >
                  <User size={16} strokeWidth={2} />
                  <span className="truncate max-w-[100px]">Hi, {firstName}!</span>
                  <ChevronDown size={14} strokeWidth={2} className={clsx("transition-transform duration-200", menuOpen && "rotate-180")} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] shadow-lg py-1 z-50">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setDialogOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-[var(--text-sm-fluid)] text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
                    >
                      Change name
                    </button>
                    <button
                      onClick={handleClearData}
                      className="w-full text-left px-4 py-2 text-[var(--text-sm-fluid)] text-[var(--color-badge-imp)] hover:bg-[var(--color-bg)] transition-colors"
                    >
                      Clear my data
                    </button>
                  </div>
                )}
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <NameDialog 
        isOpen={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        onSaved={() => {
          setDialogOpen(false);
          buttonRef.current?.focus();
        }}
      />
    </>
  );
}
