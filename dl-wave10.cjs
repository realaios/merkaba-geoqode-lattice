const https = require("https");
const fs = require("fs");
const path = require("path");

const SKIES_DIR = "public/geoassets/skies";
const BASE =
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/";

const slugs = [
  "dam_road",
  "amsterdam_canal",
  "cape_hill",
  "cobblestone_street_night",
  "grand_ballroom",
  "industrial_hall_01",
  "jacaranda_park",
  "kalwaria_park",
  "lane_in_a_village",
  "japanese_garden_2k",
  "alpine_lake",
  "city_ambiance",
  "evening_meadow",
  "forest_glade",
  "gravel_alley",
];

function download(slug) {
  return new Promise((resolve) => {
    const outPath = path.join(SKIES_DIR, slug + ".jpg");
    if (fs.existsSync(outPath)) {
      const sz = (fs.statSync(outPath).size / 1024 / 1024).toFixed(1);
      console.log("EXISTS: " + slug + " (" + sz + "MB)");
      return resolve({ slug, status: "exists" });
    }
    const url = BASE + slug + ".jpg";
    const file = fs.createWriteStream(outPath);
    https
      .get(url, (res) => {
        if (res.statusCode === 200) {
          res.pipe(file);
          file.on("finish", () => {
            file.close(() => {
              const sz = (fs.statSync(outPath).size / 1024 / 1024).toFixed(1);
              console.log("OK: " + slug + " (" + sz + "MB)");
              resolve({ slug, status: "ok", size: parseFloat(sz) });
            });
          });
        } else {
          file.close();
          fs.unlinkSync(outPath);
          console.log("FAIL " + res.statusCode + ": " + slug);
          resolve({ slug, status: "fail", code: res.statusCode });
        }
      })
      .on("error", (e) => {
        file.close();
        try {
          fs.unlinkSync(outPath);
        } catch {}
        console.log("ERR: " + slug + " " + e.message);
        resolve({ slug, status: "err" });
      });
  });
}

(async () => {
  for (const s of slugs) {
    await download(s);
  }
  console.log("Download batch done.");
})();
