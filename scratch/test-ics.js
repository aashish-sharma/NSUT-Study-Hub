// Quick test: show exact .ics output for the example exam
// Run with: npx tsx scratch/test-ics.ts

// Inline the logic since we can't easily import TS modules with tsx here
const CRLF = "\r\n";

function escapeText(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function nextDay(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d + 1);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, "0");
  const nd = String(date.getDate()).padStart(2, "0");
  return `${ny}${nm}${nd}`;
}

function toIcsDate(dateStr) {
  return dateStr.replace(/-/g, "");
}

function nowUtcStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

function buildIcs(exam) {
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
  return lines.join(CRLF) + CRLF;
}

// Test 1: Normal label
const exam1 = {
  id: "exam-abc123",
  subjectId: "mathematics-1",
  type: "Endsem",
  label: "Mathematics-1 Endsem",
  date: "2026-10-08"
};

console.log("=== Test 1: Normal label ===");
const output1 = buildIcs(exam1);
console.log(output1);

// Show raw bytes to confirm CRLF
console.log("--- Line ending check ---");
const bytes = [...output1].map(c => c === "\r" ? "\\r" : c === "\n" ? "\\n" : c).join("");
console.log("Contains \\r\\n:", output1.includes("\r\n"));
console.log("Contains bare \\n (not preceded by \\r):", /[^\r]\n/.test(output1));

// Test 2: Label with comma and semicolon
const exam2 = {
  id: "exam-xyz789",
  subjectId: null,
  type: "Other",
  label: "Math, Unit 3; Review",
  date: "2026-10-08"
};

console.log("\n=== Test 2: Label with comma and semicolon ===");
const output2 = buildIcs(exam2);
console.log(output2);
console.log("SUMMARY line:", output2.split(CRLF).find(l => l.startsWith("SUMMARY:")));
