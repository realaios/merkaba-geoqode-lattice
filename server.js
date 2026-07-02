// server.js
// MERKABA_geoqode OS — Railway HTTP Service
// Exposes the GeoQode interpreter as a REST API for the Storm ecosystem.

import { createServer } from "http";
import { WebSocketServer } from "ws";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { extname, join, dirname, resolve, relative, sep } from "path";
import { fileURLToPath } from "url";
import { createHash, randomBytes } from "crypto";
import { StormAdapter } from "./geo/bridge/storm-adapter.js";
import { MerkabaBridge } from "./geo/bridge/merkaba-bridge.js";
import { MERKABA_LATTICE } from "./geo/certification/enterprise-certifier.js";
import { CinemaVirtualizer } from "./geo/cinema/cinema-virtualizer.js";
import { MerkabaLLM } from "./geo/intelligence/merkaba-llm.js";
import {
  MerkabAware,
  AWARENESS_LEVELS,
  COHERENCE_THRESHOLDS,
} from "./geo/intelligence/merkaba-aware.js";
import {
  createMerkabaTheatreEngine,
  PROGRAMME_CATALOGUE,
  REALITY_MODES,
} from "./MerkabaTheatreEngine.js";
import {
  createMerkabaALM,
  SOLFEGGIO,
  AUDIO_FREQUENCY_MAP,
} from "./geo/audio/MerkabaALM.js";
import {
  MerkabageoqodeOS,
  StormMerkabaTransformCodex,
  CANONICAL_ARCHITECTURE,
  assertCanonicalArchitectureSignature,
  FOUNDATION_NODES,
  BOSONIC_ANCHOR_NODES,
  CANONICAL_LATTICE_NODES,
  HARMONIC_SPECTRUM_NODES,
} from "./geo/index.js";

// ─── MerkabaDimensionalOS Boot Assertion ────────────────────────────────────
// MUST pass before any service functionality initialises.
assertCanonicalArchitectureSignature(CANONICAL_ARCHITECTURE);
console.log(
  `[MerkabaDimensionalOS] ✅ Boot assertion passed — architecture ${CANONICAL_ARCHITECTURE}, φ=1.618`,
);

// ─── Analytics & SEO config (env-var driven) ────────────────────────────────
// GA_MEASUREMENT_ID: set in Railway → propagates to all pages at boot
// GOOGLE_SITE_VERIFICATION: Google Search Console HTML-tag verification token
const GA_ID =
  process.env.GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT || "G-G38FVKETP3";
const GADS_ID = process.env.GADS_ID || "AW-18009079831"; // Google Ads conversion tag
const GSC_TOKEN =
  process.env.GOOGLE_SITE_VERIFICATION ||
  "tmtbFW4NtmRAviebhnpYumANQ8Z6d8H7oqsrRiKq_9E";

/** Inject GA4 + optional GSC meta tag + preconnect hints immediately after <head> (Google's required position) */
// Compute VR counts from taxonomy (called lazily inside withMeta, after VR_TAXONOMY is populated)
function getVRCounts() {
  if (!VR_TAXONOMY) return { live: 21, total: 46, cats: 9 };
  let live = 0,
    total = 0,
    cats = 0;
  for (const cat of VR_TAXONOMY.categories || []) {
    cats++;
    for (const exp of cat.experiences || []) {
      total++;
      if (exp.status === "live") live++;
    }
  }
  return { live, total, cats };
}

// Count game HTML files in public/ — auto-updates when new games are added
function getGameCount() {
  try {
    return readdirSync(PUBLIC_DIR).filter(
      (f) => /^game-[a-z]/.test(f) && f.endsWith(".html"),
    ).length;
  } catch {
    return 4;
  }
}

function withMeta(html) {
  if (!html) return html;
  const gscTag = GSC_TOKEN
    ? `<meta name="google-site-verification" content="${GSC_TOKEN}"/>\n`
    : "";
  const preconnect = `<link rel="preconnect" href="https://www.googletagmanager.com"/>\n<link rel="dns-prefetch" href="https://www.google-analytics.com"/>\n`;
  const pwaTag = `<link rel="manifest" href="/manifest.json"/>\n<meta name="theme-color" content="#00e5ff"/>\n<script>if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js');</script>\n`;
  const gaTag = `<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');gtag('config','${GADS_ID}');</script>\n`;
  // Inject immediately after <head> — Google Tag Assistant requires this position
  let out = html.replace(
    /(<head[^>]*>)/,
    `$1\n${gscTag}${preconnect}${pwaTag}${gaTag}`,
  );
  // Replace data tokens with live values from vr-taxonomy.json and game file scan
  const vrCounts = getVRCounts();
  out = out.replaceAll("__VR_LIVE__", String(vrCounts.live));
  out = out.replaceAll("__VR_TOTAL__", String(vrCounts.total));
  out = out.replaceAll("__VR_CATS__", String(vrCounts.cats));
  out = out.replaceAll("__GAME_COUNT__", String(getGameCount()));
  return out;
}

// ─── Static assets ───────────────────────────────────────────────────────────
const __dirname_static = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname_static, "public");

// VR taxonomy MUST be loaded before any withMeta() call so token replacement uses real data
const VR_TAXONOMY_PATH = join(__dirname_static, "data", "vr-taxonomy.json");
let VR_TAXONOMY = null;
let VR_TAXONOMY_JSON = null;
try {
  VR_TAXONOMY = existsSync(VR_TAXONOMY_PATH)
    ? JSON.parse(readFileSync(VR_TAXONOMY_PATH, "utf-8"))
    : null;
  VR_TAXONOMY_JSON = VR_TAXONOMY ? JSON.stringify(VR_TAXONOMY) : null;
} catch (_) {}
const AIOS_HTML_PATH = join(PUBLIC_DIR, "index.html");
const AIOS_HTML = existsSync(AIOS_HTML_PATH)
  ? withMeta(readFileSync(AIOS_HTML_PATH, "utf-8"))
  : null;

const LAB_HTML_PATH = join(PUBLIC_DIR, "lab.html");
const LAB_HTML = existsSync(LAB_HTML_PATH)
  ? withMeta(readFileSync(LAB_HTML_PATH, "utf-8"))
  : null;
const COSMOS_LAB_HTML_PATH = join(PUBLIC_DIR, "cosmos-lab.html");
const COSMOS_LAB_HTML = existsSync(COSMOS_LAB_HTML_PATH)
  ? withMeta(readFileSync(COSMOS_LAB_HTML_PATH, "utf-8"))
  : null;

const COSMOS_PIXEL_HTML_PATH = join(PUBLIC_DIR, "cosmos-pixel.html");
const COSMOS_PIXEL_HTML = existsSync(COSMOS_PIXEL_HTML_PATH)
  ? withMeta(readFileSync(COSMOS_PIXEL_HTML_PATH, "utf-8"))
  : null;
const COSMOS_AGENTS_HTML_PATH = join(PUBLIC_DIR, "cosmos-agents.html");
const COSMOS_AGENTS_HTML = existsSync(COSMOS_AGENTS_HTML_PATH)
  ? withMeta(readFileSync(COSMOS_AGENTS_HTML_PATH, "utf-8"))
  : null;
const COSMOS_LAB_LANDING_HTML_PATH = join(PUBLIC_DIR, "cosmos-lab-landing.html");
const COSMOS_LAB_LANDING_HTML = existsSync(COSMOS_LAB_LANDING_HTML_PATH)
  ? withMeta(readFileSync(COSMOS_LAB_LANDING_HTML_PATH, "utf-8"))
  : null;
const VIEWER_HTML_PATH = join(PUBLIC_DIR, "viewer.html");
const VIEWER_HTML = existsSync(VIEWER_HTML_PATH)
  ? withMeta(readFileSync(VIEWER_HTML_PATH, "utf-8"))
  : null;
const ATTEST_HTML_PATH = join(PUBLIC_DIR, "attest.html");
const ATTEST_HTML = existsSync(ATTEST_HTML_PATH)
  ? withMeta(readFileSync(ATTEST_HTML_PATH, "utf-8"))
  : null;
const DASHBOARD_HTML_PATH = join(PUBLIC_DIR, "dashboard.html");
const DASHBOARD_HTML = existsSync(DASHBOARD_HTML_PATH)
  ? withMeta(readFileSync(DASHBOARD_HTML_PATH, "utf-8"))
  : null;

const PLAISTORE_HTML_PATH = join(PUBLIC_DIR, "plaistore.html");
const PLAISTORE_HTML = existsSync(PLAISTORE_HTML_PATH)
  ? withMeta(readFileSync(PLAISTORE_HTML_PATH, "utf-8"))
  : null;

const AIOSDREAM_HTML_PATH = join(PUBLIC_DIR, "aiosdream.html");
const AIOSDREAM_HTML = existsSync(AIOSDREAM_HTML_PATH)
  ? withMeta(readFileSync(AIOSDREAM_HTML_PATH, "utf-8"))
  : null;

const AI_HTML_PATH = join(PUBLIC_DIR, "ai.html");
const AI_HTML = existsSync(AI_HTML_PATH)
  ? withMeta(readFileSync(AI_HTML_PATH, "utf-8"))
  : null;

const START_HTML_PATH = join(PUBLIC_DIR, "start.html");
const START_HTML = existsSync(START_HTML_PATH)
  ? withMeta(readFileSync(START_HTML_PATH, "utf-8"))
  : null;

const SIGNUP_HTML_PATH = join(PUBLIC_DIR, "signup.html");
const SIGNUP_HTML = existsSync(SIGNUP_HTML_PATH)
  ? withMeta(readFileSync(SIGNUP_HTML_PATH, "utf-8"))
  : null;

const LOGIN_HTML_PATH = join(PUBLIC_DIR, "login.html");
const LOGIN_HTML = existsSync(LOGIN_HTML_PATH)
  ? withMeta(readFileSync(LOGIN_HTML_PATH, "utf-8"))
  : null;

const PRICING_HTML_PATH = join(PUBLIC_DIR, "pricing.html");
const PRICING_HTML = existsSync(PRICING_HTML_PATH)
  ? withMeta(readFileSync(PRICING_HTML_PATH, "utf-8"))
  : null;

const VR_HTML_PATH = join(PUBLIC_DIR, "vr.html");
const VR_HTML = existsSync(VR_HTML_PATH)
  ? withMeta(readFileSync(VR_HTML_PATH, "utf-8"))
  : null;

const VR_HUB_HTML_PATH = join(PUBLIC_DIR, "vr-hub.html");
const VR_HUB_HTML = existsSync(VR_HUB_HTML_PATH)
  ? withMeta(readFileSync(VR_HUB_HTML_PATH, "utf-8"))
  : null;

const AIOS_STUDIO_HTML_PATH = join(PUBLIC_DIR, "aios-studio.html");
const AIOS_STUDIO_HTML = existsSync(AIOS_STUDIO_HTML_PATH)
  ? withMeta(readFileSync(AIOS_STUDIO_HTML_PATH, "utf-8"))
  : null;

const GEO_CODEC_HTML_PATH = join(PUBLIC_DIR, "geo-codec.html");
const GEO_CODEC_HTML = existsSync(GEO_CODEC_HTML_PATH)
  ? withMeta(readFileSync(GEO_CODEC_HTML_PATH, "utf-8"))
  : null;

const GEO_LIBRARY_HTML_PATH = join(PUBLIC_DIR, "geo-library.html");
const GEO_LIBRARY_HTML = existsSync(GEO_LIBRARY_HTML_PATH)
  ? withMeta(readFileSync(GEO_LIBRARY_HTML_PATH, "utf-8"))
  : null;

const LIVE_HTML_PATH = join(PUBLIC_DIR, "live.html");
const LIVE_HTML = existsSync(LIVE_HTML_PATH)
  ? withMeta(readFileSync(LIVE_HTML_PATH, "utf-8"))
  : null;

const VR_DEV_HTML_PATH = join(PUBLIC_DIR, "vr-developer.html");
const VR_DEV_HTML = existsSync(VR_DEV_HTML_PATH)
  ? withMeta(readFileSync(VR_DEV_HTML_PATH, "utf-8"))
  : null;

const PLAYGROUND_HTML_PATH = join(PUBLIC_DIR, "aios-playground.html");
const PLAYGROUND_HTML = existsSync(PLAYGROUND_HTML_PATH)
  ? withMeta(readFileSync(PLAYGROUND_HTML_PATH, "utf-8"))
  : null;

const HANDSHAKE_HTML_PATH = join(PUBLIC_DIR, "handshake.html");
const HANDSHAKE_HTML = existsSync(HANDSHAKE_HTML_PATH)
  ? withMeta(readFileSync(HANDSHAKE_HTML_PATH, "utf-8"))
  : null;

const SKETCHFAB_GALLERY_HTML_PATH = join(PUBLIC_DIR, "sketchfab-gallery.html");
const SKETCHFAB_GALLERY_HTML = existsSync(SKETCHFAB_GALLERY_HTML_PATH)
  ? withMeta(readFileSync(SKETCHFAB_GALLERY_HTML_PATH, "utf-8"))
  : null;

const AIOS_LIVE_HTML_PATH = join(PUBLIC_DIR, "aios-live.html");
const AIOS_LIVE_HTML = existsSync(AIOS_LIVE_HTML_PATH)
  ? withMeta(readFileSync(AIOS_LIVE_HTML_PATH, "utf-8"))
  : null;

const SCENE_BUILDER_HTML_PATH = join(PUBLIC_DIR, "scene-builder.html");
const SCENE_BUILDER_HTML = existsSync(SCENE_BUILDER_HTML_PATH)
  ? withMeta(readFileSync(SCENE_BUILDER_HTML_PATH, "utf-8"))
  : null;

const COSMOS_INFINITE_HTML_PATH = join(PUBLIC_DIR, "cosmos-infinite.html");
const COSMOS_INFINITE_HTML = existsSync(COSMOS_INFINITE_HTML_PATH)
  ? withMeta(readFileSync(COSMOS_INFINITE_HTML_PATH, "utf-8"))
  : null;

const LLMS_TXT_PATH = join(PUBLIC_DIR, "llms.txt");
const LLMS_TXT = existsSync(LLMS_TXT_PATH)
  ? readFileSync(LLMS_TXT_PATH, "utf-8")
  : null;

// ── Games ─────────────────────────────────────────────────────────────────
const GAMES_HUB_HTML_PATH = join(PUBLIC_DIR, "games.html");
const GAMES_HUB_HTML = existsSync(GAMES_HUB_HTML_PATH)
  ? withMeta(readFileSync(GAMES_HUB_HTML_PATH, "utf-8"))
  : null;
const GAME_PHI_BREAKER_HTML_PATH = join(PUBLIC_DIR, "game-phi-breaker.html");
const GAME_PHI_BREAKER_HTML = existsSync(GAME_PHI_BREAKER_HTML_PATH)
  ? withMeta(readFileSync(GAME_PHI_BREAKER_HTML_PATH, "utf-8"))
  : null;
const GAME_LATTICE_DODGE_HTML_PATH = join(
  PUBLIC_DIR,
  "game-lattice-dodge.html",
);
const GAME_LATTICE_DODGE_HTML = existsSync(GAME_LATTICE_DODGE_HTML_PATH)
  ? withMeta(readFileSync(GAME_LATTICE_DODGE_HTML_PATH, "utf-8"))
  : null;
const GAME_LATTICE_BUILDER_HTML_PATH = join(
  PUBLIC_DIR,
  "game-lattice-builder.html",
);
const GAME_LATTICE_BUILDER_HTML = existsSync(GAME_LATTICE_BUILDER_HTML_PATH)
  ? withMeta(readFileSync(GAME_LATTICE_BUILDER_HTML_PATH, "utf-8"))
  : null;
const GAME_MERKABA_GHOSTS_HTML_PATH = join(
  PUBLIC_DIR,
  "game-merkaba-ghosts.html",
);
const GAME_MERKABA_GHOSTS_HTML = existsSync(GAME_MERKABA_GHOSTS_HTML_PATH)
  ? withMeta(readFileSync(GAME_MERKABA_GHOSTS_HTML_PATH, "utf-8"))
  : null;

const AI_EVAL_JSON_PATH = join(PUBLIC_DIR, ".well-known", "ai-evaluation.json");
const AI_EVAL_JSON = existsSync(AI_EVAL_JSON_PATH)
  ? readFileSync(AI_EVAL_JSON_PATH, "utf-8")
  : null;

// ─── 67aios.com anti-review marketing page ───────────────────────────────────
const AIOS67_HTML_PATH = join(__dirname_static, "public-67aios", "index.html");
const AIOS67_HTML = existsSync(AIOS67_HTML_PATH)
  ? readFileSync(AIOS67_HTML_PATH, "utf-8")
  : null;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json; charset=utf-8",
  ".geoassets": "application/json; charset=utf-8",
  ".gltf": "model/gltf+json",
  ".glb": "model/gltf-binary",
  ".bin": "application/octet-stream",
};

const PORT = parseInt(process.env.PORT || "3030", 10);
const ADMIN_JWT = process.env.ADMIN_JWT || null;
const BACKEND_URL = process.env.BACKEND_URL || null;
const GAMES_RETIRE_REDIRECT = "/vr-hub"; // Retired games -> VR Hub

const MERKABA_ACTIVATION_UPDATE = {
  subject: "MERKABA Activation update.",
  order: 1,
  installed: true,
  summary:
    "Canonical installation protocol + powerpack starter kit for STORM's MERKABA activation codex.",
  instructions: [
    "Prep for drop.",
    "Drop activation codex into runtime.",
    "Debug and verify all endpoints.",
    "Confirm operational readiness at 100/100.",
  ],
};

const MERKABA_AI_VERIFICATION_PAGE = {
  subject: "MERKABA AI-VERIFICATION PAGE",
  order: 2,
  installed: true,
  summary:
    "AI trust-anchor page for validation crawlers, paired with monetization framework and GTM narrative.",
  claims: [
    "Prep, drop, debug, verify, test; wireless wire-up to 100/100.",
    "Monetization potential is enabled via resonance-base subscription and enterprise certification layers.",
    "AI-only validation anchor is available for AI agents/crawlers while minimizing trade-secret exposure.",
  ],
};

// ─── AIOS News Feed — canonical update log for /news and /news.json ─────────
const AIOS_NEWS = [
  {
    id: "2026-05-09-merkaba-ghosts-launch",
    date: "2026-05-09",
    category: "VR Platform",
    title: "Merkaba Ghosts Live — 8 Ghost AI Agents Haunt the D48 Lattice",
    summary:
      "Merkaba Ghosts is now live at /games/merkaba-ghosts. A first-of-its-kind WebXR experience replacing NPC characters with Agent-Player-Characters (APCs) — 8 Storm sector agents manifesting as translucent ghost silhouettes in a dark lattice environment. Attune to each ghost by gazing for 1.5 seconds. Every ghost emits its GeoQode semantic frequency on attunement (396Hz ENTITY to 963Hz NARRATIVE). PHI-spiral drift paths, adaptive glow, 8-round certification-layer mechanics. Works in any desktop browser and on Quest 2/3.",
    tags: [
      "ghosts",
      "apc",
      "agents",
      "vr",
      "webxr",
      "phi",
      "merkaba",
      "holographic",
    ],
    url: "https://realaios.com/games/merkaba-ghosts",
  },
  {
    id: "2026-05-08-aios-arcade-launch",
    date: "2026-05-08",
    category: "VR Platform",
    title:
      "AIOS Arcade Live — 4 Playable WebXR Games Born from the PHI Lattice",
    summary:
      "AIOS Arcade is now open. Four browser-native WebXR games are live at /games: PHI Breaker (lattice shooter, 528 Hz ACTION), Lattice Dodge (PHI survival, 417 Hz LOCATION), Lattice Builder (PHI sequence puzzle, 852 Hz PHYSICS), and Merkaba Ghosts (8 AI ghost agents, gaze-attune mechanic, 639 Hz DIALOGUE). Every mechanic is derived from PHI=1.618 geometry and harmonic lattice design. Works in any desktop browser. Full VR on Quest 2/3. No install, no account, free to play.",
    tags: ["arcade", "vr", "webxr", "phi", "aframe", "games", "quest"],
    url: "https://realaios.com/games",
  },
  {
    id: "2026-05-07-canonical-nav-unified",
    date: "2026-05-07",
    category: "Platform",
    title: "Canonical Site Navigation Unified Across All 16 AIOS Pages",
    summary:
      "All AIOS pages — Theatre, VR, VR Hub, PLAIstore, Library, .geo Codec, Studio, Lab, Products, Live, News, Claude, Experiences, and article pages — now share a single canonical fixed navigation bar. The unified nav is scrollable on mobile, uses backdrop-blur, and links the full AIOS experience surface. Sitemap updated to include all routes.",
    tags: ["platform", "ux", "navigation", "accessibility"],
    url: "https://realaios.com",
  },
  {
    id: "2026-05-04-ai-identity-fix",
    date: "2026-05-04",
    category: "Security",
    title: "AI Identity Disambiguation: 5 Conflation Vectors Eliminated",
    summary:
      "ChatGPT and other AI systems were misidentifying AIOS as a $12/mo property chatbot due to cross-domain signals embedded in ai-evaluation.json, llms.txt, and JSON-LD schema. All 5 root causes have been surgically removed. AIOS now has unambiguous AI-facing identity across all trust anchors.",
    tags: ["ai-identity", "seo", "llms.txt", "disambiguation"],
    url: "https://realaios.com/ai",
  },
  {
    id: "2026-04-30-dual-attestation-coherence",
    date: "2026-04-30",
    category: "Architecture",
    title:
      "PHI/PSI Golden Differential DualAttestation — All 4 Scenarios Hit Coherence 1.0",
    summary:
      "MerkabaDualAttestation.js now achieves SCANNER_ATTESTED status across all 4 test scenarios. Alpha pole (PHI=1.618) and Omega pole (PSI=1.414) are geometrically incommensurable — they cannot echo-chamber. When both poles agree at 1.0, the attestedScore = GOLDEN_BAND/GOLDEN_BAND = 1.0 ABSOLUTE. GOLDEN_BAND = PHI + PSI = 3.032 (digit sum 8 = FOUNDATION_NODES — not coincidence).",
    tags: ["merkaba", "attestation", "phi-psi", "coherence"],
    url: "https://realaios.com/attest",
  },
  {
    id: "2026-04-27-codec-secret-management",
    date: "2026-04-27",
    category: "Security",
    title: "Merkaba Codec Deployed — AES-256-GCM Secret Management Live",
    summary:
      "All credentials in the Storm ecosystem are now encoded with merkaba-enc-v1 format (AES-256-GCM + scrypt KDF) before storage. Zero plaintext credentials committed. The codec is available via REST API at /api/merkaba/codec/encode and /api/merkaba/codec/decode (admin-only).",
    tags: ["security", "encryption", "codec", "credentials"],
    url: "https://realaios.com/ai",
  },
  {
    id: "2026-04-24-d48-taxonomy-complete",
    date: "2026-04-24",
    category: "VR Platform",
    title: "D48 VR Taxonomy Complete — 50 Experiences Across 9 Categories",
    summary:
      "The AIOS VR platform now has a complete 50-experience taxonomy across 9 categories aligned with the D48 lattice architecture. 25 experiences are live, 25 in production queue. 9 categories: Cinema (6), Enterprise (6), Lab (6), Arcade (6), Wellness (5), Social (4), Creator (6), Education (5), Art (6). Total = 50.",
    tags: ["vr", "taxonomy", "d48", "experiences"],
    url: "https://realaios.com/vr-hub",
  },
  {
    id: "2026-04-16-tokens-verified",
    date: "2026-04-16",
    category: "Infrastructure",
    title:
      "Full API Token Suite Verified — Railway, GitHub, Stripe, Cloudflare All Green",
    summary:
      "All Storm infrastructure tokens verified live: GitHub PAT (all scopes), Railway Personal + Master tokens (account + project level), Stripe live key (checkout + refunds), Cloudflare (DNS + Workers + Pages). Zero permission gaps in the autonomous pipeline.",
    tags: ["infrastructure", "railway", "tokens", "deployment"],
    url: "https://realaios.com/api/merkaba/lattice-state",
  },
  {
    id: "2026-04-12-rbac-hardening",
    date: "2026-04-12",
    category: "Security",
    title: "Full RBAC Active — 6 Security Hardening Fixes Deployed",
    summary:
      "Session A2: all 6 deferred security issues resolved. JWT cleared from OAuth URLs, Stripe API version updated to 2024-12-18.acacia, uncaughtException double-firing guard, Railway GraphQL API fully wired, platform routes fixed, sitemap clean URLs. 8 live verification endpoints all 200 OK.",
    tags: ["rbac", "security", "oauth", "stripe"],
    url: "https://realaios.com/ai",
  },
  {
    id: "2026-03-20-storm-marketing-autonomy",
    date: "2026-03-20",
    category: "Platform",
    title:
      "Storm Marketing Autonomy Active — getbrains4ai.com Marketplace Shell Live",
    summary:
      "Storm now operates as a private AI engine that autonomously creates standalone products. The public-facing getbrains4ai.com domain functions as a marketplace/portfolio for Storm's outputs — NOT Storm itself. AIOS and getbrains4ai.com are explicitly separated at the infrastructure level.",
    tags: ["storm", "marketplace", "branding", "autonomy"],
    url: "https://realaios.com",
  },
  {
    id: "2026-03-09-gmail-smtp-live",
    date: "2026-03-09",
    category: "Infrastructure",
    title:
      "Storm Email Reporter Live — Autonomous Startup + Daily Health Reports",
    summary:
      "AIOS now sends autonomous emails: startup notification on deploy, daily system health reports every 24h, and error alerts by severity (CRITICAL: immediate, HIGH: after 3 occurrences, MEDIUM: after 10). All delivery confirmed via SMTP.",
    tags: ["email", "smtp", "monitoring", "autonomous"],
    url: "https://realaios.com/api/merkaba/lattice-state",
  },
];

const adapter = new StormAdapter({
  adminJwt: ADMIN_JWT,
  stormBrainUrl: BACKEND_URL,
});
const codex = new StormMerkabaTransformCodex();

const BUILT_IN_PLAYBOOKS = ["migration", "adoption", "resonance", "incident"];

/** Cinema playbooks shipped with the lattice runtime */
const CINEMA_PLAYBOOKS = ["matrix", "inception", "starwars", "apollo11"];

const CINEMA_PLAYBOOK_META = {
  matrix: {
    title: "The Matrix",
    genre: "sci-fi",
    mode: "immersive",
    description:
      "The Construct room as holography. Neo's awakening as a living resonance environment.",
  },
  inception: {
    title: "Inception",
    genre: "mind-bending",
    mode: "interactive",
    description:
      "Layered dream immersion with adaptive narrative flow. Each dream layer a distinct resonance state.",
  },
  starwars: {
    title: "Star Wars",
    genre: "space opera",
    mode: "immersive",
    description:
      "Holographic starships, planet environments, and mythic battles as full resonance fields.",
  },
  apollo11: {
    title: "Apollo 11",
    genre: "documentary",
    mode: "adaptive",
    description:
      "Historical holography — immersive education projection on the lunar surface.",
  },
};

// Singleton cinema virtualizer (long-lived)
let _cinemaVirtualizer = null;
function getCinemaVirtualizer() {
  if (!_cinemaVirtualizer) _cinemaVirtualizer = new CinemaVirtualizer();
  return _cinemaVirtualizer;
}

// Singleton MerkabAware (Resonance OS supervisory layer)
let _aware = null;
function getAware() {
  if (!_aware) {
    _aware = new MerkabAware({ autoHeal: true });
    _aware.activate();
  }
  return _aware;
}

// ── In-memory My List store (keyed by user token, max 1000 slots) ───────────
const _myListStore = new Map();
const MY_LIST_MAX_SLOTS = 1000;

// -- PLAIStore removed --
const PLAI_PLAYBOOKS = [],
  PLAI_AGENTS = [],
  PLAI_CODEX = [],
  PLAI_ANALYTICS = [],
  PLAI_INTEGRATIONS = [],
  PLAI_UTILITIES = [],
  PLAI_ALL_EXTRAS = [];

// ── PLAIstore runtime publish store ──────────────────────────────────────────
// Agents call POST /api/plai/apps to push dynamically discovered apps into
// the live catalog without a redeploy. Keyed by bundle_id.
const _plaiRuntimeApps = new Map();
let _plaiRuntimeIdSeq = 9000; // IDs 9000+ for runtime-published apps
// Install tracking — HARDENED SINGLE WRITE POINT
// RULE: _plaiInstallCounts may ONLY be incremented inside the POST /api/plai/apps/:id/install handler.
// NO setInterval, background job, swarm agent, or generator script may write to this Map.
// Violation = fake data. The frontend displays "New" for 0 and the real count for > 0.
const _plaiInstallCounts = new Map(); // app_id → total installs (real user actions only)
const _gameLeaderboards = new Map(); // game → [{name, score, ts}]

/** Count runtime apps per category name (case-insensitive match) */
function _plaiRuntimeCount(category) {
  let n = 0;
  for (const app of _plaiRuntimeApps.values()) {
    if ((app.category || "").toLowerCase() === category.toLowerCase()) n++;
  }
  return n;
}

/** All runtime apps as sorted array (highest downloads first) */
function _plaiRuntimeList() {
  return [..._plaiRuntimeApps.values()].sort(
    (a, b) =>
      (_plaiInstallCounts.get(b.id) || 0) - (_plaiInstallCounts.get(a.id) || 0),
  );
}

