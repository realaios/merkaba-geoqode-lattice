/**
 * heal-stubs.mjs
 * Heals ALL stubs in aiosdream.html, vr-hub.html, vr.html
 * Run with: node heal-stubs.mjs  (from merkaba-geoqode-lattice/)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.join(__dirname, "public");
const ALLOW_VR_HTML_PATCH = process.env.ALLOW_VR_HTML_PATCH === "1";

function patch(file, label, find, replace) {
  const idx = file.indexOf(find);
  if (idx === -1) {
    console.error(`  ✗ MISSING: ${label}`);
    console.error(`    Looking for: ${JSON.stringify(find.slice(0, 80))}`);
    return file;
  }
  console.log(`  ✓ Patched: ${label}`);
  return file.slice(0, idx) + replace + file.slice(idx + find.length);
}

// ═══════════════════════════════════════════════════════════════
// 1. AIOSDREAM.HTML
// ═══════════════════════════════════════════════════════════════
console.log("\n[1] Healing aiosdream.html…");
let dream = fs.readFileSync(path.join(PUB, "aiosdream.html"), "utf8");
const NL = dream.includes("\r\n") ? "\r\n" : "\n"; // detect line ending

// 1a — fix nav search button
dream = patch(
  dream,
  "nav search button",
  `onclick="toast('Search coming soon')"`,
  `onclick="openSearch()" title="Search (Ctrl+K)"`,
);

// 1b — add search overlay CSS right before /* ── MOBILE ── */
const SEARCH_CSS = `
    /* ── SEARCH OVERLAY ── */
    .search-over {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 300;
      background: rgba(6,8,15,0.97); backdrop-filter: blur(28px);
      padding: 88px 52px 40px; overflow-y: auto;
      transform: translateY(-100%); transition: transform 0.36s cubic-bezier(.16,1,.3,1);
      pointer-events: none;
    }
    .search-over.open { transform: none; pointer-events: all; }
    .search-bar-row {
      display: flex; align-items: center; gap: 14px;
      border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 26px;
    }
    .search-bar-row .sb-icon { font-size: 26px; color: var(--muted); flex-shrink: 0; }
    .search-bar-row input {
      flex: 1; background: none; border: none; color: #fff;
      font-size: 22px; font-weight: 300; outline: none; font-family: inherit;
    }
    .search-bar-row input::placeholder { color: rgba(255,255,255,0.18); }
    .search-bar-row .sb-close {
      background: none; border: none; color: var(--muted);
      font-size: 17px; cursor: pointer; padding: 6px 10px;
      border-radius: 6px; transition: color 0.15s, background 0.15s;
    }
    .search-bar-row .sb-close:hover { color: #fff; background: rgba(255,255,255,0.06); }
    .search-label { font-size: 11px; font-weight: 700; letter-spacing: 2px;
      text-transform: uppercase; color: var(--muted); margin-bottom: 16px; }
    .search-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(190px,1fr)); gap: 12px;
    }
    .src-card {
      background: var(--card-bg); border-radius: 10px; overflow: hidden;
      cursor: pointer; border: 1px solid var(--border);
      transition: border-color 0.2s, transform 0.15s;
    }
    .src-card:hover { border-color: rgba(255,255,255,0.22); transform: translateY(-2px); }
    .src-accent-bar { height: 3px; }
    .src-thumb-box { height: 68px; display: flex; align-items: center; justify-content: center; font-size: 30px; }
    .src-body { padding: 10px 12px 14px; }
    .src-title { font-size: 13px; font-weight: 700; margin-bottom: 4px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .src-meta { font-size: 11px; color: var(--muted); }
    .src-no-res { grid-column: 1/-1; text-align: center; padding: 60px 20px;
      color: var(--muted); font-size: 15px; }
`;

dream = patch(
  dream,
  "search CSS before MOBILE",
  `    /* ── MOBILE ── */`,
  SEARCH_CSS + `    /* ── MOBILE ── */`,
);

