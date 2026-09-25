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
