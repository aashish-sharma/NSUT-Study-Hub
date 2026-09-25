// ---------------------------------------------------------------------------
// Dev-only formula regression checks — runs once on page load
// Guarded by import.meta.env.DEV (tree-shaken in production builds)
// ---------------------------------------------------------------------------

import { computeCgpa } from "./gpa";
import {
  computeAttendance,
  validateAttendance,
  classesUntilTarget,
} from "./attendance";

export function runFormulaChecks(): void {
  if (!import.meta.env.DEV) return;

  console.group("📊 Phase E — Formula regression checks");

  // (a) CGPA: [4,4,3] × [O,A,B+] → 8.45
  const a = computeCgpa([
    { name: "S1", credits: 4, grade: "O" },
    { name: "S2", credits: 4, grade: "A" },
    { name: "S3", credits: 3, grade: "B+" },
  ]);
  console.log(
    "(a) CGPA [4,4,3]×[O,A,B+]:",
    a?.cgpa === 8.45 && a?.totalCredits === 11 ? "✅ PASS" : "❌ FAIL",
    a,
  );

  // (b) Attendance: held=40, attended=34, required=75 → 85%, canMiss=5
  const b = computeAttendance({ held: 40, attended: 34, required: 75 });
  console.log(
    "(b) Attendance 34/40 @75%:",
    b?.currentPercent === 85 && b?.canMiss === 5 ? "✅ PASS" : "❌ FAIL",
    b,
  );

  // (c-1) required=100%, below → mustAttend=Infinity
  const c1 = computeAttendance({ held: 40, attended: 38, required: 100 });
  console.log(
    "(c-1) req=100%, below:",
    c1?.mustAttend === Infinity ? "✅ PASS" : "❌ FAIL",
    "mustAttend =",
    c1?.mustAttend,
  );

  // (c-2) required=100%, at 100% → canMiss=0
  const c2 = computeAttendance({ held: 40, attended: 40, required: 100 });
  console.log(
    "(c-2) req=100%, at 100%:",
    c2?.canMiss === 0 && c2?.isAbove ? "✅ PASS" : "❌ FAIL",
    c2,
  );

  // (d) Validation: attended > held → blocked
  const d = validateAttendance({ held: 30, attended: 36, required: 75 });
  console.log(
    "(d) attended>held:",
    d.some((e) => e.field === "attended") ? "✅ PASS" : "❌ FAIL",
    d,
  );

  // Bonus: classesUntilTarget(40, 30, 80) → 10
  const bonus = classesUntilTarget(40, 30, 80);
  console.log(
    "(bonus) classesUntil80%:",
    bonus === 10 ? "✅ PASS" : "❌ FAIL",
    bonus,
  );

  console.groupEnd();
}
