/**
 * heal-stubs-v2.mjs  — CRLF-aware stub healer
 * Run: node heal-stubs-v2.mjs  (from merkaba-geoqode-lattice/)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.join(__dirname, "public");
const ALLOW_VR_HTML_PATCH = process.env.ALLOW_VR_HTML_PATCH === "1";

let ok = 0,
  fail = 0;

function patch(file, label, find, replace) {
  const idx = file.indexOf(find);
  if (idx === -1) {
    console.error(`  ✗ MISSING (${label})`);
    fail++;
    return file;
  }
  console.log(`  ✓ ${label}`);
  ok++;
  return file.slice(0, idx) + replace + file.slice(idx + find.length);
}

// ═══════════════════════════════════════════════════════════════════
// 1. AIOSDREAM.HTML
// ═══════════════════════════════════════════════════════════════════
console.log("\n[1] aiosdream.html…");
let d = fs.readFileSync(path.join(PUB, "aiosdream.html"), "utf8");
const dNL = d.includes("\r\n") ? "\r\n" : "\n";

// 1a — nav search button
d = patch(
  d,
  "nav search btn onclick",
  `onclick="toast('Search coming soon')"`,
  `onclick="openSearch()" title="Search (Ctrl+K)"`,
);

// 1b — search CSS before mobile query
const SEARCH_CSS = `\n    /* ── SEARCH OVERLAY ── */\n    .search-over {\n      position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 300;\n      background: rgba(6,8,15,0.97); backdrop-filter: blur(28px);\n      padding: 88px 52px 40px; overflow-y: auto;\n      transform: translateY(-100%); transition: transform 0.36s cubic-bezier(.16,1,.3,1);\n      pointer-events: none;\n    }\n    .search-over.open { transform: none; pointer-events: all; }\n    .search-bar-row {\n      display: flex; align-items: center; gap: 14px;\n      border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 26px;\n    }\n    .search-bar-row .sb-icon { font-size: 26px; color: var(--muted); flex-shrink: 0; }\n    .search-bar-row input {\n      flex: 1; background: none; border: none; color: #fff;\n      font-size: 22px; font-weight: 300; outline: none; font-family: inherit;\n    }\n    .search-bar-row input::placeholder { color: rgba(255,255,255,0.18); }\n    .search-bar-row .sb-close {\n      background: none; border: none; color: var(--muted);\n      font-size: 17px; cursor: pointer; padding: 6px 10px;\n      border-radius: 6px; transition: color 0.15s, background 0.15s;\n    }\n    .search-bar-row .sb-close:hover { color: #fff; background: rgba(255,255,255,0.06); }\n    .search-label { font-size: 11px; font-weight: 700; letter-spacing: 2px;\n      text-transform: uppercase; color: var(--muted); margin-bottom: 16px; }\n    .search-grid {\n      display: grid; grid-template-columns: repeat(auto-fill, minmax(190px,1fr)); gap: 12px;\n    }\n    .src-card {\n      background: var(--card-bg); border-radius: 10px; overflow: hidden;\n      cursor: pointer; border: 1px solid var(--border);\n      transition: border-color 0.2s, transform 0.15s;\n    }\n    .src-card:hover { border-color: rgba(255,255,255,0.22); transform: translateY(-2px); }\n    .src-accent-bar { height: 3px; }\n    .src-thumb-box { height: 68px; display: flex; align-items: center; justify-content: center; font-size: 30px; }\n    .src-body { padding: 10px 12px 14px; }\n    .src-title { font-size: 13px; font-weight: 700; margin-bottom: 4px;\n      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n    .src-meta { font-size: 11px; color: var(--muted); }\n    .src-no-res { grid-column: 1/-1; text-align: center; padding: 60px 20px;\n      color: var(--muted); font-size: 15px; }\n    `;
d = patch(
  d,
  "search CSS before MOBILE",
  `    /* \u2500\u2500 MOBILE \u2500\u2500 */`,
  SEARCH_CSS + `    /* \u2500\u2500 MOBILE \u2500\u2500 */`,
);

// 1c — search HTML overlay before <!-- ── PLAYER ── -->
const SEARCH_HTML = `<!-- \u2500\u2500 SEARCH OVERLAY \u2500\u2500 -->\n<div id="search-overlay" class="search-over" role="search" aria-label="Search programmes">\n  <div class="search-bar-row">\n    <span class="sb-icon">\u2315</span>\n    <input id="search-input" type="text" placeholder="Search programmes, genres, themes\u2026"\n           autocomplete="off" spellcheck="false" />\n    <button class="sb-close" id="search-close" title="Close (Esc)">\u2715</button>\n  </div>\n  <div class="search-label" id="search-label">All Programmes</div>\n  <div class="search-grid" id="search-grid"></div>\n</div>\n\n`;
d = patch(
  d,
  "search HTML before PLAYER",
  `<!-- \u2500\u2500 PLAYER \u2500\u2500 -->`,
  SEARCH_HTML + `<!-- \u2500\u2500 PLAYER \u2500\u2500 -->`,
);

// 1d — wire startAmbientAudio into openPlayer
d = patch(
  d,
  "startAmbientAudio in openPlayer",
  `  startRenderer();${dNL}  startPlayback();`,
  `  startRenderer();${dNL}  startAmbientAudio(prog.id);${dNL}  startPlayback();`,
);

// 1e — wire stopAmbientAudio into closePlayer
d = patch(
  d,
  "stopAmbientAudio in closePlayer",
  `  saveProgress();${dNL}  pausePlayback();`,
  `  saveProgress();${dNL}  stopAmbientAudio();${dNL}  pausePlayback();`,
);

// 1f — remove the duplicate mute-button listener that was already in the file
// (we'll replace the final </script> block with our full version that includes it correctly)

// 1g — inject full search + audio JS before closing </script></body></html>
const EXTRA_JS = `
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// SEARCH ENGINE
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
let _searchOpen = false;

function openSearch() {
  _searchOpen = true;
  document.getElementById('search-overlay').classList.add('open');
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
    ? matches.length + ' result' + (matches.length !== 1 ? 's' : '') + ' for "' + q + '"'
    : 'All Programmes';
  if (!matches.length) {
    el.innerHTML = '<div class="src-no-res">Nothing matched "' + q + '" \u2014 try a genre or keyword</div>';
    return;
  }
  el.innerHTML = matches.map(function(p) {
    return '<div class="src-card" onclick="closeSearch();openPlayer(\'' + p.id + '\',0)">' +
      '<div class="src-accent-bar" style="background:' + p.accent + '"></div>' +
      '<div class="src-thumb-box" style="background:' + p.thumb + '">' + p.icon + '</div>' +
      '<div class="src-body">' +
        '<div class="src-title">' + p.title + '</div>' +
        '<div class="src-meta">' + p.year + ' \u00b7 ' + p.genre.slice(0,2).join(' \u00b7 ') + '</div>' +
      '</div></div>';
  }).join('');
}

document.getElementById('search-input').addEventListener('input', function(e) {
  renderSearchGrid(e.target.value.toLowerCase().trim());
});
document.getElementById('search-close').addEventListener('click', closeSearch);
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    _searchOpen ? closeSearch() : openSearch();
    return;
  }
  if (e.key === 'Escape' && _searchOpen) { closeSearch(); }
});

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// AMBIENT AUDIO ENGINE (WebAudio API \u2014 zero external samples, fully generative)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
var PROG_AUDIO_CFG = {
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
  chronos:   { hz: 417, wave: 'sine',     noise: 0.08, lfo: 0.11, fHz: 1100 }
};

var _audioCtx = null;
var _masterGain = null;
var _ambientNodes = [];

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
    var cfg = PROG_AUDIO_CFG[progId] || PROG_AUDIO_CFG.merkaba;
    var ctx = _audioCtx;
    var now = ctx.currentTime;
    var volVal = parseFloat(document.getElementById('vol-slider').value);

    // Sub-bass drone at hz/4 \u2014 creates deep resonance
    var subOsc = ctx.createOscillator();
    var subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.value = cfg.hz / 4;
    subGain.gain.value = 0.18;
    subOsc.connect(subGain);
    subGain.connect(_masterGain);
    subOsc.start();

    // Main harmonic tone through lowpass filter
    var mainOsc = ctx.createOscillator();
    var mainFilt = ctx.createBiquadFilter();
    var mainGain = ctx.createGain();
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

    // PHI-rate LFO \u2014 creates slow breathing pulse
    var lfo = ctx.createOscillator();
    var lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = cfg.lfo;
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    lfoGain.connect(mainGain.gain);
    lfo.start();

    _ambientNodes.push(subOsc, subGain, mainOsc, mainFilt, mainGain, lfo, lfoGain);

    // Filtered noise layer (adds texture and presence)
    if (cfg.noise > 0) {
      var sRate = ctx.sampleRate;
      var buf = ctx.createBuffer(1, sRate * 3, sRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      var noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = buf;
      noiseSrc.loop = true;
      var noiseFilt = ctx.createBiquadFilter();
      noiseFilt.type = 'bandpass';
      noiseFilt.frequency.value = cfg.hz * 0.6;
      noiseFilt.Q.value = 0.8;
      var noiseGain = ctx.createGain();
      noiseGain.gain.value = cfg.noise * 0.04;
      noiseSrc.connect(noiseFilt);
      noiseFilt.connect(noiseGain);
      noiseGain.connect(_masterGain);
      noiseSrc.start();
      _ambientNodes.push(noiseSrc, noiseFilt, noiseGain);
    }

    // Fade master in over 2.2 seconds
    _masterGain.gain.setValueAtTime(0, now);
    _masterGain.gain.linearRampToValueAtTime(volVal * 0.22, now + 2.2);

  } catch (e) {
    // AudioContext may be blocked until user gesture \u2014 graceful no-op
  }
}

function stopAmbientAudio() {
  var nodes = _ambientNodes.splice(0);
  for (var i = 0; i < nodes.length; i++) {
    try { if (nodes[i].stop) nodes[i].stop(); } catch (e) {}
    try { nodes[i].disconnect(); } catch (e) {}
  }
  if (_masterGain && _audioCtx) {
    try { _masterGain.gain.setValueAtTime(0, _audioCtx.currentTime); } catch (e) {}
  }
}

// Volume slider \u2192 wired to master audio gain
document.getElementById('vol-slider').addEventListener('input', function(e) {
  var v = parseFloat(e.target.value);
  if (_masterGain && _audioCtx) {
    _masterGain.gain.setTargetAtTime(v * 0.22, _audioCtx.currentTime, 0.1);
  }
  var btn = document.getElementById('ctrl-vol-btn');
  if (btn) btn.textContent = v === 0 ? '\uD83D\uDD07' : v < 0.45 ? '\uD83D\uDD09' : '\uD83D\uDD0A';
});

// Mute button \u2014 dispatches input event so audio follows
(function() {
  var volBtn = document.getElementById('ctrl-vol-btn');
  if (volBtn && !volBtn._audioPatched) {
    volBtn._audioPatched = true;
    volBtn.addEventListener('click', function() {
      var slider = document.getElementById('vol-slider');
      if (parseFloat(slider.value) > 0) {
        slider.dataset.prev = slider.value;
        slider.value = 0;
      } else {
        slider.value = slider.dataset.prev || '0.7';
      }
      slider.dispatchEvent(new Event('input'));
    });
  }
})();

`;

d = patch(
  d,
  "search+audio JS injected",
  `${dNL}</script>${dNL}</body>${dNL}</html>`,
  EXTRA_JS + `${dNL}</script>${dNL}</body>${dNL}</html>`,
);

fs.writeFileSync(path.join(PUB, "aiosdream.html"), d, "utf8");
console.log(`  \u2192 aiosdream.html: ${Buffer.byteLength(d, "utf8")} bytes`);

// ═══════════════════════════════════════════════════════════════════
// 2. VR-HUB.HTML
// ═══════════════════════════════════════════════════════════════════
console.log("\n[2] vr-hub.html…");
let h = fs.readFileSync(path.join(PUB, "vr-hub.html"), "utf8");
const hNL = h.includes("\r\n") ? "\r\n" : "\n";
const COMING_BLOCK = `          badge: "coming",${hNL}          entry: "",${hNL}        },`;

function fixXP(label, titleStr, prog) {
  const ti = h.indexOf(`title: "${titleStr}"`);
  if (ti === -1) {
    console.error(`  \u2717 NOT FOUND: ${titleStr}`);
    fail++;
    return;
  }
  const bi = h.indexOf(COMING_BLOCK, ti);
  if (bi === -1 || bi > ti + 800) {
    console.error(`  \u2717 badge block too far: ${titleStr}`);
    fail++;
    return;
  }
  const NEW_BLOCK = `          badge: "live",${hNL}          entry: "/vr?prog=${prog}",${hNL}        },`;
  h = h.slice(0, bi) + NEW_BLOCK + h.slice(bi + COMING_BLOCK.length);
  console.log(`  \u2713 Promoted: ${label}`);
  ok++;
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

// WELLNESS — add badge+entry to 3 items that currently have neither
h = patch(
  h,
  "Wellness: Ocean Presence",
  `          emoji: "\u{1F30A}",${hNL}          title: "Ocean Presence",${hNL}          freq: "417 Hz \u00b7 Sacral",${hNL}          desc: "Infinite ocean horizon. 417 Hz spatial anchor tone. Pure presence.",${hNL}          color: "#00d4ff",${hNL}        },`,
  `          emoji: "\u{1F30A}",${hNL}          title: "Ocean Presence",${hNL}          freq: "417 Hz \u00b7 Sacral",${hNL}          desc: "Infinite ocean horizon. 417 Hz spatial anchor tone. Pure presence.",${hNL}          color: "#00d4ff",${hNL}          badge: "live",${hNL}          entry: "/vr?prog=ocean-presence",${hNL}        },`,
);

h = patch(
  h,
  "Wellness: 963 Hz Cosmos",
  `          emoji: "\u{1F30C}",${hNL}          title: "963 Hz Cosmos",${hNL}          freq: "963 Hz \u00b7 Crown",${hNL}          desc: "Cosmic void with 963 Hz crown frequency. Universal consciousness field.",${hNL}          color: "#f59e0b",${hNL}        },`,
  `          emoji: "\u{1F30C}",${hNL}          title: "963 Hz Cosmos",${hNL}          freq: "963 Hz \u00b7 Crown",${hNL}          desc: "Cosmic void with 963 Hz crown frequency. Universal consciousness field.",${hNL}          color: "#f59e0b",${hNL}          badge: "live",${hNL}          entry: "/vr?prog=cosmos-963",${hNL}        },`,
);

h = patch(
  h,
  "Wellness: Mountain Silence",
  `          emoji: "\u{1F3D4}\uFE0F",${hNL}          title: "Mountain Silence",${hNL}          freq: "741 Hz \u00b7 Throat",${hNL}          desc: "Alpine panorama with 741 Hz expression tone. Clarity and elevation.",${hNL}          color: "#ef4444",${hNL}        },`,
  `          emoji: "\u{1F3D4}\uFE0F",${hNL}          title: "Mountain Silence",${hNL}          freq: "741 Hz \u00b7 Throat",${hNL}          desc: "Alpine panorama with 741 Hz expression tone. Clarity and elevation.",${hNL}          color: "#ef4444",${hNL}          badge: "live",${hNL}          entry: "/vr?prog=mountain-silence",${hNL}        },`,
);

// ARCADE — promote 3 teasers to live
h = patch(
  h,
  "Arcade: 3 games to ARCADE_LIVE",
  `          entry: "/vr?prog=lattice-builder",${hNL}        },${hNL}      ];${hNL}      const ARCADE_TEASER = [${hNL}        { emoji: "\u26A1", title: "Lattice Dodge", cat: "Arcade", eta: "Q3 2026" },${hNL}        { emoji: "\uD83D\uDCD0", title: "PHI Architect", cat: "Arcade", eta: "Q3 2026" },${hNL}        { emoji: "\uD83D\uDC1D", title: "Swarm Defender", cat: "Arcade", eta: "Q3 2026" },`,
  `          entry: "/vr?prog=lattice-builder",${hNL}        },${hNL}        {${hNL}          emoji: "\u26A1",${hNL}          title: "Lattice Dodge",${hNL}          desc: "Dodge entropy disruptors flying through the 48-node lattice ring. Speed ramps by PHI each wave.",${hNL}          freq: "528 Hz \u00b7 ACTION",${hNL}          color: "#22c55e",${hNL}          badge: "live",${hNL}          entry: "/vr?prog=lattice-dodge",${hNL}        },${hNL}        {${hNL}          emoji: "\uD83D\uDCD0",${hNL}          title: "PHI Architect",${hNL}          desc: "Build PHI-perfect structures in zero gravity before the tide erases them. Geometry as survival.",${hNL}          freq: "852 Hz \u00b7 PHYSICS",${hNL}          color: "#f59e0b",${hNL}          badge: "live",${hNL}          entry: "/vr?prog=phi-architect",${hNL}        },${hNL}        {${hNL}          emoji: "\uD83D\uDC1D",${hNL}          title: "Swarm Defender",${hNL}          desc: "Command an 8-drone PHI-formation swarm to repel lattice entropy invasions. 639 Hz control field.",${hNL}          freq: "639 Hz \u00b7 DIALOGUE",${hNL}          color: "#a855f7",${hNL}          badge: "live",${hNL}          entry: "/vr?prog=swarm-defender",${hNL}        },${hNL}      ];${hNL}      const ARCADE_TEASER = [`,
);

// Update live-pill counts
h = patch(
  h,
  "pill: Lab 3→6",
  `\uD83D\uDD2C Lab <span class="live-pill">3 live</span>`,
  `\uD83D\uDD2C Lab <span class="live-pill">6 live</span>`,
);
h = patch(
  h,
  "pill: Arcade 2→5",
  `\uD83C\uDFAE Arcade <span class="live-pill">2 live</span>`,
  `\uD83C\uDFAE Arcade <span class="live-pill">5 live</span>`,
);
h = patch(
  h,
  "pill: Wellness 3→6",
  `\uD83E\uDDD8 Wellness <span class="live-pill">3 live</span>`,
  `\uD83E\uDDD8 Wellness <span class="live-pill">6 live</span>`,
);
h = patch(
  h,
  "pill: Social 1→4",
  `\uD83D\uDC65 Social <span class="live-pill">1 live</span>`,
  `\uD83D\uDC65 Social <span class="live-pill">4 live</span>`,
);
h = patch(
  h,
  "pill: Education 2→4",
  `\uD83D\uDCDA Education <span class="live-pill">2 live</span>`,
  `\uD83D\uDCDA Education <span class="live-pill">4 live</span>`,
);
h = patch(
  h,
  "pill: Art 2→4",
  `\uD83C\uDFA8 Art & Music <span class="live-pill">2 live</span>`,
  `\uD83C\uDFA8 Art & Music <span class="live-pill">4 live</span>`,
);

if (!ALLOW_VR_HTML_PATCH) {
  console.warn(
    "  ⚠ Skip vr-hub.html write (set ALLOW_VR_HTML_PATCH=1 to enable)",
  );
} else {
  fs.writeFileSync(path.join(PUB, "vr-hub.html"), h, "utf8");
  console.log(`  \u2192 vr-hub.html: ${Buffer.byteLength(h, "utf8")} bytes`);
}

// ═══════════════════════════════════════════════════════════════════
// 3. VR.HTML — add 16 new PROGRAMMES
// ═══════════════════════════════════════════════════════════════════
console.log("\n[3] vr.html…");
let vr = fs.readFileSync(path.join(PUB, "vr.html"), "utf8");
const vNL = vr.includes("\r\n") ? "\r\n" : "\n";

// Find exact end of plaistore-dev block (last existing programme)
const PLAI_CLOSE = `          panelAngle: 255,${vNL}          latticeNode: 4,${vNL}        },${vNL}      ];`;

const NEW_PROGS = `          panelAngle: 255,${vNL}          latticeNode: 4,${vNL}        },${vNL}        // \u2500\u2500 NEW: LAB \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${vNL}        {${vNL}          name: "solar-system",${vNL}          display: "Solar System \u2014 Orbital VR",${vNL}          sem: "LOCATION",${vNL}          cat: "lab",${vNL}          desc: "Orbital mechanics at true scale. Walk Jupiter's surface, orbit Saturn's rings. 417 Hz spatial anchoring.",${vNL}          shortDesc: "Walk Jupiter. Orbit Saturn's rings at true scale.",${vNL}          panelAngle: 15,${vNL}          latticeNode: 14,${vNL}        },${vNL}        {${vNL}          name: "fractal-space",${vNL}          display: "Fractal Space \u2014 Infinite Zoom",${vNL}          sem: "NARRATIVE",${vNL}          cat: "lab",${vNL}          desc: "Infinite zoom through Mandelbrot and Julia sets rendered as navigable 3D caverns. 963 Hz depth field.",${vNL}          shortDesc: "Navigate fractal caverns at infinite depth.",${vNL}          panelAngle: 20,${vNL}          latticeNode: 20,${vNL}        },${vNL}        {${vNL}          name: "solfeggio-map",${vNL}          display: "Solfeggio Frequency Map",${vNL}          sem: "HOLOGRAPHIC",${vNL}          cat: "lab",${vNL}          desc: "Walk the full 396\u2013963 Hz solfeggio spectrum as colour-coded spatial chambers.",${vNL}          shortDesc: "Step through frequency chambers 396\u2192963 Hz.",${vNL}          panelAngle: 25,${vNL}          latticeNode: 22,${vNL}        },${vNL}        // \u2500\u2500 NEW: EDUCATION \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${vNL}        {${vNL}          name: "mathematical-dims",${vNL}          display: "Mathematical Dimensions \u2014 4D Space",${vNL}          sem: "PHYSICS",${vNL}          cat: "education",${vNL}          desc: "Walk through 4D hypercubes, Klein bottles, and PHI spirals as physical places. 852 Hz structural field.",${vNL}          shortDesc: "4D hypercubes as physical rooms. PHI geometry.",${vNL}          panelAngle: 35,${vNL}          latticeNode: 26,${vNL}        },${vNL}        {${vNL}          name: "language-immersion",${vNL}          display: "Language Immersion Worlds",${vNL}          sem: "DIALOGUE",${vNL}          cat: "education",${vNL}          desc: "Learn Mandarin in Beijing, Spanish in Barcelona \u2014 AI conversation partners at every corner. 639 Hz dialogue field.",${vNL}          shortDesc: "AI tutors in photorealistic city VR. 639 Hz.",${vNL}          panelAngle: 40,${vNL}          latticeNode: 28,${vNL}        },${vNL}        // \u2500\u2500 NEW: ART \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${vNL}        {${vNL}          name: "ai-gallery",${vNL}          display: "Infinite AI Gallery",${vNL}          sem: "NARRATIVE",${vNL}          cat: "art",${vNL}          desc: "Infinitely expanding AI-generated art museum. PHI-spiral wings. New exhibits daily. 963 Hz presence.",${vNL}          shortDesc: "PHI-spiral museum. New AI exhibits every day.",${vNL}          panelAngle: 50,${vNL}          latticeNode: 31,${vNL}        },${vNL}        {${vNL}          name: "generative-theatre",${vNL}          display: "Generative Theatre \u2014 AI Plays",${vNL}          sem: "DIALOGUE",${vNL}          cat: "art",${vNL}          desc: "AI-written plays performed by spatial avatars in real time. Every show unique. 639 Hz dialogue field.",${vNL}          shortDesc: "Every show unique. Spatial avatar actors.",${vNL}          panelAngle: 55,${vNL}          latticeNode: 34,${vNL}        },${vNL}        // \u2500\u2500 NEW: SOCIAL \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${vNL}        {${vNL}          name: "live-events",${vNL}          display: "AIOS Live Events \u2014 VR Broadcasts",${vNL}          sem: "ACTION",${vNL}          cat: "social",${vNL}          desc: "VR concerts, keynotes, launches. Real-time spatial audio, 6DoF movement, 528 Hz action field.",${vNL}          shortDesc: "Live concerts and keynotes in 6DoF spatial audio.",${vNL}          panelAngle: 65,${vNL}          latticeNode: 5,${vNL}        },${vNL}        {${vNL}          name: "creator-studio",${vNL}          display: "Creator Studio \u2014 Build VR Scenes",${vNL}          sem: "NARRATIVE",${vNL}          cat: "creator",${vNL}          desc: "Build, remix, share VR scenes with GeoQode coordinate assignment. Collaborative A-Frame editing.",${vNL}          shortDesc: "Build and share VR scenes. GeoQode native.",${vNL}          panelAngle: 70,${vNL}          latticeNode: 6,${vNL}        },${vNL}        {${vNL}          name: "aios-academy",${vNL}          display: "AIOS Academy \u2014 Spatial Learning",${vNL}          sem: "LOCATION",${vNL}          cat: "education",${vNL}          desc: "Cohort-based spatial learning. Live instructor in VR, spatial whiteboards, group exploration.",${vNL}          shortDesc: "Live instructors in VR. Cohort learning.",${vNL}          panelAngle: 80,${vNL}          latticeNode: 40,${vNL}        },${vNL}        // \u2500\u2500 NEW: WELLNESS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${vNL}        {${vNL}          name: "ocean-presence",${vNL}          display: "Ocean Presence \u2014 Infinite Horizon",${vNL}          sem: "EMOTION",${vNL}          cat: "wellness",${vNL}          desc: "Infinite ocean horizon with dynamic waves. 417 Hz spatial anchor tone. Pure stillness and presence.",${vNL}          shortDesc: "Infinite ocean. 417 Hz. Pure presence.",${vNL}          panelAngle: 85,${vNL}          latticeNode: 16,${vNL}        },${vNL}        {${vNL}          name: "cosmos-963",${vNL}          display: "963 Hz Cosmos \u2014 Crown Field",${vNL}          sem: "NARRATIVE",${vNL}          cat: "wellness",${vNL}          desc: "Cosmic void with 963 Hz crown frequency, galactic particle field, and silent expansion.",${vNL}          shortDesc: "963 Hz. Cosmic void. Universal consciousness.",${vNL}          panelAngle: 95,${vNL}          latticeNode: 47,${vNL}        },${vNL}        {${vNL}          name: "mountain-silence",${vNL}          display: "Mountain Silence \u2014 741 Hz Clarity",${vNL}          sem: "EMOTION",${vNL}          cat: "wellness",${vNL}          desc: "Alpine panorama at golden hour with 741 Hz expression frequency. Silence, elevation, and clarity.",${vNL}          shortDesc: "Alpine summit. 741 Hz. Pure clarity.",${vNL}          panelAngle: 100,${vNL}          latticeNode: 27,${vNL}        },${vNL}        // \u2500\u2500 NEW: ARCADE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${vNL}        {${vNL}          name: "lattice-dodge",${vNL}          display: "Lattice Dodge \u2014 PHI Reflexes",${vNL}          sem: "ACTION",${vNL}          cat: "arcade",${vNL}          desc: "Dodge entropy disruptors flying through the 48-node lattice ring. Speed ramps by PHI each wave.",${vNL}          shortDesc: "Dodge. Survive. PHI-speed waves.",${vNL}          panelAngle: 165,${vNL}          latticeNode: 7,${vNL}        },${vNL}        {${vNL}          name: "phi-architect",${vNL}          display: "PHI Architect \u2014 Build or Dissolve",${vNL}          sem: "PHYSICS",${vNL}          cat: "arcade",${vNL}          desc: "Build PHI-perfect structures in zero gravity before the tide dissolves them. Geometry as survival.",${vNL}          shortDesc: "Build PHI structures. The tide erases imperfection.",${vNL}          panelAngle: 175,${vNL}          latticeNode: 8,${vNL}        },${vNL}        {${vNL}          name: "swarm-defender",${vNL}          display: "Swarm Defender \u2014 8 Drones",${vNL}          sem: "ACTION",${vNL}          cat: "arcade",${vNL}          desc: "Command an 8-drone swarm in PHI formation to repel lattice entropy invasions. 639 Hz control field.",${vNL}          shortDesc: "Lead 8 drones. PHI formations. Defend the lattice.",${vNL}          panelAngle: 185,${vNL}          latticeNode: 9,${vNL}        },${vNL}      ];`;

vr = patch(vr, "16 new PROGRAMMES before array close", PLAI_CLOSE, NEW_PROGS);

if (!ALLOW_VR_HTML_PATCH) {
  console.warn("  ⚠ Skip vr.html write (set ALLOW_VR_HTML_PATCH=1 to enable)");
} else {
  fs.writeFileSync(path.join(PUB, "vr.html"), vr, "utf8");
  console.log(
    `  \u2192 vr.html: ${Buffer.byteLength(vr, "utf8")} bytes (${vr.match(/name:/g).length} programmes)`,
  );
}

// ═══════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════
console.log(`\n${"═".repeat(60)}`);
console.log(`\u2705 ${ok} patches applied   \u274C ${fail} failed`);
if (fail > 0) process.exit(1);
