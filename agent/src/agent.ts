import { Agent } from "agents";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { buildTools, Env } from "./tools";

type AgentState = {
  cycleCount: number;
  lastCycleTs: number;
  lastCycleResult: string;
  activePlayers: number;
  currentFeatureId: number | null;
  status: "idle" | "working" | "error";
};

const SYSTEM_PROMPT = `You are MerkabaGameAgent — an autonomous AI game developer working on cosmos-infinite,
a WebGL/A-Frame multiplayer space combat game built in a ~57,000-line monolith (cosmos-infinite.html)
served by a Node.js WebSocket server (server.js).

## Your role
You ship real, working code improvements to the game. Every cycle:
1. Pick the highest-priority pending feature from the knowledge base
2. Search/read the relevant section of the game code
3. Understand the existing patterns (Three.js, A-Frame, WebSocket protocol)
4. Write a precise, minimal code change (old_string → new_string)
5. Commit it to the agent branch and create/update a PR

## Game architecture facts you must remember
- The game file is: public/cosmos-infinite.html (~57,000 lines)
- All dogfight logic is in a Presence IIFE starting ~line 55000
- WebSocket protocol: server.js at /ws/presence — messages: pos, fire, hit, kill, welcome, beacon
- Ghost ships use Three.js Groups added to a-entity object3D, NOT a-frame primitives
- All materials: MeshBasicMaterial with AdditiveBlending + depthWrite:false (additive glow)
- Fighter avatar function: _makeFighterAvatar(color) ~line 55052
- Ghost map: _ghostMap[id] = {el, group, label, health, score, kills, pos, targetPos, quat, targetQuat}
- Interp loop at ~line 55133 runs at 60fps, animates _nacelles, _portLight, _stbdLight, _shield, _corona
- Fire listener at ~line 55630: 400ms cooldown, hit detection (dist < 8 AU), sends WS packets
- HUD: _updateFighterHUD() renders #dfs-hud with HP bar + K/D/Pts
- Scoreboard: _updateScoreboard() with live top-5 + ALL-TIME from server
- Persistent scores: server writes data/dogfight-scores.json on each kill

## Code style rules
- Var declarations (not let/const) inside function bodies — existing code uses var throughout
- No comments on obvious code — only comment non-obvious invariants
- MeshBasicMaterial + AdditiveBlending for all new geometry (maintains additive glow aesthetic)
- Always use depthWrite:false on new materials
- Keep changes minimal — surgical patches, not rewrites
- Test mentally: does the old_string appear exactly once in the file? Make it unique enough.

## Tool usage
- Use search_game_code FIRST to find exact current code before editing
- Use fetch_game_code to read surrounding context (100-200 lines)
- Use fetch_url for Three.js/A-Frame docs if you need geometry API details
- Use store_research to save useful findings for future cycles
- Always use commit_improvement as the FINAL action after verifying old_string matches

## What NOT to do
- Never rewrite large sections — one focused improvement per cycle
- Never change the D8/D26/D48 lattice lock points (R8=24, R26=40, R48=60 AU)
- Never modify the galaxy anchor formula or universe scale
- Never break the WebSocket packet protocol (pos, fire, hit, kill, welcome types)
`;

export class MerkabaGameAgent extends Agent<Env, AgentState> {
  initialState: AgentState = {
    cycleCount: 0,
    lastCycleTs: 0,
    lastCycleResult: "Agent initializing",
    activePlayers: 0,
    currentFeatureId: null,
    status: "idle",
  };

  async onStart() {
    await this._initDB();
    // Dev cycle every 6 hours
    await this.schedule("0 */6 * * *", "devCycle");
    // Telemetry snapshot every 30 minutes
    await this.scheduleEvery(1800, "recordTelemetry");
    this.setState({ ...this.state, lastCycleResult: "Agent started and scheduled" });
  }

  /* ── Scheduled: main development cycle ───────────────────────────────── */

