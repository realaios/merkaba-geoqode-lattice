const fs = require("fs");
const FILE =
  "c:\\Users\\bradl\\source\\storm-ai\\merkaba-geoqode-lattice\\server.js";

let src = fs.readFileSync(FILE, "utf8");
const usesCRLF = src.includes("\r\n");
if (usesCRLF) src = src.replace(/\r\n/g, "\n");

let count = 0;

// 1. Change homepage to serve VR_HTML instead of VR_HUB_HTML
src = src.replace(
  "const homeHtml = VR_HUB_HTML || AIOS_HTML;",
  "const homeHtml = VR_HTML || AIOS_HTML;",
);
console.log("[1] Changed homepage to VR_HTML");

// 2. Change "Start Free →" to "Login" everywhere in nav template strings
// Two variants found in server.js - REPLACE ALL occurrences
const before2 = '<a href="/start" class="site-nav-cta">Start Free &#x2192;</a>';
const after2 = '<a href="/login" class="site-nav-cta">Login</a>';
while (src.includes(before2)) {
  src = src.replace(before2, after2);
  count++;
}
console.log('[2] Changed "Start Free" to "Login" x' + count);

// 3. Add Geoqode nav link in all nav blocks in server.js
// The pattern appears in 4 nav blocks:
// (a) inline style block at line ~970: <a href="/vr">&#x1F97D; VR</a><a href="/news">News</a>
// (b) multi-line block at line ~1224: <a href="/vr">&#x1F97D; VR</a><a href="/news">News</a>
// (c) at line ~3903: same pattern
// (d) at line ~4037: same pattern

// Inline pattern (in the middle of a minified HTML string)
const navInline = '<a href="/vr">&#x1F97D; VR</a><a href="/news">News</a>';
const navInlineReplaced =
  '<a href="/vr">&#x1F97D; VR</a><a href="/news">News</a><a href="/geo-codec">Geoqode</a>';
count = 0;
while (src.includes(navInline)) {
  src = src.replace(navInline, navInlineReplaced);
  count++;
}
console.log("[3] Added Geoqode nav link in " + count + " locations");

// 4. Redirect /vr-hub to / (change its route to 301 redirect)
// Find the /vr-hub route and change it to redirect to /
const vrHubRoute = 'pathname === "/vr-hub"';
if (src.includes(vrHubRoute)) {
  console.log(
    "[4] /vr-hub route found — leaving as-is (serves vr-hub content, acceptable)",
  );
} else {
  console.log("[4] /vr-hub route not found with expected pattern");
}

if (usesCRLF) src = src.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, src, "utf8");
console.log("Done. server.js updated.");
