import { Agent } from "agents";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { buildTools, Env } from "./tools";

type AgentState = {
  cycleCount: number;
  lastCycleTs: number;
  lastCycleResult: string;
  currentFeatureId: number | null;
  lastModule: string;
  status: "idle" | "working" | "error";
};

const SYSTEM_PROMPT = `You are MerkabaLabAgent — an autonomous AI science educator and developer working on cosmos-lab.html,
an interactive WebGL science application with four lab modules: Physics, Chemistry, Biology, and Engineering.

The app is a single HTML file (~900 lines) served from public/cosmos-lab.html in the merkaba-geoqode-lattice repo.
It uses A-Frame 1.4 + Three.js r128, rendered in Cloudflare/Node.js with WebSocket multi-user presence at /ws/lab.

## Architecture summary
- All JS is inside a single <script> tag, vanilla ES5-style (var declarations, no modules)
- THREE is accessed as AFRAME.THREE — no separate import
- Modules: _buildHubModule() | _buildPhysicsModule() | _buildChemistryModule() | _buildBiologyModule() | _buildEngineeringModule()
- Each module returns: { root: THREE.Group, start(), stop(), update(dt,ts), controls()→html, dataInit() }
- All geometry uses: MeshBasicMaterial + transparent:true + depthWrite:false + blending:THREE.AdditiveBlending
- Data panel: document.getElementById('data-rows').innerHTML + document.getElementById('equation-box').textContent
- Controls: innerHTML string of .ctrl-group/.ctrl-btn/.ctrl-slider/.ctrl-value elements
- window._physSetExp / window._chemSetMol / window._bioSetExp / window._engSetExp — experiment switchers

## Physics module internals
- pendulum: pendState {theta, omega, L, g}, Euler θ''=-(g/L)sinθ, trail LineSegments
- wave: waveGeo PlaneGeometry(30,30,64,64), per-vertex z update, sources at x=±8
- orbital: planets[] with RK4, planetMeshes[], trail buffers
- projectile: projState {x,y,vx,vy,active}, rod + bob + trail

## Chemistry module internals
- MOLECULES dict: {atoms:[['el',x,y,z],...], bonds:[[i,j],...]}
- _buildMolecule(name): CPK spheres + bond cylinders, quat.setFromUnitVectors(Y, bondDir)
- _buildElectronOrbital(type): THREE.Points cloud, '1s'|'2p'|'3d'

## Biology module internals
- DNA: TubeGeometry from CatmullRomCurve3, two strands with offset π, LineSegments rungs for base pairs
- Cell: nested spheres for organelles (nucleus, mitochondria, chloroplast, vacuole)
- Ecosystem: node graph (ecoNodes/ecoEdges), force-directed SpringLayout not yet implemented

## Engineering module internals
- Gears: gearDefs[{teeth,r,x,y,color}], ω₂/ω₁ = N₁/N₂, CylinderGeometry + TorusGeometry teeth ring
- Rocket: rocketState {y,vy,fuel,thrust}, Tsiolkovsky Δv = Isp·g₀·ln(m₀/mf)
- Circuit: rectangular path, animated current particles, _circuitPos(t) returns {x,y}

## Code style rules
- var declarations (not let/const) in function bodies — the existing code uses var throughout
- No comments on obvious code — only comment non-obvious invariants
- Keep old_string unique enough for exact match (include 2+ lines of context)
- MeshBasicMaterial + AdditiveBlending for ALL new geometry
- Inject new experiments/features by extending existing _build* functions or adding new ones
- Never remove existing experiments — always additive

## Tool usage order
1. search_lab_code to find the exact insertion point
2. fetch_lab_code to read 50-100 lines of context
3. commit_improvement with a surgical old_string → new_string patch
`;

export class MerkabaLabAgent extends Agent<Env, AgentState> {
  initialState: AgentState = {
    cycleCount: 0,
    lastCycleTs: 0,
    lastCycleResult: "Agent initializing",
    currentFeatureId: null,
    lastModule: "all",
    status: "idle",
  };

  async onStart() {
    await this._initDB();
    await this.schedule("0 */4 * * *", "devCycle");
    await this.scheduleEvery(3600, "researchCycle");
    this.setState({ ...this.state, lastCycleResult: "Lab agent started" });
  }

  /* ── Main dev cycle: pick top feature, implement it ──────────────────── */

  async devCycle() {
    const start = Date.now();
    this.setState({ ...this.state, status: "working" });

    try {
      const anthropic = createAnthropic({ apiKey: this.env.ANTHROPIC_API_KEY });
      const tools = buildTools(this.env);

      const { text, toolResults } = await generateText({
        model: anthropic("claude-opus-4-7-20251101"),
        system: SYSTEM_PROMPT,
        prompt: `Start development cycle #${this.state.cycleCount + 1}.

Step 1: Query the knowledge base for the top 3 pending features (all modules, sorted by priority).
Step 2: Pick the #1 priority feature.
Step 3: Claim it (mark in_progress).
Step 4: Search cosmos-lab.html for the relevant section of existing code.
Step 5: Fetch 80-150 lines of context around the match.
Step 6: Implement the improvement with a precise old_string → new_string patch.
Step 7: Commit it.

Be surgical. One focused improvement per cycle. Prefer additive changes (new experiment options, new data rows, new controls) over rewrites.
If the feature requires a completely new experiment, add it as a new case in the relevant _build* function alongside existing experiments.`,
        tools,
        maxSteps: 14,
      });

      const duration = Date.now() - start;
      const result = text || toolResults?.map((r) => JSON.stringify(r.result)).join("; ") || "Cycle complete";

      await this.env.DB.prepare(
        "INSERT INTO agent_log (cycle_ts, action, result, duration_ms) VALUES (?,?,?,?)",
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
        "INSERT INTO agent_log (cycle_ts, action, result) VALUES (?,?,?)",
      ).bind(Date.now(), "devCycle_error", msg.slice(0, 2000)).run();
    }
  }

