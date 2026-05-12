/**
 * aios-mal-injector.mjs
 * @alignment 8->26->48:480
 * Reads mined-assets.json and injects qualifying 3D model assets
 * into data/mal/props-warehouse.json (MAL — Merkaba Asset Loader).
 *
 * Usage:
 *   node scripts/aios-mal-injector.mjs
 *   node scripts/aios-mal-injector.mjs --dry-run
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const MINED_ASSETS_PATH = path.join(ROOT, "data", "mined-assets.json");
const MAL_PATH = path.join(ROOT, "data", "mal", "props-warehouse.json");

// GeoQode coordinate (ENTITY @ 396 Hz — data structures)
const GEO_COORDINATE = {
  architectureSignature: "8,26,48:480",
  semanticType: "ENTITY",
  frequency: 396,
  latticeNode: 18,
  harmonicNode: 180,
  phiCoefficient: 1.618,
  coherence: 0.95,
  domain: "data-structs",
  source: "aios-mal-injector",
};

const MIN_SUITABILITY = 0.6;
const MAX_PER_RUN = 50;
const DRY_RUN = process.argv.includes("--dry-run");

// ── Tag -> MAL category mapping ─────────────────────────────────────────────
const TAG_TO_MAL_CATEGORY = {
  spacecraft: "scientific",
  satellite: "scientific",
  telescope: "scientific",
  probe: "scientific",
  rover: "scientific",
  rocket: "vehicle",
  shuttle: "vehicle",
  capsule: "vehicle",
  lander: "vehicle",
  building: "architecture",
  station: "architecture",
  city: "architecture",
  habitat: "architecture",
  character: "character",
  robot: "character",
  humanoid: "character",
  costume: "costume",
  suit: "costume",
  armor: "costume",
};

function inferMALCategory(tags = []) {
  for (const tag of tags) {
    const t = tag.toLowerCase();
    for (const [kw, cat] of Object.entries(TAG_TO_MAL_CATEGORY)) {
      if (t.includes(kw)) return cat;
    }
  }
  return "scientific"; // default for space-themed content
}

function buildAFrameEntitySnippet(asset, malId) {
  const src = asset.downloadUrl || asset.url;
  const title = (asset.title || malId).replace(/"/g, "'");
  return `<a-gltf-model id="${malId}" src="${src}" scale="1 1 1" position="0 0 0" shadow="cast: true; receive: true" title="${title}"></a-gltf-model>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("[MALInjector] Starting — GeoQode ENTITY@396Hz node 18");
  console.log("[MALInjector] Dry run:", DRY_RUN);

  if (!fs.existsSync(MINED_ASSETS_PATH)) {
    console.log("[MALInjector] No mined-assets.json found.");
    return { injected: 0 };
  }

  const minedData = JSON.parse(fs.readFileSync(MINED_ASSETS_PATH, "utf8"));
  const allAssets = minedData.assets || [];
  console.log(`[MALInjector] Loaded ${allAssets.length} mined assets`);

  // Only inject 3D models with a direct download URL
  const eligible = allAssets.filter(
    (a) =>
      a.suitability >= MIN_SUITABILITY &&
      a.type === "3d_model" &&
      (a.downloadUrl ||
        (a.url && (a.url.endsWith(".gltf") || a.url.endsWith(".glb")))),
  );
  console.log(`[MALInjector] Eligible 3D models: ${eligible.length}`);

  if (!fs.existsSync(MAL_PATH)) {
    console.log("[MALInjector] props-warehouse.json not found, skipping.");
    return { injected: 0 };
  }

  const mal = JSON.parse(fs.readFileSync(MAL_PATH, "utf8"));

  // Build set of existing asset URLs to avoid duplicates
  const existingUrls = new Set();
  const allProps = Object.values(mal.categories || {}).flat();
  for (const prop of allProps) {
    if (prop.url) existingUrls.add(prop.url);
    if (prop.downloadUrl) existingUrls.add(prop.downloadUrl);
  }
  // Also check top-level assets array
  for (const a of mal.assets || []) {
    if (a.url) existingUrls.add(a.url);
  }

  if (!mal.categories) mal.categories = {};
  if (!mal.assets) mal.assets = [];

  let injected = 0;
  let skipped = 0;

  for (const asset of eligible.slice(0, MAX_PER_RUN)) {
    const assetUrl = asset.downloadUrl || asset.url;
    if (existingUrls.has(assetUrl)) {
      skipped++;
      continue;
    }

    const category = inferMALCategory(asset.tags || []);
    const malId =
      `mined_${asset.source || "asset"}_${(asset.id || "").replace(/\W+/g, "_")}`.slice(
        0,
        72,
      );

    const malEntry = {
      id: malId,
      title: asset.title || malId,
      url: assetUrl,
      downloadUrl: asset.downloadUrl || null,
      source: asset.source || "mined",
      license: asset.license || "unknown",
      format: asset.format || "gltf",
      category,
      tags: (asset.tags || []).slice(0, 8),
      thumbnailUrl: asset.thumbnailUrl || null,
      suitability: asset.suitability,
      minedAt: asset.minedAt || new Date().toISOString(),
      // Ready-to-use A-Frame snippet
      aframeSnippet: buildAFrameEntitySnippet(asset, malId),
      geoCoordinate: { ...GEO_COORDINATE },
    };

    if (!DRY_RUN) {
      if (!mal.categories[category]) mal.categories[category] = [];
      mal.categories[category].push(malEntry);
      mal.assets.push(malEntry);
      existingUrls.add(assetUrl);
    } else {
      console.log(
        `[MALInjector] DRY-RUN would inject: ${malId} -> ${category}`,
      );
    }

    injected++;
  }

  if (!DRY_RUN && injected > 0) {
    mal.total_assets = (mal.assets || []).length;
    mal.last_injected = new Date().toISOString();
    mal.geoCoordinate = GEO_COORDINATE;
    fs.writeFileSync(MAL_PATH, JSON.stringify(mal, null, 2), "utf8");
    console.log(
      `[MALInjector] Updated props-warehouse.json — total: ${mal.total_assets}`,
    );
  }

  console.log(
    `[MALInjector] Done — injected: ${injected}, skipped (exist): ${skipped}`,
  );
  return { injected, skipped, total: (mal.assets || []).length };
}

main()
  .then((result) => {
    console.log("[MALInjector] Result:", result);
    process.exit(0);
  })
  .catch((err) => {
    console.error("[MALInjector] Fatal:", err);
    process.exit(1);
  });
