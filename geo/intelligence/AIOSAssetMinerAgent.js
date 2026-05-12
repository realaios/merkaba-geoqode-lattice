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
//            Sketchfab (CC licensed glTF), Poly Pizza (CC0 glTF),
//            GrabCAD community, OSMBuildings, ESA Copernicus,
//            Google Maps Static/Street View (display-only),
//            NIH 3D Print Exchange CC0.
//
// TODO [A23D] : A23D (https://www.a23d.co) — 520K+ 3D assets, glTF format.
//   No public REST API exists. Integration options when subscribed:
//   Option 1 — Plugin API Sniff: Install A23D Blender plugin, run Fiddler/
//     Charles proxy, capture auth token + download endpoints, replicate in
//     Node.js. Key to intercept: auth header, asset ID pattern, format param.
//   Option 2 — Playwright automation: Login → browse → intercept download
//     URL → stream to R2. Higher ToS risk, use with rate limits + random
//     delays to mimic human behaviour.
//   Implement as: mineA23D(category, maxAssets) in this agent when ready.
//   Registry key: source="a23d", license="commercial-subscription"

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
  // Sketchfab REST API — requires SKETCHFAB_API_KEY env var
  sketchfab_search:
    "https://api.sketchfab.com/v3/models?downloadable=true&license=cc&type=models&sort_by=-likeCount&count=24&q={query}",
  sketchfab_download: "https://api.sketchfab.com/v3/models/{uid}/download",
  // PolyHaven — CC0, no auth required
  polyhaven_assets: "https://api.polyhaven.com/assets?t={type}",
  polyhaven_files: "https://api.polyhaven.com/files/{slug}",
  // Poly Pizza — CC0 glTF models
  polypizza_search:
    "https://poly.pizza/api/search?q={query}&format=gltf&limit=20",
  // NASA 3D model browser (public domain gltf/obj files)
  nasa3d_models: "https://nasa3d.arc.nasa.gov/api/nasaModels",
};

