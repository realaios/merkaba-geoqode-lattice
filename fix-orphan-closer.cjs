"use strict";
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

// Normalise CRLF → LF for reliable replacements
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ── Idempotency guard ──────────────────────────────────────────────────────
if (html.includes("/* orphan-closer REMOVED */")) {
  console.log("[fix-orphan] Already applied — nothing to do.");
  process.exit(0);
}

// ── Remove the orphan });  that used to close universe-tour at the end of all
//    components but is now spurious since we added a proper }); earlier.
//
//    Context: after cosmic-comets closes with });, there's an extra orphan });
//    then the initGeoNav comment block.
// ──────────────────────────────────────────────────────────────────────────

const OLD = [
  "      });",
  "",
  "      });",
  "",
  "      /* ====================================================================",
  "         GeoAnchor Navigation: Scroll Zoom + Pinch Zoom +",
].join("\n");

// Keep only one }); (cosmic-comets) and the GeoNav block
const NEW = [
  "      }); /* orphan-closer REMOVED */",
  "",
  "      /* ====================================================================",
  "         GeoAnchor Navigation: Scroll Zoom + Pinch Zoom +",
].join("\n");

if (!html.includes(OLD)) {
  console.error("[fix-orphan] ERROR: anchor text not found — check the file.");
  process.exit(1);
}

const count = html.split(OLD).length - 1;
if (count > 1) {
  console.warn(
    `[fix-orphan] WARNING: anchor found ${count} times — applying first occurrence`,
  );
}

html = html.replace(OLD, NEW);

// Restore CRLF if original used it
if (usesCRLF) html = html.replace(/\n/g, "\r\n");

fs.writeFileSync(FILE, html, "utf8");
console.log(
  "[fix-orphan] \u2705  Orphan }); removed — syntax should be clean.",
);
