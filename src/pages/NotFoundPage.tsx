import { Link } from "react-router";
import { useEffect } from "react";

export function NotFoundPage() {
  useEffect(() => {
    document.title = "Page Not Found | Study Hub";
  }, []);

  return (
    <main id="main-content" className="max-w-[1120px] mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-6xl font-bold text-[var(--color-text)] mb-4">404</h1>
      <h2 className="text-[var(--text-xl-fluid)] font-semibold text-[var(--color-text)] mb-2">Page Not Found</h2>
      <p className="text-[var(--color-muted)] mb-8 max-w-md text-center">
        The page you are looking for does not exist, has been removed, or is temporarily unavailable.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-[var(--color-accent)] text-[var(--color-surface)] dark:text-[var(--color-bg)] rounded-[var(--radius-base)] font-medium hover-opacity transition-opacity duration-[150ms]"
      >
        Return to Home
      </Link>
    </main>
  );
}
