"use strict";
// fix-dedup2.cjs — precision line-range removal (0-indexed)
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let raw = fs.readFileSync(FILE, "utf8");

const usesCRLF = raw.includes("\r\n");
if (usesCRLF) raw = raw.replace(/\r\n/g, "\n");

let lines = raw.split("\n");
const original = lines.length;

// Verify we're cutting the right things
function verifyLine(idx, expected) {
  const actual = lines[idx] ? lines[idx].trim() : "(missing)";
  const pass = lines[idx] && lines[idx].includes(expected);
  console.log(
    `  Line ${idx + 1} [${pass ? "OK" : "FAIL"}]: "${actual.slice(0, 70)}" (expected: "${expected}")`,
  );
  return pass;
}

console.log("=== Verifying cut points ===");
// dark-matter-web: 1-indexed 5421-5509 → 0-indexed 5420-5508
// Line 5421 (0-idx 5420) should be the /* ==== DARK MATTER WEB comment
// Line 5509 (0-idx 5508) should be blank (after });)
const ok1a = verifyLine(5420, "/* ====");
const ok1b = verifyLine(5429, 'AFRAME.registerComponent("dark-matter-web"');
const ok1c = verifyLine(5507, "});"); // component close
// rogue-planet: 1-indexed 6287-6380 → 0-indexed 6286-6379
// Line 6287 (0-idx 6286) should be the /* ==== ROGUE PLANET comment
// Line 6380 (0-idx 6379) should be blank (after });)
const ok2a = verifyLine(6286, "/* ====");
const ok2b = verifyLine(6300, 'AFRAME.registerComponent("rogue-planet"');
const ok2c = verifyLine(6378, "});"); // component close

if (!ok1a || !ok1b || !ok1c || !ok2a || !ok2b || !ok2c) {
  console.error("VERIFICATION FAILED — aborting");
  process.exit(1);
}

console.log("\n=== Removing duplicates ===");

// Remove rogue-planet FIRST (higher index, so dark-matter-web indices are unaffected)
// rogue-planet: 0-indexed 6286-6379 inclusive
console.log(
  `  Removing rogue-planet: lines ${6287}–${6380} (${6380 - 6287 + 1} lines)`,
);
lines.splice(6286, 6380 - 6287 + 1); // remove 94 lines (idx 6286, count 94)

// dark-matter-web: 0-indexed 5420-5508 inclusive
console.log(
  `  Removing dark-matter-web: lines ${5421}–${5509} (${5509 - 5421 + 1} lines)`,
);
lines.splice(5420, 5509 - 5421 + 1); // remove 89 lines (idx 5420, count 89)

console.log(`  Lines removed: ${original - lines.length} (expected ~183)`);

// Verify the correct (later) copies are still there
const joined = lines.join("\n");
const dmwCount = (
  joined.match(/AFRAME\.registerComponent\("dark-matter-web"/g) || []
).length;
const rpCount = (
  joined.match(/AFRAME\.registerComponent\("rogue-planet"/g) || []
).length;
console.log(`  dark-matter-web copies: ${dmwCount} (expected 1)`);
console.log(`  rogue-planet copies:    ${rpCount} (expected 1)`);

if (dmwCount !== 1 || rpCount !== 1) {
  console.error("COUNT MISMATCH — aborting");
  process.exit(1);
}

let out = lines.join("\n");
if (usesCRLF) out = out.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, out, "utf8");
console.log(`\nDone! Written ${lines.length} lines.`);
