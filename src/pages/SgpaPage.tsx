import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router";
import { ArrowLeft, Save, Pencil, Trash2, X } from "lucide-react";
import { GradeCalculator } from "../components/GradeCalculator";
import { computeCgpa, computeRunningCgpa } from "../lib/gpa";
import type { SemesterRecord } from "../lib/gpa";
import { toolsStorage, createEmptyRow } from "../lib/toolsStorage";
import type { GradeRowData } from "../lib/toolsStorage";
import "./tools.css";

let _semIdCounter = 0;

export function SgpaPage() {
  const [entries, setEntries] = useState<GradeRowData[]>(() => {
    const saved = toolsStorage.readSgpaCurrent();
    return saved.length > 0 ? saved : [createEmptyRow()];
  });

  const [semesters, setSemesters] = useState<SemesterRecord[]>(() =>
    toolsStorage.readSgpaSemesters(),
  );

  const [semesterName, setSemesterName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Study Hub | SGPA Tracker";
  }, []);

  // Persist current entries on change
  const handleEntriesChange = useCallback((updated: GradeRowData[]) => {
    setEntries(updated);
    toolsStorage.writeSgpaCurrent(updated);
  }, []);

  // Running CGPA across all saved semesters
  const runningCgpa = useMemo(
    () => computeRunningCgpa(semesters),
    [semesters],
  );

  // Save / update semester
  const handleSave = () => {
    const name = semesterName.trim();
    if (!name) {
      window.alert("Please enter a semester name.");
      return;
    }

    const subjectEntries = entries.map(({ name, credits, grade }) => ({
      name,
      credits,
      grade,
    }));
    const result = computeCgpa(subjectEntries);
    if (!result) {
      window.alert("Add at least one subject with credits > 0.");
      return;
    }

    const record: SemesterRecord = {
      id: editingId ?? `sem-${Date.now()}-${_semIdCounter++}`,
      name,
      entries: subjectEntries,
      sgpa: result.cgpa,
      totalCredits: result.totalCredits,
      savedAt: new Date().toISOString(),
    };

    let updated: SemesterRecord[];
    if (editingId) {
      updated = semesters.map((s) => (s.id === editingId ? record : s));
    } else {
      updated = [...semesters, record];
    }

    setSemesters(updated);
    toolsStorage.writeSgpaSemesters(updated);

    // Reset calculator
    const fresh = [createEmptyRow()];
    setEntries(fresh);
    toolsStorage.writeSgpaCurrent(fresh);
    setSemesterName("");
    setEditingId(null);
  };

  // Edit a saved semester
  const handleEdit = (semester: SemesterRecord) => {
    const rows: GradeRowData[] = semester.entries.map((e) => ({
      id: `edit-${Date.now()}-${_semIdCounter++}`,
      name: e.name,
      credits: e.credits,
      grade: e.grade,
    }));
    setEntries(rows);
    toolsStorage.writeSgpaCurrent(rows);
    setSemesterName(semester.name);
    setEditingId(semester.id);
    // Scroll to top of calculator
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    const fresh = [createEmptyRow()];
    setEntries(fresh);
    toolsStorage.writeSgpaCurrent(fresh);
    setSemesterName("");
    setEditingId(null);
  };

  // Delete a saved semester
  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this semester? This cannot be undone.")) return;
    const updated = semesters.filter((s) => s.id !== id);
    setSemesters(updated);
    toolsStorage.writeSgpaSemesters(updated);
    // If we were editing the deleted semester, cancel
    if (editingId === id) handleCancelEdit();
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
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
        SGPA Tracker
      </h1>

      {/* Calculator */}
      <GradeCalculator
        entries={entries}
        onChange={handleEntriesChange}
        resultLabel="SGPA"
      />

      {/* Semester name + save */}
      <div className="mt-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="semester-name"
            className="block text-[var(--text-sm-fluid)] font-medium text-[var(--color-muted)] mb-1"
          >
            Semester name
          </label>
          <input
            id="semester-name"
            type="text"
            className="tools-input"
            placeholder="e.g. Semester 1"
            value={semesterName}
            onChange={(e) => setSemesterName(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="tools-btn tools-btn-primary"
            onClick={handleSave}
          >
            <Save size={16} strokeWidth={2} />
            {editingId ? "Update" : "Save Semester"}
          </button>
          {editingId && (
            <button
              type="button"
              className="tools-btn tools-btn-outline"
              onClick={handleCancelEdit}
            >
              <X size={16} strokeWidth={2} />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Saved semesters */}
      <hr className="tools-divider" />

      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
        <h2 className="text-[var(--text-lg-fluid)] font-semibold text-[var(--color-text)]">
          Saved Semesters
        </h2>
        {runningCgpa && (
          <span className="text-[var(--color-accent)] font-semibold">
            Running CGPA: {runningCgpa.cgpa.toFixed(2)} ({runningCgpa.totalCredits} credits)
          </span>
        )}
      </div>

      {semesters.length === 0 ? (
        <p className="text-[var(--color-muted)] py-6 text-center">
          No semesters saved yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {semesters.map((sem) => (
            <div
              key={sem.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-medium text-[var(--color-text)] truncate">
                    {sem.name}
                  </span>
                  <span className="text-[var(--text-sm-fluid)] text-[var(--color-muted)]">
                    SGPA: {sem.sgpa.toFixed(2)} · {sem.totalCredits} credits ·{" "}
                    {formatDate(sem.savedAt)}
                  </span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    className="tools-btn-icon"
                    onClick={() => handleEdit(sem)}
                    aria-label={`Edit ${sem.name}`}
                    style={{ color: "var(--color-muted)" }}
                  >
                    <Pencil size={16} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    className="tools-btn-icon"
                    onClick={() => handleDelete(sem.id)}
                    aria-label={`Delete ${sem.name}`}
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note */}
      <hr className="tools-divider" />
      <p className="tools-note">
        This uses the standard 10-point scale. Check your college's exact
        grading policy if it differs.
      </p>
    </main>
  );
}
