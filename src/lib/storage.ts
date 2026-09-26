import { z } from "zod";

const PREFIX = "studyhub:";
const CURRENT_VERSION = 1;

// Unicode letters (\p{L}), spaces, hyphens, apostrophes, dots. 1-30 chars.
export const NameSchema = z
  .string()
  .trim()
  .min(1)
  .max(30)
  .regex(/^[\p{L}\s\-'.]+$/u, "Name can only contain letters, spaces, hyphens, apostrophes, and dots.");

export type StorageState = {
  version: number;
  user: {
    firstName: string | null;
  } | null;
};

const DEFAULT_STATE: StorageState = {
  version: CURRENT_VERSION,
  user: null,
};

function readItem<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
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

function writeItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch (e) {
    console.error("Storage write error (quota exceeded or private mode)", e);
  }
}

export const storage = {
  read(): StorageState {
    const version = readItem("version", z.number(), CURRENT_VERSION);
    
    // In the future, migrate data based on version here before returning
    if (version < CURRENT_VERSION) {
      this.migrate(version);
    }

    return {
      version: readItem("version", z.number(), CURRENT_VERSION),
      user: readItem(
        "user", 
        z.object({ firstName: z.string().nullable() }).nullable(), 
        DEFAULT_STATE.user
      ),
    };
  },

  migrate(_oldVersion: number) {
    // Migration logic will go here in the future
    writeItem("version", CURRENT_VERSION);
  },

  updateUser(firstName: string | null) {
    writeItem("user", { firstName });
    writeItem("version", CURRENT_VERSION);
    window.dispatchEvent(new Event("studyhub:storage-update"));
  },

  clear() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(PREFIX)) {
          keys.push(key);
        }
      }
      keys.forEach((k) => localStorage.removeItem(k));
      window.dispatchEvent(new Event("studyhub:storage-update"));
    } catch {}
  },
  
  hasUserCompletedOnboarding(): boolean {
    const user = readItem(
        "user", 
        z.object({ firstName: z.string().nullable() }).nullable(), 
        null
      );
    return user !== null;
  }
};

// ---------------------------------------------------------------------------
// Exams
// ---------------------------------------------------------------------------

import { daysUntil } from "./dates";
import type { Subject } from "../data/schema";

export const EXAM_TYPES = ["CT", "Midsem", "Endsem", "Practical", "Other"] as const;
export type ExamType = (typeof EXAM_TYPES)[number];

export interface Exam {
  id: string;
  subjectId: string | null;
  type: ExamType;
  label: string;
  date: string;  // YYYY-MM-DD
}

const ExamSchema = z.object({
  id: z.string(),
  subjectId: z.string().nullable(),
  type: z.enum(EXAM_TYPES),
  label: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const ExamsArraySchema = z.array(ExamSchema);

/**
 * Read exams from storage.
 * - Validates each subjectId against the provided subjects list;
 *   exams pointing at a nonexistent subject are silently dropped.
 * - Prunes exams where daysUntil(date) < -1 (auto-remove exams
 *   more than a day past).
 * - Only writes the pruned list back if it actually differs from
 *   what was read (guard by length comparison after pruning).
 */
export function readExams(subjects: Subject[]): Exam[] {
  const raw = readItem("exams", ExamsArraySchema, []);
  const subjectIds = new Set(subjects.map((s) => s.id));

  const pruned = raw.filter((exam) => {
    // Drop exams pointing at a subject that no longer exists
    if (exam.subjectId !== null && !subjectIds.has(exam.subjectId)) return false;
    // Drop exams more than a day past
    if (daysUntil(exam.date) < -1) return false;
    return true;
  });

  // Only write back if pruning actually removed entries
  if (pruned.length !== raw.length) {
    writeItem("exams", pruned);
  }

  return pruned;
}

export function writeExams(exams: Exam[]): void {
  writeItem("exams", exams);
  window.dispatchEvent(new Event("studyhub:storage-update"));
}

export function addExam(exam: Exam, existing: Exam[]): Exam[] {
  const next = [...existing, exam];
  writeExams(next);
  return next;
}

export function updateExam(updated: Exam, existing: Exam[]): Exam[] {
  const next = existing.map((e) => (e.id === updated.id ? updated : e));
  writeExams(next);
  return next;
}

export function deleteExam(id: string, existing: Exam[]): Exam[] {
  const next = existing.filter((e) => e.id !== id);
  writeExams(next);
  return next;
}