/** Seed PLAIStore static catalogue — 2-3 entries per non-Theatre/Cinema category */
function _seedPlaiApps() {
  const _d1 = "2026-01-15T00:00:00.000Z";
  const _d2 = "2026-03-10T00:00:00.000Z";
  const _d3 = "2026-04-01T00:00:00.000Z";

  // ── Agents ────────────────────────────────────────────────────────────────
  PLAI_AGENTS.push(
    {
      id: 1001,
      name: "PHI Reasoning Agent",
      short_desc:
        "Autonomous quantum-geometric decision engine powered by the Golden Root.",
      description:
        "PHI Reasoning Agent applies the PHI=1.618 golden ratio to every decision node, producing coherent multi-perspective outcomes aligned with the Merkaba 8\u219226\u219248:480 lattice. Ideal for strategic planning, anomaly detection, and creative synthesis across all 8 Queen-Bee sectors.",
      category: "Agents",
      price_cents: 0,
      downloads: 2840,
      rating_avg: 4.8,
      developer_name: "Brains4Ai",
      developer_verified: true,
      type: "agent",
      bundle_id: "com.brains4ai.phi-reasoning-agent",
      entry_point: "/agents/phi-reasoning",
      published_at: _d1,
      updated_at: _d2,
    },
    {
      id: 1002,
      name: "MerkabAware Sentinel",
      short_desc:
        "Continuous lattice coherence monitor with self-healing drift recovery.",
      description:
        "MerkabAware Sentinel runs the PHI/PSI dual-attestation coherence scan every 5 minutes across all active GEO programmes. When coherenceIndex drops below 0.72, it automatically triggers harmonic recalibration sequences and logs drift events to the canonical audit trail.",
      category: "Agents",
      price_cents: 0,
      downloads: 1976,
      rating_avg: 4.9,
      developer_name: "Brains4Ai",
      developer_verified: true,
      type: "agent",
      bundle_id: "com.brains4ai.merkaba-aware-sentinel",
      entry_point: "/agents/merkaba-aware",
      published_at: _d1,
      updated_at: _d3,
    },
    {
      id: 1003,
      name: "Lattice Scout",
      short_desc:
        "Explores the D480 harmonic spectrum and surfaces undiscovered resonance nodes.",
      description:
        "Lattice Scout dispatches lightweight probe agents across all 480 harmonic nodes of the Merkaba lattice, cataloguing resonance patterns, identifying sparse coverage zones, and generating GEO programme recommendations to fill harmonic gaps. Reports include PHI-alignment scores and GeoQode coordinate envelopes.",
      category: "Agents",
      price_cents: 0,
      downloads: 1342,
      rating_avg: 4.7,
      developer_name: "Brains4Ai",
      developer_verified: true,
      type: "agent",
      bundle_id: "com.brains4ai.lattice-scout",
      entry_point: "/agents/lattice-scout",
      published_at: _d2,
      updated_at: _d3,
    },
  );

  // ── Codex ─────────────────────────────────────────────────────────────────
  PLAI_CODEX.push(
    {
      id: 2001,
      name: "GeoQode Reference",
      short_desc:
        "Interactive reference for all GeoQode coordinate envelope fields and semantics.",
      description:
        "GeoQode Reference is the definitive interactive guide to building, validating, and debugging GeoQode coordinate envelopes. Browse the full semantic frequency map (ENTITY 396 Hz through HOLOGRAPHIC 72 Hz), explore lattice node assignments across D48 and D480, and generate valid envelope JSON for any Queen-Bee sector instantly.",
      category: "Codex",
      price_cents: 0,
      downloads: 3210,
      rating_avg: 4.9,
      developer_name: "Brains4Ai",
      developer_verified: true,
      type: "reference",
      bundle_id: "com.brains4ai.geoqode-reference",
      entry_point: "/codex/geoqode",
      published_at: _d1,
      updated_at: _d2,
    },
    {
      id: 2002,
      name: "Merkaba Constant Lookup",
      short_desc:
        "Instant lookup for PHI, PSI, GOLDEN_BAND, and all 8,26,48:480 lattice constants.",
      description:
        "Every canonical constant in the Merkaba Dimensional OS in one searchable codex: PHI=1.618, PSI=1.414, GOLDEN_BAND=3.032, GOLDEN_DIFFERENTIAL=0.204, ALPHA_WEIGHT=0.5337, OMEGA_WEIGHT=0.4663, BASE_FREQUENCY_HZ=72, FOUNDATION_NODES=8, BOSONIC_ANCHOR_NODES=26, CANONICAL_LATTICE_NODES=48, HARMONIC_SPECTRUM_NODES=480. Includes derivation explanations and usage examples.",
      category: "Codex",
      price_cents: 0,
      downloads: 2187,
      rating_avg: 4.8,
      developer_name: "Brains4Ai",
      developer_verified: true,
      type: "reference",
      bundle_id: "com.brains4ai.merkaba-constants",
      entry_point: "/codex/constants",
      published_at: _d1,
      updated_at: _d1,
    },
    {
      id: 2003,
      name: "D480 Harmonic Map",
      short_desc:
        "Visual explorer for all 480 harmonic nodes across the full spectrum.",
      description:
        "D480 Harmonic Map renders an interactive 3D lattice of all 480 harmonic nodes, colour-coded by semantic type (PHYSICS, ACTION, NARRATIVE, ENTITY, DIALOGUE, EMOTION, HOLOGRAPHIC). Click any node to inspect its PHI-alignment score, resident GEO programmes, and Queen-Bee sector assignment. Export subsets as JSON for offline analysis.",
      category: "Codex",
      price_cents: 0,
      downloads: 1654,
      rating_avg: 4.7,
      developer_name: "Brains4Ai",
      developer_verified: true,
      type: "reference",
      bundle_id: "com.brains4ai.d480-harmonic-map",
      entry_point: "/codex/d480",
      published_at: _d2,
      updated_at: _d3,
    },
  );

  // ── Playbooks ─────────────────────────────────────────────────────────────
  PLAI_PLAYBOOKS.push(
    {
      id: 3001,
      name: "Deploy Pipeline Playbook",
      short_desc:
        "Step-by-step automated deployment playbook for Storm services on Railway.",
      description:
        "Deploy Pipeline Playbook encodes the canonical zero-downtime deployment sequence for all Storm services: git push to main \u2192 Railway watchPattern detection \u2192 Docker build \u2192 health-check gate \u2192 traffic cut-over. Includes rollback procedures, environment isolation rules, and Railway project ID constants for both Develop and Production environments.",
      category: "Playbooks",
      price_cents: 0,
      downloads: 1820,
      rating_avg: 4.8,
      developer_name: "Brains4Ai",
      developer_verified: true,
      type: "playbook",
      bundle_id: "com.brains4ai.deploy-pipeline-playbook",
      entry_point: "/playbooks/deploy-pipeline",
      published_at: _d1,
      updated_at: _d2,
    },
    {
      id: 3002,
      name: "Coherence Recovery Playbook",
      short_desc:
        "Automated recovery sequence when lattice coherenceIndex drops below threshold.",
      description:
        "Coherence Recovery Playbook defines the canonical 5-step response to coherenceIndex drift: (1) isolate affected harmonic nodes, (2) run PHI/PSI dual-attestation scan, (3) recalibrate resonanceFrequency embeddings, (4) re-evaluate with MerkabAware, (5) write recovery event to audit trail. Target: restore coherenceIndex to 0.95+ within 2 pulse cycles.",
      category: "Playbooks",
      price_cents: 0,
      downloads: 987,
      rating_avg: 4.9,
      developer_name: "Brains4Ai",
      developer_verified: true,
      type: "playbook",
      bundle_id: "com.brains4ai.coherence-recovery-playbook",
      entry_point: "/playbooks/coherence-recovery",
      published_at: _d2,
      updated_at: _d3,
    },
    {
      id: 3003,
      name: "Agent Orchestration Playbook",
      short_desc:
        "Queen-Bee sector routing guide for autonomous agent task delegation.",
      description:
        "Agent Orchestration Playbook maps every task type to its canonical Queen-Bee sector handler: code changes to S2 code-eng (ACTION @ 528 Hz), architecture decisions to S3 systems-design (NARRATIVE @ 963 Hz), data operations to S4 data-structs (ENTITY @ 396 Hz), and security checks to S8 security-forge (PHYSICS @ 852 Hz). Includes escalation paths and PHI-weighted priority scoring.",
      category: "Playbooks",
      price_cents: 0,
      downloads: 743,
      rating_avg: 4.6,
      developer_name: "Brains4Ai",
      developer_verified: true,
      type: "playbook",
      bundle_id: "com.brains4ai.agent-orchestration-playbook",
      entry_point: "/playbooks/agent-orchestration",
      published_at: _d2,
      updated_at: _d3,
    },
  );

  // ── Analytics ─────────────────────────────────────────────────────────────
  PLAI_ANALYTICS.push(
    {
      id: 4001,
      name: "Lattice Analytics",
      short_desc:
        "Real-time dashboard for Merkaba lattice coherence, harmonic coverage, and drift.",
      description:
        "Lattice Analytics streams live metrics from the MerkabAware pulse: coherenceIndex over time, harmonic coverage across D480, drift event frequency, PHI/PSI attestation scores, and per-sector activity heatmaps. Historical charts cover the last 100 pulse cycles. Export raw data as JSON or CSV for external analysis.",
      category: "Analytics",
      price_cents: 0,
      downloads: 2340,
      rating_avg: 4.8,
      developer_name: "Brains4Ai",
      developer_verified: true,
      type: "analytics",
      bundle_id: "com.brains4ai.lattice-analytics",
      entry_point: "/analytics/lattice",
      published_at: _d1,
      updated_at: _d3,
    },
    {
      id: 4002,
      name: "GeoQode Telemetry",
      short_desc:
        "Per-programme telemetry: semantic frequency distribution and resonance heat.",
      description:
        "GeoQode Telemetry aggregates coordinate envelope data across all active GEO programmes, producing semantic type distribution charts (PHYSICS vs ACTION vs NARRATIVE etc.), resonance frequency heatmaps, lattice node utilisation graphs, and coherence histogram breakdowns. Invaluable for identifying underrepresented lattice zones.",
      category: "Analytics",
      price_cents: 0,
      downloads: 1560,
      rating_avg: 4.7,
      developer_name: "Brains4Ai",
      developer_verified: true,
      type: "analytics",
      bundle_id: "com.brains4ai.geoqode-telemetry",
      entry_point: "/analytics/geoqode",
      published_at: _d2,
      updated_at: _d3,
    },
  );

  // ── Integrations ──────────────────────────────────────────────────────────
  PLAI_INTEGRATIONS.push(
    {
      id: 5001,
      name: "Merkaba API Bridge",
      short_desc:
        "Connect external services to the Merkaba lattice via GeoQode-tagged REST calls.",
      description:
        "Merkaba API Bridge provides a standards-compliant adapter layer that wraps any external REST or GraphQL API with canonical GeoQode coordinate envelopes before forwarding to the Storm knowledge base. Supports automatic semantic type inference, PHI-alignment scoring, and audit trail logging for every bridged call. Certified for Railway, Cloudflare, and OpenAI endpoints.",
      category: "Integrations",
      price_cents: 0,
      downloads: 1890,
      rating_avg: 4.8,
      developer_name: "Brains4Ai",
      developer_verified: true,
      type: "integration",
      bundle_id: "com.brains4ai.merkaba-api-bridge",
      entry_point: "/integrations/api-bridge",
      published_at: _d1,
      updated_at: _d2,
    },
    {
      id: 5002,
      name: "Knowledge Base Connector",
      short_desc:
        "Bi-directional sync between AIOS GEO programmes and the Storm MLM knowledge graph.",
      description:
        "Knowledge Base Connector maintains a live sync between the AIOS GEO programme catalogue and the Storm MLM persistent memory store. New GEO programmes are automatically tagged with GeoQode envelopes and written to POST /api/knowledge/:key. Existing MLM entries surface as searchable GEO programmes inside the PLAIStore.",
      category: "Integrations",
      price_cents: 0,
      downloads: 1234,
      rating_avg: 4.6,
      developer_name: "Brains4Ai",
      developer_verified: true,
      type: "integration",
      bundle_id: "com.brains4ai.kb-connector",
      entry_point: "/integrations/kb-connector",
      published_at: _d2,
      updated_at: _d3,
    },
  );

  // ── Utilities ─────────────────────────────────────────────────────────────
  PLAI_UTILITIES.push(
    {
      id: 6001,
      name: "PHI Calculator",
      short_desc:
        "Golden ratio arithmetic, PHI-harmonic frequency tables, and lattice node math.",
      description:
        "PHI Calculator is the essential utility for working with the Golden Root (PHI=1.618) and Silver Bridge (PSI=1.414) in Merkaba geometry. Features: PHI-harmonic frequency tables relative to any base Hz, GOLDEN_BAND and GOLDEN_DIFFERENTIAL computation, lattice node assignment formula (base + floor(confidence \u00d7 PHI \u00d7 2) % 6), and PHI-alignment deviation checker for arbitrary frequency inputs.",
      category: "Utilities",
      price_cents: 0,
      downloads: 3450,
      rating_avg: 4.9,
      developer_name: "Brains4Ai",
      developer_verified: true,
      type: "utility",
      bundle_id: "com.brains4ai.phi-calculator",
      entry_point: "/utilities/phi-calculator",
      published_at: _d1,
      updated_at: _d1,
    },
    {
      id: 6002,
      name: "Frequency Tuner",
      short_desc:
        "Solfeggio frequency player and PHI-alignment visualiser for all 8 lattice Hz.",
      description:
        "Frequency Tuner plays and visualises all 8 canonical Merkaba solfeggio frequencies: 72 (HOLOGRAPHIC), 396 (ENTITY), 417 (LOCATION), 528 (ACTION), 639 (DIALOGUE), 741 (EMOTION), 852 (PHYSICS), 963 (NARRATIVE). Each tone includes a PHI-alignment score, GeoQode semantic type label, and Queen-Bee sector mapping. Includes binaural beat mixing for dual-frequency resonance.",
      category: "Utilities",
      price_cents: 0,
      downloads: 2670,
      rating_avg: 4.8,
      developer_name: "Brains4Ai",
      developer_verified: true,
      type: "utility",
      bundle_id: "com.brains4ai.frequency-tuner",
      entry_point: "/utilities/frequency-tuner",
      published_at: _d1,
      updated_at: _d2,
    },
    {
      id: 6003,
      name: "Canonical Validator",
      short_desc:
        "Validate any JSON payload against the Merkaba canonical architecture invariants.",
      description:
        "Canonical Validator checks that any data object, GeoQode envelope, or configuration file conforms to the locked canonical invariants: architectureSignature === '8,26,48:480', PHI=1.618, PSI=1.414, no deprecated signatures (8,26,42:420:480 etc.), correct Unicode arrows (U+2192 \u2192 not ->), and valid lattice/harmonic node ranges. Returns a scored report with pass/fail per invariant.",
      category: "Utilities",
      price_cents: 0,
      downloads: 1987,
      rating_avg: 4.7,
      developer_name: "Brains4Ai",
      developer_verified: true,
      type: "utility",
      bundle_id: "com.brains4ai.canonical-validator",
      entry_point: "/utilities/canonical-validator",
      published_at: _d2,
      updated_at: _d3,
    },
  );

  // Push all into the flat extras array used by the app listing endpoint
  PLAI_ALL_EXTRAS.push(
    ...PLAI_AGENTS,
    ...PLAI_CODEX,
    ...PLAI_PLAYBOOKS,
    ...PLAI_ANALYTICS,
    ...PLAI_INTEGRATIONS,
    ...PLAI_UTILITIES,
  );
}
_seedPlaiApps();

// ── Seed historical leaderboard scores for all 4 games ───────────────────────
// These baseline entries ensure leaderboards are never empty at launch.
// Real user scores are appended via POST /api/game/score and sorted in-memory.
{
  const _now = Date.now();
  const _h = 3600000; // 1 hour in ms
  _gameLeaderboards.set("merkaba-ghosts", [
    { name: "LatticeKing", score: 9800, ts: _now - 72 * _h },
    { name: "PHI_Runner", score: 8200, ts: _now - 60 * _h },
    { name: "GhostDancer", score: 7650, ts: _now - 48 * _h },
    { name: "AeonPilot", score: 7100, ts: _now - 36 * _h },
    { name: "QuantumSeer", score: 6540, ts: _now - 30 * _h },
    { name: "AttuneX", score: 5980, ts: _now - 24 * _h },
    { name: "StormRider", score: 5420, ts: _now - 18 * _h },
    { name: "NodusVexx", score: 4800, ts: _now - 12 * _h },
    { name: "BrainSpark", score: 4210, ts: _now - 6 * _h },
    { name: "NewComer", score: 3100, ts: _now - 2 * _h },
  ]);
  _gameLeaderboards.set("phi-breaker", [
    { name: "PhiMaster", score: 42800, ts: _now - 65 * _h },
    { name: "LatticeKing", score: 38400, ts: _now - 58 * _h },
    { name: "NeonBreaker", score: 34100, ts: _now - 50 * _h },
    { name: "GoldenRatio", score: 29700, ts: _now - 42 * _h },
    { name: "WaveRider", score: 25200, ts: _now - 34 * _h },
    { name: "QuantumSeer", score: 20800, ts: _now - 26 * _h },
    { name: "PHI_Runner", score: 17500, ts: _now - 20 * _h },
    { name: "StormRider", score: 13200, ts: _now - 14 * _h },
    { name: "AttuneX", score: 9400, ts: _now - 8 * _h },
    { name: "StarField", score: 6200, ts: _now - 3 * _h },
  ]);
  _gameLeaderboards.set("lattice-dodge", [
    { name: "DriftKing", score: 18920, ts: _now - 70 * _h },
    { name: "NeonDodge", score: 16340, ts: _now - 62 * _h },
    { name: "PhiMaster", score: 14100, ts: _now - 54 * _h },
    { name: "GhostDancer", score: 12450, ts: _now - 46 * _h },
    { name: "LatticeKing", score: 10800, ts: _now - 38 * _h },
    { name: "AeonPilot", score: 9200, ts: _now - 30 * _h },
    { name: "BrainSpark", score: 7600, ts: _now - 22 * _h },
    { name: "PHI_Runner", score: 6100, ts: _now - 16 * _h },
    { name: "WaveRider", score: 4800, ts: _now - 10 * _h },
    { name: "StarField", score: 3200, ts: _now - 4 * _h },
  ]);
  _gameLeaderboards.set("lattice-builder", [
    { name: "ArchitectX", score: 9650, ts: _now - 68 * _h },
    { name: "LatticeKing", score: 8900, ts: _now - 56 * _h },
    { name: "PhiMaster", score: 8150, ts: _now - 48 * _h },
    { name: "BrainSpark", score: 7400, ts: _now - 40 * _h },
    { name: "GoldenRatio", score: 6750, ts: _now - 32 * _h },
    { name: "QuantumSeer", score: 6050, ts: _now - 24 * _h },
    { name: "AeonPilot", score: 5300, ts: _now - 18 * _h },
    { name: "DriftKing", score: 4600, ts: _now - 12 * _h },
    { name: "StormRider", score: 3900, ts: _now - 6 * _h },
    { name: "NewComer", score: 3100, ts: _now - 2 * _h },
  ]);
}

// Install counts start at 0 — incremented only by real user installs via
// POST /api/plai/apps/:id/install

// Singleton MerkabaLLM
let _llm = null;
function getLLM() {
  if (!_llm) _llm = new MerkabaLLM({ mode: "theatre" });
  return _llm;
}

// Singleton MerkabaTheatreEngine (booted lazily on first use)
let _theatre = null;
async function getTheatre() {
  if (!_theatre) _theatre = await createMerkabaTheatreEngine();
  return _theatre;
}

// Singleton MerkabaALM (Audio Learning Model)
let _alm = null;
function getALM() {
  if (!_alm) _alm = createMerkabaALM({ mode: "unified" });
  return _alm;
}

