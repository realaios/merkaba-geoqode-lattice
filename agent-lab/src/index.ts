import { routeAgentRequest } from "agents";
import { MerkabaLabAgent } from "./agent";
import type { Env } from "./tools";

export { MerkabaLabAgent };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(
        JSON.stringify({
          service: "MerkabaLabAgent",
          description: "24/7 autonomous science lab development agent for cosmos-lab",
          endpoints: {
            "GET /": "Health check",
            "GET /status": "Agent status + recent log",
            "GET /knowledge": "Knowledge base — features + research",
            "POST /trigger": "Trigger immediate dev cycle",
            "POST /research": "Spawn research sub-agent {topic, query}",
            "POST /backlog": "Add item to feature backlog",
          },
          agents_url: "/agents/merkaba-lab-agent/main",
        }, null, 2),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    return (
      (await routeAgentRequest(request, env)) ??
      new Response("Not found", { status: 404 })
    );
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    const { getAgentByName } = await import("agents");
    const agent = await getAgentByName<Env, MerkabaLabAgent>(env.LAB_AGENT, "main");
    await agent.devCycle();
  },
} satisfies ExportedHandler<Env>;
