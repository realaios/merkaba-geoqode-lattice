/**
 * GEO-MOJI — Canonical Geometric Glyph Registry
 * @alignment 8→26→48:480
 * @version 1.0.0 (2026-05-11)
 *
 * DESIGN PRINCIPLE:
 *   Every complex shape that exists is rooted in a Primitive.
 *   That is the essence of geometry — from primitive simplicity you can
 *   construct the most complex geometry, all the way up to Sacred Geometry.
 *
 * STRUCTURE:
 *   D8  Ring (nodes  0– 7) — Absolute Primitives: the 8 geometric atoms.
 *                            Point, Line, Triangle, Square, Circle, Hexagon.
 *   D26 Ring (nodes  8–25) — Derived Forms: filled, combined, operated.
 *   D48 Ring (nodes 26–47) — Sacred / Complex: PHI-convergent, Merkaba forms.
 *
 * ENCODING RULES (MANDATORY — Windows/PowerShell compatibility):
 *   - ALL glyphs are BMP-only (U+0000–U+FFFF). ZERO surrogate pairs.
 *   - No raw emoji characters in source. Only \\uXXXX escape sequences.
 *   - Variation selector U+FE0F is NEVER appended (forces text presentation).
 *   - Emoji block (U+1F300+) is FORBIDDEN. Use GEO_MOJI instead.
 *
 * SEMANTIC FREQUENCY MAP (GeoQode):
 *   ENTITY      396 Hz — identification, labelling
 *   LOCATION    417 Hz — spatial, directional anchoring
 *   ACTION      528 Hz — transformation, execution
 *   DIALOGUE    639 Hz — communication, exchange
 *   EMOTION     741 Hz — resonance, feeling state
 *   PHYSICS     852 Hz — structural laws, geometry
 *   NARRATIVE   963 Hz — continuity, meaning
 *   HOLOGRAPHIC  72 Hz — base lattice, self-reference
 *
 * USAGE:
 *   import { GEO_MOJI, gm, gmByRole } from '../geo/glyph/geo-moji.js';
 *
 *   element.textContent = gm('play');           // by role name
 *   element.textContent = GEO_MOJI[14].char;    // by lattice node
 *   const heart = gmByRole('reaction.love');    // semantic lookup
 */

// ---------------------------------------------------------------------------
// D8 — FOUNDATION RING  (nodes 0–7)
// The 8 absolute geometric primitives. One per Foundation Node.
// These are the irreducible atoms from which all shapes are constructed.
// ---------------------------------------------------------------------------
const D8 = [
  {
    node: 0,
    ring: "D8",
    char: "\u00B7",
    hex: "U+00B7",
    name: "POINT",
    label: "Singularity \u00B7 Origin \u00B7 Dimension 0",
    semanticType: "HOLOGRAPHIC",
    hz: 72,
    roles: ["node", "dot", "origin"],
    primitive: 0,
    description: "The dimensionless point. All geometry begins here.",
  },
  {
    node: 1,
    ring: "D8",
    char: "\u2014",
    hex: "U+2014",
    name: "LINE",
    label: "Extension \u00B7 Direction \u00B7 Dimension 1",
    semanticType: "LOCATION",
    hz: 417,
    roles: ["line", "separator", "dash"],
    primitive: 1,
    description: "The line. Two points create dimension.",
  },
  {
    node: 2,
    ring: "D8",
    char: "\u25B3",
    hex: "U+25B3",
    name: "TRIANGLE-UP",
    label: "Trinity \u00B7 Fire \u00B7 Ascent",
    semanticType: "PHYSICS",
    hz: 852,
    roles: ["up", "ascend", "alpha", "increase"],
    primitive: 2,
    description: "Upward triangle. First closed 2D form. Fire element.",
  },
  {
    node: 3,
    ring: "D8",
    char: "\u25BD",
    hex: "U+25BD",
    name: "TRIANGLE-DOWN",
    label: "Inversion \u00B7 Water \u00B7 Descent",
    semanticType: "PHYSICS",
    hz: 852,
    roles: ["down", "descend", "omega", "decrease"],
    primitive: 2,
    description: "Downward triangle. Inversion of fire. Water element.",
  },
  {
    node: 4,
    ring: "D8",
    char: "\u25A1",
    hex: "U+25A1",
    name: "SQUARE",
    label: "Stability \u00B7 Earth \u00B7 Foundation",
    semanticType: "ENTITY",
    hz: 396,
    roles: ["square", "grid", "stable", "container"],
    primitive: 2,
    description: "Square. Four equal sides. Earth element. Stability.",
  },
  {
    node: 5,
    ring: "D8",
    char: "\u25CB",
    hex: "U+25CB",
    name: "CIRCLE",
    label: "Wholeness \u00B7 Cycle \u00B7 Unity",
    semanticType: "HOLOGRAPHIC",
    hz: 72,
    roles: ["circle", "cycle", "whole", "empty"],
    primitive: 2,
    description: "Circle. Infinite sides. Unity. The boundary of potential.",
  },
  {
    node: 6,
    ring: "D8",
    char: "\u2B21",
    hex: "U+2B21",
    name: "HEXAGON",
    label: "Merkaba Base \u00B7 Lattice \u00B7 Honeycomb",
    semanticType: "HOLOGRAPHIC",
    hz: 72,
    roles: ["hex", "lattice", "merkaba", "season", "tier"],
    primitive: 2,
    description: "Hexagon. Optimal tiling. Foundation of the Merkaba lattice.",
  },
  {
    node: 7,
    ring: "D8",
    char: "\u2726",
    hex: "U+2726",
    name: "STAR-4",
    label: "Cardinal Cross \u00B7 4 Directions",
    semanticType: "ACTION",
    hz: 528,
    roles: ["star", "cardinal", "cross", "spark"],
    primitive: 2,
    description: "Four-pointed star. The cardinal directions unified.",
  },
];

