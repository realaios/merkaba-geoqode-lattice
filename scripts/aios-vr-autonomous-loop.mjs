/**
 * aios-vr-autonomous-loop.mjs
 * @alignment 8->26->48:480
 *
 * Autonomous VR asset pipeline orchestrator.
 * Runs on a configurable interval and executes:
 *
 *   1. AIOSAssetMinerAgent.run()    -- mine Sketchfab/PolyHaven/PolyPizza/NASA
 *   2. aios-vr-scene-generator.mjs  -- generate A-Frame scene HTML + taxonomy entries
 *   3. aios-mal-injector.mjs        -- inject glTF assets into MAL props-warehouse
 *   4. git add . && git commit -m "..." && git push  -- Railway auto-deploys
 *
 * Usage:
 *   node scripts/aios-vr-autonomous-loop.mjs           # one-shot run
 *   node scripts/aios-vr-autonomous-loop.mjs --loop    # loop every CYCLE_HOURS
 *   node scripts/aios-vr-autonomous-loop.mjs --dry-run # no git, no file writes
 *
 * Env vars:
 *   CYCLE_HOURS          default: 12
 *   SKETCHFAB_API_KEY    required for Sketchfab mining
 *   NASA_API_KEY         optional (DEMO_KEY works for dev)
 */

import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const CYCLE_HOURS = parseFloat(process.env.CYCLE_HOURS || "12");
const CYCLE_MS = CYCLE_HOURS * 60 * 60 * 1000;
const IS_LOOP = process.argv.includes("--loop");
const DRY_RUN = process.argv.includes("--dry-run");

// GeoQode coordinate (NARRATIVE @ 963 Hz — orchestration + continuity)
const GEO_COORDINATE = {
  architectureSignature: "8,26,48:480",
  semanticType: "NARRATIVE",
  frequency: 963,
  latticeNode: 12,
  harmonicNode: 120,
  phiCoefficient: 1.618,
  coherence: 0.97,
  domain: "systems-design",
  source: "aios-vr-autonomous-loop",
};

const STATUS_FILE = path.join(ROOT, "data", "vr-loop-status.json");

function log(...args) {
  const ts = new Date().toISOString();
  console.log(`[VRLoop ${ts}]`, ...args);
}

function readStatus() {
  if (!fs.existsSync(STATUS_FILE)) return { cycles: 0, lastRun: null };
  try {
    return JSON.parse(fs.readFileSync(STATUS_FILE, "utf8"));
  } catch (_) {
    return { cycles: 0, lastRun: null };
  }
}

function writeStatus(status) {
  if (DRY_RUN) return;
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2), "utf8");
}

// ── Run a script as a child process, streaming logs ─────────────────────────
async function runScript(scriptPath, extraArgs = []) {
  const args = [scriptPath, ...extraArgs];
  if (DRY_RUN) args.push("--dry-run");
  log(`Running: node ${args.join(" ")}`);

  return new Promise((resolve, reject) => {
    const child = require("child_process").spawn(
      process.execPath,
      args,
      { cwd: ROOT, env: process.env, stdio: "inherit" },
    );
    child.on("close", (code) => {
      if (code === 0) resolve({ success: true });
      else reject(new Error(`Script exited with code ${code}: ${scriptPath}`));
    });
  });
}

// ── Run inline import of AIOSAssetMinerAgent ─────────────────────────────────
async function runMiner() {
  log("Step 1/4: Mining assets (NASA, Sketchfab, PolyHaven, Poly Pizza)...");
  const { AIOSAssetMinerAgent } = await import(
    "../geo/intelligence/AIOSAssetMinerAgent.js"
  );
  const agent = new AIOSAssetMinerAgent({
    nasaApiKey: process.env.NASA_API_KEY || "DEMO_KEY",
    sketchfabApiKey: process.env.SKETCHFAB_API_KEY || null,
    verbose: true,
  });
  const result = await agent.run();
  log("Mining result:", result);
  return result;
}

// ── Run VR scene generator ───────────────────────────────────────────────────
async function runSceneGenerator() {
  log("Step 2/4: Generating VR scene HTML + taxonomy entries...");
  const { default: main } = await import("./aios-vr-scene-generator.mjs").catch(
    () => ({ default: null }),
  );
  if (main) return main();
  // Fallback: run as child process
  const scriptPath = path.join(__dirname, "aios-vr-scene-generator.mjs");
  return new Promise((resolve, reject) => {
    const { spawn } = require("child_process");
    const args = [scriptPath];
    if (DRY_RUN) args.push("--dry-run");
    const child = spawn(process.execPath, args, {
      cwd: ROOT, env: process.env, stdio: "inherit",
    });
    child.on("close", (code) =>
      code === 0 ? resolve({ success: true }) : reject(new Error(`SceneGen exit ${code}`)),
    );
  });
}

