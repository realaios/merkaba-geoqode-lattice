"use strict";
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

let fixed = 0;

/* ─────────────────────────────────────────────────────────────────────────
   Helper: remove the FIRST occurrence of a component block, including its
   leading comment. The block spans from the start of the comment block
   ("      /* ====") that immediately precedes the registerComponent call,
   to the closing "      });\n" of that component.
───────────────────────────────────────────────────────────────────────── */
function removeFirstComponentBlock(name) {
  const regTag = `AFRAME.registerComponent("${name}",`;
  const firstIdx = html.indexOf(regTag);
  if (firstIdx === -1) {
    console.log(`  NOT FOUND: ${name}`);
    return;
  }
  const secondIdx = html.indexOf(regTag, firstIdx + regTag.length);
  if (secondIdx === -1) {
    console.log(`  SINGLE copy only (ok): ${name}`);
    return;
  }

  // Walk BACKWARDS from firstIdx to find the start of the preceding /* ==== comment
  // Look for the last '\n      /* ====' before firstIdx
  const commentMarker = "\n      /* ====";
  let commentStart = html.lastIndexOf(commentMarker, firstIdx);
  if (commentStart === -1) {
    // fallback: remove from the blank line before registerComponent
    commentStart = html.lastIndexOf("\n\n", firstIdx);
    if (commentStart === -1) commentStart = firstIdx - 1;
  }
  // commentStart points to the '\n' before the comment — include that newline
  const blockStart = commentStart; // keep the '\n' that ends the previous block

  // Walk FORWARDS from firstIdx to find the closing '      });\n'
  const closingMarker = "      });\n";
  let closingIdx = html.indexOf(closingMarker, firstIdx);
  if (closingIdx === -1) {
    console.log(`  Could not find closing for: ${name}`);
    return;
  }
  const blockEnd = closingIdx + closingMarker.length;

  console.log(`  Removing duplicate ${name} (chars ${blockStart}–${blockEnd})`);
  html = html.slice(0, blockStart) + html.slice(blockEnd);
  fixed++;
}

console.log("=== Dedup Fix ===");
removeFirstComponentBlock("dark-matter-web");
removeFirstComponentBlock("rogue-planet");

// Verify no more duplicates
["dark-matter-web", "rogue-planet"].forEach((name) => {
  const regTag = `AFRAME.registerComponent("${name}",`;
  const first = html.indexOf(regTag);
  const second = html.indexOf(regTag, first + regTag.length);
  console.log(
    `  ${name}: first=${first !== -1}, second=${second !== -1} (should be false)`,
  );
});

if (usesCRLF) html = html.replace(/\n/g, "\r\n");

const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
fs.writeFileSync(FILE, html, "utf8");
console.log(
  `Done! Fixed ${fixed} duplicates. File written: ${lineCount} lines`,
);
