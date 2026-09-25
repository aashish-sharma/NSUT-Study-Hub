/**
 * verify-links.mjs
 *
 * Reads the SAME subjects.json that loader.ts imports (repo root) and
 * compares unique URL sets against all_urls.txt.
 *
 * Checks:
 *   A) Every unique URL in subjects.json exists in all_urls.txt        (0 misses = PASS)
 *   B) Every URL in all_urls.txt exists in subjects.json OR allowlist  (0 unlisted orphans = PASS)
 *   C) Subject count === 37
 *   D) Total links === 575  AND  unique URLs === 560
 *
 * Exit code 1 if ANY check fails.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Read the SINGLE copy of subjects.json (same file that loader.ts imports)
// ---------------------------------------------------------------------------
const subjectsPath = resolve(ROOT, "subjects.json");
const subjects = JSON.parse(readFileSync(subjectsPath, "utf-8"));

const allUrlsTxtPath = resolve(ROOT, "all_urls.txt");
const allUrlsTxt = readFileSync(allUrlsTxtPath, "utf-8")
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

const allowedExtraPath = resolve(ROOT, "scripts", "allowed-extra.json");
const allowedExtra = new Set(
  JSON.parse(readFileSync(allowedExtraPath, "utf-8")),
);

// ---------------------------------------------------------------------------
// Collect URL sets
// ---------------------------------------------------------------------------
const allLinksFlat = subjects.flatMap((s) => s.links.map((l) => l.url));
const subjectUrlSet = new Set(allLinksFlat);
const txtUrlSet = new Set(allUrlsTxt);

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------
let failed = false;

function header(label) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${label}`);
  console.log("=".repeat(60));
}

// --- Check A: subjects.json URLs ⊆ all_urls.txt --------------------------
header("Check A — Every subjects.json URL exists in all_urls.txt");
const missingFromTxt = [...subjectUrlSet].filter((u) => !txtUrlSet.has(u));
if (missingFromTxt.length === 0) {
  console.log("  ✅ PASS — 0 missing");
} else {
  console.log(`  ❌ FAIL — ${missingFromTxt.length} URL(s) missing from all_urls.txt:`);
  missingFromTxt.forEach((u) => console.log(`     • ${u}`));
  failed = true;
}

// --- Check B: all_urls.txt URLs ⊆ subjects.json ∪ allowlist --------------
header("Check B — Orphan URLs in all_urls.txt (not in subjects.json)");
const orphans = [...txtUrlSet].filter(
  (u) => !subjectUrlSet.has(u) && !allowedExtra.has(u),
);
const allowedOrphans = [...txtUrlSet].filter(
  (u) => !subjectUrlSet.has(u) && allowedExtra.has(u),
);
if (orphans.length === 0) {
  console.log(`  ✅ PASS — 0 unlisted orphans (${allowedOrphans.length} allowed-extra)`);
} else {
  console.log(`  ❌ FAIL — ${orphans.length} orphan URL(s) not in subjects.json or allowlist:`);
  orphans.forEach((u) => console.log(`     • ${u}`));
  failed = true;
}

// --- Check C: subject count === 37 ----------------------------------------
header("Check C — Subject count");
if (subjects.length === 37) {
  console.log(`  ✅ PASS — ${subjects.length} subjects`);
} else {
  console.log(`  ❌ FAIL — expected 37 subjects, got ${subjects.length}`);
  failed = true;
}

// --- Check D: total links === 575, unique URLs === 560 --------------------
header("Check D — Link counts");
const totalLinks = allLinksFlat.length;
const uniqueUrls = subjectUrlSet.size;
const dPass = totalLinks === 575 && uniqueUrls === 560;
if (dPass) {
  console.log(`  ✅ PASS — ${totalLinks} total links, ${uniqueUrls} unique URLs`);
} else {
  console.log(`  ❌ FAIL — expected 575 total links / 560 unique URLs, got ${totalLinks} / ${uniqueUrls}`);
  failed = true;
}

// --- Check E: No hardcoded URLs in src/ (except site.ts & w3.org) --------
header("Check E — No hardcoded URLs in components");
import { readdirSync, statSync } from "node:fs";

function getAllFiles(dirPath, arrayOfFiles) {
  const files = readdirSync(dirPath);
  let acc = arrayOfFiles || [];
  files.forEach(function(file) {
    const fullPath = resolve(dirPath, file);
    if (statSync(fullPath).isDirectory()) {
      acc = getAllFiles(fullPath, acc);
    } else {
      acc.push(fullPath);
    }
  });
  return acc;
}

const srcDir = resolve(ROOT, "src");
const allSrcFiles = getAllFiles(srcDir);
let hardcodedFound = 0;

for (const file of allSrcFiles) {
  if (file.endsWith("site.ts")) continue;
  if (!file.endsWith(".ts") && !file.endsWith(".tsx") && !file.endsWith(".css")) continue;
  
  const content = readFileSync(file, "utf-8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/https?:\/\//)) {
      if (line.includes("w3.org")) continue; // Allow XML namespaces
      console.log(`  ❌ FAIL — Hardcoded URL found in ${file} (line ${i+1}):`);
      console.log(`     ${line.trim()}`);
      hardcodedFound++;
    }
  }
}

// Check if site.ts URLs match allowed-extra.json
const siteTsPath = resolve(ROOT, "src/config/site.ts");
let siteTsContent = "";
try {
  siteTsContent = readFileSync(siteTsPath, "utf-8");
} catch (e) {}

const siteUrlRegex = /https?:\/\/[^"']+/g;
let match;
let siteUrlMiss = 0;
while ((match = siteUrlRegex.exec(siteTsContent)) !== null) {
  const url = match[0];
  if (!allowedExtra.has(url)) {
    console.log(`  ❌ FAIL — URL in site.ts not found in allowed-extra.json: ${url}`);
    siteUrlMiss++;
  }
}

if (hardcodedFound === 0 && siteUrlMiss === 0) {
  console.log(`  ✅ PASS — 0 hardcoded URLs in components, config URLs match allowlist`);
} else {
  failed = true;
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
header("Summary");
console.log(`  Subjects:         ${subjects.length}`);
console.log(`  Total links:      ${totalLinks}`);
console.log(`  Unique URLs:      ${uniqueUrls}`);
console.log(`  all_urls.txt:     ${txtUrlSet.size} unique`);
console.log(`  Allowed extras:   ${allowedOrphans.length}`);
console.log(`  Unlisted orphans: ${orphans.length}`);
console.log(`  Missing from txt: ${missingFromTxt.length}`);
console.log();

if (failed) {
  console.log("  ❌ VERIFICATION FAILED\n");
  process.exit(1);
} else {
  console.log("  ✅ ALL CHECKS PASSED\n");
}
