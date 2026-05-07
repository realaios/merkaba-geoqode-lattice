/**
 * purge-jargon.mjs
 * Removes all proprietary architecture signatures, frequency references,
 * and technical jargon from public HTML pages.
 *
 * KEEP: Game names "Merkaba Ghosts", "Lattice Dodge", "Lattice Builder", "PHI Breaker"
 * KEEP: URL slugs (/game-lattice-builder, /games/phi-breaker, etc.)
 * KEEP: CSS class names, JS variable names
 * REMOVE: 8→26→48:480, D48, D480, Hz frequencies, PHI/PSI architecture refs, GeoQode display text, resonance, quantum jargon
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, "../public");

// ── Helpers ────────────────────────────────────────────────────────────────
function load(name) {
  return readFileSync(join(PUBLIC, name), "utf8");
}
function save(name, content) {
  writeFileSync(join(PUBLIC, name), content, "utf8");
  console.log(`✅  ${name}`);
}

// Replace all non-overlapping occurrences. Returns new string + count.
function replaceAll(src, find, replace) {
  const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(escaped, "g");
  const count = (src.match(re) || []).length;
  return [src.replace(re, replace), count];
}

function applyReplacements(src, pairs) {
  let total = 0;
  for (const [find, replace] of pairs) {
    const [next, count] = replaceAll(src, find, replace);
    if (count > 0) total += count;
    src = next;
  }
  return [src, total];
}

// ── GLOBAL replacements — applied to EVERY public HTML file ───────────────
// Order matters: longer/more-specific strings first.
const GLOBAL = [
  // Architecture signatures
  ["8→26→48:480", "AIOS"],
  ["8,26,48:480", "AIOS"],
  ["8 → 26 → 48 : 480", "AIOS"],
  ["Powered by Merkaba 8→26→48:480", "Powered by AIOS"],
  ["Powered by Storm · Merkaba GeoQode OS", "Powered by AIOS"],
  ["AIOS VR Platform · Powered by AIOS", "AIOS VR Platform"],

  // D-notation
  ["D48 lattice", "3D environment"],
  ["the D48", "the 3D space"],
  ["D480 harmonic space", "3D space"],
  ["D480", ""],
  [" D48 ", " 3D "],

  // PHI/PSI architecture references (preserve game name exceptions below)
  ["PHI=1.618 · PSI=1.414", ""],
  [" · PHI=1.618 · PSI=1.414", ""],
  ["PHI=1.618", ""],
  ["PSI=1.414", ""],
  ["PHI/PSI dual-attested", ""],
  ["PHI/PSI lattice coordinates, semantic frequencies,", "immersive coordinates and metadata,"],
  ["PHI/PSI", ""],
  ["PHI-resonant intelligence grid that runs AIOS", "AI engine that runs AIOS"],
  ["PHI-resonant architecture", "spatial architecture"],
  ["PHI-resonant", ""],
  ["PHI-scaled code rain", "code rain"],
  ["PHI-timed sequences", "timed sequences"],
  ["PHI-perfect structures", "perfect structures"],
  ["PHI-perfect", "perfect"],
  ["PHI sequence order", "sequence order"],
  ["PHI sequence", "sequence"],
  ["PHI-formation swarm", "formation swarm"],
  ["PHI geometry", "geometry"],
  ["PHI each wave", "each wave"],

  // Resonance / attestation / certification
  ["resonance-certified, PHI/PSI dual-attested", ""],
  ["Self-healing, resonance-certified,", "Self-healing,"],
  ["resonance-certified", ""],
  ["dual-attested", ""],
  ["SCANNER_ATTESTED", ""],
  ["frequency resonance", "audio"],
  ["DIALOGUE-frequency resonance", "spatial audio"],
  ["Force resonance across the galactic void", "Force across the galactic void"],
  ["639 Hz control field", "spatial control"],
  ["spatial voice, PHI-resonant architecture", "spatial voice and open layout"],

  // Architecture phrase
  ["Geometric lattice architecture (8→26→48:480).", ""],
  ["Geometric lattice architecture", "AI architecture"],
  ["Geometric lattice", "AI"],
  ["geometric lattice", "AI"],
  ["48-node lattice", "3D grid"],
  ["48-node", "node"],
  ["26-node", "node"],
  ["node lattice", "node grid"],
  [" lattice rings", " capacity limits"],
  ["lattice ring from all directions", "all directions"],
  ["lattice ring", "grid"],
  ["Walk through the\n              8→26→48:480 geometry. Frequency mapping, quantum field simulation,\n              neural scaffold explorer.", "Explore the 3D architecture in real-time."],

  // Hz frequencies — all variants
  ["396–963 Hz solfeggio spectrum as colour-coded spatial chambers", "spectrum of colour-coded spatial chambers"],
  ["Solfeggio frequency chambers", "Immersive audio chambers"],
  ["Solfeggio Frequency Map", "Spectrum Journey"],
  ["solfeggio", "audio"],
  ["72 Hz GeoQode Base", ""],
  ["72 Hz GeoQode", ""],
  ["72 Hz ambient tone", "ambient tone"],
  ["72 Hz base", "Ambient"],
  ["72 Hz · Base", "Ambient"],
  ["72 Hz · HOLOGRAPHIC", "Ambient"],
  ["72 Hz · Holographic", "Ambient"],
  ["72 Hz", ""],
  ["852 Hz structural-law resonance as your amb", "structural ambiance"],
  ["852 Hz · PHYSICS", "Structural"],
  ["963 Hz crown frequency", "ambient audio"],
  ["963 Hz · NARRATIVE", "Story"],
  ["963 Hz · Crown", "Cosmos"],
  ["528 Hz binaural audio", "binaural audio"],
  ["528 Hz · ACTION", "Action"],
  ["528 Hz · Heart", "Nature"],
  ["528 Hz", ""],
  ["417 Hz spatial anchor tone", "ambient tone"],
  ["417 Hz · LOCATION", "World"],
  ["417 Hz · Sacral", "Presence"],
  ["417 Hz", ""],
  ["396 Hz · ENTITY", "Discovery"],
  ["396 Hz · Root", "Grounding"],
  ["396 Hz", ""],
  ["639 Hz · DIALOGUE", "Social"],
  ["639 Hz", ""],
  ["741 Hz expression tone", "ambient audio"],
  ["741 Hz · Throat", "Silence"],
  ["741 Hz", ""],
  ["852 Hz · PHYSICS", "Structural"],
  ["852 Hz", ""],
  ["963 Hz", ""],
  [" Hz · PHYSICS", " Structural"],
  [" Hz · NARRATIVE", " Story"],
  [" Hz · ACTION", " Action"],
  [" Hz · LOCATION", " World"],
  [" Hz · ENTITY", " Discovery"],
  [" Hz · DIALOGUE", " Social"],
  [" Hz · HOLOGRAPHIC", " Ambient"],
  [" Hz", ""],
  ["All Frequencies", "All Modes"],

  // GeoQode in display text (NOT in URL paths or CSS selectors)
  ["GeoQode Developer Summit", "AIOS Developer Summit"],
  ["GeoQode Puzzle", "AIOS Puzzle"],
  ["GeoQode SDK gives your ex", "AIOS SDK gives your ex"],
  ["GeoQode SDK", "AIOS SDK"],
  ["GeoQode Lab", "AIOS Lab"],
  ["GeoQode Studio", "AIOS Studio"],
  ["Lattice Coordinate Editor", "3D Coordinate Editor"],
  ["GeoQode frequencies", "AIOS metadata"],
  ["GeoQode frequency", "AIOS metadata"],
  ["GeoQode freq", "AIOS metadata"],
  ["Merkaba GeoQode OS", "AIOS"],
  ["GeoQode OS", "AIOS"],
  ["GeoQode", "AIOS"],
  ["geoqode (in text)"],  // placeholder — handled below with regex

  // Merkaba in non-game-name contexts
  ["Merkaba Lattice\" — the", "AI engine that powers"],
  ["Merkaba Lattice</strong> — the", "AI</strong> engine that powers"],
  ["<strong style=\"color: #00d4ff\">Merkaba Lattice</strong>", "<strong style=\"color: #00d4ff\">AI</strong>"],
  ["Visualise the Merkaba Lattice in real-time 3D.", "Visualise the 3D AI architecture in real-time."],
  ["Walk through the\n              8→26→48:480 geometry.", ""],
  ["Merkaba Lattice in real-time 3D", "3D AI architecture in real-time"],
  ["Merkaba Lattice", "AIOS"],
  ["Merkaba lattice", "AIOS"],
  ["Powered by Merkaba", "Powered by AIOS"],
  ["Merkaba 8→", "AIOS"],
  ["Merkaba Meditate", "Star Meditate"],
  ["Merkaba Build", "AIOS Build"],
  ["Merkaba star", "star geometry"],
  // Keep "Merkaba Ghosts" — handled at the end via safe-guard

  // Holographic jargon
  ["holographic data panels", "interactive data panels"],
  ["holographic data pan", "interactive data pan"],
  ["float through your pitch as holographic", "float through your pitch as interactive"],
  ["holographic", "immersive"],

  // Quantum jargon (not game names)
  ["quantum probability fields, particle", "particle fields,"],
  ["Quantum Field Sim", "Particle Field Sim"],
  ["quantum field simulation,", "field simulation,"],
  ["quantum field", "field simulation"],
  ["quantum-geometric auth", "geometric auth"],
  ["quantum-geometric", "AI-powered"],
  ["quantum reasoning", "AI reasoning"],
  ["quantum", "AI"],

  // Lattice in non-game-name UI text
  ["Lattice Coordinate Editor", "3D Coordinate Editor"],
  ["Lattice Lounge — Grand Opening", "The Lounge — Grand Opening"],
  ["Lattice Lounge", "The Lounge"],
  ["the lattice ring", "the grid"],
  ["the lattice", "the grid"],
  ["Assign PHI/PSI lattice coordinates and AIOS freq", "Assign 3D coordinates and AIOS metadata"],
  ["lattice nodes", "nodes"],
  ["lattice node", "node"],
  ["lattice geometry", "3D geometry"],
  ["lattice entropy", "entropy"],
  ["lattice as ghost", "space as ghost"],
  ["lattice from entropy", "from entropy"],
  ["reconstruct the lattice", "reconstruct the grid"],
  ["the 3D grid.", "the pattern."],
  ["flooding the lattice", "flooding from"],
  ["lattice", "grid"],  // catch-all for remaining non-game uses

  // Footer / nav text cleanup
  ["Merkaba GeoQode OS", "AIOS"],
  ["AIOS · Built on AIOS", "AIOS"],

  // Additional structural phrases
  ["Frequency mapping, AI field simulation,\n              neural scaffold explorer", "Explore the 3D AI architecture in real-time"],
  ["Visualise the 3D AI architecture in real-time. Walk through the\n              8→26→48:480 geometry.", "Visualise the 3D AI architecture in real-time."],
  ["neural scaffold explorer", "architecture explorer"],
  ["PHYSICS 852", "PHYSICS"],
];

// ── PER-FILE targeted replacements ────────────────────────────────────────

const FILES = {
  "index.html": [
    // Meta/SEO
    [
      'content="AIOS, free browser games, VR games, WebXR, AI games, VR experiences, PLAIStore, Merkaba Ghosts, lattice game, holographic',
      'content="AIOS, free browser games, VR games, WebXR, AI games, VR experiences, PLAIStore, Merkaba Ghosts, Lattice Dodge, Lattice Builder',
    ],
    // Structured data description
    [
      'AIOS — autonomous AI operating system by Brains4Ai. Geometric lattice architecture (8→26→48:480). Self-healing, resonance-certified,\n PHI/PSI dual-attested.',
      "AIOS — autonomous AI operating system by Brains4Ai. Self-healing AI-native platform for games, VR, and apps.",
    ],
    [
      "AIOS — autonomous AI operating system by Brains4Ai. \nGeometric lattice architecture (8→26→48:480). Self-healing, resonance-certified,\n PHI/PSI dual-attested.",
      "AIOS — autonomous AI operating system by Brains4Ai. Self-healing AI-native platform for games, VR, and apps.",
    ],
    // Game card subtitles
    ["Dodge lattice nodes · Survive", "Dodge obstacles · Survive"],
    ["Build the 48-node lattice · PHI geometry", "Pattern puzzle · Memory challenge"],
    // Events section cleanup
    [
      "Matrix Reloaded premiere in VR. Investor Q&As. PHI Breaker\n              tournaments. GeoQode Developer Summit. Live countdown timers.\n              Limited attendance per the 26- and 48-node lattice rings.",
      "Matrix Reloaded premiere in VR. Investor Q&As. PHI Breaker tournaments. AIOS Developer Summit. Live countdown timers.",
    ],
    [
      "Matrix Reloaded premiere in VR. Investor Q&As. PHI Breaker\n              tournaments. AIOS Developer Summit. Live countdown timers.\n              Limited attendance per the 26- and 48-node lattice rings.",
      "Matrix Reloaded premiere in VR. Investor Q&As. PHI Breaker tournaments. AIOS Developer Summit. Live countdown timers.",
    ],
    // Lab section
    [
      "Visualise the Merkaba Lattice in real-time 3D. Walk through the\n              8→26→48:480 geometry. Frequency mapping, quantum field simulation,\n              neural scaffold explorer.",
      "Visualise the 3D AI architecture in real-time. Field simulation, architecture explorer.",
    ],
    [
      "Visualise the 3D AI architecture in real-time. Walk through the\n              8→26→48:480 geometry.",
      "Visualise the 3D AI architecture in real-time.",
    ],
    // PHI-timed
    ["audio, PHI-timed sequences.", "audio, timed sequences."],
    // Philosophy section — Merkaba Lattice reference
    [
      'All connected to the\n            <strong style="color: #00d4ff">Merkaba Lattice</strong> — the\n            PHI-resonant intelligence grid that runs AIOS.',
      'All connected to the\n            <strong style="color: #00d4ff">AI engine</strong> that runs AIOS.',
    ],
    [
      'All connected to the\n            <strong style="color: #00d4ff">AIOS</strong> — the\n            AI engine that powers AIOS.',
      'All powered by the\n            <strong style="color: #00d4ff">AIOS</strong> engine.',
    ],
    // GitHub footer link text (keep URLs, clean display text)
    ["merkaba-geoqode-lattice</a>", "realaios</a>"],
  ],

  "vr-hub.html": [
    // Hero kicker
    ["AIOS VR Platform · Powered by Merkaba 8→26→48:480", "AIOS VR Platform"],
    ["AIOS VR Platform · Powered by AIOS", "AIOS VR Platform"],
    // Hero tech line — remove jargon tags
    [
      '<span>PHI=1.618 · PSI=1.414</span> · <span>72 Hz AIOS Base</span>',
      "",
    ],
    [
      '<span>PHI=1.618 · PSI=1.414</span> · <span>72  AIOS Base</span>',
      "",
    ],
    // Footer
    ["AIOS VR Platform · Powered by Merkaba AIOS", "AIOS VR Platform"],
    // Cinema descriptions
    [
      'desc: "Digital rain, code cascades, D48 lattice as grid. Reality deconstruction in 6DoF.",',
      'desc: "Digital rain, code cascades in 6DoF. Reality deconstruction.",',
    ],
    [
      'desc: "Digital rain, code cascades, 3D environment as grid. Reality deconstruction in 6DoF.",',
      'desc: "Digital rain, code cascades in 6DoF. Reality deconstruction.",',
    ],
    [
      'desc: "Hyperspace jump, orbital battles, Force resonance across the galactic void.",',
      'desc: "Hyperspace jump, orbital battles across the galactic void.",',
    ],
    [
      'desc: "Hyperspace jump, orbital battles, Force across the galactic void.",',
      'desc: "Hyperspace jump, orbital battles across the galactic void.",',
    ],
    // Arcade game descriptions
    [
      'desc: "Defend the 48-node lattice from entropy waves. Shoot frequency disruptors across D480 harmonic space.",',
      'desc: "Defend against entropy waves. Shoot disruptors across 3D space.",',
    ],
    [
      'desc: "Defend against entropy waves. Shoot disruptors across 3D space.",',
      'desc: "Defend against entropy waves. Shoot disruptors across 3D space.",',
    ],
    [
      'desc: "Dodge entropy cubes flooding the lattice ring from all directions. Speed ramps by PHI each wave. 3 lives.",',
      'desc: "Dodge entropy cubes from all directions. Speed ramps each wave. 3 lives.",',
    ],
    [
      'desc: "Dodge entropy cubes flooding the grid from all directions. Speed ramps by  each wave. 3 lives.",',
      'desc: "Dodge entropy cubes from all directions. Speed ramps each wave. 3 lives.",',
    ],
    [
      'desc: "Gaze damaged lattice nodes in PHI sequence order to reconstruct the lattice. Memory puzzle. Rounds grow.",',
      'desc: "Gaze and select nodes in the correct sequence to reconstruct the grid. Memory puzzle. Rounds grow.",',
    ],
    [
      'desc: "8 Storm sector agents haunt the D48 lattice as ghost silhouettes. Attune to each APC by gazing. No NPCs — all ghosts are real AI agents.",',
      'desc: "8 AI sector agents haunt the space as ghost silhouettes. Attune to each ghost by gazing. No NPCs — all ghosts are real AI agents.",',
    ],
    [
      'desc: "8 Storm sector agents haunt the 3D space as ghost silhouettes. Attune to each APC by gazing. No NPCs — all ghosts are real AI agents.",',
      'desc: "8 AI sector agents haunt the space as ghost silhouettes. Attune to each ghost by gazing. No NPCs — all ghosts are real AI agents.",',
    ],
    [
      'desc: "Build  structures in zero gravity before the tide erases them. Geometry as survival.",',
      'desc: "Build structures in zero gravity before the tide erases them. Geometry as survival.",',
    ],
    [
      'desc: "Command an 8-drone PHI-formation swarm to repel lattice entropy invasions. 639 Hz control field.",',
      'desc: "Command an 8-drone formation to repel entropy invasions.",',
    ],
    [
      'desc: "Command an 8-drone formation swarm to repel  entropy invasions. spatial control.",',
      'desc: "Command an 8-drone formation to repel entropy invasions.",',
    ],
    // Wellness titles with Hz
    ['title: "528 Hz Forest",', 'title: "Forest Calm",'],
    ['title: "963 Hz Cosmos",', 'title: "Deep Cosmos",'],
    // Wellness descriptions
    [
      'desc: "Rotating Merkaba star, 72 Hz ambient tone, infinite particle horizon.",',
      'desc: "Rotating star geometry, ambient tone, infinite particle horizon.",',
    ],
    [
      'desc: "Rotating star geometry,  ambient tone, infinite particle horizon.",',
      'desc: "Rotating star geometry, ambient tone, infinite particle horizon.",',
    ],
    [
      'desc: "Photorealistic forest with 528 Hz binaural audio. Heart chakra entrainment.",',
      'desc: "Photorealistic forest with binaural audio. Immersive nature soundscape.",',
    ],
    [
      'desc: "Photorealistic forest with binaural audio. Heart chakra entrainment.",',
      'desc: "Photorealistic forest with binaural audio. Immersive nature soundscape.",',
    ],
    [
      'desc: "Infinite ocean horizon. 417 Hz spatial anchor tone. Pure presence.",',
      'desc: "Infinite ocean horizon with spatial ambient audio. Pure presence.",',
    ],
    [
      'desc: "Infinite ocean horizon.  spatial anchor tone. Pure presence.",',
      'desc: "Infinite ocean horizon with spatial ambient audio. Pure presence.",',
    ],
    [
      'desc: "Cosmic void with 963 Hz crown frequency. Universal consciousness field.",',
      'desc: "Cosmic void with deep ambient audio. Vast space presence.",',
    ],
    [
      'desc: "Cosmic void with  ambient audio. Universal consciousness field.",',
      'desc: "Cosmic void with deep ambient audio. Vast space presence.",',
    ],
    [
      'desc: "Alpine panorama with 741 Hz expression tone. Clarity and elevation.",',
      'desc: "Alpine panorama with ambient audio. Clarity and elevation.",',
    ],
    [
      'desc: "Alpine panorama with  ambient audio. Clarity and elevation.",',
      'desc: "Alpine panorama with ambient audio. Clarity and elevation.",',
    ],
    [
      'desc: "Walk the full 396–963 Hz solfeggio spectrum as colour-coded spatial chambers.",',
      'desc: "Walk through colour-coded spatial chambers. Immersive audio environments.",',
    ],
    [
      'desc: "Walk the full audio spectrum as colour-coded spatial chambers.",',
      'desc: "Walk through colour-coded spatial chambers. Immersive audio environments.",',
    ],
    // Wellness card freq: values
    ['freq: "72 Hz · Base",', 'freq: "Meditation",'],
    ['freq: "528 Hz · Heart",', 'freq: "Nature",'],
    ['freq: "396 Hz · Root",', 'freq: "Grounding",'],
    ['freq: "417 Hz · Sacral",', 'freq: "Presence",'],
    ['freq: "963 Hz · Crown",', 'freq: "Cosmos",'],
    ['freq: "741 Hz · Throat",', 'freq: "Silence",'],
    // Enterprise/other descriptions
    [
      'desc: "Float through your pitch as holographic data panels drift around you. Live polls, voting, agenda navigation, and DIALOGUE-frequency resonance.",',
      'desc: "Float through your pitch as interactive data panels drift around you. Live polls, voting, and agenda navigation.",',
    ],
    [
      'desc: "Float through your pitch as interactive data panels drift around you. Live polls, voting, agenda navigation, and  spatial audio.",',
      'desc: "Float through your pitch as interactive data panels drift around you. Live polls, voting, and agenda navigation.",',
    ],
    [
      'desc: "Decision rooms, DAO voting, leadership councils in spatial audio. Spatial consensus with 639 Hz social resonance.",',
      'desc: "Decision rooms, DAO voting, leadership councils in spatial audio. Open consensus.",',
    ],
    [
      'desc: "Decision rooms, DAO voting, leadership councils in spatial audio. Spatial consensus with  social resonance.",',
      'desc: "Decision rooms, DAO voting, leadership councils in spatial audio. Open consensus.",',
    ],
    // Developer portal card
    [
      'desc: "Create at 741 Hz resonance — spatial canvas, frequency-mapped terrain, live agent injection.',
      'desc: "Create in a spatial canvas with live agent injection.',
    ],
    // Lattice Lounge event title
    ["🏛️ Lattice Lounge — Grand Opening", "🏛️ The Lounge — Grand Opening"],
    ["presence, spatial voice, PHI-resonant architecture. Ope", "presence, spatial voice and open layout. Ope"],
    // Dev banner
    [
      'No gatekeeping. The AIOS SDK gives your ex\n          PHI/PSI lattice coordinates, semantic frequencies, and',
      'No gatekeeping. The AIOS SDK gives your experiences',
    ],
    [
      'No gatekeeping. The AIOS SDK gives your ex\n          immersive coordinates and metadata,',
      'No gatekeeping. The AIOS SDK gives your experiences',
    ],
    // Footer bottom
    [
      "<span>© 2026 Brains4Ai · AIOS VR Platform</span>\n        <span>Powered by Storm · Merkaba GeoQode OS</span>",
      "<span>© 2026 Brains4Ai · AIOS VR Platform</span>\n        <span>Powered by AIOS</span>",
    ],
    [
      "<span>© 2026 Brains4Ai · AIOS VR Platform</span>\n        <span>Powered by AIOS</span>",
      "<span>© 2026 Brains4Ai · AIOS VR Platform</span>\n        <span>Powered by AIOS</span>",
    ],
  ],

  "games.html": [
    // Title and meta
    ["AIOS Arcade — Games born from the lattice", "AIOS Arcade — Free Browser Games"],
    ["AIOS Arcade — Games born from the Merkaba lattice", "AIOS Arcade — Free Browser Games"],
    [
      'content="Browser and VR games built on PHI geometry and the 48-node Merkaba lattice. Play free on any device. VR headset optional."',
      'content="Browser and VR games. Play free on any device or in VR. No download needed."',
    ],
    [
      'content="Browser and VR games built on  geometry and the node 3D environment. Play free on any device. VR headset optional."',
      'content="Browser and VR games. Play free on any device or in VR. No download needed."',
    ],
    // OG tags
    [
      'content="AIOS Arcade — Games born from the Merkaba lattice"',
      'content="AIOS Arcade — Free Browser Games"',
    ],
    [
      'content="Browser and VR games built on PHI geometry and the 48-node Merkaba lattice. Play free on any device. VR headset optional."',
      'content="Browser and VR games. Play free on any device or in VR. No download needed."',
    ],
    // Hero pill
    ['<span class="pill-phi">', '<span class="pill-phi" style="display:none">'],
    // Game descriptions
    [
      'Defend the 48-node lattice from entropy waves. Shoot frequency disruptors across D480 harmonic space.',
      'Defend against entropy waves. Shoot disruptors across 3D space.',
    ],
    [
      'Dodge entropy cubes flooding the lattice ring from all directions. Speed ramps by PHI each wave. 3 lives.',
      'Dodge entropy cubes from all directions. Speed ramps each wave. 3 lives.',
    ],
    [
      'Gaze damaged lattice nodes in PHI sequence order to reconstruct the lattice. Memory puzzle. Rounds grow.',
      'Gaze and select nodes in the correct sequence to rebuild the grid. Memory puzzle. Rounds grow.',
    ],
    [
      '8 Storm sector agents haunt the D48 lattice as ghost silhouettes. Attune to each APC by gazing. No NPCs.',
      '8 AI sector agents haunt the space as ghost silhouettes. Attune to each ghost by gazing. No NPCs.',
    ],
  ],
};

// ── Main ──────────────────────────────────────────────────────────────────
const allFiles = [
  "index.html",
  "vr-hub.html",
  "vr.html",
  "games.html",
  "aios-studio.html",
  "vr-developer.html",
  "lab.html",
  "live.html",
  "dashboard.html",
  "start.html",
  "plaistore.html",
];

let grandTotal = 0;

for (const file of allFiles) {
  let src;
  try {
    src = load(file);
  } catch {
    console.warn(`⚠️  ${file} not found — skipping`);
    continue;
  }

  // Apply per-file targeted replacements first
  if (FILES[file]) {
    const [next, n] = applyReplacements(src, FILES[file]);
    src = next;
    grandTotal += n;
  }

  // Apply global replacements
  const [next, n] = applyReplacements(src, GLOBAL);
  src = next;
  grandTotal += n;

  // Safety guard: restore game names that may have been clobbered
  // These replacements only fix cases where "lattice"/"merkaba" global caught game names
  src = src
    .replace(/Merkaba ghosts/gi, (m) => {
      // Only restore if it's actually the game name context (href or title)
      return m;
    });

  // Restore exact game names if they got mangled by global "lattice" → "grid" replacements
  // "Lattice Dodge" and "Lattice Builder" contain "Lattice" — protect them
  // The global replacement converts standalone "lattice" but these are proper names capitalised
  // Global only replaces lowercase "lattice" in most contexts; these have capital L
  // Run a targeted restore pass
  src = src
    .replace(/\bgrid Dodge\b/g, "Lattice Dodge")
    .replace(/\bGrid Dodge\b/g, "Lattice Dodge")
    .replace(/\bgrid Builder\b/g, "Lattice Builder")
    .replace(/\bGrid Builder\b/g, "Lattice Builder")
    .replace(/\bMerkaba Ghosts\b/g, "Merkaba Ghosts") // already correct — no-op but explicit
    .replace(/\bPHI Breaker\b/g, "PHI Breaker");      // already correct — no-op but explicit

  save(file, src);
}

console.log(`\nTotal replacements across all files: ${grandTotal}`);