// 1c — add search HTML overlay (before <!-- ── PLAYER ── -->)
const SEARCH_HTML = `<!-- ── SEARCH OVERLAY ── -->
<div id="search-overlay" class="search-over" role="search" aria-label="Search programmes">
  <div class="search-bar-row">
    <span class="sb-icon">⌕</span>
    <input id="search-input" type="text" placeholder="Search programmes, genres, themes…"
           autocomplete="off" spellcheck="false" />
    <button class="sb-close" id="search-close" title="Close (Esc)">✕</button>
  </div>
  <div class="search-label" id="search-label">All Programmes</div>
  <div class="search-grid" id="search-grid"></div>
</div>

`;

dream = patch(
  dream,
  "search HTML before PLAYER",
  `<!-- ── PLAYER ── -->`,
  SEARCH_HTML + `<!-- ── PLAYER ── -->`,
);

// 1d — wire audio into openPlayer (after startRenderer(); startPlayback();)
dream = patch(
  dream,
  "startAmbientAudio call in openPlayer",
  `  startRenderer();\n  startPlayback();`,
  `  startRenderer();\n  startAmbientAudio(prog.id);\n  startPlayback();`,
);

// 1e — wire audio stop into closePlayer (after saveProgress(); pausePlayback();)
dream = patch(
  dream,
  "stopAmbientAudio call in closePlayer",
  `  saveProgress();\n  pausePlayback();`,
  `  saveProgress();\n  stopAmbientAudio();\n  pausePlayback();`,
);

