// ---------------------------------------------------------------------------
// Date helpers — all date math uses calendar dates in local timezone.
// No UTC conversion, no time-of-day. Count only changes at local midnight.
// ---------------------------------------------------------------------------

/**
 * Compute the number of calendar days from today to the given date string.
 * Positive = future, 0 = today, negative = past.
 *
 * Both "today" and the target are truncated to midnight in the browser's
 * local timezone before subtracting, so the count flips only at local
 * midnight — never partway through the day.
 */
export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse as local date (YYYY-MM-DD → month is 0-indexed)
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);

  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Returns today's date as a YYYY-MM-DD string in local timezone. */
export function todayDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Human-readable "days until" label. */
export function daysUntilLabel(dateStr: string): string {
  const n = daysUntil(dateStr);
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n > 1) return `in ${n} days`;
  if (n === -1) return "Yesterday";
  return `${Math.abs(n)} days ago`;
}
