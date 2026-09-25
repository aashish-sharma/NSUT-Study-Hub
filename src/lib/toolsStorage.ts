import { z } from "zod";
import type { SemesterRecord } from "./gpa";

// ---------------------------------------------------------------------------
// Storage helpers — mirrors the pattern from storage.ts
// Uses the same "studyhub:" prefix, wrapped in try/catch.
// Cannot import readItem/writeItem from storage.ts (they're private),
// so we duplicate the helpers here.
// ---------------------------------------------------------------------------

const PREFIX = "studyhub:";

function readToolItem<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    return result.success ? result.data : fallback;
  } catch {
    return fallback;
  }
}

function writeToolItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch (e) {
    console.error("Storage write error (quota exceeded or private mode)", e);
  }
}

// ---------------------------------------------------------------------------
// UI row type — extends SubjectEntry with a UI-only `id` for React keys
// ---------------------------------------------------------------------------

export interface GradeRowData {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

let _rowCounter = 0;
export function createEmptyRow(): GradeRowData {
  return {
    id: `row-${Date.now()}-${_rowCounter++}`,
    name: "",
    credits: 0,
    grade: "O",
  };
}

// ---------------------------------------------------------------------------
// Zod schemas for validation
// ---------------------------------------------------------------------------

const GradeRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  credits: z.number(),
  grade: z.string(),
});

const GradeRowArraySchema = z.array(GradeRowSchema);

const SubjectEntrySchema = z.object({
  name: z.string(),
  credits: z.number(),
  grade: z.string(),
});

const SemesterRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  entries: z.array(SubjectEntrySchema),
  sgpa: z.number(),
  totalCredits: z.number(),
  savedAt: z.string(),
});

const SemesterArraySchema: z.ZodType<SemesterRecord[]> = z.array(SemesterRecordSchema);

const AttendanceLastSchema = z.object({
  held: z.number(),
  attended: z.number(),
  required: z.number(),
  target: z.number(),
});

export type AttendanceLastData = z.infer<typeof AttendanceLastSchema>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const toolsStorage = {
  // CGPA calculator entries
  readCgpaEntries(): GradeRowData[] {
    return readToolItem("cgpa-entries", GradeRowArraySchema, []);
  },
  writeCgpaEntries(entries: GradeRowData[]): void {
    writeToolItem("cgpa-entries", entries);
  },

  // SGPA saved semesters
  readSgpaSemesters(): SemesterRecord[] {
    return readToolItem("sgpa-semesters", SemesterArraySchema, []);
  },
  writeSgpaSemesters(semesters: SemesterRecord[]): void {
    writeToolItem("sgpa-semesters", semesters);
  },

  // SGPA current working entries (draft)
  readSgpaCurrent(): GradeRowData[] {
    return readToolItem("sgpa-current", GradeRowArraySchema, []);
  },
  writeSgpaCurrent(entries: GradeRowData[]): void {
    writeToolItem("sgpa-current", entries);
  },

  // Attendance last-used values (convenience persist)
  readAttendanceLast(): AttendanceLastData | null {
    return readToolItem("attendance-last", AttendanceLastSchema.nullable(), null);
  },
  writeAttendanceLast(data: AttendanceLastData): void {
    writeToolItem("attendance-last", data);
  },
};