// 1f — add search + audio JS before closing </script></body></html>
const EXTRA_JS = `
// ═══════════════════════════════════════════════════════════════
// SEARCH ENGINE
// ═══════════════════════════════════════════════════════════════
let _searchOpen = false;

function openSearch() {
  _searchOpen = true;
  const ov = document.getElementById('search-overlay');
  ov.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('search-input').focus(), 55);
  renderSearchGrid('');
}

function closeSearch() {
  _searchOpen = false;
  document.getElementById('search-overlay').classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('search-input').value = '';
}

function renderSearchGrid(q) {
  const el = document.getElementById('search-grid');
  const label = document.getElementById('search-label');
  const matches = q
    ? CATALOGUE.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.genre.some(g => g.toLowerCase().includes(q)))
    : CATALOGUE;
  label.textContent = q
    ? \`\${matches.length} result\${matches.length !== 1 ? 's' : ''} for "\${q}"\`
    : 'All Programmes';
  if (!matches.length) {
    el.innerHTML = \`<div class="src-no-res">Nothing matched "\${q}" — try a genre or keyword</div>\`;
    return;
  }
  el.innerHTML = matches.map(p => \`
    <div class="src-card" onclick="closeSearch();openPlayer('\${p.id}',0)">
      <div class="src-accent-bar" style="background:\${p.accent}"></div>
      <div class="src-thumb-box" style="background:\${p.thumb}">\${p.icon}</div>
      <div class="src-body">
        <div class="src-title">\${p.title}</div>
        <div class="src-meta">\${p.year} · \${p.genre.slice(0,2).join(' · ')}</div>
      </div>
    </div>\`).join('');
}

document.getElementById('search-input').addEventListener('input', e => {
  renderSearchGrid(e.target.value.toLowerCase().trim());
});
document.getElementById('search-close').addEventListener('click', closeSearch);
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    _searchOpen ? closeSearch() : openSearch();
    return;
  }
  if (e.key === 'Escape' && _searchOpen) { closeSearch(); return; }
});

// ═══════════════════════════════════════════════════════════════
// AMBIENT AUDIO ENGINE (WebAudio API — no external samples)
// ═══════════════════════════════════════════════════════════════
const PROG_AUDIO_CFG = {
  matrix:    { hz: 852, wave: 'sawtooth', noise: 0.30, lfo: 0.21, fHz: 1800 },
  inception: { hz: 963, wave: 'sine',     noise: 0.15, lfo: 0.13, fHz: 2200 },
  apollo:    { hz: 417, wave: 'sine',     noise: 0.10, lfo: 0.09, fHz: 1200 },
  hyperspace:{ hz: 528, wave: 'sawtooth', noise: 0.40, lfo: 0.38, fHz: 3000 },
  nebula:    { hz: 396, wave: 'sine',     noise: 0.22, lfo: 0.07, fHz: 900  },
  neural:    { hz: 639, wave: 'square',   noise: 0.20, lfo: 0.28, fHz: 1600 },
  quantum:   { hz: 741, wave: 'sine',     noise: 0.18, lfo: 0.19, fHz: 1500 },
  merkaba:   { hz: 72,  wave: 'sine',     noise: 0.05, lfo: 0.05, fHz: 200  },
  phoenix:   { hz: 528, wave: 'sawtooth', noise: 0.50, lfo: 0.55, fHz: 3500 },
  ocean:     { hz: 417, wave: 'sine',     noise: 0.38, lfo: 0.06, fHz: 800  },
  escher:    { hz: 963, wave: 'triangle', noise: 0.12, lfo: 0.16, fHz: 2000 },
  chronos:   { hz: 417, wave: 'sine',     noise: 0.08, lfo: 0.11, fHz: 1100 },
};

let _audioCtx = null;
let _masterGain = null;
let _ambientNodes = [];

function _ensureAudio() {
  if (_audioCtx) return;
  _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  _masterGain = _audioCtx.createGain();
  _masterGain.gain.value = 0;
  _masterGain.connect(_audioCtx.destination);
}

function startAmbientAudio(progId) {
  try {
    _ensureAudio();
    stopAmbientAudio();
    if (_audioCtx.state === 'suspended') _audioCtx.resume();

    const cfg = PROG_AUDIO_CFG[progId] || PROG_AUDIO_CFG.merkaba;
    const ctx = _audioCtx;
    const now = ctx.currentTime;
    const volVal = parseFloat(document.getElementById('vol-slider').value);

    // Sub-bass drone at hz/4 — rumble layer
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.value = cfg.hz / 4;
    subGain.gain.value = 0.18;
    subOsc.connect(subGain);
    subGain.connect(_masterGain);
    subOsc.start();

    // Main harmonic tone through lowpass filter
    const mainOsc = ctx.createOscillator();
    const mainFilt = ctx.createBiquadFilter();
    const mainGain = ctx.createGain();
    mainOsc.type = cfg.wave;
    mainOsc.frequency.value = cfg.hz;
    mainFilt.type = 'lowpass';
    mainFilt.frequency.value = cfg.fHz;
    mainFilt.Q.value = 1.8;
    mainGain.gain.value = 0.07;
    mainOsc.connect(mainFilt);
    mainFilt.connect(mainGain);
    mainGain.connect(_masterGain);
    mainOsc.start();

    // PHI-rate LFO → modulates main gain (creates breathing pulse)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = cfg.lfo;
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    lfoGain.connect(mainGain.gain);
    lfo.start();

    _ambientNodes.push(subOsc, subGain, mainOsc, mainFilt, mainGain, lfo, lfoGain);

    // Filtered noise layer (texture/presence)
    if (cfg.noise > 0) {
      const sRate = ctx.sampleRate;
      const buf = ctx.createBuffer(1, sRate * 3, sRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = buf;
      noiseSrc.loop = true;
      const noiseFilt = ctx.createBiquadFilter();
      noiseFilt.type = 'bandpass';
      noiseFilt.frequency.value = cfg.hz * 0.6;
      noiseFilt.Q.value = 0.8;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = cfg.noise * 0.04;
      noiseSrc.connect(noiseFilt);
      noiseFilt.connect(noiseGain);
      noiseGain.connect(_masterGain);
      noiseSrc.start();
      _ambientNodes.push(noiseSrc, noiseFilt, noiseGain);
    }

    // Fade master gain in over 2.2s
    _masterGain.gain.setValueAtTime(0, now);
    _masterGain.gain.linearRampToValueAtTime(volVal * 0.22, now + 2.2);

  } catch (err) {
    // AudioContext may be blocked until user gesture — handled gracefully
  }
}

function stopAmbientAudio() {
  const nodes = _ambientNodes.splice(0);
  nodes.forEach(n => {
    try { if (n.stop) n.stop(); } catch (_) {}
    try { n.disconnect(); } catch (_) {}
  });
  if (_masterGain && _audioCtx) {
    try { _masterGain.gain.setValueAtTime(0, _audioCtx.currentTime); } catch (_) {}
  }
}

// Volume slider → wired to master gain
document.getElementById('vol-slider').addEventListener('input', e => {
  const v = parseFloat(e.target.value);
  if (_masterGain && _audioCtx) {
    _masterGain.gain.setTargetAtTime(v * 0.22, _audioCtx.currentTime, 0.1);
  }
  const btn = document.getElementById('ctrl-vol-btn');
  if (btn) btn.textContent = v === 0 ? '\\u{1F507}' : v < 0.45 ? '\\u{1F509}' : '\\u{1F50A}';
});

// Mute button — fire input event so audio follows
document.getElementById('ctrl-vol-btn').addEventListener('click', () => {
  const slider = document.getElementById('vol-slider');
  if (parseFloat(slider.value) > 0) {
    slider.dataset.prev = slider.value;
    slider.value = 0;
  } else {
    slider.value = slider.dataset.prev || '0.7';
  }
  slider.dispatchEvent(new Event('input'));
});

`;

