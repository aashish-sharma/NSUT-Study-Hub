// ---------------------------------------------------------------------------
// GPA pure functions — no JSX, no side effects
// ---------------------------------------------------------------------------

/** Default 10-point grading scale. */
export const DEFAULT_GRADE_TABLE: readonly GradeEntry[] = [
  { grade: "O",  point: 10 },
  { grade: "A+", point: 9 },
  { grade: "A",  point: 8 },
  { grade: "B+", point: 7 },
  { grade: "B",  point: 6 },
  { grade: "C",  point: 5 },
  { grade: "P",  point: 4 },
  { grade: "F",  point: 0 },
] as const;

export interface GradeEntry {
  grade: string;
  point: number;
}

export interface SubjectEntry {
  name: string;
  credits: number;
  grade: string;
}

export interface CgpaResult {
  cgpa: number;
  totalCredits: number;
}

/**
 * Compute CGPA using the standard weighted-average formula:
 *
 *   CGPA = Σ(credits_i × grade_point_i) / Σ(credits_i)
 *
 * @param entries  - Array of subject entries (credits > 0, valid grade).
 * @param table    - Grade-point lookup table.
 * @returns `null` when there are no valid rows (credits ≤ 0 or total is 0).
 */
export function computeCgpa(
  entries: readonly SubjectEntry[],
  table: readonly GradeEntry[] = DEFAULT_GRADE_TABLE,
): CgpaResult | null {
  const lookup = new Map(table.map((g) => [g.grade, g.point]));

  let sumWeighted = 0;
  let sumCredits = 0;

  for (const e of entries) {
    if (e.credits <= 0) continue;
    const point = lookup.get(e.grade);
    if (point === undefined) continue;
    sumWeighted += e.credits * point;
    sumCredits += e.credits;
  }

  if (sumCredits === 0) return null;

  return {
    cgpa: Math.round((sumWeighted / sumCredits) * 100) / 100,
    totalCredits: sumCredits,
  };
}

export interface SemesterRecord {
  id: string;
  name: string;
  entries: SubjectEntry[];
  sgpa: number;
  totalCredits: number;
  savedAt: string; // ISO date string
}

/**
 * Compute running CGPA across multiple saved semesters,
 * weighted by each semester's total credits.
 *
 *   runningCGPA = Σ(semester_credits_i × sgpa_i) / Σ(semester_credits_i)
 */
export function computeRunningCgpa(
  semesters: readonly SemesterRecord[],
): CgpaResult | null {
  let sumWeighted = 0;
  let sumCredits = 0;

  for (const s of semesters) {
    if (s.totalCredits <= 0) continue;
    sumWeighted += s.totalCredits * s.sgpa;
    sumCredits += s.totalCredits;
  }

  if (sumCredits === 0) return null;

  return {
    cgpa: Math.round((sumWeighted / sumCredits) * 100) / 100,
    totalCredits: sumCredits,
  };
}
