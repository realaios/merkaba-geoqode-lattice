"use strict";
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

// Normalise CRLF → LF for reliable replacements
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ── Idempotency guard ──────────────────────────────────────────────────────
if (html.includes("/* universe-tour CLOSED */")) {
  console.log("[fix-universe-tour] Already applied — nothing to do.");
  process.exit(0);
}

// ── The universe-tour component ends its tick method with:
//      window._updateScaleHUD(dist, destLabel);
//          }        ← closes the if-block
//        },         ← closes the tick method (trailing comma OK)
//
// But the OUTER AFRAME.registerComponent("universe-tour", { ... }) call
// is never closed.  We need to insert   });   right after that  },
// ──────────────────────────────────────────────────────────────────────────

const OLD = [
  "            window._updateScaleHUD(dist, destLabel);",
  "          }",
  "        },",
  "",
  "",
  "      /* ====================================================================",
  "         MILKY WAY BAND",
].join("\n");

const NEW = [
  "            window._updateScaleHUD(dist, destLabel);",
  "          }",
  "        }",
  "      }); /* universe-tour CLOSED */",
  "",
  "",
  "      /* ====================================================================",
  "         MILKY WAY BAND",
].join("\n");

if (!html.includes(OLD)) {
  console.error(
    "[fix-universe-tour] ERROR: anchor text not found — check the file.",
  );
  process.exit(1);
}

const count = html.split(OLD).length - 1;
if (count > 1) {
  console.warn(
    `[fix-universe-tour] WARNING: anchor found ${count} times — applying first only`,
  );
}

html = html.replace(OLD, NEW);

// Restore CRLF if original used it
if (usesCRLF) html = html.replace(/\n/g, "\r\n");

fs.writeFileSync(FILE, html, "utf8");
console.log(
  "[fix-universe-tour] \u2705  universe-tour });  injected — welcome screen should be restored.",
);
