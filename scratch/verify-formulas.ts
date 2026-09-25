// Verification script for gpa.ts and attendance.ts worked examples
// Run with: npx tsx scratch/verify-formulas.ts

import { computeCgpa } from "../src/lib/gpa.js";
import { computeAttendance, validateAttendance, classesUntilTarget } from "../src/lib/attendance.js";

console.log("=== Example (a): CGPA ===");
console.log("  credits=[4,4,3], grades=[O,A,B+]");
const cgpaResult = computeCgpa([
  { name: "Sub 1", credits: 4, grade: "O" },   // 4×10 = 40
  { name: "Sub 2", credits: 4, grade: "A" },   // 4×8  = 32
  { name: "Sub 3", credits: 3, grade: "B+" },  // 3×7  = 21
]);
console.log("  Expected: CGPA=8.45, totalCredits=11");
console.log("  Got:     ", JSON.stringify(cgpaResult));
console.log("  PASS:", cgpaResult?.cgpa === 8.45 && cgpaResult?.totalCredits === 11);

console.log("\n=== Example (b): Attendance can-I-bunk ===");
console.log("  held=40, attended=34, required=75");
const attResult = computeAttendance({ held: 40, attended: 34, required: 75 });
console.log("  Expected: currentPercent=85.0, canMiss=some positive number");
console.log("  Got:     ", JSON.stringify(attResult));
// Manual: current% = 34/40 * 100 = 85.0
// canMiss = floor((34 - 0.75*40) / 0.75) = floor((34 - 30) / 0.75) = floor(5.333) = 5
console.log("  Manual calc: current%=85.0, canMiss=floor((34-30)/0.75)=floor(5.333)=5");
console.log("  PASS:", attResult?.currentPercent === 85.0 && attResult?.canMiss === 5);

console.log("\n=== Example (c): Attendance edge case required=100 ===");
console.log("  held=40, attended=38, required=100");
const attEdge100 = computeAttendance({ held: 40, attended: 38, required: 100 });
console.log("  Expected: currentPercent=95.0, mustAttend=Infinity (impossible)");
console.log("  Got:     ", JSON.stringify(attEdge100));
// current% = 38/40 * 100 = 95.0, below 100
// required >= 100 path: mustAttend = Infinity
console.log("  No crash, no divide-by-zero.");
console.log("  PASS:", attEdge100?.currentPercent === 95.0 && attEdge100?.mustAttend === Infinity);

console.log("\n  --- Also test: already at 100% ---");
const attEdge100b = computeAttendance({ held: 40, attended: 40, required: 100 });
console.log("  held=40, attended=40, required=100");
console.log("  Got:     ", JSON.stringify(attEdge100b));
console.log("  PASS:", attEdge100b?.currentPercent === 100.0 && attEdge100b?.canMiss === 0);

console.log("\n=== Example (d): Validation attended > held ===");
console.log("  attended=36, held=30");
const validationErrors = validateAttendance({ held: 30, attended: 36, required: 75 });
console.log("  Expected: validation error on 'attended' field");
console.log("  Got:     ", JSON.stringify(validationErrors));
console.log("  PASS:", validationErrors.length > 0 && validationErrors.some(e => e.field === "attended"));

console.log("\n=== Bonus: classesUntilTarget ===");
console.log("  held=40, attended=30, target=80");
const ctt = classesUntilTarget(40, 30, 80);
// Need (0.8*40 - 30) / (1-0.8) = (32-30)/0.2 = 2/0.2 = 10
console.log("  Expected: 10");
console.log("  Got:     ", ctt);
console.log("  PASS:", ctt === 10);

console.log("\n  --- classesUntilTarget target=100 (impossible) ---");
const ctt100 = classesUntilTarget(40, 38, 100);
console.log("  held=40, attended=38, target=100");
console.log("  Got:     ", ctt100);
console.log("  PASS:", ctt100 === Infinity);

console.log("\n=== ALL DONE ===");
