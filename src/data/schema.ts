import { z } from "zod";

// ---------------------------------------------------------------------------
// Link
// ---------------------------------------------------------------------------

export const LinkSchema = z.object({
  label: z.string(),
  url: z.string().url(),
  source: z.enum([
    "youtube",
    "drive_file",
    "drive_folder",
    "google_doc",
    "other",
  ]),
  category: z.string(),
  unit: z.number().int().nullable(),
  tags: z.array(z.string()),
  raw_context: z.record(z.string(), z.string()),
});

export type Link = z.infer<typeof LinkSchema>;

// ---------------------------------------------------------------------------
// Subject
// ---------------------------------------------------------------------------

export const SubjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  index_no: z.number().int(),
  pdf_page: z.number().int(),
  notes: z.array(z.string()),
  links: z.array(LinkSchema),
});

export type Subject = z.infer<typeof SubjectSchema>;

// ---------------------------------------------------------------------------
// Root array
// ---------------------------------------------------------------------------

export const SubjectsSchema = z.array(SubjectSchema);

// ---------------------------------------------------------------------------
// Overrides
// ---------------------------------------------------------------------------

/** Allowed override fields — only label, category, unit. */
const ALLOWED_OVERRIDE_FIELDS = new Set(["label", "category", "unit"]);

const OverrideEntrySchema = z
  .record(z.string(), z.unknown())
  .refine(
    (obj) => Object.keys(obj).every((k) => ALLOWED_OVERRIDE_FIELDS.has(k)),
    (obj) => ({
      message: `Override contains disallowed fields: ${Object.keys(obj)
        .filter((k) => !ALLOWED_OVERRIDE_FIELDS.has(k))
        .join(", ")}. Only label, category, and unit are allowed.`,
    }),
  );

/**
 * Overrides file shape: Record keyed by "subjectId::url".
 * Each value may only contain label, category, and/or unit.
 */
export const OverridesSchema = z.record(z.string(), OverrideEntrySchema);

export type OverrideEntry = z.infer<typeof OverrideEntrySchema>;
export type Overrides = z.infer<typeof OverridesSchema>;
