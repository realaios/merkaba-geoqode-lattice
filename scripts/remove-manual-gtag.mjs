#!/usr/bin/env node
// Remove manually-injected Google Ads tag from HTML files.
// The server's withMeta() already injects this at runtime — having it in the
// source HTML causes double-firing of the AW-18009079831 conversion tag.
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dirs = [
  join(__dirname, "..", "public"),
  join(__dirname, "..", "public-67aios"),
];

const SKIP = new Set(["googlea5a53438b491ad23.html"]);

// The exact block we injected (inserted before </head>)
const TAG_PATTERN =
  /\n\s{0,4}<!-- Google tag \(gtag\.js\) -->\n\s{0,4}<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=AW-18009079831"><\/script>\n\s{0,4}<script>\n\s{0,8}window\.dataLayer = window\.dataLayer \|\| \[\];\n\s{0,8}function gtag\(\)\{dataLayer\.push\(arguments\);\}\n\s{0,8}gtag\('js', new Date\(\)\);\n\s{0,8}gtag\('config', 'AW-18009079831'\);\n\s{0,4}<\/script>\n<\/head>/;

let updated = 0,
  skipped = 0;

for (const dir of dirs) {
  let files;
  try {
    files = readdirSync(dir);
  } catch {
    continue;
  }
  for (const name of files) {
    if (!name.endsWith(".html") || SKIP.has(name)) continue;
    const path = join(dir, name);
    const content = readFileSync(path, "utf8");
    if (!content.includes("AW-18009079831")) {
      console.log(`SKIP (no manual tag): ${name}`);
      skipped++;
      continue;
    }
    const newContent = content.replace(TAG_PATTERN, "\n</head>");
    if (newContent === content) {
      console.log(`SKIP (pattern no match): ${name}`);
      skipped++;
      continue;
    }
    writeFileSync(path, newContent, "utf8");
    console.log(`CLEANED: ${name}`);
    updated++;
  }
}
console.log(`\nResult: ${updated} cleaned, ${skipped} skipped`);
