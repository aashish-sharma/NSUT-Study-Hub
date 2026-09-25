import { X } from "lucide-react";
import type { GradeEntry } from "../lib/gpa";
import type { GradeRowData } from "../lib/toolsStorage";

interface GradeRowProps {
  entry: GradeRowData;
  gradeTable: readonly GradeEntry[];
  onChange: (field: keyof GradeRowData, value: string | number) => void;
  onRemove: () => void;
  canRemove: boolean;
}

/**
 * Single row in the GPA calculator: subject name, credits, grade, remove.
 * Shared by both CGPA and SGPA pages via GradeCalculator.
 */
export function GradeRow({
  entry,
  gradeTable,
  onChange,
  onRemove,
  canRemove,
}: GradeRowProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Subject name */}
      <div className="flex-1 min-w-[180px]">
        <input
          type="text"
          className="tools-input"
          placeholder="Subject name"
          value={entry.name}
          onChange={(e) => onChange("name", e.target.value)}
          list="tools-subject-suggestions"
          autoComplete="off"
        />
      </div>

      {/* Credits */}
      <div className="w-[90px]">
        <input
          type="number"
          className="tools-input"
          inputMode="numeric"
          placeholder="Credits"
          min={0}
          step={1}
          value={entry.credits || ""}
          onChange={(e) => onChange("credits", Number(e.target.value) || 0)}
        />
      </div>

      {/* Grade select */}
      <div className="w-[100px]">
        <select
          className="tools-select"
          value={entry.grade}
          onChange={(e) => onChange("grade", e.target.value)}
        >
          {gradeTable.map((g) => (
            <option key={g.grade} value={g.grade}>
              {g.grade} ({g.point})
            </option>
          ))}
        </select>
      </div>

      {/* Remove button */}
      <button
        type="button"
        className="tools-btn-icon"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label="Remove subject"
        style={{ opacity: canRemove ? 1 : 0.3, cursor: canRemove ? "pointer" : "default" }}
      >
        <X size={18} strokeWidth={2} />
      </button>
    </div>
  );
}
