// ---------------------------------------------------------------------------
// Attendance pure functions — no JSX, no side effects
// ---------------------------------------------------------------------------

export interface AttendanceInput {
  held: number;
  attended: number;
  required: number; // percentage, e.g. 75
}

export interface AttendanceResult {
  currentPercent: number;
  /** If above requirement: how many more classes you can miss. Always ≥ 0. */
  canMiss: number | null;
  /** If below requirement: how many consecutive classes you must attend. Always ≥ 0. */
  mustAttend: number | null;
  /** true when currently at or above the required percentage */
  isAbove: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate attendance inputs before computing.
 * Returns an array of errors (empty = valid).
 */
export function validateAttendance(input: AttendanceInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Number.isFinite(input.held) || input.held < 0) {
    errors.push({ field: "held", message: "Classes held must be 0 or more." });
  }
  if (!Number.isFinite(input.attended) || input.attended < 0) {
    errors.push({ field: "attended", message: "Classes attended must be 0 or more." });
  }
  if (!Number.isFinite(input.required) || input.required < 0 || input.required > 100) {
    errors.push({ field: "required", message: "Required percentage must be between 0 and 100." });
  }
  if (
    Number.isFinite(input.attended) &&
    Number.isFinite(input.held) &&
    input.attended > input.held
  ) {
    errors.push({
      field: "attended",
      message: "Classes attended cannot exceed classes held.",
    });
  }

  return errors;
}

/**
 * "Can I bunk?" calculator.
 *
 * Formulas:
 *   current% = attended / held × 100
 *
 *   If current% ≥ required%:
 *     max_more_absences = floor( (attended − required/100 × held) / (required/100) )
 *     (floored at 0)
 *
 *   If current% < required%:
 *     needed_present_streak = ceil( (required/100 × held − attended) / (1 − required/100) )
 *     (floored at 0)
 *
 * Special case: required = 100 → you can never miss any class, and
 *   if you're below 100%, mustAttend is Infinity (shown as
 *   "impossible" by the UI).
 *
 * @returns `null` when held is 0 (no classes to compute from).
 */
export function computeAttendance(input: AttendanceInput): AttendanceResult | null {
  const { held, attended, required } = input;

  if (held === 0) return null;

  const currentPercent =
    Math.round((attended / held) * 1000) / 10; // 1 decimal place

  const reqFraction = required / 100;
  const isAbove = currentPercent >= required;

  if (isAbove) {
    // How many more can I miss?
    if (required >= 100) {
      // At exactly 100%: can't miss any
      return { currentPercent, canMiss: 0, mustAttend: null, isAbove: true };
    }
    const raw = (attended - reqFraction * held) / reqFraction;
    const canMiss = Math.max(0, Math.floor(raw + 1e-9));
    return { currentPercent, canMiss, mustAttend: null, isAbove };
  } else {
    // How many must I attend in a row?
    if (required >= 100) {
      // Can never reach 100% once you've missed a class
      // (infinite classes needed) — UI should show "impossible"
      return { currentPercent, canMiss: null, mustAttend: Infinity, isAbove: false };
    }
    const raw = (reqFraction * held - attended) / (1 - reqFraction);
    const mustAttend = Math.max(0, Math.ceil(raw - 1e-9));
    return { currentPercent, canMiss: null, mustAttend, isAbove: false };
  }
}

/**
 * "How many classes until I hit X%?" — same formula family,
 * target substituted for required.
 */
export function classesUntilTarget(
  held: number,
  attended: number,
  target: number,
): number | null {
  if (held <= 0) return null;

  const currentPercent = (attended / held) * 100;
  if (currentPercent >= target) return 0; // already there

  if (target >= 100) {
    // Impossible unless already at 100%
    return Infinity;
  }

  const tFrac = target / 100;
  const raw = (tFrac * held - attended) / (1 - tFrac);
  return Math.max(0, Math.ceil(raw - 1e-9));
}
