import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { GradeCalculator } from "../components/GradeCalculator";
import { toolsStorage, createEmptyRow } from "../lib/toolsStorage";
import type { GradeRowData } from "../lib/toolsStorage";
import { runFormulaChecks } from "../lib/devChecks";
import "./tools.css";

export function CgpaPage() {
  const [entries, setEntries] = useState<GradeRowData[]>(() => {
    const saved = toolsStorage.readCgpaEntries();
    return saved.length > 0 ? saved : [createEmptyRow()];
  });

  // Dev-only regression checks
  useEffect(() => {
    runFormulaChecks();
  }, []);

  useEffect(() => {
    document.title = "Study Hub | CGPA Calculator";
  }, []);

  // Persist on every change
  const handleChange = useCallback((updated: GradeRowData[]) => {
    setEntries(updated);
    toolsStorage.writeCgpaEntries(updated);
  }, []);

  // Check if the user has entered any data
  const hasData = entries.some(
    (e) => e.name.trim() !== "" || e.credits > 0,
  );

  const handleReset = () => {
    if (hasData) {
      if (!window.confirm("Clear all entries? This cannot be undone.")) return;
    }
    const fresh = [createEmptyRow()];
    setEntries(fresh);
    toolsStorage.writeCgpaEntries(fresh);
  };

  return (
    <main id="main-content" className="max-w-[700px] mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/tools"
        className="inline-flex items-center gap-1 text-[var(--color-muted)] text-[var(--text-sm-fluid)] font-medium mb-6 min-h-[44px] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        Back to tools
      </Link>

      <h1 className="text-[var(--text-xl-fluid)] font-semibold text-[var(--color-text)] mb-6">
        CGPA Calculator
      </h1>

      <GradeCalculator
        entries={entries}
        onChange={handleChange}
        resultLabel="CGPA"
      />

      {/* Reset */}
      <div className="mt-4">
        <button
          type="button"
          className="tools-btn tools-btn-outline"
          onClick={handleReset}
        >
          <RotateCcw size={16} strokeWidth={2} />
          Reset
        </button>
      </div>

      {/* Note */}
      <hr className="tools-divider" />
      <p className="tools-note">
        This uses the standard 10-point scale. Check your college's exact
        grading policy if it differs.
      </p>
    </main>
  );
}
