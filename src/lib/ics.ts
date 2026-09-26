// ---------------------------------------------------------------------------
// ICS generator — hand-written, no external library.
// Produces a valid RFC 5545 all-day VEVENT .ics file.
// ---------------------------------------------------------------------------

import type { Exam } from "./storage";

const CRLF = "\r\n";

/**
 * Escape text values per RFC 5545 §3.3.11:
 * - Backslash → \\
 * - Semicolons → \;
 * - Commas → \,
 * - Newlines → \n (literal backslash-n)
 */
function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Returns the day AFTER dateStr as a YYYYMMDD string.
 * All-day events in iCalendar use exclusive DTEND, so a one-day event
 * on 2026-10-08 has DTSTART=20261008 and DTEND=20261009.
 */
function nextDay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d + 1);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, "0");
  const nd = String(date.getDate()).padStart(2, "0");
  return `${ny}${nm}${nd}`;
}

/** Format YYYY-MM-DD to YYYYMMDD */
function toIcsDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

/** Current UTC timestamp as YYYYMMDDTHHMMSSZ for DTSTAMP */
function nowUtcStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

/** Build the .ics file content string for an all-day event. */
export function buildIcs(exam: Exam): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//StudyHub//ExamPlanner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${exam.id}@studyhub`,
    `DTSTAMP:${nowUtcStamp()}`,
    `DTSTART;VALUE=DATE:${toIcsDate(exam.date)}`,
    `DTEND;VALUE=DATE:${nextDay(exam.date)}`,
    `SUMMARY:${escapeText(exam.label)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  // Join with CRLF and end with CRLF
  return lines.join(CRLF) + CRLF;
}

/** Generate and trigger download of an .ics file for the given exam. */
export function downloadIcs(exam: Exam): void {
  const content = buildIcs(exam);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${exam.label}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
