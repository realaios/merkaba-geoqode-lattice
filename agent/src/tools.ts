import { tool } from "ai";
import { z } from "zod";

export interface Env {
  MERKABA_AGENT: DurableObjectNamespace;
  DB: D1Database;
  ANTHROPIC_API_KEY: string;
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GAME_FILE_PATH: string;
  AGENT_BRANCH: string;
  LOG_LEVEL: string;
}

/* ── GitHub API helpers ─────────────────────────────────────────────────── */

async function ghRequest(
  env: Env,
  path: string,
  method = "GET",
  body?: unknown,
) {
  const res = await fetch(
    `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/${path}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "MerkabaGameAgent/1.0",
      },
      body: body ? JSON.stringify(body) : undefined,
    },
  );
  if (!res.ok)
    throw new Error(
      `GitHub ${method} ${path} → ${res.status}: ${await res.text()}`,
    );
  return res.json() as Promise<Record<string, unknown>>;
}

async function ensureBranch(env: Env) {
  try {
    await ghRequest(env, `git/ref/heads/${env.AGENT_BRANCH}`);
    return; // branch exists
  } catch {
    const main = (await ghRequest(env, "git/ref/heads/main")) as {
      object: { sha: string };
    };
    await ghRequest(env, "git/refs", "POST", {
      ref: `refs/heads/${env.AGENT_BRANCH}`,
      sha: main.object.sha,
    });
  }
}

/* ── Tool factory — all tools receive env via closure ────────────────────── */

export function buildTools(env: Env) {
  return {
    /** Fetch specific line range from cosmos-infinite.html via GitHub raw */
    fetch_game_code: tool({
      description:
        "Fetch a range of lines from cosmos-infinite.html. Use to inspect existing code before editing.",
      inputSchema: z.object({
        start_line: z.number().describe("1-based start line"),
        end_line: z.number().describe("1-based end line (max span: 400 lines)"),
      }),
      execute: async ({ start_line, end_line }) => {
        const span = Math.min(end_line - start_line, 399);
        const url = `https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/main/${env.GAME_FILE_PATH}`;
        const raw = await fetch(url).then((r) => r.text());
        const lines = raw.split("\n").slice(start_line - 1, start_line + span);
        return {
          lines: lines.join("\n"),
          start_line,
          total_fetched: lines.length,
        };
      },
    }),

    /** Search cosmos-infinite.html for a pattern, returns matching lines */
    search_game_code: tool({
      description:
        "Search cosmos-infinite.html for a regex pattern. Returns matching line numbers and content.",
      inputSchema: z.object({
        pattern: z.string().describe("Regex pattern to search for"),
        max_results: z.number().default(20),
      }),
      execute: async ({ pattern, max_results }) => {
        let rx: RegExp;
        try { rx = new RegExp(pattern, "i"); } catch (_) { return { error: "Invalid regex pattern", matches: [], total_matches: 0 }; }
        const url = `https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/main/${env.GAME_FILE_PATH}`;
        const raw = await fetch(url).then((r) => r.text());
        const lines = raw.split("\n");
        const matches: Array<{ line: number; text: string }> = [];
        for (let i = 0; i < lines.length && matches.length < max_results; i++) {
          if (rx.test(lines[i]))
            matches.push({ line: i + 1, text: lines[i].trim() });
        }
        return { matches, total_matches: matches.length };
      },
    }),

    /** Commit a targeted patch to the agent branch then open a PR */
    commit_improvement: tool({
      description:
        "Apply an improvement to the game. Replaces old_string with new_string in the file and creates/updates a PR.",
      inputSchema: z.object({
        old_string: z
          .string()
          .describe("Exact string to replace (must be unique in the file)"),
        new_string: z.string().describe("Replacement string with the new code"),
        commit_message: z
          .string()
          .describe("Descriptive commit message starting with feat:/fix:/ux:"),
        pr_title: z.string().describe("PR title — short, imperative"),
        feature_id: z
          .number()
          .optional()
          .describe("knowledge base feature ID this implements"),
      }),
      execute: async ({
        old_string,
        new_string,
        commit_message,
        pr_title,
        feature_id,
      }) => {
        await ensureBranch(env);

        // Get current file on agent branch
        const fileInfo = (await ghRequest(
          env,
          `contents/${env.GAME_FILE_PATH}?ref=${env.AGENT_BRANCH}`,
        )) as {
          content: string;
          sha: string;
        };
        const content = atob(fileInfo.content.replace(/\n/g, ""));
        if (!content.includes(old_string)) {
          return {
            success: false,
            error: "old_string not found in file — code may have changed",
          };
        }
        const updated = content.replace(old_string, new_string);

        // Push commit
        await ghRequest(env, `contents/${env.GAME_FILE_PATH}`, "PUT", {
          message: commit_message,
          content: btoa(updated),
          sha: fileInfo.sha,
          branch: env.AGENT_BRANCH,
        });

        // Create or find PR
        let prUrl = "";
        try {
          const pr = (await ghRequest(env, "pulls", "POST", {
            title: pr_title,
            head: env.AGENT_BRANCH,
            base: "main",
            body: `## MerkabaGameAgent Auto-Improvement\n\n${commit_message}\n\n${feature_id ? `Implements feature #${feature_id} from the knowledge base.` : ""}`,
            draft: false,
          })) as { html_url: string };
          prUrl = pr.html_url;
        } catch {
          // PR may already exist — find it
          const prs = (await ghRequest(
            env,
            `pulls?head=${env.GITHUB_OWNER}:${env.AGENT_BRANCH}&state=open`,
          )) as Array<{ html_url: string }>;
          prUrl = prs[0]?.html_url ?? "";
        }

        // Log to D1
        await env.DB.prepare(
          "INSERT INTO commits (feature_id, pr_url, summary, lines_added, lines_removed) VALUES (?,?,?,?,?)",
        )
          .bind(
            feature_id ?? null,
            prUrl,
            commit_message,
            new_string.split("\n").length,
            old_string.split("\n").length,
          )
          .run();

        if (feature_id) {
          await env.DB.prepare(
            "UPDATE features SET status='done', pr_url=?, updated_at=unixepoch() WHERE id=?",
          )
            .bind(prUrl, feature_id)
            .run();
        }

        return { success: true, pr_url: prUrl, commit_message };
      },
    }),

    /** Query the knowledge base for pending features or research */
    query_knowledge: tool({
      description:
        "Query the knowledge base. Returns pending features sorted by priority, or recent research findings.",
      inputSchema: z.object({
        type: z
          .enum(["features", "research", "commits", "telemetry"])
          .default("features"),
        status: z
          .string()
          .optional()
          .describe("Filter features by status: pending, in_progress, done"),
        limit: z.number().default(5),
      }),
      execute: async ({ type, status, limit }) => {
        if (type === "features") {
          const where = status
            ? "WHERE status = ?"
            : "WHERE status = 'pending'";
          const rows = await env.DB.prepare(
            `SELECT id, title, description, phase, area, priority, status, pr_url FROM features ${where} ORDER BY priority ASC, phase ASC LIMIT ?`,
          )
            .bind(...(status ? [status, limit] : [limit]))
            .all();
          return { type, rows: rows.results };
        }
        if (type === "research") {
          const rows = await env.DB.prepare(
            "SELECT topic, findings, sources, created_at FROM research ORDER BY created_at DESC LIMIT ?",
          )
            .bind(limit)
            .all();
          return { type, rows: rows.results };
        }
        if (type === "commits") {
          const rows = await env.DB.prepare(
            "SELECT summary, pr_url, committed_at FROM commits ORDER BY committed_at DESC LIMIT ?",
          )
            .bind(limit)
            .all();
          return { type, rows: rows.results };
        }
        const rows = await env.DB.prepare(
          "SELECT player_count, top_pilots, recorded_at FROM telemetry ORDER BY recorded_at DESC LIMIT ?",
        )
          .bind(limit)
          .all();
        return { type, rows: rows.results };
      },
    }),

    /** Store research findings in the knowledge base */
    store_research: tool({
      description:
        "Store research findings from web lookups into the knowledge base for future cycles.",
      inputSchema: z.object({
        topic: z.string(),
        query: z.string(),
        findings: z
          .string()
          .describe("Detailed findings, techniques, code snippets"),
        sources: z.array(z.string()).optional(),
      }),
      execute: async ({ topic, query, findings, sources }) => {
        await env.DB.prepare(
          "INSERT INTO research (topic, query, findings, sources) VALUES (?,?,?,?)",
        )
          .bind(topic, query, findings, JSON.stringify(sources ?? []))
          .run();
        return { stored: true, topic };
      },
    }),

    /** Fetch a URL for research purposes */
    fetch_url: tool({
      description:
        "Fetch a web page for research. Use for Three.js docs, game design patterns, A-Frame references.",
      inputSchema: z.object({
        url: z
          .string()
          .describe(
            "URL to fetch — must be a public documentation or reference page",
          ),
        extract: z
          .string()
          .describe("What specific information to extract from the page"),
      }),
      execute: async ({ url, extract }) => {
        const res = await fetch(url, {
          headers: { "User-Agent": "MerkabaGameAgent/1.0" },
        });
        if (!res.ok) return { error: `${res.status} fetching ${url}` };
        const text = await res.text();
        // Return first 8000 chars of relevant text content, strip tags
        const stripped = text
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .slice(0, 8000);
        return { url, content: stripped, extract_hint: extract };
      },
    }),

    /** Mark a feature as in-progress (agent is working on it this cycle) */
    claim_feature: tool({
      description:
        "Claim a feature to work on this cycle — marks it in_progress in the knowledge base.",
      inputSchema: z.object({ feature_id: z.number() }),
      execute: async ({ feature_id }) => {
        await env.DB.prepare(
          "UPDATE features SET status='in_progress', updated_at=unixepoch() WHERE id=?",
        )
          .bind(feature_id)
          .run();
        return { claimed: true, feature_id };
      },
    }),

    /** Add a new feature or bug to the knowledge base backlog */
    add_to_backlog: tool({
      description:
        "Add a newly discovered bug or enhancement to the feature backlog.",
      inputSchema: z.object({
        title: z.string(),
        description: z.string(),
        phase: z.number().default(4),
        area: z.enum(["gameplay", "uxp", "audio", "performance", "visual"]),
        priority: z.number().min(1).max(10).default(5),
      }),
      execute: async ({ title, description, phase, area, priority }) => {
        const res = await env.DB.prepare(
          "INSERT INTO features (title, description, phase, area, priority) VALUES (?,?,?,?,?)",
        )
          .bind(title, description, phase, area, priority)
          .run();
        return { added: true, id: res.meta.last_row_id };
      },
    }),
  };
}
