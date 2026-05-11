const fs = require("fs");
const file = "public/aios-playground.html";
let html = fs.readFileSync(file, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// Fix all "? LEVEL UP!" - both HTML and JS (literal string replace, not regex)
html = html.split("? LEVEL UP!").join("\u2605 LEVEL UP!");

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(file, html, "utf8");

// Verify
const c = fs.readFileSync(file, "utf8");
const remaining = (c.match(/\? LEVEL UP!/g) || []).length;
console.log("Done. Remaining '? LEVEL UP!': " + remaining);
