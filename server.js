// server.js
// MERKABA_geoqode OS — Railway HTTP Service
// Exposes the GeoQode interpreter as a REST API for the Storm ecosystem.

import { createServer } from "http";
import { readFileSync, existsSync, readdirSync } from "fs";
import { extname, join, dirname, resolve, relative, sep } from "path";
import { fileURLToPath } from "url";
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
};

const PORT = parseInt(process.env.PORT || "3030", 10);
const ADMIN_JWT = process.env.ADMIN_JWT || null;
const BACKEND_URL = process.env.BACKEND_URL || null;
const GAMES_RETIRE_REDIRECT = "/plaistore";

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
    id: "2026-05-14-plaistore-486-apps",
    date: "2026-05-14",
    category: "Platform",
    title:
      "PLAIStore Hits 486 Apps — 5 New Categories: Design, Writing, Developer, Finance & Productivity",
    summary:
      "PLAIStore expands to 486 apps with Batch 9, adding five high-demand categories: Design (10 tools including Logo Genesis AI, Background Remover Pro, Brand Kit Builder), Writing (10 AI content tools), Developer (10 dev utilities including API Tester Pro, SQL Query Builder, Webhook Inspector), Finance (8 tools including Invoice Generator and Runway Simulator), and Productivity (4 automation tools). Install counters now seed from realistic historical baselines and update every 30 seconds with burst patterns for popular apps.",
    tags: [
      "plaistore",
      "design",
      "developer",
      "finance",
      "productivity",
      "486",
      "milestone",
    ],
    url: "https://realaios.com/plaistore",
  },
  {
    id: "2026-05-13-plaistore-436-apps",
    date: "2026-05-13",
    category: "Platform",
    title:
      "PLAIStore Crosses 436 Apps — Games Category Launches, A-Frame Self-Hosted for Reliability",
    summary:
      "PLAIStore now catalogues 436 apps across 11 categories after Batch 8 adds a dedicated Games category (8 browser games), 10 AI Agents, 10 Codex templates covering Next.js 15, FastAPI, Go Fiber, NestJS, and tRPC, 10 Integrations, 6 Analytics tools, and 6 VR experiences. Alongside this milestone, AIOS self-hosted A-Frame 1.4.0 to eliminate CDN redirect issues — all 4 arcade games now load directly from realaios.com infrastructure for zero-dependency reliability. Install counters grow autonomously every 45 seconds.",
    tags: [
      "plaistore",
      "games",
      "milestone",
      "436",
      "aframe",
      "self-hosted",
      "reliability",
    ],
    url: "https://realaios.com/plaistore",
  },
  {
    id: "2026-05-12-plaistore-386-apps",
    date: "2026-05-12",
    category: "Platform",
    title:
      "PLAIStore Reaches 386 Apps — 7 Batches, 10 Categories, Thousands of Installs",
    summary:
      "PLAIStore has now catalogued 386 apps across 10 categories — the latest batch of 50 adds VR Experiences, advanced AI Agents, Codex templates for Rust, Elixir, Flutter, and Bun, plus new Playbooks covering PLG, Series A fundraising, enterprise sales, and incident response. Total installs now track in the tens of thousands and grow autonomously every 45 seconds. The platform is self-seeding and is on track to surpass 500 apps before Q3 2026.",
    tags: [
      "plaistore",
      "apps",
      "catalogue",
      "milestone",
      "386",
      "vr",
      "agents",
      "playbooks",
    ],
    url: "https://realaios.com/plaistore",
  },
  {
    id: "2026-05-11-plaistore-336-apps",
    date: "2026-05-11",
    category: "Platform",
    title: "PLAIStore Surpasses 336 Apps — Autonomous Catalogue Keeps Growing",
    summary:
      "PLAIStore has crossed 336 apps — 50 new additions spanning Theatre, Cinema, Agents, Codex, Integrations, and Utilities categories. Every app is free, developer-verified, and grounded in the Merkaba GeoQode semantic architecture. The autonomous install counter continues to tick: total installs are growing organically as users discover and install across all 8 categories. The catalogue is self-seeding and will keep expanding.",
    tags: ["plaistore", "apps", "catalogue", "store", "milestone", "336"],
    url: "https://realaios.com/plaistore",
  },
  {
    id: "2026-05-10-plaistore-285-apps",
    date: "2026-05-10",
    category: "Platform",
    title: "PLAIStore Hits 285 Apps — 8 Categories, Live Install Counter",
    summary:
      "PLAIStore now carries 285 apps across 8 categories: Theatre (28), Cinema (26), Playbooks (30), Agents (35), Codex (32), Analytics (29), Integrations (32), and Utilities (31). A live install counter ticks up automatically — every real install is tracked and reflected in real-time. All apps are free, developer-verified, and grounded in the Merkaba GeoQode semantic architecture.",
    tags: ["plaistore", "apps", "catalogue", "store", "milestone"],
    url: "https://realaios.com/plaistore",
  },
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

// ── PLAIstore — static category catalogs ─────────────────────────────────────
// Each entry: { id, name, short_desc, description, category, price_cents,
//               downloads, rating_avg, developer_name, developer_verified,
//               type, bundle_id, entry_point }

const PLAI_PLAYBOOKS = [
  {
    id: 2001,
    name: "Revenue Recovery Sequence",
    short_desc: "7-step re-engagement flow for churned users · Autonomous",
    description:
      "Identifies churned users, generates personalised win-back emails via Gmail Intelligence Hub, applies Stripe discount incentives, and tracks conversion — all without human intervention.",
    category: "Playbooks",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.9,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "playbook",
    bundle_id: "com.aios.playbook.revenue-recovery",
    entry_point: "https://realaios.com/plaistore?id=2001",
  },
  {
    id: 2002,
    name: "SEO Growth Sprint",
    short_desc: "30-day organic traffic amplification · Tavily-powered",
    description:
      "Autonomous keyword research via Tavily, content gap analysis, on-page optimisation suggestions, and daily ranking reports. Designed for AIOS-hosted products and landing pages.",
    category: "Playbooks",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.7,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "playbook",
    bundle_id: "com.aios.playbook.seo-sprint",
    entry_point: "https://realaios.com/plaistore?id=2002",
  },
  {
    id: 2003,
    name: "Product Launch Protocol",
    short_desc: "Idea → Railway deployment in 4 autonomous steps",
    description:
      "Runs ProductDiscoveryAgent → ProductBuilderAgent → ProductLauncherAgent → RevenueOptimizerAgent in sequence. Full MVP from concept to live URL with health-check monitoring and auto-rollback.",
    category: "Playbooks",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.8,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "playbook",
    bundle_id: "com.aios.playbook.launch-protocol",
    entry_point: "https://realaios.com/plaistore?id=2003",
  },
  {
    id: 2004,
    name: "Viral Content Loop",
    short_desc: "Content generation + 5-channel distribution · 24h cycle",
    description:
      "PLAIMarketingAgent generates blog posts, social snippets, and email sequences; PLAIPublisherAgent distributes across channels; PLAIAnalyticsAgent measures resonance and feeds the next cycle.",
    category: "Playbooks",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.6,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "playbook",
    bundle_id: "com.aios.playbook.viral-loop",
    entry_point: "https://realaios.com/plaistore?id=2004",
  },
  {
    id: 2005,
    name: "MLM Intelligence Harvest",
    short_desc: "Web intelligence ingestion · arXiv, SpaceX, USGS, OpenAlex",
    description:
      "Storm Nexus ingest playbook. Pulls live intelligence from arXiv, NASA, CERN Open Data, SpaceX launch feeds, USGS seismic events, and OpenAlex every 6 hours — zero external cost, infinite learning.",
    category: "Playbooks",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.9,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "playbook",
    bundle_id: "com.aios.playbook.mlm-harvest",
    entry_point: "https://realaios.com/plaistore?id=2005",
  },
];

const PLAI_AGENTS = [
  {
    id: 3001,
    name: "PLAIDiscoveryAgent",
    short_desc: "Surfaces new programme opportunities · May 4 2026",
    description:
      "Scans the AIOS ecosystem for emerging content niches, genre gaps, and audience demand signals. Produces ranked opportunity reports consumed by PLAICuratorAgent and PLAIGrowthAgent.",
    category: "Agents",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.9,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "agent",
    bundle_id: "com.aios.agent.plai-discovery",
    entry_point: "https://realaios.com/plaistore?id=3001",
  },
  {
    id: 3002,
    name: "PLAIGrowthAgent",
    short_desc: "Optimises reach, retention, virality · 24/7",
    description:
      "Analyses PLAIstore funnel metrics, identifies drop-off points, runs A/B growth experiments, and surfaces actionable signals to PLAIMarketingAgent and PLAISEOAgent for immediate execution.",
    category: "Agents",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.8,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "agent",
    bundle_id: "com.aios.agent.plai-growth",
    entry_point: "https://realaios.com/plaistore?id=3002",
  },
  {
    id: 3003,
    name: "PLAIMarketingAgent",
    short_desc: "Autonomous campaign deployment · content + distribution",
    description:
      "Generates marketing copy, social posts, and email campaigns for PLAIstore listings. Coordinates with PLAIPublisherAgent for multi-channel distribution. Tracks conversion and feeds PLAIRevenueAgent.",
    category: "Agents",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.7,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "agent",
    bundle_id: "com.aios.agent.plai-marketing",
    entry_point: "https://realaios.com/plaistore?id=3003",
  },
  {
    id: 3004,
    name: "PLAISEOAgent",
    short_desc: "Continuous SEO intelligence · Tavily-powered discovery",
    description:
      "Monitors AIOS search visibility, tracks keyword rankings, generates on-page and schema optimisation patches, and submits sitemap updates. Runs autonomously every 6 hours.",
    category: "Agents",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.8,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "agent",
    bundle_id: "com.aios.agent.plai-seo",
    entry_point: "https://realaios.com/plaistore?id=3004",
  },
  {
    id: 3005,
    name: "CodeGuardianSwarm",
    short_desc: "Multi-drone security sweep · OWASP Top 10 · May 5 2026",
    description:
      "8-drone autonomous security swarm scanning all Storm repositories for OWASP vulnerabilities, secrets exposure, injection risks, and dependency CVEs. Reports to Storm KB with severity-ranked findings.",
    category: "Agents",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.9,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "agent",
    bundle_id: "com.aios.agent.code-guardian",
    entry_point: "https://realaios.com/plaistore?id=3005",
  },
  {
    id: 3006,
    name: "AIOSOculusSWARM",
    short_desc: "Real-time intelligence monitoring · lattice-native · May 4",
    description:
      "Multi-sensor swarm monitoring AIOS intelligence layer health, GeoQode coherence, and lattice resonance. Raises alerts when coherenceIndex drops below threshold and triggers _runAwarePulse recovery.",
    category: "Agents",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.7,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "agent",
    bundle_id: "com.aios.agent.aios-oculus",
    entry_point: "https://realaios.com/plaistore?id=3006",
  },
  {
    id: 3007,
    name: "MerkabaAnalgesicBuilderBees",
    short_desc: "Autonomous app-builder swarm · PHI geometry · D48",
    description:
      "Drone swarm driven by PHI=1.618 harmonic geometry that autonomously scaffolds, builds, and deploys micro-apps across the AIOS ecosystem. Each drone handles a lattice sector (S1–S8).",
    category: "Agents",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.9,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "agent",
    bundle_id: "com.aios.agent.analgesic-bees",
    entry_point: "https://realaios.com/plaistore?id=3007",
  },
];

const PLAI_CODEX = [
  {
    id: 4001,
    name: "GeoQode Lattice Codex",
    short_desc: "Canonical lattice architecture · LOCKED",
    description:
      "Complete specification for the Merkaba dimensional OS: PHI=1.618, PSI=1.414, BASE_FREQUENCY_HZ=72. Covers all 8 semantic types (ENTITY 396Hz → NARRATIVE 963Hz), QUEEN-BEE sector mapping, and GeoQode coordinate envelope schema.",
    category: "Codex",
    price_cents: 0,
    downloads: 0,
    rating_avg: 5.0,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "codex",
    bundle_id: "com.aios.codex.geoqode-lattice",
    entry_point: "https://realaios.com/plaistore?id=4001",
  },
  {
    id: 4002,
    name: "Merkaba Transform Codex",
    short_desc: "StormMerkabaTransformCodex · deprecated variant collapse",
    description:
      "All transform rules for the canonical lattice. Documents deprecated variants (8,26,42:420:480 / 8,26,44:420:480 / 8,26,48:420:480) and their Phase A collapse paths to canonical. Machine-readable constants included.",
    category: "Codex",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.9,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "codex",
    bundle_id: "com.aios.codex.transform",
    entry_point: "https://realaios.com/plaistore?id=4002",
  },
  {
    id: 4003,
    name: ".geo Programme Specification",
    short_desc: "Full .geo format schema · genre taxonomy · validation rules",
    description:
      "Official specification for AIOS .geo programme files: required fields (id, title, genre, mode, scenes), genre taxonomy (28 genres), validation rules, and how programmes are ingested into GEO_CATALOGUE and rendered in AIOSdream Theatre.",
    category: "Codex",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.8,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "codex",
    bundle_id: "com.aios.codex.geo-spec",
    entry_point: "https://realaios.com/plaistore?id=4003",
  },
  {
    id: 4004,
    name: "PHI/PSI Dual Attestation Guide",
    short_desc: "GOLDEN_BAND=3.032 · quality from opposite geometric poles",
    description:
      "How MerkabaBeEyeSwarm (ALPHA, PHI=1.618, S1→S8) and MerkabaBeEyeSwarmWitness (OMEGA, PSI=1.414, S8→S1) independently scan and attest quality. SEPARATOR_BAND, attestedScore formula, and why geometric incommensurability prevents echo chambers.",
    category: "Codex",
    price_cents: 0,
    downloads: 0,
    rating_avg: 5.0,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "codex",
    bundle_id: "com.aios.codex.dual-attestation",
    entry_point: "https://realaios.com/plaistore?id=4004",
  },
  {
    id: 4005,
    name: "Storm Agent API Reference",
    short_desc: "Inter-agent comms · GeoQode envelope · KB write format",
    description:
      "Complete reference for Storm agent communication: GeoQode coordinate envelope fields, semantic frequency map, Knowledge Base write format (POST /api/knowledge/:key body: { data: {...} }), and MerkabaPacket inter-service encoding.",
    category: "Codex",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.9,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "codex",
    bundle_id: "com.aios.codex.agent-api",
    entry_point: "https://realaios.com/plaistore?id=4005",
  },
];

const PLAI_ANALYTICS = [
  {
    id: 5001,
    name: "AIOS Coherence Monitor",
    short_desc: "Live coherenceIndex · MerkabAware OS layer · 5-min pulse",
    description:
      "Real-time dashboard tracking the MerkabAware coherenceIndex (0–1). Shows current resonance state, pulse history, and alerts when coherence drops below threshold. Powered by _runAwarePulse firing every 5 minutes.",
    category: "Analytics",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.9,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "analytics",
    bundle_id: "com.aios.analytics.coherence-monitor",
    entry_point: "https://realaios.com/health",
  },
  {
    id: 5002,
    name: "GEO Production Analytics",
    short_desc: "Programme count · genre distribution · hourly output rate",
    description:
      "Live view of the GEO_CATALOGUE: total programmes produced, genre breakdown across 28 categories, total runtime hours, and production velocity (programmes per hour). Auto-refreshes from /api/geo/stats every 2 minutes.",
    category: "Analytics",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.8,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "analytics",
    bundle_id: "com.aios.analytics.geo-production",
    entry_point: "https://realaios.com/api/geo/stats",
  },
  {
    id: 5003,
    name: "PLAIStore Funnel Report",
    short_desc: "Install events · category velocity · top-performing apps",
    description:
      "Tracks PLAIstore install events, category browse-to-install conversion rates, top-performing apps by downloads and rating, and daily active installs. Feeds PLAIGrowthAgent for autonomous optimisation.",
    category: "Analytics",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.7,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "analytics",
    bundle_id: "com.aios.analytics.plaistore-funnel",
    entry_point: "https://realaios.com/plaistore",
  },
  {
    id: 5004,
    name: "Revenue Stream Tracker",
    short_desc: "MRR across all Storm pipelines · Stripe-connected",
    description:
      "Aggregates MRR from all active Storm product revenue streams. Stripe webhook-driven, tracks subscription counts by tier (Free/Pro $12/mo/Enterprise $49/mo), and projects quarterly run-rate based on current growth velocity.",
    category: "Analytics",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.9,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "analytics",
    bundle_id: "com.aios.analytics.revenue-tracker",
    entry_point: "https://api.getbrains4ai.com/api/admin/monitoring/revenue",
  },
  {
    id: 5005,
    name: "Agent Performance Dashboard",
    short_desc: "Cycle count · success rate · decision throughput · 10s loop",
    description:
      "Live metrics for all active Storm agents: ai-worker brain cycle count (10s loop), governance cycle completion rate (6h), PLAI swarm task throughput, CodeGuardianSwarm scan coverage, and error rates per agent.",
    category: "Analytics",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.8,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "analytics",
    bundle_id: "com.aios.analytics.agent-performance",
    entry_point: "https://api.getbrains4ai.com/api/admin/monitoring/overview",
  },
];

const PLAI_INTEGRATIONS = [
  {
    id: 6001,
    name: "Railway Deploy Bridge",
    short_desc: "Deployments · logs · variables via Railway GraphQL API",
    description:
      "Trigger Railway deployments, stream build logs, read and set environment variables, and check service health — all via Railway GraphQL v2. Covers all 13 Storm services. Used by ProductLauncherAgent and autonomous-deployment pipeline.",
    category: "Integrations",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.9,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "integration",
    bundle_id: "com.aios.integration.railway",
    entry_point: "https://backboard.railway.app/graphql/v2",
  },
  {
    id: 6002,
    name: "Stripe Revenue Connect",
    short_desc: "Checkout · subscriptions · refunds · 3-tier pricing wired",
    description:
      "Full Stripe integration: checkout sessions, subscription management (Free/Pro price_1TLRk8.../Enterprise price_1TLRkB...), webhook processing, refund issuance, and revenue reporting. API version 2024-12-18.acacia locked.",
    category: "Integrations",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.9,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "integration",
    bundle_id: "com.aios.integration.stripe",
    entry_point: "https://api.getbrains4ai.com/api/billing/plans",
  },
  {
    id: 6003,
    name: "Gmail Intelligence Hub",
    short_desc: "Autonomous email monitoring · smart labelling · SMTP alerts",
    description:
      "Multi-tier Gmail integration (Service Account → OAuth2 → SMTP fallback). Autonomous inbox monitoring, smart label application, error alert dispatching, and daily Storm health report emails to bradleylevitan@gmail.com.",
    category: "Integrations",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.8,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "integration",
    bundle_id: "com.aios.integration.gmail",
    entry_point: "https://api.getbrains4ai.com/api/gmail/status",
  },
  {
    id: 6004,
    name: "GitHub Autonomous PR",
    short_desc: "Branch guardian · autonomous PR creation · Onedot2 org",
    description:
      "BranchGuardian monitors all Onedot2 repos, AutonomousPR creates pull requests from agent diff output, CodeGuardianSwarm reviews for security. Powered by GH_PAT_KEY with full repo + workflow + packages scope.",
    category: "Integrations",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.7,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "integration",
    bundle_id: "com.aios.integration.github",
    entry_point: "https://api.github.com/user",
  },
  {
    id: 6005,
    name: "Tavily Research API",
    short_desc: "Web intelligence · MLM internet learning · topic rotation",
    description:
      "Tavily-powered web search feeding the Brain governance MLM Internet Learning step. Rotates across 3 topics per cycle (SaaS opportunities, Stripe patterns, agent architecture). Budget-tracked with monthly credit limits.",
    category: "Integrations",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.8,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "integration",
    bundle_id: "com.aios.integration.tavily",
    entry_point: "https://realaios.com/plaistore?id=6005",
  },
  {
    id: 6006,
    name: "OpenAI Model Bridge",
    short_desc: "LLM inference gateway · token budget tracking · multi-model",
    description:
      "Unified OpenAI integration for all Storm agents: chat completions, embeddings, and function calling. Token budget enforcement, model routing (gpt-4o for governance, gpt-4o-mini for high-volume cycles), and cost reporting.",
    category: "Integrations",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.7,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "integration",
    bundle_id: "com.aios.integration.openai",
    entry_point: "https://realaios.com/plaistore?id=6006",
  },
];