dream = patch(
  dream,
  "search+audio JS block",
  `\n</script>\n</body>\n</html>`,
  EXTRA_JS + `\n</script>\n</body>\n</html>`,
);

fs.writeFileSync(path.join(PUB, "aiosdream.html"), dream, "utf8");
console.log(
  `  → aiosdream.html written: ${Buffer.byteLength(dream, "utf8")} bytes`,
);

// ═══════════════════════════════════════════════════════════════
// 2. VR-HUB.HTML
// ═══════════════════════════════════════════════════════════════
console.log("\n[2] Healing vr-hub.html…");
let hub = fs.readFileSync(path.join(PUB, "vr-hub.html"), "utf8");

// Helper: replace exact XP badge+entry block
function fixXP(label, titleStr, newProg) {
  const oldBlock = `          badge: "coming",\n          entry: "",\n        },`;
  // Find the block that belongs to this title
  const titleSearch = `title: "${titleStr}"`;
  const ti = hub.indexOf(titleSearch);
  if (ti === -1) {
    console.error(`  ✗ NOT FOUND title: ${titleStr}`);
    return;
  }
  // Find the next badge: "coming" after this title
  const bi = hub.indexOf(oldBlock, ti);
  if (bi === -1 || bi > ti + 600) {
    console.error(`  ✗ badge block not found after "${titleStr}"`);
    return;
  }
  const newBlock = `          badge: "live",\n          entry: "/vr?prog=${newProg}",\n        },`;
  hub = hub.slice(0, bi) + newBlock + hub.slice(bi + oldBlock.length);
  console.log(`  ✓ Promoted: ${label}`);
}

// LAB
fixXP("Solar System VR", "Solar System VR", "solar-system");
fixXP("Fractal Space", "Fractal Space", "fractal-space");
fixXP("Solfeggio Frequency Map", "Solfeggio Frequency Map", "solfeggio-map");

// EDUCATION
fixXP(
  "Mathematical Dimensions",
  "Mathematical Dimensions",
  "mathematical-dims",
);
fixXP(
  "Language Immersion Worlds",
  "Language Immersion Worlds",
  "language-immersion",
);

// ART
fixXP("Infinite AI Gallery", "Infinite AI Gallery", "ai-gallery");
fixXP("Generative Theatre", "Generative Theatre", "generative-theatre");

// SOCIAL
fixXP("AIOS Live Events", "AIOS Live Events", "live-events");
fixXP("Creator Studio", "Creator Studio", "creator-studio");
fixXP("AIOS Academy", "AIOS Academy", "aios-academy");

// WELLNESS — add badge + entry to items that have neither
hub = patch(
  hub,
  "Wellness: Ocean Presence badge+entry",
  `          emoji: "🌊",
          title: "Ocean Presence",
          freq: "417 Hz · Sacral",
          desc: "Infinite ocean horizon. 417 Hz spatial anchor tone. Pure presence.",
          color: "#00d4ff",
        },`,
  `          emoji: "🌊",
          title: "Ocean Presence",
          freq: "417 Hz · Sacral",
          desc: "Infinite ocean horizon. 417 Hz spatial anchor tone. Pure presence.",
          color: "#00d4ff",
          badge: "live",
          entry: "/vr?prog=ocean-presence",
        },`,
);