// ---------------------------------------------------------------------------
// D26 — BOSONIC RING  (nodes 8–25)
// Derived geometric forms: filled, combined, rotated, operated primitives.
// Built from D8 atoms. 18 new nodes added to the 8 foundation nodes.
// ---------------------------------------------------------------------------
const D26 = [
  {
    node: 8,
    ring: "D26",
    char: "\u25CF",
    hex: "U+25CF",
    name: "CIRCLE-FILLED",
    label: "Manifestation \u00B7 Solid Node",
    semanticType: "ENTITY",
    hz: 396,
    roles: ["filled", "node", "dot", "bullet", "active"],
    primitive: 2,
    description: "Filled circle. The point manifested into mass.",
  },
  {
    node: 9,
    ring: "D26",
    char: "\u25B2",
    hex: "U+25B2",
    name: "TRIANGLE-UP-FILLED",
    label: "Active Ascent \u00B7 Alert \u00B7 Forward",
    semanticType: "ACTION",
    hz: 528,
    roles: ["up-filled", "alert", "action", "forward"],
    primitive: 2,
    description: "Filled upward triangle. Active, directional energy.",
  },
  {
    node: 10,
    ring: "D26",
    char: "\u25BC",
    hex: "U+25BC",
    name: "TRIANGLE-DOWN-FILLED",
    label: "Gravity \u00B7 Ground \u00B7 Drop",
    semanticType: "PHYSICS",
    hz: 852,
    roles: ["down-filled", "dropdown", "collapse", "gravity"],
    primitive: 2,
    description: "Filled downward triangle. Weight, gravity, collapse.",
  },
  {
    node: 11,
    ring: "D26",
    char: "\u25C6",
    hex: "U+25C6",
    name: "DIAMOND-FILLED",
    label: "Rotation \u00B7 45\u00B0 Square \u00B7 Focus",
    semanticType: "LOCATION",
    hz: 417,
    roles: ["diamond", "rotated", "focus", "pip"],
    primitive: 2,
    description: "Diamond. Square rotated 45°. Focus point in space.",
  },
  {
    node: 12,
    ring: "D26",
    char: "\u2B22",
    hex: "U+2B22",
    name: "HEXAGON-FILLED",
    label: "Solid Lattice \u00B7 Dense Node",
    semanticType: "ENTITY",
    hz: 396,
    roles: ["hex-filled", "lattice-solid", "dense"],
    primitive: 2,
    description: "Filled hexagon. The Merkaba node solidified.",
  },
  {
    node: 13,
    ring: "D26",
    char: "\u2605",
    hex: "U+2605",
    name: "STAR-5-FILLED",
    label: "Excellence \u00B7 Achievement \u00B7 Gold",
    semanticType: "NARRATIVE",
    hz: 963,
    roles: ["star-filled", "excellence", "rating", "achievement", "complete"],
    primitive: 2,
    description: "Filled five-pointed star. Excellence. Completion.",
  },
  {
    node: 14,
    ring: "D26",
    char: "\u2295",
    hex: "U+2295",
    name: "CIRCLE-PLUS",
    label: "Addition \u00B7 Join \u00B7 Add to Set",
    semanticType: "ACTION",
    hz: 528,
    roles: ["add", "plus", "join", "queue-add", "expand"],
    primitive: 3,
    description: "Circled plus. Addition contained within unity.",
  },
  {
    node: 15,
    ring: "D26",
    char: "\u2296",
    hex: "U+2296",
    name: "CIRCLE-MINUS",
    label: "Subtraction \u00B7 Remove \u00B7 Split",
    semanticType: "ACTION",
    hz: 528,
    roles: ["remove", "minus", "subtract", "vol-down"],
    primitive: 3,
    description: "Circled minus. Subtraction contained within unity.",
  },
  {
    node: 16,
    ring: "D26",
    char: "\u2297",
    hex: "U+2297",
    name: "CIRCLE-CROSS",
    label: "Block \u00B7 Negate \u00B7 Close",
    semanticType: "PHYSICS",
    hz: 852,
    roles: ["block", "negate", "close", "cancel"],
    primitive: 3,
    description: "Circled cross. Negation. Crossing out. Closure.",
  },
  {
    node: 17,
    ring: "D26",
    char: "\u2299",
    hex: "U+2299",
    name: "CIRCLE-DOT",
    label: "Radiance \u00B7 Sun Point \u00B7 Origin in Field",
    semanticType: "HOLOGRAPHIC",
    hz: 72,
    roles: ["radiant", "sun", "focus-radiant", "lens"],
    primitive: 3,
    description:
      "Circled dot. Point radiating within the circle. The sun glyph.",
  },
  {
    node: 18,
    ring: "D26",
    char: "\u229A",
    hex: "U+229A",
    name: "CIRCLE-RING",
    label: "Orbit \u00B7 Rotation \u00B7 Contained Cycle",
    semanticType: "LOCATION",
    hz: 417,
    roles: ["orbit", "rotate", "cycle", "ambient"],
    primitive: 3,
    description: "Circle within circle. Orbit. Contained rotation.",
  },
  {
    node: 19,
    ring: "D26",
    char: "\u229B",
    hex: "U+229B",
    name: "CIRCLE-STAR",
    label: "Active Radiant Energy \u00B7 Fire \u00B7 Transformation",
    semanticType: "ACTION",
    hz: 528,
    roles: ["spark", "energy", "fire", "radiant-active", "reaction.energy"],
    primitive: 3,
    description:
      "Star in circle. Active, radiating energy — fire contained. Transformation in progress.",
  },
  {
    node: 20,
    ring: "D26",
    char: "\u25CE",
    hex: "U+25CE",
    name: "BULLSEYE",
    label: "Target \u00B7 Focus \u00B7 Centre",
    semanticType: "ACTION",
    hz: 528,
    roles: ["target", "focus", "centre", "prog-icon-default"],
    primitive: 3,
    description: "Bullseye. Concentric circles. The target.",
  },
  {
    node: 21,
    ring: "D26",
    char: "\u29BF",
    hex: "U+29BF",
    name: "CIRCLED-BULLET",
    label: "Lattice Node \u00B7 Shuffle \u00B7 Selection",
    semanticType: "HOLOGRAPHIC",
    hz: 72,
    roles: ["lattice-node", "shuffle", "random", "select"],
    primitive: 3,
    description: "Circled bullet. A filled node in the lattice field.",
  },
  {
    node: 22,
    ring: "D26",
    char: "\u2714",
    hex: "U+2714",
    name: "CHECK",
    label: "Verification \u00B7 Truth \u00B7 Watched",
    semanticType: "PHYSICS",
    hz: 852,
    roles: ["check", "verify", "watched", "complete", "true"],
    primitive: 2,
    description: "Check mark. Geometric verification. Truth attested.",
  },
  {
    node: 23,
    ring: "D26",
    char: "\u21BA",
    hex: "U+21BA",
    name: "ROTATE-CCW",
    label: "Reverse \u00B7 Rewind \u00B7 Counterclockwise",
    semanticType: "ACTION",
    hz: 528,
    roles: ["rewind", "back", "undo", "skip-back", "ccw"],
    primitive: 2,
    description: "Counterclockwise arrow. Reverse time. Rewind.",
  },
  {
    node: 24,
    ring: "D26",
    char: "\u21BB",
    hex: "U+21BB",
    name: "ROTATE-CW",
    label: "Forward \u00B7 Advance \u00B7 Clockwise",
    semanticType: "ACTION",
    hz: 528,
    roles: ["forward", "skip-forward", "redo", "cw"],
    primitive: 2,
    description: "Clockwise arrow. Forward time. Advance.",
  },
  {
    node: 25,
    ring: "D26",
    char: "\u2192",
    hex: "U+2192",
    name: "ARROW-RIGHT",
    label: "Flow \u00B7 Direction \u00B7 Next",
    semanticType: "LOCATION",
    hz: 417,
    roles: ["flow", "direction", "next", "arrow", "navigate"],
    primitive: 2,
    description: "Rightward arrow. Flow. Direction. Navigation.",
  },
];