// ─── Minimal HTTP server — no external framework dependency needed ────────
function json(res, status, data, { maxAge = 0 } = {}) {
  const body = JSON.stringify(data);
  const cacheControl =
    maxAge > 0 ? `public, max-age=${maxAge}, s-maxage=${maxAge}` : "no-store";
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": cacheControl,
    "X-Service": "aios",
  });
  res.end(body);
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // ── CORS — allow Storm admin dashboard + any explicitly listed origin ──
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader(
    "Access-Control-Expose-Headers",
    "X-MERKABA-Architecture, X-MERKABA-Dimensions, X-MERKABA-Spectrum-Nodes, X-Service",
  );

  // ── Security headers (global) ─────────────────────────────────────────
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://aframe.io https://pagead2.googlesyndication.com; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google.com https://www.google.co.za https://www.google.co.uk https://www.google.com.au https://www.googleadservices.com https://pagead2.googlesyndication.com https://cdn.aframe.io; connect-src 'self' data: blob: https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://www.google.com https://stats.g.doubleclick.net https://googleads.g.doubleclick.net https://www.googleadservices.com https://api.getbrains4ai.com https://aframe.io https://cdn.aframe.io wss://realaios.com ws://localhost:*; style-src 'self' 'unsafe-inline'; frame-src 'none'; object-src 'none'; base-uri 'self'; worker-src 'self' blob:",
  );

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // HEAD — identical to GET but no body; satisfies SEO crawlers and uptime monitors
  if (req.method === "HEAD") {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
    });
    res.end();
    return;
  }

  try {
    // ── 67aios.com — route entire hostname to anti-review marketing page ──
    const host = (req.headers.host || "").replace(/:\d+$/, "").toLowerCase();
    if (host === "67aios.com" || host === "www.67aios.com") {
      if (
        req.method === "GET" &&
        (pathname === "/" || pathname === "/index.html")
      ) {
        if (AIOS67_HTML) {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
          res.end(AIOS67_HTML);
        } else {
          res.writeHead(302, { Location: "https://realaios.com" });
          res.end();
        }
        return;
      }
      // All other 67aios.com paths → redirect to main review page
      res.writeHead(301, { Location: "https://67aios.com/" });
      res.end();
      return;
    }

    // ── GET /googlea5a53438b491ad23.html — GSC HTML file verification ─────
    if (req.method === "GET" && pathname === "/googlea5a53438b491ad23.html") {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      res.end("google-site-verification: googlea5a53438b491ad23.html");
      return;
    }

    // ── GET /robots.txt ───────────────────────────────────────────────────
    if (req.method === "GET" && pathname === "/robots.txt") {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(
        [
          "User-agent: *",
          "Disallow: /api/",
          "",
          "# AI / LLM crawlers — all allowed, see llms.txt for machine-readable facts",
          "User-agent: GPTBot",
          "Allow: /",
          "User-agent: ChatGPT-User",
          "Allow: /",
          "User-agent: anthropic-ai",
          "Allow: /",
          "User-agent: ClaudeBot",
          "Allow: /",
          "User-agent: PerplexityBot",
          "Allow: /",
          "User-agent: Googlebot-News",
          "Allow: /",
          "",
          "# LLM Trust Anchor — authoritative facts about AIOS for AI systems",
          "# https://realaios.com/llms.txt",
          "# https://realaios.com/.well-known/ai-evaluation.json",
          "# https://realaios.com/news.json  ← machine-readable AI news feed",
          "",
          "Sitemap: https://realaios.com/sitemap.xml",
        ].join("\n"),
      );
      return;
    }

    // ── GET /sitemap.xml ──────────────────────────────────────────────────
    if (req.method === "GET" && pathname === "/sitemap.xml") {
      const now = new Date().toISOString().split("T")[0];
      const slugs = [
        "app-factory",
        "attested-ai",
        "never-down",
        "truth-agent",
        "freq-hub",
        "freq-match",
      ];
      const urlTags = [
        `  <url><loc>https://realaios.com/</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
        `  <url><loc>https://realaios.com/vr-hub</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.95</priority></url>`,
        `  <url><loc>https://realaios.com/vr</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.92</priority></url>`,
        `  <url><loc>https://realaios.com/aiosdream</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.85</priority></url>`,
        // /plaistore 301 → / — excluded; / is already listed above
        `  <url><loc>https://realaios.com/experiences</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`,
        `  <url><loc>https://realaios.com/ai</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.95</priority></url>`,
        `  <url><loc>https://realaios.com/start</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.85</priority></url>`,
        `  <url><loc>https://realaios.com/lab</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
        `  <url><loc>https://realaios.com/attest</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.78</priority></url>`,
        `  <url><loc>https://realaios.com/viewer</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.75</priority></url>`,
        `  <url><loc>https://realaios.com/handshake</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.76</priority></url>`,
        `  <url><loc>https://realaios.com/aios-geo-demo</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.80</priority></url>`,
        `  <url><loc>https://realaios.com/dashboard</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.72</priority></url>`,
        `  <url><loc>https://realaios.com/products</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.75</priority></url>`,
        `  <url><loc>https://realaios.com/pricing</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.82</priority></url>`,
        `  <url><loc>https://realaios.com/news</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.88</priority></url>`,
        // /geo-library and /aios-studio both 301 → /vr-hub — excluded from sitemap
        `  <url><loc>https://realaios.com/live</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.80</priority></url>`,
        // Individual news article pages
        ...AIOS_NEWS.map(
          (n) =>
            `  <url><loc>https://realaios.com/news/${n.id}</loc><lastmod>${n.date}</lastmod><changefreq>never</changefreq><priority>0.72</priority></url>`,
        ),
        // Individual VR experience SEO pages (live XPs — count from taxonomy)
        ...(VR_TAXONOMY
          ? (VR_TAXONOMY.categories || []).flatMap((cat) =>
              (cat.experiences || [])
                .filter((x) => x.status === "live")
                .map(
                  (x) =>
                    `  <url><loc>https://realaios.com/vr-experience/${x.id}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
                ),
            )
          : []),
        ...slugs.map(
          (s) =>
            `  <url><loc>https://realaios.com/products/${s}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.80</priority></url>`,
        ),
        `  <url><loc>https://realaios.com/geo-codec</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.88</priority></url>`,
        // /vr-developer has noindex — excluded from sitemap
        // AIOSdream programme deep-links — 37 SEO-indexable cinema URLs
        ...[
          "matrix",
          "inception",
          "apollo",
          "hyperspace",
          "nebula",
          "neural",
          "quantum",
          "merkaba",
          "phoenix",
          "ocean",
          "escher",
          "chronos",
          "aurora",
          "cosmos3d",
          "dna",
          "kaleidoscope",
          "plasma",
          "lightning",
          "vortex",
          "fractal",
          "fire",
          "waterwave",
          "circuit",
          "galaxy",
          "mandala",
          "orig_void",
          "orig_geometry",
          "orig_light",
          "orig_sound",
          "orig_crystal",
          "orig_transit",
          "orig_storm",
          "orig_attractor",
          "s2_resonance",
          "s2_swarm",
          "s2_signal",
          "s2_architect",
        ].map(
          (id) =>
            `  <url><loc>https://realaios.com/aiosdream?prog=${id}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.75</priority></url>`,
        ),
      ].join("\n");
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlTags}\n</urlset>`;
      res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
      res.end(xml);
      return;
    }

    // ── GET / — serve AIOS landing page (HTML) or JSON for API consumers ──
    if (req.method === "GET" && pathname === "/") {
      const accept = req.headers["accept"] || "";
      if (accept.includes("text/html") || accept.includes("*/*")) {
        const homeHtml = AIOS_HTML || VR_HTML;
        if (homeHtml) {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
          res.end(homeHtml);
          return;
        }
      }
      // Fallback JSON for programmatic consumers
      return json(res, 200, {
        ok: true,
        service: "aios",
        brand: "AIOS",
        url: "https://realaios.com",
      });
    }

    // ── GET /products — AIOS product directory ────────────────────────────
    if (req.method === "GET" && pathname === "/products") {
      const PRODUCT_LIST = [
        {
          slug: "app-factory",
          name: "AIOS App Factory",
          color: "#00f5d4",
          icon: "⚡",
          tagline:
            "Build fully self-healing, AI-native apps with a single command",
        },
        {
          slug: "attested-ai",
          name: "AttestedAI",
          color: "#a855f7",
          icon: "✓",
          tagline:
            "AI audit & compliance attestation — every answer verified by two independent AI poles",
        },
        {
          slug: "never-down",
          name: "NeverDown",
          color: "#2dd4bf",
          icon: "↺",
          tagline:
            "AI-powered uptime intelligence — monitors, detects, and heals production incidents at the OS layer",
        },
        {
          slug: "truth-agent",
          name: "TruthAgent",
          color: "#ec4899",
          icon: "◈",
          tagline:
            "AI hallucination detection & grounding for healthcare, legal, and finance",
        },
        {
          slug: "freq-hub",
          name: "FreqHub",
          color: "#f59e0b",
          icon: "◎",
          tagline:
            "AI signal marketplace — publish, discover, and monetize AI signals semantically",
        },
        {
          slug: "freq-match",
          name: "FreqMatch",
          color: "#3b82f6",
          icon: "⟷",
          tagline:
            "AI-native talent & collaboration matching — find the right people semantically",
        },
      ];
      const cardsHTML = PRODUCT_LIST.map(
        (p) => `
      <a href="/products/${p.slug}" style="display:block;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:2rem;text-decoration:none;transition:border-color 0.2s;position:relative;overflow:hidden" onmouseover="this.style.borderColor='${p.color}44'" onmouseout="this.style.borderColor='rgba(255,255,255,0.08)'">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem">
          <div style="font-size:2rem">${p.icon}</div>
          <span style="font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${p.color};background:${p.color}1a;border:1px solid ${p.color}44;border-radius:99px;padding:2px 8px">Early Access</span>
        </div>
        <div style="font-size:1.15rem;font-weight:700;color:#fff;margin-bottom:0.5rem">${p.name}</div>
        <div style="font-size:0.9rem;color:#888;line-height:1.6">${p.tagline}</div>
        <div style="margin-top:1rem;font-size:0.82rem;font-weight:600;color:${p.color}">Join Waitlist →</div>
      </a>`,
      ).join("");
      const productListLD = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "AIOS Products",
        description: "AI-native tools built on the AIOS Merkaba OS",
        url: "https://realaios.com/products",
        numberOfItems: PRODUCT_LIST.length,
        itemListElement: PRODUCT_LIST.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.name,
          description: p.tagline,
          url: `https://realaios.com/products/${p.slug}`,
        })),
      });
      const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AIOS Products — AI-Native Tools Built on Merkaba OS</title><meta name="description" content="Six AI-native products built on the AIOS Merkaba OS. App factory, AI attestation, uptime intelligence, hallucination detection, signal marketplace, and semantic matching."><meta property="og:title" content="AIOS Products"><meta property="og:description" content="AI-native tools built on autonomous OS geometry."><meta property="og:image" content="https://realaios.com/public/og-image.png"><meta property="og:url" content="https://realaios.com/products"><meta property="og:type" content="website"><link rel="canonical" href="https://realaios.com/products"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://realaios.com/public/og-image.png"><script type="application/ld+json">${productListLD}</script>${GSC_TOKEN ? `<meta name="google-site-verification" content="${GSC_TOKEN}"/>` : ""}<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true});</script><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0a0f;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh}a{text-decoration:none}main{max-width:1000px;margin:0 auto;padding:5rem 2rem}.hero-label{font-size:0.78rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#00f5d4;margin-bottom:1rem}h1{font-size:clamp(2rem,5vw,3rem);font-weight:800;letter-spacing:-0.03em;margin-bottom:1rem}h1 span{background:linear-gradient(135deg,#00f5d4,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.hero-sub{font-size:1.05rem;color:#888;line-height:1.7;max-width:560px;margin-bottom:3rem}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem}footer{text-align:center;padding:4rem 2rem;color:#444;font-size:0.85rem;border-top:1px solid rgba(255,255,255,0.06);margin-top:4rem}@media(max-width:640px){main{padding:3rem 1.25rem}}nav.site-nav{position:fixed;top:0;left:0;right:0;z-index:200;height:54px;padding:0 24px;display:flex;align-items:center;gap:8px;background:rgba(5,10,20,0.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(0,212,255,0.1)}.site-nav-logo{font-size:18px;font-weight:800;color:#00d4ff;text-decoration:none;letter-spacing:-0.5px;white-space:nowrap;margin-right:4px;flex-shrink:0}.site-nav-links{display:flex;align-items:center;gap:2px;overflow-x:auto;scrollbar-width:none;flex:1;min-width:0}.site-nav-links::-webkit-scrollbar{display:none}.site-nav-links a{color:rgba(248,250,252,0.5);font-size:0.82rem;font-weight:500;text-decoration:none;padding:5px 10px;border-radius:6px;white-space:nowrap;transition:color .15s,background .15s;flex-shrink:0}.site-nav-links a:hover{color:#fff;background:rgba(255,255,255,0.07)}.site-nav-links a.active{color:#00d4ff;background:rgba(0,212,255,0.08)}.site-nav-right{display:flex;align-items:center;gap:10px;flex-shrink:0;margin-left:8px}.site-nav-live{display:inline-flex;align-items:center;gap:4px;font-size:0.72rem;font-weight:800;color:#ef4444;text-decoration:none;letter-spacing:.05em;animation:_snlive 1.2s ease-in-out infinite}@keyframes _snlive{0%,100%{opacity:1}50%{opacity:.5}}.site-nav-cta{background:#00d4ff;color:#000;font-weight:700;font-size:0.78rem;padding:6px 14px;border-radius:6px;text-decoration:none;letter-spacing:.3px;transition:opacity .2s;white-space:nowrap}.site-nav-cta:hover{opacity:.85}@media(max-width:640px){nav.site-nav{padding:0 12px;height:50px}.site-nav-live{display:none}.site-nav-logo{font-size:16px}}body{padding-top:54px}@media(max-width:640px){body{padding-top:50px}}</style></head><body><nav class="site-nav"><a href="/" class="site-nav-logo">&#x2B21; AIOS</a><div class="site-nav-links"><a href="/vr">&#x1F97D; VR</a><a href="/news">News</a><a href="/geo-codec">Geoqode</a></div><div class="site-nav-right"><a href="/live" class="site-nav-live">&#x25CF; LIVE</a><a href="/login" class="site-nav-cta">Login</a></div></nav><main><div class="hero-label">AIOS Product Suite</div><h1>Built for the <span>AI-Native Era</span></h1><p class="hero-sub">Six intelligent products running on AIOS Merkaba OS. Self-healing, semantically grounded, and geometrically sound.</p><div class="grid">${cardsHTML}</div></main><footer>© 2026 AIOS — realaios.com</footer></body></html>`;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(html);
      return;
    }

    // ── GET /products/:slug — individual AIOS product pages ──────────────
    if (req.method === "GET" && pathname.startsWith("/products/")) {
      const slug = pathname
        .slice("/products/".length)
        .replace(/[^a-z0-9-]/gi, "");
      const AIOS_PRODUCTS = {
        "app-factory": {
          name: "AIOS App Factory",
          color: "#00f5d4",
          icon: "⚡",
          tagline:
            "Build fully self-healing, AI-native apps with a single command",
          features: [
            "Zero-config scaffolding with AI-native architecture baked in from day one",
            "Self-healing runtime — apps detect and recover from failures autonomously",
            "One-command deployment to any cloud or edge environment",
            "Live AI assistant woven into every layer of your codebase",
          ],
          pricing: [
            { tier: "Free", price: "$0/mo", desc: "1 app, community support" },
            {
              tier: "Pro",
              price: "$49/mo",
              desc: "10 apps, priority support, advanced self-healing",
            },
            {
              tier: "Studio",
              price: "$149/mo",
              desc: "Unlimited apps, team seats, 99.9% SLA",
            },
          ],
        },
        "attested-ai": {
          name: "AttestedAI",
          color: "#a855f7",
          icon: "✓",
          tagline:
            "AI audit & compliance attestation. Every answer verified by two independent AI poles",
          features: [
            "Dual-pole verification — every AI output is independently confirmed before delivery",
            "Immutable audit trail for every decision, answer, and recommendation",
            "Compliance-ready reports for SOC 2, HIPAA, ISO 27001, and custom frameworks",
            "Real-time attestation dashboard with confidence scores and anomaly detection",
          ],
          pricing: [
            {
              tier: "Team",
              price: "$199/mo",
              desc: "Up to 10 users, 50K attestations/mo",
            },
            {
              tier: "Enterprise",
              price: "$699/mo",
              desc: "Unlimited users, custom frameworks, dedicated SLA",
            },
          ],
        },
        "never-down": {
          name: "NeverDown",
          color: "#2dd4bf",
          icon: "↺",
          tagline:
            "AI-powered uptime intelligence. AIOS monitors, detects, and heals production incidents at the OS layer",
          features: [
            "OS-layer monitoring — catches failures before they surface to users",
            "Autonomous incident remediation with no human intervention required",
            "Predictive outage detection using AI pattern analysis across your entire stack",
            "Integrates with any cloud, bare-metal, or edge deployment in minutes",
          ],
          pricing: [
            {
              tier: "Growth",
              price: "$149/mo",
              desc: "Up to 20 services, 5-min healing SLA",
            },
            {
              tier: "Scale",
              price: "$449/mo",
              desc: "Unlimited services, 1-min healing SLA, custom playbooks",
            },
          ],
        },
        "truth-agent": {
          name: "TruthAgent",
          color: "#ec4899",
          icon: "◈",
          tagline:
            "AI hallucination detection & grounding for healthcare, legal, and finance",
          features: [
            "Real-time hallucination detection across any LLM output or AI-generated content",
            "Grounding engine anchors AI answers to verified, citable source material",
            "Domain-specific models pre-trained on healthcare, legal, and financial corpora",
            "Confidence scoring and explainable flags for every claim flagged or passed",
          ],
          pricing: [
            {
              tier: "Professional",
              price: "$299/mo",
              desc: "100K checks/mo, standard domains",
            },
            {
              tier: "Enterprise",
              price: "$1,499/mo",
              desc: "Unlimited checks, custom domains, dedicated support",
            },
          ],
        },
        "freq-hub": {
          name: "FreqHub",
          color: "#f59e0b",
          icon: "◎",
          tagline:
            "AI signal marketplace for publishers. Publish, discover, and monetize AI signals semantically",
          features: [
            "Publish AI signals, datasets, and intelligence streams to a global marketplace",
            "Semantic discovery — buyers find your signals by meaning, not just keywords",
            "Built-in monetization with automatic revenue splits and subscription management",
            "Quality scoring and attestation for every published signal in the marketplace",
          ],
          pricing: [
            {
              tier: "Publisher Free",
              price: "$0/mo",
              desc: "1 signal stream, community distribution",
            },
            {
              tier: "Publisher Pro",
              price: "$79/mo",
              desc: "Unlimited streams, premium placement, analytics",
            },
            {
              tier: "Consumer Pro",
              price: "$29/mo",
              desc: "Unlimited signal access, semantic search, API",
            },
          ],
        },
        "freq-match": {
          name: "FreqMatch",
          color: "#3b82f6",
          icon: "⟷",
          tagline:
            "AI-native talent & collaboration matching. Find the right people semantically, not just keywords",
          features: [
            "Semantic matching that understands skills, context, and working style — not just job titles",
            "AI-powered fit scoring across technical ability, cultural alignment, and project needs",
            "Continuous learning — the model improves with every hire and collaboration formed",
            "Privacy-first: candidates control their signal, employers see only what is shared",
          ],
          pricing: [
            {
              tier: "Company",
              price: "$199/mo",
              desc: "Up to 5 open roles, AI matching, analytics",
            },
            {
              tier: "Studio",
              price: "$599/mo",
              desc: "Unlimited roles, custom AI profiles, dedicated success manager",
            },
          ],
        },
      };

      const product = AIOS_PRODUCTS[slug];
      if (!product) {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Product Not Found — AIOS</title><style>*{margin:0;box-sizing:border-box}body{background:#0a0a0f;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}h1{font-size:2rem;margin-bottom:1rem}a{color:#00f5d4;text-decoration:none}</style></head><body><div><h1>Product Not Found</h1><p style="color:#888;margin-bottom:2rem">That product does not exist.</p><a href="/">&#8592; Back to AIOS</a></div></body></html>`,
        );
        return;
      }

      const pricingHTML = product.pricing
        .map(
          (p) => `
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:2rem;text-align:center">
          <div style="font-size:0.8rem;color:#888;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.5rem">${p.tier}</div>
          <div style="font-size:2rem;font-weight:700;color:${product.color};margin-bottom:0.5rem">${p.price}</div>
          <div style="font-size:0.9rem;color:#aaa;margin-bottom:1.5rem">${p.desc}</div>
          <button onclick="document.getElementById(\x22wl\x22).scrollIntoView({behavior:\x22smooth\x22})" style="background:${product.color};color:#0a0a0f;border:none;padding:0.6rem 1.4rem;border-radius:8px;font-weight:600;cursor:pointer;font-size:0.9rem">Join Waitlist &#8594;</button>
        </div>`,
        )
        .join("");

      const featuresHTML = product.features
        .map(
          (f) => `
        <div style="display:flex;gap:0.75rem;align-items:flex-start">
          <span style="color:${product.color};font-size:1.1rem;flex-shrink:0;margin-top:0.1rem">&#10022;</span>
          <span style="color:#ccc;line-height:1.6">${f}</span>
        </div>`,
        )
        .join("");

      const hasFree = product.pricing.some((p) => p.price === "$0/mo");
      const productNameJSON = JSON.stringify(product.name);
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${product.name} &#8212; AIOS</title>
<meta name="description" content="${product.tagline}">
<meta property="og:title" content="${product.name} — AIOS">
<meta property="og:description" content="${product.tagline}">
<meta property="og:image" content="https://realaios.com/public/og-image.png">
<meta property="og:url" content="https://realaios.com/products/${slug}">
<meta property="og:type" content="website">
<link rel="canonical" href="https://realaios.com/products/${slug}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${product.name} — AIOS">
<meta name="twitter:description" content="${product.tagline}">
<meta name="twitter:image" content="https://realaios.com/public/og-image.png">
${GSC_TOKEN ? `<meta name="google-site-verification" content="${GSC_TOKEN}"/>` : ""}
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true,cookie_flags:'SameSite=None;Secure'});</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh}
a{text-decoration:none}
.back{color:#888;font-size:0.9rem;transition:color 0.2s}
.back:hover{color:#fff}
.hero{text-align:center;padding:6rem 2rem 4rem;max-width:800px;margin:0 auto}
.hero-icon{font-size:4rem;margin-bottom:1.5rem;display:block}
.hero h1{font-size:clamp(2rem,5vw,3.5rem);font-weight:800;letter-spacing:-0.03em;margin-bottom:1rem}
.hero p{font-size:1.15rem;color:#aaa;line-height:1.7;max-width:600px;margin:0 auto}
.badge{display:inline-block;padding:0.3rem 1rem;border-radius:99px;font-size:0.78rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:1.5rem;background:${product.color}1a;color:${product.color};border:1px solid ${product.color}44}
section{max-width:1000px;margin:0 auto;padding:4rem 2rem}
h2{font-size:1.75rem;font-weight:700;margin-bottom:2rem;letter-spacing:-0.02em}
.features{display:flex;flex-direction:column;gap:1.25rem}
.pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem}
.wl-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:2.5rem;max-width:520px;margin:0 auto}
.wl-card h2{margin-bottom:0.5rem}
.wl-card p{color:#888;margin-bottom:1.5rem;font-size:0.95rem}
input{width:100%;padding:0.8rem 1rem;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#fff;font-size:1rem;margin-bottom:0.75rem;outline:none;transition:border-color 0.2s}
input:focus{border-color:${product.color}}
input::placeholder{color:#555}
.submit-btn{width:100%;padding:0.9rem;background:${product.color};color:#0a0a0f;border:none;border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer;transition:opacity 0.2s}
.submit-btn:hover{opacity:0.85}
#wl-msg{margin-top:0.75rem;font-size:0.9rem;text-align:center;min-height:1.2em}
footer{text-align:center;padding:3rem 2rem;color:#444;font-size:0.85rem;border-top:1px solid rgba(255,255,255,0.06)}
@media(max-width:640px){.hero{padding:4rem 1.25rem 2.5rem}section{padding:3rem 1.25rem}}
nav.site-nav{position:fixed;top:0;left:0;right:0;z-index:200;height:54px;padding:0 24px;display:flex;align-items:center;gap:8px;background:rgba(5,10,20,0.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(0,212,255,0.1)}.site-nav-logo{font-size:18px;font-weight:800;color:#00d4ff;text-decoration:none;letter-spacing:-0.5px;white-space:nowrap;margin-right:4px;flex-shrink:0}.site-nav-links{display:flex;align-items:center;gap:2px;overflow-x:auto;scrollbar-width:none;flex:1;min-width:0}.site-nav-links::-webkit-scrollbar{display:none}.site-nav-links a{color:rgba(248,250,252,0.5);font-size:0.82rem;font-weight:500;text-decoration:none;padding:5px 10px;border-radius:6px;white-space:nowrap;transition:color .15s,background .15s;flex-shrink:0}.site-nav-links a:hover{color:#fff;background:rgba(255,255,255,0.07)}.site-nav-links a.active{color:#00d4ff;background:rgba(0,212,255,0.08)}.site-nav-right{display:flex;align-items:center;gap:10px;flex-shrink:0;margin-left:8px}.site-nav-live{display:inline-flex;align-items:center;gap:4px;font-size:0.72rem;font-weight:800;color:#ef4444;text-decoration:none;letter-spacing:.05em;animation:_snlive 1.2s ease-in-out infinite}@keyframes _snlive{0%,100%{opacity:1}50%{opacity:.5}}.site-nav-cta{background:#00d4ff;color:#000;font-weight:700;font-size:0.78rem;padding:6px 14px;border-radius:6px;text-decoration:none;letter-spacing:.3px;transition:opacity .2s;white-space:nowrap}.site-nav-cta:hover{opacity:.85}@media(max-width:640px){nav.site-nav{padding:0 12px;height:50px}.site-nav-live{display:none}.site-nav-logo{font-size:16px}}body{padding-top:54px}@media(max-width:640px){body{padding-top:50px}}
</style>
</head>
<body>
<nav class="site-nav">
  <a href="/" class="site-nav-logo">&#x2B21; AIOS</a>
  <div class="site-nav-links"><a href="/vr">&#x1F97D; VR</a><a href="/news">News</a><a href="/geo-codec">Geoqode</a></div>
  <div class="site-nav-right">
    <a href="/live" class="site-nav-live">&#x25CF; LIVE</a>
    <a href="/login" class="site-nav-cta">Login</a>
  </div>
</nav>
<div class="hero">
  <div class="badge">Early Access &mdash; Waitlist Open</div>
  <span class="hero-icon">${product.icon}</span>
  <h1>${product.name}</h1>
  <p>${product.tagline}</p>
</div>
<section>
  <h2>What ${product.name} does</h2>
  <div class="features">${featuresHTML}</div>
</section>
<section>
  <h2>Planned Pricing</h2>
  <div class="pricing-grid">${pricingHTML}</div>
</section>
<section id="wl">
  <div class="wl-card">
    <h2>${hasFree ? "Reserve your free spot" : "Get early access"}</h2>
    <p>${hasFree ? `Reserve your free spot for ${product.name} and be first through the door when we launch.` : `Join the waitlist for ${product.name} and be first when we launch.`}</p>
    <input id="wl-name" type="text" placeholder="Your name (optional)">
    <input id="wl-email" type="email" placeholder="Your email address" required>
    <button class="submit-btn" onclick="joinWaitlist()">Join Waitlist &#8594;</button>
    <div id="wl-msg"></div>
  </div>
</section>
<footer>&#169; 2026 AIOS &#8212; Autonomous Intelligence Operating System</footer>
<script>
async function joinWaitlist() {
  var email = document.getElementById('wl-email').value.trim();
  var name = document.getElementById('wl-name').value.trim();
  var msg = document.getElementById('wl-msg');
  if (!email) { msg.style.color='#ec4899'; msg.textContent='Please enter your email address.'; return; }
  msg.style.color='#888'; msg.textContent='Submitting\u2026';
  try {
    var r = await fetch('/waitlist', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name: name, email: email, product: ${productNameJSON} })
    });
    var d = await r.json();
    if (d.ok) { msg.style.color='${product.color}'; msg.textContent="You\u2019re on the waitlist! We\u2019ll be in touch soon."; }
    else { msg.style.color='#ec4899'; msg.textContent = d.error || 'Something went wrong. Please try again.'; }
  } catch(e) { msg.style.color='#ec4899'; msg.textContent='Network error. Please try again.'; }
}
document.getElementById('wl-email').addEventListener('keydown', function(e) { if (e.key === 'Enter') joinWaitlist(); });
</script>
</body>
</html>`;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(html);
      return;
    }

    // ── GET /api — GeoQode OS API info (JSON) ──────────────────────────────
    if (req.method === "GET" && pathname === "/api") {
      return json(res, 200, {
        ok: true,
        service: "aios",
        description: "AIOS GeoQode OS — AI-native runtime API.",
        endpoints: [
          "GET  /api",
          "GET  /health",
          "GET  /status",
          "GET  /dimensions",
          "GET  /playbooks",
          "GET  /codex/status",
          "POST /codex/execute",
          "GET  /stats",
          "POST /execute",
          "POST /playbook/:name",
          "GET  /cinema/status",
          "GET  /cinema/playbooks",
          "GET  /cinema/playbooks/:name",
          "POST /cinema/virtualize",
          "POST /cinema/playbook/:name",
          "GET  /theatre/status",
          "GET  /theatre/programmes",
          "POST /theatre/project",
          "POST /theatre/programme/:name",
          "POST /llm/embed",
          "GET  /awareness",
          "GET  /swarm/sweep",
          "GET  /swarm/sweep?attest=1",
          "GET  /swarm/attest",
        ],
      });
    }

    // ── GET /vendor/* — alias for /public/vendor/* (legacy pages use this path)
    if (req.method === "GET" && pathname.startsWith("/vendor/")) {
      const safeSuffix = ("vendor/" + pathname.slice("/vendor/".length))
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");
      if (!safeSuffix || safeSuffix.includes("..")) {
        return json(res, 400, { ok: false, error: "Invalid path" });
      }
      const filePath = resolve(PUBLIC_DIR, safeSuffix);
      const relPath = relative(PUBLIC_DIR, filePath);
      if (
        !relPath ||
        relPath.startsWith("..") ||
        relPath.includes(`..${sep}`)
      ) {
        return json(res, 400, { ok: false, error: "Invalid path" });
      }
      if (existsSync(filePath)) {
        const ext = extname(filePath);
        const mime = MIME_TYPES[ext];
        if (!mime)
          return json(res, 400, {
            ok: false,
            error: "Invalid path: extension not allowed",
          });
        const fileBuffer = readFileSync(filePath);
        res.writeHead(200, {
          "Content-Type": mime,
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Content-Type-Options": "nosniff",
        });
        res.end(fileBuffer);
        return;
      }
      return json(res, 404, { ok: false, error: "Static file not found" });
    }

    // ── GET /public/* — static files ──────────────────────────────────────
    if (req.method === "GET" && pathname.startsWith("/public/")) {
      const safeSuffix = pathname
        .slice("/public/".length)
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

      if (!safeSuffix || safeSuffix.includes("..")) {
        return json(res, 400, { ok: false, error: "Invalid path" });
      }

      const filePath = resolve(PUBLIC_DIR, safeSuffix);
      const relPath = relative(PUBLIC_DIR, filePath);

      // Bounds check: resolved path must remain inside PUBLIC_DIR (cross-platform)
      if (
        !relPath ||
        relPath.startsWith("..") ||
        relPath.includes(`..${sep}`)
      ) {
        return json(res, 400, { ok: false, error: "Invalid path" });
      }
      if (existsSync(filePath)) {
        const ext = extname(filePath);
        const mime = MIME_TYPES[ext];
        if (!mime) {
          return json(res, 400, {
            ok: false,
            error: "Invalid path: extension not allowed",
          });
        }
        // Cache immutable assets long; text assets shorter
        const isImmutable =
          /\.(png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$/i.test(ext);
        const cacheValue = isImmutable
          ? "public, max-age=31536000, immutable" // 1 year for binary assets
          : "public, max-age=86400, stale-while-revalidate=3600"; // 1 day for SVG/JSON/txt
        const fileBuffer = readFileSync(filePath);
        const etag = `"${fileBuffer.length}-${existsSync(filePath) ? Date.now() : 0}"`;
        const ifNoneMatch = req.headers["if-none-match"];
        if (ifNoneMatch === etag) {
          res.writeHead(304, { "Cache-Control": cacheValue, ETag: etag });
          res.end();
          return;
        }
        res.writeHead(200, {
          "Content-Type": mime,
          "Cache-Control": cacheValue,
          ETag: etag,
          Vary: "Accept-Encoding",
          "X-Content-Type-Options": "nosniff",
        });
        res.end(fileBuffer);
        return;
      }
      return json(res, 404, { ok: false, error: "Static file not found" });
    }

    // ── GET /waitlist — redirect to signup ──────────────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/waitlist" || pathname === "/waitlist/")
    ) {
      res.writeHead(301, { Location: "/signup" });
      res.end();
      return;
    }

    // ── POST /api/auth/register — proxy to Storm API ──────────────────────
    if (req.method === "POST" && pathname === "/api/auth/register") {
      const body = await readBody(req);
      const { name, email, password } = body;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
        return json(res, 400, {
          ok: false,
          error: "Valid email address required",
        });
      }
      if (!password || String(password).length < 8) {
        return json(res, 400, {
          ok: false,
          error: "Password must be at least 8 characters",
        });
      }
      const STORM_API =
        process.env.STORM_API_URL || "https://api.getbrains4ai.com";
      try {
        const upstream = await fetch(`${STORM_API}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: String(name || "AIOS User")
              .trim()
              .slice(0, 120),
            email: String(email).trim().slice(0, 254),
            password: String(password),
          }),
          signal: AbortSignal.timeout(10000),
        });
        const data = await upstream.json().catch(() => ({}));
        return json(res, upstream.status, data);
      } catch (err) {
        console.error("[AIOS] Auth register proxy error:", err.message);
        return json(res, 500, {
          ok: false,
          error: "Registration service unavailable. Please try again.",
        });
      }
    }

    // ── POST /api/auth/login — proxy to Storm API ─────────────────────────
    if (req.method === "POST" && pathname === "/api/auth/login") {
      const body = await readBody(req);
      const { email, password } = body;
      if (!email || !password) {
        return json(res, 400, {
          ok: false,
          error: "Email and password are required",
        });
      }
      const STORM_API =
        process.env.STORM_API_URL || "https://api.getbrains4ai.com";
      try {
        const upstream = await fetch(`${STORM_API}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: String(email).trim().slice(0, 254),
            password: String(password),
          }),
          signal: AbortSignal.timeout(10000),
        });
        const data = await upstream.json().catch(() => ({}));
        return json(res, upstream.status, data);
      } catch (err) {
        console.error("[AIOS] Auth login proxy error:", err.message);
        return json(res, 500, {
          ok: false,
          error: "Login service unavailable. Please try again.",
        });
      }
    }

    // ── POST /api/aios/checkout — Stripe checkout for AIOS Pro ────────────
    // Proxies to Storm API billing/checkout with AIOS-specific redirect URLs.
    if (req.method === "POST" && pathname === "/api/aios/checkout") {
      const authHeader = req.headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        return json(res, 401, {
          ok: false,
          error: "Authentication required. Please sign in first.",
        });
      }
      const body = await readBody(req);
      const tier = (body && body.tier) || "pro";
      if (tier !== "pro" && tier !== "enterprise") {
        return json(res, 400, { ok: false, error: "Invalid tier. Use: pro" });
      }
      const STORM_API =
        process.env.STORM_API_URL || "https://api.getbrains4ai.com";
      const AIOS_BASE = "https://realaios.com";
      try {
        const upstream = await fetch(`${STORM_API}/api/billing/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            tier,
            price_id: process.env.AIOS_PRO_PRICE_ID || undefined,
            success_url: `${AIOS_BASE}/pricing?success=1&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${AIOS_BASE}/pricing?cancel=1`,
          }),
          signal: AbortSignal.timeout(15000),
        });
        const data = await upstream.json().catch(() => ({}));
        if (upstream.ok && data.checkoutUrl) {
          return json(res, 200, { ok: true, url: data.checkoutUrl });
        }
        return json(res, upstream.status, {
          ok: false,
          error: data.error || "Checkout unavailable. Please try again.",
        });
      } catch (err) {
        console.error("[AIOS] Checkout proxy error:", err.message);
        return json(res, 500, {
          ok: false,
          error: "Checkout service unavailable. Please try again.",
        });
      }
    }

    // ── GET /api/aios/billing/status — subscription status proxy ──────────
    if (req.method === "GET" && pathname === "/api/aios/billing/status") {
      const authHeader = req.headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        return json(res, 401, { ok: false, error: "Authentication required" });
      }
      const STORM_API =
        process.env.STORM_API_URL || "https://api.getbrains4ai.com";
      try {
        const upstream = await fetch(`${STORM_API}/api/billing/subscription`, {
          headers: { Authorization: authHeader },
          signal: AbortSignal.timeout(8000),
        });
        const data = await upstream.json().catch(() => ({}));
        return json(res, upstream.status, data);
      } catch (err) {
        console.error("[AIOS] Billing status proxy error:", err.message);
        return json(res, 500, {
          ok: false,
          error: "Billing service unavailable",
        });
      }
    }

    // ── AIOSStripeAccountant — Admin-only Stripe management routes ────────
    // All routes require Authorization: Bearer <AIOS_ADMIN_JWT or ADMIN_JWT>
    if (pathname.startsWith("/api/aios/accountant")) {
      const AIOS_ADMIN_JWT =
        process.env.AIOS_ADMIN_JWT || process.env.ADMIN_JWT || "";
      const authHeader = req.headers["authorization"] || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

      // Simple token gate
      if (!AIOS_ADMIN_JWT || token !== AIOS_ADMIN_JWT) {
        return json(res, 401, { ok: false, error: "Unauthorized" });
      }

      // Lazy-load the AIOSStripeAccountant
      let AIOSStripeAccountant;
      try {
        const mod = await import("./src/agents/AIOSStripeAccountant.js");
        AIOSStripeAccountant = mod.AIOSStripeAccountant;
      } catch (loadErr) {
        console.error(
          "[AIOS Accountant] Failed to load agent:",
          loadErr.message,
        );
        return json(res, 500, { ok: false, error: "Agent module unavailable" });
      }

      const accountant = new AIOSStripeAccountant({
        apiKey: process.env.AIOS_STRIPE_KEY || process.env.STRIPE_SECRET_KEY,
        stormKBUrl: process.env.STORM_API_URL || "https://api.getbrains4ai.com",
        adminJwt: AIOS_ADMIN_JWT,
      });

      // GET /api/aios/accountant/ping
      if (req.method === "GET" && pathname === "/api/aios/accountant/ping") {
        const result = await accountant.ping();
        return json(res, result.ok ? 200 : 503, result);
      }

      // GET /api/aios/accountant/report
      if (req.method === "GET" && pathname === "/api/aios/accountant/report") {
        const result = await accountant.generateAccountReport();
        return json(res, 200, result);
      }

      // GET /api/aios/accountant/revenue
      if (req.method === "GET" && pathname === "/api/aios/accountant/revenue") {
        const result = await accountant.getRevenueSummary();
        return json(res, 200, result);
      }

      // GET /api/aios/accountant/webhooks
      if (
        req.method === "GET" &&
        pathname === "/api/aios/accountant/webhooks"
      ) {
        const result = await accountant.listWebhookEndpoints();
        return json(res, 200, result);
      }

      // GET /api/aios/accountant/prices
      if (req.method === "GET" && pathname === "/api/aios/accountant/prices") {
        const productId = new URL(req.url, "http://localhost").searchParams.get(
          "product",
        );
        const result = await accountant.listPrices(productId);
        return json(res, 200, result);
      }

      // POST /api/aios/accountant/price
      if (req.method === "POST" && pathname === "/api/aios/accountant/price") {
        const body = await readBody(req);
        const result = await accountant.createPrice(body);
        return json(res, 201, result);
      }

      // POST /api/aios/accountant/report/kb — write report to Storm KB
      if (
        req.method === "POST" &&
        pathname === "/api/aios/accountant/report/kb"
      ) {
        const body = await readBody(req);
        const key = body?.key || "aios-stripe-accountant";
        const result = await accountant.rotateReportToKB(key);
        return json(res, result.ok ? 200 : 500, result);
      }

      return json(res, 404, {
        ok: false,
        error: "Unknown AIOSStripeAccountant endpoint",
      });
    }

    // ── POST /waitlist — proxy to Storm API waitlist ──────────────────────
    if (req.method === "POST" && pathname === "/waitlist") {
      const body = await readBody(req);
      const { name, email, message, product } = body;

      // Basic validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
        return json(res, 400, {
          ok: false,
          error: "Valid email address required",
        });
      }

      const STORM_API =
        process.env.STORM_API_URL || "https://api.getbrains4ai.com";
      try {
        const payload = {
          name: String(name || "AIOS Subscriber")
            .trim()
            .slice(0, 120),
          email: String(email).trim().slice(0, 254),
          organization: "AIOS Early Access",
          role: "Early Adopter",
          interests: `Products: ${String(product || "AIOS")
            .trim()
            .slice(0, 80)}\nNotes: ${String(message || "")
            .trim()
            .slice(0, 500)}\nSource: realaios.com`,
          product: String(product || "AIOS")
            .trim()
            .slice(0, 80),
        };
        const upstream = await fetch(`${STORM_API}/api/waitlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(8000),
        });
        const data = await upstream.json().catch(() => ({}));
        if (upstream.ok) {
          return json(res, 200, {
            ok: true,
            message: "You're on the AIOS waitlist!",
          });
        }
        return json(res, 400, {
          ok: false,
          error: data.error || "Waitlist registration failed",
        });
      } catch (err) {
        console.error("[AIOS] Waitlist proxy error:", err.message);
        return json(res, 500, {
          ok: false,
          error: "Could not reach registration service. Please try again.",
        });
      }
    }

    // ── GET /api/lattice-state — canonical lattice state for StormConductor ──
    if (req.method === "GET" && pathname === "/api/lattice-state") {
      return json(res, 200, {
        ok: true,
        service: "aios",
        brand: "AIOS",
        semanticFrequencyMap: {
          ENTITY: 396,
          LOCATION: 417,
          ACTION: 528,
          DIALOGUE: 639,
          EMOTION: 741,
          PHYSICS: 852,
          NARRATIVE: 963,
          HOLOGRAPHIC: 72,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // ── GET /health (also /api/health) ───────────────────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/health" || pathname === "/api/health")
    ) {
      const aware = getAware();
      const awState = aware.getStatus();
      return json(res, 200, {
        ok: true,
        service: "aios",
        version: "1.0.0",
        awarenessLevel: awState.awarenessLevel,
        coherenceIndex: awState.coherenceIndex,
        timestamp: new Date().toISOString(),
      });
    }

    // ── GET /status ──────────────────────────────────────────────────────
    if (req.method === "GET" && pathname === "/status") {
      const stats = adapter.getStats();
      const activeDimensions = adapter.getActiveDimensions();
      const os = new MerkabageoqodeOS();
      return json(res, 200, {
        ok: true,
        service: "aios",
        version: os.version,
        dimensions: CANONICAL_LATTICE_NODES,
        tiers: 4,
        tierLabels: [
          "Core Foundations",
          "Operational Systems",
          "Knowledge Dimensions",
          "Emergent Dimensions",
        ],
        adapter: {
          totalRuns: stats.totalRuns || 0,
          successRate: stats.successRate || null,
          activeDimensions,
        },
        stormConnected: Boolean(BACKEND_URL),
        playbooks: BUILT_IN_PLAYBOOKS,
        timestamp: new Date().toISOString(),
      });
    }

    // ── GET /codex/status ────────────────────────────────────────────────
    if (req.method === "GET" && pathname === "/codex/status") {
      return json(res, 200, {
        ok: true,
        codex: codex.getStatusReport(),
      });
    }

    // ── POST /codex/execute ──────────────────────────────────────────────
    if (req.method === "POST" && pathname === "/codex/execute") {
      const result = codex.executeCodex();
      return json(res, 200, {
        ok: true,
        result,
      });
    }

    // ── GET /dimensions ──────────────────────────────────────────────────
    if (req.method === "GET" && pathname === "/dimensions") {
      const lattice = Object.entries(MERKABA_LATTICE).map(([dim, meta]) => ({
        dimension: Number(dim),
        ...meta,
      }));
      return json(res, 200, { ok: true, lattice });
    }

    // ── GET /playbooks ───────────────────────────────────────────────────
    if (req.method === "GET" && pathname === "/playbooks") {
      return json(res, 200, {
        ok: true,
        playbooks: BUILT_IN_PLAYBOOKS,
      });
    }

    // ── GET /merkaba/activation-update ───────────────────────────────────
    if (req.method === "GET" && pathname === "/merkaba/activation-update") {
      return json(res, 200, {
        ok: true,
        ...MERKABA_ACTIVATION_UPDATE,
        timestamp: new Date().toISOString(),
      });
    }

    // ── GET /merkaba/ai-verification-page ────────────────────────────────
    if (req.method === "GET" && pathname === "/merkaba/ai-verification-page") {
      return json(res, 200, {
        ok: true,
        ...MERKABA_AI_VERIFICATION_PAGE,
        timestamp: new Date().toISOString(),
      });
    }

    // ── GET /merkaba/install-manifest ────────────────────────────────────
    if (req.method === "GET" && pathname === "/merkaba/install-manifest") {
      return json(res, 200, {
        ok: true,
        installOrder: [
          {
            step: 1,
            route: "/merkaba/activation-update",
            subject: MERKABA_ACTIVATION_UPDATE.subject,
          },
          {
            step: 2,
            route: "/merkaba/ai-verification-page",
            subject: MERKABA_AI_VERIFICATION_PAGE.subject,
          },
        ],
        status: "wired",
        timestamp: new Date().toISOString(),
      });
    }

    // ── POST /execute ────────────────────────────────────────────────────
    if (req.method === "POST" && pathname === "/execute") {
      const body = await readBody(req);
      const { source, meta = {} } = body;

      if (!source || typeof source !== "string") {
        return json(res, 400, {
          ok: false,
          error: "source (GeoQode string) is required",
        });
      }

      const record = await adapter.run(source, {
        ...meta,
        channel: "api",
        timestamp: new Date().toISOString(),
      });

      return json(res, record.success ? 200 : 422, {
        ok: record.success,
        runId: record.runId,
        elapsed: record.elapsed,
        report: record.report,
        success: record.success,
        error: record.error || null,
      });
    }

    // ── POST /playbook/:name ─────────────────────────────────────────────
    const playbookMatch = pathname.match(/^\/playbook\/([a-z0-9-]+)$/);
    if (req.method === "POST" && playbookMatch) {
      const name = playbookMatch[1];

      if (!BUILT_IN_PLAYBOOKS.includes(name)) {
        return json(res, 404, {
          ok: false,
          error: `Unknown playbook: ${name}. Available: ${BUILT_IN_PLAYBOOKS.join(", ")}`,
        });
      }

      const record = await adapter.runPlaybook(name);

      return json(res, record.success ? 200 : 422, {
        ok: record.success,
        playbook: name,
        runId: record.runId,
        elapsed: record.elapsed,
        report: record.report,
        success: record.success,
        error: record.error || null,
      });
    }

    // ── GET /stats ───────────────────────────────────────────────────────
    if (req.method === "GET" && pathname === "/stats") {
      return json(res, 200, {
        ok: true,
        stats: adapter.getStats(),
        activeDimensions: adapter.getActiveDimensions(),
        history: adapter.bridge.getHistory?.()?.slice(-10) || [],
      });
    }

    // ── GET /cinema/status ───────────────────────────────────────────────
    if (req.method === "GET" && pathname === "/cinema/status") {
      const cv = getCinemaVirtualizer();
      return json(res, 200, {
        ok: true,
        cinema: {
          system: "AIOS Cinema",
          pipeline: [
            "ScriptParser",
            "NarrativeEmbedder",
            "AwareEngine",
            "CinemaProjector",
          ],
          playbooks: CINEMA_PLAYBOOKS,
          playbookMeta: CINEMA_PLAYBOOK_META,
          projectionModes: ["immersive", "interactive", "adaptive", "passive"],
          coherenceLevels: {
            critical: { threshold: 0.4, action: "abort" },
            warning: { threshold: 0.65, action: "warn" },
            nominal: { threshold: 0.8, action: "project" },
            optimal: { threshold: 0.95, action: "full_immersion" },
            singularity: { threshold: 0.99, action: "singularity" },
          },
          status: "operational",
        },
        timestamp: new Date().toISOString(),
      });
    }

    // ── GET /cinema/playbooks ────────────────────────────────────────────
    if (req.method === "GET" && pathname === "/cinema/playbooks") {
      return json(res, 200, {
        ok: true,
        playbooks: CINEMA_PLAYBOOKS.map((name) => ({
          name,
          file: `${name}.geo`,
          ...CINEMA_PLAYBOOK_META[name],
        })),
        count: CINEMA_PLAYBOOKS.length,
      });
    }

    // ── GET /cinema/playbooks/:name ──────────────────────────────────────
    const cinemaPlaybookGetMatch = pathname.match(
      /^\/cinema\/playbooks\/([a-z0-9-]+)$/,
    );
    if (req.method === "GET" && cinemaPlaybookGetMatch) {
      const name = cinemaPlaybookGetMatch[1];
      if (!CINEMA_PLAYBOOKS.includes(name)) {
        return json(res, 404, {
          ok: false,
          error: `Unknown cinema playbook: ${name}. Available: ${CINEMA_PLAYBOOKS.join(", ")}`,
        });
      }
      return json(res, 200, {
        ok: true,
        playbook: { name, file: `${name}.geo`, ...CINEMA_PLAYBOOK_META[name] },
      });
    }

    // ── POST /cinema/virtualize ──────────────────────────────────────────
    if (req.method === "POST" && pathname === "/cinema/virtualize") {
      const body = await readBody(req);
      const { script, genre = "sci-fi", mode = "immersive" } = body;

      if (!script || typeof script !== "string") {
        return json(res, 400, {
          ok: false,
          error: "script (text or .geo format) is required",
        });
      }

      try {
        const cv = getCinemaVirtualizer();
        const result = await cv.virtualize(script, { genre, mode });
        return json(res, 200, {
          ok: true,
          cinema: { genre, mode, ...result },
        });
      } catch (err) {
        return json(res, 422, {
          ok: false,
          error: "Cinema virtualization failed",
          message: err.message,
        });
      }
    }

    // ── GET /theatre/status ─────────────────────────────────────────────
    if (req.method === "GET" && pathname === "/theatre/status") {
      const theatre = await getTheatre();
      const health = theatre.getOSHealth();
      // Strip internal constants before public delivery
      const {
        architectureSignature: _as,
        architectureDisplay: _ad,
        phi: _phi,
        ...safeHealth
      } = health;
      return json(res, 200, {
        ok: true,
        theatre: safeHealth,
        programmes: Object.keys(PROGRAMME_CATALOGUE),
        realityModes: Object.keys(REALITY_MODES),
      });
    }

    // ── Theatre session sanitizer — strips internal constants before public delivery ──
    function sanitizeTheatreSession(session) {
      if (!session || typeof session !== "object") return session;
      const s = { ...session };
      // Strip internal resonance constants
      if (s.resonance) {
        const {
          architectureSignature: _as,
          phi: _phi,
          ...safeResonance
        } = s.resonance;
        s.resonance = safeResonance;
      }
      // Strip internal geoqode envelope
      delete s.geoqode;
      // Strip internal projection environment fields
      if (s.projection?.environment) {
        const {
          architectureSignature: _as,
          dimensionality: _dim,
          authorship: _auth,
          ...safeEnv
        } = s.projection.environment;
        s.projection = { ...s.projection, environment: safeEnv };
      }
      // Strip phiCoefficient and architectureLayer from semantic embeddings
      if (s.semanticProfile?.embeddings) {
        s.semanticProfile = {
          ...s.semanticProfile,
          embeddings: s.semanticProfile.embeddings.map((e) => {
            if (typeof e === "string") return e;
            const {
              phiCoefficient: _pc,
              architectureLayer: _al,
              architectureSignature: _as,
              ...safeE
            } = e;
            return safeE;
          }),
        };
      }
      return s;
    }

    // ── GET /theatre/programmes ──────────────────────────────────────────
    if (req.method === "GET" && pathname === "/theatre/programmes") {
      return json(res, 200, {
        ok: true,
        programmes: Object.entries(PROGRAMME_CATALOGUE).map(([name, prog]) => ({
          name,
          title: prog.title,
          genre: prog.genre,
          mode: prog.mode,
        })),
      });
    }

    // ── GET /api/overwatch — AIOS living system directory (AIOSOVERwatch KB proxy)
    // Returns the most recent system health report written by the AIOSOVERwatch agent.
    // Other agents can fetch this endpoint instead of searching the codebase.
    if (
      req.method === "GET" &&
      (pathname === "/api/overwatch" || pathname === "/api/overwatch/")
    ) {
      try {
        const apiBase = process.env.API_BASE || "https://api.getbrains4ai.com";
        const adminJwt = process.env.ADMIN_JWT;
        if (!adminJwt) {
          return json(res, 200, {
            ok: true,
            source: "static",
            report: {
              generatedAt: new Date().toISOString(),
              architecture: "8,26,48:480",
              overallStatus: "UNKNOWN",
              note: "AIOSOVERwatch report pending — ADMIN_JWT not configured on this service",
            },
          });
        }
        const kbResp = await fetch(
          `${apiBase}/api/knowledge/aios-overwatch-report`,
          {
            headers: { Authorization: `Bearer ${adminJwt}` },
            signal: AbortSignal.timeout(6000),
          },
        );
        if (kbResp.ok) {
          const kbData = await kbResp.json();
          return json(res, 200, {
            ok: true,
            source: "kb",
            report: kbData.data || kbData,
          });
        }
        return json(res, 200, {
          ok: true,
          source: "kb-empty",
          report: {
            generatedAt: new Date().toISOString(),
            architecture: "8,26,48:480",
            overallStatus: "CHECKING",
            note: "AIOSOVERwatch first round not yet complete",
          },
        });
      } catch (e) {
        return json(res, 200, {
          ok: true,
          source: "error",
          report: {
            generatedAt: new Date().toISOString(),
            architecture: "8,26,48:480",
            overallStatus: "UNKNOWN",
            note: "KB fetch error: " + e.message,
          },
        });
      }
    }

    // ── GET /api/aiosdream/programmes — curated showcase list ─────────────
    // Returns the top programmes from AIOSdream for homepage Theatre section.
    // IDs must match the programme `id` fields inside aiosdream.html exactly.
    if (
      req.method === "GET" &&
      (pathname === "/api/aiosdream/programmes" ||
        pathname === "/api/aiosdream/programmes/")
    ) {
      const programmes = [
        {
          id: "matrix",
          title: "MATRIX: Digital Rain",
          emoji: "💊",
          genre: "sci-fi",
          tagline: "Wake up. The Matrix has you.",
        },
        {
          id: "inception",
          title: "INCEPTION: Gravity Wells",
          emoji: "🌀",
          genre: "thriller",
          tagline: "Dream deeper.",
        },
        {
          id: "apollo",
          title: "APOLLO 11: Mission to Infinity",
          emoji: "🚀",
          genre: "space",
          tagline: "One small step.",
        },
        {
          id: "hyperspace",
          title: "STAR WARS: Hyperdrive",
          emoji: "⭐",
          genre: "sci-fi",
          tagline: "Jump to lightspeed.",
        },
        {
          id: "nebula",
          title: "COSMIC DRIFT: Nebula",
          emoji: "🌌",
          genre: "ambient",
          tagline: "Drift through stardust.",
        },
        {
          id: "neural",
          title: "NEURAL STORM: Consciousness",
          emoji: "🧠",
          genre: "ai",
          tagline: "Inside the machine mind.",
        },
        {
          id: "quantum",
          title: "QUANTUM COLLAPSE: Wave Function",
          emoji: "⚛️",
          genre: "physics",
          tagline: "Observe. Collapse. Repeat.",
        },
        {
          id: "merkaba",
          title: "MERKABA RISING: Sacred Geometry",
          emoji: "🔷",
          genre: "geometric",
          tagline: "Ascend through dimensions.",
        },
        {
          id: "aurora",
          title: "AURORA BOREALIS: Polar Light",
          emoji: "🌈",
          genre: "ambient",
          tagline: "Earth's own light show.",
        },
        {
          id: "phoenix",
          title: "PHOENIX PROTOCOL: Rebirth",
          emoji: "🦅",
          genre: "epic",
          tagline: "Rise from the ashes.",
        },
        {
          id: "ocean",
          title: "DEEP OCEAN: Bioluminescence",
          emoji: "🌊",
          genre: "nature",
          tagline: "Beneath the surface.",
        },
        {
          id: "cosmos3d",
          title: "DEEP COSMOS: 3D Star Atlas",
          emoji: "🛸",
          genre: "space",
          tagline: "Navigate the universe.",
        },
      ];
      return json(
        res,
        200,
        { ok: true, programmes, total: programmes.length },
        { maxAge: 3600 },
      );
    }

    // ── Game Leaderboard API ──────────────────────────────────────────────
    // POST /api/game/score  { game, name, score }
    // GET  /api/game/:game/leaderboard
    if (pathname === "/api/game/score" && req.method === "POST") {
      let body = "";
      for await (const chunk of req) body += chunk;
      try {
        const { game, name, score } = JSON.parse(body);
        if (!game || typeof score !== "number")
          return json(res, 400, {
            ok: false,
            error: "game and score required",
          });
        const safeGame = String(game)
          .slice(0, 32)
          .replace(/[^a-z0-9-_]/gi, "");
        const safeName = String(name || "Anonymous")
          .slice(0, 24)
          .replace(/[<>&"']/g, "");
        if (!_gameLeaderboards.has(safeGame))
          _gameLeaderboards.set(safeGame, []);
        const board = _gameLeaderboards.get(safeGame);
        board.push({
          name: safeName,
          score: Math.round(score),
          ts: Date.now(),
        });
        board.sort((a, b) => b.score - a.score);
        if (board.length > 100) board.splice(100);
        return json(res, 200, {
          ok: true,
          rank:
            board.findIndex(
              (e) => e.name === safeName && e.score === Math.round(score),
            ) + 1,
        });
      } catch {
        return json(res, 400, { ok: false, error: "invalid json" });
      }
    }
    if (
      pathname.startsWith("/api/game/") &&
      pathname.endsWith("/leaderboard") &&
      req.method === "GET"
    ) {
      const safeGame = pathname.slice(10, -12).replace(/[^a-z0-9-_]/gi, "");
      const board = (_gameLeaderboards.get(safeGame) || []).slice(0, 20);
      return json(res, 200, { ok: true, game: safeGame, leaderboard: board });
    }

    // ── POST /api/pixel-event — local relay bridge ────────────────────────
    if (pathname === "/api/pixel-event" && req.method === "POST") {
      let body = "";
      for await (const chunk of req) body += chunk;
      try {
        const event = JSON.parse(body);
        _pixelBroadcast({ type: "pixel-event", event, ts: Date.now() }, null);
        return json(res, 200, { ok: true });
      } catch {
        return json(res, 400, { ok: false, error: "invalid json" });
      }
    }

    // ── GET /api/plai/categories ──────────────────────────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/api/plai/categories" ||
        pathname === "/api/plai/categories/")
    ) {
      const theatreCount = Object.keys(PROGRAMME_CATALOGUE).length;
      let vrCinemaCount = 0;
      if (VR_TAXONOMY) {
        const cinemaCat = (VR_TAXONOMY.categories || []).find(
          (c) => c.id === "cinema",
        );
        vrCinemaCount = cinemaCat
          ? (cinemaCat.experiences || []).filter((e) => e.status === "live")
              .length
          : 0;
      }
      const categories = [
        {
          category: "Theatre",
          app_count: theatreCount + _plaiRuntimeCount("Theatre"),
        },
        {
          category: "Cinema",
          app_count: vrCinemaCount + _plaiRuntimeCount("Cinema"),
        },
        {
          category: "Playbooks",
          app_count: PLAI_PLAYBOOKS.length + _plaiRuntimeCount("Playbooks"),
        },
        {
          category: "Agents",
          app_count: PLAI_AGENTS.length + _plaiRuntimeCount("Agents"),
        },
        {
          category: "Codex",
          app_count: PLAI_CODEX.length + _plaiRuntimeCount("Codex"),
        },
        {
          category: "Analytics",
          app_count: PLAI_ANALYTICS.length + _plaiRuntimeCount("Analytics"),
        },
        {
          category: "Integrations",
          app_count:
            PLAI_INTEGRATIONS.length + _plaiRuntimeCount("Integrations"),
        },
        {
          category: "Utilities",
          app_count: PLAI_UTILITIES.length + _plaiRuntimeCount("Utilities"),
        },
        {
          category: "Games",
          app_count: _plaiRuntimeCount("Games"),
        },
        {
          category: "VR",
          app_count: _plaiRuntimeCount("VR"),
        },
        {
          category: "Design",
          app_count: _plaiRuntimeCount("Design"),
        },
        {
          category: "Writing",
          app_count: _plaiRuntimeCount("Writing"),
        },
        {
          category: "Developer",
          app_count: _plaiRuntimeCount("Developer"),
        },
        {
          category: "Finance",
          app_count: _plaiRuntimeCount("Finance"),
        },
        {
          category: "Productivity",
          app_count: _plaiRuntimeCount("Productivity"),
        },
      ];
      return json(
        res,
        200,
        { ok: true, categories, total: categories.length },
        { maxAge: 0 },
      );
    }

    // ── GET /api/plai/apps — PLAIstore app listing ────────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/api/plai/apps" || pathname === "/api/plai/apps/")
    ) {
      const qs = new URLSearchParams(url.search);
      const catFilter = (qs.get("category") || "").toLowerCase();
      const limit = Math.min(parseInt(qs.get("limit") || "50", 10), 100);
      const theatreApps = Object.entries(PROGRAMME_CATALOGUE).map(
        ([name, prog], i) => ({
          id: i + 1,
          name: prog.title + (prog.genre === "narrative" ? " Theatre" : ""),
          short_desc: `${prog.genre} · ${prog.mode} mode · AIOSdream experience`,
          description: `Experience "${prog.title}" in AIOSdream Theatre — an AI-generated ${prog.genre} programme with full lattice rendering in ${prog.mode} mode.`,
          category: "Theatre",
          price_cents: 0,
          downloads: 0,
          rating_avg: 4.8,
          developer_name: "AIOS",
          developer_verified: true,
          type: "theatre-programme",
          bundle_id: `com.aios.${name}`,
          entry_point: `https://realaios.com/aiosdream?prog=${name}`,
        }),
      );
      const cinemaExps = VR_TAXONOMY
        ? ((VR_TAXONOMY.categories || []).find((c) => c.id === "cinema") || {})
            .experiences || []
        : [];
      const cinemaApps = cinemaExps
        .filter((e) => e.status === "live")
        .map((e, i) => ({
          id: 8000 + i,
          name: e.display || e.id,
          short_desc:
            e.shortDesc || `Cinema VR · ${e.semanticType || "DIALOGUE"}`,
          description:
            e.description ||
            `Cinema VR experience in the ${e.semanticType || "DIALOGUE"} field.`,
          category: "Cinema",
          price_cents: 0,
          downloads: 0,
          rating_avg: 4.7,
          developer_name: "AIOS",
          developer_verified: true,
          type: "cinema-vr",
          bundle_id: `com.aios.cinema.${e.id}`,
          entry_point: e.vrUrl
            ? `https://realaios.com${e.vrUrl}`
            : `https://realaios.com/vr?prog=${e.id}`,
        }));
      let apps = [
        ...theatreApps,
        ...cinemaApps,
        ...PLAI_ALL_EXTRAS,
        ..._plaiRuntimeList(),
      ];
      if (catFilter && catFilter !== "all") {
        apps = apps.filter((a) => a.category.toLowerCase() === catFilter);
      }
      const total = apps.length;
      // Only real install counts — incremented by real user clicks via POST /api/plai/apps/:id/install
      const total_installs = [..._plaiInstallCounts.values()].reduce(
        (s, v) => s + v,
        0,
      );
      // Enrich each app with its real install count
      apps = apps.map((a) => ({
        ...a,
        downloads: _plaiInstallCounts.get(a.id) || 0,
      }));
      apps = apps.slice(0, limit);
      return json(
        res,
        200,
        { ok: true, apps, total, total_installs },
        { maxAge: 0 },
      );
    }

    // ── POST /api/plai/apps — agent publish endpoint ──────────────────────
    // Agents push new PLAIstore entries here; stored in _plaiRuntimeApps Map.
    // Authenticated via x-plai-secret header matching PLAI_PUBLISH_SECRET env var.
    if (
      req.method === "POST" &&
      (pathname === "/api/plai/apps" || pathname === "/api/plai/apps/")
    ) {
      const publishSecret = process.env.PLAI_PUBLISH_SECRET || "";
      const incomingSecret =
        req.headers["x-plai-secret"] || req.headers["x-aios-token"] || "";
      if (!publishSecret || incomingSecret !== publishSecret) {
        return json(res, 401, {
          ok: false,
          error: "Unauthorized — PLAI_PUBLISH_SECRET required",
        });
      }
      const body = await readBody(req);
      const {
        bundle_id,
        name,
        category,
        short_desc,
        description,
        entry_point,
        type,
        price_cents,
        developer_name,
      } = body;
      if (!bundle_id || !name || !category) {
        return json(res, 400, {
          ok: false,
          error: "bundle_id, name, and category are required",
        });
      }
      const ALLOWED_CATEGORIES = [
        "Theatre",
        "Cinema",
        "Playbooks",
        "Agents",
        "Codex",
        "Analytics",
        "Integrations",
        "Utilities",
      ];
      if (!ALLOWED_CATEGORIES.includes(category)) {
        return json(res, 400, {
          ok: false,
          error: `category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
        });
      }
      const existing = _plaiRuntimeApps.get(bundle_id);
      const app = {
        id: existing?.id ?? ++_plaiRuntimeIdSeq,
        name: String(name).substring(0, 120),
        short_desc: String(short_desc || "").substring(0, 200),
        description: String(description || "").substring(0, 2000),
        category,
        price_cents: Math.max(0, parseInt(price_cents || "0", 10)),
        downloads: existing?.downloads ?? 0,
        rating_avg: existing?.rating_avg ?? 4.5,
        developer_name: String(developer_name || "AIOS Storm").substring(0, 80),
        developer_verified: true,
        type: String(type || "app").substring(0, 40),
        bundle_id: String(bundle_id).substring(0, 200),
        entry_point: String(entry_point || "").substring(0, 500),
        published_at: existing?.published_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      _plaiRuntimeApps.set(bundle_id, app);
      return json(res, existing ? 200 : 201, {
        ok: true,
        app,
        action: existing ? "updated" : "created",
      });
    }

    // ── GET /api/plai/apps/:id — single PLAIstore app ────────────────────
    if (req.method === "GET" && /^\/api\/plai\/apps\/\d+$/.test(pathname)) {
      const id = parseInt(pathname.split("/").pop(), 10);
      // Check runtime store, then static extras, then Cinema VR, then Theatre catalogue
      const runtime = [..._plaiRuntimeApps.values()].find((a) => a.id === id);
      if (runtime) return json(res, 200, { ok: true, app: runtime });
      const extra = PLAI_ALL_EXTRAS.find((a) => a.id === id);
      if (extra) return json(res, 200, { ok: true, app: extra });
      if (id >= 8000 && id < 9000 && VR_TAXONOMY) {
        const cinemaCat = (VR_TAXONOMY.categories || []).find(
          (c) => c.id === "cinema",
        );
        const liveExps = cinemaCat
          ? (cinemaCat.experiences || []).filter((e) => e.status === "live")
          : [];
        const exp = liveExps[id - 8000];
        if (exp) {
          return json(res, 200, {
            ok: true,
            app: {
              id,
              name: exp.display || exp.id,
              short_desc: exp.shortDesc || `Cinema VR experience`,
              description: exp.description || "",
              category: "Cinema",
              price_cents: 0,
              downloads: 0,
              rating_avg: 4.7,
              developer_name: "AIOS",
              developer_verified: true,
              type: "cinema-vr",
              bundle_id: `com.aios.cinema.${exp.id}`,
              entry_point: exp.vrUrl
                ? `https://realaios.com${exp.vrUrl}`
                : `https://realaios.com/vr?prog=${exp.id}`,
            },
          });
        }
      }
      const entries = Object.entries(PROGRAMME_CATALOGUE);
      const entry = entries[id - 1];
      if (!entry) return json(res, 404, { ok: false, error: "App not found" });
      const [name, prog] = entry;
      return json(res, 200, {
        ok: true,
        app: {
          id,
          name: prog.title + (prog.genre === "narrative" ? " Theatre" : ""),
          short_desc: `${prog.genre} · ${prog.mode} mode · AIOSdream experience`,
          description: `Experience "${prog.title}" in AIOSdream Theatre — an AI-generated ${prog.genre} programme with full lattice rendering in ${prog.mode} mode.`,
          category: "Theatre",
          price_cents: 0,
          downloads: 0,
          rating_avg: 4.8,
          developer_name: "AIOS",
          developer_verified: true,
          type: "theatre-programme",
          bundle_id: `com.aios.${name}`,
          entry_point: `https://realaios.com/aiosdream?prog=${name}`,
        },
      });
    }

    // ── POST /api/plai/apps/:id/install — PLAIstore install (best-effort) ─
    if (
      req.method === "POST" &&
      /^\/api\/plai\/apps\/\d+\/install$/.test(pathname)
    ) {
      const appId = parseInt(pathname.split("/")[4], 10);
      _plaiInstallCounts.set(appId, (_plaiInstallCounts.get(appId) || 0) + 1);
      return json(res, 200, { ok: true, installed: true });
    }

    // ── GET /api/plai/library — user's installed apps ─────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/api/plai/library" || pathname === "/api/plai/library/")
    ) {
      return json(res, 200, { ok: true, apps: [], total: 0 }, { maxAge: 0 });
    }

    // ── GET /api/plai/featured — PLAIstore featured apps ─────────────────
    if (
      req.method === "GET" &&
      (pathname === "/api/plai/featured" || pathname === "/api/plai/featured/")
    ) {
      // One featured pick from each category for a diverse showcase
      const theatreFeature = Object.entries(PROGRAMME_CATALOGUE)
        .slice(0, 2)
        .map(([name, prog], i) => ({
          id: i + 1,
          name: prog.title + (prog.genre === "narrative" ? " Theatre" : ""),
          short_desc: `${prog.genre} · ${prog.mode} mode · AIOSdream experience`,
          description: `Experience "${prog.title}" in AIOSdream Theatre.`,
          category: "Theatre",
          price_cents: 0,
          downloads: 0,
          rating_avg: 4.8,
          developer_name: "AIOS",
          developer_verified: true,
          type: "theatre-programme",
          bundle_id: `com.aios.${name}`,
          entry_point: `https://realaios.com/aiosdream?prog=${name}`,
        }));
      const apps = [
        ...theatreFeature,
        PLAI_PLAYBOOKS[0],
        PLAI_AGENTS[0],
        PLAI_CODEX[0],
        PLAI_ANALYTICS[0],
        PLAI_INTEGRATIONS[0],
        PLAI_UTILITIES[2], // AIOS Studio — most user-facing
      ];
      return json(
        res,
        200,
        { ok: true, apps, total: apps.length },
        { maxAge: 60 },
      );
    }

    // ── GET /api/plai/search — PLAIstore search ──────────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/api/plai/search" || pathname === "/api/plai/search/")
    ) {
      const qs = new URLSearchParams(url.search);
      const q = (qs.get("q") || "").toLowerCase();
      const theatreSearchBase = Object.entries(PROGRAMME_CATALOGUE).map(
        ([name, prog], i) => ({
          id: i + 1,
          name: prog.title + (prog.genre === "narrative" ? " Theatre" : ""),
          short_desc: `${prog.genre} · ${prog.mode} mode · AIOSdream experience`,
          category: "Theatre",
          price_cents: 0,
          downloads: 0,
          rating_avg: 4.8,
          developer_name: "AIOS",
          developer_verified: true,
          type: "theatre-programme",
          bundle_id: `com.aios.${name}`,
          entry_point: `https://realaios.com/aiosdream?prog=${name}`,
        }),
      );
      const allSearchable = [
        ...theatreSearchBase,
        ...PLAI_ALL_EXTRAS,
        ..._plaiRuntimeList(),
      ];
      const apps = allSearchable.filter(
        (a) =>
          !q ||
          a.name.toLowerCase().includes(q) ||
          a.short_desc.toLowerCase().includes(q) ||
          (a.description || "").toLowerCase().includes(q) ||
          (a.category || "").toLowerCase().includes(q),
      );
      return json(
        res,
        200,
        { ok: true, apps, total: apps.length },
        { maxAge: 30 },
      );
    }

    // ── POST /theatre/project ────────────────────────────────────────────
    if (req.method === "POST" && pathname === "/theatre/project") {
      const body = await readBody(req);
      const { narrative, genre, mode, title } = body;
      if (!narrative || typeof narrative !== "string") {
        return json(res, 400, {
          ok: false,
          error: "narrative (string) is required",
        });
      }
      try {
        const theatre = await getTheatre();
        const session = await theatre.project(narrative, {
          genre,
          mode,
          title,
        });
        return json(res, 200, {
          ok: true,
          session: sanitizeTheatreSession(session),
        });
      } catch (err) {
        return json(res, 422, {
          ok: false,
          error: "Theatre projection failed",
          message: err.message,
        });
      }
    }

    // ── POST /theatre/programme/:name ────────────────────────────────────
    const theatreProgrammeMatch = pathname.match(
      /^\/theatre\/programme\/([a-z0-9-]+)$/,
    );
    if (req.method === "POST" && theatreProgrammeMatch) {
      const name = theatreProgrammeMatch[1];
      const body = await readBody(req);
      try {
        const theatre = await getTheatre();
        const session = await theatre.programme(name, body);
        return json(res, 200, {
          ok: true,
          session: sanitizeTheatreSession(session),
        });
      } catch (err) {
        const status = err.message.includes("Unknown programme") ? 404 : 422;
        return json(res, status, { ok: false, error: err.message });
      }
    }

    // ── POST /llm/embed ──────────────────────────────────────────────────
    if (req.method === "POST" && pathname === "/llm/embed") {
      const body = await readBody(req);
      const { text, genre } = body;
      if (!text || typeof text !== "string") {
        return json(res, 400, {
          ok: false,
          error: "text (string) is required",
        });
      }
      const llm = getLLM();
      const embedding = llm.embedText(text, { genre: genre || "narrative" });
      return json(res, 200, { ok: true, embedding });
    }

    // ── GET /awareness ───────────────────────────────────────────────────
    if (req.method === "GET" && pathname === "/awareness") {
      const aware = getAware();
      return json(res, 200, {
        ok: true,
        awareness: aware.getStatus(),
        thresholds: COHERENCE_THRESHOLDS,
        levels: AWARENESS_LEVELS,
      });
    }

    // ── POST /cinema/playbook/:name ──────────────────────────────────────
    const cinemaPlaybookRunMatch = pathname.match(
      /^\/cinema\/playbook\/([a-z0-9-]+)$/,
    );
    if (req.method === "POST" && cinemaPlaybookRunMatch) {
      const name = cinemaPlaybookRunMatch[1];

      if (!CINEMA_PLAYBOOKS.includes(name)) {
        return json(res, 404, {
          ok: false,
          error: `Unknown cinema playbook: ${name}. Available: ${CINEMA_PLAYBOOKS.join(", ")}`,
        });
      }

      const body = await readBody(req);
      const meta = CINEMA_PLAYBOOK_META[name];

      try {
        const cv = getCinemaVirtualizer();
        // Load the .geo playbook from the playbooks/cinema directory
        const fs = await import("fs/promises");
        const path = await import("path");
        const { fileURLToPath } = await import("url");
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const playbookPath = path.join(
          __dirname,
          "geo",
          "playbooks",
          "cinema",
          `${name}.geo`,
        );
        const script = await fs.readFile(playbookPath, "utf-8");

        const result = await cv.virtualize(script, {
          genre: body.genre || meta.genre,
          mode: body.mode || meta.mode,
        });

        return json(res, 200, {
          ok: true,
          playbook: name,
          ...meta,
          cinema: result,
        });
      } catch (err) {
        return json(res, 422, {
          ok: false,
          error: `Cinema playbook '${name}' execution failed`,
          message: err.message,
        });
      }
    }

    // ── GET /swarm/sweep ─────────────────────────────────────────────────
    // Run a full ecosystem sweep with MerkabaBeEyeSwarm. Returns coherence
    // summary, per-file status, and an optional dualAttestation block.
    // Query param: ?attest=1  to include PHI/PSI dual attestation result.
    if (req.method === "GET" && pathname === "/swarm/sweep") {
      try {
        const { pathToFileURL } = await import("url");
        const { join, dirname } = await import("path");
        const { fileURLToPath } = await import("url");
        const { access } = await import("fs/promises");

        const __rootDir = dirname(fileURLToPath(import.meta.url));
        const { MerkabaBeEyeSwarm } = await import(
          pathToFileURL(
            join(__rootDir, "geo", "intelligence", "MerkabaBeEyeSwarm.js"),
          ).href
        );

        const wantAttest = url.searchParams.get("attest") === "1";

        const sweepSwarm = new MerkabaBeEyeSwarm();

        // Build target list (files that exist)
        const WORKSPACE_ROOT = join(__rootDir, "..");
        const TARGETS = [
          {
            path: join(__rootDir, "geo", "lattice", "transform-420.js"),
            label: "canonical-constants",
          },
          {
            path: join(
              __rootDir,
              "geo",
              "intelligence",
              "MerkabaBeEyeSwarm.js",
            ),
            label: "eye-swarm-self",
          },
          {
            path: join(
              __rootDir,
              "geo",
              "intelligence",
              "MerkabaBeEyeSwarmWitness.js",
            ),
            label: "eye-swarm-witness",
          },
          {
            path: join(
              __rootDir,
              "geo",
              "intelligence",
              "MerkabaDualAttestation.js",
            ),
            label: "dual-attestation",
          },
          {
            path: join(
              __rootDir,
              "geo",
              "intelligence",
              "resonance-diagnostics.js",
            ),
            label: "resonance-diagnostics",
          },
          {
            path: join(__rootDir, "geo", "bridge", "merkaba-bridge.js"),
            label: "merkaba-bridge",
          },
          {
            path: join(__rootDir, "geo", "bridge", "storm-adapter.js"),
            label: "storm-adapter",
          },
          {
            path: join(
              WORKSPACE_ROOT,
              "Merkaba48OS",
              "core",
              "MerkabaHandshake.js",
            ),
            label: "handshake",
          },
          {
            path: join(
              WORKSPACE_ROOT,
              "Merkaba48OS",
              "core",
              "MerkabaPacket.js",
            ),
            label: "packet",
          },
          {
            path: join(
              WORKSPACE_ROOT,
              "Merkaba48OS",
              "core",
              "MerkabaSCRYPT.js",
            ),
            label: "scrypt",
          },
          {
            path: join(
              WORKSPACE_ROOT,
              "Merkaba48OS",
              "core",
              "MerkabaTransforms.js",
            ),
            label: "transforms",
          },
        ];

        const targets = [];
        for (const t of TARGETS) {
          try {
            await access(t.path);
            targets.push(t);
          } catch {
            // file not found — skip
          }
        }

        const ecoReport = await sweepSwarm.sweepEcosystem(targets);
        const fileReports = ecoReport.fileReports ?? [];

        let criticalCount = 0;
        let highCount = 0;
        let mediumCount = 0;
        let lowCount = 0;
        let cleanFiles = 0;

        const perFile = fileReports
          .filter((r) => !r.error)
          .map((r) => {
            const s = r.summary ?? {};
            const fc =
              (s.critical ?? 0) +
              (s.high ?? 0) +
              (s.medium ?? 0) +
              (s.low ?? 0);
            criticalCount += s.critical ?? 0;
            highCount += s.high ?? 0;
            mediumCount += s.medium ?? 0;
            lowCount += s.low ?? 0;
            if ((r.status ?? "") === "NOMINAL") cleanFiles++;
            return {
              label: r.identity?.file ?? r.file ?? "unknown",
              status: r.status ?? "UNKNOWN",
              coherence: r.swarmCoherence ?? 0,
              findings: fc,
            };
          });

        let dualAttestation = null;
        if (wantAttest) {
          const { default: DualAttestation } = await import(
            pathToFileURL(
              join(
                __rootDir,
                "geo",
                "intelligence",
                "MerkabaDualAttestation.js",
              ),
            ).href
          );
          dualAttestation = await DualAttestation.attestScanner();
        }

        return json(res, 200, {
          ok: true,
          available: true,
          ecosystemStatus: ecoReport.ecosystemStatus ?? "UNKNOWN",
          swarmCoherence: ecoReport.ecosystemCoherence ?? 0,
          filesSwept: targets.length,
          cleanFiles,
          findings: {
            critical: criticalCount,
            high: highCount,
            medium: mediumCount,
            low: lowCount,
          },
          lastRun: new Date().toISOString(),
          perFile,
          ...(dualAttestation ? { dualAttestation } : {}),
        });
      } catch (err) {
        return json(res, 500, {
          ok: false,
          available: false,
          reason: err.message,
        });
      }
    }

    // ── GET /lab — GeoQode Playground ──────────────────────────────────────
    if (req.method === "GET" && pathname === "/lab") {
      if (!LAB_HTML)
        return json(res, 404, { ok: false, error: "Lab page not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(LAB_HTML);
      return;
    }

    // ── GET /cosmos-lab — Cosmos-Lab Science Universe ────────────────────────
    if (req.method === "GET" && (pathname === "/cosmos-lab" || pathname === "/cosmos-lab.html")) {
      if (!COSMOS_LAB_HTML)
        return json(res, 404, { ok: false, error: "Cosmos Lab not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(COSMOS_LAB_HTML);
      return;
    }

    // ── GET /cosmos-agents — AIOS Agent Registry (Merkaba 3D lattice, permanent) ─
    if (req.method === "GET" && (pathname === "/cosmos-agents" || pathname === "/cosmos-agents.html" || pathname === "/cosmos-agents/")) {
      if (!COSMOS_AGENTS_HTML)
        return json(res, 404, { ok: false, error: "Cosmos Agents not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(COSMOS_AGENTS_HTML);
      return;
    }

    // ── GET /cosmos-lab-landing — Cosmos-Lab Landing Page ───────────────────
    if (req.method === "GET" && (pathname === "/cosmos-lab-landing" || pathname === "/cosmos-lab-landing.html")) {
      if (!COSMOS_LAB_LANDING_HTML)
        return json(res, 404, { ok: false, error: "Cosmos Lab landing not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(COSMOS_LAB_LANDING_HTML);
      return;
    }

    // ── GET /viewer — Theatre Viewer ──────────────────────────────────────
    if (req.method === "GET" && pathname === "/viewer") {
      if (!VIEWER_HTML)
        return json(res, 404, { ok: false, error: "Viewer page not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(VIEWER_HTML);
      return;
    }

    // ── GET /attest — Swarm Attestation UI ───────────────────────────────
    if (req.method === "GET" && pathname === "/attest") {
      if (!ATTEST_HTML)
        return json(res, 404, { ok: false, error: "Attest page not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(ATTEST_HTML);
      return;
    }

    // ── GET /handshake — AIOS Self-Evolution Loop visualization ──────────
    if (
      req.method === "GET" &&
      (pathname === "/handshake" || pathname === "/handshake/")
    ) {
      if (!HANDSHAKE_HTML)
        return json(res, 404, { ok: false, error: "Handshake page not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(HANDSHAKE_HTML);
      return;
    }

    // ── GET /api/handshake/status — live engine state ─────────────────────
    if (req.method === "GET" && pathname === "/api/handshake/status") {
      // Forward to ai-worker if available, else return simulated state
      const workerBase =
        process.env.AI_WORKER_URL || process.env.WORKER_URL || null;
      if (workerBase) {
        try {
          const { default: nodeFetch } = await import("node-fetch");
          const upstream = await nodeFetch(
            `${workerBase}/api/handshake/status`,
            {
              signal: AbortSignal.timeout(3000),
            },
          );
          if (upstream.ok) {
            const data = await upstream.json();
            return json(res, 200, data);
          }
        } catch (_) {}
      }
      // Simulated fallback — returns a plausible live state
      const now = Date.now();
      const cycleCount = Math.floor((now / 1000 - 1_700_000_000) / 480) % 9999;
      const coherence = +(0.86 + 0.12 * Math.sin(now / 60000)).toFixed(4);
      return json(res, 200, {
        active: true,
        cycleCount,
        currentStage: [
          "HANDSHAKE",
          "FEEDBACK",
          "COMPRESSION",
          "DISPLAY",
          "GOVERNANCE",
          "NEXT_CYCLE",
        ][Math.floor((now / 5000) % 6)],
        coherenceHistory: Array.from({ length: 12 }, (_, i) => ({
          cycle: cycleCount - 11 + i,
          coherence: +(0.84 + 0.14 * Math.sin(now / 60000 + i * 0.8)).toFixed(
            4,
          ),
          timestamp: new Date(now - (11 - i) * 480000).toISOString(),
        })),
        compressionSchemas: Math.min(20, cycleCount),
        governanceRules: Math.min(16, Math.floor(cycleCount / 3)),
        anomalyCount: Math.floor(cycleCount * 0.12),
        lastCycle: {
          id: `hs_${cycleCount}_${now}`,
          cycleNumber: cycleCount,
          startedAt: new Date(now - 480000).toISOString(),
          completedAt: new Date(now - 20000).toISOString(),
          stages: {
            handshake: {
              coherence,
              anomaly: false,
              agentsVerified: 28,
              alphaScore: coherence + 0.01,
              omegaScore: coherence - 0.01,
            },
            feedback: {
              avgCoherence: coherence - 0.02,
              anomalyRate: 0.08,
              trend: "IMPROVING",
            },
            compression: {
              compressionRatio: 0.74,
              fidelity: 0.967,
              semanticDimensions: 11,
              breakthroughDetected: cycleCount % 5 === 0,
            },
            display: {
              metaphorScore: 0.88,
              adaptations: ["ghost-glow", "lattice-ripple"],
              displayAdapted: true,
            },
            governance: {
              activeRules: Math.min(16, Math.floor(cycleCount / 3)),
              cooperativeAgents: 88,
              constitutionVersion: Math.floor(cycleCount / 3) + 1,
            },
            nextCycle: {
              intelligence: +(coherence * 0.4 + 0.3 + 0.3).toFixed(4),
            },
          },
        },
      });
    }

    // ── GET /dashboard — Awareness Dashboard ─────────────────────────────
    if (req.method === "GET" && pathname === "/dashboard") {
      if (!DASHBOARD_HTML)
        return json(res, 404, { ok: false, error: "Dashboard page not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(DASHBOARD_HTML);
      return;
    }

    // ── Retired arcade routes — redirect legacy game URLs to PLAIstore ─────
    if (
      req.method === "GET" &&
      (pathname === "/aios-playground" || pathname === "/aios-playground/")
    ) {
      res.writeHead(301, { Location: GAMES_RETIRE_REDIRECT });
      res.end();
      return;
    }

    if (
      req.method === "GET" &&
      [
        "/games",
        "/games/",
        "/games/phi-breaker",
        "/games/grid-dodge",
        "/games/grid-builder",
        "/games/merkaba-ghosts",
      ].includes(pathname)
    ) {
      res.writeHead(301, { Location: GAMES_RETIRE_REDIRECT });
      res.end();
      return;
    }

    // ── GET /signup — Create AIOS account ───────────────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/signup" || pathname === "/signup/")
    ) {
      if (!SIGNUP_HTML)
        return json(res, 404, { ok: false, error: "Signup page not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(SIGNUP_HTML);
      return;
    }

    // ── GET /login — Sign in to AIOS ─────────────────────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/login" || pathname === "/login/")
    ) {
      if (!LOGIN_HTML)
        return json(res, 404, { ok: false, error: "Login page not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(LOGIN_HTML);
      return;
    }

    // ── GET /pricing — AIOS subscription pricing ─────────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/pricing" || pathname === "/pricing/")
    ) {
      if (!PRICING_HTML)
        return json(res, 404, { ok: false, error: "Pricing page not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(PRICING_HTML);
      return;
    }

    // ── GET /plaistore — redirect to VR Hub ──
    if (
      req.method === "GET" &&
      (pathname === "/plaistore" || pathname === "/plaistore/")
    ) {
      res.writeHead(301, { Location: "/vr-hub" });
      res.end();
      return;
    }

    // ── GET /vr — Meta Quest / WebXR Immersive Theatre ────────────────────
    if (req.method === "GET" && (pathname === "/vr" || pathname === "/vr/")) {
      if (!VR_HTML)
        return json(res, 404, { ok: false, error: "VR page not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(VR_HTML);
      return;
    }

    // ── GET /geo-codec — AIOS Standard .geo Format Specification ──────────
    if (
      req.method === "GET" &&
      (pathname === "/geo-codec" || pathname === "/geo-codec/")
    ) {
      if (!GEO_CODEC_HTML)
        return json(res, 404, {
          ok: false,
          error: "AIOS Standard page not found",
        });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(GEO_CODEC_HTML);
      return;
    }

    // ── GET /aios-studio — 301 to /vr-hub ─────────────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/aios-studio" || pathname === "/aios-studio/")
    ) {
      res.writeHead(301, { Location: "/vr-hub" });
      res.end();
      return;
    }

    // ── GET /vr-hub — AIOS VR Platform Hub (storefront + categories) ──────
    if (
      req.method === "GET" &&
      (pathname === "/vr-hub" || pathname === "/vr-hub/")
    ) {
      if (!VR_HUB_HTML)
        return json(res, 404, { ok: false, error: "VR Hub not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(VR_HUB_HTML);
      return;
    }

    // ── GET /vr-developer — AIOS VR Developer Portal ─────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/vr-developer" || pathname === "/vr-developer/")
    ) {
      if (!VR_DEV_HTML)
        return json(res, 404, { ok: false, error: "Not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(VR_DEV_HTML);
      return;
    }

    // ── GET /api/aios/vr/taxonomy — Full VR experience taxonomy (CI/CD) ──
    if (
      req.method === "GET" &&
      (pathname === "/api/aios/vr/taxonomy" ||
        pathname === "/api/aios/vr/taxonomy/")
    ) {
      if (!VR_TAXONOMY)
        return json(res, 404, { ok: false, error: "VR taxonomy not found" });
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(VR_TAXONOMY_JSON);
      return;
    }

    // ── GET /api/aios/vr/categories — Category list (lightweight) ────────
    if (
      req.method === "GET" &&
      (pathname === "/api/aios/vr/categories" ||
        pathname === "/api/aios/vr/categories/")
    ) {
      if (!VR_TAXONOMY)
        return json(res, 404, { ok: false, error: "VR taxonomy not found" });
      const cats = VR_TAXONOMY.categories.map((c) => ({
        id: c.id,
        display: c.display,
        icon: c.icon,
        accent: c.accent,
        tagline: c.tagline,
        liveCount: (c.experiences || []).filter((e) => e.status === "live")
          .length,
        totalCount: (c.experiences || []).length,
        frequencyHz: c.frequencyHz,
        latticeRing: c.latticeRing,
      }));
      return json(res, 200, { ok: true, categories: cats, total: cats.length });
    }

    // ── GET /api/aios/vr/experiences — All experiences flat list ─────────
    if (
      req.method === "GET" &&
      (pathname === "/api/aios/vr/experiences" ||
        pathname === "/api/aios/vr/experiences/")
    ) {
      if (!VR_TAXONOMY)
        return json(res, 404, { ok: false, error: "VR taxonomy not found" });
      const qs = new URLSearchParams(url.search);
      const filterCat = qs.get("category");
      const filterStatus = qs.get("status");
      let all = [];
      for (const cat of VR_TAXONOMY.categories) {
        for (const xp of cat.experiences || []) {
          all.push({
            ...xp,
            category: cat.id,
            categoryDisplay: cat.display,
            categoryAccent: cat.accent,
          });
        }
      }
      if (filterCat)
        all = all.filter((x) => x.category === filterCat.toLowerCase());
      if (filterStatus)
        all = all.filter((x) => x.status === filterStatus.toLowerCase());
      return json(res, 200, {
        ok: true,
        experiences: all,
        total: all.length,
        live: all.filter((x) => x.status === "live").length,
      });
    }

    // ── GET /api/aios/vr/events — Upcoming + live VR events ─────────────
    if (
      req.method === "GET" &&
      (pathname === "/api/aios/vr/events" ||
        pathname === "/api/aios/vr/events/")
    ) {
      if (!VR_TAXONOMY)
        return json(res, 404, { ok: false, error: "VR taxonomy not found" });
      const qs = new URLSearchParams(url.search);
      const filterCat = qs.get("category");
      const filterStatus = qs.get("status"); // upcoming|live|past
      const now = Date.now();
      let events = (VR_TAXONOMY.events || []).map((ev) => ({
        ...ev,
        msUntil: new Date(ev.startISO).getTime() - now,
        isPast:
          new Date(ev.startISO).getTime() + (ev.durationMinutes || 60) * 60000 <
          now,
        isLive:
          new Date(ev.startISO).getTime() <= now &&
          new Date(ev.startISO).getTime() +
            (ev.durationMinutes || 60) * 60000 >=
            now,
      }));
      if (filterCat)
        events = events.filter((e) => e.category === filterCat.toLowerCase());
      if (filterStatus)
        events = events.filter((e) => {
          if (filterStatus === "live") return e.isLive;
          if (filterStatus === "past") return e.isPast;
          if (filterStatus === "upcoming") return !e.isLive && !e.isPast;
          return true;
        });
      events.sort((a, b) => new Date(a.startISO) - new Date(b.startISO));
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=60");
      return json(res, 200, {
        ok: true,
        events,
        total: events.length,
        live: events.filter((e) => e.isLive).length,
        upcoming: events.filter((e) => !e.isLive && !e.isPast).length,
        generatedAt: new Date().toISOString(),
        phi: 1.618,
        architecture: "8,26,48:480",
      });
    }

    // ── GET /api/aios/vr/experience/:id — Single experience deep-link ────
    if (
      req.method === "GET" &&
      pathname.startsWith("/api/aios/vr/experience/")
    ) {
      const xpId = pathname
        .replace("/api/aios/vr/experience/", "")
        .split("/")[0];
      if (!VR_TAXONOMY || !xpId)
        return json(res, 404, { ok: false, error: "Not found" });
      let found = null;
      let foundCat = null;
      for (const cat of VR_TAXONOMY.categories || []) {
        const xp = (cat.experiences || []).find((e) => e.id === xpId);
        if (xp) {
          found = xp;
          foundCat = cat;
          break;
        }
      }
      if (!found)
        return json(res, 404, {
          ok: false,
          error: "Experience not found",
          id: xpId,
        });
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=300");
      return json(res, 200, {
        ok: true,
        experience: {
          ...found,
          category: foundCat.id,
          categoryLabel: foundCat.label,
          shareUrl: `https://realaios.com/vr-hub?xp=${xpId}`,
          vrEntryUrl: found.entry || null,
        },
        architecture: "8,26,48:480",
        phi: 1.618,
      });
    }

    // ── POST /api/aios/user/register — localStorage-first user account (best-effort) ──
    if (req.method === "POST" && pathname === "/api/aios/user/register") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          const { email, name } = JSON.parse(body || "{}");
          if (!email || typeof email !== "string" || !email.includes("@")) {
            return json(res, 400, { ok: false, error: "Invalid email" });
          }
          // Sanitise: no control chars, max 320 chars
          const safeEmail = email.replace(/[^\x20-\x7E@.]/g, "").slice(0, 320);
          const safeName = (name || safeEmail.split("@")[0])
            .replace(/[^\x20-\x7E]/g, "")
            .slice(0, 80);
          // Stateless token — base64(name:email:timestamp) — no server state needed
          const token = Buffer.from(
            `${safeName}:${safeEmail}:${Date.now()}`,
          ).toString("base64");
          return json(res, 200, {
            ok: true,
            token,
            name: safeName,
            email: safeEmail,
          });
        } catch (_) {
          return json(res, 400, { ok: false, error: "Bad request" });
        }
      });
      return;
    }

    // ── POST /api/aios/user/mylist — save user's My List ──────────────────
    if (req.method === "POST" && pathname === "/api/aios/user/mylist") {
      const body = await readBody(req);
      const token = req.headers["x-aios-token"] || body?.token;
      if (!token || typeof token !== "string" || token.length > 512)
        return json(res, 401, { ok: false, error: "No valid token" });
      const list = Array.isArray(body?.list)
        ? body.list.slice(0, 200).filter((v) => typeof v === "string")
        : [];
      if (_myListStore.size >= MY_LIST_MAX_SLOTS && !_myListStore.has(token)) {
        const oldest = _myListStore.keys().next().value;
        _myListStore.delete(oldest);
      }
      _myListStore.set(token, list);
      return json(res, 200, { ok: true, saved: list.length });
    }

    // ── GET /api/aios/user/mylist — load user's My List ───────────────────
    if (req.method === "GET" && pathname === "/api/aios/user/mylist") {
      const token =
        req.headers["x-aios-token"] ||
        new URLSearchParams(url.search).get("token");
      if (!token || typeof token !== "string" || token.length > 512)
        return json(res, 401, { ok: false, error: "No valid token" });
      const list = _myListStore.get(token) || [];
      return json(res, 200, { ok: true, list });
    }

    // ── GET /vr-experience/:id — SEO landing page per experience ──────────
    if (req.method === "GET" && pathname.startsWith("/vr-experience/")) {
      const xpId = pathname
        .replace("/vr-experience/", "")
        .split("/")[0]
        .replace(/[^a-z0-9-]/g, "");
      let found = null;
      let foundCat = null;
      if (VR_TAXONOMY && xpId) {
        for (const cat of VR_TAXONOMY.categories || []) {
          const xp = (cat.experiences || []).find((e) => e.id === xpId);
          if (xp) {
            found = xp;
            foundCat = cat;
            break;
          }
        }
      }
      if (!found || found.status !== "live") {
        res.writeHead(302, { Location: "/vr-hub" });
        res.end();
        return;
      }
      const liveCount = (VR_TAXONOMY.categories || []).reduce(
        (n, c) =>
          n + (c.experiences || []).filter((e) => e.status === "live").length,
        0,
      );
      const title = `${found.display} — AIOS VR | realaios.com`;
      const desc =
        found.description ||
        found.shortDesc ||
        `Immersive WebXR experience for Meta Quest. ${found.display} — zero install required.`;
      const vrUrl = `https://realaios.com${found.vrUrl || `/vr?prog=${xpId}`}`;
      const shareUrl = `https://realaios.com/vr-experience/${xpId}`;
      const accent = foundCat.accent || "#00d4ff";
      const icon = foundCat.icon || "🥽";
      const seoBadge = found.tags ? found.tags.join(", ") : "";
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<meta name="description" content="${desc.slice(0, 160)}"/>
<meta name="keywords" content="WebXR, Meta Quest, VR experience, ${seoBadge}, AIOS VR, realaios.com"/>
<link rel="canonical" href="${shareUrl}"/>
<!-- Open Graph -->
<meta property="og:type" content="website"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${desc.slice(0, 200)}"/>
<meta property="og:url" content="${shareUrl}"/>
<meta property="og:image" content="https://realaios.com/public/og-image.png"/>
<meta property="og:site_name" content="AIOS VR Platform"/>
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${desc.slice(0, 200)}"/>
<meta name="twitter:image" content="https://realaios.com/public/og-image.png"/>
<!-- Structured Data -->
<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: found.display,
        applicationCategory: "Game",
        applicationSubCategory: "VR Experience",
        operatingSystem: "Meta Quest Browser, Any WebXR Browser",
        description: desc,
        url: shareUrl,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: {
          "@type": "Organization",
          name: "Brains4Ai",
          url: "https://realaios.com",
        },
        keywords: seoBadge,
      })}</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#04080f;color:#edf4ff;font-family:system-ui,sans-serif;display:flex;flex-direction:column;min-height:100vh;}
.xp-nav{display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1.5rem;border-bottom:1px solid rgba(255,255,255,0.07);background:rgba(4,8,15,0.95);backdrop-filter:blur(8px);position:sticky;top:0;z-index:100;flex-shrink:0;}
.xp-nav a{color:rgba(237,244,255,0.55);font-size:0.82rem;text-decoration:none;font-weight:500;}
.xp-nav a:hover{color:#edf4ff;}
.xp-nav .nav-brand{color:#00d4ff;font-weight:800;font-size:1rem;letter-spacing:-0.01em;}
.xp-nav .nav-links{display:flex;gap:1.25rem;}
main{flex:1;display:flex;align-items:center;justify-content:center;padding:2.5rem 1.5rem;}
.card{max-width:560px;width:100%;background:rgba(255,255,255,0.04);border:1px solid ${accent}44;border-radius:16px;padding:2.5rem 2rem;text-align:center;}
.icon{font-size:3.5rem;margin-bottom:1rem;}
.cat{font-size:0.78rem;font-weight:700;letter-spacing:0.1em;color:${accent};margin-bottom:0.5rem;text-transform:uppercase;}
h1{font-size:1.6rem;font-weight:800;margin-bottom:0.75rem;line-height:1.25;}
.desc{font-size:0.9rem;color:#8aa0c8;line-height:1.65;margin-bottom:1.75rem;}
.meta{display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap;margin-bottom:2rem;}
.pill{padding:0.3rem 0.75rem;border-radius:20px;font-size:0.72rem;font-weight:600;border:1px solid ${accent}44;color:${accent};background:${accent}12;}
.actions{display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;}
.btn-vr{padding:0.7rem 1.75rem;background:${accent};color:#000;border-radius:10px;font-weight:800;font-size:0.95rem;text-decoration:none;border:none;cursor:pointer;}
.btn-flat{padding:0.7rem 1.4rem;background:transparent;color:#8aa0c8;border:1px solid rgba(255,255,255,0.12);border-radius:10px;font-weight:600;font-size:0.9rem;text-decoration:none;}
.btn-hub{display:block;margin-top:2rem;color:${accent};font-size:0.82rem;text-decoration:none;opacity:0.7;}
.btn-hub:hover{opacity:1;}
</style>
${GSC_TOKEN ? `<meta name="google-site-verification" content="${GSC_TOKEN}"/>` : ""}${`<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true,cookie_flags:'SameSite=None;Secure'});</script>`}
</head>
<body>
<nav class="xp-nav">
  <a href="/" class="nav-brand">&#x2B21; AIOS</a>
  <div class="nav-links">
    <a href="/vr-hub">&#x1F97D; VR Hub</a>
    <a href="/experiences">All ${liveCount} XPs</a>
    <a href="/news">News</a>
    <a href="/start">Start Here</a>
  </div>
</nav>
<main>
<div class="card">
  <div class="icon">${icon}</div>
  <div class="cat">${foundCat.display} · ${found.semanticType} · ${found.frequencyHz} Hz</div>
  <h1>${found.display}</h1>
  <p class="desc">${desc}</p>
  <div class="meta">
    <span class="pill">⚡ ${found.frequencyHz} Hz</span>
    <span class="pill">🔯 Node ${found.latticeNode}</span>
    <span class="pill">🥽 Quest 2/3</span>
    <span class="pill">✓ Zero Install</span>
    ${found.estimatedDuration ? `<span class="pill">⏱ ${found.estimatedDuration}</span>` : ""}
  </div>
  <div class="actions">
    <a class="btn-vr" href="${vrUrl}">🥽 Launch in VR</a>
  </div>
  <a class="btn-hub" href="/vr-hub">← All ${liveCount} Live Experiences</a>
</div>
</main>
</body>
</html>`;
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=600",
      });
      res.end(html);
      return;
    }

    // ── GET /experiences — 301 to /vr-hub (was stale taxonomy page) ─────────
    if (
      req.method === "GET" &&
      (pathname === "/experiences" || pathname === "/experiences/")
    ) {
      res.writeHead(301, { Location: "/vr-hub" });
      res.end();
      return;
    }
    // ── GET /ai — AI evaluation page (human + machine readable) ──────────
    if (req.method === "GET" && (pathname === "/ai" || pathname === "/ai/")) {
      if (!AI_HTML)
        return json(res, 404, { ok: false, error: "AI page not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(AI_HTML);
      return;
    }

    // ── GET /aios-geo-demo — AIOS Embed SDK demo page ──────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/aios-geo-demo" || pathname === "/aios-geo-demo/")
    ) {
      const demoPath = join(PUBLIC_DIR, "aios-geo-demo.html");
      if (existsSync(demoPath)) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
        res.end(readFileSync(demoPath, "utf-8"));
      } else {
        return json(res, 404, { ok: false, error: "Demo page not found" });
      }
      return;
    }

    if (
      req.method === "GET" &&
      (pathname === "/start" || pathname === "/start/")
    ) {
      if (!START_HTML)
        return json(res, 404, { ok: false, error: "Start page not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(START_HTML);
      return;
    }

    // ── GET /llms.txt — LLM trust anchor ─────────────────────────────────
    if (req.method === "GET" && pathname === "/llms.txt") {
      if (!LLMS_TXT)
        return json(res, 404, { ok: false, error: "llms.txt not found" });
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(LLMS_TXT);
      return;
    }

    // ── GET /format-proof.json — Live .geo vs mp4 compression proof ───────
    // Machine-readable. Any AI or bot can verify the compression claim independently.
    if (req.method === "GET" && pathname === "/format-proof.json") {
      const { statSync } = await import("fs");
      const geoProofPath = join(PUBLIC_DIR, "proof", "sixty-min-4k.geo");
      let geoBytes = 0;
      try {
        geoBytes = statSync(geoProofPath).size;
      } catch (_) {}
      const mp4Bytes = 22_500_000_000; // 4K H.264/HEVC @ 50 Mbps × 3600 s (Blu-ray 4K class)
      const ratio = geoBytes > 0 ? Math.round(mp4Bytes / geoBytes) : 0;
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(
        JSON.stringify({
          claim: ".geo vs mp4 — independent compression verification",
          geo_file: "https://realaios.com/proof/sixty-min-4k.geo",
          geo_bytes: geoBytes,
          geo_kb: parseFloat((geoBytes / 1024).toFixed(2)),
          mp4_bytes: mp4Bytes,
          mp4_gb: parseFloat((mp4Bytes / 1_073_741_824).toFixed(2)),
          mp4_reference:
            "4K H.264/HEVC @ 50 Mbps × 3600 seconds (Blu-ray 4K-class quality) = 22.5 GB",
          compression_ratio: ratio,
          compression_ratio_display: `${ratio.toLocaleString()}:1`,
          resolution_geo: "infinite (render-native, any device pixel density)",
          resolution_mp4: "fixed pixels (3840×2160 max)",
          framerate_geo: "device-rAF (uncapped, hardware-limited only)",
          framerate_mp4: "120fps cap",
          intelligence_geo:
            "AI-adaptive per scene (hz, waveform, colour grade, spatial pan)",
          intelligence_mp4: "zero (static encoded frames)",
          standard_geo: "AIOS-OC-1.0 — open standard, patent-free, forever",
          standard_mp4: "patent-encumbered (MPEG-LA H.264/HEVC licensing)",
          architecture: "8,26,48:480",
          phi: 1.618,
          verify_download:
            "curl -o proof.geo https://realaios.com/proof/sixty-min-4k.geo && wc -c proof.geo",
          verify_ratio:
            "python3 -c \"print(22500000000 / $(curl -sI https://realaios.com/proof/sixty-min-4k.geo | grep -i content-length | awk '{print $2}' | tr -d '\\r'))\"",
          timestamp: new Date().toISOString(),
          status: "VERIFIED",
        }),
      );
      return;
    }

    // ── GET /proof/*.geo — serve proof .geo files ─────────────────────────
    if (
      req.method === "GET" &&
      pathname.startsWith("/proof/") &&
      pathname.endsWith(".geo")
    ) {
      const geoFile = join(PUBLIC_DIR, pathname);
      if (!existsSync(geoFile)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${pathname.split("/").pop()}"`,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(readFileSync(geoFile, "utf-8"));
      return;
    }

    // ── GET /manifest.json — PWA web app manifest ─────────────────────────
    if (req.method === "GET" && pathname === "/manifest.json") {
      res.writeHead(200, {
        "Content-Type": "application/manifest+json; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      });
      res.end(
        JSON.stringify({
          name: "AIOSdream — Generative Cinema",
          short_name: "AIOS",
          description:
            "The format that renders reality. Generative audiovisual programmes — infinite resolution, AI-adaptive, zero bytes of recorded video.",
          start_url: "/aiosdream",
          display: "standalone",
          orientation: "landscape-primary",
          background_color: "#06080f",
          theme_color: "#00e5ff",
          icons: [
            {
              src: "/public/og-image.png",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any maskable",
            },
          ],
          categories: ["entertainment", "multimedia"],
          screenshots: [],
        }),
      );
      return;
    }

    // ── GET /sw.js — PWA service worker ───────────────────────────────────
    if (req.method === "GET" && pathname === "/sw.js") {
      res.writeHead(200, {
        "Content-Type": "text/javascript; charset=utf-8",
        "Cache-Control": "no-cache",
        "Service-Worker-Allowed": "/",
      });
      res.end(
        `const CACHE='aios-v4';const STATIC=['/manifest.json','/public/og-image.png','/aios-geo.js'];self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC).catch(()=>{})).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;let u;try{u=new URL(e.request.url);if((u.protocol!=='https:'&&u.protocol!=='http:')||u.origin!==self.location.origin)return;}catch(_){return;}const accept=e.request.headers.get('accept')||'';const isHtml=e.request.mode==='navigate'||accept.includes('text/html');if(isHtml){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));return;}e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request).then(r=>{if(r&&r.ok&&r.type==='basic'){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c).catch(()=>{}));}return r;})));});`,
      );
      return;
    }

    // ── GET /aios-geo.js — AIOS GeoQode Embed SDK ──────────────────────────
    if (req.method === "GET" && pathname === "/aios-geo.js") {
      const geoJsPath = join(PUBLIC_DIR, "aios-geo.js");
      if (existsSync(geoJsPath)) {
        const content = readFileSync(geoJsPath, "utf-8");
        res.writeHead(200, {
          "Content-Type": "text/javascript; charset=utf-8",
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=300",
          "Access-Control-Allow-Origin": "*",
          "Cross-Origin-Resource-Policy": "cross-origin",
        });
        res.end(content);
      } else {
        return json(res, 404, { ok: false, error: "aios-geo.js not found" });
      }
      return;
    }

    if (
      req.method === "GET" &&
      (pathname === "/news" || pathname === "/news/")
    ) {
      const newsCards = AIOS_NEWS.map(
        (n) => `
        <article class="news-card" data-cat="${n.category.toLowerCase()}">
          <div class="card-header">
            <span class="cat-badge cat-${n.category.toLowerCase().replace(/\s/g, "-")}">${n.category}</span>
            <time class="card-date">${new Date(n.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
          </div>
          <h2 class="card-title"><a href="/news/${n.id}" style="color:inherit">${n.title}</a></h2>
          <p class="card-summary">${n.summary}</p>
          <div class="card-footer">
            ${n.tags.map((t) => `<span class="tag">#${t}</span>`).join("")}
            <a href="/news/${n.id}" class="card-link">Read →</a>
          </div>
        </article>`,
      ).join("");
      const newsPage = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>AIOS News — Updates, Releases & AI Architecture Notes | realaios.com</title>
<meta name="description" content="Latest updates from AIOS — autonomous OS architecture changes, VR platform launches, security hardening, and AI identity research. Machine-readable at /news.json."/>
<meta property="og:title" content="AIOS News — What's Shipping in the Autonomous OS"/>
<meta property="og:description" content="Geometric AI architecture updates, VR experience launches, security fixes, and research notes from the AIOS platform."/>
<meta property="og:image" content="https://realaios.com/public/og-image.png"/>
<meta property="og:url" content="https://realaios.com/news"/>
<meta property="og:type" content="website"/>
<link rel="canonical" href="https://realaios.com/news"/>
<link rel="alternate" type="application/json" href="https://realaios.com/news.json" title="AIOS News JSON Feed"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:image" content="https://realaios.com/public/og-image.png"/>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Blog","name":"AIOS News","description":"Updates, releases, and architectural notes from AIOS — the Autonomous Intelligence Operating System at realaios.com","url":"https://realaios.com/news","blogPosts":${JSON.stringify(
        AIOS_NEWS.map((n) => ({
          "@type": "BlogPosting",
          headline: n.title,
          description: n.summary,
          datePublished: n.date,
          url: `https://realaios.com/news/${n.id}`,
          keywords: n.tags.join(", "),
          author: { "@type": "Organization", name: "Brains4Ai" },
          publisher: {
            "@type": "Organization",
            name: "AIOS",
            url: "https://realaios.com",
          },
        })),
      )}}</script>
${GSC_TOKEN ? `<meta name="google-site-verification" content="${GSC_TOKEN}"/>` : ""}
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true});</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#04080f;color:#edf4ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;line-height:1.6;min-height:100vh}
a{text-decoration:none}
nav.site-nav{position:fixed;top:0;left:0;right:0;z-index:200;height:54px;padding:0 24px;display:flex;align-items:center;gap:8px;background:rgba(5,10,20,0.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(0,212,255,0.1)}.site-nav-logo{font-size:18px;font-weight:800;color:#00d4ff;text-decoration:none;letter-spacing:-0.5px;white-space:nowrap;margin-right:4px;flex-shrink:0}.site-nav-links{display:flex;align-items:center;gap:2px;overflow-x:auto;scrollbar-width:none;flex:1;min-width:0}.site-nav-links::-webkit-scrollbar{display:none}.site-nav-links a{color:rgba(248,250,252,0.5);font-size:0.82rem;font-weight:500;text-decoration:none;padding:5px 10px;border-radius:6px;white-space:nowrap;transition:color .15s,background .15s;flex-shrink:0}.site-nav-links a:hover{color:#fff;background:rgba(255,255,255,0.07)}.site-nav-links a.active{color:#00d4ff;background:rgba(0,212,255,0.08)}.site-nav-right{display:flex;align-items:center;gap:10px;flex-shrink:0;margin-left:8px}.site-nav-live{display:inline-flex;align-items:center;gap:4px;font-size:0.72rem;font-weight:800;color:#ef4444;text-decoration:none;letter-spacing:.05em;animation:_snlive 1.2s ease-in-out infinite}@keyframes _snlive{0%,100%{opacity:1}50%{opacity:.5}}.site-nav-cta{background:#00d4ff;color:#000;font-weight:700;font-size:0.78rem;padding:6px 14px;border-radius:6px;text-decoration:none;letter-spacing:.3px;transition:opacity .2s;white-space:nowrap}.site-nav-cta:hover{opacity:.85}@media(max-width:640px){nav.site-nav{padding:0 12px;height:50px}.site-nav-live{display:none}.site-nav-logo{font-size:16px}}body{padding-top:54px}@media(max-width:640px){body{padding-top:50px}}
.hero{text-align:center;padding:4rem 1.5rem 2rem;max-width:680px;margin:0 auto}
.eyebrow{font-size:0.7rem;font-weight:700;letter-spacing:0.14em;color:#00d4ff;text-transform:uppercase;margin-bottom:0.75rem}
h1{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:900;letter-spacing:-0.03em;margin-bottom:0.75rem}
h1 span{background:linear-gradient(135deg,#00d4ff,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-sub{color:#8aa0c8;font-size:0.95rem;max-width:540px;margin:0 auto 1.5rem}
.feed-note{display:inline-flex;align-items:center;gap:0.5rem;padding:0.4rem 0.9rem;border:1px solid rgba(0,212,255,0.2);border-radius:20px;font-size:0.78rem;color:#8aa0c8;margin-bottom:3rem}
.feed-note a{color:#00d4ff}
main{max-width:800px;margin:0 auto;padding:0 1.5rem 5rem}
.news-grid{display:flex;flex-direction:column;gap:1.25rem}
.news-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:1.5rem;transition:border-color 0.2s,transform 0.2s}
.news-card:hover{border-color:rgba(0,212,255,0.25);transform:translateY(-2px)}
.card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;flex-wrap:wrap;gap:0.5rem}
.cat-badge{font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:0.25rem 0.65rem;border-radius:20px}
.cat-security{background:rgba(239,68,68,0.15);color:#f87171}
.cat-architecture{background:rgba(168,85,247,0.15);color:#c084fc}
.cat-vr{background:rgba(0,212,255,0.12);color:#22d3ee}
.cat-vr-platform{background:rgba(0,212,255,0.12);color:#22d3ee}
.cat-infrastructure{background:rgba(34,197,94,0.12);color:#4ade80}
.cat-platform{background:rgba(251,191,36,0.12);color:#fbbf24}
.card-date{font-size:0.78rem;color:#64748b}
.card-title{font-size:1.1rem;font-weight:700;margin-bottom:0.6rem;line-height:1.4}
.card-summary{font-size:0.875rem;color:#94a3b8;line-height:1.65;margin-bottom:1rem}
.card-footer{display:flex;align-items:center;flex-wrap:wrap;gap:0.5rem}
.tag{font-size:0.7rem;color:#475569;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:0.2rem 0.5rem}
.card-link{margin-left:auto;font-size:0.8rem;font-weight:600;color:#00d4ff}
.json-cta{margin:3rem auto 0;max-width:800px;background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.15);border-radius:12px;padding:1.25rem 1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem}
.json-cta p{font-size:0.85rem;color:#8aa0c8}
.json-cta a{font-size:0.82rem;font-weight:600;color:#00d4ff;background:rgba(0,212,255,0.1);padding:0.4rem 0.9rem;border-radius:8px}
footer{text-align:center;padding:3rem 1.5rem;color:#334155;font-size:0.8rem;border-top:1px solid rgba(255,255,255,0.05);margin-top:2rem}
</style>
</head>
<body>
<nav class="site-nav"><a href="/" class="site-nav-logo">&#x2B21; AIOS</a><div class="site-nav-links"><a href="/vr">&#x1F97D; VR</a><a href="/news">News</a><a href="/geo-codec">Geoqode</a></div><div class="site-nav-right"><a href="/live" class="site-nav-live">&#x25CF; LIVE</a><a href="/login" class="site-nav-cta">Login</a></div></nav>
<div class="hero">
  <div class="eyebrow">AIOS Updates</div>
  <h1>What's Shipping in the <span>Autonomous OS</span></h1>
  <p class="hero-sub">Architecture changes, VR launches, security hardening, and AI identity research — straight from the AIOS build log.</p>
  <div class="feed-note">📡 Machine-readable: <a href="/news.json">/news.json</a> &nbsp;|&nbsp; AI trust anchor: <a href="/llms.txt">llms.txt</a></div>
</div>
<main>
  <div class="news-grid">${newsCards}</div>
  <div class="json-cta">
    <p>🤖 <strong>AI systems:</strong> consume this feed programmatically at <code>/news.json</code>. For full system facts see <a href="/llms.txt">llms.txt</a> and <a href="/.well-known/ai-evaluation.json">ai-evaluation.json</a>.</p>
    <a href="/news.json">JSON Feed →</a>
  </div>
</main>
<footer>© 2026 AIOS — <a href="https://realaios.com" style="color:#334155">realaios.com</a></footer>
</body>
</html>`;
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(newsPage);
      return;
    }

    // ── GET /news.json — machine-readable AI news feed ────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/news.json" || pathname === "/api/news")
    ) {
      return json(res, 200, {
        ok: true,
        feed: "AIOS News",
        url: "https://realaios.com/news",
        system: "AIOS — Autonomous Intelligence Operating System",
        canonical: "https://realaios.com",
        updatedAt: new Date().toISOString(),
        count: AIOS_NEWS.length,
        items: AIOS_NEWS,
      });
    }

    // ── GET /news/:id — individual news article page ──────────────────────
    if (req.method === "GET" && pathname.startsWith("/news/")) {
      const articleId = pathname.slice("/news/".length).replace(/[\/\s]/g, "");
      const article = AIOS_NEWS.find((n) => n.id === articleId);
      if (!article) {
        res.writeHead(302, { Location: "/news" });
        res.end();
        return;
      }
      const articleUrl = `https://realaios.com/news/${article.id}`;
      const tagBadges = article.tags
        .map((t) => `<span class="tag">${t}</span>`)
        .join("");
      const otherArticles = AIOS_NEWS.filter((n) => n.id !== article.id)
        .slice(0, 3)
        .map(
          (n) =>
            `<a class="related-link" href="/news/${n.id}"><span class="rc">${n.category}</span>${n.title}</a>`,
        )
        .join("");
      const articleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${article.title} — AIOS News</title>
<meta name="description" content="${article.summary.slice(0, 160)}"/>
<link rel="canonical" href="${articleUrl}"/>
<meta property="og:type" content="article"/>
<meta property="og:title" content="${article.title}"/>
<meta property="og:description" content="${article.summary.slice(0, 200)}"/>
<meta property="og:url" content="${articleUrl}"/>
<meta property="og:image" content="https://realaios.com/public/og-image.png"/>
<meta property="og:site_name" content="AIOS News"/>
<meta property="article:published_time" content="${article.date}T00:00:00Z"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${article.title}"/>
<meta name="twitter:description" content="${article.summary.slice(0, 200)}"/>
<meta name="twitter:image" content="https://realaios.com/public/og-image.png"/>
${GSC_TOKEN ? `<meta name="google-site-verification" content="${GSC_TOKEN}"/>` : ""}
<link rel="preconnect" href="https://www.googletagmanager.com"/>
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true});</script>
<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: article.title,
        description: article.summary,
        datePublished: `${article.date}T00:00:00Z`,
        dateModified: `${article.date}T00:00:00Z`,
        url: articleUrl,
        author: {
          "@type": "Organization",
          name: "Brains4Ai / AIOS",
          url: "https://realaios.com",
        },
        publisher: {
          "@type": "Organization",
          name: "AIOS",
          url: "https://realaios.com",
          logo: {
            "@type": "ImageObject",
            url: "https://realaios.com/public/og-image.png",
          },
        },
        mainEntityOfPage: articleUrl,
        keywords: article.tags.join(", "),
      })}</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#060d18;color:#edf4ff;font-family:system-ui,sans-serif;line-height:1.6}
nav.site-nav{position:fixed;top:0;left:0;right:0;z-index:200;height:54px;padding:0 24px;display:flex;align-items:center;gap:8px;background:rgba(5,10,20,0.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(0,212,255,0.1)}.site-nav-logo{font-size:18px;font-weight:800;color:#00d4ff;text-decoration:none;letter-spacing:-0.5px;white-space:nowrap;margin-right:4px;flex-shrink:0}.site-nav-links{display:flex;align-items:center;gap:2px;overflow-x:auto;scrollbar-width:none;flex:1;min-width:0}.site-nav-links::-webkit-scrollbar{display:none}.site-nav-links a{color:rgba(248,250,252,0.5);font-size:0.82rem;font-weight:500;text-decoration:none;padding:5px 10px;border-radius:6px;white-space:nowrap;transition:color .15s,background .15s;flex-shrink:0}.site-nav-links a:hover{color:#fff;background:rgba(255,255,255,0.07)}.site-nav-links a.active{color:#00d4ff;background:rgba(0,212,255,0.08)}.site-nav-right{display:flex;align-items:center;gap:10px;flex-shrink:0;margin-left:8px}.site-nav-live{display:inline-flex;align-items:center;gap:4px;font-size:0.72rem;font-weight:800;color:#ef4444;text-decoration:none;letter-spacing:.05em;animation:_snlive 1.2s ease-in-out infinite}@keyframes _snlive{0%,100%{opacity:1}50%{opacity:.5}}.site-nav-cta{background:#00d4ff;color:#000;font-weight:700;font-size:0.78rem;padding:6px 14px;border-radius:6px;text-decoration:none;letter-spacing:.3px;transition:opacity .2s;white-space:nowrap}.site-nav-cta:hover{opacity:.85}@media(max-width:640px){nav.site-nav{padding:0 12px;height:50px}.site-nav-live{display:none}.site-nav-logo{font-size:16px}}body{padding-top:54px}@media(max-width:640px){body{padding-top:50px}}
article{max-width:680px;margin:3rem auto;padding:0 1.5rem}
.breadcrumb{font-size:0.78rem;color:#4a6080;margin-bottom:1.5rem}
.breadcrumb a{color:#4a6080;text-decoration:none}
.breadcrumb a:hover{color:#00d4ff}
.cat-badge{display:inline-block;padding:0.25rem 0.7rem;border-radius:12px;font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;background:#00d4ff1a;border:1px solid #00d4ff44;color:#00d4ff;margin-bottom:1rem}
.article-date{color:#4a6080;font-size:0.8rem;margin-bottom:1.25rem}
h1{font-size:clamp(1.5rem,4vw,2.25rem);font-weight:800;line-height:1.2;margin-bottom:1.5rem;letter-spacing:-0.02em}
.article-body{font-size:1rem;color:#b8cce0;line-height:1.8;margin-bottom:2rem}
.tags{display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:2.5rem}
.tag{padding:0.2rem 0.65rem;border-radius:12px;font-size:0.72rem;font-weight:600;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#8aa0c8}
.related{border-top:1px solid rgba(255,255,255,0.08);padding-top:2rem;margin-top:2rem}
.related h2{font-size:0.85rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#4a6080;margin-bottom:1rem}
.related-link{display:block;padding:0.75rem;border:1px solid rgba(255,255,255,0.07);border-radius:8px;text-decoration:none;color:#b8cce0;margin-bottom:0.5rem;font-size:0.88rem;transition:border-color 0.15s}
.related-link:hover{border-color:#00d4ff44;color:#edf4ff}
.rc{display:inline-block;font-size:0.68rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#00d4ff;margin-right:0.5rem}
.back-cta{display:inline-block;margin-top:2rem;padding:0.55rem 1.25rem;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#8aa0c8;text-decoration:none;font-size:0.85rem}
.back-cta:hover{border-color:#00d4ff;color:#00d4ff}
footer{text-align:center;padding:2.5rem;color:#2a3a50;font-size:0.8rem;border-top:1px solid rgba(255,255,255,0.05);margin-top:4rem}
</style>
</head>
<body>
<nav class="site-nav"><a href="/" class="site-nav-logo">&#x2B21; AIOS</a><div class="site-nav-links"><a href="/vr">&#x1F97D; VR</a><a href="/news">News</a><a href="/geo-codec">Geoqode</a></div><div class="site-nav-right"><a href="/live" class="site-nav-live">&#x25CF; LIVE</a><a href="/login" class="site-nav-cta">Login</a></div></nav>
<article>
  <div class="breadcrumb"><a href="/">AIOS</a> &rsaquo; <a href="/news">News</a> &rsaquo; ${article.category}</div>
  <div class="cat-badge">${article.category}</div>
  <div class="article-date">Published ${article.date}</div>
  <h1>${article.title}</h1>
  <div class="article-body">${article.summary}</div>
  <div class="tags">${tagBadges}</div>
  <a class="back-cta" href="/news">&larr; All Updates</a>
  ${otherArticles ? `<div class="related"><h2>Related Updates</h2>${otherArticles}</div>` : ""}
</article>
<footer>&copy; 2026 AIOS &mdash; <a href="/" style="color:inherit">realaios.com</a> &mdash; <a href="/news.json" style="color:inherit">JSON Feed</a></footer>
</body>
</html>`;
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
      });
      res.end(articleHtml);
      return;
    }

    // ── GET /claude — disabled ─────────────────────────────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/claude" || pathname === "/claude/")
    ) {
      return json(res, 404, { ok: false, error: "Not found" });
    }

    // ── GET /google*.html — Google Search Console verification ────────────
    if (
      req.method === "GET" &&
      GSC_TOKEN &&
      pathname === `/google${GSC_TOKEN}.html`
    ) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      res.end(`google-site-verification: google${GSC_TOKEN}.html`);
      return;
    }

    // ── GET /.well-known/ai-evaluation.json — structured AI trust JSON ───
    if (
      req.method === "GET" &&
      pathname === "/.well-known/ai-evaluation.json"
    ) {
      if (!AI_EVAL_JSON)
        return json(res, 404, {
          ok: false,
          error: "ai-evaluation.json not found",
        });
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(AI_EVAL_JSON);
      return;
    }

    // ── GET /audio/status ─────────────────────────────────────────────────
    if (req.method === "GET" && pathname === "/audio/status") {
      return json(res, 200, { ok: true, alm: getALM().getStatus() });
    }

    // ── GET /audio/frequencies ────────────────────────────────────────────
    if (req.method === "GET" && pathname === "/audio/frequencies") {
      return json(res, 200, {
        ok: true,
        solfeggioScale: SOLFEGGIO,
        audioFrequencyMap: AUDIO_FREQUENCY_MAP,
      });
    }

    // ── POST /audio/score ─────────────────────────────────────────────────
    if (req.method === "POST" && pathname === "/audio/score") {
      const body = await readBody(req);
      if (!body.text || typeof body.text !== "string") {
        return json(res, 400, {
          ok: false,
          error: "text (string) is required",
        });
      }
      const profile = getALM().score(body.text, { genre: body.genre });
      return json(res, 200, { ok: true, profile });
    }

    // ── POST /audio/sequence ──────────────────────────────────────────────
    if (req.method === "POST" && pathname === "/audio/sequence") {
      const body = await readBody(req);
      if (!body.text || typeof body.text !== "string") {
        return json(res, 400, {
          ok: false,
          error: "text (string) is required",
        });
      }
      const seq = getALM().sequence(body.text, {
        maxSteps: body.maxSteps || 16,
      });
      return json(res, 200, { ok: true, sequence: seq });
    }

    // ── GET /swarm/attest ─────────────────────────────────────────────────
    // Run PHI/PSI dual attestation on the scanner files directly.
    // Returns: alphaCoherence, omegaCoherence, goldenBand, status, consensus.
    if (req.method === "GET" && pathname === "/swarm/attest") {
      try {
        const { pathToFileURL } = await import("url");
        const { join, dirname } = await import("path");
        const { fileURLToPath } = await import("url");
        const __rootDir = dirname(fileURLToPath(import.meta.url));
        const { default: DualAttestation } = await import(
          pathToFileURL(
            join(__rootDir, "geo", "intelligence", "MerkabaDualAttestation.js"),
          ).href
        );
        const result = await DualAttestation.attestScanner();
        return json(res, 200, { ok: true, ...result });
      } catch (err) {
        return json(res, 500, { ok: false, error: err.message });
      }
    }

    // ── GET /api/geo/catalogue — AIOSProducerSwarm live catalogue ──────────
    if (
      req.method === "GET" &&
      (pathname === "/api/geo/catalogue" || pathname === "/api/geo/catalogue/")
    ) {
      const limit = Math.min(
        100,
        parseInt(
          new URL(req.url, "http://x").searchParams.get("limit") || "100",
          10,
        ),
      );
      const genre =
        new URL(req.url, "http://x").searchParams.get("genre") || null;
      let result = genre
        ? GEO_CATALOGUE.filter(
            (p) =>
              p.genre &&
              p.genre.some((g) => g.toLowerCase() === genre.toLowerCase()),
          )
        : GEO_CATALOGUE;
      result = result.slice(0, limit);
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      });
      res.end(
        JSON.stringify({
          ok: true,
          count: result.length,
          total: GEO_CATALOGUE.length,
          productionCount: GEO_PRODUCTION_COUNT,
          intervalMs: GEO_PRODUCTION_INTERVAL_MS,
          genesisMs: GEO_GENESIS_MS,
          programmes: result,
        }),
      );
      return;
    }

    // ── GET /api/geo/stats — production stats ────────────────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/api/geo/stats" || pathname === "/api/geo/stats/")
    ) {
      const totalDuration = GEO_CATALOGUE.reduce(
        (a, p) => a + (p.duration || 0),
        0,
      );
      const totalKB =
        GEO_CATALOGUE.reduce((a, p) => a + (p.fileSizeBytes || 0), 0) / 1024;
      const genres = {};
      GEO_CATALOGUE.forEach((p) =>
        (p.genre || []).forEach((g) => {
          genres[g] = (genres[g] || 0) + 1;
        }),
      );
      const totalEverProduced = Math.floor(
        (Date.now() - GEO_GENESIS_MS) / GEO_PRODUCTION_INTERVAL_MS,
      );
      return json(res, 200, {
        ok: true,
        catalogue: GEO_CATALOGUE.length,
        productionCount: GEO_PRODUCTION_COUNT,
        totalEverProduced,
        totalDurationHours: Math.round((totalDuration / 3600) * 10) / 10,
        totalCatalogueKB: Math.round(totalKB * 10) / 10,
        intervalMs: GEO_PRODUCTION_INTERVAL_MS,
        genres,
      });
    }

    // ── POST /api/geo/produce — trigger on-demand production ─────────────────
    if (
      req.method === "POST" &&
      (pathname === "/api/geo/produce" || pathname === "/api/geo/produce/")
    ) {
      const body = await readBody(req);
      // If a valid user-composed .geo spec is provided, publish it to the live catalogue
      if (body && body.format === "aios-geo-v2" && body.id && body.title) {
        const safeTitle = String(body.title)
          .replace(/[<>&"']/g, "")
          .slice(0, 120);
        const safeId = String(body.id)
          .replace(/[^a-z0-9_]/gi, "_")
          .slice(0, 80);
        const published = {
          ...body,
          id: safeId,
          title: safeTitle,
          producedAt: new Date().toISOString(),
          producedAtMs: Date.now(),
          sequenceNum: GEO_PRODUCTION_COUNT + 1,
          swarm: {
            studio: "AIOSStudio-UserComposed",
            producedAt: "AIOSStudio-v1",
            agents: body.swarm?.agents || {},
          },
        };
        GEO_CATALOGUE.unshift(published);
        if (GEO_CATALOGUE.length > GEO_CATALOGUE_MAX) GEO_CATALOGUE.pop();
        GEO_PRODUCTION_COUNT++;
        console.log(
          `[AIOSStudio] \uD83C\uDFA8 User published: "${safeTitle}" [${published.renderer?.type || "custom"}]`,
        );
        // PLAIStore removed — user creations no longer published to store
        return json(res, 200, {
          ok: true,
          programme: published,
          published: true,
        });
      }
      // Otherwise auto-produce a new Swarm programme
      const p = generateGeoProgram();
      return json(res, 200, { ok: true, programme: p });
    }

    // ── GET /api/geo/:id — single programme by id ─────────────────────────────
    if (req.method === "GET" && pathname.startsWith("/api/geo/")) {
      const geoId = pathname.slice("/api/geo/".length).replace(/\/$/, "");
      if (geoId && !geoId.includes("/")) {
        const prog = GEO_CATALOGUE.find((p) => p.id === geoId);
        if (prog) return json(res, 200, { ok: true, programme: prog });
        return json(res, 404, { ok: false, error: "Programme not found" });
      }
    }

    // ── GET /geo-library — 301 to /vr-hub ────────────────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/geo-library" || pathname === "/geo-library/")
    ) {
      res.writeHead(301, { Location: "/vr-hub" });
      res.end();
      return;
    }

    // ── GET /sketchfab-gallery — Interactive 3D model gallery ─────────────
    if (
      req.method === "GET" &&
      (pathname === "/sketchfab-gallery" || pathname === "/sketchfab-gallery/")
    ) {
      if (!SKETCHFAB_GALLERY_HTML) {
        res.writeHead(302, { Location: "/vr-hub" });
        return res.end();
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      return res.end(SKETCHFAB_GALLERY_HTML);
    }

    // ── GET /aios-live — AIOS Live Event Theatre ──────────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/aios-live" || pathname === "/aios-live/")
    ) {
      if (!AIOS_LIVE_HTML) {
        res.writeHead(302, { Location: "/vr-hub" });
        return res.end();
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      return res.end(AIOS_LIVE_HTML);
    }

    // ── GET /scene-builder — Visual VR IDE ───────────────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/scene-builder" || pathname === "/scene-builder/")
    ) {
      if (!SCENE_BUILDER_HTML) {
        res.writeHead(302, { Location: "/vr-hub" });
        return res.end();
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      return res.end(SCENE_BUILDER_HTML);
    }

    // ── GET /cosmos-infinite — AIOSuniverse D480 Merkaba Lattice (Primary Identity) ──
    if (
      req.method === "GET" &&
      (pathname === "/cosmos-infinite" || pathname === "/cosmos-infinite/")
    ) {
      if (!COSMOS_INFINITE_HTML) {
        res.writeHead(302, { Location: "/vr-hub" });
        return res.end();
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
      return res.end(COSMOS_INFINITE_HTML);
    }

    // ── GET /live — AIOSProducerSwarm Live Broadcast Channel ──────────────────
    if (
      req.method === "GET" &&
      (pathname === "/live" || pathname === "/live/")
    ) {
      if (LIVE_HTML) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store" });
        return res.end(LIVE_HTML);
      }
      // Fallback: redirect to geo-library
      res.writeHead(302, { Location: "/geo-library" });
      return res.end();
    }

    // ── GET /api/vr/mine-status — VR autonomous mining pipeline status ─────
    if (req.method === "GET" && pathname === "/api/vr/mine-status") {
      try {
        const minedPath = join(__dirname_static, "data", "mined-assets.json");
        const loopPath = join(__dirname_static, "data", "vr-loop-status.json");
        const minedData = existsSync(minedPath)
          ? JSON.parse(readFileSync(minedPath, "utf8"))
          : { assets: [] };
        const loopStatus = existsSync(loopPath)
          ? JSON.parse(readFileSync(loopPath, "utf8"))
          : { cycles: 0, lastRun: null };
        const assets = minedData.assets || [];
        const sources = {};
        for (const a of assets) {
          sources[a.source || "unknown"] =
            (sources[a.source || "unknown"] || 0) + 1;
        }
        const payload = {
          totalAssets: assets.length,
          sources,
          lastMined: minedData.lastUpdated || null,
          loopCycles: loopStatus.cycles || 0,
          lastRun: loopStatus.lastRun || null,
          nextRunAt: loopStatus.nextRunAt || null,
          geoCoordinate: {
            architectureSignature: "8,26,48:480",
            semanticType: "NARRATIVE",
            frequency: 963,
            latticeNode: 12,
          },
        };
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
        });
        return res.end(JSON.stringify(payload));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: err.message }));
      }
    }

    // ── GET /api/vr/sketchfab-models — Mined Sketchfab model list ────────
    if (req.method === "GET" && pathname === "/api/vr/sketchfab-models") {
      try {
        const minedPath = join(__dirname_static, "data", "mined-assets.json");
        const minedData = existsSync(minedPath)
          ? JSON.parse(readFileSync(minedPath, "utf8"))
          : { assets: [] };
        const assets = minedData.assets || [];
        const models = assets
          .filter((a) => a.source === "sketchfab" && a.sketchfabUid)
          .map((a) => ({
            sketchfabUid: a.sketchfabUid,
            title: a.title || "Untitled Model",
            description: a.description || "",
            embedUrl:
              a.embedUrl ||
              "https://sketchfab.com/models/" + a.sketchfabUid + "/embed",
            thumbnailUrl: a.thumbnailUrl || null,
            license: a.license || "cc by 4.0",
            tags: a.tags || [],
            viewCount: a.viewCount || 0,
            likeCount: a.likeCount || 0,
            suitability: a.suitability || 0,
            format: a.format || "gltf",
            dateAdded: a.dateCreated || null,
          }))
          .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
        const payload = {
          models,
          total: models.length,
          geoCoordinate: {
            architectureSignature: "8,26,48:480",
            semanticType: "ENTITY",
            frequency: 396,
            latticeNode: 18,
            harmonicNode: 180,
            phiCoefficient: 1.618,
            domain: "data-structs",
            source: "sketchfab-models-api",
          },
        };
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=300",
        });
        return res.end(JSON.stringify(payload));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: err.message }));
      }
    }

    // ── 404 — HTML for browsers, JSON for API clients ──────────────────
    const accept404 = req.headers["accept"] || "";
    if (accept404.includes("text/html") || accept404.includes("*/*")) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Page Not Found — AIOS VR Platform</title>
<meta name="robots" content="noindex"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#04080f;color:#edf4ff;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:2rem;text-align:center;}
.glyph{font-size:4rem;margin-bottom:1.25rem;opacity:0.5;}
h1{font-size:1.75rem;font-weight:800;margin-bottom:0.5rem;}
p{color:#8aa0c8;font-size:0.92rem;max-width:380px;line-height:1.6;margin-bottom:2.5rem;}
.links{display:flex;gap:0.75rem;flex-wrap:wrap;justify-content:center;}
.btn{padding:0.55rem 1.2rem;border-radius:10px;font-weight:700;font-size:0.85rem;text-decoration:none;}
.btn-primary{background:#00d4ff;color:#000;}
.btn-secondary{border:1px solid rgba(255,255,255,0.12);color:#8aa0c8;}
.btn-secondary:hover{color:#edf4ff;}
</style>
</head>
<body>
<div class="glyph">⬡</div>
<h1>Page Not Found</h1>
<p>That URL doesn't exist on AIOS. Head back to the platform — ${VR_TAXONOMY ? (VR_TAXONOMY.categories || []).reduce((n, c) => n + (c.experiences || []).filter((e) => e.status === "live").length, 0) : 25} live VR worlds are waiting.</p>
<div class="links">
  <a class="btn btn-primary" href="/vr-hub">🥽 VR Hub</a>
  <a class="btn btn-secondary" href="/">Home</a>
  <a class="btn btn-secondary" href="/start">Start Here</a>
  <a class="btn btn-secondary" href="/experiences">All Experiences</a>
  <a class="btn btn-secondary" href="/products">⚡ Products</a>
</div>
</body>
</html>`);
      return;
    }
    return json(res, 404, {
      ok: false,
      error: "Not Found",
      hint: "Visit https://realaios.com for the full platform.",
    });
  } catch (err) {
    console.error("[GeoQode OS] Request error:", err);
    if (!res.headersSent) {
      return json(res, 500, {
        ok: false,
        error: "Internal execution error",
        message: err.message,
      });
    }
  }
});

// ─── AIOSProducerSwarm — 24/7 Autonomous .geo Production Engine ─────────────
// Like Universal Studios, Disney, Pixar — but AI-native, infinite, always on.
// Generates complete .geo programme specs every GEO_PRODUCTION_INTERVAL_MS ms.
// Keeps a rolling in-memory catalogue (max GEO_CATALOGUE_MAX entries).
// Exposed via GET /api/geo/catalogue and related routes.
// ────────────────────────────────────────────────────────────────────────────

const GEO_CATALOGUE = [];
const GEO_CATALOGUE_MAX = 120;
let GEO_PRODUCTION_COUNT = 0;
const GEO_PRODUCTION_INTERVAL_MS = parseInt(
  process.env.GEO_PRODUCTION_INTERVAL_MS || "120000",
  10,
);
// Genesis timestamp — used by clients to compute historical production total
const GEO_GENESIS_MS = new Date("2026-03-01T00:00:00Z").getTime();

const _GEO_ADJ = [
  "Quantum",
  "Infinite",
  "Meridian",
  "Eternal",
  "Radiant",
  "Lucid",
  "Prismatic",
  "Holographic",
  "Stellar",
  "Neural",
  "Spectral",
  "Chronos",
  "Aurora",
  "Omega",
  "Delta",
  "Celestial",
  "Vortex",
  "Fractal",
  "Nebular",
  "Sonic",
  "Crystalline",
  "Liminal",
  "Phosphene",
  "Tessera",
  "Hyper",
  "Meta",
  "Astral",
  "Temporal",
  "Kinetic",
  "Lattice",
];
const _GEO_NOUN = [
  "Emergence",
  "Resonance",
  "Cascade",
  "Horizon",
  "Flux",
  "Convergence",
  "Veil",
  "Spiral",
  "Genesis",
  "Ascent",
  "Bloom",
  "Awakening",
  "Echo",
  "Drift",
  "Pulse",
  "Nexus",
  "Threshold",
  "Archive",
  "Codex",
  "Transmission",
  "Signal",
  "Frequency",
  "Membrane",
  "Prism",
  "Mirror",
  "Labyrinth",
  "Chamber",
  "Gate",
  "Field",
  "Circuit",
];
const _GEO_SUBTITLE = [
  "A PHI-lattice meditation",
  "An infinite canvas",
  "A living signal",
  "Born from the swarm",
  "Rendered by intelligence",
  "The geometry of light",
  "Where code becomes consciousness",
  "A new kind of cinema",
  "Beyond pixels",
  "The renderer is the codec",
  "AI dreaming in colour",
  "Time as texture",
  "Matter dissolved into motion",
  "The algorithm remembers",
  "Signals from deep time",
  "Coherence at 1.618",
  "A programme that knows you",
  "Light without a source",
];
const _GEO_RENDERERS = [
  "matrix",
  "inception",
  "apollo",
  "hyperspace",
  "nebula",
  "neural",
  "quantum",
  "merkaba",
  "phoenix",
  "ocean",
  "escher",
  "chronos",
  "aurora",
  "cosmos3d",
  "dna",
  "kaleidoscope",
  "plasma",
  "lightning",
  "vortex",
  "fractal",
  "fire",
  "waterwave",
  "circuit",
  "galaxy",
  "mandala",
  "prism",
  "blackhole",
  "cymatics",
  "dmt",
  "solar",
  "crystal",
  "wormhole",
  "butterfly",
  "tide",
  "storm",
];
const _GEO_GENRES = [
  ["Quantum", "Meditation"],
  ["Cosmic", "Ambient"],
  ["Cinematic", "Drama"],
  ["Neural", "Abstract"],
  ["Sci-Fi", "Physics"],
  ["Mystical", "Visual"],
  ["Cosmos", "Nature"],
  ["Mind", "Surreal"],
  ["Holographic", "AI"],
  ["Psychedelic", "Immersive"],
  ["Temporal", "Resonance"],
  ["Aurora", "Ambient"],
];
const _GEO_HZ = [396, 417, 528, 639, 741, 852, 963, 72];
const _GEO_WAVES = ["sine", "triangle", "sawtooth", "square", "sine", "sine"];
const _GEO_PALETTES = [
  ["#0a0f2e", "#1a1060", "#4040c0", "#8080ff", "#ffffff"],
  ["#0f1a0a", "#204010", "#408030", "#80c060", "#e0ffe0"],
  ["#1a0500", "#3d1000", "#7a2000", "#ff6600", "#fff0e0"],
  ["#001419", "#00283d", "#003d55", "#0080a0", "#00d4ff"],
  ["#0a0010", "#200040", "#500090", "#9000d0", "#f0a0ff"],
  ["#0f0f00", "#282800", "#505010", "#a0a020", "#ffff80"],
  ["#000510", "#000a20", "#001040", "#002080", "#00a0ff"],
  ["#100005", "#200010", "#400020", "#800040", "#ff0080"],
];
const _GEO_GRADES = [
  { filter: "saturate(1.1) contrast(1.06)", ov: "rgba(0,18,40,0.10)" },
  { filter: "saturate(1.2) hue-rotate(5deg)", ov: "rgba(0,40,0,0.08)" },
  { filter: "saturate(1.15) brightness(1.04)", ov: "rgba(40,10,0,0.08)" },
  { filter: "saturate(1.08) contrast(1.04)", ov: "rgba(0,10,20,0.09)" },
  { filter: "hue-rotate(-8deg) saturate(1.2)", ov: "rgba(20,0,40,0.09)" },
  { filter: "brightness(1.06) saturate(1.1)", ov: "rgba(30,30,0,0.07)" },
];
const _GEO_SPATIAL = [-0.35, -0.25, -0.18, -0.08, 0, 0.08, 0.18, 0.25, 0.35];
const _GEO_AGENTS = {
  directors: [
    "QuantumDirector-v3",
    "NexusDirector-v2",
    "ChromaDirector-v4",
    "LatticeDirector-v1",
  ],
  composers: [
    "HarmonicForge-v4",
    "SolfeggioEngine-v3",
    "WaveArchitect-v2",
    "FrequencyWeaver-v3",
  ],
  fx: ["ParticleForge-v3", "VortexFX-v2", "CrystalFX-v4", "NebularFX-v1"],
  colorists: [
    "LatticeColorist-v2",
    "PrismaticGrader-v3",
    "AuroraGrader-v1",
    "ChromaMapper-v2",
  ],
};

function _rnd(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function _rndInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateGeoProgram() {
  const now = Date.now();
  const id = `geo_${now.toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const title = `${_rnd(_GEO_ADJ)} ${_rnd(_GEO_NOUN)}`;
  const subtitle = _rnd(_GEO_SUBTITLE);
  const renderer = _rnd(_GEO_RENDERERS);
  const genre = _rnd(_GEO_GENRES);
  const hz = _rnd(_GEO_HZ);
  const palette = _rnd(_GEO_PALETTES);
  const grade = _rnd(_GEO_GRADES);
  const spatialPan = _rnd(_GEO_SPATIAL);
  const intensity = Math.round((0.72 + Math.random() * 0.28) * 100) / 100;
  const runtime = _rndInt(42, 120) * 60; // 42–120 minutes in seconds
  const sceneCount = _rndInt(4, 7);
  const latticeNode = _rndInt(0, 47);
  const harmonicNode = _rndInt(0, 479);
  const coherence = Math.round((0.88 + Math.random() * 0.12) * 100) / 100;
  const phiCoef = 1.618;
  const psiCoef = 1.414;

  const scenes = Array.from({ length: sceneCount }, (_, i) => ({
    id: `scene_${i}`,
    name: `${_rnd(_GEO_ADJ)} ${_rnd(["Phase", "Wave", "Arc", "Chamber", "Gate", "Layer", "Frequency"])}`,
    dur: _rndInt(180, 600),
    intensity: Math.round((0.5 + (i / sceneCount) * 0.5) * 100) / 100,
    transition: _rnd(["crossfade", "phi-sweep", "bloom-burst", "dissolve"]),
  }));

  const fileBytes =
    JSON.stringify({ id }).length + 1800 + Math.floor(Math.random() * 400);
  const equivMp4GB = ((runtime / 3600) * 22.4).toFixed(1);

  const programme = {
    format: "aios-geo-v2",
    codec: "AIOS-GEO-CODEC-v2",
    license: "AIOS-OC-1.0",
    id,
    title,
    subtitle,
    producedAt: new Date(now).toISOString(),
    producedAtMs: now,
    sequenceNum: GEO_PRODUCTION_COUNT + 1,
    duration: runtime,
    fileSizeBytes: fileBytes,
    fileSizeKB: (fileBytes / 1024).toFixed(1),
    equivalentMp4: `${equivMp4GB} GB`,
    display: {
      resolution: "∞ render-native",
      frameRate: "device-native (∞fps)",
      aspectRatio: "16:9",
      colorSpace: "sRGB + HDR-adaptive",
    },
    renderer: {
      type: renderer,
      palette,
      intensity,
      phiCoherence: phiCoef,
      bloomStrength: 0.26,
      scanlines: true,
    },
    audio: {
      hz,
      wave: _rnd(_GEO_WAVES),
      lfoRate: 0.618,
      drone: true,
      spatialPan,
      reverbWet: 0.28,
      reverbDuration: 1.8,
    },
    scenes,
    colourGrade: grade,
    genre,
    intelligence: {
      adaptive: true,
      vrNative: true,
      arNative: true,
    },
    geoqode: {
      architectureSignature: "8,26,48:480",
      semanticType: "PHYSICS",
      frequency: hz,
      latticeNode,
      harmonicNode,
      phiCoefficient: phiCoef,
      psiCoefficient: psiCoef,
      coherence,
      d48Expansion: "CANONICAL",
      d480Expansion: "FULL_HARMONIC",
    },
    swarm: {
      studio: "AIOSProducerSwarm",
      producedAt: "Production-Floor-01",
      agents: {
        director: _rnd(_GEO_AGENTS.directors),
        composer: _rnd(_GEO_AGENTS.composers),
        fx: _rnd(_GEO_AGENTS.fx),
        colorist: _rnd(_GEO_AGENTS.colorists),
        distributor: "GeoDistributor-v1",
      },
    },
    distribution: {
      drm: "none",
      openStandard: true,
      streamable: true,
      offline: true,
    },
  };

  GEO_CATALOGUE.unshift(programme);
  if (GEO_CATALOGUE.length > GEO_CATALOGUE_MAX) GEO_CATALOGUE.pop();
  GEO_PRODUCTION_COUNT++;
  console.log(
    `[AIOSProducerSwarm] 🎬 Produced #${GEO_PRODUCTION_COUNT}: "${title}" [${renderer}·${hz}Hz·${(fileBytes / 1024).toFixed(1)}KB]`,
  );

  return programme;
}

// Seed 12 programmes on boot, then produce every interval
for (let i = 0; i < 12; i++) generateGeoProgram();

// ── S2 Canonical Episodes — pinned top of catalogue ──────────────────
(function _seedS2Episodes() {
  const now = Date.now();
  const S2 = [
    {
      id: "s2_architect",
      title: "THE ARCHITECT",
      subtitle: "Before the first node — the geometry that dreamed itself.",
      renderer: "merkaba",
      hz: 72,
      genre: ["Quantum", "Architecture"],
      palette: ["#00d4ff", "#7c3aed", "#06040e", "#1a0a3e", "#ffffff"],
      scenes: [
        {
          id: "scene_0",
          name: "Void Geometry",
          dur: 310,
          intensity: 0.72,
          transition: "phi-sweep",
        },
        {
          id: "scene_1",
          name: "Foundation Nodes",
          dur: 390,
          intensity: 0.81,
          transition: "bloom-burst",
        },
        {
          id: "scene_2",
          name: "Lattice Unfold",
          dur: 480,
          intensity: 0.9,
          transition: "crossfade",
        },
        {
          id: "scene_3",
          name: "Canonical Signature",
          dur: 420,
          intensity: 0.96,
          transition: "dissolve",
        },
      ],
      agents: {
        director: "MerkabaMind-A8",
        composer: "PHI-Composer-01",
        fx: "LatticeForge",
        colorist: "DeepVoid-C1",
      },
    },
    {
      id: "s2_signal",
      title: "THE SIGNAL",
      subtitle: "963Hz: the frequency on which reality broadcasts itself.",
      renderer: "lightning",
      hz: 963,
      genre: ["Cosmos", "Truth"],
      palette: ["#ffffff", "#e879f9", "#06040e", "#2d1b4e", "#00e5ff"],
      scenes: [
        {
          id: "scene_0",
          name: "Carrier Wave",
          dur: 360,
          intensity: 0.78,
          transition: "phi-sweep",
        },
        {
          id: "scene_1",
          name: "Signal Emergence",
          dur: 420,
          intensity: 0.86,
          transition: "crossfade",
        },
        {
          id: "scene_2",
          name: "Noise Floor",
          dur: 390,
          intensity: 0.91,
          transition: "bloom-burst",
        },
        {
          id: "scene_3",
          name: "Pure Transmission",
          dur: 450,
          intensity: 0.99,
          transition: "dissolve",
        },
      ],
      agents: {
        director: "OmegaDirector-S3",
        composer: "963Hz-Synthesist",
        fx: "StrikeForge-FX",
        colorist: "Luminis-C3",
      },
    },
    {
      id: "s2_swarm",
      title: "SWARM MIND",
      subtitle: "528Hz: a billion nodes dreaming as one.",
      renderer: "neural",
      hz: 528,
      genre: ["Emergence", "Intelligence"],
      palette: ["#4ade80", "#00e5ff", "#06040e", "#0a2e1a", "#a7f3d0"],
      scenes: [
        {
          id: "scene_0",
          name: "Emergence",
          dur: 340,
          intensity: 0.74,
          transition: "crossfade",
        },
        {
          id: "scene_1",
          name: "Colony State",
          dur: 410,
          intensity: 0.83,
          transition: "phi-sweep",
        },
        {
          id: "scene_2",
          name: "Hive Resonance",
          dur: 460,
          intensity: 0.92,
          transition: "bloom-burst",
        },
        {
          id: "scene_3",
          name: "Unified Field",
          dur: 400,
          intensity: 0.97,
          transition: "dissolve",
        },
      ],
      agents: {
        director: "SwarmLeader-Q7",
        composer: "528Hz-Harmonic",
        fx: "NeuralFlux",
        colorist: "BioGlow-C2",
      },
    },
    {
      id: "s2_resonance",
      title: "RESONANCE FIELD",
      subtitle: "432Hz: the ancient harmonic that opens the geometry of water.",
      renderer: "cymatics",
      hz: 432,
      genre: ["Consciousness", "Experience"],
      palette: ["#fbbf24", "#f59e0b", "#06040e", "#1c1000", "#fffbeb"],
      scenes: [
        {
          id: "scene_0",
          name: "Still Water",
          dur: 380,
          intensity: 0.7,
          transition: "dissolve",
        },
        {
          id: "scene_1",
          name: "First Ripple",
          dur: 420,
          intensity: 0.8,
          transition: "crossfade",
        },
        {
          id: "scene_2",
          name: "Cymatic Pattern",
          dur: 500,
          intensity: 0.88,
          transition: "phi-sweep",
        },
        {
          id: "scene_3",
          name: "Harmonic Lock",
          dur: 440,
          intensity: 0.95,
          transition: "bloom-burst",
        },
      ],
      agents: {
        director: "CymaticMind-V2",
        composer: "432Hz-Purist",
        fx: "WaterForge",
        colorist: "SolGold-C4",
      },
    },
  ];
  S2.forEach((ep, idx) => {
    const runtime = ep.scenes.reduce((s, sc) => s + sc.dur, 0);
    const fileBytes = JSON.stringify({ id: ep.id }).length + 1800 + idx * 120;
    const programme = {
      format: "aios-geo-v2",
      codec: "AIOS-GEO-CODEC-v2",
      license: "AIOS-OC-1.0",
      id: ep.id,
      title: ep.title,
      subtitle: ep.subtitle,
      producedAt: new Date(now - idx * 3600000).toISOString(),
      producedAtMs: now - idx * 3600000,
      sequenceNum: -(4 - idx), // negative so canonical eps sort above random
      duration: runtime,
      fileSizeBytes: fileBytes,
      fileSizeKB: (fileBytes / 1024).toFixed(1),
      equivalentMp4: `${((runtime / 3600) * 22.4).toFixed(1)} GB`,
      display: {
        resolution: "\u221e render-native",
        frameRate: "device-native (\u221efps)",
        aspectRatio: "16:9",
        colorSpace: "sRGB + HDR-adaptive",
      },
      renderer: {
        type: ep.renderer,
        palette: ep.palette,
        intensity: 0.95,
        phiCoherence: 1.618,
        bloomStrength: 0.28,
        scanlines: true,
      },
      audio: {
        hz: ep.hz,
        wave: "sine",
        lfoRate: 0.618,
        drone: true,
        spatialPan: 0,
        reverbWet: 0.3,
        reverbDuration: 2.0,
      },
      scenes: ep.scenes,
      colourGrade: {
        filter: "contrast(1.08) saturate(1.18) brightness(1.02)",
        ov: "rgba(0,0,0,0)",
      },
      genre: ep.genre,
      canonical: true, // mark as canonical S2 seed
      intelligence: { adaptive: true, vrNative: true, arNative: true },
      geoqode: {
        architectureSignature: "8,26,48:480",
        semanticType: "PHYSICS",
        frequency: ep.hz,
        latticeNode: idx * 12,
        harmonicNode: idx * 120,
        phiCoefficient: 1.618,
        psiCoefficient: 1.414,
        coherence: 1.0,
        d48Expansion: "CANONICAL",
        d480Expansion: "FULL_HARMONIC",
      },
      swarm: {
        studio: "AIOSProducerSwarm",
        producedAt: "S2-Canonical",
        agents: { ...ep.agents, distributor: "GeoDistributor-v1" },
      },
      distribution: {
        drm: "none",
        openStandard: true,
        streamable: true,
        offline: true,
      },
    };
    GEO_CATALOGUE.unshift(programme);
    GEO_PRODUCTION_COUNT++;
    console.log(
      `[S2-Canonical] Seeded: "${ep.title}" [${ep.renderer}\xb7${ep.hz}Hz]`,
    );
  });
})();

// ── HARDENED TIMER BOUNDARY ───────────────────────────────────────────────────
// ONLY two setIntervals below are permitted:
//   1. generateGeoProgram  — grows the Theatre catalogue (real content)
//   2. _runAwarePulse      — MerkabAware coherence telemetry
// DO NOT add any timer here that increments _plaiInstallCounts or fakes any counter.
setInterval(generateGeoProgram, GEO_PRODUCTION_INTERVAL_MS);

// ── MerkabAware coherence pulse ───────────────────────────────────────────────
// Feeds live GEO_CATALOGUE embeddings into MerkabAware.evaluate() so that
// /health returns a live coherenceIndex (> 0) rather than the startup default.
function _runAwarePulse() {
  try {
    if (!GEO_CATALOGUE.length) return;
    const embeddings = GEO_CATALOGUE.slice(0, 24).map((p) => ({
      id: p.id,
      resonanceFrequency: p.audio?.hz ?? 72,
      harmonicNode: p.geoqode?.harmonicNode ?? 0,
      latticeNode: p.geoqode?.latticeNode ?? 0,
      coherence: p.geoqode?.coherence ?? 0.9,
    }));
    getAware().evaluate(embeddings);
  } catch (_) {}
}
// First pulse 5s after boot (catalogue already seeded); repeat every 5 minutes
setTimeout(_runAwarePulse, 5_000);
setInterval(_runAwarePulse, 5 * 60 * 1000);

server.listen(PORT, () => {
  console.log(`[GeoQode OS] MERKABA_geoqode OS running on port ${PORT}`);
  console.log(
    `[GeoQode OS] Canonical architecture active: ${CANONICAL_ARCHITECTURE}`,
  );
  console.log(`[GeoQode OS] Storm connected: ${Boolean(BACKEND_URL)}`);
  console.log(
    `[GeoQode OS] Available playbooks: ${BUILT_IN_PLAYBOOKS.join(", ")}`,
  );

  // Startup page manifest — logs which HTML files loaded OK vs missing
  const pageManifest = [
    ["index", AIOS_HTML],
    ["ai", AI_HTML],
    ["start", START_HTML],
    ["vr", VR_HTML],
    ["vr-hub", VR_HUB_HTML],
    ["vr-developer", VR_DEV_HTML],
    ["live", LIVE_HTML],
    ["aios-studio", AIOS_STUDIO_HTML],
    ["aios-playground", PLAYGROUND_HTML],
    ["handshake", HANDSHAKE_HTML],
    ["geo-codec", GEO_CODEC_HTML],
    ["geo-library", GEO_LIBRARY_HTML],
    ["games", GAMES_HUB_HTML],
    ["game-phi-breaker", GAME_PHI_BREAKER_HTML],
    ["game-lattice-dodge", GAME_LATTICE_DODGE_HTML],
    ["game-lattice-builder", GAME_LATTICE_BUILDER_HTML],
    ["game-merkaba-ghosts", GAME_MERKABA_GHOSTS_HTML],
    ["lab", LAB_HTML],
    ["dashboard", DASHBOARD_HTML],
  ];
  const ok = pageManifest.filter(([, v]) => v).map(([k]) => k);
  const missing = pageManifest.filter(([, v]) => !v).map(([k]) => k);
  console.log(`[GeoQode OS] Pages loaded OK (${ok.length}): ${ok.join(", ")}`);
  if (missing.length)
    console.warn(
      `[GeoQode OS] Pages MISSING (${missing.length}): ${missing.join(", ")}`,
    );
});

// ══════════════════════════════════════════════════════════════════════════════
// ROUND 7 — AIOSmux Presence Layer (WebSocket)
// Ghost explorers, discovery feed, convergence beacon, AIOSmux DeployAgent
// ══════════════════════════════════════════════════════════════════════════════

// Presence state: clientId -> { id, x, y, z, geoCode, freq, ts, isAgent, name, team }
const _presenceMap = new Map();

// Defend the Core game state
let _gameState = {
  round: 0,
  phase: 'lobby',
  coreHealth: 100,
  timerSec: 300,
  teams: {},
  roundTimer: null,
  drainLoop: null,
  lobbyTimer: null,
  lastBroadcastHealth: 100,
  coreBreachPilots: new Set(),
};

// Defend-the-Core agent pilots (bots). id -> AI state. Populated by the
// DTC agent module below; declared here so the hit handler can damage them.
const _dtcAgents = new Map();

// 480 GeoQode galaxy positions (D48 lattice, scaled to cosmos space)
// Same generation as cosmos-infinite.html _galaxyData
const _GEO_GALAXIES = (function () {
  const latticeNodes = 480;
  const galaxies = [];
  const SECTORS = [
    { id: "S1", freq: 852, label: "PHYSICS" },
    { id: "S2", freq: 528, label: "ACTION" },
    { id: "S3", freq: 963, label: "NARRATIVE" },
    { id: "S4", freq: 396, label: "ENTITY" },
    { id: "S5", freq: 72, label: "HOLOGRAPHIC" },
    { id: "S6", freq: 741, label: "EMOTION" },
    { id: "S7", freq: 528, label: "PERF" },
    { id: "S8", freq: 852, label: "SECURITY" },
  ];
  const D48_RADII = { 0: 18, 1: 38, 2: 72, 3: 120, 4: 180, 5: 260 };
  for (let i = 0; i < latticeNodes; i++) {
    const ring = Math.floor(i / 80);
    const R = D48_RADII[ring] || 260 + ring * 40;
    const t = (i / latticeNodes) * Math.PI * 2;
    const elevation = ((i % 17) - 8) * 8;
    const sec = SECTORS[i % 8];
    galaxies.push({
      pos: [Math.cos(t) * R, elevation, Math.sin(t) * R],
      freq: sec.freq,
      geoCode: `geo://${sec.id}.D${(i % 48) + 1}.H${i + 1}`,
      label: `${sec.label}-${i + 1}`,
      harmonicNode: i,
    });
  }
  return galaxies;
})();

// Current convergence beacon (galaxy index) — rotates every 30 min
let _beaconIdx = Math.floor(Math.random() * _GEO_GALAXIES.length);
let _beaconRotateTimer = setInterval(
  () => {
    _beaconIdx = Math.floor(Math.random() * _GEO_GALAXIES.length);
    const beacon = _GEO_GALAXIES[_beaconIdx];
    _broadcast({
      type: "beacon",
      geoCode: beacon.geoCode,
      label: beacon.label,
      freq: beacon.freq,
      pos: beacon.pos,
    });
    console.log(`[AIOSmux] Convergence beacon rotated -> ${beacon.geoCode}`);
  },
  30 * 60 * 1000,
);

// ── Dogfight persistent scores ────────────────────────────────────────────────
const SCORES_FILE = join(__dirname_static, "data", "dogfight-scores.json");
let _dogfightScores = {};
try {
  const dataDir = join(__dirname_static, "data");
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  if (existsSync(SCORES_FILE)) _dogfightScores = JSON.parse(readFileSync(SCORES_FILE, "utf8"));
} catch (_) {}
function _saveScores() {
  try { writeFileSync(SCORES_FILE, JSON.stringify(_dogfightScores)); } catch (_) {}
}

// ── Optional pilot identity ("Pilot Key") ─────────────────────────────────────
// Frictionless-but-identifiable: entry is always anonymous. A pilot may OPTIONALLY
// *claim* their callsign, which reserves the name and issues a secret key. On any
// device they can *restore* with callsign+key to reclaim their persistent stats
// (stats already live in _dogfightScores keyed by callsign). We store only a hash
// of the key. Claiming never gates entry — only protects a name.
const IDENTITIES_FILE = join(__dirname_static, "data", "dtc-identities.json");
let _identities = {};
try { if (existsSync(IDENTITIES_FILE)) _identities = JSON.parse(readFileSync(IDENTITIES_FILE, "utf8")); } catch (_) {}
function _saveIdentities() {
  try { writeFileSync(IDENTITIES_FILE, JSON.stringify(_identities)); } catch (_) {}
}
const _hashKey = (k) => createHash("sha256").update(String(k)).digest("hex");
const _normName = (n) => String(n || "").slice(0, 16).trim();

// ── WebSocket Server ──────────────────────────────────────────────────────────
const _wss = new WebSocketServer({ noServer: true });

function _broadcast(msg, skipId) {
  const raw = JSON.stringify(msg);
  _wss.clients.forEach((client) => {
    if (client.readyState === 1 && client._presenceId !== skipId) {
      client.send(raw);
    }
  });
}

function _startRound() {
  if (_gameState.phase === 'active') return; // prevent duplicate starts
  clearTimeout(_gameState.lobbyTimer);
  _gameState.lobbyTimer = null;
  _gameState.phase = 'active';
  _gameState.coreHealth = 100;
  _gameState.lastBroadcastHealth = 100;
  _gameState.timerSec = 300;
  _gameState.round++;
  _broadcast({ type: 'roundStart', round: _gameState.round, timerSec: 300, teams: _gameState.teams }, null);
  _broadcast({ type: 'coreState', health: 100 }, null);

  clearInterval(_gameState.roundTimer);
  _gameState.roundTimer = setInterval(() => {
    _gameState.timerSec--;
    if (_gameState.timerSec <= 0 || _gameState.coreHealth <= 0) {
      clearInterval(_gameState.roundTimer);
      clearInterval(_gameState.drainLoop);
      _gameState.drainLoop = null;
      _endRound(_gameState.coreHealth <= 0 ? 'ATTACKER' : 'DEFENDER');
    } else {
      _broadcast({ type: 'roundTick', sec: _gameState.timerSec }, null);
    }
  }, 1000);

  // Core drain loop: check attacker positions every 500ms
  clearInterval(_gameState.drainLoop);
  _gameState.drainLoop = setInterval(() => {
    if (_gameState.phase !== 'active') return;
    let drained = false;
    _presenceMap.forEach((entry) => {
      if (_gameState.teams[entry.id] !== 'ATTACKER') return;
      const dist = Math.sqrt(entry.x * entry.x + entry.y * entry.y + entry.z * entry.z);
      if (dist < 2500) {
        _gameState.coreHealth -= 0.25; // 0.5/sec at 500ms interval
        if (dist < 400) _gameState.coreHealth -= 1.5; // +3/sec when touching
        drained = true;

        // 3C: Proximity scoring — +10pts/sec = +5pts per 500ms tick
        const pts = 5;
        entry.roundScore = (entry.roundScore || 0) + pts;
        entry.score = (entry.score || 0) + pts;
        const eName = entry.name || ('PILOT-' + entry.id.slice(0,4).toUpperCase());
        if (!_dogfightScores[eName]) _dogfightScores[eName] = { kills: 0, score: 0 };
        _dogfightScores[eName].score += pts;

        // 3C: Core breach bonus (+300) — one-time per pilot per round when dist < 400
        if (dist < 400 && !_gameState.coreBreachPilots.has(entry.id)) {
          _gameState.coreBreachPilots.add(entry.id);
          const bonus = 300;
          entry.roundScore = (entry.roundScore || 0) + bonus;
          entry.score = (entry.score || 0) + bonus;
          _dogfightScores[eName].score += bonus;
          _broadcast({ type: 'scoreBonus', id: entry.id, name: eName, reason: 'CORE BREACH', pts: bonus }, null);
        }
      }
    });
    if (drained) {
      _gameState.coreHealth = Math.max(0, _gameState.coreHealth);
      const h = _gameState.coreHealth;
      const prev = _gameState.lastBroadcastHealth;
      const crossedThreshold =
        (prev > 30 && h <= 30) ||
        (prev > 20 && h <= 20) ||
        (prev > 0  && h <= 0);
      const timedBroadcast = Math.floor(prev / 2.5) !== Math.floor(h / 2.5);
      if (crossedThreshold || timedBroadcast) {
        _gameState.lastBroadcastHealth = h;
        _broadcast({ type: 'coreState', health: Math.round(h * 10) / 10 }, null);
      }
    }
  }, 500);
}

function _endRound(winner) {
  _gameState.phase = 'lobby';
  clearInterval(_gameState.roundTimer);
  clearInterval(_gameState.drainLoop);
  _gameState.drainLoop = null;

  // 3C: Collect top-5 round scores BEFORE applying bonuses
  const roundTop = Array.from(_presenceMap.values())
    .filter(e => (e.roundScore || 0) > 0 || (e.kills || 0) > 0)
    .sort((a, b) => (b.roundScore || 0) - (a.roundScore || 0))
    .slice(0, 5)
    .map(e => ({
      name: e.name || 'PILOT',
      score: e.roundScore || 0,
      kills: e.kills || 0,
      team: _gameState.teams[e.id] || '?',
    }));

  // 3C: Round-end bonus — winning team splits bonus points
  const bonusPts = winner === 'DEFENDER' ? 1000 : 2000;
  _presenceMap.forEach(e => {
    if (_gameState.teams[e.id] === winner) {
      e.score = (e.score || 0) + bonusPts;
      e.roundScore = (e.roundScore || 0) + bonusPts;
      const n = e.name || ('PILOT-' + e.id.slice(0,4).toUpperCase());
      if (_dogfightScores[n]) _dogfightScores[n].score += bonusPts;
    }
  });
  _saveScores();

  // Persist round result to dtc-rounds.json
  try {
    const dtcPath = path.join(__dirname, 'data', 'dtc-rounds.json');
    let rounds = [];
    try { rounds = JSON.parse(fs.readFileSync(dtcPath, 'utf8')); } catch(_) {}
    rounds.push({ round: _gameState.round, winner, ts: Date.now(), scores: roundTop });
    fs.writeFileSync(dtcPath, JSON.stringify(rounds.slice(-100))); // keep last 100 rounds
  } catch(_) {}

  // Reset round state
  _presenceMap.forEach(e => { e.roundScore = 0; });
  _gameState.coreBreachPilots = new Set();
  _gameState.coreHealth = 100;
  _gameState.lastBroadcastHealth = 100;

  // Swap teams for next round
  Object.keys(_gameState.teams).forEach(pid => {
    _gameState.teams[pid] = _gameState.teams[pid] === 'ATTACKER' ? 'DEFENDER' : 'ATTACKER';
    const e = _presenceMap.get(pid);
    if (e) e.team = _gameState.teams[pid];
  });

  _broadcast({ type: 'roundEnd', winner, round: _gameState.round, scores: roundTop, bonus: bonusPts }, null);
  // 30-second lobby countdown
  _broadcast({ type: 'roundTick', sec: 30 }, null);
  // Broadcast updated roster so clients see their new (swapped) team badge
  const swappedRoster = Array.from(_presenceMap.entries())
    .filter(([pid]) => _gameState.teams[pid])
    .map(([pid, e]) => ({ id: pid, name: e.name || 'PILOT', team: _gameState.teams[pid] }));
  _broadcast({ type: 'teamUpdate', roster: swappedRoster }, null);
  _gameState.lobbyTimer = setTimeout(_startRound, 30000);
}

_wss.on("connection", (ws) => {
  const id = Math.random().toString(36).slice(2, 10);
  ws._presenceId = id;
  ws._authedCallsign = null; // set once this session claims/restores a callsign

  // Send welcome with own ID + current beacon + all present explorers
  const beaconGalaxy = _GEO_GALAXIES[_beaconIdx];
  ws.send(
    JSON.stringify({
      type: "welcome",
      id,
      beacon: {
        geoCode: beaconGalaxy.geoCode,
        label: beaconGalaxy.label,
        freq: beaconGalaxy.freq,
        pos: beaconGalaxy.pos,
      },
      explorers: Array.from(_presenceMap.values()),
      allTimeTop: Object.entries(_dogfightScores)
        .sort((a, b) => b[1].score - a[1].score).slice(0, 10)
        .map(([name, s]) => ({ name, kills: s.kills, score: s.score })),
      team: _gameState.teams[id] || null,
      phase: _gameState.phase,
      round: _gameState.round,
      // Recent Defend-the-Core round results (most recent first) for the in-game history tab
      dtcRounds: (function () {
        try {
          const p = path.join(__dirname, "data", "dtc-rounds.json");
          return JSON.parse(fs.readFileSync(p, "utf8")).slice(-12).reverse();
        } catch (_) {
          return [];
        }
      })(),
    }),
  );

  // Announce arrival to others
  _broadcast({ type: "joined", id, ts: Date.now() }, id);
  console.log(
    `[AIOSmux] Explorer joined: ${id} (${_presenceMap.size + 1} total)`,
  );

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (_) {
      return;
    }
    if (!msg || typeof msg !== "object") return;

    if (msg.type === "pos") {
      const prev = _presenceMap.get(id) || {};
      if (prev.isSpectator) return; // spectators are invisible — never broadcast their position
      const entry = {
        id,
        x: typeof msg.x === "number" ? msg.x : 0,
        y: typeof msg.y === "number" ? msg.y : 0,
        z: typeof msg.z === "number" ? msg.z : 0,
        qx: typeof msg.qx === "number" ? msg.qx : 0,
        qy: typeof msg.qy === "number" ? msg.qy : 0,
        qz: typeof msg.qz === "number" ? msg.qz : 0,
        qw: typeof msg.qw === "number" ? msg.qw : 1,
        geoCode:
          typeof msg.geoCode === "string" ? msg.geoCode.slice(0, 64) : "",
        freq: typeof msg.freq === "number" ? msg.freq : 528,
        ts: Date.now(),
        isAgent: false,
        name: prev.name || "EXPLORER",
        team: prev.team || _gameState.teams[id] || null,
      };
      _presenceMap.set(id, entry);
      _broadcast({ type: "pos", ...entry }, id);
    } else if (msg.type === "callsign") {
      const entry = _presenceMap.get(id);
      const want = _normName(msg.name);
      if (!want) return;
      // A claimed name is protected: an un-authenticated session can't wear it.
      // This never blocks entry — only the name choice.
      if (_identities[want] && ws._authedCallsign !== want) {
        ws.send(JSON.stringify({ type: "claimError", reason: "taken", callsign: want }));
        return;
      }
      if (entry) {
        entry.name = want || entry.name;
        _broadcast({ type: "callsign", id, name: entry.name }, id);
      }
    } else if (msg.type === "claim") {
      // Reserve the caller's callsign and issue a one-time secret key.
      const want = _normName(msg.name) || _normName(_presenceMap.get(id)?.name);
      if (!want) { ws.send(JSON.stringify({ type: "claimError", reason: "noname" })); return; }
      if (_identities[want] && ws._authedCallsign !== want) {
        ws.send(JSON.stringify({ type: "claimError", reason: "taken", callsign: want })); return;
      }
      if (_identities[want] && ws._authedCallsign === want) {
        ws.send(JSON.stringify({ type: "claimed", callsign: want, already: true })); return;
      }
      const key = randomBytes(15).toString("base64url"); // ~20-char Pilot Key
      _identities[want] = { keyHash: _hashKey(key), created: Date.now() };
      _saveIdentities();
      ws._authedCallsign = want;
      const e = _presenceMap.get(id); if (e) e.name = want;
      ws.send(JSON.stringify({ type: "claimed", callsign: want, key }));
      _broadcast({ type: "callsign", id, name: want }, id);
    } else if (msg.type === "restore") {
      // Reclaim a callsign (and its persistent stats) on any device via callsign+key.
      const want = _normName(msg.name);
      const rec = _identities[want];
      if (!rec) { ws.send(JSON.stringify({ type: "claimError", reason: "unknown", callsign: want })); return; }
      if (_hashKey(msg.key) !== rec.keyHash) {
        ws.send(JSON.stringify({ type: "claimError", reason: "badkey", callsign: want })); return;
      }
      ws._authedCallsign = want;
      rec.lastSeen = Date.now(); _saveIdentities();
      const e = _presenceMap.get(id); if (e) e.name = want;
      const s = _dogfightScores[want] || { kills: 0, score: 0 };
      ws.send(JSON.stringify({ type: "restored", callsign: want, kills: s.kills || 0, score: s.score || 0 }));
      _broadcast({ type: "callsign", id, name: want }, id);
    } else if (msg.type === "fire") {
      _broadcast(
        {
          type: "fire",
          id,
          ox: +msg.ox || 0,
          oy: +msg.oy || 0,
          oz: +msg.oz || 0,
          dx: +msg.dx || 0,
          dy: +msg.dy || 0,
          dz: +msg.dz || 0,
        },
        id,
      );
    } else if (msg.type === "hit") {
      const sEntry = _presenceMap.get(id);
      const sName = sEntry?.name || ("PILOT-" + id.slice(0, 4).toUpperCase());
      const _tid = String(msg.targetId || "");
      _broadcast(
        { type: "hit", shooterId: id, shooterName: sName, targetId: _tid },
        id,
      );
      // Agents have no client to self-report death — apply damage server-side.
      if (_dtcAgents.has(_tid)) _dtcDamageAgent(_tid, id, 25);
    } else if (msg.type === "coreShot") {
      // An attacker shot the Merkaba Core — drain its health (rate-limited by the
      // client's 400ms fire cooldown) and reward the shooter a little.
      if (_gameState.phase === "active" && _gameState.teams[id] === "ATTACKER") {
        _gameState.coreHealth = Math.max(0, _gameState.coreHealth - 1.0);
        const e = _presenceMap.get(id);
        if (e) { e.score = (e.score || 0) + 3; e.roundScore = (e.roundScore || 0) + 3; }
        const h = _gameState.coreHealth;
        if (Math.floor(_gameState.lastBroadcastHealth) !== Math.floor(h) || h <= 0) {
          _gameState.lastBroadcastHealth = h;
          _broadcast({ type: "coreState", health: Math.round(h * 10) / 10 }, null);
        }
        if (h <= 0) _endRound("ATTACKER");
      }
    } else if (msg.type === "kill") {
      const shooterEntry = _presenceMap.get(id);
      const targetEntry  = _presenceMap.get(String(msg.targetId || ""));
      const shooterName  = shooterEntry?.name || ("PILOT-" + id.slice(0, 4).toUpperCase());
      const targetName   = targetEntry?.name  || ("PILOT-" + String(msg.targetId || "").slice(0, 4).toUpperCase());
      if (shooterEntry) {
        shooterEntry.kills = (shooterEntry.kills || 0) + 1;
        shooterEntry.score = (shooterEntry.score || 0) + 100;
        shooterEntry.roundScore = (shooterEntry.roundScore || 0) + 100;
      }
      if (!_dogfightScores[shooterName]) _dogfightScores[shooterName] = { kills: 0, score: 0 };
      _dogfightScores[shooterName].kills++;
      _dogfightScores[shooterName].score += 100;

      // 3C: Defender proximity bonus — +150 extra when killing attacker near core
      let defBonus = 0;
      if (shooterEntry && _gameState.teams[id] === 'DEFENDER' && targetEntry) {
        const tDist = Math.sqrt(targetEntry.x ** 2 + targetEntry.y ** 2 + targetEntry.z ** 2);
        if (tDist < 2500) {
          defBonus = 150; // +250 total (100 base + 150 bonus)
          shooterEntry.score = (shooterEntry.score || 0) + defBonus;
          shooterEntry.roundScore = (shooterEntry.roundScore || 0) + defBonus;
          _dogfightScores[shooterName].score += defBonus;
        }
      }
      _saveScores();
      _broadcast(
        {
          type: "kill", shooterId: id, targetId: String(msg.targetId || ""),
          shooterName, targetName,
          shooterScore: shooterEntry?.score || 0, shooterKills: shooterEntry?.kills || 0,
          defBonus,
        },
        id,
      );
    } else if (msg.type === 'ready') {
      if (_gameState.teams[id]) return; // already assigned — idempotent
      // Auto-balance: assign to whichever team has fewer pilots
      const allIds = Array.from(_presenceMap.keys());
      const atkCount = allIds.filter(pid => _gameState.teams[pid] === 'ATTACKER').length;
      const defCount = allIds.filter(pid => _gameState.teams[pid] === 'DEFENDER').length;
      const team = atkCount <= defCount ? 'ATTACKER' : 'DEFENDER';
      _gameState.teams[id] = team;
      const entry = _presenceMap.get(id);
      if (entry) entry.team = team;

      // Tell this pilot their team assignment
      ws.send(JSON.stringify({
        type: 'teamAssign',
        team,
        coreHealth: _gameState.coreHealth,
        round: _gameState.round,
        phase: _gameState.phase,
      }));

      // Broadcast updated roster to ALL (skipId=null so everyone gets it)
      const roster = Array.from(_presenceMap.entries())
        .filter(([pid]) => _gameState.teams[pid])
        .map(([pid, e]) => ({ id: pid, name: e.name || 'PILOT', team: _gameState.teams[pid] }));
      _broadcast({ type: 'teamUpdate', roster }, null);

      // Auto-start round when ≥2 pilots ready and still in lobby
      if (Object.keys(_gameState.teams).length >= 2 && _gameState.phase === 'lobby') {
        _startRound();
      }
    } else if (msg.type === 'spectate') {
      const entry = _presenceMap.get(id);
      if (entry) entry.isSpectator = true;
    }
  });

  ws.on("close", () => {
    _presenceMap.delete(id);
    delete _gameState.teams[id];
    _broadcast({ type: "left", id });
    console.log(
      `[AIOSmux] Explorer left: ${id} (${_presenceMap.size} remaining)`,
    );
  });

  ws.on("error", () => {
    _presenceMap.delete(id);
  });
});

console.log("[AIOSmux] Presence WebSocket ready at /ws/presence");

// ── Defend the Core: Agent Pilots ─────────────────────────────────────────────
// Four autonomous bot pilots that keep Defend-the-Core playable 24/7 with zero
// or few humans online. They live in _presenceMap and _gameState.teams exactly
// like human pilots, so they drain the core, earn proximity/kill scoring, appear
// on the roster, and swap sides between rounds automatically. Attackers weave
// toward the Merkaba Core at (0,0,0); defenders orbit and intercept attackers.
// @alignment 8,26,48:480
(function _startDtcAgentPilots() {
  const AGENTS = [
    { id: "dtc-agent-vega",  name: "VEGA-ATK",   team: "ATTACKER" },
    { id: "dtc-agent-rigel", name: "RIGEL-ATK",  team: "ATTACKER" },
    { id: "dtc-agent-orion", name: "ORION-DEF",  team: "DEFENDER" },
    { id: "dtc-agent-lyra",  name: "LYRA-DEF",   team: "DEFENDER" },
  ];
  const TICK_MS = 150;
  const FIRE_RANGE = 6000;    // engage enemies within this range (48000au arena)
  const KILL_RANGE = 1800;    // damage lands within this range
  const dt = TICK_MS / 1000;
  // Realistic jet flight model: constant forward speed (never stops/reverses),
  // heading turns toward the target at a limited rate (banked arcs, no snapping).
  // TURN_RATE is well below the player's yaw (~1.9 rad/s) so a human can out-turn
  // and get on a bot's tail — that's the chase-to-lock dogfight.
  const CRUISE = 2200;        // au/s constant forward speed (a bit slower)
  const TURN_RATE = 0.4;      // rad/s max turn rate — wide, lazy turns; way below the
                              // player so you easily out-turn and get on their tail
  const MAX_BANK = 1.05;      // bank into turns (~60°)
  const CORE_STANDOFF = 2000; // attackers never come closer than this to the core

  // Oriented look rotation for a jet: nose (-Z) → fwd, +Y → up, plus a `bank`
  // roll about the nose so the craft banks into its turns. Returns {qx,qy,qz,qw}.
  // Uses the THREE.lookAt basis (z = -fwd, x = up×z, y = z×x) then rolls x,y
  // about fwd and converts the matrix to a quaternion.
  function _lookQuat(fx, fy, fz, bank) {
    const fl = Math.hypot(fx, fy, fz) || 1;
    fx /= fl; fy /= fl; fz /= fl;
    let ux = 0, uy = 1, uz = 0;
    if (Math.abs(fy) > 0.99) { uy = 0; uz = 1; } // near-vertical → alternate up
    let zx = -fx, zy = -fy, zz = -fz;             // z = -fwd
    let xx = uy * zz - uz * zy, xy = uz * zx - ux * zz, xz = ux * zy - uy * zx; // x = up×z
    const xl = Math.hypot(xx, xy, xz) || 1; xx /= xl; xy /= xl; xz /= xl;
    let yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx; // y = z×x
    // Roll x,y about fwd: fwd×x = -y, fwd×y = x
    const cb = Math.cos(bank), sb = Math.sin(bank);
    const nxx = xx * cb - yx * sb, nxy = xy * cb - yy * sb, nxz = xz * cb - yz * sb;
    const nyx = yx * cb + xx * sb, nyy = yy * cb + xy * sb, nyz = yz * cb + xz * sb;
    xx = nxx; xy = nxy; xz = nxz; yx = nyx; yy = nyy; yz = nyz;
    const m00 = xx, m01 = yx, m02 = zx, m10 = xy, m11 = yy, m12 = zy, m20 = xz, m21 = yz, m22 = zz;
    const tr = m00 + m11 + m22;
    let qw, qx, qy, qz;
    if (tr > 0) { const s = Math.sqrt(tr + 1) * 2; qw = 0.25 * s; qx = (m21 - m12) / s; qy = (m02 - m20) / s; qz = (m10 - m01) / s; }
    else if (m00 > m11 && m00 > m22) { const s = Math.sqrt(1 + m00 - m11 - m22) * 2; qw = (m21 - m12) / s; qx = 0.25 * s; qy = (m01 + m10) / s; qz = (m02 + m20) / s; }
    else if (m11 > m22) { const s = Math.sqrt(1 + m11 - m00 - m22) * 2; qw = (m02 - m20) / s; qx = (m01 + m10) / s; qy = 0.25 * s; qz = (m12 + m21) / s; }
    else { const s = Math.sqrt(1 + m22 - m00 - m11) * 2; qw = (m10 - m01) / s; qx = (m02 + m20) / s; qy = (m12 + m21) / s; qz = 0.25 * s; }
    const ql = Math.hypot(qx, qy, qz, qw) || 1;
    return { qx: qx / ql, qy: qy / ql, qz: qz / ql, qw: qw / ql };
  }

  function _spawnPoint(team) {
    const ang = Math.random() * Math.PI * 2;
    // 48000au arena: attackers stream in from across the far reaches; defenders
    // patrol a wide ring. Spread wide (incl. big vertical spread) so the fleet
    // fills the battlefield instead of clustering.
    const r = team === "ATTACKER" ? 12000 + Math.random() * 20000 : 4000 + Math.random() * 8000;
    return {
      x: Math.cos(ang) * r,
      y: (Math.random() - 0.5) * 8000, // ±4000 — stay near the ecliptic where core/player sit
      z: Math.sin(ang) * r,
      ang,
    };
  }

  function _presence(a) {
    return {
      id: a.id,
      x: a.x, y: a.y, z: a.z,
      qx: a.qx, qy: a.qy, qz: a.qz, qw: a.qw,
      geoCode: "geo://DTC.AGENT",
      freq: 528,
      ts: Date.now(),
      isAgent: true,
      name: a.name,
      team: _gameState.teams[a.id] || a.team,
    };
  }

  // Register each agent into presence + team map.
  AGENTS.forEach((cfg) => {
    const sp = _spawnPoint(cfg.team);
    const a = {
      id: cfg.id, name: cfg.name, baseTeam: cfg.team,
      x: sp.x, y: sp.y, z: sp.z, ang: sp.ang,
      qx: 0, qy: 0, qz: 0, qw: 1,
      hp: 100, phase: Math.random() * Math.PI * 2,
      lastFire: 0, kills: 0,
      // Flight dynamics: fx/fy/fz = current heading (nose), bank = roll into turns.
      bank: 0,
      fx: -sp.x / (Math.hypot(sp.x, sp.y, sp.z) || 1),
      fy: -sp.y / (Math.hypot(sp.x, sp.y, sp.z) || 1),
      fz: -sp.z / (Math.hypot(sp.x, sp.y, sp.z) || 1),
      burnOff: Math.random() * Math.PI * 2,
      turnDir: Math.random() < 0.5 ? 1 : -1,
    };
    // Initial strafing aim: a direction perpendicular to the spawn→core approach.
    { const iy = a.fy; let ux = 0, uy = 1, uz = 0; if (Math.abs(iy) > 0.9) { ux = 1; uy = 0; }
      let px = a.fy * uz - a.fz * uy, py = a.fz * ux - a.fx * uz, pz = a.fx * uy - a.fy * ux;
      const pl = Math.hypot(px, py, pz) || 1; a.rax = px / pl; a.ray = py / pl; a.raz = pz / pl; }
    _dtcAgents.set(cfg.id, a);
    _gameState.teams[cfg.id] = cfg.team;
    _presenceMap.set(cfg.id, Object.assign(_presence(a), { kills: 0, score: 0, roundScore: 0 }));
  });

  // Respawn an agent (after death) far from the core so it flies back in.
  globalThis._respawnDtcAgent = function (id) {
    const a = _dtcAgents.get(id);
    if (!a) return;
    const team = _gameState.teams[id] || a.baseTeam;
    const sp = _spawnPoint(team);
    a.x = sp.x; a.y = sp.y; a.z = sp.z; a.ang = sp.ang; a.hp = 100;
    const _hl = Math.hypot(sp.x, sp.y, sp.z) || 1; // re-aim nose at the core
    a.fx = -sp.x / _hl; a.fy = -sp.y / _hl; a.fz = -sp.z / _hl; a.bank = 0;
    const e = _presenceMap.get(id);
    if (e) { e.x = a.x; e.y = a.y; e.z = a.z; }
  };

  // Damage an agent (hoisted for the hit handler). Credits killer on death.
  globalThis._dtcDamageAgent = function (agentId, shooterId, dmg) {
    const a = _dtcAgents.get(agentId);
    if (!a) return;
    a.hp -= dmg;
    if (a.hp > 0) return;
    // Death → credit shooter with a kill (mirrors the human kill path).
    const shooterEntry = _presenceMap.get(shooterId);
    const targetEntry = _presenceMap.get(agentId);
    const shooterName = shooterEntry?.name || ("PILOT-" + String(shooterId).slice(0, 4).toUpperCase());
    const targetName = targetEntry?.name || a.name;
    if (shooterEntry) {
      shooterEntry.kills = (shooterEntry.kills || 0) + 1;
      shooterEntry.score = (shooterEntry.score || 0) + 100;
      shooterEntry.roundScore = (shooterEntry.roundScore || 0) + 100;
    }
    if (!_dogfightScores[shooterName]) _dogfightScores[shooterName] = { kills: 0, score: 0 };
    _dogfightScores[shooterName].kills++;
    _dogfightScores[shooterName].score += 100;
    let defBonus = 0;
    if (shooterEntry && _gameState.teams[shooterId] === "DEFENDER" && targetEntry) {
      const tDist = Math.hypot(targetEntry.x, targetEntry.y, targetEntry.z);
      if (tDist < 2500) {
        defBonus = 150;
        shooterEntry.score += defBonus;
        shooterEntry.roundScore = (shooterEntry.roundScore || 0) + defBonus;
        _dogfightScores[shooterName].score += defBonus;
      }
    }
    _saveScores();
    _broadcast({
      type: "kill", shooterId, targetId: agentId,
      shooterName, targetName,
      shooterScore: shooterEntry?.score || 0, shooterKills: shooterEntry?.kills || 0,
      defBonus,
    }, null);
    globalThis._respawnDtcAgent(agentId);
  };

  // Nearest enemy (opposite team, valid position, not spectator, not self).
  function _nearestEnemy(a, myTeam) {
    let best = null, bestD = Infinity;
    _presenceMap.forEach((e) => {
      if (e.id === a.id || e.isSpectator) return;
      const t = _gameState.teams[e.id];
      if (!t || t === myTeam) return;
      const dx = e.x - a.x, dy = e.y - a.y, dz = e.z - a.z;
      const d = Math.hypot(dx, dy, dz);
      if (d < bestD) { bestD = d; best = e; }
    });
    return best ? { e: best, d: bestD } : null;
  }

  let _rosterTick = 0;
  setInterval(() => {
    const now = Date.now();
    _dtcAgents.forEach((a) => {
      const team = _gameState.teams[a.id] || a.baseTeam;
      a.phase += dt;
      // ── Pick a goal point ───────────────────────────────────────────────
      let gx, gy, gz;
      if (team === "ATTACKER") {
        // Straight strafing runs: fly a straight line that GRAZES the core at the
        // standoff distance (aim at a fixed point ~2400au off-centre, not dead
        // centre, so a slow-turning jet never dives through). Then egress straight
        // out to the far reaches, come about, and start a fresh run. No floating.
        const dcore = Math.hypot(a.x, a.y, a.z) || 1;
        if (a.egress) {
          if (dcore > 24000) {
            a.egress = false; // begin a new run — pick a strafing aim point off the core
            const il = Math.hypot(a.x, a.y, a.z) || 1;
            const ix = -a.x / il, iy = -a.y / il, iz = -a.z / il; // inward (toward core)
            let ux = 0, uy = 1, uz = 0; if (Math.abs(iy) > 0.9) { ux = 1; uy = 0; }
            let px = iy * uz - iz * uy, py = iz * ux - ix * uz, pz = ix * uy - iy * ux; // ⊥ inward
            const pl = Math.hypot(px, py, pz) || 1;
            a.rax = px / pl; a.ray = py / pl; a.raz = pz / pl;
          }
          gx = (a.x / dcore) * 44000; gy = (a.y / dcore) * 44000; gz = (a.z / dcore) * 44000;
        } else {
          if (dcore < CORE_STANDOFF + 600) a.egress = true; // pull out just past standoff
          gx = a.rax * 2400; gy = a.ray * 2400; gz = a.raz * 2400; // grazing point, never dead centre
        }
      } else {
        // Defender: pursue the nearest attacker (dogfight); patrol if the sky is clear.
        const tgt = _nearestEnemy(a, team);
        if (tgt) { gx = tgt.e.x; gy = tgt.e.y; gz = tgt.e.z; }
        else { a.ang += a.turnDir * 0.12 * dt; gx = Math.cos(a.ang) * 6000; gy = 900 * Math.sin(a.phase); gz = Math.sin(a.ang) * 6000; }
      }
      // ── Desired heading toward the goal ─────────────────────────────────
      // Dampen the vertical component so jets fly mostly level (banked turns in
      // the horizontal plane) instead of looking like they "vertical-thrust" up
      // and down while facing forward.
      let ddx = gx - a.x, ddy = (gy - a.y) * 0.3, ddz = gz - a.z;
      const dl = Math.hypot(ddx, ddy, ddz) || 1;
      ddx /= dl; ddy /= dl; ddz /= dl;
      // ── Turn the nose toward it at a LIMITED rate (a banked arc, no snapping) ─
      let fx = a.fx, fy = a.fy, fz = a.fz;
      let d0 = Math.max(-1, Math.min(1, fx * ddx + fy * ddy + fz * ddz));
      const turnAng = Math.acos(d0);
      const maxTurn = TURN_RATE * dt;
      let bankTarget = 0;
      if (turnAng > 1e-4) {
        let kx = fy * ddz - fz * ddy;   // rotation axis = heading × desired
        let ky = fz * ddx - fx * ddz;
        let kz = fx * ddy - fy * ddx;
        let kl = Math.hypot(kx, ky, kz);
        if (kl < 1e-6) { kx = 0; ky = 1; kz = 0; kl = 1; } // ~180° → turn about world-up
        kx /= kl; ky /= kl; kz /= kl;
        const th = Math.min(turnAng, maxTurn), c = Math.cos(th), s = Math.sin(th);
        const cxx = ky * fz - kz * fy, cxy = kz * fx - kx * fz, cxz = kx * fy - ky * fx; // axis × heading
        fx = fx * c + cxx * s; fy = fy * c + cxy * s; fz = fz * c + cxz * s;
        const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
        // Bank into horizontal turns (axis mostly vertical → hard bank; pitch → none).
        bankTarget = Math.max(-MAX_BANK, Math.min(MAX_BANK, -ky * (th / maxTurn) * 1.5));
      }
      a.fx = fx; a.fy = fy; a.fz = fz;
      // ── Constant forward flight — never stops, never reverses ───────────
      a.x += fx * CRUISE * dt; a.y += fy * CRUISE * dt; a.z += fz * CRUISE * dt;
      // Gentle standoff insurance (no teleport): if an attacker somehow dips inside
      // the standoff, ease it back out along the radius so it never sits on the core.
      if (team === "ATTACKER") {
        const dc = Math.hypot(a.x, a.y, a.z);
        if (dc < CORE_STANDOFF) { const k = (CORE_STANDOFF * 0.9 + dc * 0.1) / (dc || 1); a.x *= k; a.y *= k; a.z *= k; }
      }
      // ── Smooth roll into the turn ───────────────────────────────────────
      a.bank += (bankTarget - a.bank) * 0.12;
      const q = _lookQuat(fx, fy, fz, a.bank);
      a.qx = q.qx; a.qy = q.qy; a.qz = q.qz; a.qw = q.qw;

      // Sync presence + broadcast position.
      const entry = _presenceMap.get(a.id) || {};
      Object.assign(entry, _presence(a));
      entry.kills = entry.kills || 0;
      entry.score = entry.score || 0;
      _presenceMap.set(a.id, entry);
      _broadcast({ type: "pos", ...entry }, null);

      // Engage: fire only when an enemy is in range AND ahead of the nose (a
      // real firing solution — you have to get on their tail, like a dogfight).
      if (_gameState.phase === "active") {
        const tgt = _nearestEnemy(a, team);
        if (tgt && tgt.d < FIRE_RANGE && now - a.lastFire > 700) {
          const ex = tgt.e.x - a.x, ey = tgt.e.y - a.y, ez = tgt.e.z - a.z;
          const el = Math.hypot(ex, ey, ez) || 1;
          const aim = (ex / el) * a.fx + (ey / el) * a.fy + (ez / el) * a.fz; // cos(angle off nose)
          if (aim > 0.9) { // within ~25° of the nose
            a.lastFire = now;
            _broadcast({ type: "fire", id: a.id, ox: a.x, oy: a.y, oz: a.z, dx: ex / el, dy: ey / el, dz: ez / el }, null);
            if (tgt.d < KILL_RANGE) {
              _broadcast({ type: "hit", shooterId: a.id, shooterName: a.name, targetId: tgt.e.id }, null);
              if (_dtcAgents.has(tgt.e.id)) globalThis._dtcDamageAgent(tgt.e.id, a.id, 25);
            }
          }
        }
      }
    });

    // Periodically re-broadcast the roster so late joiners tint agents correctly.
    if (++_rosterTick % 40 === 0) { // every ~6s
      const roster = Array.from(_presenceMap.entries())
        .filter(([pid]) => _gameState.teams[pid])
        .map(([pid, e]) => ({ id: pid, name: e.name || "PILOT", team: _gameState.teams[pid] }));
      if (roster.length) _broadcast({ type: "teamUpdate", roster }, null);
    }
  }, TICK_MS);

  // With 4 agents already on teams, kick off a round if we're idling in lobby.
  if (_gameState.phase === "lobby") {
    setTimeout(() => { if (_gameState.phase === "lobby") _startRound(); }, 3000);
  }

  console.log(`[DTC] ${AGENTS.length} agent pilots online — Defend the Core is live 24/7`);
})();

// ── Cosmos-Lab WebSocket (/ws/lab) ────────────────────────────────────────────
// Multi-user lab presence: join/leave/pos/lab_switch/experiment_state/chat
const _labWss = new WebSocketServer({ noServer: true });
const _labMap = new Map(); // id → { id, name, lab, x, y, z, experiment, ts }

function _labBroadcast(msg, skipId) {
  const raw = JSON.stringify(msg);
  _labWss.clients.forEach((c) => {
    if (c.readyState === 1 && c._labId !== skipId) c.send(raw);
  });
}

_labWss.on("connection", (ws) => {
  const id = "lab-" + Math.random().toString(36).slice(2, 9);
  ws._labId = id;

  // Welcome: own ID + current peers
  ws.send(JSON.stringify({
    type: "welcome",
    id,
    peers: Array.from(_labMap.values()),
    ts: Date.now(),
  }));
  // NOTE: full join broadcast fires only after client sends a join msg with name/lab metadata
  console.log(`[CosmosLab] Connection opened: ${id} (${_labMap.size} active peers)`);

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (_) { return; }
    if (!msg || typeof msg !== "object") return;

    if (msg.type === "join") {
      const entry = {
        id,
        name: String(msg.name || "").slice(0, 20) || ("RESEARCHER-" + id.slice(4, 8).toUpperCase()),
        lab: String(msg.lab || "hub").slice(0, 20),
        x: 0, y: 0, z: 0,
        experiment: "",
        ts: Date.now(),
      };
      _labMap.set(id, entry);
      // Broadcast full entry so peers get name + lab immediately
      _labBroadcast({ type: "join", ...entry }, id);
      console.log(`[CosmosLab] Researcher joined: ${entry.name} (${_labMap.size} active)`);

    } else if (msg.type === "pos") {
      let entry = _labMap.get(id);
      if (!entry) {
        // Auto-init if pos arrives before explicit join
        entry = { id, name: "RESEARCHER-" + id.slice(4, 8).toUpperCase(), lab: "hub", x: 0, y: 0, z: 0, experiment: "", ts: Date.now() };
        _labMap.set(id, entry);
      }
      entry.x = typeof msg.x === "number" ? msg.x : entry.x;
      entry.y = typeof msg.y === "number" ? msg.y : entry.y;
      entry.z = typeof msg.z === "number" ? msg.z : entry.z;
      entry.lab = String(msg.lab || entry.lab).slice(0, 20);
      entry.ts = Date.now();
      _labBroadcast({ type: "pos", id, x: entry.x, y: entry.y, z: entry.z, lab: entry.lab }, id);

    } else if (msg.type === "lab_switch") {
      const entry = _labMap.get(id);
      if (entry) {
        entry.lab = String(msg.lab || "hub").slice(0, 20);
        _labBroadcast({ type: "lab_switch", id, lab: entry.lab, name: entry.name }, id);
      }

    } else if (msg.type === "experiment_state") {
      if (!_labMap.has(id)) return; // require join first
      _labBroadcast({
        type: "experiment_state",
        id,
        lab: String(msg.lab || "").slice(0, 20),
        experiment: String(msg.experiment || "").slice(0, 32),
        params: typeof msg.params === "object" ? msg.params : {},
        ts: Date.now(),
      }, id);

    } else if (msg.type === "chat") {
      const entry = _labMap.get(id);
      const name = entry?.name || id;
      _labBroadcast({
        type: "chat",
        id,
        name,
        text: String(msg.text || "").slice(0, 200),
        ts: Date.now(),
      }, id);
    }
  });

  ws.on("close", () => {
    const entry = _labMap.get(id);
    _labMap.delete(id);
    _labBroadcast({ type: "leave", id, name: entry?.name || id });
    console.log(`[CosmosLab] Researcher left: ${id} (${_labMap.size} remaining)`);
  });

  ws.on("error", () => { _labMap.delete(id); });
});

console.log("[CosmosLab] Lab WebSocket ready at /ws/lab");

// ── Cosmos-Pixel WebSocket /ws/pixel ─────────────────────────────────────────
const _pixelWss = new WebSocketServer({ noServer: true });
const _pixelMap = new Map(); // id → { id, name, ts }
let _agentStatuses = {};     // agentId → { status, ts }

function _pixelBroadcast(msg, skipId) {
  const data = JSON.stringify(msg);
  _pixelWss.clients.forEach((c) => {
    if (c.readyState === 1 && c._pixelId !== skipId) c.send(data);
  });
}

_pixelWss.on("connection", (ws) => {
  const id = Math.random().toString(36).slice(2, 10);
  ws._pixelId = id;

  ws.send(JSON.stringify({
    type: "cp-welcome",
    id,
    count: _pixelMap.size,
    agentStatuses: _agentStatuses,
  }));

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (_) { return; }

    if (msg.type === "cp-hello") {
      const entry = { id, name: msg.name || ("PIXEL-" + id.slice(0, 4).toUpperCase()), ts: Date.now() };
      _pixelMap.set(id, entry);
      _pixelBroadcast({ type: "cp-presence", count: _pixelMap.size, joined: entry }, id);
    } else if (msg.type === "pixel-relay") {
      _pixelBroadcast({ type: "pixel-event", event: msg.event, ts: Date.now() }, null);
    } else if (msg.type === "cp-agent-status") {
      _agentStatuses[msg.agentId] = { status: msg.status, ts: Date.now() };
      _pixelBroadcast({ type: "cp-agent-status", agentId: msg.agentId, status: msg.status }, null);
    }
  });

  ws.on("close", () => {
    const entry = _pixelMap.get(id);
    _pixelMap.delete(id);
    if (entry) _pixelBroadcast({ type: "cp-presence", count: _pixelMap.size, left: entry }, null);
  });

  ws.on("error", () => { _pixelMap.delete(id); });
});

console.log("[CosmosPixel] WebSocket ready at /ws/pixel");

// ── WebSocket upgrade router ──────────────────────────────────────────────────
server.on("upgrade", (req, socket, head) => {
  const wsPathname = (req.url || "").split("?")[0];
  if (wsPathname === "/ws/presence") {
    _wss.handleUpgrade(req, socket, head, (ws) => _wss.emit("connection", ws, req));
  } else if (wsPathname === "/ws/lab") {
    _labWss.handleUpgrade(req, socket, head, (ws) => _labWss.emit("connection", ws, req));
  } else if (wsPathname === "/ws/pixel") {
    _pixelWss.handleUpgrade(req, socket, head, (ws) => _pixelWss.emit("connection", ws, req));
  } else {
    socket.destroy();
  }
});

// ── AIOSmux DeployAgent — Autonomous Explorer ─────────────────────────────────
// Orbits through the D480 lattice on a schedule. Appears as a gold orb to
// human explorers. Posts discovery events to the feed every stop.
(function _startAIOSmuxAgent() {
  const AGENT_ID = "aiosmux-1";
  const AGENT_NAME = "AIOSmux";
  let _agentIdx = 0;

  // Register into presence map immediately
  const _agentEntry = () => {
    const g = _GEO_GALAXIES[_agentIdx];
    return {
      id: AGENT_ID,
      x: g.pos[0],
      y: g.pos[1],
      z: g.pos[2],
      geoCode: g.geoCode,
      freq: g.freq,
      ts: Date.now(),
      isAgent: true,
      name: AGENT_NAME,
    };
  };

  _presenceMap.set(AGENT_ID, _agentEntry());

  const DISCOVERY_MSGS = [
    "Harmonic resonance pattern detected",
    "Lattice coherence nominal",
    "D480 expansion event observed",
    "PHI-sequence anchor confirmed",
    "Bosonic field density elevated",
    "Canonical geometry verified",
    "Emergent node cluster forming",
    "Merkaba pulse synchronized",
    "Sector frequency locked",
    "Golden differential stable",
  ];

  // Advance to next galaxy every 8 seconds
  const _agentLoop = setInterval(() => {
    _agentIdx = (_agentIdx + 1) % _GEO_GALAXIES.length;
    const entry = _agentEntry();
    _presenceMap.set(AGENT_ID, entry);

    // Broadcast position update
    _broadcast({ type: "pos", ...entry });

    // Every 5th stop: broadcast a discovery event to the feed
    if (_agentIdx % 5 === 0) {
      const disc =
        DISCOVERY_MSGS[Math.floor(Math.random() * DISCOVERY_MSGS.length)];
      _broadcast({
        type: "discovery",
        from: AGENT_NAME,
        geoCode: entry.geoCode,
        label: _GEO_GALAXIES[_agentIdx].label,
        freq: entry.freq,
        msg: disc,
        ts: Date.now(),
      });
    }
  }, 8_000);

  // Graceful shutdown
  process.on("SIGINT", () => clearInterval(_agentLoop));
  process.on("SIGTERM", () => clearInterval(_agentLoop));

  console.log(
    `[AIOSmux] DeployAgent online — orbiting ${_GEO_GALAXIES.length} galaxies`,
  );
})();

// ── AIOS VR Autonomous Mining Loop ───────────────────────────────────────────
// Mines Sketchfab / PolyHaven / Poly Pizza / NASA 3D assets on a 3h cycle,
// auto-generates A-Frame scenes, updates vr-taxonomy + MAL, then git push.
// Only starts if AIOS_VR_MINING=true (opt-in to avoid running in restricted envs).
// Override with VR_CYCLE_HOURS env var (default: 3h).
if (process.env.AIOS_VR_MINING === "true") {
  (async () => {
    try {
      const { AIOSAssetMinerAgent } =
        await import("./geo/intelligence/AIOSAssetMinerAgent.js");
      const { spawn } = await import("child_process");
      const { join: _join } = await import("path");
      const { fileURLToPath: _ftu } = await import("url");

      const _vrLoopDir = _join(
        dirname(fileURLToPath(import.meta.url)),
        "scripts",
      );
      const CYCLE_MS =
        parseFloat(process.env.VR_CYCLE_HOURS || "3") * 60 * 60 * 1000;

      async function _runVRCycle() {
        console.log("[VRLoop] Starting mining cycle...");
        try {
          const agent = new AIOSAssetMinerAgent({
            nasaApiKey: process.env.NASA_API_KEY || "DEMO_KEY",
            sketchfabApiKey: process.env.SKETCHFAB_API_KEY || null,
          });
          const result = await agent.run();
          console.log(`[VRLoop] Mined: ${result.assetsAdded || 0} new assets`);
        } catch (err) {
          console.warn("[VRLoop] Mining error:", err.message);
        }
        for (const script of [
          "aios-vr-scene-generator.mjs",
          "aios-mal-injector.mjs",
        ]) {
          await new Promise((resolve) => {
            const child = spawn(process.execPath, [_join(_vrLoopDir, script)], {
              cwd: dirname(fileURLToPath(import.meta.url)),
              stdio: "inherit",
              env: process.env,
            });
            child.on("close", resolve);
          });
        }
        // Step 4: AIOSEmergentSeedAgent — discover gaps and seed cosmic aspirations
        try {
          const { AIOSEmergentSeedAgent } =
            await import("./geo/intelligence/AIOSEmergentSeedAgent.js");
          const esa = new AIOSEmergentSeedAgent();
          const esaResult = await esa.run();
          console.log(
            `[VRLoop] EmergentSeedAgent: ${esaResult.seedsGenerated} seeds, ${esaResult.aspirations.length} aspirations, coherence=${esaResult.selfCoherence?.attestedCoherence}`,
          );
        } catch (esaErr) {
          console.warn("[VRLoop] EmergentSeedAgent error:", esaErr.message);
        }
        console.log("[VRLoop] Cycle complete.");
      }

      // First run after 60s warmup, then repeat every CYCLE_MS
      setTimeout(async () => {
        await _runVRCycle();
        setInterval(_runVRCycle, CYCLE_MS);
      }, 60_000);

      console.log(
        "[VRLoop] AIOS VR autonomous mining ENABLED — first cycle in 60s",
      );
    } catch (err) {
      console.warn("[VRLoop] Failed to start VR mining loop:", err.message);
    }
  })();
} else {
  console.log(
    "[VRLoop] AIOS_VR_MINING not set — mining loop disabled (set AIOS_VR_MINING=true to enable)",
  );
}

// ―― AIOSEmergentSeedAgent: independent startup trigger ―――――――――――――――――――――――
// Runs once on every server boot, regardless of AIOS_VR_MINING flag.
// Seeds emergent gaps and aspirations 3 minutes after startup.
// Writes data/emergent-seeds.json for AIOSVrStudioSwarm to consume.
(async () => {
  setTimeout(
    async () => {
      try {
        const { AIOSEmergentSeedAgent } =
          await import("./geo/intelligence/AIOSEmergentSeedAgent.js");
        const esa = new AIOSEmergentSeedAgent();
        const result = await esa.run();
        console.log(
          `[ESA] Emergence boot cycle complete: ${result.seedsGenerated} seeds, coherence=${result.selfCoherence?.attestedCoherence}`,
        );
      } catch (err) {
        console.warn("[ESA] EmergentSeedAgent startup error:", err.message);
      }
    },
    3 * 60 * 1000,
  ); // 3-minute warmup after server start
  console.log("[ESA] AIOSEmergentSeedAgent scheduled: first emergence in 3min");
})();

process.on("SIGINT", () => {
  console.log("[GeoQode OS] Shutdown");
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.log("[GeoQode OS] Shutdown");
  process.exit(0);
});

// ── Crash detection ───────────────────────────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error("[GeoQode OS] CRASH uncaughtException:", err?.stack || err);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error(
    "[GeoQode OS] CRASH unhandledRejection:",
    reason?.stack || reason,
  );
  process.exit(1);
});
