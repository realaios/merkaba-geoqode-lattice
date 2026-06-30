#!/usr/bin/env node
// pixel-relay.js — bridges pixel-agents local WS → /ws/pixel on cosmos server
// Usage: node scripts/pixel-relay.js
// Requires: ~/.pixel-agents/server.json  { "port": 3100, "token": "..." }
//           COSMOS_HOST env (default: aios-mesh.realaios.com)

import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { WebSocket } from "ws";

const COSMOS_HOST = process.env.COSMOS_HOST || "aios-mesh.realaios.com";
const COSMOS_URL = `wss://${COSMOS_HOST}/ws/pixel`;

// ── Read pixel-agents config ───────────────────────────────────────────────
let pixelCfg = { port: 3100, token: "" };
try {
  pixelCfg = JSON.parse(
    readFileSync(join(homedir(), ".pixel-agents", "server.json"), "utf8"),
  );
} catch (_) {
  console.warn(
    "[pixel-relay] ~/.pixel-agents/server.json not found — using defaults",
  );
}

const PIXEL_URL = `ws://127.0.0.1:${pixelCfg.port}/ws`;

// ── Upstream: cosmos /ws/pixel ─────────────────────────────────────────────
let cosmosWs = null;
let cosmosReady = false;
const cosmosQueue = [];

function connectCosmos() {
  console.log(`[pixel-relay] Connecting to cosmos: ${COSMOS_URL}`);
  cosmosWs = new WebSocket(COSMOS_URL);

  cosmosWs.on("open", () => {
    cosmosReady = true;
    console.log("[pixel-relay] Cosmos connected");
    cosmosQueue.splice(0).forEach((m) => cosmosWs.send(m));
  });

  cosmosWs.on("close", () => {
    cosmosReady = false;
    console.warn("[pixel-relay] Cosmos disconnected — reconnecting in 5s");
    setTimeout(connectCosmos, 5000);
  });

  cosmosWs.on("error", (err) =>
    console.error("[pixel-relay] cosmos error:", err.message),
  );
}

function sendToCosmos(event) {
  const data = JSON.stringify({ type: "pixel-relay", event });
  if (cosmosReady) cosmosWs.send(data);
  else cosmosQueue.push(data);
}

// ── Downstream: pixel-agents local WS ─────────────────────────────────────
function connectPixelAgents() {
  const headers = pixelCfg.token
    ? { Authorization: `Bearer ${pixelCfg.token}` }
    : {};
  console.log(`[pixel-relay] Connecting to pixel-agents: ${PIXEL_URL}`);

  let pxWs;
  try {
    pxWs = new WebSocket(PIXEL_URL, { headers });
  } catch (e) {
    console.error("[pixel-relay] Cannot connect to pixel-agents:", e.message);
    setTimeout(connectPixelAgents, 8000);
    return;
  }

  pxWs.on("open", () => {
    console.log("[pixel-relay] pixel-agents connected");
    pxWs.send(JSON.stringify({ type: "webviewReady" }));
  });

  pxWs.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (_) {
      return;
    }
    sendToCosmos(msg);
    console.log(
      "[pixel-relay] →",
      msg.type || msg.eventType || "event",
      msg.agentId || "",
    );
  });

  pxWs.on("close", () => {
    console.warn(
      "[pixel-relay] pixel-agents disconnected — reconnecting in 8s",
    );
    setTimeout(connectPixelAgents, 8000);
  });

  pxWs.on("error", (err) => {
    console.warn(
      "[pixel-relay] pixel-agents error:",
      err.message,
      "— retry in 8s",
    );
    setTimeout(connectPixelAgents, 8000);
  });
}

// ── Start ──────────────────────────────────────────────────────────────────
connectCosmos();
connectPixelAgents();
console.log("[pixel-relay] Bridge running. Ctrl+C to stop.");