// ---------------------------------------------------------------------------
// D48 — CANONICAL LATTICE  (nodes 26–47)
// Sacred and complex geometric forms. PHI-convergent. Merkaba-derived.
// These emerge only from combining the D8 + D26 base forms.
// ---------------------------------------------------------------------------
const D48 = [
  {
    node: 26,
    ring: "D48",
    char: "\u27E8",
    hex: "U+27E8",
    name: "ANGLE-LEFT",
    label: "Opening \u00B7 Receive \u00B7 Bracket Left",
    semanticType: "DIALOGUE",
    hz: 639,
    roles: ["open", "receive", "bracket-left", "swipe-left", "prev"],
    primitive: 3,
    description: "Mathematical angle bracket left. Opening. Receiving.",
  },
  {
    node: 27,
    ring: "D48",
    char: "\u27E9",
    hex: "U+27E9",
    name: "ANGLE-RIGHT",
    label: "Closing \u00B7 Transmit \u00B7 Bracket Right",
    semanticType: "DIALOGUE",
    hz: 639,
    roles: ["close", "transmit", "bracket-right", "swipe-right", "next"],
    primitive: 3,
    description: "Mathematical angle bracket right. Closing. Transmitting.",
  },
  {
    node: 28,
    ring: "D48",
    char: "\u25C8",
    hex: "U+25C8",
    name: "DIAMOND-DOT",
    label: "PHI Convergence \u00B7 The Merkaba Eye",
    semanticType: "PHYSICS",
    hz: 852,
    roles: ["phi-point", "merkaba-eye", "convergence", "reaction.mindblow"],
    primitive: 4,
    description:
      "Diamond containing dot. PHI convergence. The eye of the lattice.",
  },
  {
    node: 29,
    ring: "D48",
    char: "\u29EB",
    hex: "U+29EB",
    name: "LOZENGE-FILLED",
    label: "Merkaba Cross-Section \u00B7 Dense Diamond",
    semanticType: "PHYSICS",
    hz: 852,
    roles: ["merkaba-section", "dense-diamond", "pip"],
    primitive: 3,
    description: "Filled lozenge. The cross-section of a Merkaba solid.",
  },
  {
    node: 30,
    ring: "D48",
    char: "\u25C7",
    hex: "U+25C7",
    name: "DIAMOND-EMPTY",
    label: "Void Diamond \u00B7 Pure Potential",
    semanticType: "EMOTION",
    hz: 741,
    roles: ["void", "potential", "open-diamond", "mini"],
    primitive: 2,
    description:
      "White diamond. The void. Pure potential before manifestation.",
  },
  {
    node: 31,
    ring: "D48",
    char: "\u25B7",
    hex: "U+25B7",
    name: "TRIANGLE-RIGHT-EMPTY",
    label: "Queue \u00B7 Play Next \u00B7 Flow",
    semanticType: "ACTION",
    hz: 528,
    roles: ["queue-play", "flow-right", "next-small", "cursor"],
    primitive: 2,
    description: "White right triangle. Gentle forward flow.",
  },
  {
    node: 32,
    ring: "D48",
    char: "\u25C1",
    hex: "U+25C1",
    name: "TRIANGLE-LEFT-EMPTY",
    label: "Back \u00B7 Return \u00B7 Reverse Flow",
    semanticType: "ACTION",
    hz: 528,
    roles: ["back-flow", "prev-small", "return"],
    primitive: 2,
    description: "White left triangle. Gentle backward flow.",
  },
  {
    node: 33,
    ring: "D48",
    char: "\u2727",
    hex: "U+2727",
    name: "STAR-4-EMPTY",
    label: "Potential Energy \u00B7 Latent Spark",
    semanticType: "EMOTION",
    hz: 741,
    roles: ["potential-spark", "latent", "sparkle", "reaction.sparkle"],
    primitive: 2,
    description: "White four-pointed star. Energy in potential state.",
  },
  {
    node: 34,
    ring: "D48",
    char: "\u2733",
    hex: "U+2733",
    name: "STAR-8",
    label: "Octave \u00B7 8 Foundation Nodes \u00B7 Full Cycle",
    semanticType: "HOLOGRAPHIC",
    hz: 72,
    roles: ["octave", "d8-symbol", "full-cycle", "notification"],
    primitive: 2,
    description: "Eight-spoked asterisk. The 8 foundation nodes unified.",
  },
  {
    node: 35,
    ring: "D48",
    char: "\u229E",
    hex: "U+229E",
    name: "SQUARE-PLUS",
    label: "Bounded Addition \u00B7 Stable Growth",
    semanticType: "ACTION",
    hz: 528,
    roles: ["bounded-add", "vol-up-bounded", "stable-grow"],
    primitive: 3,
    description: "Squared plus. Addition within stable bounds.",
  },
  {
    node: 36,
    ring: "D48",
    char: "\u229F",
    hex: "U+229F",
    name: "SQUARE-MINUS",
    label: "Bounded Removal \u00B7 Stable Reduce",
    semanticType: "ACTION",
    hz: 528,
    roles: ["bounded-remove", "vol-down-bounded", "stable-reduce"],
    primitive: 3,
    description: "Squared minus. Removal within stable bounds.",
  },
  {
    node: 37,
    ring: "D48",
    char: "\u22A0",
    hex: "U+22A0",
    name: "SQUARE-CROSS",
    label: "Bounded Block \u00B7 Locked \u00B7 Mute",
    semanticType: "PHYSICS",
    hz: 852,
    roles: ["mute", "locked", "blocked", "vol-mute"],
    primitive: 3,
    description: "Squared times. Blocking within stable bounds. Mute.",
  },
  {
    node: 38,
    ring: "D48",
    char: "\u22A1",
    hex: "U+22A1",
    name: "SQUARE-DOT",
    label: "Bounded Point \u00B7 Grounded Origin",
    semanticType: "ENTITY",
    hz: 396,
    roles: ["grounded", "anchored", "bounded-point"],
    primitive: 3,
    description: "Squared dot. A point made stable by its boundary.",
  },
  {
    node: 39,
    ring: "D48",
    char: "\u2661",
    hex: "U+2661",
    name: "HEART-OPEN",
    label: "Open Resonance \u00B7 Dialogue \u00B7 Appreciation",
    semanticType: "DIALOGUE",
    hz: 639,
    roles: ["love", "heart", "appreciate", "reaction.love"],
    primitive: 2,
    description:
      "White heart. Open resonance. The geo-replacement for heart emoji.",
  },
  {
    node: 40,
    ring: "D48",
    char: "\u2662",
    hex: "U+2662",
    name: "DIAMOND-SUIT",
    label: "Pure Form \u00B7 Elemental Diamond",
    semanticType: "EMOTION",
    hz: 741,
    roles: ["pure-form", "elemental", "reaction.pure"],
    primitive: 2,
    description: "White diamond suit. Elemental pure form.",
  },
  {
    node: 41,
    ring: "D48",
    char: "\u2731",
    hex: "U+2731",
    name: "ASTERISK-HEAVY",
    label: "Node Intersection \u00B7 Lattice Cross \u00B7 Share",
    semanticType: "PHYSICS",
    hz: 852,
    roles: ["share", "intersect", "cross-node", "distribute"],
    primitive: 2,
    description: "Heavy asterisk. All lines crossing through one point.",
  },
  {
    node: 42,
    ring: "D48",
    char: "\u26F6",
    hex: "U+26F6",
    name: "SQUARE-FOUR-CORNERS",
    label: "Fullscreen \u00B7 Total Field \u00B7 Expansion",
    semanticType: "ACTION",
    hz: 528,
    roles: ["fullscreen", "expand-full", "total-field"],
    primitive: 3,
    description: "Square with four corners marked. Fullscreen. Total field.",
  },
  {
    node: 43,
    ring: "D48",
    char: "\u29C9",
    hex: "U+29C9",
    name: "SQUARES-JOINED",
    label: "Picture-in-Picture \u00B7 Nested Fields",
    semanticType: "LOCATION",
    hz: 417,
    roles: ["pip", "picture-in-picture", "nested", "overlay"],
    primitive: 3,
    description: "Two joined squares. PiP mode. Nested spatial fields.",
  },
  {
    node: 44,
    ring: "D48",
    char: "\u2913",
    hex: "U+2913",
    name: "DOWNWARD-TO-BAR",
    label: "Mini Player \u00B7 Collapse Down \u00B7 Shrink",
    semanticType: "ACTION",
    hz: 528,
    roles: ["mini-player", "collapse", "shrink", "bottom"],
    primitive: 2,
    description: "Downward arrow to bar. Collapse to minimum. Mini mode.",
  },
  {
    node: 45,
    ring: "D48",
    char: "\u221E",
    hex: "U+221E",
    name: "INFINITY",
    label: "Eternal Recursion \u00B7 Binge Mode \u00B7 Loop",
    semanticType: "NARRATIVE",
    hz: 963,
    roles: ["infinity", "loop", "binge", "eternal", "continuous"],
    primitive: 4,
    description: "Infinity symbol. The lemniscate. Eternal recursion.",
  },
  {
    node: 46,
    ring: "D48",
    char: "\u2205",
    hex: "U+2205",
    name: "EMPTY-SET",
    label: "Void \u00B7 Null \u00B7 Nothing Playing",
    semanticType: "HOLOGRAPHIC",
    hz: 72,
    roles: ["empty", "null", "void", "nothing", "offline"],
    primitive: 2,
    description: "Empty set symbol. The void. Null state.",
  },
  {
    node: 47,
    ring: "D48",
    char: "\u03A6",
    hex: "U+03A6",
    name: "PHI",
    label: "Golden Root \u00B7 \u03A6=1.618 \u00B7 The Lattice Constant",
    semanticType: "PHYSICS",
    hz: 852,
    roles: ["phi", "golden-ratio", "lattice-constant", "merkaba-root"],
    primitive: 0,
    description:
      "Capital Phi. The Golden Root. PHI=1.618. The invariant anchor of all geometry.",
  },
];