// ── Run MAL injector ─────────────────────────────────────────────────────────
async function runMALInjector() {
  log("Step 3/4: Injecting assets into MAL props-warehouse...");
  const scriptPath = path.join(__dirname, "aios-mal-injector.mjs");
  const args = [scriptPath];
  if (DRY_RUN) args.push("--dry-run");
  return new Promise((resolve, reject) => {
    const { spawn } = await import("child_process").then((m) => m);
    const child = spawn(process.execPath, args, {
      cwd: ROOT, env: process.env, stdio: "inherit",
    });
    child.on("close", (code) =>
      code === 0 ? resolve({ success: true }) : reject(new Error(`MALInjector exit ${code}`)),
    );
  });
}

// ── Git commit + push ────────────────────────────────────────────────────────
async function gitCommitAndPush(cycleNum, assetsAdded = 0) {
  if (DRY_RUN) {
    log("DRY-RUN: skipping git commit");
    return;
  }
  log("Step 4/4: Committing and pushing to trigger Railway deploy...");
  const msg = `feat(vr): autonomous mining cycle ${cycleNum} — ${assetsAdded} assets added`;
  try {
    await execFileAsync("git", ["add", "."], { cwd: ROOT });
    const statusResult = await execFileAsync("git", ["status", "--porcelain"], { cwd: ROOT });
    if (!statusResult.stdout.trim()) {
      log("No changes to commit — no new assets mined this cycle.");
      return;
    }
    await execFileAsync("git", ["commit", "-m", msg], { cwd: ROOT });
    await execFileAsync("git", ["push"], { cwd: ROOT });
    log("Pushed! Railway will auto-deploy (watchPatterns may SKIP if only data changed).");
  } catch (err) {
    log("Git error (non-fatal):", err.message);
  }
}

// ── One pipeline cycle ───────────────────────────────────────────────────────
async function runCycle(cycleNum) {
  log(`=== VR Autonomous Loop — Cycle ${cycleNum} ===`);
  log(`GeoQode NARRATIVE@963Hz latticeNode ${GEO_COORDINATE.latticeNode}`);

  const status = readStatus();
  let assetsAdded = 0;

  try {
    // Step 1: Mine
    const minerResult = await runMiner();
    assetsAdded = minerResult.assetsAdded || 0;
  } catch (err) {
    log("Mining error (continuing):", err.message);
  }

  try {
    // Step 2: Generate VR scenes
    const childProcess = await import("child_process");
    const sceneGenPath = path.join(__dirname, "aios-vr-scene-generator.mjs");
    const args = DRY_RUN ? [sceneGenPath, "--dry-run"] : [sceneGenPath];
    await new Promise((resolve, reject) => {
      const child = childProcess.spawn(process.execPath, args, {
        cwd: ROOT, env: process.env, stdio: "inherit",
      });
      child.on("close", (code) =>
        code === 0 ? resolve() : reject(new Error(`SceneGen exit ${code}`)),
      );
    });
  } catch (err) {
    log("Scene generator error (continuing):", err.message);
  }

  try {
    // Step 3: MAL inject
    const childProcess = await import("child_process");
    const malPath = path.join(__dirname, "aios-mal-injector.mjs");
    const args = DRY_RUN ? [malPath, "--dry-run"] : [malPath];
    await new Promise((resolve, reject) => {
      const child = childProcess.spawn(process.execPath, args, {
        cwd: ROOT, env: process.env, stdio: "inherit",
      });
      child.on("close", (code) =>
        code === 0 ? resolve() : reject(new Error(`MALInjector exit ${code}`)),
      );
    });
  } catch (err) {
    log("MAL injector error (continuing):", err.message);
  }

  // Step 4: Git commit + push
  await gitCommitAndPush(cycleNum, assetsAdded);

  // Write status
  const newStatus = {
    cycles: (status.cycles || 0) + 1,
    lastRun: new Date().toISOString(),
    lastAssetsAdded: assetsAdded,
    nextRunAt: new Date(Date.now() + CYCLE_MS).toISOString(),
    cycleHours: CYCLE_HOURS,
    geoCoordinate: GEO_COORDINATE,
  };
  writeStatus(newStatus);

  log(`Cycle ${cycleNum} complete. Next run at: ${newStatus.nextRunAt}`);
  return newStatus;
}

// ── Entry point ──────────────────────────────────────────────────────────────
async function main() {
  log("AIOS VR Autonomous Loop starting");
  log(`Mode: ${IS_LOOP ? `loop every ${CYCLE_HOURS}h` : "one-shot"}${DRY_RUN ? " [DRY-RUN]" : ""}`);

  const status = readStatus();
  let cycleNum = (status.cycles || 0) + 1;

  await runCycle(cycleNum);

  if (IS_LOOP) {
    log(`Scheduling next cycle in ${CYCLE_HOURS} hours...`);
    setInterval(async () => {
      cycleNum++;
      try {
        await runCycle(cycleNum);
      } catch (err) {
        log("Cycle error:", err.message);
      }
    }, CYCLE_MS);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  log("Fatal:", err);
  process.exit(1);
});