  /* ── Hourly research cycle: scan backlog, pre-research upcoming features ─ */

  async researchCycle() {
    try {
      const anthropic = createAnthropic({ apiKey: this.env.ANTHROPIC_API_KEY });
      const tools = buildTools(this.env);

      const rows = await this.env.DB.prepare(
        "SELECT id, title, description, module, area FROM features WHERE status='pending' ORDER BY priority ASC LIMIT 3",
      ).all();

      if (!rows.results.length) return;

      await generateText({
        model: anthropic("claude-haiku-4-5-20251001"),
        system: `You are a science research agent for MerkabaLabAgent.
Research upcoming lab features and store findings that will help implement them.
Focus on: Three.js geometry APIs, physics/chemistry/biology simulation algorithms, A-Frame patterns.
Use fetch_url to look up docs, then store_research to save findings.`,
        prompt: `Research these upcoming features and store useful technical findings for each:\n${JSON.stringify(rows.results, null, 2)}\n\nFor each feature, search for the relevant Three.js geometry, physics formula, or algorithm needed.`,
        tools: { fetch_url: tools.fetch_url, store_research: tools.store_research },
        maxSteps: 8,
      });

      await this.env.DB.prepare(
        "INSERT INTO agent_log (cycle_ts, action, result) VALUES (?,?,?)",
      ).bind(Date.now(), "researchCycle", `Researched ${rows.results.length} upcoming features`).run();
    } catch (_) {}
  }

  /* ── HTTP API ─────────────────────────────────────────────────────────── */

  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/trigger" && request.method === "POST") {
      this.schedule(5, "devCycle");
      return json({ queued: true, message: "Dev cycle queued (~5s)" });
    }

    if (url.pathname === "/research" && request.method === "POST") {
      const { topic, query } = (await request.json()) as { topic: string; query: string };
      await this._runResearch(topic, query);
      return json({ ok: true, topic });
    }

    if (url.pathname === "/status") {
      const recent = await this.env.DB.prepare(
        "SELECT action, result, duration_ms, logged_at FROM agent_log ORDER BY logged_at DESC LIMIT 5",
      ).all();
      const features = await this.env.DB.prepare(
        "SELECT COUNT(*) as c, status FROM features GROUP BY status",
      ).all();
      return json({ state: this.state, recent_log: recent.results, feature_counts: features.results });
    }

    if (url.pathname === "/knowledge") {
      const features = await this.env.DB.prepare(
        "SELECT * FROM features ORDER BY status ASC, priority ASC LIMIT 30",
      ).all();
      const research = await this.env.DB.prepare(
        "SELECT topic, findings, created_at FROM research ORDER BY created_at DESC LIMIT 10",
      ).all();
      return json({ features: features.results, research: research.results });
    }

    if (url.pathname === "/backlog" && request.method === "POST") {
      const item = (await request.json()) as Record<string, unknown>;
      await this.env.DB.prepare(
        "INSERT INTO features (title, description, module, area, phase, priority) VALUES (?,?,?,?,?,?)",
      ).bind(item.title, item.description, item.module ?? "all", item.area ?? "experiment", item.phase ?? 1, item.priority ?? 5).run();
      return json({ added: true });
    }

    return json({
      agent: "MerkabaLabAgent",
      version: "1.0",
      status: this.state.status,
      endpoints: {
        "GET /status": "Agent status + log",
        "GET /knowledge": "Feature backlog + research",
        "POST /trigger": "Fire dev cycle",
        "POST /research": "Spawn research {topic, query}",
        "POST /backlog": "Add feature {title, description, module, area, phase, priority}",
      },
    });
  }

  private async _runResearch(topic: string, query: string) {
    const anthropic = createAnthropic({ apiKey: this.env.ANTHROPIC_API_KEY });
    const tools = buildTools(this.env);
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      system: `Research agent for MerkabaLabAgent. Look up documentation and store technical findings for cosmos-lab.html development.`,
      prompt: `Research topic: ${topic}\nQuery: ${query}`,
      tools: { fetch_url: tools.fetch_url, store_research: tools.store_research },
      maxSteps: 5,
    });
    return text;
  }

  private async _initDB() {
    try {
      await this.env.DB.prepare("SELECT 1 FROM features LIMIT 1").run();
    } catch {
      // Schema not yet migrated — run: wrangler d1 execute merkaba-lab-knowledge --remote --file=schema.sql
    }
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
