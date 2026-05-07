/**
 * purge-fake-data.mjs
 * Removes ALL fake/simulated/seeded data from server.js:
 *   1. Fake baseline install seed block
 *   2. Auto-increment setInterval (30s fake counter)
 *   3. Seeded leaderboard fake scores block
 *   4. Hardcoded `downloads: NNN` on all static & runtime apps  → 0
 *   5. Fake `rating_avg: random` on runtime apps → 0
 *   6. Fix _plaiRuntimeList() sort to use real install counts
 *   7. Fix total_installs to use only real _plaiInstallCounts data
 *   8. Enrich app downloads with real install counts before API response
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const file = join(__dir, "../server.js");
let c = readFileSync(file, "utf8");

// ── 1. Hardcoded downloads: NNN → downloads: 0 (all static apps) ──────────
const before1 = (c.match(/downloads:\s*\d+,/g) || []).length;
c = c.replace(/downloads:\s*\d+,/g, "downloads: 0,");
console.log(`✅ [1] Replaced ${before1} hardcoded downloads: NNN → 0`);

// ── 2. Fake rating_avg on runtime apps → 0 ────────────────────────────────
if (c.includes("4.2 + Math.random() * 0.7")) {
  c = c.replace(
    /rating_avg:\s*\+\(4\.2 \+ Math\.random\(\) \* 0\.7\)\.toFixed\(1\),/g,
    "rating_avg: 0,",
  );
  console.log("✅ [2] Removed fake random rating_avg → 0");
} else {
  console.log("ℹ️  [2] rating_avg fake pattern not found (already removed?)");
}

// ── 3. Fake baseline install seed block ───────────────────────────────────
const baselineStart = "// Seed realistic baseline install counts at startup";
const baselineEnd = "}"; // closes the surrounding block
const biStart = c.indexOf(baselineStart);
if (biStart !== -1) {
  // Find the closing } of the block (it's wrapped in { ... })
  // The pattern is: // Seed realistic...\n{\n  ...\n}\n
  const blockOpen = c.indexOf("{", biStart);
  let depth = 0,
    blockClose = -1;
  for (let i = blockOpen; i < c.length; i++) {
    if (c[i] === "{") depth++;
    else if (c[i] === "}") {
      depth--;
      if (depth === 0) {
        blockClose = i;
        break;
      }
    }
  }
  if (blockClose !== -1) {
    c = c.slice(0, biStart) + c.slice(blockClose + 1);
    console.log("✅ [3] Removed fake baseline install seed block");
  }
} else {
  console.log("ℹ️  [3] Baseline seed block not found (already removed?)");
}

// ── 4. Auto-increment setInterval (the 30s fake counter) ──────────────────
const autoStart = "// Increments random apps every 30s";
const aiStart = c.indexOf(autoStart);
if (aiStart !== -1) {
  // The pattern is: // comment\nsetInterval(() => {\n  ...\n}, 30000);\n
  const siStart = c.indexOf("setInterval(", aiStart);
  // Find the matching closing ), 30000);
  let depth = 0,
    siClose = -1;
  for (let i = siStart + "setInterval(".length; i < c.length; i++) {
    if (c[i] === "(") depth++;
    else if (c[i] === ")") {
      if (depth === 0) {
        siClose = i;
        break;
      }
      depth--;
    }
  }
  // advance past the ); and trailing newline
  const endIdx = c.indexOf(";", siClose) + 1;
  c = c.slice(0, aiStart) + c.slice(endIdx).replace(/^\s*\n/, "\n");
  console.log("✅ [4] Removed auto-increment setInterval (30s fake counter)");
} else {
  console.log(
    "ℹ️  [4] Auto-increment setInterval not found (already removed?)",
  );
}

// ── 5. Seeded leaderboard fake scores block ───────────────────────────────
const lbStart = "// Seed game leaderboards with historical top scores";
const lbIdx = c.indexOf(lbStart);
if (lbIdx !== -1) {
  const blockOpen = c.indexOf("{", lbIdx);
  let depth = 0,
    blockClose = -1;
  for (let i = blockOpen; i < c.length; i++) {
    if (c[i] === "{") depth++;
    else if (c[i] === "}") {
      depth--;
      if (depth === 0) {
        blockClose = i;
        break;
      }
    }
  }
  if (blockClose !== -1) {
    c = c.slice(0, lbIdx) + c.slice(blockClose + 1).replace(/^\s*\n/, "\n");
    console.log("✅ [5] Removed fake leaderboard seed block");
  }
} else {
  console.log("ℹ️  [5] Leaderboard seed block not found (already removed?)");
}

// ── 6. Fix _plaiRuntimeList() sort → use real install counts ──────────────
const oldSort = `function _plaiRuntimeList() {
  return [..._plaiRuntimeApps.values()].sort(
    (a, b) => (b.downloads || 0) - (a.downloads || 0),
  );
}`;
const newSort = `function _plaiRuntimeList() {
  return [..._plaiRuntimeApps.values()].sort(
    (a, b) => (_plaiInstallCounts.get(b.id) || 0) - (_plaiInstallCounts.get(a.id) || 0),
  );
}`;
if (c.includes(oldSort)) {
  c = c.replace(oldSort, newSort);
  console.log("✅ [6] Fixed _plaiRuntimeList() to sort by real install counts");
} else {
  console.log(
    "⚠️  [6] _plaiRuntimeList sort pattern not matched exactly — check manually",
  );
}

// ── 7. Fix total_installs to use only real data ───────────────────────────
const oldTotal = `      const trackedExtra = [..._plaiInstallCounts.values()].reduce(
        (s, v) => s + v,
        0,
      );
      const total_installs =
        apps.reduce((s, a) => s + (a.downloads || 0), 0) + trackedExtra;`;
const newTotal = `      const total_installs = [..._plaiInstallCounts.values()].reduce(
        (s, v) => s + v,
        0,
      );`;
if (c.includes(oldTotal)) {
  c = c.replace(oldTotal, newTotal);
  console.log(
    "✅ [7] Fixed total_installs to sum only real _plaiInstallCounts",
  );
} else {
  console.log(
    "⚠️  [7] total_installs pattern not matched exactly — check manually",
  );
}

// ── 8. Enrich app downloads with real install counts in GET response ───────
const oldSlice = `      apps = apps.slice(0, limit);
      return json(
        res,
        200,
        { ok: true, apps, total, total_installs },`;
const newSlice = `      // Enrich each app with real install count (only real user clicks via POST /install)
      apps = apps.map(a => ({ ...a, downloads: _plaiInstallCounts.get(a.id) || 0 }));
      apps = apps.slice(0, limit);
      return json(
        res,
        200,
        { ok: true, apps, total, total_installs },`;
if (c.includes(oldSlice)) {
  c = c.replace(oldSlice, newSlice);
  console.log(
    "✅ [8] Enriched app downloads with real install counts before API response",
  );
} else {
  console.log(
    "⚠️  [8] apps.slice pattern not matched exactly — check manually",
  );
}

writeFileSync(file, c, "utf8");
console.log("\n🎯 server.js updated — all fake/simulated data removed.");
console.log(
  "   Only real user clicks via POST /api/plai/apps/:id/install count now.",
);
