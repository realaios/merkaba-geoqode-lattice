import { readFileSync, writeFileSync } from "fs";
const path =
  "c:/Users/bradl/source/storm-ai/merkaba-geoqode-lattice/public/index.html";
let c = readFileSync(path, "utf8");
const before = c.length;
// Remove manually injected Google Ads block (handles both \r\n and \n)
c = c.replace(
  /[\r\n]+[ \t]*<!-- Google tag \(gtag\.js\) -->\r?\n[ \t]*<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=AW-18009079831"><\/script>\r?\n[ \t]*<script>[\s\S]*?<\/script>\r?\n(?=<\/head>)/,
  "\n",
);
console.log(
  "Before:",
  before,
  "After:",
  c.length,
  "Removed:",
  before - c.length,
  "bytes",
);
console.log("AW tag still present:", c.includes("AW-18009079831"));
writeFileSync(path, c, "utf8");