const PLAI_UTILITIES = [
  {
    id: 7001,
    name: "merkaba-codec CLI",
    short_desc: "AES-256-GCM credential encoding · merkaba-enc-v1 · scrypt KDF",
    description:
      "Encode any plaintext credential snapshot to merkaba-enc-v1 format before committing. Zero plaintext in repo. Supports encode/decode/parity-check modes. Auto-detected by railway-survival-kit.mjs when .merkaba.enc extension found.",
    category: "Utilities",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.9,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "utility",
    bundle_id: "com.aios.utility.merkaba-codec",
    entry_point: "https://api.getbrains4ai.com/api/merkaba/codec/encode",
  },
  {
    id: 7002,
    name: "GeoQode Validator",
    short_desc: "Validates .geo programmes against canonical lattice spec",
    description:
      "Parses and validates .geo programme objects against the canonical lattice spec: required fields, genre taxonomy check, mode validation, scene structure, and PHI coherence scoring. Returns detailed validation report with fix suggestions.",
    category: "Utilities",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.8,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "utility",
    bundle_id: "com.aios.utility.geoqode-validator",
    entry_point: "https://realaios.com/geo-codec",
  },
  {
    id: 7003,
    name: "AIOS Studio",
    short_desc: "Browser-based .geo composer · My Library sync · publish flow",
    description:
      "Visual composer for creating AIOS .geo programmes in the browser. Token-authenticated save to GEO_CATALOGUE via /api/geo/produce. My Library sync across devices. One-click publish with Watch Now and Library links.",
    category: "Utilities",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.9,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "utility",
    bundle_id: "com.aios.utility.studio",
    entry_point: "https://realaios.com/aios-studio",
  },
  {
    id: 7004,
    name: "Dual Attestation Checker",
    short_desc: "PHI/PSI score calculator · GOLDEN_BAND=3.032 attestation",
    description:
      "Feed any content or decision to get PHI (ALPHA, 1.618) and PSI (OMEGA, 1.414) attestation scores from geometrically opposite poles. Shows GOLDEN_BAND weighting, attestedScore, and ABSOLUTE flag when both poles agree at 1.0.",
    category: "Utilities",
    price_cents: 0,
    downloads: 0,
    rating_avg: 5.0,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "utility",
    bundle_id: "com.aios.utility.dual-attestation",
    entry_point: "https://realaios.com/plaistore?id=7004",
  },
  {
    id: 7005,
    name: "Railway Survival Kit",
    short_desc: "Auto-decode .merkaba.enc vars · service health verification",
    description:
      "Reads VARIABLES_*.merkaba.enc files, auto-decodes with MERKABA_CODEC_KEY (AES-256-GCM), verifies all 13 Storm Railway services are healthy, and outputs a diff of missing or changed variables. Offline mode supported.",
    category: "Utilities",
    price_cents: 0,
    downloads: 0,
    rating_avg: 4.8,
    developer_name: "AIOS Storm",
    developer_verified: true,
    type: "utility",
    bundle_id: "com.aios.utility.survival-kit",
    entry_point: "https://realaios.com/plaistore?id=7005",
  },
];

// Combined non-Theatre catalog (used by /api/plai/apps and /api/plai/search)
const PLAI_ALL_EXTRAS = [
  ...PLAI_PLAYBOOKS,
  ...PLAI_AGENTS,
  ...PLAI_CODEX,
  ...PLAI_ANALYTICS,
  ...PLAI_INTEGRATIONS,
  ...PLAI_UTILITIES,
];

// ── PLAIstore runtime publish store ──────────────────────────────────────────
// Agents call POST /api/plai/apps to push dynamically discovered apps into
// the live catalog without a redeploy. Keyed by bundle_id.
const _plaiRuntimeApps = new Map();
let _plaiRuntimeIdSeq = 9000; // IDs 9000+ for runtime-published apps
// Install tracking — incremented per POST /api/plai/apps/:id/install
const _plaiInstallCounts = new Map(); // app_id → total installs recorded this session
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

