import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const file = join(__dir, "../public/game-lattice-builder.html");
let c = readFileSync(file, "utf8");

if (c.includes("lobby-lb-rows")) {
  console.log("ℹ️  lobby panel already present");
  process.exit(0);
}

// Find the LAUNCH GAME button - it has a ? (replacement char) before it
const marker = `<button class="btn-play" onclick="startGame()">`;
const idx = c.indexOf(marker);
if (idx === -1) { console.log("❌ button not found"); process.exit(1); }

const panel = `<div id="lobby-leaderboard" style="margin:1rem 0;width:100%;max-width:320px;background:rgba(0,0,0,0.35);border:1px solid rgba(0,245,212,0.2);border-radius:10px;padding:0.75rem 1rem;font-size:0.8rem;">
        <div style="color:#00f5d4;font-weight:700;margin-bottom:0.4rem;letter-spacing:0.05em;">\uD83C\uDFC6 TOP SCORES</div>
        <div id="lobby-lb-rows" style="line-height:1.7;color:rgba(255,255,255,0.65);">Loading...</div>
      </div>
      `;

c = c.slice(0, idx) + panel + c.slice(idx);
writeFileSync(file, c, "utf8");
console.log("✅ lobby panel inserted");