// ---------------------------------------------------------------------------
// FULL D48 REGISTRY
// Flat array — index === lattice node number.
// ---------------------------------------------------------------------------
export const GEO_MOJI = Object.freeze([...D8, ...D26, ...D48]);

// ---------------------------------------------------------------------------
// ROLE INDEX — O(1) lookup by role string
// ---------------------------------------------------------------------------
const _roleIndex = new Map();
GEO_MOJI.forEach(function (g) {
  g.roles.forEach(function (r) {
    if (!_roleIndex.has(r)) _roleIndex.set(r, g);
  });
});

/**
 * Get a Geo-Moji character by role name.
 * @param {string} role — e.g. "play", "heart", "reaction.love", "fullscreen"
 * @returns {string} the character (safe BMP glyph)
 */
export function gm(role) {
  var entry = _roleIndex.get(role);
  return entry ? entry.char : "\u25CE"; // fallback: bullseye (node 20)
}

/**
 * Get the full Geo-Moji entry by role.
 * @param {string} role
 * @returns {object|null}
 */
export function gmByRole(role) {
  return _roleIndex.get(role) || null;
}

/**
 * Get Geo-Moji by lattice node number (0–47).
 * @param {number} node
 * @returns {object}
 */
export function gmByNode(node) {
  return GEO_MOJI[node] || GEO_MOJI[20]; // fallback: bullseye
}

