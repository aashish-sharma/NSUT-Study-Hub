import {
  SubjectsSchema,
  OverridesSchema,
  type Subject,
} from "./schema";

// ---------------------------------------------------------------------------
// Import the SINGLE copy of subjects.json at the repo root.
// Vite resolves this at build time — verify-links.mjs reads the same file.
// ---------------------------------------------------------------------------
import rawSubjects from "../../subjects.json";

// Overrides are optional; an empty object is the default.
import rawOverrides from "./overrides.json";

// ---------------------------------------------------------------------------
// loadSubjects()
// ---------------------------------------------------------------------------

/**
 * Validates subjects.json with Zod, merges overrides, and asserts that the
 * set of URLs is unchanged after merging.
 */
export function loadSubjects(): Subject[] {
  // 1. Validate subjects
  const subjects = SubjectsSchema.parse(rawSubjects);

  // 2. Validate overrides (throws if any entry contains "url" or other
  //    disallowed fields — the Zod refine handles this)
  const overrides = OverridesSchema.parse(rawOverrides);

  // 3. Snapshot the URL set BEFORE merging
  const urlsBefore = new Set(
    subjects.flatMap((s) => s.links.map((l) => l.url)),
  );

  // 4. Apply overrides
  if (Object.keys(overrides).length > 0) {
    for (const subject of subjects) {
      for (const link of subject.links) {
        const key = `${subject.id}::${link.url}`;
        const patch = overrides[key];
        if (patch) {
          if ("label" in patch && typeof patch.label === "string") {
            link.label = patch.label;
          }
          if ("category" in patch && typeof patch.category === "string") {
            link.category = patch.category;
          }
          if ("unit" in patch) {
            link.unit = patch.unit as number | null;
          }
        }
      }
    }
  }

  // 5. Assert: the set of URLs must be IDENTICAL after merging overrides.
  //    Overrides must never add, remove, or change URLs.
  const urlsAfter = new Set(
    subjects.flatMap((s) => s.links.map((l) => l.url)),
  );

  if (urlsBefore.size !== urlsAfter.size) {
    throw new Error(
      `URL set size changed after overrides: ${urlsBefore.size} → ${urlsAfter.size}`,
    );
  }
  for (const url of urlsBefore) {
    if (!urlsAfter.has(url)) {
      throw new Error(`URL disappeared after overrides: ${url}`);
    }
  }
  for (const url of urlsAfter) {
    if (!urlsBefore.has(url)) {
      throw new Error(`URL appeared after overrides: ${url}`);
    }
  }

  return subjects;
}
