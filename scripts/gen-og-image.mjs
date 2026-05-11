/**
 * gen-og-image.mjs
 * Generates public/og-image.png for AIOS social sharing.
 * Uses ONLY Node.js built-ins (zlib, fs, path) — zero external deps.
 * Run: node scripts/gen-og-image.mjs
 */

import { deflateSync } from "zlib";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const W = 1200;
const H = 630;
const CHANNELS = 3; // RGB

// ── CRC32 for PNG chunks ──────────────────────────────────────────────
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
  CRC_TABLE[i] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) crc = CRC_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n);
  return b;
}
function pngChunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const crcSrc = Buffer.concat([t, d]);
  return Buffer.concat([u32(d.length), t, d, u32(crc32(crcSrc))]);
}

// ── Image data ────────────────────────────────────────────────────────
// Each row: 1 filter byte (0 = None) + W * CHANNELS bytes
const raw = Buffer.alloc(H * (W * CHANNELS + 1), 0);

// Helper: draw a pixel
function setPixel(x, y, r, g, b) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const off = y * (W * CHANNELS + 1) + 1 + x * CHANNELS;
  raw[off] = r;
  raw[off + 1] = g;
  raw[off + 2] = b;
}

// Helper: draw a line (Bresenham)
function drawLine(x0, y0, x1, y1, r, g, b) {
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    setPixel(x0, y0, r, g, b);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
}

// Helper: draw a circle outline
function drawCircle(cx, cy, radius, r, g, b) {
  let x = 0, y = radius, d = 1 - radius;
  while (x <= y) {
    setPixel(cx + x, cy + y, r, g, b); setPixel(cx - x, cy + y, r, g, b);
    setPixel(cx + x, cy - y, r, g, b); setPixel(cx - x, cy - y, r, g, b);
    setPixel(cx + y, cy + x, r, g, b); setPixel(cx - y, cy + x, r, g, b);
    setPixel(cx + y, cy - x, r, g, b); setPixel(cx - y, cy - x, r, g, b);
    if (d < 0) { d += 2 * x + 3; } else { d += 2 * (x - y) + 5; y--; }
    x++;
  }
}

// ── 1. Background: dark navy gradient (#030712 → #0d1b2a) ──────────────
for (let y = 0; y < H; y++) {
  const t = y / H;
  const bgR = Math.round(3 + 10 * t);
  const bgG = Math.round(7 + 20 * t);
  const bgB = Math.round(18 + 24 * t);
  const rowBase = y * (W * CHANNELS + 1) + 1;
  for (let x = 0; x < W; x++) {
    const off = rowBase + x * CHANNELS;
    raw[off] = bgR;
    raw[off + 1] = bgG;
    raw[off + 2] = bgB;
  }
}

// ── 2. Hex grid lines (subtle, ~5% opacity → very dark cyan) ──────────
// Flat-top hex pattern, size 70
const HEX_R = 70;
const HEX_H = Math.round(HEX_R * Math.sqrt(3));
const HEX_CX = [440, 600, 760, 360, 520, 680, 840];
const HEX_CY = [185, 185, 185, 185 + HEX_H, 185 + HEX_H, 185 + HEX_H, 185 + HEX_H];
const HEX_PAIRS = [
  [440, 185], [600, 185], [760, 185],
  [520, 185 + HEX_H], [680, 185 + HEX_H],
];

// 6-vertex polygon for each center
function hexVertices(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    pts.push([Math.round(cx + r * Math.cos(angle)), Math.round(cy + r * Math.sin(angle))]);
  }
  return pts;
}

const hexCenters = [
  [600, 180], [480, 180], [720, 180],
  [540, 180 + HEX_H * 0.5], [660, 180 + HEX_H * 0.5],
];
for (const [cx, cy] of hexCenters) {
  const verts = hexVertices(cx, cy, HEX_R);
  for (let i = 0; i < 6; i++) {
    const [x0, y0] = verts[i], [x1, y1] = verts[(i + 1) % 6];
    drawLine(x0, y0, x1, y1, 6, 40, 50); // very dark cyan
  }
}

// ── 3. Center circle rings ──────────────────────────────────────────────
// Outer ring: 60px radius, cyan
for (let r = 58; r <= 62; r++) drawCircle(600, 210, r, 6, 182, 212);
// Inner ring: 40px radius, faint
for (let r = 38; r <= 40; r++) drawCircle(600, 210, r, 6, 100, 120);

// ── 4. Accent lines (grid symmetry) ────────────────────────────────────
// Horizontal center accent
for (let x = 480; x < 720; x++) setPixel(x, 260, 6, 182, 212);
// Separator below headline area
for (let x = 500; x < 700; x++) setPixel(x, 310, 6, 182, 212);

// ── 5. Bottom cyan accent bar (10px) ─────────────────────────────────
for (let y = H - 10; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const t = x / W;
    const r = Math.round(6 + t * (14 - 6));
    const g = Math.round(182 + t * (165 - 182));
    const b = Math.round(212 + t * (233 - 212));
    setPixel(x, y, r, g, b);
  }
}

// ── 6. Left accent stripe ─────────────────────────────────────────────
for (let y = 0; y < H - 10; y++) {
  const alpha = y < 100 ? y / 100 : y > H - 110 ? (H - 10 - y) / 100 : 1;
  const brightness = Math.round(20 * alpha);
  for (let x = 0; x < 4; x++) {
    setPixel(x, y, 6, 182 * brightness / 20, Math.round(212 * alpha));
  }
}

// ── Build PNG ─────────────────────────────────────────────────────────
const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const IHDR_DATA = Buffer.concat([
  u32(W), u32(H),
  Buffer.from([8, 2, 0, 0, 0]), // 8-bit, RGB, deflate, adaptive, no interlace
]);
const compressed = deflateSync(raw, { level: 9 });

const png = Buffer.concat([
  PNG_SIG,
  pngChunk("IHDR", IHDR_DATA),
  pngChunk("IDAT", compressed),
  pngChunk("IEND", Buffer.alloc(0)),
]);

const outPath = join(__dirname, "..", "public", "og-image.png");
writeFileSync(outPath, png);
console.log(`✓ Generated public/og-image.png (${png.length.toLocaleString()} bytes)`);