/**
 * Get all Geo-Mojies for a given semantic type.
 * @param {string} semanticType — e.g. "ACTION", "PHYSICS", "HOLOGRAPHIC"
 * @returns {object[]}
 */
export function gmBySemantic(semanticType) {
  return GEO_MOJI.filter(function (g) {
    return g.semanticType === semanticType;
  });
}

/**
 * Get all Geo-Mojies for a ring.
 * @param {"D8"|"D26"|"D48"} ring
 * @returns {object[]}
 */
export function gmByRing(ring) {
  return GEO_MOJI.filter(function (g) {
    return g.ring === ring;
  });
}

// ---------------------------------------------------------------------------
// REACTION SET — canonical replacement for all emoji in the reaction picker
// Each mapped to a D48 lattice node with full GeoQode coordinate.
// ---------------------------------------------------------------------------
export const GEO_REACTIONS = Object.freeze([
  {
    role: "reaction.love",
    char: GEO_MOJI[39].char,
    label: "Resonate",
    node: 39,
  }, // ♡ U+2661
  {
    role: "reaction.mindblow",
    char: GEO_MOJI[28].char,
    label: "Convergent",
    node: 28,
  }, // ◈ U+25C8
  {
    role: "reaction.celebrate",
    char: GEO_MOJI[14].char,
    label: "Amplify",
    node: 14,
  }, // ⊕ U+2295
  {
    role: "reaction.sparkle",
    char: GEO_MOJI[33].char,
    label: "Latent",
    node: 33,
  }, // ✧ U+2727
  {
    role: "reaction.energy",
    char: GEO_MOJI[19].char,
    label: "Field",
    node: 19,
  }, // ⊛ U+229B
  {
    role: "reaction.lattice",
    char: GEO_MOJI[6].char,
    label: "Lattice",
    node: 6,
  }, // ⬡ U+2B21
]);

