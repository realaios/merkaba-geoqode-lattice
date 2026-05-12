// apply-canonical-nav.mjs — injects canonical site-nav CSS + HTML into all pages
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dir, "..", "public");

// ── Canonical CSS ─────────────────────────────────────────────────────────────
const CANON_CSS = `
    /* ── SITE-NAV (canonical) ──────────────────────────────────────────── */
    nav.site-nav{position:fixed;top:0;left:0;right:0;z-index:200;height:54px;padding:0 24px;display:flex;align-items:center;gap:8px;background:rgba(5,10,20,0.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(0,212,255,0.1);}
    .site-nav-logo{font-size:18px;font-weight:800;color:#00d4ff;text-decoration:none;letter-spacing:-0.5px;white-space:nowrap;margin-right:4px;flex-shrink:0;}
    .site-nav-links{display:flex;align-items:center;gap:2px;overflow-x:auto;scrollbar-width:none;flex:1;min-width:0;}
    .site-nav-links::-webkit-scrollbar{display:none;}
    .site-nav-links a{color:rgba(248,250,252,0.5);font-size:0.82rem;font-weight:500;text-decoration:none;padding:5px 10px;border-radius:6px;white-space:nowrap;transition:color .15s,background .15s;flex-shrink:0;}
    .site-nav-links a:hover{color:#fff;background:rgba(255,255,255,0.07);}
    .site-nav-links a.active{color:#00d4ff;background:rgba(0,212,255,0.08);}
    .site-nav-right{display:flex;align-items:center;gap:10px;flex-shrink:0;margin-left:8px;}
    .site-nav-live{display:inline-flex;align-items:center;gap:4px;font-size:0.72rem;font-weight:800;color:#ef4444;text-decoration:none;letter-spacing:.05em;animation:_snlive 1.2s ease-in-out infinite;}
    @keyframes _snlive{0%,100%{opacity:1}50%{opacity:.5}}
    .site-nav-cta{background:#00d4ff;color:#000;font-weight:700;font-size:0.78rem;padding:6px 14px;border-radius:6px;text-decoration:none;letter-spacing:.3px;transition:opacity .2s;white-space:nowrap;}
    .site-nav-cta:hover{opacity:.85;}
    @media(max-width:640px){nav.site-nav{padding:0 12px;height:50px;}.site-nav-live{display:none;}.site-nav-logo{font-size:16px;}}
`;

// ── Canonical nav HTML builder ────────────────────────────────────────────────
const ALL_LINKS = [
  ["/aiosdream", "Theatre"],
  ["/vr", "🥽 VR"],
  ["/vr-hub", "VR Hub"],
  ["/plaistore", "PLAIstore"],
  ["/geo-library", "📚 Library"],
  ["/geo-codec", ".geo"],
  ["/aios-studio", "Studio"],
  ["/lab", "Lab"],
  ["/news", "📰 News"],
  ["/products", "⚡ Products"],
];

function makeNav(activeHref) {
  const links = ALL_LINKS.map(([href, label]) => {
    const cls = href === activeHref ? ' class="active"' : "";
    return `        <a href="${href}"${cls}>${label}</a>`;
  }).join("\n");
  return `    <nav class="site-nav">
      <a href="/" class="site-nav-logo">⬡ AIOS</a>
      <div class="site-nav-links">
${links}
      </div>
      <div class="site-nav-right">
        <a href="/live" class="site-nav-live">● LIVE</a>
        <a href="/login" class="site-nav-cta">Login</a>
      </div>
    </nav>`;
}

// ── Pages: filename → active href ─────────────────────────────────────────────
// null = no active link (home, live, dashboard, ai)
const PAGES = {
  "index.html": null,
  "vr.html": "/vr",
  "vr-hub.html": "/vr-hub",
  "geo-library.html": "/geo-library",
  "geo-codec.html": "/geo-codec",
  "start.html": null,
  "lab.html": "/lab",
  "live.html": null,
  "dashboard.html": null,
  "ai.html": null,
};

// ── Run ───────────────────────────────────────────────────────────────────────
let ok = 0,
  fail = 0;
for (const [filename, activeHref] of Object.entries(PAGES)) {
  const filepath = path.join(PUBLIC, filename);
  let content = fs.readFileSync(filepath, "utf8");

  // 1. Inject canonical CSS before first </style>
  if (content.includes("site-nav-logo")) {
    console.log(`⚠  CSS already present, skipping inject: ${filename}`);
  } else {
    const styleEnd = content.indexOf("</style>");
    if (styleEnd === -1) {
      console.log(`❌ No </style> in ${filename}`);
      fail++;
      continue;
    }
    content =
      content.slice(0, styleEnd) +
      CANON_CSS +
      "    </style>" +
      content.slice(styleEnd + "</style>".length);
    console.log(`✅ CSS injected: ${filename}`);
  }

  // 2. Replace nav HTML — find first <nav after </head>
  const headEnd = content.indexOf("</head>");
  const bodyStart = headEnd === -1 ? 0 : headEnd;
  const navStart = content.indexOf("<nav", bodyStart);
  if (navStart === -1) {
    console.log(`❌ No <nav> in body: ${filename}`);
    fail++;
    continue;
  }
  const navEnd = content.indexOf("</nav>", navStart) + "</nav>".length;

  const newNav = makeNav(activeHref);
  content = content.slice(0, navStart) + newNav + content.slice(navEnd);
  console.log(`✅ Nav replaced: ${filename}`);

  fs.writeFileSync(filepath, content, "utf8");
  ok++;
}
console.log(`\nDone — ${ok} updated, ${fail} failed`);
