import { routeAgentRequest } from "agents";
import { MerkabaGameAgent } from "./agent";
import type { Env } from "./tools";

export { MerkabaGameAgent };

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/") {
      return new Response(
        JSON.stringify(
          {
            service: "MerkabaGameAgent",
            description:
              "24/7 autonomous game development agent for cosmos-infinite",
            endpoints: {
              "GET /": "Health check",
              "GET /status": "Agent status + recent log",
              "GET /knowledge": "Knowledge base — features + research",
              "POST /trigger": "Trigger immediate dev cycle",
              "POST /research": "Spawn research sub-agent {topic, query}",
              "POST /backlog": "Add item to feature backlog",
            },
            agents_url: "/agents/merkaba-game-agent/main",
          },
          null,
          2,
        ),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Route to agent — all /agents/* requests + all other paths
    return (
      (await routeAgentRequest(request, env)) ??
      new Response("Not found", { status: 404 })
    );
  },

  // Cloudflare Cron Trigger — fires every 6 hours per wrangler.jsonc
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    const { getAgentByName } = await import("agents");
    const agent = await getAgentByName<Env, MerkabaGameAgent>(
      env.MERKABA_AGENT,
      "main",
    );
    await agent.devCycle();
  },
} satisfies ExportedHandler<Env>;