// ---------------------------------------------------------------------------
// PLAYER ICON MAP — direct replacement for all aiosdream.html player controls
// ---------------------------------------------------------------------------
export const PLAYER_ICONS = Object.freeze({
  play: "\u25B6", // ▶  node 9 / U+25B6 — ACTION 528Hz
  pause: "\u23F8", // ⏸  U+23F8 BMP — suspension bars
  skipBack: GEO_MOJI[23].char, // ↺ node 23
  skipFwd: GEO_MOJI[24].char, // ↻ node 24
  prev: "\u23EE", // ⏮  U+23EE — skip to start
  next: "\u23ED", // ⏭  U+23ED — skip to end
  volMute: GEO_MOJI[37].char, // ⊠ node 37 — bounded block
  volLow: GEO_MOJI[36].char, // ⊟ node 36 — bounded minus
  volHigh: GEO_MOJI[14].char, // ⊕ node 14 — circled plus
  pip: GEO_MOJI[43].char, // ⧉ node 43
  mini: GEO_MOJI[44].char, // ⬓ node 44
  share: GEO_MOJI[41].char, // ✱ node 41 — asterisk/intersect
  fullscreen: GEO_MOJI[42].char, // ⛶ node 42
  react: GEO_MOJI[19].char, // ⊛ node 19 — radiant energy
  signedOut: "\u25CB", // ○ node 5 — open circle = empty/unsigned
  signIn: "\u25CF", // ● node 8 — filled = identity present
  shuffle: GEO_MOJI[21].char, // ⦿ node 21
  binge: GEO_MOJI[45].char, // ∞ node 45
  watched: GEO_MOJI[22].char, // ✔ node 22
  complete: GEO_MOJI[13].char, // ★ node 13
  add: GEO_MOJI[14].char, // ⊕ node 14
  close: "\u2715", // ✕ U+2715 — multiplication x (close)
  back: "\u2190", // ← U+2190 — leftward arrow
  notification: GEO_MOJI[34].char, // ✳ node 34 — eight-spoked star
  ambient: GEO_MOJI[18].char, // ⊚ node 18 — orbit/cycle
  theme: GEO_MOJI[7].char, // ✦ node 7 — four-pointed star
  keyboard: "\u229E", // ⊞ node 35 — squared plus (kbd grid)
});

// ---------------------------------------------------------------------------
// GeoQode coordinate builder for any Geo-Moji
// ---------------------------------------------------------------------------
export function buildGeoMojiCoordinate(node) {
  var g = GEO_MOJI[node];
  if (!g) return null;
  var PHI = 1.618;
  var harmonicNode = Math.floor(node * 10 + PHI);
  return {
    architectureSignature: "8,26,48:480",
    semanticType: g.semanticType,
    frequency: g.hz,
    latticeNode: g.node,
    harmonicNode: harmonicNode,
    phiCoefficient: PHI,
    coherence: 1.0,
    domain: "glyph-registry",
    source: "geo-moji",
    glyph: g.char,
    glyphName: g.name,
    d48Expansion: "CANONICAL",
    d480Expansion: "FULL_HARMONIC",
  };
}

// Default export: the full registry
export default GEO_MOJI;
