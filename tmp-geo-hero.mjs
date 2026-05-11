import { readFileSync, writeFileSync } from "fs";
const file = "public/geo-codec.html";
let html = readFileSync(file, "utf8");

// === 1. Remove PLAIstore from nav if still present ===
// Normalise to LF for all string matching, then restore on write
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");
console.log("CRLF:", usesCRLF);

const plaiHref =
  '><a href="/plaistore">PLAIstore</a\n        ><a href="/geo-codec"';
if (html.includes(plaiHref)) {
  html = html.replace(plaiHref, '><a href="/geo-codec"');
  console.log("PLAIstore removed from nav");
}

// === 2. Extract LIVE CODEC DEMO block ===
const DEMO_START = "    <!-- -- LIVE CODEC DEMO";
const DEMO_END = "\n\n    <!-- -- DECLARATION";
const demoStart = html.indexOf(DEMO_START);
const demoEnd = html.indexOf(DEMO_END);
if (demoStart === -1 || demoEnd === -1) {
  console.error("DEMO block not found:", { demoStart, demoEnd });
  process.exit(1);
}
const demoBlock = html.slice(demoStart, demoEnd);
html = html.slice(0, demoStart).trimEnd() + "\n" + html.slice(demoEnd);
console.log("demoBlock extracted, length:", demoBlock.length);

// === 3. Modify block for hero position ===
let heroBlock = demoBlock
  .replace(
    "<!-- -- LIVE CODEC DEMO ------------------------------------------------- -->",
    "<!-- -- LIVE CODEC HERO ------------------------------------------------- -->",
  )
  .replace(
    '<div class="wrap" style="padding-top: 0">',
    '<div class="wrap geo-hero-demo" style="padding-top: 86px">',
  );

// === 4. Insert right after </nav> ===
const NAV_END = "    </nav>";
const navIdx = html.indexOf(NAV_END) + NAV_END.length;
html =
  html.slice(0, navIdx) +
  "\n\n" +
  heroBlock.trimEnd() +
  "\n" +
  html.slice(navIdx);
console.log("heroBlock inserted after nav");

// === 5. Update mobile CSS for demo ===
const OLD = `        .demo-grid {
          grid-template-columns: 1fr;
        }
        .demo-panel {
          border-left: none;
          border-top: 1px solid rgba(0, 212, 255, 0.18);
        }`;

const NEW = `        /* --- demo hero mobile --- */
        .geo-hero-demo { padding-top: 68px !important; }
        .demo-header { margin-bottom: 20px; }
        .demo-header h2 { font-size: 1.55rem; }
        .demo-header p { font-size: 0.85rem; }
        .demo-grid { grid-template-columns: 1fr; }
        #demo-cv { height: 300px; }
        .demo-panel {
          border-left: none;
          border-top: 1px solid rgba(0, 212, 255, 0.18);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        .dp-title, .dp-status { grid-column: 1 / -1; }
        .dp-status { padding-top: 10px; }
        .dp-key { font-size: 0.7rem; }
        .dp-val { font-size: 0.78rem; }
        .geo-file-card { display: none; }`;

if (html.indexOf(OLD) === -1) {
  console.error("OLD mobile CSS not found");
  process.exit(1);
}
html = html.replace(OLD, NEW);
console.log("mobile CSS updated");

// Restore CRLF if original had it
if (usesCRLF) html = html.replace(/\n/g, "\r\n");

writeFileSync(file, html, "utf8");
console.log("done, bytes:", Buffer.byteLength(html, "utf8"));