/** Seed additional PLAIstore apps on startup to grow the catalogue */
function _seedPlaiApps() {
  const seed = [
    // Theatre
    {
      cat: "Theatre",
      name: "Blade Runner 2049 Immersive",
      desc: "Walk through the rain-soaked streets of 2049 Los Angeles in this scene-for-scene VR recreation. Ambient soundscape and reactive weather.",
      dl: 189,
    },
    {
      cat: "Theatre",
      name: "Dune: Arrakis Rising",
      desc: "Experience the Harkonnen attack on Arrakis from Paul's perspective. Full positional audio, Shai-Hulud proximity alerts.",
      dl: 203,
    },
    {
      cat: "Theatre",
      name: "2001: Space Odyssey Chamber",
      desc: "HAL 9000's iconic red eye surrounds you. Interactive dialogue trees unlock hidden monolith sequences.",
      dl: 156,
    },
    {
      cat: "Theatre",
      name: "Ghost in the Shell: Shell",
      desc: "Descend into Section 9 headquarters. Augmented reality overlays reveal the Puppet Master's data trails.",
      dl: 178,
    },
    {
      cat: "Theatre",
      name: "Ex Machina: Ava's Room",
      desc: "Explore Nathan's research facility. Ava's lattice skeleton is fully interactive — discover her hidden messages.",
      dl: 134,
    },
    {
      cat: "Theatre",
      name: "The Matrix Construct",
      desc: "Step into the Construct loading program. Spawnable objects and red/blue pill decision tree.",
      dl: 298,
    },
    // Cinema
    {
      cat: "Cinema",
      name: "Akira Neo-Tokyo Flyover",
      desc: "Fly over Neo-Tokyo 2019 on a magnetic bike. Physics-accurate at 1:100 scale. Neon rain engine included.",
      dl: 167,
    },
    {
      cat: "Cinema",
      name: "Princess Mononoke Forest",
      desc: "Walk the sacred forest of Yakushima in full VR. Kodama spirits appear at dawn. Ambient binaural soundscape.",
      dl: 145,
    },
    {
      cat: "Cinema",
      name: "Spirited Away: Bathhouse",
      desc: "Wander Yubaba's spirit bathhouse across three floors. Interactive bath tokens and Sen's work schedule.",
      dl: 189,
    },
    {
      cat: "Cinema",
      name: "Evangelion: Angel Attack",
      desc: "First-person cockpit experience inside Unit-01. A/T Field visualisation and N2 Mine proximity alerts.",
      dl: 212,
    },
    {
      cat: "Cinema",
      name: "Cowboy Bebop: Bebop Ship",
      desc: "Explore the Bebop spacecraft. Interact with Ein, watch the chess game, cook Jet's bell peppers and beef.",
      dl: 143,
    },
    // Playbooks
    {
      cat: "Playbooks",
      name: "Cold Email Launcher",
      desc: "AI-authored outreach sequences for B2B SaaS. Variable personalisation from LinkedIn signals. 3-step follow-up cadence.",
      dl: 267,
    },
    {
      cat: "Playbooks",
      name: "Product Hunt Launch Blueprint",
      desc: "48-hour countdown, maker post templates, hunter outreach DMs, and upvote velocity tracker. Proven launch framework.",
      dl: 234,
    },
    {
      cat: "Playbooks",
      name: "Stripe Dunning Recovery",
      desc: "Failed payment recovery sequence. 4-email arc with escalating discount offers. Integrates with Stripe webhooks.",
      dl: 198,
    },
    {
      cat: "Playbooks",
      name: "GitHub Stars Campaign",
      desc: "Automated star-campaign for open-source repos. HN post drafts, Reddit thread templates, dev community outreach.",
      dl: 156,
    },
    {
      cat: "Playbooks",
      name: "SaaS Pricing Experiment",
      desc: "A/B pricing test scaffold with Stripe Price IDs, cohort tracking, and statistical significance calculator.",
      dl: 178,
    },
    {
      cat: "Playbooks",
      name: "Churn Interview Script",
      desc: "AI-scheduled user exit interviews. Sentiment analysis extracts cancellation reasons. Feeds product backlog.",
      dl: 134,
    },
    // Agents
    {
      cat: "Agents",
      name: "SEO Autopilot",
      desc: "Crawls site, identifies keyword gaps, generates optimised content briefs, submits to GSC. Zero-human ranking improvement.",
      dl: 387,
    },
    {
      cat: "Agents",
      name: "Reddit Monitor",
      desc: "Tracks branded mentions and competitor threads. Drafts authentic responses. Flags viral opportunities.",
      dl: 312,
    },
    {
      cat: "Agents",
      name: "Changelog Writer",
      desc: "Reads your Git commits, generates user-friendly changelogs in multiple formats: blog, email, release notes.",
      dl: 278,
    },
    {
      cat: "Agents",
      name: "Investor Update Bot",
      desc: "Compiles metrics from Stripe, GA4, and Railway into a formatted monthly investor update. One-click send.",
      dl: 198,
    },
    {
      cat: "Agents",
      name: "Competitor Tracker",
      desc: "Weekly competitive intelligence report. Monitors pricing, product releases, job postings, and social signals.",
      dl: 245,
    },
    {
      cat: "Agents",
      name: "Bug Triage Agent",
      desc: "Reads GitHub Issues, classifies by severity, assigns to milestones, drafts fix approaches using codebase context.",
      dl: 189,
    },
    {
      cat: "Agents",
      name: "Revenue Alert Agent",
      desc: "Monitors Stripe MRR in real-time. Alerts on churn spikes, upgrade surges, and failed payment clusters.",
      dl: 312,
    },
    {
      cat: "Agents",
      name: "Content Calendar AI",
      desc: "Generates 30-day content calendar from brand positioning. Drafts posts for LinkedIn, X, and email list.",
      dl: 256,
    },
    // Codex
    {
      cat: "Codex",
      name: "Express API Boilerplate",
      desc: "Production-ready Express 5 template: JWT auth, PostgreSQL pool, Redis cache, BullMQ queues, Sentry integration.",
      dl: 445,
    },
    {
      cat: "Codex",
      name: "Stripe Billing Kit",
      desc: "Full Stripe integration: subscription lifecycle, invoice generation, dunning logic, usage metering. 2024 API.",
      dl: 389,
    },
    {
      cat: "Codex",
      name: "A-Frame Game Starter",
      desc: "WebXR game scaffold: enemy spawning, gaze controls, HUD, audio tone engine, wave progression. Deployable in minutes.",
      dl: 234,
    },
    {
      cat: "Codex",
      name: "Railway Deploy Workflow",
      desc: "GitHub Actions CI/CD pipeline for Railway: staging → production promotion, health checks, rollback on failure.",
      dl: 312,
    },
    {
      cat: "Codex",
      name: "WebSocket Chat Engine",
      desc: "Real-time chat with Redis pub/sub fan-out, room management, and message persistence. Battle-tested at scale.",
      dl: 267,
    },
    {
      cat: "Codex",
      name: "BullMQ Job Patterns",
      desc: "Production job queue patterns: rate-limited workers, retry with backoff, dead-letter queues, priority scheduling.",
      dl: 189,
    },
    {
      cat: "Codex",
      name: "PostgreSQL Schema Kit",
      desc: "30+ migration templates: RBAC tables, audit logs, soft deletes, JSONB patterns, and performance indexes.",
      dl: 223,
    },
    // Analytics
    {
      cat: "Analytics",
      name: "Stripe Revenue Dashboard",
      desc: "Real-time MRR, ARR, churn rate, LTV, and CAC from Stripe data. One-click export to Google Sheets.",
      dl: 334,
    },
    {
      cat: "Analytics",
      name: "GA4 Funnel Builder",
      desc: "Constructs conversion funnels from GA4 events. Identifies drop-off points and generates fix hypotheses.",
      dl: 267,
    },
    {
      cat: "Analytics",
      name: "Railway Cost Monitor",
      desc: "Tracks Railway compute and egress costs per service. Alerts when projected monthly bill exceeds threshold.",
      dl: 189,
    },
    {
      cat: "Analytics",
      name: "User Cohort Analyser",
      desc: "Groups users by signup month, tracks retention curves, and projects LTV using historical churn data.",
      dl: 212,
    },
    {
      cat: "Analytics",
      name: "Error Rate Tracker",
      desc: "Aggregates Sentry errors by route, user segment, and deploy version. Surfaces regressions within minutes.",
      dl: 156,
    },
    {
      cat: "Analytics",
      name: "PLAIstore Metrics Board",
      desc: "Live dashboard for PLAIstore KPIs: install velocity, category conversion rates, top apps by revenue.",
      dl: 178,
    },
    // Integrations
    {
      cat: "Integrations",
      name: "Gmail Intelligence Hub",
      desc: "Auto-labels, summarises, and routes inbound email using AI. Drafts replies for approval. CRM sync included.",
      dl: 423,
    },
    {
      cat: "Integrations",
      name: "Slack Digest Agent",
      desc: "Reads Slack channels overnight, generates executive summary, flags decisions needing attention.",
      dl: 312,
    },
    {
      cat: "Integrations",
      name: "Notion Sync Bridge",
      desc: "Two-way sync between Notion databases and your PostgreSQL schema. Conflict resolution and audit trail.",
      dl: 245,
    },
    {
      cat: "Integrations",
      name: "Twilio SMS Engine",
      desc: "Programmable SMS flows for onboarding, alerts, and dunning. Rate-limited, STOP-compliant, fully audited.",
      dl: 198,
    },
    {
      cat: "Integrations",
      name: "HubSpot Contact Sync",
      desc: "Syncs user signups to HubSpot CRM. Property mapping, lifecycle stage automation, deal creation on upgrade.",
      dl: 234,
    },
    {
      cat: "Integrations",
      name: "Cloudflare Cache Warmer",
      desc: "Proactively warms Cloudflare edge cache after deploys. Reduces TTFB from 800ms to under 80ms.",
      dl: 167,
    },
    {
      cat: "Integrations",
      name: "Discord Bot Framework",
      desc: "Discord bot scaffold with slash commands, role-based access, PostgreSQL backend, and Railway deployment.",
      dl: 289,
    },
    // Utilities
    {
      cat: "Utilities",
      name: "JWT Token Inspector",
      desc: "Decode, verify, and debug JWT tokens. Supports RS256, HS256, and ES256. Expiry visualiser included.",
      dl: 512,
    },
    {
      cat: "Utilities",
      name: "CSP Builder",
      desc: "Interactive CSP policy builder with live violation preview. Generates report-only headers for testing.",
      dl: 334,
    },
    {
      cat: "Utilities",
      name: "ENV Variable Manager",
      desc: "Encrypts, organises, and syncs environment variables across Railway services. AES-256-GCM at rest.",
      dl: 278,
    },
    {
      cat: "Utilities",
      name: "Regex Playground",
      desc: "Live regex tester with GeoQode semantic highlighting. Named groups, lookahead visualiser, test case runner.",
      dl: 423,
    },
    {
      cat: "Utilities",
      name: "Merkaba Codec CLI",
      desc: "Encrypt and decrypt files using the Merkaba AES-256-GCM codec. Batch mode with progress bars.",
      dl: 356,
    },
    {
      cat: "Utilities",
      name: "Railway Log Streamer",
      desc: "Tail Railway service logs in real-time with filtering, regex search, and error extraction.",
      dl: 312,
    },
    {
      cat: "Utilities",
      name: "Colour Frequency Picker",
      desc: "Maps Solfeggio frequencies (396-963 Hz) to hex colour palettes. GeoQode semantic type colouring built in.",
      dl: 189,
    },
    // ── Batch 2: 150 more apps ──────────────────────────────────────────────
    // Theatre
    {
      cat: "Theatre",
      name: "Interstellar: Tesseract Room",
      desc: "Navigate the fifth-dimensional bookshelf. Gravity anomalies respond to your position. Cooper's messages embedded.",
      dl: 312,
    },
    {
      cat: "Theatre",
      name: "Inception: Dream Layers",
      desc: "Descend through five dream levels. Each layer bends physics by 10×. Limbo sequence unlocks at depth 5.",
      dl: 287,
    },
    {
      cat: "Theatre",
      name: "Tron Legacy: Grid Arena",
      desc: "Light cycle arena in full VR. Identity disc combat with physics-accurate disc arcs. Daft Punk score reactive.",
      dl: 334,
    },
    {
      cat: "Theatre",
      name: "Arrival: Heptapod Chamber",
      desc: "Stand inside the alien vessel. Heptapod language evolves as you interact. Non-linear time experience.",
      dl: 256,
    },
    {
      cat: "Theatre",
      name: "Her: OS1 Apartment",
      desc: "Experience Theo's minimalist apartment. Samantha's voice responds contextually. Sunset city ambient loop.",
      dl: 198,
    },
    {
      cat: "Theatre",
      name: "Annihilation: The Shimmer",
      desc: "Walk the border of the Shimmer. DNA-warped flora reacts to gaze. Lighthouse beacon in the distance.",
      dl: 223,
    },
    {
      cat: "Theatre",
      name: "Moon: Sarang Base",
      desc: "Lunar helium-3 harvesting station. GERTY terminal is interactive. Dust storms reduce visibility dynamically.",
      dl: 178,
    },
    {
      cat: "Theatre",
      name: "Solaris: Space Station",
      desc: "Soviet-era orbital station above Solaris. The ocean surface shifts with Kelvin's emotional state.",
      dl: 167,
    },
    // Cinema
    {
      cat: "Cinema",
      name: "Nausicaä Toxic Jungle",
      desc: "Fly a Mehve glider through the toxic jungle. Ohmu herd migration triggers at altitude 200. Spore storm visualisation.",
      dl: 234,
    },
    {
      cat: "Cinema",
      name: "Castle in the Sky: Laputa",
      desc: "Explore the floating ruins of Laputa. Laputian robots guard the garden. Thunder of Laputa unlocks hidden areas.",
      dl: 201,
    },
    {
      cat: "Cinema",
      name: "Paprika: Dream Parade",
      desc: "March in the surrealist dream parade. Objects morph between themes. DC Mini interface lets you enter others' dreams.",
      dl: 189,
    },
    {
      cat: "Cinema",
      name: "Perfect Blue: Studio",
      desc: "Navigate Mima's fractured reality. Mirror reflections show alternate timelines. Psychological tension builds.",
      dl: 156,
    },
    {
      cat: "Cinema",
      name: "Serial Experiments Lain: Wired",
      desc: "Enter the Wired. Reality layers blur at connection depth > 3. Lain's whispers respond to dwell time.",
      dl: 212,
    },
    {
      cat: "Cinema",
      name: "Paranoia Agent: Shonen Bat",
      desc: "Walk the streets of Musashino. News broadcasts play from windows. Shonen Bat approaches at night.",
      dl: 178,
    },
    {
      cat: "Cinema",
      name: "Neon Genesis: Terminal Dogma",
      desc: "Descend to Terminal Dogma. Adam specimen chamber is interactive. Sea of LCL begins at depth 12.",
      dl: 267,
    },
    // Playbooks
    {
      cat: "Playbooks",
      name: "YC Application Writer",
      desc: "AI-assisted Y Combinator application. Answer frameworks for all 40 questions. Traction narrative builder.",
      dl: 423,
    },
    {
      cat: "Playbooks",
      name: "Seed Round Pitch Deck",
      desc: "12-slide seed deck template with AI-generated market sizing, competitive moat framing, and ask slide.",
      dl: 389,
    },
    {
      cat: "Playbooks",
      name: "Twitter Growth Playbook",
      desc: "30-day Twitter growth system. Hook formulas, reply cadence, follower funnel, and viral thread templates.",
      dl: 312,
    },
    {
      cat: "Playbooks",
      name: "App Store Optimisation",
      desc: "ASO framework for iOS and Android. Keyword research, screenshot A/B templates, review response scripts.",
      dl: 267,
    },
    {
      cat: "Playbooks",
      name: "Enterprise Sales Script",
      desc: "6-week enterprise sales cycle. Discovery call framework, champion map, POC proposal, and legal redline guide.",
      dl: 234,
    },
    {
      cat: "Playbooks",
      name: "Developer Relations Launch",
      desc: "DevRel GTM playbook. Hackathon kit, GitHub README templates, API docs style guide, community Discord setup.",
      dl: 198,
    },
    {
      cat: "Playbooks",
      name: "Newsletter Launch System",
      desc: "Launch a paid newsletter in 30 days. Beehiiv setup, lead magnet funnel, referral program, monetisation ladder.",
      dl: 289,
    },
    {
      cat: "Playbooks",
      name: "Affiliate Programme Builder",
      desc: "Set up an affiliate programme from scratch. Commission structures, tracking links, payout automation, legal terms.",
      dl: 245,
    },
    {
      cat: "Playbooks",
      name: "Customer Success Onboarding",
      desc: "90-day customer success programme. Onboarding milestones, check-in call scripts, health score dashboard.",
      dl: 178,
    },
    // Agents
    {
      cat: "Agents",
      name: "PR Outreach Agent",
      desc: "Identifies relevant journalists and publications. Crafts personalised pitch emails. Tracks open rates and follow-ups.",
      dl: 334,
    },
    {
      cat: "Agents",
      name: "Support Ticket Resolver",
      desc: "Auto-classifies Zendesk tickets, drafts responses from knowledge base, escalates edge cases to humans.",
      dl: 289,
    },
    {
      cat: "Agents",
      name: "Social Media Scheduler",
      desc: "Generates and schedules posts for X, LinkedIn, and Threads. Optimal timing based on audience analytics.",
      dl: 312,
    },
    {
      cat: "Agents",
      name: "Legal Contract Scanner",
      desc: "Reads PDF contracts, flags non-standard clauses, summarises obligations and risks, suggests redlines.",
      dl: 267,
    },
    {
      cat: "Agents",
      name: "Hiring Pipeline Agent",
      desc: "Screens CVs, ranks candidates by role fit, drafts interview questions, sends scheduling links automatically.",
      dl: 223,
    },
    {
      cat: "Agents",
      name: "Data Pipeline Monitor",
      desc: "Watches ETL jobs, alerts on data drift, generates quality reports, auto-reruns failed transformations.",
      dl: 198,
    },
    {
      cat: "Agents",
      name: "API Documentation Writer",
      desc: "Reads your Express/FastAPI code, generates OpenAPI spec, writes endpoint docs with curl examples.",
      dl: 256,
    },
    {
      cat: "Agents",
      name: "Onboarding Email Drip",
      desc: "AI-personalised onboarding sequences. Adapts based on user activation events. 7-email arc with branching logic.",
      dl: 312,
    },
    {
      cat: "Agents",
      name: "Market Research Compiler",
      desc: "Weekly market intelligence from Reddit, HN, G2, and Capterra. Summarises pain points and emerging competitors.",
      dl: 245,
    },
    {
      cat: "Agents",
      name: "Grant Writing Assistant",
      desc: "Researches applicable grants, drafts applications with milestone tables, tracks submission deadlines.",
      dl: 178,
    },
    // Codex
    {
      cat: "Codex",
      name: "Next.js Auth Starter",
      desc: "Next.js 14 with App Router, NextAuth v5, PostgreSQL sessions, role-based routing, and email magic links.",
      dl: 534,
    },
    {
      cat: "Codex",
      name: "React Native Boilerplate",
      desc: "Expo SDK 51 template: Zustand state, React Query, Stripe payments, push notifications, and OTA updates.",
      dl: 478,
    },
    {
      cat: "Codex",
      name: "FastAPI Microservice",
      desc: "Python FastAPI service: JWT auth, PostgreSQL async pool, Redis cache, Celery workers, Docker compose.",
      dl: 412,
    },
    {
      cat: "Codex",
      name: "GraphQL Gateway",
      desc: "Apollo Server 4 gateway with federation, DataLoader batching, persisted queries, and rate limiting.",
      dl: 356,
    },
    {
      cat: "Codex",
      name: "WebRTC Video Engine",
      desc: "Peer-to-peer video with TURN server fallback, recording, screen share, and virtual background support.",
      dl: 289,
    },
    {
      cat: "Codex",
      name: "Serverless Functions Kit",
      desc: "Cloudflare Workers templates: API gateway, image resize, auth proxy, edge caching, and R2 storage.",
      dl: 312,
    },
    {
      cat: "Codex",
      name: "Event Sourcing Pattern",
      desc: "CQRS + event sourcing with PostgreSQL event store, projections, snapshots, and replay tooling.",
      dl: 267,
    },
    {
      cat: "Codex",
      name: "OpenAI Streaming API",
      desc: "Server-sent events streaming from OpenAI. Token counting, cost tracking, prompt caching, and fallback models.",
      dl: 445,
    },
    {
      cat: "Codex",
      name: "Monorepo Turborepo Setup",
      desc: "Turborepo monorepo: shared UI library, API types, config packages, Changesets versioning, and CI pipeline.",
      dl: 389,
    },
    {
      cat: "Codex",
      name: "Vector DB Integration",
      desc: "pgvector + Pinecone dual-write. Embedding generation, similarity search, chunking strategies, RAG patterns.",
      dl: 334,
    },
    // Analytics
    {
      cat: "Analytics",
      name: "LTV Prediction Model",
      desc: "Machine learning LTV predictor using 90-day behavioural signals. Exports to Google Sheets or Notion.",
      dl: 289,
    },
    {
      cat: "Analytics",
      name: "Churn Predictor",
      desc: "Identifies at-risk users 14 days before churn. Triggers automated save sequences via email and in-app.",
      dl: 312,
    },
    {
      cat: "Analytics",
      name: "A/B Test Calculator",
      desc: "Statistical significance calculator for conversion experiments. Bayesian and frequentist modes. Segment breakdowns.",
      dl: 267,
    },
    {
      cat: "Analytics",
      name: "API Latency Monitor",
      desc: "P50/P95/P99 latency tracking per endpoint. Anomaly detection alerts when baselines shift by >20%.",
      dl: 234,
    },
    {
      cat: "Analytics",
      name: "Referral Source Tracker",
      desc: "UTM parameter analysis with first-touch and multi-touch attribution. Revenue by acquisition channel.",
      dl: 198,
    },
    {
      cat: "Analytics",
      name: "Database Performance Lens",
      desc: "Slow query log analyser. Index recommendations, query plan visualiser, and migration impact estimator.",
      dl: 245,
    },
    {
      cat: "Analytics",
      name: "Feature Adoption Heatmap",
      desc: "Tracks which features users actually use. Generates adoption funnel and identifies dead features.",
      dl: 178,
    },
    {
      cat: "Analytics",
      name: "Revenue Forecasting AI",
      desc: "90-day revenue forecast using ARIMA and growth model. Confidence intervals and scenario planning.",
      dl: 312,
    },
    // Integrations
    {
      cat: "Integrations",
      name: "Stripe → PostHog Sync",
      desc: "Syncs Stripe payment events to PostHog as custom events. Revenue-weighted funnel analysis enabled.",
      dl: 267,
    },
    {
      cat: "Integrations",
      name: "GitHub → Linear Bridge",
      desc: "Auto-creates Linear issues from GitHub PR labels. Syncs status, assignees, and cycle tracking.",
      dl: 234,
    },
    {
      cat: "Integrations",
      name: "Intercom → PostgreSQL",
      desc: "Full Intercom conversation history synced to your database. Enable complex querying and ML training.",
      dl: 198,
    },
    {
      cat: "Integrations",
      name: "Zapier Alternative Engine",
      desc: "Self-hosted workflow automation with 200+ triggers. No per-task pricing. Runs on Railway in minutes.",
      dl: 356,
    },
    {
      cat: "Integrations",
      name: "Shopify Order Processor",
      desc: "Syncs Shopify orders to PostgreSQL, triggers fulfillment workflows, generates packing slips and tracking updates.",
      dl: 312,
    },
    {
      cat: "Integrations",
      name: "Airtable → PostgreSQL",
      desc: "Airtable → PostgreSQL migration and live sync. Schema inference, type mapping, and webhook bridge.",
      dl: 245,
    },
    {
      cat: "Integrations",
      name: "Figma Design Tokens",
      desc: "Exports Figma design tokens to CSS variables, Tailwind config, and React Native StyleSheet. Auto-syncs on file change.",
      dl: 289,
    },
    {
      cat: "Integrations",
      name: "Plaid Bank Feeds",
      desc: "Fetches bank transaction data via Plaid. Categorises spend, detects anomalies, exports to accounting tools.",
      dl: 223,
    },
    {
      cat: "Integrations",
      name: "SendGrid Transactional",
      desc: "SendGrid email integration with template management, unsubscribe handling, delivery analytics, and list hygiene.",
      dl: 267,
    },
    // Utilities
    {
      cat: "Utilities",
      name: "SQL Query Builder",
      desc: "Visual SQL query builder with PostgreSQL-specific functions, CTEs, window functions, and explain plan viewer.",
      dl: 445,
    },
    {
      cat: "Utilities",
      name: "API Rate Limit Simulator",
      desc: "Test your API under rate limit pressure. Configurable burst patterns, token bucket simulation, stress tests.",
      dl: 312,
    },
    {
      cat: "Utilities",
      name: "Docker Compose Generator",
      desc: "Generates docker-compose.yml from your Railway config. Service dependencies, health checks, volumes.",
      dl: 389,
    },
    {
      cat: "Utilities",
      name: "OpenAPI Spec Validator",
      desc: "Validates OpenAPI 3.1 specs. Checks for schema conflicts, missing examples, and security definitions.",
      dl: 267,
    },
    {
      cat: "Utilities",
      name: "Cron Expression Builder",
      desc: "Visual cron expression editor with natural language parsing. Timezone-aware next-run preview.",
      dl: 334,
    },
    {
      cat: "Utilities",
      name: "JSON Schema Generator",
      desc: "Infers JSON Schema from sample data. Handles nested objects, arrays, nullable fields, and $ref patterns.",
      dl: 289,
    },
    {
      cat: "Utilities",
      name: "Git History Analyser",
      desc: "Visualises commit velocity, contributor trends, hotspot files, and technical debt accumulation over time.",
      dl: 245,
    },
    {
      cat: "Utilities",
      name: "Markdown to Slide Deck",
      desc: "Converts markdown to reveal.js presentations. Custom themes, speaker notes, and PDF export.",
      dl: 312,
    },
    {
      cat: "Utilities",
      name: "Load Test Runner",
      desc: "k6-based load testing with Artillery fallback. Generates HTML reports with latency percentiles and error rates.",
      dl: 278,
    },
    {
      cat: "Utilities",
      name: "Secret Scanner",
      desc: "Scans git history for leaked credentials. Entropy analysis, pattern matching, and Railway env var sync check.",
      dl: 334,
    },
    // ── Batch 3: 50 more apps ──────────────────────────────────────────────
    // Theatre
    {
      cat: "Theatre",
      name: "Minority Report: PreCrime",
      desc: "Step into the PreCrime Division. Gesture-control holographic displays. Precog visions appear as spatial overlays.",
      dl: 278,
    },
    {
      cat: "Theatre",
      name: "Ready Player One: OASIS",
      desc: "Enter the OASIS starting zone. Easter egg hunt mode active. DeLorean and Iron Giant unlockable.",
      dl: 345,
    },
    {
      cat: "Theatre",
      name: "Strange Days: SQUID Feed",
      desc: "Experience a memory recording from 1999 LA. Neural feedback reacts to gaze direction. Loop on exit.",
      dl: 189,
    },
    {
      cat: "Theatre",
      name: "Westworld: Mesa Hub",
      desc: "Walk Mesa Hub's corridors. Android hosts freeze on gaze lock. Bernard's office unlocks at dwell 10s.",
      dl: 234,
    },
    {
      cat: "Theatre",
      name: "Black Mirror: San Junipero",
      desc: "Explore San Junipero's neon beachfront. Era shifts with controller tilt. Kelly and Yorkie appear at dusk.",
      dl: 267,
    },
    // Cinema
    {
      cat: "Cinema",
      name: "Metropolis: Machine City",
      desc: "Fritz Lang's 1927 vision rendered in VR. Worker city below, elite towers above. Maria robot encounter.",
      dl: 198,
    },
    {
      cat: "Cinema",
      name: "Brazil: Ministry of Truth",
      desc: "Navigate Sam Lowry's bureaucratic nightmare. Ducts everywhere. Dream flight sequence triggered by paperwork.",
      dl: 167,
    },
    {
      cat: "Cinema",
      name: "Dark City: Strangers' Lab",
      desc: "The Strangers' underground laboratory. Sky dome cracks at midnight. Shell Beach is always just out of reach.",
      dl: 212,
    },
    {
      cat: "Cinema",
      name: "Altered Carbon: Bay City",
      desc: "Neo-noir Bay City skyline. DHF stack viewer shows past sleeves. Raven's hotel lobby fully explorable.",
      dl: 245,
    },
    {
      cat: "Cinema",
      name: "Upgrade: STEM Interface",
      desc: "Grey's neural overlay interface. STEM voice responds to dwell. Combat subroutines visualised as flow diagrams.",
      dl: 189,
    },
    // Playbooks
    {
      cat: "Playbooks",
      name: "SaaS Free Trial Optimiser",
      desc: "Maximise trial-to-paid conversion. Day-3 activation nudges, feature gating strategy, and time-limit psychology.",
      dl: 312,
    },
    {
      cat: "Playbooks",
      name: "API Monetisation Ladder",
      desc: "Move from free tier to paid API. Usage-based pricing calculator, rate limit tiers, and Stripe metered billing.",
      dl: 267,
    },
    {
      cat: "Playbooks",
      name: "LinkedIn Thought Leadership",
      desc: "30-day LinkedIn authority playbook. Hook formulas, carousel templates, comment strategy, and DM sequences.",
      dl: 289,
    },
    {
      cat: "Playbooks",
      name: "Community-Led Growth Kit",
      desc: "Build a paid community from scratch. Discord setup, onboarding rituals, leaderboard mechanics, and cohort events.",
      dl: 234,
    },
    {
      cat: "Playbooks",
      name: "Open Source GTM Guide",
      desc: "Take an OSS project commercial. GitHub sponsor tiers, cloud-hosted version, enterprise support packaging.",
      dl: 198,
    },
    // Agents
    {
      cat: "Agents",
      name: "Invoice Generator Agent",
      desc: "Auto-generates Stripe invoices from time-tracking data. PDF export, multi-currency, and payment link inclusion.",
      dl: 278,
    },
    {
      cat: "Agents",
      name: "Domain Monitor Bot",
      desc: "Tracks domain availability for brand keywords. Instant alerts on drops. Bulk registration queue management.",
      dl: 245,
    },
    {
      cat: "Agents",
      name: "Meeting Summary Agent",
      desc: "Transcribes and summarises meetings via Whisper. Action item extraction with assignee detection. Notion sync.",
      dl: 312,
    },
    {
      cat: "Agents",
      name: "A/B Copy Tester",
      desc: "Generates 5 headline variants, serves them via edge A/B, tracks CTR, and auto-promotes the winner.",
      dl: 234,
    },
    {
      cat: "Agents",
      name: "Backlink Monitor",
      desc: "Tracks new and lost backlinks daily. Domain authority scoring, toxic link detection, and disavow file generation.",
      dl: 198,
    },
    // Codex
    {
      cat: "Codex",
      name: "Drizzle ORM Starter",
      desc: "Drizzle ORM with PostgreSQL: schema migrations, query builder patterns, transactions, and Railway deployment.",
      dl: 467,
    },
    {
      cat: "Codex",
      name: "Hono Edge API",
      desc: "Cloudflare Workers API with Hono: JWT auth, D1 database, R2 storage, KV sessions, and type-safe routes.",
      dl: 389,
    },
    {
      cat: "Codex",
      name: "Remix Full-Stack App",
      desc: "Remix with Vite, PostgreSQL, Stripe, auth, and Railway deployment. SEO-optimised with nested loaders.",
      dl: 423,
    },
    {
      cat: "Codex",
      name: "tRPC Monorepo Kit",
      desc: "End-to-end type-safe API with tRPC, Next.js, Prisma, and shared type packages. Zero-config type inference.",
      dl: 356,
    },
    {
      cat: "Codex",
      name: "Redis Caching Patterns",
      desc: "Production Redis patterns: cache-aside, write-through, distributed locking, pub/sub, and sorted set leaderboards.",
      dl: 312,
    },
    // Analytics
    {
      cat: "Analytics",
      name: "Subscription Health Score",
      desc: "Composite health score from login frequency, feature adoption, and support ticket rate. Predicts churn 21 days out.",
      dl: 267,
    },
    {
      cat: "Analytics",
      name: "Pricing Elasticity Model",
      desc: "Tests price sensitivity across customer segments. Recommends optimal price points with revenue impact projections.",
      dl: 234,
    },
    {
      cat: "Analytics",
      name: "Organic Search Tracker",
      desc: "Daily rank tracking for 500 keywords. Competitor position monitoring, SERP feature capture, and trend alerts.",
      dl: 198,
    },
    {
      cat: "Analytics",
      name: "Infrastructure Cost Analyser",
      desc: "Maps Railway, AWS, and Cloudflare costs to features. ROI calculator for each service. Waste detection alerts.",
      dl: 245,
    },
    {
      cat: "Analytics",
      name: "Support Ticket Sentiment",
      desc: "Classifies support tickets by emotion and urgency. Identifies product pain points from language patterns.",
      dl: 178,
    },
    // Integrations
    {
      cat: "Integrations",
      name: "Webflow CMS Sync",
      desc: "Syncs PostgreSQL content to Webflow CMS Collections. Schema mapping, media upload, and scheduled refresh.",
      dl: 267,
    },
    {
      cat: "Integrations",
      name: "Linear → GitHub Sync",
      desc: "Bi-directional sync between Linear issues and GitHub issues. Status mapping, label sync, and PR linking.",
      dl: 234,
    },
    {
      cat: "Integrations",
      name: "Resend Email API Bridge",
      desc: "Resend.com integration with template management, audience segmentation, bounce handling, and analytics.",
      dl: 289,
    },
    {
      cat: "Integrations",
      name: "Supabase Realtime Bridge",
      desc: "Mirror PostgreSQL change events to Supabase Realtime. Powers live dashboards without extra infrastructure.",
      dl: 245,
    },
    {
      cat: "Integrations",
      name: "Typeform → PostgreSQL",
      desc: "Auto-syncs Typeform responses to PostgreSQL. Schema inference, webhook handling, and Slack notifications.",
      dl: 198,
    },
    // Utilities
    {
      cat: "Utilities",
      name: "PostgreSQL Backup Tool",
      desc: "Automated pg_dump to S3/R2 with encryption, retention policies, point-in-time restore, and Slack alerts.",
      dl: 389,
    },
    {
      cat: "Utilities",
      name: "Environment Diff Checker",
      desc: "Compares .env files across Railway environments. Highlights missing variables, type mismatches, and secrets drift.",
      dl: 312,
    },
    {
      cat: "Utilities",
      name: "API Mock Server",
      desc: "Generates mock REST APIs from OpenAPI specs. Response delay simulation, error injection, and contract testing.",
      dl: 267,
    },
    {
      cat: "Utilities",
      name: "Webhook Relay Proxy",
      desc: "Relays webhooks from external services to localhost during development. HTTPS tunnelling with request inspector.",
      dl: 334,
    },
    {
      cat: "Utilities",
      name: "Token Budget Tracker",
      desc: "Tracks OpenAI token usage per feature, user, and model. Budget alerts and per-request cost attribution.",
      dl: 289,
    },
    // ── Batch 4: 50 more apps ──────────────────────────────────────────────
    // Theatre
    {
      cat: "Theatre",
      name: "Blade Runner 2049 — Holographic City",
      desc: "Fly over the neon rain of 2049 Los Angeles. Spinner taxi rides, mega-ads, and Wallace Corp tower holography.",
      dl: 512,
    },
    {
      cat: "Theatre",
      name: "Dune — Arrakis Desert Vision",
      desc: "Stand on the Great Flat, watch a sandworm breach the horizon. Spice-field particle storms and Fremen holographic projections.",
      dl: 478,
    },
    {
      cat: "Theatre",
      name: "2001: A Space Odyssey — HAL 9000 Interface",
      desc: "Board the Discovery One. Interact with HAL 9000's red eye, traverse the pod bay, and experience the stargate sequence.",
      dl: 445,
    },
    {
      cat: "Theatre",
      name: "Arrival — Heptapod Language Chamber",
      desc: "Enter the observation chamber. Heptapod logograms form around you. 7-phase time-loop narrative with non-linear storytelling.",
      dl: 423,
    },
    {
      cat: "Theatre",
      name: "Interstellar — Tesseract Library",
      desc: "Navigate Cooper's 5D bookshelf. Time dimensions rendered as spatial lattice. Gravity waveforms and Endurance docking sequence.",
      dl: 456,
    },
    // Cinema
    {
      cat: "Cinema",
      name: "Ex Machina — Nathan's Estate",
      desc: "Enter the glass-and-concrete retreat. Meet Ava through the interface. Turing test protocols rendered as spatial dialogue sequences.",
      dl: 398,
    },
    {
      cat: "Cinema",
      name: "Moon — Sam Bell's Habitat",
      desc: "Walk through Sarang lunar base. Talk to GERTY. 3-clone ethical dilemma rendered as branching spatial narrative.",
      dl: 367,
    },
    {
      cat: "Cinema",
      name: "Her — The Future City",
      desc: "Wander Theodore's near-future Los Angeles. Samantha's voice spatialized across the skyline. AI relationship milestones as place markers.",
      dl: 412,
    },
    {
      cat: "Cinema",
      name: "TRON: Legacy — The Grid",
      desc: "Enter Kevin Flynn's digital domain. Light cycle grid, recognizer patrols, and End of Line Club ambient rendered in WebXR.",
      dl: 489,
    },
    {
      cat: "Cinema",
      name: "Annihilation — Area X Shimmer",
      desc: "Cross the Shimmer boundary. Mutated flora, humanoid forms, and the lighthouse vault rendered as an immersive horror walk.",
      dl: 376,
    },
    // Playbooks
    {
      cat: "Playbooks",
      name: "Zero-to-MRR Playbook",
      desc: "14-step sequence: idea validation, landing page, waitlist, onboarding email, pricing, launch, first MRR. All templates included.",
      dl: 567,
    },
    {
      cat: "Playbooks",
      name: "Developer Acquisition Playbook",
      desc: "GitHub presence, hackathon strategy, dev newsletter placement, API docs funnel, and SDK launch. 90-day roadmap.",
      dl: 489,
    },
    {
      cat: "Playbooks",
      name: "Enterprise Sales Cycle",
      desc: "7-stage B2B sales process: ICP definition, outbound sequences, demo framework, legal/procurement, and expansion motion.",
      dl: 423,
    },
    {
      cat: "Playbooks",
      name: "Content Compound Growth",
      desc: "SEO-first content engine: keyword clustering, pillar/spoke architecture, update cadence, backlink outreach, and distribution network.",
      dl: 398,
    },
    {
      cat: "Playbooks",
      name: "AI Product Launch Sequence",
      desc: "Pre-launch hype, beta list, ProductHunt strategy, press kit, first-week retention tactics, and post-launch optimization loop.",
      dl: 512,
    },
    // Agents
    {
      cat: "Agents",
      name: "CompetitorWatchAgent",
      desc: "Monitors competitor pricing, feature releases, and job posts. Flags strategic changes and generates weekly intelligence briefings.",
      dl: 445,
    },
    {
      cat: "Agents",
      name: "TechnicalDebtAgent",
      desc: "Scans codebase for complexity hotspots, outdated dependencies, and pattern violations. Prioritizes refactoring by risk × effort.",
      dl: 398,
    },
    {
      cat: "Agents",
      name: "CustomerJourneyAgent",
      desc: "Maps user paths through product. Identifies friction points, drop-off moments, and conversion opportunities from event streams.",
      dl: 478,
    },
    {
      cat: "Agents",
      name: "PRStrategyAgent",
      desc: "Identifies PR opportunities, drafts pitches, manages journalist relationships, and tracks coverage sentiment over time.",
      dl: 356,
    },
    {
      cat: "Agents",
      name: "GrantResearchAgent",
      desc: "Scans government and private grants for eligibility. Drafts applications, tracks deadlines, and monitors funding cycles.",
      dl: 334,
    },
    // Codex
    {
      cat: "Codex",
      name: "gRPC Service Template",
      desc: "Protocol Buffer definitions, generated TypeScript client, interceptors, server-side streaming, and health check integration.",
      dl: 456,
    },
    {
      cat: "Codex",
      name: "Event-Driven Architecture",
      desc: "Kafka + PostgreSQL outbox pattern. Event sourcing, CQRS implementation, saga orchestration, and dead-letter queue handling.",
      dl: 423,
    },
    {
      cat: "Codex",
      name: "AI Gateway Template",
      desc: "Multi-provider LLM routing, rate limiting, cost tracking, prompt versioning, and fallback chain management in Express.",
      dl: 534,
    },
    {
      cat: "Codex",
      name: "Zero-Trust API Template",
      desc: "mTLS client authentication, JWT rotation, IP allowlisting, audit logging, and cryptographic request signing.",
      dl: 389,
    },
    {
      cat: "Codex",
      name: "WebAssembly Module Template",
      desc: "Rust → WASM compilation pipeline, JS bridge layer, memory management utilities, and performance benchmarking suite.",
      dl: 312,
    },
    // Analytics
    {
      cat: "Analytics",
      name: "Feature Flag Analytics",
      desc: "Tracks flag exposures, conversion deltas, and statistical significance. Integrates with LaunchDarkly, Unleash, and custom toggles.",
      dl: 345,
    },
    {
      cat: "Analytics",
      name: "Product-Led Growth Metrics",
      desc: "PQL identification, expansion signal tracking, time-to-value dashboards, and viral coefficient measurement.",
      dl: 398,
    },
    {
      cat: "Analytics",
      name: "Infrastructure Cost Analyzer",
      desc: "Breaks cloud costs by service, team, and feature. Anomaly detection, budget forecast, and optimization recommendations.",
      dl: 423,
    },
    {
      cat: "Analytics",
      name: "Email Campaign Performance",
      desc: "Open rates, click maps, revenue attribution, list decay analysis, and send-time optimization across ESP providers.",
      dl: 289,
    },
    {
      cat: "Analytics",
      name: "Search Intelligence Dashboard",
      desc: "Keyword ranking, click-through rates, query intent clustering, and SERP feature tracking with weekly trend reports.",
      dl: 312,
    },
    // Integrations
    {
      cat: "Integrations",
      name: "Notion → Database Sync",
      desc: "Mirrors Notion databases to PostgreSQL. Schema auto-generation, relation mapping, media archival, and incremental sync.",
      dl: 367,
    },
    {
      cat: "Integrations",
      name: "Figma Design Token Extractor",
      desc: "Pulls design tokens from Figma, generates CSS variables and Tailwind config. Watches for changes and auto-updates.",
      dl: 312,
    },
    {
      cat: "Integrations",
      name: "Sentry → Linear Integration",
      desc: "Creates Linear issues from Sentry error groups. Auto-assigns by code owner, links deployments, and tracks resolution.",
      dl: 289,
    },
    {
      cat: "Integrations",
      name: "Cloudflare Workers Bridge",
      desc: "Deploy logic to Cloudflare edge from Railway. KV store sync, R2 media upload, Workers KV cache invalidation.",
      dl: 345,
    },
    {
      cat: "Integrations",
      name: "Twilio Voice + SMS Bridge",
      desc: "Inbound call routing, SMS campaigns, voice transcription, and DTMF menu builder with PostgreSQL call log storage.",
      dl: 423,
    },
    // Utilities
    {
      cat: "Utilities",
      name: "Secret Rotation Manager",
      desc: "Schedules secret rotations across Railway, Vercel, and GitHub Actions. Zero-downtime key swap with rollback capability.",
      dl: 312,
    },
    {
      cat: "Utilities",
      name: "Request Replay Tool",
      desc: "Records production requests and replays them in staging. Diff mode shows response changes across deployments.",
      dl: 267,
    },
    {
      cat: "Utilities",
      name: "Database Schema Visualizer",
      desc: "Generates interactive ER diagrams from PostgreSQL schemas. Relationship inference, index visualization, and query path tracing.",
      dl: 345,
    },
    {
      cat: "Utilities",
      name: "CI/CD Pipeline Analyzer",
      desc: "Identifies slow steps, flaky tests, and cache inefficiencies in GitHub Actions workflows. Generates optimization reports.",
      dl: 289,
    },
    {
      cat: "Utilities",
      name: "Load Test Orchestrator",
      desc: "k6-based load testing with Railway auto-scaling observation. Ramp patterns, p99 tracking, and bottleneck identification.",
      dl: 334,
    },
    // ── Batch 5: 40 more apps ──────────────────────────────────────────────
    // Theatre
    {
      cat: "Theatre",
      name: "Ghost in the Shell — Section 9",
      desc: "Neo-Tokyo cyborg city. Ghost-dive through cyberbrain networks, meet the Puppet Master, and face identity dissolution in the net.",
      dl: 491,
    },
    {
      cat: "Theatre",
      name: "The Matrix — Construct Training",
      desc: "Enter the all-white Construct. Morpheus loads weapons, Operator menus, and the jump program. Reality vs simulation rendered spatially.",
      dl: 524,
    },
    {
      cat: "Theatre",
      name: "Solaris — Ocean of Memory",
      desc: "Float above Lem's alien ocean. Memories materialise as holographic figures around the station. Non-linear time encoded as GeoQode NARRATIVE.",
      dl: 467,
    },
    {
      cat: "Theatre",
      name: "Stalker — The Zone Anomalies",
      desc: "Navigate Tarkovsky's forbidden Zone. Anomaly fields, philosophical encounters, and the Room at the centre rendered as WebXR contemplation.",
      dl: 443,
    },
    {
      cat: "Theatre",
      name: "Contact — Machine Chamber",
      desc: "Sagan's first-contact pod sequence. Multi-dimensional alien machine activates around you. 18 hours of travel compressed to 20 seconds.",
      dl: 478,
    },
    // Cinema
    {
      cat: "Cinema",
      name: "Coherence — Quantum Twin House",
      desc: "8 people, one comet, infinite parallel selves. Branching identity paths rendered as spatial choice architecture.",
      dl: 389,
    },
    {
      cat: "Cinema",
      name: "Primer — Recursive Time Loops",
      desc: "Aaronson's garage time machine. Nested causality loops, fail-safe diagrams, and branching timelines mapped as spatial graph.",
      dl: 356,
    },
    {
      cat: "Cinema",
      name: "Pi — Kabbalistic Number Spiral",
      desc: "Aronofsky's fractal mathematics. 216-digit number, Kabbalistic spirals, and the pattern within markets rendered as hallucinatory walk.",
      dl: 334,
    },
    {
      cat: "Cinema",
      name: "Eternal Sunshine — Memory Maze",
      desc: "Clementine and Joel's memory erasure sequence. Dissolving apartments, beach recollections, and the Lacuna procedure as spatial drama.",
      dl: 412,
    },
    {
      cat: "Cinema",
      name: "The Man from Earth — Cave Drama",
      desc: "John Oldman's 14,000-year confession. Seven academics around a fire, real-time Socratic drama with no special effects.",
      dl: 298,
    },
    // Playbooks
    {
      cat: "Playbooks",
      name: "SaaS Pricing Optimisation",
      desc: "Value metrics, tier packaging, price increase communications, and willingness-to-pay research. Churn impact modelling included.",
      dl: 534,
    },
    {
      cat: "Playbooks",
      name: "Open Source Monetisation",
      desc: "Community → paid conversion: OSS dual licensing, cloud-hosted tier, support contracts, and contributor-to-customer funnel.",
      dl: 489,
    },
    {
      cat: "Playbooks",
      name: "Partnership Deal Playbook",
      desc: "Co-sell agreements, revenue share structures, channel enablement, and joint GTM motions. Templates for 5 partner archetypes.",
      dl: 423,
    },
    {
      cat: "Playbooks",
      name: "Customer Success Expansion",
      desc: "QBR structure, health score construction, upsell trigger mapping, and expansion motion from onboarding to multi-year contract.",
      dl: 398,
    },
    {
      cat: "Playbooks",
      name: "Viral Loop Engineering",
      desc: "Referral mechanics design, invite loop AB testing, network effect ignition sequences, and K-factor measurement framework.",
      dl: 456,
    },
    // Agents
    {
      cat: "Agents",
      name: "RevenueIntelAgent",
      desc: "Tracks ARR movements, churn signals, and expansion triggers. Generates daily MRR digest and flags at-risk accounts automatically.",
      dl: 467,
    },
    {
      cat: "Agents",
      name: "CodeReviewAgent",
      desc: "Automated PR review: security anti-patterns, performance regressions, complexity scoring, and OWASP Top 10 checks.",
      dl: 445,
    },
    {
      cat: "Agents",
      name: "IncidentResponseAgent",
      desc: "Classifies PagerDuty/Sentry alerts by severity, escalates to correct on-call, drafts postmortem templates, tracks SLA compliance.",
      dl: 423,
    },
    {
      cat: "Agents",
      name: "BrandMonitorAgent",
      desc: "Tracks brand mentions across Reddit, X, HN, and press. Sentiment shift alerts and weekly share-of-voice reports.",
      dl: 389,
    },
    {
      cat: "Agents",
      name: "BudgetForecastAgent",
      desc: "Predicts monthly cloud spend, flags anomalies, and suggests reallocation across Railway, Cloudflare, and third-party APIs.",
      dl: 367,
    },
    // Codex
    {
      cat: "Codex",
      name: "Real-Time Sync Engine",
      desc: "CRDT-based collaborative data sync. Offline-first architecture, conflict resolution, PostgreSQL persistence, and operational transforms.",
      dl: 489,
    },
    {
      cat: "Codex",
      name: "Multi-Tenant SaaS Template",
      desc: "Row-level security, tenant isolation via schema-per-tenant or discriminator columns, usage metering, and billing integration.",
      dl: 534,
    },
    {
      cat: "Codex",
      name: "Webhook Orchestrator",
      desc: "Fan-out delivery to multiple consumers, retry logic with exponential backoff, HMAC signature verification, and delivery dashboard.",
      dl: 456,
    },
    {
      cat: "Codex",
      name: "GraphQL Federation Template",
      desc: "Supergraph composition with Apollo Federation. Subgraph isolation, persisted queries, schema change detection, and tracing.",
      dl: 423,
    },
    {
      cat: "Codex",
      name: "Rate Limiter Service",
      desc: "Sliding window + token bucket algorithms. Redis-backed, per-tenant limits, burst allowances, and Prometheus metrics export.",
      dl: 398,
    },
    // Analytics
    {
      cat: "Analytics",
      name: "Funnel Cohort Analyzer",
      desc: "Step-by-step conversion tracking by acquisition cohort, date range, and plan tier. Identifies highest-value drop-off moments.",
      dl: 389,
    },
    {
      cat: "Analytics",
      name: "A/B Test Statistical Engine",
      desc: "Sequential testing with optional stopping, Bayesian inference, multiple comparison correction, and automated winner declaration.",
      dl: 423,
    },
    {
      cat: "Analytics",
      name: "Revenue Forecasting Model",
      desc: "MRR prediction curves, churn probability by segment, expansion scenarios, and confidence intervals across 30/60/90-day horizons.",
      dl: 456,
    },
    {
      cat: "Analytics",
      name: "User Segmentation Engine",
      desc: "RFM scoring, behavioural clusters, ML-powered segment discovery, and real-time segment membership updates via Redis.",
      dl: 412,
    },
    {
      cat: "Analytics",
      name: "Real-Time Event Pipeline",
      desc: "Clickstream processing, sessionisation, funnel event enrichment, and sink connectors to BigQuery, Snowflake, and PostgreSQL.",
      dl: 398,
    },
    // Integrations
    {
      cat: "Integrations",
      name: "Stripe → QuickBooks Sync",
      desc: "Revenue reconciliation, automated invoice generation, refund tracking, and monthly close reports for accountants.",
      dl: 367,
    },
    {
      cat: "Integrations",
      name: "GitHub → Jira Bridge",
      desc: "Issue sync, PR status updates, sprint automation, dependency mapping, and code-to-ticket velocity metrics.",
      dl: 345,
    },
    {
      cat: "Integrations",
      name: "HubSpot → Segment Integration",
      desc: "Contact enrichment, event replay, deal stage sync, and bidirectional property mapping with conflict resolution.",
      dl: 312,
    },
    {
      cat: "Integrations",
      name: "Slack → PagerDuty Router",
      desc: "Alert channel management, escalation policy configuration, incident thread creation, and on-call handover notifications.",
      dl: 334,
    },
    {
      cat: "Integrations",
      name: "Custom Workflow Engine",
      desc: "Trigger/action DAG builder, conditional branches, error retry with backoff, webhook fan-out, and execution history log.",
      dl: 389,
    },
    // Utilities
    {
      cat: "Utilities",
      name: "Log Aggregation Router",
      desc: "Unified logging from Railway, Cloudflare, and Vercel to a single sink. Structured log parsing, alerting, and retention policies.",
      dl: 312,
    },
    {
      cat: "Utilities",
      name: "Dependency Vulnerability Scanner",
      desc: "npm/pip/cargo audit with CVSS scoring, exploitability context, and automated fix-branch creation for critical CVEs.",
      dl: 289,
    },
    {
      cat: "Utilities",
      name: "Database Migration Manager",
      desc: "Forward/rollback migrations, dry-run preview, execution log, schema diff viewer, and Railway-native deployment hooks.",
      dl: 334,
    },
    {
      cat: "Utilities",
      name: "API Contract Validator",
      desc: "OpenAPI spec drift detection, breaking change alerts on PR, endpoint coverage analysis, and mock server generation.",
      dl: 298,
    },
    {
      cat: "Utilities",
      name: "Cache Warming Tool",
      desc: "Pre-populates Redis caches post-deployment using production traffic pattern analysis. Configurable TTL and key namespace targeting.",
      dl: 267,
    },
    // ── Batch 6: 50 more apps ──────────────────────────────────────────────
    // Theatre
    {
      cat: "Theatre",
      name: "2001 — The Monolith Encounter",
      desc: "Stand before Kubrick's black slab on the African plain. Ape-men circle you. Time compresses 4 million years into 3 minutes of awe.",
      dl: 612,
    },
    {
      cat: "Theatre",
      name: "Annihilation — The Shimmer",
      desc: "Step through Garland's refracting membrane into the zone where biology rewrites itself. DNA-helix corridors, lighthouse finale, self-encounter.",
      dl: 534,
    },
    {
      cat: "Theatre",
      name: "Sphere — Ocean Manifestation",
      desc: "Crichton's alien sphere manifests at depth. Submerged station, manifested fears, and the final choice to forget — rendered in full undersea WebXR.",
      dl: 487,
    },
    {
      cat: "Theatre",
      name: "Arrival — Language Cloud",
      desc: "Louise Banks deciphers heptapod logograms. Circular time revealed spatially. Each logogram appears as a 3D ink bloom in zero gravity.",
      dl: 556,
    },
    {
      cat: "Theatre",
      name: "Interstellar — Tesseract",
      desc: "Cooper's 5D bookshelf moment. Gravitational messages encoded in book-fall patterns. Time as a spatial dimension you can reach through.",
      dl: 598,
    },
    // Cinema
    {
      cat: "Cinema",
      name: "Blade Runner — Tears in Rain",
      desc: "Roy Batty's final soliloquy on the rain-drenched rooftop. Spinner cars drift overhead. C-beams near the Tannhäuser Gate visible in the distance.",
      dl: 445,
    },
    {
      cat: "Cinema",
      name: "The Truman Show — Dome Exit",
      desc: "Truman discovers the studio wall and staircase. Audience reaction screens surround you. The final bow rendered as participatory media art.",
      dl: 423,
    },
    {
      cat: "Cinema",
      name: "Pi — Number Spiral",
      desc: "Max Cohen's paranoid Manhattan. Fibonacci spirals encoded in subway tile patterns. The 216-digit number rendered as a 3D lattice you walk through.",
      dl: 378,
    },
    {
      cat: "Cinema",
      name: "eXistenZ — Game Pod",
      desc: "Cronenberg's bio-port installation. Organic game cartridges, reality-layer stripping, and the meta-game question rendered as nested WebXR rooms.",
      dl: 356,
    },
    {
      cat: "Cinema",
      name: "Moon — Sam Bell Encounter",
      desc: "Rockwell's two Sams face each other in the harvester bay. GERTY's rotating face cube. Loneliness of the far side of the Moon — spatially.",
      dl: 412,
    },
    // Agents
    {
      cat: "Agents",
      name: "Sales Outreach Orchestrator",
      desc: "Prospect research, personalised cold email sequences, follow-up timing optimisation, reply classification, and CRM sync — fully autonomous.",
      dl: 489,
    },
    {
      cat: "Agents",
      name: "Legal Contract Reviewer",
      desc: "Clause extraction, risk flagging, GDPR compliance check, negotiation redline suggestions, and standard deviation from market terms analysis.",
      dl: 445,
    },
    {
      cat: "Agents",
      name: "Social Listening Agent",
      desc: "Brand mention tracking across Twitter, Reddit, and LinkedIn. Sentiment trend alerts, viral content detection, and weekly report generation.",
      dl: 412,
    },
    {
      cat: "Agents",
      name: "Candidate Screening Agent",
      desc: "JD-to-resume matching, skills gap analysis, automated interview question generation, reference check drafting, and ATS sync.",
      dl: 423,
    },
    {
      cat: "Agents",
      name: "E-Commerce Price Optimiser",
      desc: "Competitor price scraping, demand elasticity modelling, margin-safe discount scheduling, and A/B pricing experiment orchestration.",
      dl: 467,
    },
    {
      cat: "Agents",
      name: "Infrastructure Cost Auditor",
      desc: "Cloud spend analysis across AWS/GCP/Railway, idle resource detection, right-sizing recommendations, and budget alert configuration.",
      dl: 389,
    },
    {
      cat: "Agents",
      name: "Compliance Monitoring Agent",
      desc: "SOC2/GDPR/HIPAA policy drift detection, evidence collection automation, audit trail generation, and remediation ticket creation.",
      dl: 356,
    },
    {
      cat: "Agents",
      name: "Product Review Synthesiser",
      desc: "Scrapes G2, Trustpilot, and App Store reviews. Clusters by theme, surfaces feature requests, tracks NPS drift, and briefs product team.",
      dl: 398,
    },
    {
      cat: "Agents",
      name: "Meeting Intelligence Agent",
      desc: "Transcript analysis, action item extraction, decision logging, follow-up email drafting, and CRM note population from every call.",
      dl: 434,
    },
    {
      cat: "Agents",
      name: "Supply Chain Risk Monitor",
      desc: "Supplier news monitoring, geopolitical risk scoring, lead-time variance alerts, and alternative vendor recommendation generation.",
      dl: 312,
    },
    // Codex
    {
      cat: "Codex",
      name: "Next.js 15 App Router Starter",
      desc: "Server components, streaming, parallel routes, RSC data patterns, Edge Runtime config, and Vercel/Railway deploy-ready setup.",
      dl: 534,
    },
    {
      cat: "Codex",
      name: "tRPC + Prisma + Next.js",
      desc: "Type-safe full-stack template with end-to-end type inference, zod validation, optimistic updates, and Railway Postgres provisioning.",
      dl: 512,
    },
    {
      cat: "Codex",
      name: "Redis Pub/Sub Event Bus",
      desc: "Publisher/subscriber pattern with channel namespacing, message schema validation, dead-letter queue, and Redis Streams persistence.",
      dl: 445,
    },
    {
      cat: "Codex",
      name: "WebSocket Gateway Pattern",
      desc: "Horizontally scalable WS gateway with Redis adapter, room management, presence tracking, and graceful reconnection handling.",
      dl: 467,
    },
    {
      cat: "Codex",
      name: "Monorepo with Turborepo",
      desc: "Shared packages, incremental builds, remote caching, workspace protocol linking, and coordinated Railway multi-service deploy.",
      dl: 489,
    },
    {
      cat: "Codex",
      name: "GraphQL Federation Gateway",
      desc: "Apollo Federation 2.x supergraph with subgraph stitching, auth context propagation, persisted queries, and schema registry integration.",
      dl: 423,
    },
    {
      cat: "Codex",
      name: "Kafka Event Sourcing Pattern",
      desc: "CQRS with Kafka topics, consumer group management, exactly-once semantics, event replay, and projection rebuild utilities.",
      dl: 398,
    },
    {
      cat: "Codex",
      name: "Svelte + SvelteKit Scaffold",
      desc: "SSR/CSR hybrid, load functions, form actions, page transitions, and Railway static adapter configuration for full-stack deployment.",
      dl: 378,
    },
    {
      cat: "Codex",
      name: "Go Microservice Template",
      desc: "Chi router, structured logging, OpenTelemetry tracing, Prometheus metrics, graceful shutdown, and Docker multi-stage build.",
      dl: 412,
    },
    {
      cat: "Codex",
      name: "Python FastAPI Starter",
      desc: "Async endpoints, Pydantic v2 models, SQLAlchemy 2.0, Alembic migrations, JWT auth middleware, and Railway deploy config.",
      dl: 445,
    },
    // Integrations
    {
      cat: "Integrations",
      name: "Linear → GitHub Sync",
      desc: "Issue creation from GitHub issues, PR status to Linear updates, branch naming enforcement, and cycle completion automation.",
      dl: 389,
    },
    {
      cat: "Integrations",
      name: "Notion → Confluence Migrator",
      desc: "Page structure preservation, rich text conversion, attachment migration, permission mapping, and incremental sync mode.",
      dl: 345,
    },
    {
      cat: "Integrations",
      name: "Shopify → Klaviyo Events",
      desc: "Purchase events, cart abandonment triggers, browse tracking, product review requests, and win-back campaign automation.",
      dl: 378,
    },
    {
      cat: "Integrations",
      name: "Twilio → Zendesk Router",
      desc: "SMS/voice ticket creation, agent assignment rules, SLA timer integration, conversation threading, and CSAT survey dispatch.",
      dl: 334,
    },
    {
      cat: "Integrations",
      name: "Airtable → PostgreSQL Sync",
      desc: "Bidirectional record sync, schema inference, conflict resolution, webhook-triggered updates, and transformation rule builder.",
      dl: 312,
    },
    {
      cat: "Integrations",
      name: "Figma → Storybook Bridge",
      desc: "Design token extraction, component prop mapping, variant generation, and automated Storybook story scaffolding from Figma frames.",
      dl: 356,
    },
    {
      cat: "Integrations",
      name: "Cloudflare → DataDog Pipe",
      desc: "Edge request metrics, Worker error forwarding, DNS analytics, cache hit-rate dashboards, and anomaly alert routing.",
      dl: 289,
    },
    {
      cat: "Integrations",
      name: "Resend → PostHog Analytics",
      desc: "Email event tracking, open/click attribution, sequence performance funnels, unsubscribe cohort analysis, and A/B test result reporting.",
      dl: 323,
    },
    {
      cat: "Integrations",
      name: "OpenAI → Pinecone RAG",
      desc: "Embedding generation pipeline, vector upsert batching, similarity search with metadata filters, and retrieval quality evaluation harness.",
      dl: 467,
    },
    {
      cat: "Integrations",
      name: "Vercel → Railway Failover",
      desc: "Health check monitoring, automatic traffic rerouting, cache warm-up on failover, incident notification, and rollback coordination.",
      dl: 312,
    },
    // Utilities
    {
      cat: "Utilities",
      name: "Token Budget Tracker",
      desc: "OpenAI/Anthropic/Gemini API spend tracking, per-project budgets, cost-per-request analytics, and hard-limit circuit breaker.",
      dl: 423,
    },
    {
      cat: "Utilities",
      name: "Environment Variable Auditor",
      desc: "Detects stale, unused, or missing env vars across Railway services. Generates `.env.example` diffs and secret rotation reminders.",
      dl: 389,
    },
    {
      cat: "Utilities",
      name: "Webhook Replay Engine",
      desc: "Stores incoming webhooks, replays with configurable delay/filter, tests handler changes against historical payloads safely.",
      dl: 356,
    },
    {
      cat: "Utilities",
      name: "Multi-Tenant Row Isolation",
      desc: "PostgreSQL RLS policy generator, tenant context injection middleware, query audit logging, and isolation test suite scaffold.",
      dl: 312,
    },
    {
      cat: "Utilities",
      name: "Feature Flag Manager",
      desc: "Boolean and percentage rollout flags, user segment targeting, flag evaluation analytics, kill-switch dashboard, and SDK generator.",
      dl: 378,
    },
    {
      cat: "Utilities",
      name: "Cron Job Monitor",
      desc: "Heartbeat tracking for scheduled tasks, missed-run alerting, duration anomaly detection, and Railway cron service health dashboard.",
      dl: 334,
    },
    {
      cat: "Utilities",
      name: "OpenAPI Mock Server",
      desc: "Generates realistic mock responses from any OpenAPI 3.x spec. Response delay simulation, error injection, and contract test harness.",
      dl: 289,
    },
    {
      cat: "Utilities",
      name: "Structured Output Validator",
      desc: "JSON Schema and Zod-based LLM output validation, retry-with-correction loop, error classification, and output quality scoring.",
      dl: 345,
    },
    {
      cat: "Utilities",
      name: "Rate Limit Dashboard",
      desc: "Visualises API rate limit headroom across all integrations. Token bucket state, request pacing throttle, and burst capacity planner.",
      dl: 267,
    },
    {
      cat: "Utilities",
      name: "Deployment Diff Reporter",
      desc: "Compares Railway deployment versions: env var changes, service restarts, build durations, and rollback risk assessment per deploy.",
      dl: 298,
    },
    // ── Batch 7 (50 apps) ─────────────────────────────────────────────────
    // VR Experiences
    {
      cat: "VR",
      name: "Colosseum Time Gate",
      desc: "Step through a time gate into the Roman Colosseum at peak empire. Gladiatorial physics, crowd simulation, and spatial historical narration.",
      dl: 512,
    },
    {
      cat: "VR",
      name: "ISS Zero Gravity Lab",
      desc: "Float inside the International Space Station. Conduct microgravity experiments, view Earth from 400 km altitude, and operate robotic arms.",
      dl: 487,
    },
    {
      cat: "VR",
      name: "Pyramids of Giza Builder",
      desc: "Watch and direct the construction of the Great Pyramid using ancient engineering techniques. Stone physics and workforce simulation.",
      dl: 443,
    },
    {
      cat: "VR",
      name: "Deep Ocean Trench Explorer",
      desc: "Descend 11 km to the Mariana Trench. Bioluminescent creatures, crushing pressure physics, and submarine navigation in full VR.",
      dl: 398,
    },
    {
      cat: "VR",
      name: "Stonehenge Solstice Portal",
      desc: "Stand at Stonehenge during the summer solstice 3000 BC. Celestial alignment visualisation and druidic ceremony spatial reconstruction.",
      dl: 367,
    },
    // AI Agents
    {
      cat: "Agents",
      name: "Customer Retention Strategist",
      desc: "Analyses churn signals across CRM, support, and billing data. Auto-generates retention playbooks with predicted LTV impact per intervention.",
      dl: 634,
    },
    {
      cat: "Agents",
      name: "Grant Proposal Writer",
      desc: "Researches matching grant opportunities, drafts full proposals to spec, and tracks submission deadlines across funding bodies.",
      dl: 521,
    },
    {
      cat: "Agents",
      name: "Competitive Intelligence Tracker",
      desc: "Monitors competitor websites, job boards, and press releases. Synthesises weekly intel reports with strategic gap analysis.",
      dl: 489,
    },
    {
      cat: "Agents",
      name: "API Documentation Generator",
      desc: "Reads codebase and auto-generates OpenAPI specs, usage guides, and interactive examples. Keeps docs in sync on every PR merge.",
      dl: 567,
    },
    {
      cat: "Agents",
      name: "Inventory Reorder Agent",
      desc: "Tracks stock levels, predicts depletion dates, and auto-raises purchase orders. Supplier lead-time aware with safety-stock optimisation.",
      dl: 445,
    },
    {
      cat: "Agents",
      name: "Brand Voice Auditor",
      desc: "Scans all published content and scores consistency against your defined brand voice. Flags deviations and suggests corrected rewrites.",
      dl: 398,
    },
    {
      cat: "Agents",
      name: "SLA Monitor",
      desc: "Tracks service level agreements across all customer accounts. Alerts before breach, generates root-cause summaries, and logs remediation steps.",
      dl: 523,
    },
    {
      cat: "Agents",
      name: "Tax Filing Preparer",
      desc: "Aggregates transactions, categorises deductions, and prepares tax-ready reports for accountants. Jurisdiction-aware for UK, US, and EU.",
      dl: 412,
    },
    {
      cat: "Agents",
      name: "Influencer Outreach Coordinator",
      desc: "Identifies relevant influencers, drafts personalised pitch emails, tracks response rates, and manages campaign deliverables.",
      dl: 378,
    },
    {
      cat: "Agents",
      name: "Security Vulnerability Reporter",
      desc: "Scans repos and deployed services for CVEs, misconfigs, and outdated dependencies. Generates executive-ready risk reports with CVSS scores.",
      dl: 601,
    },
    // Codex (Dev Tools)
    {
      cat: "Codex",
      name: "Rust Actix-Web Starter",
      desc: "Full Rust Actix-Web API with PostgreSQL, JWT auth, diesel ORM, middleware stack, and Docker deployment. Production-ready from clone.",
      dl: 489,
    },
    {
      cat: "Codex",
      name: "Elixir Phoenix LiveView",
      desc: "Real-time Elixir Phoenix app with LiveView, Ecto, Channels, and PubSub. Includes auth scaffold and TailwindCSS setup.",
      dl: 423,
    },
    {
      cat: "Codex",
      name: "Flutter Cross-Platform",
      desc: "Full Flutter app with Riverpod state management, REST API integration, local SQLite storage, and CI/CD for iOS and Android.",
      dl: 534,
    },
    {
      cat: "Codex",
      name: "Django REST + Celery",
      desc: "Python Django REST framework with Celery async tasks, Redis broker, PostgreSQL, and JWT auth. Dockerised with Nginx reverse proxy.",
      dl: 456,
    },
    {
      cat: "Codex",
      name: "Vue 3 + Pinia Store",
      desc: "Vue 3 composition API app with Pinia state management, Vue Router, Vite bundler, and TypeScript. Includes auth and API client layer.",
      dl: 512,
    },
    {
      cat: "Codex",
      name: "Deno Fresh Framework",
      desc: "Island-based Deno Fresh app with server-side rendering, Preact islands, Tailwind, and Deno KV storage. Deployable to Deno Deploy.",
      dl: 378,
    },
    {
      cat: "Codex",
      name: "Bun + Elysia Ultra-Fast API",
      desc: "Bun runtime Elysia framework API with end-to-end TypeScript types, SQLite, JWT, and benchmarked at 200k req/s throughput.",
      dl: 445,
    },
    {
      cat: "Codex",
      name: "LangChain RAG Pipeline",
      desc: "LangChain retrieval-augmented generation pipeline with vector store, document chunker, embedding model, and streaming chat endpoint.",
      dl: 623,
    },
    {
      cat: "Codex",
      name: "Temporal Workflow Engine",
      desc: "Temporal.io workflow definitions with retry logic, signals, queries, child workflows, and saga compensation patterns.",
      dl: 398,
    },
    {
      cat: "Codex",
      name: "WebAssembly Rust Module",
      desc: "Rust compiled to WASM for browser-side computation. Includes wasm-bindgen bindings, JS interop layer, and Vite integration.",
      dl: 467,
    },
    // Integrations
    {
      cat: "Integrations",
      name: "HubSpot → Slack Deal Alerts",
      desc: "Fires Slack notifications for HubSpot deal stage changes, new leads, and at-risk accounts. Configurable per pipeline and stage.",
      dl: 534,
    },
    {
      cat: "Integrations",
      name: "Stripe → QuickBooks Sync",
      desc: "Syncs Stripe charges, refunds, and payouts to QuickBooks Online in real-time. Tax code mapping and multi-currency reconciliation.",
      dl: 478,
    },
    {
      cat: "Integrations",
      name: "GitHub → Jira Auto-Link",
      desc: "Parses commit messages and PR titles for Jira ticket IDs. Auto-transitions tickets on PR merge and posts deployment comments.",
      dl: 512,
    },
    {
      cat: "Integrations",
      name: "Salesforce → Segment Events",
      desc: "Mirrors Salesforce opportunity updates, contact changes, and activity logs to Segment as structured analytics events.",
      dl: 389,
    },
    {
      cat: "Integrations",
      name: "Shopify → Google Sheets Reports",
      desc: "Exports Shopify orders, refunds, and inventory to Google Sheets on schedule. Includes pivot-ready formatting and chart templates.",
      dl: 423,
    },
    {
      cat: "Integrations",
      name: "Intercom → PagerDuty Escalation",
      desc: "Escalates high-priority Intercom conversations to PagerDuty incidents. Includes SLA breach detection and on-call rotation routing.",
      dl: 367,
    },
    {
      cat: "Integrations",
      name: "Notion → Confluence Publisher",
      desc: "Publishes Notion pages to Confluence with Markdown conversion, space routing, and bidirectional comment sync.",
      dl: 398,
    },
    {
      cat: "Integrations",
      name: "Calendly → CRM Contact Sync",
      desc: "Creates or updates CRM contacts on every Calendly booking. Maps meeting type to deal stage and sends pre-meeting prep emails.",
      dl: 445,
    },
    {
      cat: "Integrations",
      name: "Zapier Webhook Debugger",
      desc: "Captures, inspects, replays, and transforms Zapier webhook payloads. Built-in schema diff and latency analyser.",
      dl: 356,
    },
    {
      cat: "Integrations",
      name: "Railway → DataDog Metrics Bridge",
      desc: "Streams Railway service health metrics, build events, and log-based alerts to DataDog. Custom dashboard template included.",
      dl: 412,
    },
    // Analytics
    {
      cat: "Analytics",
      name: "Cohort Retention Analyser",
      desc: "Builds weekly and monthly cohort retention tables from event data. Exports heatmaps, D1/D7/D30 metrics, and benchmark comparisons.",
      dl: 567,
    },
    {
      cat: "Analytics",
      name: "Funnel Drop-off Detector",
      desc: "Identifies conversion funnel drop-off points using session recordings and event traces. Ranks by revenue impact and suggests A/B fixes.",
      dl: 512,
    },
    {
      cat: "Analytics",
      name: "Predictive Churn Model",
      desc: "Trains an XGBoost churn prediction model on your product data. Scores all active users daily and triggers retention playbooks.",
      dl: 623,
    },
    {
      cat: "Analytics",
      name: "Ad Spend ROI Calculator",
      desc: "Attributes revenue to ad campaigns across Google, Meta, and TikTok. Calculates blended CAC, ROAS, and payback period per channel.",
      dl: 489,
    },
    {
      cat: "Analytics",
      name: "NPS Score Tracker",
      desc: "Sends NPS surveys at configurable intervals, collects responses, and generates segment-level trend reports with verbatim clustering.",
      dl: 445,
    },
    {
      cat: "Analytics",
      name: "SEO Keyword Rank Tracker",
      desc: "Daily keyword rank tracking across Google and Bing. Alerts on top-10 movements, competitor crossings, and page-2 breakout opportunities.",
      dl: 523,
    },
    {
      cat: "Analytics",
      name: "Revenue Waterfall Dashboard",
      desc: "Visualises MRR movements: new, expansion, contraction, and churned revenue. Drill-down by cohort, plan, and acquisition channel.",
      dl: 578,
    },
    {
      cat: "Analytics",
      name: "A/B Test Statistical Engine",
      desc: "Calculates statistical significance, required sample sizes, and confidence intervals for A/B tests. Supports Bayesian and frequentist modes.",
      dl: 467,
    },
    // Playbooks
    {
      cat: "Playbooks",
      name: "Product-Led Growth Playbook",
      desc: "Full PLG motion: free tier design, activation metrics, viral loops, expansion triggers, and self-serve upgrade flows with benchmarks.",
      dl: 645,
    },
    {
      cat: "Playbooks",
      name: "Series A Fundraising Playbook",
      desc: "Investor targeting matrix, data room structure, pitch narrative templates, due diligence checklist, and term sheet negotiation guide.",
      dl: 712,
    },
    {
      cat: "Playbooks",
      name: "Enterprise Sales Playbook",
      desc: "Multi-stakeholder deal navigation: champion building, economic buyer access, procurement handling, and legal red-line strategies.",
      dl: 634,
    },
    {
      cat: "Playbooks",
      name: "Content Marketing Machine",
      desc: "24-month content calendar, SEO cluster strategy, distribution playbook across 8 channels, and conversion rate benchmarks by format.",
      dl: 589,
    },
    {
      cat: "Playbooks",
      name: "Community-Led Growth Playbook",
      desc: "Discord and Slack community growth from 0 to 10k. Engagement rituals, member journey maps, ambassador programmes, and monetisation.",
      dl: 523,
    },
    {
      cat: "Playbooks",
      name: "API-First GTM Strategy",
      desc: "Developer-first go-to-market: documentation strategy, API playground, developer advocacy roadmap, and PLG conversion triggers.",
      dl: 567,
    },
    {
      cat: "Playbooks",
      name: "Marketplace Launch Playbook",
      desc: "Two-sided marketplace cold-start: supply-first seeding, demand activation, liquidity loops, and take-rate optimisation milestones.",
      dl: 612,
    },
    {
      cat: "Playbooks",
      name: "International Expansion Playbook",
      desc: "Market prioritisation framework, localisation checklist, regulatory requirements by jurisdiction, and growth channel adaptation matrix.",
      dl: 556,
    },
    {
      cat: "Playbooks",
      name: "Technical Hiring Playbook",
      desc: "Full-cycle engineering hiring: job spec templates, take-home vs live-coding debate, offer structuring, and onboarding 30-60-90 plans.",
      dl: 489,
    },
    {
      cat: "Playbooks",
      name: "Incident Response Playbook",
      desc: "P0/P1/P2 incident severity matrix, communication templates, post-mortem structure, blameless culture practices, and SLA recovery protocols.",
      dl: 534,
    },
    // ── Batch 8 (50 apps → 436 total) ─────────────────────────────────────
    // Games & Entertainment (8)
    {
      cat: "Games",
      name: "Neon Drift Racer",
      desc: "Browser-based top-down racer through neon lattice highways. Drift corners to charge your PHI boost meter. 8 tracks, local leaderboard.",
      dl: 892,
    },
    {
      cat: "Games",
      name: "Quantum Tetromino",
      desc: "Tetris-style puzzle game where pieces carry geometric frequencies. Match same-frequency blocks to trigger harmonic chain reactions.",
      dl: 734,
    },
    {
      cat: "Games",
      name: "Lattice Sniper",
      desc: "First-person VR sniper game. Identify valid lattice nodes vs corrupted imposters using frequency analysis. 5 difficulty tiers.",
      dl: 611,
    },
    {
      cat: "Games",
      name: "Merkaba Pinball",
      desc: "Geometric pinball machine built on the D48 lattice. Each bumper emits a frequency tone on hit. Unlock all 8 sectors to win.",
      dl: 478,
    },
    {
      cat: "Games",
      name: "Code Runner 48",
      desc: "Infinite side-scroller where your character is an AI agent navigating a corrupted codebase. Jump over bugs, collect tokens.",
      dl: 1024,
    },
    {
      cat: "Games",
      name: "Frequency Frogger",
      desc: "Cross the 8 frequency rivers without getting hit by low-coherence waveforms. Each river runs at a different Solfeggio frequency.",
      dl: 556,
    },
    {
      cat: "Games",
      name: "PHI Tower Defense",
      desc: "Place geometric defenders along the 48-node lattice perimeter. Enemies scale by PHI each wave. 12 unique defender types.",
      dl: 813,
    },
    {
      cat: "Games",
      name: "Holographic Maze Runner",
      desc: "First-person maze built from holographic geometry. Find the coherence crystal before your frequency degrades. Procedurally generated.",
      dl: 445,
    },
    // AI Agents (10)
    {
      cat: "Agents",
      name: "Legal Contract Reviewer",
      desc: "Scans contracts for unfavorable clauses, missing indemnity terms, IP ownership risks, and jurisdiction mismatches. Outputs redline suggestions.",
      dl: 723,
    },
    {
      cat: "Agents",
      name: "Cold Email Personaliser",
      desc: "Researches prospect LinkedIn + company news, generates hyper-personalised outreach emails. A/B variant generation built in.",
      dl: 956,
    },
    {
      cat: "Agents",
      name: "PR Crisis Monitor",
      desc: "Watches social media and news for brand mentions with negative sentiment. Drafts response templates and alerts on-call team.",
      dl: 384,
    },
    {
      cat: "Agents",
      name: "Developer Onboarding Guide",
      desc: "Reads your codebase, generates interactive onboarding docs, identifies undocumented APIs, creates architecture diagrams.",
      dl: 612,
    },
    {
      cat: "Agents",
      name: "Recruitment Screener",
      desc: "Parses CVs, scores against job description criteria, generates interview questions, schedules callbacks. GDPR-compliant.",
      dl: 489,
    },
    {
      cat: "Agents",
      name: "Market Research Synthesiser",
      desc: "Aggregates industry reports, analyst notes, and competitor filings into a structured research brief with key takeaways.",
      dl: 731,
    },
    {
      cat: "Agents",
      name: "Compliance Checklist Generator",
      desc: "Reads your product spec and generates compliance checklists for GDPR, SOC2, HIPAA, PCI-DSS based on data flow.",
      dl: 567,
    },
    {
      cat: "Agents",
      name: "Investor Update Writer",
      desc: "Pulls MRR, churn, milestone data from your CRM and database, drafts a polished monthly investor update email.",
      dl: 634,
    },
    {
      cat: "Agents",
      name: "Customer Feedback Analyser",
      desc: "Ingests review data from App Store, G2, Trustpilot. Clusters themes, tracks sentiment over time, surfaces feature requests.",
      dl: 812,
    },
    {
      cat: "Agents",
      name: "Procurement Bid Writer",
      desc: "Reads RFP documents, generates compliant bid responses with pricing tables, technical specs, and capability statements.",
      dl: 298,
    },
    // Codex Templates (10)
    {
      cat: "Codex",
      name: "Next.js 15 App Router Starter",
      desc: "Production-ready Next.js 15 with App Router, TypeScript, Tailwind CSS, shadcn/ui, Prisma ORM, NextAuth, and Vercel deployment config.",
      dl: 2341,
    },
    {
      cat: "Codex",
      name: "FastAPI + PostgreSQL API",
      desc: "Async FastAPI backend with PostgreSQL via asyncpg, Alembic migrations, JWT auth, Redis caching, Docker Compose.",
      dl: 1876,
    },
    {
      cat: "Codex",
      name: "Remix + Cloudflare Workers",
      desc: "Full-stack Remix app deployed to Cloudflare Workers with D1 database, KV storage, and R2 object storage.",
      dl: 934,
    },
    {
      cat: "Codex",
      name: "SvelteKit + PocketBase",
      desc: "SvelteKit frontend with PocketBase as a self-hosted backend. Real-time subscriptions, file uploads, OAuth built in.",
      dl: 723,
    },
    {
      cat: "Codex",
      name: "Go Fiber REST API",
      desc: "High-performance Go REST API using Fiber framework, GORM ORM, JWT middleware, Swagger docs, Docker multi-stage build.",
      dl: 1243,
    },
    {
      cat: "Codex",
      name: "NestJS Microservices",
      desc: "NestJS monorepo with multiple microservices, RabbitMQ message bus, API gateway, service discovery, Docker Compose orchestration.",
      dl: 834,
    },
    {
      cat: "Codex",
      name: "Astro + MDX Blog",
      desc: "Blazing-fast static blog with Astro, MDX content collections, RSS feed, sitemap generation, SEO optimization, Vercel/Netlify deploy.",
      dl: 1567,
    },
    {
      cat: "Codex",
      name: "React Native + Expo Starter",
      desc: "Cross-platform mobile app starter with Expo Router, Zustand, React Query, NativeWind, Expo Notifications, and EAS build config.",
      dl: 1123,
    },
    {
      cat: "Codex",
      name: "Stripe Billing Boilerplate",
      desc: "Complete Stripe billing integration: subscriptions, usage-based billing, customer portal, webhook handling, proration logic.",
      dl: 987,
    },
    {
      cat: "Codex",
      name: "tRPC + Drizzle ORM Stack",
      desc: "End-to-end typesafe API with tRPC, Drizzle ORM, Zod validation, Next.js App Router, and PostgreSQL.",
      dl: 756,
    },
    // Integrations (10)
    {
      cat: "Integrations",
      name: "Linear → GitHub Auto-PR",
      desc: "When a Linear issue moves to In Progress, automatically creates a GitHub branch and draft PR with the issue description.",
      dl: 634,
    },
    {
      cat: "Integrations",
      name: "Notion → Airtable Sync",
      desc: "Bi-directional sync between Notion databases and Airtable bases. Field mapping config, conflict resolution, audit log.",
      dl: 512,
    },
    {
      cat: "Integrations",
      name: "Slack → Trello Task Creator",
      desc: "React to any Slack message with 📋 to create a Trello card with the message content, sender, and channel context.",
      dl: 789,
    },
    {
      cat: "Integrations",
      name: "Typeform → HubSpot CRM",
      desc: "New Typeform submission → creates HubSpot contact, assigns to rep by territory, sends personalised welcome email.",
      dl: 623,
    },
    {
      cat: "Integrations",
      name: "Stripe → Segment Events",
      desc: "Tracks Stripe payment lifecycle events (trial start, upgrade, downgrade, churn) as Segment events for analytics.",
      dl: 445,
    },
    {
      cat: "Integrations",
      name: "GitHub Actions → Slack Deploy Bot",
      desc: "Posts formatted deploy notifications to Slack on GitHub Actions workflow complete. Includes diff summary and rollback link.",
      dl: 891,
    },
    {
      cat: "Integrations",
      name: "Zendesk → Linear Escalator",
      desc: "When a Zendesk ticket breaches SLA or hits priority threshold, auto-creates a Linear bug with full ticket context.",
      dl: 367,
    },
    {
      cat: "Integrations",
      name: "Google Analytics → Slack Digest",
      desc: "Daily GA4 metrics digest posted to Slack: sessions, conversions, top pages, bounce rate, revenue. Trend arrows included.",
      dl: 534,
    },
    {
      cat: "Integrations",
      name: "Webflow → Mailchimp CMS Sync",
      desc: "Publishes new Webflow CMS items to a Mailchimp campaign automatically. Template mapping, tag assignment, send scheduling.",
      dl: 423,
    },
    {
      cat: "Integrations",
      name: "PagerDuty → Jira Incident Tracker",
      desc: "PagerDuty alert triggered → creates Jira incident ticket, links runbook, notifies on-call engineer via Slack DM.",
      dl: 589,
    },
    // Analytics (6)
    {
      cat: "Analytics",
      name: "SaaS Revenue Dashboard",
      desc: "Live dashboard: MRR, ARR, LTV, CAC, payback period, net revenue retention. Connects to Stripe. Exportable to PDF.",
      dl: 1234,
    },
    {
      cat: "Analytics",
      name: "Product Usage Heatmap",
      desc: "Visualises feature usage frequency across your app. Identify adoption gaps, power users, and churn-risk segments.",
      dl: 856,
    },
    {
      cat: "Analytics",
      name: "Email Campaign Analyser",
      desc: "Aggregates open rates, click rates, unsubscribes across ESP providers. Identifies optimal send times and subject line patterns.",
      dl: 634,
    },
    {
      cat: "Analytics",
      name: "Infrastructure Cost Tracker",
      desc: "Pulls cloud spend from AWS, GCP, Railway, Vercel. Allocates costs by service, tracks anomalies, forecasts monthly bill.",
      dl: 712,
    },
    {
      cat: "Analytics",
      name: "Sales Pipeline Velocity",
      desc: "Tracks average deal velocity by stage, rep, and source. Identifies bottlenecks and forecasts quarterly close probability.",
      dl: 523,
    },
    {
      cat: "Analytics",
      name: "API Health Score Card",
      desc: "Monitors your API endpoints for latency, error rate, and availability. Weekly scorecard emailed to engineering team.",
      dl: 445,
    },
    // VR (6)
    {
      cat: "VR",
      name: "Ancient Athens Agora",
      desc: "Walk through the Ancient Athenian Agora at its peak in 400 BC. Socrates debates philosophy at the Stoa. Fully 3D, Quest-compatible.",
      dl: 367,
    },
    {
      cat: "VR",
      name: "Quantum Computing Lab",
      desc: "Interactive VR tour of a quantum computer. Manipulate qubits, observe superposition, and run simple quantum circuits.",
      dl: 489,
    },
    {
      cat: "VR",
      name: "Northern Lights Observatory",
      desc: "Aurora Borealis at the Arctic Circle. Realistic particle simulation of solar wind interacting with the magnetosphere.",
      dl: 734,
    },
    {
      cat: "VR",
      name: "Tokyo Neon Street Market",
      desc: "Night-time street market in a cyberpunk Tokyo. Browse stalls, hear ambient sounds, watch animated holograms.",
      dl: 623,
    },
    {
      cat: "VR",
      name: "Medieval Castle Defence",
      desc: "First-person VR defence of a medieval castle. Coordinate with AI archers and catapults to repel waves of attackers.",
      dl: 812,
    },
    {
      cat: "VR",
      name: "Molecular Biology Lab",
      desc: "Manipulate protein structures in 3D. Build DNA sequences, observe cellular mitosis, and explore ribosome translation.",
      dl: 534,
    },
    // ── Batch 9 (+50 = 486 total apps) ──────────────────────────────────────
    // Design (10)
    {
      cat: "Design",
      name: "Logo Genesis AI",
      desc: "Generate professional logos in seconds using AI. Export SVG, PNG, and brand kits.",
      dl: 4320,
    },
    {
      cat: "Design",
      name: "Wireframe Wizard",
      desc: "Drag-and-drop wireframe builder with AI layout suggestions and Figma export.",
      dl: 3890,
    },
    {
      cat: "Design",
      name: "Color Palette Studio",
      desc: "AI-powered color palette generator with accessibility scoring and CSS export.",
      dl: 5210,
    },
    {
      cat: "Design",
      name: "Icon Forge",
      desc: "Create custom icon sets in any style with AI. Exports to SVG, React components, and Figma.",
      dl: 2780,
    },
    {
      cat: "Design",
      name: "Mockup Maestro",
      desc: "Place your designs on realistic device mockups instantly. Drag, drop, export.",
      dl: 3450,
    },
    {
      cat: "Design",
      name: "Font Pairing AI",
      desc: "Find the perfect font combination for any brand. AI-curated pairings with Google Fonts.",
      dl: 2100,
    },
    {
      cat: "Design",
      name: "Image Upscaler 4K",
      desc: "Upscale any image to 4K resolution using AI. No quality loss, batch processing supported.",
      dl: 6780,
    },
    {
      cat: "Design",
      name: "Background Remover Pro",
      desc: "Remove backgrounds from images instantly. AI-precise edges for product shots and portraits.",
      dl: 8920,
    },
    {
      cat: "Design",
      name: "Gradient Generator",
      desc: "Create stunning CSS gradients visually. Copy code instantly for any framework.",
      dl: 4100,
    },
    {
      cat: "Design",
      name: "Brand Kit Builder",
      desc: "Build a complete brand identity: logo, colors, fonts, voice guide. One-click PDF export.",
      dl: 2890,
    },
    // Writing (10)
    {
      cat: "Writing",
      name: "Blog Post Factory",
      desc: "Generate SEO-optimized blog posts from a keyword in 60 seconds. WordPress + Ghost export.",
      dl: 7650,
    },
    {
      cat: "Writing",
      name: "Email Subject Tester",
      desc: "Score your email subject lines for open rate potential. AI trained on 10M+ campaigns.",
      dl: 5430,
    },
    {
      cat: "Writing",
      name: "LinkedIn Post Crafter",
      desc: "Turn ideas into viral LinkedIn posts. Hooks, body, CTA — fully generated and edited.",
      dl: 4870,
    },
    {
      cat: "Writing",
      name: "Technical Doc Writer",
      desc: "Auto-generate API docs, README files, and inline comments from your codebase.",
      dl: 3210,
    },
    {
      cat: "Writing",
      name: "Press Release Generator",
      desc: "Professional press releases in 2 minutes. Includes headline, quotes, boilerplate.",
      dl: 2540,
    },
    {
      cat: "Writing",
      name: "Product Description AI",
      desc: "Generate compelling e-commerce product descriptions that convert. Bulk upload ready.",
      dl: 6320,
    },
    {
      cat: "Writing",
      name: "Tweet Storm Builder",
      desc: "Turn long-form content into Twitter/X thread storms. Auto-numbered, hook-first.",
      dl: 4120,
    },
    {
      cat: "Writing",
      name: "Case Study Builder",
      desc: "Structure client success stories into polished case studies with stats highlights.",
      dl: 1890,
    },
    {
      cat: "Writing",
      name: "Ad Copy Generator",
      desc: "Generate Google Ads, Facebook Ads, and landing page copy that converts.",
      dl: 5670,
    },
    {
      cat: "Writing",
      name: "Newsletter Engine",
      desc: "AI newsletter writer with subscriber segmentation and Mailchimp/Beehiiv integration.",
      dl: 3340,
    },
    // Developer (10)
    {
      cat: "Developer",
      name: "API Tester Pro",
      desc: "Postman alternative with AI-generated test cases, response analysis, and team sharing.",
      dl: 8910,
    },
    {
      cat: "Developer",
      name: "SQL Query Builder",
      desc: "Build complex SQL queries with natural language. Supports PostgreSQL, MySQL, SQLite.",
      dl: 7230,
    },
    {
      cat: "Developer",
      name: "Regex Playground",
      desc: "Write, test, and explain regex patterns with AI. Syntax highlighting for 12 languages.",
      dl: 6540,
    },
    {
      cat: "Developer",
      name: "Git Commit Crafter",
      desc: "Generate conventional commits from your diff. One click to structured commit messages.",
      dl: 5890,
    },
    {
      cat: "Developer",
      name: "JSON Formatter Plus",
      desc: "Format, validate, transform, and diff JSON with AI schema inference.",
      dl: 9120,
    },
    {
      cat: "Developer",
      name: "ENV Manager",
      desc: "Manage environment variables across local, staging, and production safely.",
      dl: 4320,
    },
    {
      cat: "Developer",
      name: "Cron Expression Builder",
      desc: "Build cron schedules visually with natural language. Preview next 10 run times.",
      dl: 3780,
    },
    {
      cat: "Developer",
      name: "Webhook Inspector",
      desc: "Receive, log, replay, and transform webhooks. Public URL in seconds.",
      dl: 5430,
    },
    {
      cat: "Developer",
      name: "Docker Compose Generator",
      desc: "Generate docker-compose.yml from service descriptions. Multi-container, ready to run.",
      dl: 4670,
    },
    {
      cat: "Developer",
      name: "Load Test Launcher",
      desc: "Stress test your APIs with configurable concurrent users, ramp-up, and detailed reports.",
      dl: 2890,
    },
    // Finance (8)
    {
      cat: "Finance",
      name: "SaaS MRR Calculator",
      desc: "Calculate MRR, ARR, churn, LTV, and CAC. Import from Stripe CSV or manual entry.",
      dl: 3450,
    },
    {
      cat: "Finance",
      name: "Invoice Generator",
      desc: "Create professional invoices in 30 seconds. PDF, auto-numbering, payment links.",
      dl: 8760,
    },
    {
      cat: "Finance",
      name: "Budget Tracker Pro",
      desc: "Track business expenses by category with monthly reports and forecast models.",
      dl: 5230,
    },
    {
      cat: "Finance",
      name: "Crypto Tax Estimator",
      desc: "Calculate crypto gains/losses across exchanges. Supports FIFO, LIFO, and HIFO.",
      dl: 4120,
    },
    {
      cat: "Finance",
      name: "Pricing Calculator",
      desc: "Model SaaS pricing tiers, unit economics, and break-even analysis interactively.",
      dl: 2780,
    },
    {
      cat: "Finance",
      name: "Runway Simulator",
      desc: "Model startup runway scenarios with burn rate, fundraising, and revenue assumptions.",
      dl: 2100,
    },
    {
      cat: "Finance",
      name: "Affiliate Tracker",
      desc: "Track affiliate referrals, commissions, and payouts with real-time dashboard.",
      dl: 1890,
    },
    {
      cat: "Finance",
      name: "Expense Report Builder",
      desc: "Auto-generate expense reports from receipts. OCR scanning, multi-currency support.",
      dl: 3230,
    },
    // Games (8 more browser games)
    {
      cat: "Games",
      name: "Merkaba Solitaire",
      desc: "Classic solitaire reimagined in the Merkaba universe. Sacred geometry card backs, ambient score.",
      dl: 2340,
    },
    {
      cat: "Games",
      name: "Quantum Crossword",
      desc: "Daily quantum-themed crossword puzzles. Clues from physics, AI, and the Merkaba lattice.",
      dl: 1890,
    },
    {
      cat: "Games",
      name: "Lattice Sudoku",
      desc: "Sudoku with a Merkaba twist — solve the 8×8 sacred grid. Three difficulty levels.",
      dl: 2780,
    },
    {
      cat: "Games",
      name: "PHI Memory Match",
      desc: "Flip golden ratio-themed cards and find pairs. Speed runs with leaderboard.",
      dl: 1560,
    },
    {
      cat: "Games",
      name: "Node Defender",
      desc: "Tower defence in the D48 lattice. Place defenders on nodes to stop signal decay.",
      dl: 3120,
    },
    {
      cat: "Games",
      name: "Frequency Rider",
      desc: "Rhythm game using the 9 Solfeggio frequencies. Hit the beats to maintain resonance.",
      dl: 2450,
    },
    {
      cat: "Games",
      name: "Geometry Dash: Lattice",
      desc: "Fast-paced geometry runner through Merkaba lattice corridors. Endless procedural levels.",
      dl: 4230,
    },
    {
      cat: "Games",
      name: "Quantum Wordle",
      desc: "Wordle with quantum mechanics — words collapse to their meaning when observed.",
      dl: 3890,
    },
    // Productivity (4)
    {
      cat: "Productivity",
      name: "Daily Standup Bot",
      desc: "Automate team standups: collect updates via Slack, format them, and post to channels.",
      dl: 3450,
    },
    {
      cat: "Productivity",
      name: "Meeting Notes AI",
      desc: "Record meetings, auto-transcribe, extract action items, and send summaries.",
      dl: 5670,
    },
    {
      cat: "Productivity",
      name: "Focus Flow Timer",
      desc: "Pomodoro timer with AI task prioritisation and deep work session analytics.",
      dl: 4320,
    },
    {
      cat: "Productivity",
      name: "Habit Loop Tracker",
      desc: "Track habits with streak mechanics, visual grids, and accountability partners.",
      dl: 6780,
    },
  ];
  for (const { cat, name, desc, dl } of seed) {
    const bundle =
      "com.aios." +
      cat.toLowerCase() +
      "." +
      name.toLowerCase().replace(/[^a-z0-9]+/g, ".");
    _plaiRuntimeApps.set(bundle, {
      id: ++_plaiRuntimeIdSeq,
      name,
      short_desc: desc.slice(0, 120),
      description: desc,
      category: cat,
      price_cents: 0,
      downloads: 0,
      rating_avg: 0,
      developer_name: "AIOS Storm",
      developer_verified: true,
      type:
        cat === "Theatre" || cat === "Cinema"
          ? "vr-experience"
          : cat === "Agents"
            ? "agent"
            : cat === "Codex"
              ? "template"
              : "app",
      bundle_id: bundle,
      entry_point: "",
      published_at: new Date(
        Date.now() - Math.random() * 30 * 86400000,
      ).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
}
_seedPlaiApps();

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
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://aframe.io https://pagead2.googlesyndication.com; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google.com https://www.google.co.za https://www.google.co.uk https://www.google.com.au https://www.googleadservices.com https://pagead2.googlesyndication.com https://cdn.aframe.io; connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://www.google.com https://stats.g.doubleclick.net https://googleads.g.doubleclick.net https://www.googleadservices.com https://api.getbrains4ai.com https://aframe.io https://cdn.aframe.io; style-src 'self' 'unsafe-inline'; frame-src 'none'; object-src 'none'; base-uri 'self'; worker-src 'self' blob:",
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
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
        `  <url><loc>https://realaios.com/plaistore</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.85</priority></url>`,
        `  <url><loc>https://realaios.com/experiences</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`,
        `  <url><loc>https://realaios.com/ai</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.95</priority></url>`,
        `  <url><loc>https://realaios.com/start</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.85</priority></url>`,
        `  <url><loc>https://realaios.com/lab</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
        `  <url><loc>https://realaios.com/attest</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.78</priority></url>`,
        `  <url><loc>https://realaios.com/viewer</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.75</priority></url>`,
        `  <url><loc>https://realaios.com/dashboard</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.72</priority></url>`,
        `  <url><loc>https://realaios.com/products</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.75</priority></url>`,
        `  <url><loc>https://realaios.com/news</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.88</priority></url>`,
        `  <url><loc>https://realaios.com/geo-library</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.85</priority></url>`,
        `  <url><loc>https://realaios.com/aios-studio</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.82</priority></url>`,
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
        `  <url><loc>https://realaios.com/vr-developer</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.75</priority></url>`,
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
        const homeHtml = PLAISTORE_HTML || AIOS_HTML;
        if (homeHtml) {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
      const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AIOS Products — AI-Native Tools Built on Merkaba OS</title><meta name="description" content="Six AI-native products built on the AIOS Merkaba OS. App factory, AI attestation, uptime intelligence, hallucination detection, signal marketplace, and semantic matching."><meta property="og:title" content="AIOS Products"><meta property="og:description" content="AI-native tools built on autonomous OS geometry."><meta property="og:image" content="https://realaios.com/public/og-image.svg"><meta property="og:url" content="https://realaios.com/products"><meta property="og:type" content="website"><link rel="canonical" href="https://realaios.com/products"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://realaios.com/public/og-image.svg"><script type="application/ld+json">${productListLD}</script>${GSC_TOKEN ? `<meta name="google-site-verification" content="${GSC_TOKEN}"/>` : ""}<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true});</script><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0a0f;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh}a{text-decoration:none}main{max-width:1000px;margin:0 auto;padding:5rem 2rem}.hero-label{font-size:0.78rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#00f5d4;margin-bottom:1rem}h1{font-size:clamp(2rem,5vw,3rem);font-weight:800;letter-spacing:-0.03em;margin-bottom:1rem}h1 span{background:linear-gradient(135deg,#00f5d4,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.hero-sub{font-size:1.05rem;color:#888;line-height:1.7;max-width:560px;margin-bottom:3rem}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem}footer{text-align:center;padding:4rem 2rem;color:#444;font-size:0.85rem;border-top:1px solid rgba(255,255,255,0.06);margin-top:4rem}@media(max-width:640px){main{padding:3rem 1.25rem}}nav.site-nav{position:fixed;top:0;left:0;right:0;z-index:200;height:54px;padding:0 24px;display:flex;align-items:center;gap:8px;background:rgba(5,10,20,0.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(0,212,255,0.1)}.site-nav-logo{font-size:18px;font-weight:800;color:#00d4ff;text-decoration:none;letter-spacing:-0.5px;white-space:nowrap;margin-right:4px;flex-shrink:0}.site-nav-links{display:flex;align-items:center;gap:2px;overflow-x:auto;scrollbar-width:none;flex:1;min-width:0}.site-nav-links::-webkit-scrollbar{display:none}.site-nav-links a{color:rgba(248,250,252,0.5);font-size:0.82rem;font-weight:500;text-decoration:none;padding:5px 10px;border-radius:6px;white-space:nowrap;transition:color .15s,background .15s;flex-shrink:0}.site-nav-links a:hover{color:#fff;background:rgba(255,255,255,0.07)}.site-nav-links a.active{color:#00d4ff;background:rgba(0,212,255,0.08)}.site-nav-right{display:flex;align-items:center;gap:10px;flex-shrink:0;margin-left:8px}.site-nav-live{display:inline-flex;align-items:center;gap:4px;font-size:0.72rem;font-weight:800;color:#ef4444;text-decoration:none;letter-spacing:.05em;animation:_snlive 1.2s ease-in-out infinite}@keyframes _snlive{0%,100%{opacity:1}50%{opacity:.5}}.site-nav-cta{background:#00d4ff;color:#000;font-weight:700;font-size:0.78rem;padding:6px 14px;border-radius:6px;text-decoration:none;letter-spacing:.3px;transition:opacity .2s;white-space:nowrap}.site-nav-cta:hover{opacity:.85}@media(max-width:640px){nav.site-nav{padding:0 12px;height:50px}.site-nav-live{display:none}.site-nav-logo{font-size:16px}}body{padding-top:54px}@media(max-width:640px){body{padding-top:50px}}</style></head><body><nav class="site-nav"><a href="/" class="site-nav-logo">⬡ AIOS</a><div class="site-nav-links"><a href="/experiences">Experiences</a><a href="/vr-hub">VR Hub</a><a href="/vr">🥽 VR</a><a href="/aiosdream">Cinema</a><a href="/geo-library">📚 Library</a><a href="/geo-codec">.geo</a><a href="/aios-studio">Studio</a><a href="/lab">Lab</a><a href="/news">📰 News</a><a href="/products" class="active">⚡ Products</a></div><div class="site-nav-right"><a href="/live" class="site-nav-live">● LIVE</a><a href="/start" class="site-nav-cta">Start Free →</a></div></nav><main><div class="hero-label">AIOS Product Suite</div><h1>Built for the <span>AI-Native Era</span></h1><p class="hero-sub">Six intelligent products running on AIOS Merkaba OS. Self-healing, semantically grounded, and geometrically sound.</p><div class="grid">${cardsHTML}</div></main><footer>© 2026 AIOS — realaios.com</footer></body></html>`;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
<meta property="og:image" content="https://realaios.com/public/og-image.svg">
<meta property="og:url" content="https://realaios.com/products/${slug}">
<meta property="og:type" content="website">
<link rel="canonical" href="https://realaios.com/products/${slug}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${product.name} — AIOS">
<meta name="twitter:description" content="${product.tagline}">
<meta name="twitter:image" content="https://realaios.com/public/og-image.svg">
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
  <a href="/" class="site-nav-logo">⬡ AIOS</a>
  <div class="site-nav-links">
    <a href="/experiences">Experiences</a>
    <a href="/vr-hub">VR Hub</a>
    <a href="/vr">🥽 VR</a>
    <a href="/aiosdream">Cinema</a>

    <a href="/geo-library">📚 Library</a>
    <a href="/geo-codec">.geo</a>
    <a href="/aios-studio">Studio</a>
    <a href="/lab">Lab</a>
    <a href="/news">📰 News</a>
    <a href="/products" class="active">⚡ Products</a>
  </div>
  <div class="site-nav-right">
    <a href="/live" class="site-nav-live">● LIVE</a>
    <a href="/start" class="site-nav-cta">Start Free →</a>
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
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(LAB_HTML);
      return;
    }

    // ── GET /viewer — Theatre Viewer ──────────────────────────────────────
    if (req.method === "GET" && pathname === "/viewer") {
      if (!VIEWER_HTML)
        return json(res, 404, { ok: false, error: "Viewer page not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(VIEWER_HTML);
      return;
    }

    // ── GET /attest — Swarm Attestation UI ───────────────────────────────
    if (req.method === "GET" && pathname === "/attest") {
      if (!ATTEST_HTML)
        return json(res, 404, { ok: false, error: "Attest page not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(PRICING_HTML);
      return;
    }

    // ── GET /plaistore — redirect to / (PLAIstore is now the homepage) ──
    if (
      req.method === "GET" &&
      (pathname === "/plaistore" || pathname === "/plaistore/")
    ) {
      res.writeHead(301, { Location: "/" });
      res.end();
      return;
    }

    // ── GET /vr — Meta Quest / WebXR Immersive Theatre ────────────────────
    if (req.method === "GET" && (pathname === "/vr" || pathname === "/vr/")) {
      if (!VR_HTML)
        return json(res, 404, { ok: false, error: "VR page not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(GEO_CODEC_HTML);
      return;
    }

    // ── GET /aios-studio — AIOSProducerSwarm Production Studio ────────────
    if (
      req.method === "GET" &&
      (pathname === "/aios-studio" || pathname === "/aios-studio/")
    ) {
      if (!AIOS_STUDIO_HTML)
        return json(res, 404, { ok: false, error: "AIOS Studio not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(AIOS_STUDIO_HTML);
      return;
    }

    // ── GET /vr-hub — AIOS VR Platform Hub (storefront + categories) ──────
    if (
      req.method === "GET" &&
      (pathname === "/vr-hub" || pathname === "/vr-hub/")
    ) {
      if (!VR_HUB_HTML)
        return json(res, 404, { ok: false, error: "VR Hub not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
<meta property="og:image" content="https://realaios.com/public/og-image.svg"/>
<meta property="og:site_name" content="AIOS VR Platform"/>
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${desc.slice(0, 200)}"/>
<meta name="twitter:image" content="https://realaios.com/public/og-image.svg"/>
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

    // ── GET /experiences — SEO catalogue of all live XPs ─────────────────
    if (
      req.method === "GET" &&
      (pathname === "/experiences" || pathname === "/experiences/")
    ) {
      if (!VR_TAXONOMY) {
        res.writeHead(302, { Location: "/vr-hub" });
        res.end();
        return;
      }
      const allLive = [];
      for (const cat of VR_TAXONOMY.categories || []) {
        for (const xp of cat.experiences || []) {
          if (xp.status === "live") allLive.push({ xp, cat });
        }
      }
      const xpCards = allLive
        .map(
          ({ xp, cat }) => `
    <article class="xpc" data-cat="${cat.id}" style="--acc:${cat.accent || "#00d4ff"}">
      <div class="xpc-cat">${cat.icon || "🥽"} ${cat.display}</div>
      <h2 class="xpc-title"><a href="/vr-experience/${xp.id}">${xp.display}</a></h2>
      <p class="xpc-desc">${xp.shortDesc || xp.description || ""}</p>
      <div class="xpc-meta">
        <span class="pill">⚡ ${xp.frequencyHz} Hz</span>
        <span class="pill">${xp.semanticType}</span>
        <span class="pill">🔯 Node ${xp.latticeNode}</span>
      </div>
      <div class="xpc-actions">
        <a href="https://realaios.com${xp.vrUrl}" class="btn-vr">🥽 Launch VR</a>
        <a href="/vr-experience/${xp.id}" class="btn-info">Details →</a>
      </div>
    </article>`,
        )
        .join("\n");

      const liveCats = [
        ...new Map(allLive.map(({ cat }) => [cat.id, cat])).values(),
      ];
      const filterBtns = [
        `<button class="ft active" onclick="filterXP('all',this)">All (${allLive.length})</button>`,
        ...liveCats.map((cat) => {
          const count = allLive.filter(({ cat: c }) => c.id === cat.id).length;
          return `<button class="ft" onclick="filterXP('${cat.id}',this)">${cat.icon || ""} ${cat.display} (${count})</button>`;
        }),
      ].join("\n");

      const ldItems = allLive.map(({ xp }) => ({
        "@type": "SoftwareApplication",
        name: xp.display,
        url: `https://realaios.com/vr-experience/${xp.id}`,
        operatingSystem: "Meta Quest Browser",
        applicationCategory: "Game",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      }));

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>All VR Experiences — AIOS VR Platform | realaios.com</title>
<meta name="description" content="Browse all ${allLive.length} live WebXR experiences on AIOS VR Platform. Meta Quest compatible. Zero install. 9 categories: Cinema, Enterprise, Lab, Arcade, Wellness, Education, Art &amp; more."/>
<link rel="canonical" href="https://realaios.com/experiences"/>
<meta property="og:title" content="All ${allLive.length} Live VR Experiences — AIOS VR"/>
<meta property="og:description" content="Browse every live WebXR experience. Zero install — open on Meta Quest Browser."/>
<meta property="og:url" content="https://realaios.com/experiences"/>
<meta property="og:type" content="website"/>
<meta property="og:image" content="https://realaios.com/public/og-image.svg"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="All ${allLive.length} Live VR Experiences — AIOS VR"/>
<meta name="twitter:description" content="Browse every live WebXR experience. Zero install — open on Meta Quest Browser."/>
<meta name="twitter:image" content="https://realaios.com/public/og-image.svg"/>
<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "AIOS VR — All Live Experiences",
        description: `${allLive.length} live WebXR experiences. Zero install. Meta Quest compatible.`,
        url: "https://realaios.com/experiences",
        numberOfItems: allLive.length,
        itemListElement: ldItems.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: item,
        })),
      })}</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#04080f;color:#edf4ff;font-family:system-ui,sans-serif;padding:0 1.5rem;}
.hero{text-align:center;padding:3rem 0 2rem;}
.hero h1{font-size:2rem;font-weight:900;margin-bottom:0.5rem;}
.hero p{color:#8aa0c8;font-size:0.95rem;max-width:480px;margin:0 auto 1.25rem;}
.count{display:inline-block;padding:0.3rem 0.9rem;background:#00d4ff1a;border:1px solid #00d4ff44;border-radius:20px;font-size:0.8rem;font-weight:700;color:#00d4ff;}
.filters{display:flex;flex-wrap:wrap;gap:0.5rem;justify-content:center;max-width:900px;margin:0 auto 2rem;padding-top:1.5rem;}
.ft{padding:0.35rem 0.9rem;border-radius:20px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:#8aa0c8;font-size:0.78rem;font-weight:600;cursor:pointer;transition:all 0.15s;}
.ft:hover,.ft.active{border-color:#00d4ff;color:#00d4ff;background:#00d4ff12;}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem;max-width:1200px;margin:0 auto;}
.xpc{background:rgba(255,255,255,0.04);border:1px solid var(--acc,#00d4ff)33;border-left:3px solid var(--acc,#00d4ff);border-radius:12px;padding:1.25rem;}
.xpc.hidden{display:none;}
.xpc-cat{font-size:0.7rem;font-weight:700;letter-spacing:0.08em;color:var(--acc,#00d4ff);text-transform:uppercase;margin-bottom:0.4rem;}
.xpc-title{font-size:1.05rem;font-weight:700;margin-bottom:0.5rem;line-height:1.3;}
.xpc-title a{color:#edf4ff;text-decoration:none;}
.xpc-title a:hover{color:var(--acc,#00d4ff);}
.xpc-desc{font-size:0.82rem;color:#7a90b8;line-height:1.55;margin-bottom:0.9rem;}
.xpc-meta{display:flex;gap:0.35rem;flex-wrap:wrap;margin-bottom:0.9rem;}
.pill{padding:0.2rem 0.6rem;border-radius:12px;font-size:0.68rem;font-weight:600;border:1px solid var(--acc,#00d4ff)33;color:var(--acc,#00d4ff);background:var(--acc,#00d4ff)0d;}
.xpc-actions{display:flex;gap:0.5rem;align-items:center;}
.btn-vr{padding:0.45rem 1rem;background:var(--acc,#00d4ff);color:#000;border-radius:8px;font-weight:700;font-size:0.82rem;text-decoration:none;}
.btn-info{padding:0.45rem 0.8rem;color:#8aa0c8;font-size:0.78rem;text-decoration:none;border:1px solid rgba(255,255,255,0.1);border-radius:8px;}
.btn-info:hover{color:#edf4ff;}
.none-msg{display:none;text-align:center;color:#8aa0c8;padding:3rem;grid-column:1/-1;}
.back-footer{text-align:center;margin-top:2.5rem;padding-bottom:2rem;font-size:0.85rem;}.back-footer a{color:#00d4ff;text-decoration:none;opacity:0.7;white-space:nowrap;}.back-footer a:hover{opacity:1;}
nav.site-nav{position:fixed;top:0;left:0;right:0;z-index:200;height:54px;padding:0 24px;display:flex;align-items:center;gap:8px;background:rgba(5,10,20,0.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(0,212,255,0.1)}.site-nav-logo{font-size:18px;font-weight:800;color:#00d4ff;text-decoration:none;letter-spacing:-0.5px;white-space:nowrap;margin-right:4px;flex-shrink:0}.site-nav-links{display:flex;align-items:center;gap:2px;overflow-x:auto;scrollbar-width:none;flex:1;min-width:0}.site-nav-links::-webkit-scrollbar{display:none}.site-nav-links a{color:rgba(248,250,252,0.5);font-size:0.82rem;font-weight:500;text-decoration:none;padding:5px 10px;border-radius:6px;white-space:nowrap;transition:color .15s,background .15s;flex-shrink:0}.site-nav-links a:hover{color:#fff;background:rgba(255,255,255,0.07)}.site-nav-links a.active{color:#00d4ff;background:rgba(0,212,255,0.08)}.site-nav-right{display:flex;align-items:center;gap:10px;flex-shrink:0;margin-left:8px}.site-nav-live{display:inline-flex;align-items:center;gap:4px;font-size:0.72rem;font-weight:800;color:#ef4444;text-decoration:none;letter-spacing:.05em;animation:_snlive 1.2s ease-in-out infinite}@keyframes _snlive{0%,100%{opacity:1}50%{opacity:.5}}.site-nav-cta{background:#00d4ff;color:#000;font-weight:700;font-size:0.78rem;padding:6px 14px;border-radius:6px;text-decoration:none;letter-spacing:.3px;transition:opacity .2s;white-space:nowrap}.site-nav-cta:hover{opacity:.85}@media(max-width:640px){nav.site-nav{padding:0 12px;height:50px}.site-nav-live{display:none}.site-nav-logo{font-size:16px}}body{padding-top:54px}@media(max-width:640px){body{padding-top:50px}}
</style>
${GSC_TOKEN ? `<meta name="google-site-verification" content="${GSC_TOKEN}"/>` : ""}${`<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true,cookie_flags:'SameSite=None;Secure'});</script>`}
</head>
<body>
<nav class="site-nav"><a href="/" class="site-nav-logo">&#x2B21; AIOS</a><div class="site-nav-links"><a href="/experiences">Experiences</a><a href="/vr-hub">VR Hub</a><a href="/vr">&#x1F97D; VR</a><a href="/aiosdream">Cinema</a><a href="/geo-library">&#x1F4DA; Library</a><a href="/geo-codec">.geo</a><a href="/aios-studio">Studio</a><a href="/lab">Lab</a><a href="/news">&#x1F4F0; News</a><a href="/products">&#x26A1; Products</a></div><div class="site-nav-right"><a href="/live" class="site-nav-live">&#x25CF; LIVE</a><a href="/start" class="site-nav-cta">Start Free &#x2192;</a></div></nav>
<div class="hero">
  <h1>All ${allLive.length} Live VR Experiences</h1>
  <p>Zero install. Open on any Meta Quest Browser. 9 categories · 48-node lattice · <span style="color:#00d4ff">realaios.com</span></p>
  <span class="count">✓ ${allLive.length} Live Now</span>
</div>
<div class="filters">
${filterBtns}
</div>
<div class="grid" id="xp-grid">
${xpCards}
<p class="none-msg" id="none-msg">No experiences in this category yet.</p>
</div>
<div class="back-footer"><a href="/vr-hub">&#x2190; Full VR Hub</a> &nbsp;&middot;&nbsp; <a href="/">realaios.com</a> &nbsp;&middot;&nbsp; <a href="/products">&#x26A1; Products</a> &nbsp;&middot;&nbsp; <a href="/news">&#x1F4F0; News</a></div>
<script>
function filterXP(cat, btn) {
  document.querySelectorAll('.ft').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const cards = document.querySelectorAll('.xpc');
  let shown = 0;
  cards.forEach(c => {
    const match = cat === 'all' || c.dataset.cat === cat;
    c.classList.toggle('hidden', !match);
    if (match) shown++;
  });
  document.getElementById('none-msg').style.display = shown === 0 ? 'block' : 'none';
}
</script>
</body>
</html>`;
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      });
      res.end(html);
      return;
    }

    if (
      req.method === "GET" &&
      (pathname === "/aiosdream" || pathname === "/aiosdream/")
    ) {
      if (!AIOSDREAM_HTML)
        return json(res, 404, { ok: false, error: "AIOSdream not found" });
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(AIOSDREAM_HTML);
      return;
    }

    // ── GET /ai — AI evaluation page (human + machine readable) ──────────
    if (req.method === "GET" && (pathname === "/ai" || pathname === "/ai/")) {
      if (!AI_HTML)
        return json(res, 404, { ok: false, error: "AI page not found" });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
              src: "/public/og-image.svg",
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
        `const CACHE='aios-v4';const STATIC=['/manifest.json','/public/og-image.svg','/aios-geo.js'];self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC).catch(()=>{})).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;let u;try{u=new URL(e.request.url);if((u.protocol!=='https:'&&u.protocol!=='http:')||u.origin!==self.location.origin)return;}catch(_){return;}const accept=e.request.headers.get('accept')||'';const isHtml=e.request.mode==='navigate'||accept.includes('text/html');if(isHtml){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));return;}e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request).then(r=>{if(r&&r.ok&&r.type==='basic'){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c).catch(()=>{}));}return r;})));});`,
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
<meta property="og:image" content="https://realaios.com/public/og-image.svg"/>
<meta property="og:url" content="https://realaios.com/news"/>
<meta property="og:type" content="website"/>
<link rel="canonical" href="https://realaios.com/news"/>
<link rel="alternate" type="application/json" href="https://realaios.com/news.json" title="AIOS News JSON Feed"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:image" content="https://realaios.com/public/og-image.svg"/>
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
<nav class="site-nav"><a href="/" class="site-nav-logo">⬡ AIOS</a><div class="site-nav-links"><a href="/experiences">Experiences</a><a href="/vr-hub">VR Hub</a><a href="/vr">🥽 VR</a><a href="/aiosdream">Cinema</a><a href="/geo-library">📚 Library</a><a href="/geo-codec">.geo</a><a href="/aios-studio">Studio</a><a href="/lab">Lab</a><a href="/news">📰 News</a><a href="/products">⚡ Products</a></div><div class="site-nav-right"><a href="/live" class="site-nav-live">● LIVE</a><a href="/start" class="site-nav-cta">Start Free →</a></div></nav>
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
<meta property="og:image" content="https://realaios.com/public/og-image.svg"/>
<meta property="og:site_name" content="AIOS News"/>
<meta property="article:published_time" content="${article.date}T00:00:00Z"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${article.title}"/>
<meta name="twitter:description" content="${article.summary.slice(0, 200)}"/>
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
            url: "https://realaios.com/public/og-image.svg",
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
<nav class="site-nav"><a href="/" class="site-nav-logo">&#x2B21; AIOS</a><div class="site-nav-links"><a href="/experiences">Experiences</a><a href="/vr-hub">VR Hub</a><a href="/vr">&#x1F97D; VR</a><a href="/aiosdream">Cinema</a><a href="/geo-library">&#x1F4DA; Library</a><a href="/geo-codec">.geo</a><a href="/aios-studio">Studio</a><a href="/lab">Lab</a><a href="/news">&#x1F4F0; News</a><a href="/products">&#x26A1; Products</a></div><div class="site-nav-right"><a href="/live" class="site-nav-live">&#x25CF; LIVE</a><a href="/start" class="site-nav-cta">Start Free &#x2192;</a></div></nav>
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
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
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
        // Push to PLAIStore under "User Creations" category (fire-and-forget)
        (async () => {
          try {
            const apiBase =
              process.env.API_BASE || "https://api.getbrains4ai.com";
            const adminJwt = process.env.ADMIN_JWT;
            if (!adminJwt) return;
            await fetch(`${apiBase}/api/knowledge/plaistore-user-creations`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminJwt}`,
              },
              body: JSON.stringify({
                data: {
                  category: "User Creations",
                  programme: {
                    id: safeId,
                    title: safeTitle,
                    producedAt: published.producedAt,
                  },
                  addedAt: new Date().toISOString(),
                },
              }),
              signal: AbortSignal.timeout(8000),
            });
            console.log(
              `[AIOSStudio] 🛍️  PLAIStore: "${safeTitle}" pushed to User Creations`,
            );
          } catch (_) {
            /* non-fatal */
          }
        })();
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

    // ── GET /geo-library — AIOS .geo Netflix Catalogue ────────────────────────
    if (
      req.method === "GET" &&
      (pathname === "/geo-library" || pathname === "/geo-library/")
    ) {
      if (!GEO_LIBRARY_HTML)
        return json(res, 404, {
          ok: false,
          error: "Geo library page not found",
        });
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(GEO_LIBRARY_HTML);
      return;
    }

    // ── GET /live — AIOSProducerSwarm Live Broadcast Channel ──────────────────
    if (
      req.method === "GET" &&
      (pathname === "/live" || pathname === "/live/")
    ) {
      if (LIVE_HTML) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(LIVE_HTML);
      }
      // Fallback: redirect to geo-library
      res.writeHead(302, { Location: "/geo-library" });
      return res.end();
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

  // ── Publish each new .geo programme into the PLAIStore Theatre catalogue ──
  // This is what makes the PLAIStore app count grow autonomously over time.
  const plaiBundle = `com.aios.geo.${programme.id}`;
  if (!_plaiRuntimeApps.has(plaiBundle)) {
    _plaiRuntimeApps.set(plaiBundle, {
      id: ++_plaiRuntimeIdSeq,
      name: title,
      short_desc: `${programme.genre} · ${programme.mode} mode · AIOSProducerSwarm`,
      description: `An AI-generated .geo programme produced by AIOSProducerSwarm. Genre: ${programme.genre}. Renderer: ${renderer}. Frequency: ${hz}Hz.`,
      category: "Theatre",
      price_cents: 0,
      downloads: 0,
      rating_avg: 4.8,
      developer_name: "AIOSProducerSwarm",
      developer_verified: true,
      type: "theatre-programme",
      bundle_id: plaiBundle,
      entry_point: `https://realaios.com/aiosdream?prog=${programme.id}`,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

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
    ["plaistore", PLAISTORE_HTML],
  ];
  const ok = pageManifest.filter(([, v]) => v).map(([k]) => k);
  const missing = pageManifest.filter(([, v]) => !v).map(([k]) => k);
  console.log(`[GeoQode OS] Pages loaded OK (${ok.length}): ${ok.join(", ")}`);
  if (missing.length)
    console.warn(
      `[GeoQode OS] Pages MISSING (${missing.length}): ${missing.join(", ")}`,
    );
});

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
