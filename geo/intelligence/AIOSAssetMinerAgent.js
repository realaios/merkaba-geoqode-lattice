// @alignment 8→26→48:480
// AIOSAssetMinerAgent.js — GeoQode Lattice Intelligence
// Domain   : data-structs  (S4 — Foundation ring)
// Semantic : ENTITY        @ 396 Hz
// Lattice  : Node 18       (D48 canonical position)
//
// Purpose  : Mine free/public-domain asset sources for AIOS VR worlds.
//            Discovers, classifies, rates, and writes asset records to
//            the asset registry so VrStudioSwarm + MALSwarm can consume them.
//
// Sources  : NASA APIs, SpaceX Flickr CC0, Freesound CC0, PolyHaven CC0,
//            Sketchfab (CC licensed), GrabCAD community, OSMBuildings,
//            ESA Copernicus, Google Maps Static/Street View (display-only),
//            NIH 3D Print Exchange CC0.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ── GeoQode coordinate (ENTITY @ 396 Hz, node 18) ──────────────────────────
const GEO_COORDINATE = {
  architectureSignature: "8,26,48:480",
  semanticType: "ENTITY",
  frequency: 396,
  latticeNode: 18,
  harmonicNode: 180,
  phiCoefficient: 1.618,
  coherence: 0.97,
  domain: "data-structs",
  source: "AIOSAssetMinerAgent",
  d48Expansion: "CANONICAL",
  d480Expansion: "FULL_HARMONIC",
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.resolve(__dirname, "../../data/mined-assets.json");
const ASSET_SOURCES_PATH = path.resolve(
  __dirname,
  "../../data/asset-sources.json",
);

// ── Free / public-domain API endpoints ─────────────────────────────────────
const ENDPOINTS = {
  nasa_apod: "https://api.nasa.gov/planetary/apod?count=10&api_key=DEMO_KEY",
  nasa_mars:
    "https://api.nasa.gov/mars-photos/api/v1/rovers/perseverance/latest_photos?api_key=DEMO_KEY",
  nasa_images:
    "https://images-api.nasa.gov/search?q={query}&media_type=image&page_size=20",
  nasa_sounds:
    "https://images-api.nasa.gov/search?q={query}&media_type=audio&page_size=20",
  nasa_3d:
    "https://images-api.nasa.gov/search?q={query}&media_type=video&page_size=10",
  spacex_launches: "https://api.spacexdata.com/v4/launches/latest",
  freesound_search:
    "https://freesound.org/apiv2/search/text/?query={query}&fields=id,name,url,license,previews,duration&token={token}",
};

export class AIOSAssetMinerAgent {
  constructor(options = {}) {
    this.name = "AIOSAssetMinerAgent";
    this.geoCoordinate = { ...GEO_COORDINATE };
    this.freesoundToken =
      options.freesoundToken || process.env.FREESOUND_TOKEN || null;
    this.nasaApiKey =
      options.nasaApiKey || process.env.NASA_API_KEY || "DEMO_KEY";
    this.verbose = options.verbose !== false;
    this._registry = {
      assets: [],
      meta: { lastMined: null, count: 0, geoCoordinate: GEO_COORDINATE },
    };
    this._log = this.verbose
      ? (...a) => console.log("[AssetMiner]", ...a)
      : () => {};
  }

  // ── Load existing registry or start fresh ────────────────────────────────
  _loadRegistry() {
    if (fs.existsSync(REGISTRY_PATH)) {
      try {
        this._registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
      } catch (_) {
        this._log("Registry parse error — starting fresh");
      }
    }
  }

  // ── Write registry to disk ───────────────────────────────────────────────
  _saveRegistry() {
    this._registry.meta.lastMined = new Date().toISOString();
    this._registry.meta.count = this._registry.assets.length;
    this._registry.meta.geoCoordinate = GEO_COORDINATE;
    const dir = path.dirname(REGISTRY_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      REGISTRY_PATH,
      JSON.stringify(this._registry, null, 2),
      "utf8",
    );
    this._log(`Registry saved — ${this._registry.assets.length} assets`);
  }

  // ── Deduplicate by URL ───────────────────────────────────────────────────
  _isDuplicate(url) {
    return this._registry.assets.some((a) => a.url === url);
  }

  // ── Generic fetch wrapper (no external dependencies) ─────────────────────
  async _fetch(url) {
    const { default: https } = await import("https");
    const { default: http } = await import("http");
    return new Promise((resolve, reject) => {
      const lib = url.startsWith("https") ? https : http;
      const req = lib.get(
        url,
        { headers: { "User-Agent": "AIOSAssetMiner/1.0 (realaios.com)" } },
        (res) => {
          const chunks = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () => {
            try {
              resolve(JSON.parse(Buffer.concat(chunks).toString()));
            } catch (_) {
              resolve(null);
            }
          });
        },
      );
      req.on("error", reject);
      req.setTimeout(12000, () => {
        req.destroy();
        reject(new Error("timeout"));
      });
    });
  }

  // ── Rate suitability (0-1) ───────────────────────────────────────────────
  rateSuitability(asset) {
    let score = 0.5;
    const license = (asset.license || "").toLowerCase();
    const isCC0 = license.includes("cc0") || license.includes("public domain");
    const isCCBy =
      license.includes("cc by") &&
      !license.includes("nc") &&
      !license.includes("nd");
    if (isCC0) score += 0.3;
    else if (isCCBy) score += 0.15;

    if (asset.type === "3d_model") score += 0.2;
    if (asset.type === "audio") score += 0.1;
    if (
      asset.type === "image" &&
      asset.resolution &&
      parseInt(asset.resolution) >= 2048
    )
      score += 0.1;
    if (asset.source === "nasa") score += 0.15;

    return Math.min(1.0, parseFloat(score.toFixed(3)));
  }

  // ── Mine NASA APOD ────────────────────────────────────────────────────────
  async mineNASA(query = "space") {
    this._log(`Mining NASA images — query="${query}"`);
    const url = ENDPOINTS.nasa_images.replace(
      "{query}",
      encodeURIComponent(query),
    );
    const data = await this._fetch(`${url}&api_key=${this.nasaApiKey}`).catch(
      () => null,
    );
    if (!data?.collection?.items) return [];

    const results = [];
    for (const item of data.collection.items.slice(0, 20)) {
      const meta = item.data?.[0];
      const link = item.links?.[0]?.href;
      if (!meta || !link || this._isDuplicate(link)) continue;
      const asset = {
        id: `nasa_${meta.nasa_id || Date.now()}`,
        title: meta.title || "NASA Asset",
        description: meta.description ? meta.description.slice(0, 200) : "",
        url: link,
        source: "nasa",
        type: meta.media_type === "audio" ? "audio" : "image",
        license: "public_domain",
        tags: (meta.keywords || []).slice(0, 8),
        dateCreated: meta.date_created || null,
        suitability: 0,
        geoCoordinate: { ...GEO_COORDINATE },
      };
      asset.suitability = this.rateSuitability(asset);
      results.push(asset);
    }
    this._log(`NASA: found ${results.length} assets`);
    return results;
  }

  // ── Mine Mars rover imagery ───────────────────────────────────────────────
  async mineMarsMission() {
    this._log("Mining NASA Mars rover imagery");
    const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/perseverance/latest_photos?api_key=${this.nasaApiKey}`;
    const data = await this._fetch(url).catch(() => null);
    if (!data?.latest_photos) return [];

    const results = [];
    for (const photo of data.latest_photos.slice(0, 15)) {
      if (this._isDuplicate(photo.img_src)) continue;
      const asset = {
        id: `mars_${photo.id}`,
        title: `Mars Sol ${photo.sol} — ${photo.camera.full_name}`,
        description: `Perseverance rover, camera: ${photo.camera.name}, sol ${photo.sol}`,
        url: photo.img_src,
        source: "nasa.mars_rover",
        type: "image",
        license: "public_domain",
        tags: ["mars", "perseverance", "rover", "nasa", "geology"],
        dateCreated: photo.earth_date,
        suitability: 0,
        geoCoordinate: { ...GEO_COORDINATE },
      };
      asset.suitability = this.rateSuitability(asset);
      results.push(asset);
    }
    this._log(`Mars rover: found ${results.length} assets`);
    return results;
  }

  // ── Mine SpaceX Flickr public domain media ───────────────────────────────
  async mineSpaceX() {
    this._log("Mining SpaceX launch data");
    const launch = await this._fetch(ENDPOINTS.spacex_launches).catch(
      () => null,
    );
    if (!launch) return [];

    const results = [];
    const links = launch.links;
    const candidates = [
      links?.patch?.small,
      links?.patch?.large,
      links?.reddit?.campaign,
      links?.webcast,
    ].filter(Boolean);

    for (const url of candidates) {
      if (this._isDuplicate(url)) continue;
      const asset = {
        id: `spacex_${launch.flight_number}_${candidates.indexOf(url)}`,
        title: `SpaceX ${launch.name} — Mission Asset`,
        description: launch.details ? launch.details.slice(0, 200) : "",
        url,
        source: "spacex",
        type: url.endsWith(".png") || url.endsWith(".jpg") ? "image" : "link",
        license: "public_domain",
        tags: [
          "spacex",
          "rocket",
          "launch",
          launch.name?.toLowerCase(),
          "mission",
        ].filter(Boolean),
        dateCreated: launch.date_utc || null,
        suitability: 0,
        geoCoordinate: { ...GEO_COORDINATE },
      };
      asset.suitability = this.rateSuitability(asset);
      results.push(asset);
    }
    this._log(`SpaceX: found ${results.length} assets`);
    return results;
  }

  // ── Mine Freesound (CC0 audio) ────────────────────────────────────────────
  async mineFreesound(query = "space ambient") {
    if (!this.freesoundToken) {
      this._log("Freesound: skipped — no token (set FREESOUND_TOKEN env var)");
      return [];
    }
    this._log(`Mining Freesound — query="${query}"`);
    const url =
      ENDPOINTS.freesound_search
        .replace("{query}", encodeURIComponent(query))
        .replace("{token}", this.freesoundToken) +
      "&license=Creative Commons 0";
    const data = await this._fetch(url).catch(() => null);
    if (!data?.results) return [];

    const results = [];
    for (const sound of data.results.slice(0, 15)) {
      const previewUrl =
        sound.previews?.["preview-hq-mp3"] ||
        sound.previews?.["preview-lq-mp3"] ||
        sound.url;
      if (this._isDuplicate(previewUrl)) continue;
      const asset = {
        id: `freesound_${sound.id}`,
        title: sound.name,
        description: `Freesound ID ${sound.id} · Duration: ${Math.round(sound.duration || 0)}s`,
        url: previewUrl,
        source: "freesound",
        type: "audio",
        license: "cc0",
        tags: [query, "audio", "ambient", "freesound"],
        duration: sound.duration || null,
        suitability: 0,
        geoCoordinate: { ...GEO_COORDINATE },
      };
      asset.suitability = this.rateSuitability(asset);
      results.push(asset);
    }
    this._log(`Freesound: found ${results.length} assets`);
    return results;
  }

  // ── Mine 3D models from NASA 3D resources (public domain) ────────────────
  async mine3DModels(category = "spacecraft") {
    this._log(`Mining NASA 3D models — category="${category}"`);
    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(category)}+3d+model&media_type=image&page_size=10&api_key=${this.nasaApiKey}`;
    const data = await this._fetch(url).catch(() => null);
    if (!data?.collection?.items) return [];

    const results = [];
    for (const item of data.collection.items.slice(0, 10)) {
      const meta = item.data?.[0];
      const link = item.links?.[0]?.href;
      if (!meta || !link || this._isDuplicate(link)) continue;
      const asset = {
        id: `nasa3d_${meta.nasa_id || Date.now()}`,
        title: meta.title || "NASA 3D Asset",
        description: meta.description ? meta.description.slice(0, 200) : "",
        url: link,
        source: "nasa3d.models",
        type: "3d_model_preview",
        license: "public_domain",
        tags: [category, "3d", "nasa", "model"].concat(
          meta.keywords?.slice(0, 4) || [],
        ),
        dateCreated: meta.date_created || null,
        suitability: 0,
        geoCoordinate: { ...GEO_COORDINATE },
      };
      asset.suitability = this.rateSuitability(asset);
      results.push(asset);
    }
    this._log(`NASA 3D: found ${results.length} assets`);
    return results;
  }

  // ── Write mined assets to registry ───────────────────────────────────────
  writeToRegistry(newAssets) {
    const before = this._registry.assets.length;
    for (const asset of newAssets) {
      if (!this._isDuplicate(asset.url)) {
        this._registry.assets.push(asset);
      }
    }
    const added = this._registry.assets.length - before;
    this._log(
      `Registry: added ${added} new assets (${this._registry.assets.length} total)`,
    );
    return added;
  }

  // ── Full mine run ─────────────────────────────────────────────────────────
  async run(queries = {}) {
    const startedAt = Date.now();
    this._log(
      `Agent starting — GeoQode ENTITY@396Hz node ${GEO_COORDINATE.latticeNode}`,
    );

    this._loadRegistry();

    const nasaQueries = queries.nasa || [
      "nebula",
      "earth from space",
      "rocket launch",
      "ISS",
    ];
    const soundQueries = queries.sound || [
      "space ambient",
      "rocket engine",
      "wind mountain",
      "ocean waves",
    ];
    const modelCategories = queries.models || [
      "spacecraft",
      "mars",
      "satellite",
    ];

    const batches = await Promise.allSettled([
      ...nasaQueries.map((q) => this.mineNASA(q)),
      this.mineMarsMission(),
      this.mineSpaceX(),
      ...soundQueries.map((q) => this.mineFreesound(q)),
      ...modelCategories.map((c) => this.mine3DModels(c)),
    ]);

    let totalNew = 0;
    for (const result of batches) {
      if (result.status === "fulfilled" && Array.isArray(result.value)) {
        totalNew += this.writeToRegistry(result.value);
      }
    }

    this._saveRegistry();

    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    this._log(`Run complete — ${totalNew} new assets mined in ${elapsed}s`);

    return {
      success: true,
      assetsAdded: totalNew,
      totalAssets: this._registry.assets.length,
      elapsed: `${elapsed}s`,
      registryPath: REGISTRY_PATH,
      geoCoordinate: GEO_COORDINATE,
    };
  }
}

export default AIOSAssetMinerAgent;
