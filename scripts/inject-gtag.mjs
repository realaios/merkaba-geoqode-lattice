#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const publicDir67 = join(__dirname, "..", "public-67aios");

const GTAG = `
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18009079831"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-18009079831');
  </script>
</head>`;

const SKIP = new Set(["googlea5a53438b491ad23.html"]);

let total = 0,
  skipped = 0,
  updated = 0;

function processDir(dir) {
  let files;
  try {
    files = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of files) {
    if (!name.endsWith(".html") || SKIP.has(name)) continue;
    const path = join(dir, name);
    const content = readFileSync(path, "utf8");
    total++;
    if (content.includes("AW-18009079831")) {
      console.log(`SKIP (already tagged): ${name}`);
      skipped++;
      continue;
    }
    if (!content.includes("</head>")) {
      console.log(`SKIP (no </head>): ${name}`);
      skipped++;
      continue;
    }
    const newContent = content.replace("</head>", GTAG);
    writeFileSync(path, newContent, "utf8");
    console.log(`OK: ${name}`);
    updated++;
  }
}

processDir(publicDir);
processDir(publicDir67);

console.log(`\nResult: ${updated} updated, ${skipped} skipped, ${total} total`);