export class AIOSAssetMinerAgent {
  constructor(options = {}) {
    this.name = "AIOSAssetMinerAgent";
    this.geoCoordinate = { ...GEO_COORDINATE };
    this.freesoundToken =
      options.freesoundToken || process.env.FREESOUND_TOKEN || null;
    this.nasaApiKey =
      options.nasaApiKey || process.env.NASA_API_KEY || "DEMO_KEY";
    this.sketchfabApiKey =
      options.sketchfabApiKey || process.env.SKETCHFAB_API_KEY || null;
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

  // ── Mine Sketchfab CC/CC0 downloadable glTF models ───────────────────────
  async mineSketchfab(query = "space station") {
    if (!this.sketchfabApiKey) {
      this._log("Sketchfab: skipped — no key (set SKETCHFAB_API_KEY env var)");
      return [];
    }
    this._log(`Mining Sketchfab glTF — query="${query}"`);
    const url = ENDPOINTS.sketchfab_search.replace(
      "{query}",
      encodeURIComponent(query),
    );
    const data = await this._fetchAuth(
      url,
      `Token ${this.sketchfabApiKey}`,
    ).catch(() => null);
    if (!data?.results) return [];

    const results = [];
    for (const model of data.results.slice(0, 12)) {
      const thumbnailUrl = model.thumbnails?.images?.[0]?.url || null;
      const uid = model.uid;
      if (!uid) continue;
      // Build a stable viewer/embed URL; download URL requires a separate auth call
      const embedUrl = `https://sketchfab.com/models/${uid}/embed`;
      const apiUrl = `https://api.sketchfab.com/v3/models/${uid}`;
      if (this._isDuplicate(apiUrl)) continue;

      const license = (model.license?.label || "CC BY 4.0").toLowerCase();
      const asset = {
        id: `sketchfab_${uid}`,
        title: model.name || "Sketchfab Model",
        description: (model.description || "").slice(0, 200),
        url: apiUrl,
        embedUrl,
        thumbnailUrl,
        sketchfabUid: uid,
        source: "sketchfab",
        type: "3d_model",
        format: "gltf",
        license,
        tags: (model.tags || []).map((t) => t.name || t).slice(0, 8),
        viewCount: model.viewCount || 0,
        likeCount: model.likeCount || 0,
        suitability: 0,
        geoCoordinate: { ...GEO_COORDINATE },
        // Download endpoint — call separately with auth once ready to embed
        downloadEndpoint: ENDPOINTS.sketchfab_download.replace("{uid}", uid),
      };
      asset.suitability = this.rateSuitability(asset);
      results.push(asset);
    }
    this._log(`Sketchfab: found ${results.length} models for "${query}"`);
    return results;
  }

  // ── Mine PolyHaven CC0 (HDRIs, textures, 3D models) ─────────────────────
  async minePolyHaven(type = "hdri", maxItems = 20) {
    this._log(`Mining PolyHaven — type="${type}"`);
    const url = ENDPOINTS.polyhaven_assets.replace("{type}", type);
    const data = await this._fetch(url).catch(() => null);
    if (!data || typeof data !== "object") return [];

    const entries = Object.entries(data).slice(0, maxItems);
    const results = [];
    for (const [slug, meta] of entries) {
      const assetUrl = `https://api.polyhaven.com/files/${slug}`;
      if (this._isDuplicate(assetUrl)) continue;

      let downloadUrl = null;
      if (type === "hdri") {
        downloadUrl = `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/${slug}_4k.hdr`;
      } else if (type === "3d-model" || type === "models") {
        downloadUrl = `https://dl.polyhaven.org/file/ph-assets/3D%20Models/gltf/${slug}/${slug}.gltf`;
      }

      const asset = {
        id: `polyhaven_${slug}`,
        title: meta.name || slug,
        description: meta.name
          ? `PolyHaven ${type}: ${meta.name}`
          : `PolyHaven ${slug}`,
        url: assetUrl,
        downloadUrl,
        slug,
        source: "polyhaven",
        type: type === "hdri" ? "hdri_environment" : "3d_model",
        format: type === "hdri" ? "hdr" : "gltf",
        license: "cc0",
        tags: [type, "polyhaven", "cc0", ...(meta.tags || []).slice(0, 5)],
        categories: meta.categories || [],
        suitability: 0,
        geoCoordinate: { ...GEO_COORDINATE },
        // A-Frame usage:
        //   HDRI   → <a-sky src="${downloadUrl}">
        //   Model  → <a-gltf-model src="${downloadUrl}">
        aframeComponent: type === "hdri" ? "a-sky" : "a-gltf-model",
      };
      asset.suitability = this.rateSuitability(asset);
      results.push(asset);
    }
    this._log(`PolyHaven: found ${results.length} ${type} assets`);
    return results;
  }

  // ── Mine Poly Pizza CC0 glTF models ─────────────────────────────────────
  async minePolyPizza(query = "space") {
    this._log(`Mining Poly Pizza glTF — query="${query}"`);
    // Poly Pizza has a public JSON search endpoint
    const url = `https://poly.pizza/api/search?q=${encodeURIComponent(query)}&format=gltf&limit=20`;
    const data = await this._fetch(url).catch(() => null);
    // Response varies — try both result shapes
    const items =
      data?.results || data?.models || (Array.isArray(data) ? data : null);
    if (!items) {
      this._log(`Poly Pizza: no results (API may require auth key, skipping)`);
      return [];
    }

    const results = [];
    for (const model of items.slice(0, 16)) {
      const modelUrl = model.download || model.url || model.gltf;
      if (!modelUrl || this._isDuplicate(modelUrl)) continue;
      const asset = {
        id: `polypizza_${model.id || model.slug || Date.now()}`,
        title: model.name || model.title || "Poly Pizza Model",
        description: model.description ? model.description.slice(0, 200) : "",
        url: modelUrl,
        thumbnailUrl: model.thumbnail || model.image || null,
        source: "polypizza",
        type: "3d_model",
        format: "gltf",
        license: "cc0",
        tags: [query, "polypizza", "cc0", "gltf"],
        suitability: 0,
        geoCoordinate: { ...GEO_COORDINATE },
        aframeComponent: "a-gltf-model",
      };
      asset.suitability = this.rateSuitability(asset);
      results.push(asset);
    }
    this._log(`Poly Pizza: found ${results.length} models for "${query}"`);
    return results;
  }

  // ── Mine NASA 3D resources page (known public-domain glTF/OBJ) ───────────
  async mineNASA3DKnownModels() {
    this._log("Mining NASA 3D known public-domain models");
    // These are stable, well-known NASA 3D asset URLs (public domain)
    const KNOWN_NASA_3D = [
      {
        id: "nasa3d_iss",
        title: "International Space Station",
        url: "https://nasa3d.arc.nasa.gov/models/iss",
        tags: ["iss", "space_station", "nasa"],
      },
      {
        id: "nasa3d_hubble",
        title: "Hubble Space Telescope",
        url: "https://nasa3d.arc.nasa.gov/models/hubble",
        tags: ["hubble", "telescope", "nasa"],
      },
      {
        id: "nasa3d_perseverance",
        title: "Mars Perseverance Rover",
        url: "https://nasa3d.arc.nasa.gov/models/mars_perseverance_rover",
        tags: ["mars", "rover", "perseverance", "nasa"],
      },
      {
        id: "nasa3d_artemis_sls",
        title: "Artemis SLS Rocket",
        url: "https://nasa3d.arc.nasa.gov/models/sls",
        tags: ["rocket", "artemis", "sls", "nasa"],
      },
      {
        id: "nasa3d_orion",
        title: "Orion Capsule",
        url: "https://nasa3d.arc.nasa.gov/models/orion_capsule",
        tags: ["orion", "capsule", "nasa", "artemis"],
      },
      {
        id: "nasa3d_apollo_lm",
        title: "Apollo Lunar Module",
        url: "https://nasa3d.arc.nasa.gov/models/apollo_lunar_module",
        tags: ["apollo", "moon", "lm", "nasa"],
      },
      {
        id: "nasa3d_saturn_v",
        title: "Saturn V Rocket",
        url: "https://nasa3d.arc.nasa.gov/models/saturn_v",
        tags: ["saturn_v", "rocket", "apollo", "nasa"],
      },
      {
        id: "nasa3d_webb",
        title: "James Webb Space Telescope",
        url: "https://nasa3d.arc.nasa.gov/models/webb",
        tags: ["webb", "telescope", "jwst", "nasa"],
      },
      {
        id: "nasa3d_voyager",
        title: "Voyager Spacecraft",
        url: "https://nasa3d.arc.nasa.gov/models/voyager",
        tags: ["voyager", "spacecraft", "nasa"],
      },
      {
        id: "nasa3d_spitzer",
        title: "Spitzer Space Telescope",
        url: "https://nasa3d.arc.nasa.gov/models/spitzer",
        tags: ["spitzer", "telescope", "nasa"],
      },
    ];

    const results = [];
    for (const m of KNOWN_NASA_3D) {
      if (this._isDuplicate(m.url)) continue;
      const asset = {
        ...m,
        description: `${m.title} — NASA 3D Resources (public domain)`,
        source: "nasa3d.known",
        type: "3d_model",
        format: "gltf_or_obj",
        license: "public_domain",
        suitability: 0,
        geoCoordinate: { ...GEO_COORDINATE },
        aframeComponent: "a-gltf-model",
        downloadNote: "Visit URL to get direct .glb/.gltf download link",
      };
      asset.suitability = this.rateSuitability(asset);
      results.push(asset);
    }
    this._log(`NASA 3D known: registered ${results.length} canonical models`);
    return results;
  }

  // ── Generic fetch wrapper (no external dependencies) ─────────────────────
  async _fetch(url) {
    const { default: https } = await import("https");
    const { default: http } = await import("http");
    return new Promise((resolve, reject) => {
      const lib = url.startsWith("https") ? https : http;
      const req = lib.get(
        url,
        { headers: { "User-Agent": "AIOSAssetMiner/2.0 (realaios.com)" } },
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
      req.setTimeout(14000, () => {
        req.destroy();
        reject(new Error("timeout"));
      });
    });
  }

  // ── Authenticated fetch (Bearer / Token header) ───────────────────────────
  async _fetchAuth(url, authHeader) {
    const { default: https } = await import("https");
    const { default: http } = await import("http");
    return new Promise((resolve, reject) => {
      const lib = url.startsWith("https") ? https : http;
      const req = lib.get(
        url,
        {
          headers: {
            "User-Agent": "AIOSAssetMiner/2.0 (realaios.com)",
            Authorization: authHeader,
          },
        },
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
      req.setTimeout(14000, () => {
        req.destroy();
        reject(new Error("timeout"));
      });
    });
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

  // ── Full mine run — all sources ───────────────────────────────────────────
  async run(queries = {}) {
    const startedAt = Date.now();
    this._log(
      `Agent starting — GeoQode ENTITY@396Hz node ${GEO_COORDINATE.latticeNode}`,
    );

    this._loadRegistry();

    // ── Configurable query sets ──────────────────────────────────────────
    const nasaQueries = queries.nasa || [
      "nebula",
      "earth from space",
      "rocket launch",
      "ISS",
      "galaxy",
      "aurora",
    ];
    const soundQueries = queries.sound || [
      "space ambient",
      "rocket engine",
      "wind mountain",
      "ocean waves",
      "forest birds",
    ];
    const modelCategories = queries.models || [
      "spacecraft",
      "mars",
      "satellite",
      "planet",
    ];
    const sketchfabQueries = queries.sketchfab || [
      "space station interior",
      "alien planet environment",
      "futuristic city",
      "sci-fi room",
      "nebula skybox",
      "spaceship cockpit",
    ];
    const polyPizzaQueries = queries.polyPizza || [
      "space",
      "rock stone",
      "nature tree",
      "robot character",
      "architecture",
    ];

    // ── Run all miners in parallel ───────────────────────────────────────
    const batches = await Promise.allSettled([
      // NASA imagery
      ...nasaQueries.map((q) => this.mineNASA(q)),
      // Mars rover imagery
      this.mineMarsMission(),
      // SpaceX launches
      this.mineSpaceX(),
      // Freesound CC0 audio
      ...soundQueries.map((q) => this.mineFreesound(q)),
      // NASA images API 3D search
      ...modelCategories.map((c) => this.mine3DModels(c)),
      // NASA 3D known canonical models
      this.mineNASA3DKnownModels(),
      // Sketchfab CC glTF (requires SKETCHFAB_API_KEY)
      ...sketchfabQueries.map((q) => this.mineSketchfab(q)),
      // PolyHaven CC0 HDRIs (for <a-sky> environments)
      this.minePolyHaven("hdri"),
      // PolyHaven CC0 3D models (for <a-gltf-model>)
      this.minePolyHaven("3d-model"),
      // Poly Pizza CC0 glTF models
      ...polyPizzaQueries.map((q) => this.minePolyPizza(q)),
    ]);

    let totalNew = 0;
    for (const result of batches) {
      if (result.status === "fulfilled" && Array.isArray(result.value)) {
        totalNew += this.writeToRegistry(result.value);
      } else if (result.status === "rejected") {
        this._log("Batch error:", result.reason?.message || result.reason);
      }
    }

    this._saveRegistry();

    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    this._log(`Run complete — ${totalNew} new assets mined in ${elapsed}s`);
    this._log(`Total registry: ${this._registry.assets.length} assets`);

    return {
      success: true,
      assetsAdded: totalNew,
      totalAssets: this._registry.assets.length,
      elapsed: `${elapsed}s`,
      registryPath: REGISTRY_PATH,
      geoCoordinate: GEO_COORDINATE,
      sources: {
        nasa: nasaQueries.length + 2, // queries + mars + spacex
        freesound: soundQueries.length,
        nasaModels: modelCategories.length + 1, // categories + known
        sketchfab: sketchfabQueries.length,
        polyhaven: 2, // hdri + models
        polyPizza: polyPizzaQueries.length,
      },
    };
  }
}

export default AIOSAssetMinerAgent;
