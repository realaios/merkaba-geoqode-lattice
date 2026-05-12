const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const MAX_W = 4096,
  QUALITY = 75,
  SKIES = "public/geoassets/skies";
const targets = [
  "belfast_sunset",
  "goegap",
  "lauter_waterfall",
  "chinese_garden",
  "photo_studio_loft_hall",
  "kloppenheim_02",
  "satara_night",
  "moonlit_golf",
  "dreifaltigkeitsberg",
  "spaichingen_hill",
];
(async () => {
  for (const name of targets) {
    const f = path.join(SKIES, name + ".jpg");
    if (!fs.existsSync(f)) {
      console.log("SKIP (missing): " + name);
      continue;
    }
    const before = fs.statSync(f).size;
    if (before <= 5 * 1024 * 1024) {
      console.log(
        name + ".jpg: " + (before / 1024 / 1024).toFixed(1) + "MB - OK",
      );
      continue;
    }
    const meta = await sharp(f).metadata();
    let s = sharp(f);
    if (meta.width > MAX_W) s = s.resize(MAX_W, null, { kernel: "lanczos3" });
    const tmp = f + ".tmp";
    await s.jpeg({ quality: QUALITY, progressive: true }).toFile(tmp);
    fs.renameSync(tmp, f);
    const after = fs.statSync(f).size;
    console.log(
      name +
        ".jpg: " +
        (before / 1024 / 1024).toFixed(1) +
        " -> " +
        (after / 1024 / 1024).toFixed(1) +
        " MB",
    );
  }
  console.log("Done.");
})();
