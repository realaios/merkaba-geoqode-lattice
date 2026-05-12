/**
 * aios-vr-scene-generator.mjs
 * @alignment 8->26->48:480
 * Reads mined-assets.json and auto-generates:
 *   1. New vr-taxonomy.json entries (ENTITY @ 396 Hz)
 *   2. Individual A-Frame scene HTML files under public/geo-experiences/
 *
 * Usage:
 *   node scripts/aios-vr-scene-generator.mjs
 *   node scripts/aios-vr-scene-generator.mjs --dry-run
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const MINED_ASSETS_PATH = path.join(ROOT, "data", "mined-assets.json");
const TAXONOMY_PATH = path.join(ROOT, "data", "vr-taxonomy.json");
const GEO_EXPERIENCES_DIR = path.join(ROOT, "public", "geo-experiences");

// GeoQode coordinate (ACTION @ 528 Hz — creating VR experiences)
const GEO_COORDINATE = {
  architectureSignature: "8,26,48:480",
  semanticType: "ACTION",
  frequency: 528,
  latticeNode: 8,
  harmonicNode: 80,
  phiCoefficient: 1.618,
  coherence: 0.95,
  domain: "code-eng",
  source: "aios-vr-scene-generator",
};

const MIN_SUITABILITY = 0.5;
const MAX_SCENES_PER_RUN = 30;

const DRY_RUN = process.argv.includes("--dry-run");

// ── Tag-to-category mapping for VR taxonomy ─────────────────────────────────
const TAG_CATEGORY_MAP = {
  space: "space-exploration",
  nasa: "space-exploration",
  nebula: "space-exploration",
  galaxy: "space-exploration",
  spacecraft: "space-exploration",
  mars: "space-exploration",
  planet: "space-exploration",
  telescope: "space-exploration",
  iss: "space-exploration",
  rover: "space-exploration",
  rocket: "space-exploration",
  nature: "nature",
  forest: "nature",
  ocean: "nature",
  earth: "nature",
  mountain: "nature",
  rock: "nature",
  tree: "nature",
  architecture: "architecture",
  building: "architecture",
  city: "architecture",
  futuristic: "architecture",
  robot: "science",
  science: "science",
  laboratory: "science",
};

function inferCategory(tags = []) {
  for (const tag of tags) {
    const t = tag.toLowerCase();
    for (const [keyword, cat] of Object.entries(TAG_CATEGORY_MAP)) {
      if (t.includes(keyword)) return cat;
    }
  }
  return "discovery";
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function nextLatticeNode(existingCount) {
  return (existingCount % 48) + 0;
}

function nextHarmonicNode(existingCount) {
  return (existingCount % 480) + 0;
}

// ── Build A-Frame scene HTML for a 3D model asset ───────────────────────────
function buildSceneHTML(asset, id) {
  const isHDRI = asset.type === "hdri_environment";
  const isGLTF =
    asset.type === "3d_model" &&
    ["gltf", "gltf_or_obj"].includes(asset.format || "");
  const title = asset.title || id;

  const skyElement = isHDRI
    ? `<a-sky src="${asset.downloadUrl || asset.url}" rotation="0 -130 0"></a-sky>`
    : `<a-sky color="#0a0a1a"></a-sky>`;

  const modelElement = isGLTF
    ? `<a-gltf-model src="${asset.downloadUrl || asset.url}" position="0 0 -5" scale="0.5 0.5 0.5" rotation="0 45 0" animation="property: rotation; to: 0 405 0; loop: true; dur: 12000"></a-gltf-model>`
    : `<!-- ${asset.type}: no direct gltf src available -->
      <a-box color="#4a90d9" position="0 1.5 -5" rotation="45 45 0" scale="1 1 1"
        animation="property: rotation; to: 405 405 0; loop: true; dur: 8000"></a-box>`;

  const thumbnailPanel = asset.thumbnailUrl
    ? `<a-plane src="${asset.thumbnailUrl}" position="-3 2.5 -6" width="2.5" height="2" rotation="0 20 0" opacity="0.9"></a-plane>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | AIOS VR</title>
  <script src="/vendor/aframe-1.4.0.min.js"><\/script>
  <style>
    body { margin: 0; overflow: hidden; background: #000; }
    #exit-btn {
      position: fixed; top: 12px; right: 12px; z-index: 9999;
      padding: 8px 18px; background: rgba(0,0,0,0.7);
      color: #fff; border: 1px solid rgba(255,255,255,0.3);
      border-radius: 6px; cursor: pointer; font-family: sans-serif;
      text-decoration: none; font-size: 14px;
    }
    #asset-info {
      position: fixed; bottom: 18px; left: 18px; z-index: 9999;
      background: rgba(0,0,0,0.65); color: #e0e0e0;
      padding: 10px 16px; border-radius: 8px;
      font-family: sans-serif; font-size: 13px; max-width: 340px;
    }
    #asset-info h3 { margin: 0 0 4px; font-size: 15px; color: #fff; }
    #asset-info p  { margin: 2px 0; font-size: 11px; opacity: 0.8; }
  </style>
</head>
<body>
  <a href="/vr.html" id="exit-btn">&#x2715; Exit VR</a>
  <div id="asset-info">
    <h3>${title}</h3>
    <p>Source: ${asset.source || "unknown"}</p>
    <p>License: ${asset.license || "unknown"}</p>
    <p>Type: ${asset.type || "3d_model"}</p>
  </div>

  <a-scene background="color: #0a0a1a" renderer="colorManagement: true; physicallyCorrectLights: true">

    <!-- Lighting -->
    <a-light type="ambient" intensity="0.6" color="#ffffff"></a-light>
    <a-light type="directional" position="2 4 3" intensity="1.2" color="#ffffff"></a-light>
    <a-light type="point" position="-2 2 -3" intensity="0.8" color="#4488ff"></a-light>

    <!-- Environment / Sky -->
    ${skyElement}

    <!-- Merkaba lattice particle field -->
    <a-entity particle-system="preset: dust; particleCount: 300; color: #7b68ee,#4169e1; size: 0.03; maxAge: 8; velocityValue: 0 0 0; velocitySpread: 0.1 0.1 0.1; opacity: 0.4"></a-entity>

    <!-- Main asset -->
    ${modelElement}

    <!-- Thumbnail panel (if available) -->
    ${thumbnailPanel}

    <!-- GeoQode ground plane -->
    <a-plane color="#0d0d2b" rotation="-90 0 0" width="30" height="30"
      material="roughness: 0.9; metalness: 0.1; opacity: 0.9"></a-plane>

    <!-- Merkaba octahedron decoration -->
    <a-entity geometry="primitive: octahedron; radius: 0.3"
      material="color: #7b68ee; opacity: 0.6; wireframe: true"
      position="3 1 -4"
      animation="property: rotation; to: 360 360 0; loop: true; dur: 6000"></a-entity>

    <!-- Camera rig -->
    <a-entity id="rig" position="0 1.6 4">
      <a-camera look-controls wasd-controls cursor="rayOrigin: mouse">
        <a-cursor color="#00ffaa" opacity="0.8"></a-cursor>
      </a-camera>
    </a-entity>

    <!-- VR controllers -->
    <a-entity oculus-touch-controls="hand: left"></a-entity>
    <a-entity oculus-touch-controls="hand: right"></a-entity>

  </a-scene>
</body>
</html>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("[VRSceneGen] Starting — GeoQode ACTION@528Hz node 8");
  console.log("[VRSceneGen] Dry run:", DRY_RUN);

  // Load mined assets
  if (!fs.existsSync(MINED_ASSETS_PATH)) {
    console.log(
      "[VRSceneGen] No mined-assets.json found. Run AIOSAssetMinerAgent first.",
    );
    return { generated: 0, skipped: 0 };
  }

  const minedData = JSON.parse(fs.readFileSync(MINED_ASSETS_PATH, "utf8"));
  const allAssets = minedData.assets || [];
  console.log(`[VRSceneGen] Loaded ${allAssets.length} mined assets`);

  // Filter to glTF-compatible and HDRI assets above suitability threshold
  const eligible = allAssets.filter(
    (a) =>
      a.suitability >= MIN_SUITABILITY &&
      (a.type === "3d_model" || a.type === "hdri_environment") &&
      (a.downloadUrl || a.url),
  );
  console.log(
    `[VRSceneGen] Eligible assets: ${eligible.length} (suitability >= ${MIN_SUITABILITY})`,
  );

  // Load taxonomy
  const taxonomy = JSON.parse(fs.readFileSync(TAXONOMY_PATH, "utf8"));

  // Build set of existing experience IDs to avoid duplicates
  const existingIds = new Set();
  for (const cat of taxonomy.categories || []) {
    for (const exp of cat.experiences || []) {
      existingIds.add(exp.id);
    }
  }

  // Ensure geo-experiences output directory exists
  if (!DRY_RUN && !fs.existsSync(GEO_EXPERIENCES_DIR)) {
    fs.mkdirSync(GEO_EXPERIENCES_DIR, { recursive: true });
    console.log("[VRSceneGen] Created directory:", GEO_EXPERIENCES_DIR);
  }

  // Map category IDs in taxonomy for quick lookup
  const categoryMap = {};
  for (const cat of taxonomy.categories || []) {
    categoryMap[cat.id] = cat;
  }

  let generated = 0;
  let skipped = 0;
  const newEntries = []; // { categoryId, entry }

  for (const asset of eligible.slice(0, MAX_SCENES_PER_RUN)) {
    const slug = slugify(asset.title || asset.id || "scene");
    const expId = `geo-${asset.source || "asset"}-${slug}`.slice(0, 80);

    if (existingIds.has(expId)) {
      skipped++;
      continue;
    }

    const categoryId = inferCategory(asset.tags || []);
    const vrUrl = `/geo-experiences/${expId}.html`;
    const htmlPath = path.join(GEO_EXPERIENCES_DIR, `${expId}.html`);

    // Write A-Frame scene HTML
    if (!DRY_RUN) {
      const html = buildSceneHTML(asset, expId);
      fs.writeFileSync(htmlPath, html, "utf8");
    } else {
      console.log(`[VRSceneGen] DRY-RUN would write: ${htmlPath}`);
    }

    const existingCount = taxonomy.totalExperiences || 82;
    const entry = {
      id: expId,
      display: asset.title || slug,
      status: "live",
      vrUrl,
      flatUrl: vrUrl,
      semanticType: "ENTITY",
      frequencyHz: 396,
      latticeNode: nextLatticeNode(existingCount + generated),
      harmonicNode: nextHarmonicNode(existingCount + generated),
      tags: (asset.tags || []).slice(0, 6),
      questCompatible: true,
      license: asset.license || "unknown",
      source: asset.source || "mined",
      minedAssetId: asset.id,
      geoCoordinate: {
        ...GEO_COORDINATE,
        semanticType: "ENTITY",
        frequency: 396,
      },
    };

    newEntries.push({ categoryId, entry });
    existingIds.add(expId);
    generated++;
  }

  if (!DRY_RUN && newEntries.length > 0) {
    // Inject new entries into taxonomy
    for (const { categoryId, entry } of newEntries) {
      let cat = categoryMap[categoryId];
      if (!cat) {
        // Create new category if it doesn't exist
        cat = {
          id: categoryId,
          display: categoryId
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          experiences: [],
        };
        taxonomy.categories.push(cat);
        categoryMap[categoryId] = cat;
      }
      if (!cat.experiences) cat.experiences = [];
      cat.experiences.push(entry);
    }

    // Update counts
    taxonomy.totalExperiences = (taxonomy.totalExperiences || 0) + generated;
    taxonomy.liveCount =
      (taxonomy.liveCount || 0) +
      newEntries.filter((e) => e.entry.status === "live").length;
    taxonomy.lastGeneratedAt = new Date().toISOString();
    taxonomy.geoCoordinate = GEO_COORDINATE;

    fs.writeFileSync(TAXONOMY_PATH, JSON.stringify(taxonomy, null, 2), "utf8");
    console.log(
      `[VRSceneGen] Updated vr-taxonomy.json — total: ${taxonomy.totalExperiences}`,
    );
  }

  console.log(
    `[VRSceneGen] Done — generated: ${generated}, skipped (exist): ${skipped}`,
  );
  return { generated, skipped, total: taxonomy.totalExperiences };
}

main()
  .then((result) => {
    console.log("[VRSceneGen] Result:", result);
    process.exit(0);
  })
  .catch((err) => {
    console.error("[VRSceneGen] Fatal:", err);
    process.exit(1);
  });