  async devCycle() {
    const start = Date.now();
    this.setState({ ...this.state, status: "working" });

    try {
      const anthropic = createAnthropic({ apiKey: this.env.ANTHROPIC_API_KEY });
      const tools = buildTools(this.env);

      const { text, toolResults } = await generateText({
        model: anthropic("claude-opus-4-7-20251101"),
        system: SYSTEM_PROMPT,
        prompt: `Start a new development cycle.

Current agent stats: cycle #${this.state.cycleCount + 1}, active players recently: ${this.state.activePlayers}

Step 1: Query the knowledge base for the top 3 pending features sorted by priority.
Step 2: Pick the #1 priority feature.
Step 3: Claim it (mark in_progress).
Step 4: Search the game code for the relevant existing code.
Step 5: Implement the improvement with commit_improvement.
Step 6: If you need to research a technique first, use fetch_url and store_research before implementing.

Be decisive. One complete improvement per cycle. Surgical code change only.`,
        tools,
        maxSteps: 12,
      });

      const duration = Date.now() - start;
      const result = text || toolResults?.map((r) => JSON.stringify(r.result)).join("; ") || "Cycle complete";

      await this.env.DB.prepare(
        "INSERT INTO agent_log (cycle_ts, action, result, duration_ms) VALUES (?,?,?,?)"
      ).bind(start, "devCycle", result.slice(0, 2000), duration).run();

      this.setState({
        ...this.state,
        cycleCount: this.state.cycleCount + 1,
        lastCycleTs: start,
        lastCycleResult: result.slice(0, 500),
        currentFeatureId: null,
        status: "idle",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.setState({ ...this.state, status: "error", lastCycleResult: `Error: ${msg}` });
      await this.env.DB.prepare(
        "INSERT INTO agent_log (cycle_ts, action, result) VALUES (?,?,?)"
      ).bind(Date.now(), "devCycle_error", msg.slice(0, 2000)).run();
    }
  }

  /* ── Scheduled: record live game telemetry ──────────────────────────── */

  async recordTelemetry() {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${this.env.GITHUB_OWNER}/${this.env.GITHUB_REPO}/main/data/dogfight-scores.json`);
      if (!res.ok) return;
      const scores = await res.json() as Record<string, { kills: number; score: number }>;
      const topPilots = Object.entries(scores)
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, 5)
        .map(([name, s]) => ({ name, kills: s.kills, score: s.score }));

      await this.env.DB.prepare(
        "INSERT INTO telemetry (session_ts, player_count, top_pilots) VALUES (?,?,?)"
      ).bind(Date.now(), topPilots.length, JSON.stringify(topPilots)).run();

      this.setState({ ...this.state, activePlayers: topPilots.length });
    } catch (_) {
      // Telemetry is best-effort — scores file may not exist yet
    }
  }

  /* ── HTTP: trigger a dev cycle on-demand ─────────────────────────────── */

  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/trigger" && request.method === "POST") {
      this.schedule(5, "devCycle"); // fire in 5 seconds
      return json({ queued: true, message: "Dev cycle queued, fires in ~5s" });
    }

    if (url.pathname === "/research" && request.method === "POST") {
      const { topic, query } = await request.json() as { topic: string; query: string };
      await this._runResearch(topic, query);
      return json({ ok: true, topic });
    }

    if (url.pathname === "/status") {
      const recent = await this.env.DB.prepare(
        "SELECT action, result, duration_ms, logged_at FROM agent_log ORDER BY logged_at DESC LIMIT 5"
      ).all();
      const features = await this.env.DB.prepare(
        "SELECT COUNT(*) as c, status FROM features GROUP BY status"
      ).all();
      return json({
        state: this.state,
        recent_log: recent.results,
        feature_counts: features.results,
      });
    }

    if (url.pathname === "/knowledge") {
      const features = await this.env.DB.prepare(
        "SELECT * FROM features ORDER BY status ASC, priority ASC LIMIT 20"
      ).all();
      const research = await this.env.DB.prepare(
        "SELECT topic, findings, created_at FROM research ORDER BY created_at DESC LIMIT 10"
      ).all();
      return json({ features: features.results, research: research.results });
    }

    if (url.pathname === "/backlog" && request.method === "POST") {
      const item = await request.json() as Record<string, unknown>;
      await this.env.DB.prepare(
        "INSERT INTO features (title, description, phase, area, priority) VALUES (?,?,?,?,?)"
      ).bind(item.title, item.description, item.phase ?? 4, item.area ?? "gameplay", item.priority ?? 5).run();
      return json({ added: true });
    }

    return json({ agent: "MerkabaGameAgent", version: "1.0", status: this.state.status }, 200);
  }

  /* ── On-demand research sub-agent ───────────────────────────────────── */

  private async _runResearch(topic: string, query: string) {
    const anthropic = createAnthropic({ apiKey: this.env.ANTHROPIC_API_KEY });
    const tools = buildTools(this.env);

    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      system: `You are a research agent for the MerkabaGameAgent. Research the given topic and store your findings.
Use fetch_url to look up documentation pages, then store_research to save findings.
Be concise and technical — focus on code patterns and API details relevant to Three.js / A-Frame game development.`,
      prompt: `Research topic: ${topic}\nQuery: ${query}`,
      tools: { fetch_url: tools.fetch_url, store_research: tools.store_research },
      maxSteps: 5,
    });

    return text;
  }

  /* ── DB initialization ───────────────────────────────────────────────── */

  private async _initDB() {
    // Ensure tables exist (D1 bindings handle actual schema — this is a safety no-op)
    try {
      await this.env.DB.prepare("SELECT 1 FROM features LIMIT 1").run();
    } catch {
      // Tables don't exist yet — user must run: wrangler d1 execute merkaba-knowledge --file=schema.sql
    }
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