hub = patch(
  hub,
  "Wellness: 963 Hz Cosmos badge+entry",
  `          emoji: "🌌",
          title: "963 Hz Cosmos",
          freq: "963 Hz · Crown",
          desc: "Cosmic void with 963 Hz crown frequency. Universal consciousness field.",
          color: "#f59e0b",
        },`,
  `          emoji: "🌌",
          title: "963 Hz Cosmos",
          freq: "963 Hz · Crown",
          desc: "Cosmic void with 963 Hz crown frequency. Universal consciousness field.",
          color: "#f59e0b",
          badge: "live",
          entry: "/vr?prog=cosmos-963",
        },`,
);

hub = patch(
  hub,
  "Wellness: Mountain Silence badge+entry",
  `          emoji: "🏔️",
          title: "Mountain Silence",
          freq: "741 Hz · Throat",
          desc: "Alpine panorama with 741 Hz expression tone. Clarity and elevation.",
          color: "#ef4444",
        },`,
  `          emoji: "🏔️",
          title: "Mountain Silence",
          freq: "741 Hz · Throat",
          desc: "Alpine panorama with 741 Hz expression tone. Clarity and elevation.",
          color: "#ef4444",
          badge: "live",
          entry: "/vr?prog=mountain-silence",
        },`,
);

// ARCADE — promote first 3 teasers to ARCADE_LIVE
hub = patch(
  hub,
  "Arcade: add Lattice Dodge, PHI Architect, Swarm Defender to ARCADE_LIVE",
  `          entry: "/vr?prog=lattice-builder",
        },
      ];
      const ARCADE_TEASER = [
        { emoji: "⚡", title: "Lattice Dodge", cat: "Arcade", eta: "Q3 2026" },
        { emoji: "📐", title: "PHI Architect", cat: "Arcade", eta: "Q3 2026" },
        { emoji: "🐝", title: "Swarm Defender", cat: "Arcade", eta: "Q3 2026" },`,
  `          entry: "/vr?prog=lattice-builder",
        },
        {
          emoji: "⚡",
          title: "Lattice Dodge",
          desc: "Dodge frequency disruptors flying through the 48-node lattice. Pure reflex. PHI-speed ramps.",
          freq: "528 Hz · ACTION",
          color: "#22c55e",
          badge: "live",
          entry: "/vr?prog=lattice-dodge",
        },
        {
          emoji: "📐",
          title: "PHI Architect",
          desc: "Build perfect PHI-ratio structures in zero gravity before the tide erases them. Geometry as survival.",
          freq: "852 Hz · PHYSICS",
          color: "#f59e0b",
          badge: "live",
          entry: "/vr?prog=phi-architect",
        },
        {
          emoji: "🐝",
          title: "Swarm Defender",
          desc: "Command a 8-drone swarm to repel lattice entropy invasions. PHI formation tactics. 639 Hz control field.",
          freq: "639 Hz · DIALOGUE",
          color: "#a855f7",
          badge: "live",
          entry: "/vr?prog=swarm-defender",
        },
      ];
      const ARCADE_TEASER = [`,
);

// Update live-pill counts
hub = patch(
  hub,
  "live-pill: Lab 3→6",
  `🔬 Lab <span class="live-pill">3 live</span>`,
  `🔬 Lab <span class="live-pill">6 live</span>`,
);

hub = patch(
  hub,
  "live-pill: Arcade 2→5",
  `🎮 Arcade <span class="live-pill">2 live</span>`,
  `🎮 Arcade <span class="live-pill">5 live</span>`,
);

hub = patch(
  hub,
  "live-pill: Wellness 3→6",
  `🧘 Wellness <span class="live-pill">3 live</span>`,
  `🧘 Wellness <span class="live-pill">6 live</span>`,
);

hub = patch(
  hub,
  "live-pill: Social 1→4",
  `👥 Social <span class="live-pill">1 live</span>`,
  `👥 Social <span class="live-pill">4 live</span>`,
);

hub = patch(
  hub,
  "live-pill: Education 2→4",
  `📚 Education <span class="live-pill">2 live</span>`,
  `📚 Education <span class="live-pill">4 live</span>`,
);

