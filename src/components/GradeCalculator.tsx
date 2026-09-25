import { useMemo } from "react";
import { Plus } from "lucide-react";
import { GradeRow } from "./GradeRow";
import { computeCgpa, DEFAULT_GRADE_TABLE } from "../lib/gpa";
import type { GradeEntry } from "../lib/gpa";
import { createEmptyRow } from "../lib/toolsStorage";
import type { GradeRowData } from "../lib/toolsStorage";
import { loadSubjects } from "../data/loader";
import type { Subject } from "../data/schema";

interface GradeCalculatorProps {
  entries: GradeRowData[];
  onChange: (entries: GradeRowData[]) => void;
  /** Label shown above the result, e.g. "CGPA" or "SGPA" */
  resultLabel?: string;
  gradeTable?: readonly GradeEntry[];
}

/**
 * Shared GPA calculator component used by both /tools/cgpa and /tools/sgpa.
 * Manages the dynamic row list, add/remove, and live result display.
 * The parent owns state + persistence.
 */
export function GradeCalculator({
  entries,
  onChange,
  resultLabel = "CGPA",
  gradeTable = DEFAULT_GRADE_TABLE,
}: GradeCalculatorProps) {
  // Subject name suggestions from the loaded data
  const subjectNames = useMemo(() => {
    try {
      const subs: Subject[] = loadSubjects();
      return subs.map((s) => s.name);
    } catch {
      return [];
    }
  }, []);

  // Live result
  const result = useMemo(() => {
    const subjectEntries = entries.map((e) => ({
      name: e.name,
      credits: e.credits,
      grade: e.grade,
    }));
    return computeCgpa(subjectEntries, gradeTable);
  }, [entries, gradeTable]);

  const handleFieldChange = (
    index: number,
    field: keyof GradeRowData,
    value: string | number,
  ) => {
    const updated = entries.map((e, i) =>
      i === index ? { ...e, [field]: value } : e,
    );
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...entries, createEmptyRow()]);
  };

  const handleRemove = (index: number) => {
    if (entries.length <= 1) return;
    onChange(entries.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Subject name datalist — shared across all rows */}
      <datalist id="tools-subject-suggestions">
        {subjectNames.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      {/* Grade rows */}
      <div className="flex flex-col gap-3">
        {entries.map((entry, i) => (
          <GradeRow
            key={entry.id}
            entry={entry}
            gradeTable={gradeTable}
            onChange={(field, value) => handleFieldChange(i, field, value)}
            onRemove={() => handleRemove(i)}
            canRemove={entries.length > 1}
          />
        ))}
      </div>

      {/* Add subject */}
      <div className="mt-4">
        <button
          type="button"
          className="tools-btn tools-btn-outline"
          onClick={handleAdd}
        >
          <Plus size={18} strokeWidth={2} />
          Add Subject
        </button>
      </div>

      {/* Live result */}
      <div className="tools-result mt-6">
        {result ? (
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <span className="text-[var(--text-xl-fluid)] font-semibold text-[var(--color-text)]">
              {resultLabel}: {result.cgpa.toFixed(2)}
            </span>
            <span className="text-[var(--color-muted)] text-[var(--text-sm-fluid)]">
              Total Credits: {result.totalCredits}
            </span>
          </div>
        ) : (
          <span className="text-[var(--color-muted)]">
            Add a subject to calculate.
          </span>
        )}
      </div>
    </div>
  );
}