hub = patch(
  hub,
  "live-pill: Art 2→4",
  `🎨 Art & Music <span class="live-pill">2 live</span>`,
  `🎨 Art & Music <span class="live-pill">4 live</span>`,
);

if (!ALLOW_VR_HTML_PATCH) {
  console.warn(
    "  ⚠ Skipped vr-hub.html write (set ALLOW_VR_HTML_PATCH=1 to enable)",
  );
} else {
  fs.writeFileSync(path.join(PUB, "vr-hub.html"), hub, "utf8");
  console.log(
    `  → vr-hub.html written: ${Buffer.byteLength(hub, "utf8")} bytes`,
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. VR.HTML — add 16 new PROGRAMMES
// ═══════════════════════════════════════════════════════════════
console.log("\n[3] Healing vr.html…");
let vr = fs.readFileSync(path.join(PUB, "vr.html"), "utf8");

const NEW_PROGRAMMES = `
        // ── NEW: LAB experiences ─────────────────────────────
        {
          name: "solar-system",
          display: "Solar System — Orbital VR",
          sem: "LOCATION",
          cat: "lab",
          desc: "Orbital mechanics at true scale. Walk Jupiter's surface, orbit Saturn's rings. 417 Hz spatial anchoring.",
          shortDesc: "Walk Jupiter. Orbit Saturn's rings at 1:1 scale.",
          panelAngle: 15,
          latticeNode: 14,
        },
        {
          name: "fractal-space",
          display: "Fractal Space — Infinite Zoom",
          sem: "NARRATIVE",
          cat: "lab",
          desc: "Infinite zoom through Mandelbrot and Julia sets rendered as navigable 3D caverns. 963 Hz depth field.",
          shortDesc: "Navigate fractal caverns at infinite depth.",
          panelAngle: 20,
          latticeNode: 20,
        },
        {
          name: "solfeggio-map",
          display: "Solfeggio Frequency Map",
          sem: "HOLOGRAPHIC",
          cat: "lab",
          desc: "Walk the full 396–963 Hz solfeggio spectrum as colour-coded spatial chambers. Step from root to crown.",
          shortDesc: "Step through frequency chambers 396→963 Hz.",
          panelAngle: 25,
          latticeNode: 22,
        },
        // ── NEW: EDUCATION experiences ───────────────────────
        {
          name: "mathematical-dims",
          display: "Mathematical Dimensions — 4D Space",
          sem: "PHYSICS",
          cat: "education",
          desc: "Walk through 4D hypercubes, Klein bottles, and PHI spirals as physical places. 852 Hz structural field.",
          shortDesc: "4D hypercubes as physical rooms. PHI geometry.",
          panelAngle: 35,
          latticeNode: 26,
        },
        {
          name: "language-immersion",
          display: "Language Immersion Worlds",
          sem: "DIALOGUE",
          cat: "education",
          desc: "Learn Mandarin in Beijing, Spanish in Barcelona — AI conversation partners at every corner. 639 Hz dialogue field.",
          shortDesc: "AI tutors in photorealistic city VR. 639 Hz.",
          panelAngle: 40,
          latticeNode: 28,
        },
        // ── NEW: ART experiences ─────────────────────────────
        {
          name: "ai-gallery",
          display: "Infinite AI Gallery",
          sem: "NARRATIVE",
          cat: "art",
          desc: "Infinitely expanding AI-generated art museum. PHI-spiral wings. New exhibits daily. 963 Hz presence.",
          shortDesc: "PHI-spiral museum. New exhibits every day.",
          panelAngle: 50,
          latticeNode: 31,
        },
        {
          name: "generative-theatre",
          display: "Generative Theatre — AI Plays",
          sem: "DIALOGUE",
          cat: "art",
          desc: "AI-written plays performed by spatial avatars in real time. Every show unique. 639 Hz dialogue field.",
          shortDesc: "Every show unique. Spatial avatar actors.",
          panelAngle: 55,
          latticeNode: 34,
        },
        // ── NEW: SOCIAL experiences ──────────────────────────
        {
          name: "live-events",
          display: "AIOS Live Events — VR Broadcasts",
          sem: "ACTION",
          cat: "social",
          desc: "VR concerts, keynotes, launches. Real-time spatial audio, 6DoF movement, 528 Hz action field.",
          shortDesc: "Live concerts, keynotes in 6DoF spatial audio.",
          panelAngle: 65,
          latticeNode: 5,
        },
        {
          name: "creator-studio",
          display: "Creator Studio — Build VR Scenes",
          sem: "NARRATIVE",
          cat: "creator",
          desc: "Build, remix, share VR scenes with GeoQode coordinate assignment. Collaborative A-Frame editing.",
          shortDesc: "Build + share VR scenes. GeoQode native.",
          panelAngle: 70,
          latticeNode: 6,
        },
        {
          name: "aios-academy",
          display: "AIOS Academy — Spatial Learning",
          sem: "LOCATION",
          cat: "education",
          desc: "Cohort-based spatial learning. Live instructor in VR, spatial whiteboards, group exploration. 417 Hz anchor.",
          shortDesc: "Live instructors in VR. Cohort learning.",
          panelAngle: 80,
          latticeNode: 40,
        },
        // ── NEW: WELLNESS experiences ────────────────────────
        {
          name: "ocean-presence",
          display: "Ocean Presence — Infinite Horizon",
          sem: "EMOTION",
          cat: "wellness",
          desc: "Infinite ocean horizon with dynamic waves, 417 Hz spatial anchor tone. Pure stillness and presence.",
          shortDesc: "Infinite ocean. 417 Hz. Pure presence.",
          panelAngle: 85,
          latticeNode: 16,
        },
        {
          name: "cosmos-963",
          display: "963 Hz Cosmos — Crown Field",
          sem: "NARRATIVE",
          cat: "wellness",
          desc: "Cosmic void with 963 Hz crown frequency, galactic particle field, and silent expansion. Universal consciousness.",
          shortDesc: "963 Hz. Cosmic void. Universal field.",
          panelAngle: 95,
          latticeNode: 47,
        },
        {
          name: "mountain-silence",
          display: "Mountain Silence — 741 Hz Clarity",
          sem: "EMOTION",
          cat: "wellness",
          desc: "Alpine panorama at golden hour with 741 Hz expression frequency. Silence, elevation, and clarity.",
          shortDesc: "Alpine summit. 741 Hz. Pure clarity.",
          panelAngle: 100,
          latticeNode: 27,
        },
        // ── NEW: ARCADE games ────────────────────────────────
        {
          name: "lattice-dodge",
          display: "Lattice Dodge — PHI Reflexes",
          sem: "ACTION",
          cat: "arcade",
          desc: "Dodge entropy disruptors flying through the 48-node lattice ring. Speed ramps by PHI each wave.",
          shortDesc: "Dodge. Survive. PHI-speed waves.",
          panelAngle: 165,
          latticeNode: 7,
        },
        {
          name: "phi-architect",
          display: "PHI Architect — Build or Dissolve",
          sem: "PHYSICS",
          cat: "arcade",
          desc: "Build PHI-perfect structures in zero gravity before the tide dissolves them. Geometry as survival.",
          shortDesc: "Build PHI structures. The tide erases imperfection.",
          panelAngle: 175,
          latticeNode: 8,
        },
        {
          name: "swarm-defender",
          display: "Swarm Defender — 8 Drones",
          sem: "ACTION",
          cat: "arcade",
          desc: "Command a 8-drone swarm in PHI formation to repel lattice entropy invasions. 639 Hz control field.",
          shortDesc: "Lead 8 drones. PHI formations. Defend the lattice.",
          panelAngle: 185,
          latticeNode: 9,
        },
`;

vr = patch(
  vr,
  "16 new PROGRAMMES added before array close",
  `          latticeNode: 4,\n        },\n      ];`,
  `          latticeNode: 4,\n        },` + NEW_PROGRAMMES + `      ];`,
);

if (!ALLOW_VR_HTML_PATCH) {
  console.warn(
    "  ⚠ Skipped vr.html write (set ALLOW_VR_HTML_PATCH=1 to enable)",
  );
} else {
  fs.writeFileSync(path.join(PUB, "vr.html"), vr, "utf8");
  console.log(`  → vr.html written: ${Buffer.byteLength(vr, "utf8")} bytes`);
}
console.log(`\n✅ All stub patches applied.`);
