# MerkabaGameAgent

Autonomous 24/7 AI game development agent for **cosmos-infinite** — the Merkaba48OS galactic space combat simulator.

Runs on Cloudflare Workers + Agents SDK. Every 6 hours it picks the top-priority pending feature from the knowledge base, reads the relevant game code from GitHub, generates a surgical code improvement using Claude Opus 4.7, and creates a Pull Request.

## Deploy

```bash
cd agent
npm install

# 1. Create D1 database
npm run db:create
# Copy the database_id from the output into wrangler.jsonc → d1_databases[0].database_id

# 2. Run schema migration
npm run db:migrate:remote

# 3. Set secrets
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put GITHUB_TOKEN       # needs: contents:write, pull-requests:write

# 4. Deploy
npm run deploy
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check + endpoint index |
| GET | `/status` | Agent state + recent cycle log |
| GET | `/knowledge` | Full feature backlog + research findings |
| POST | `/trigger` | Fire an immediate dev cycle |
| POST | `/research` | Spawn research sub-agent `{topic, query}` |
| POST | `/backlog` | Add feature/bug `{title, description, area, priority}` |

## Architecture

```
Cloudflare Worker (index.ts)
└── MerkabaGameAgent Durable Object (agent.ts)
    ├── Cron: devCycle() every 6 hours
    │   ├── Claude Opus 4.7 — picks feature, reads code, writes patch
    │   └── Commits to `game-agent-improvements` branch → PR
    ├── Cron: recordTelemetry() every 30 minutes
    │   └── Fetches dogfight-scores.json → stores in D1
    └── D1 Database (merkaba-knowledge)
        ├── features    — Phase 4–10 improvement backlog (20 seeded)
        ├── research    — Web research findings indexed by topic
        ├── commits     — History of all agent commits + PR URLs
        └── agent_log   — Cycle logs with timing + results
```

## Research Agent

POST `/research` with `{topic, query}` spins up a Claude Haiku sub-agent that:
1. Fetches relevant documentation URLs
2. Extracts technical findings
3. Stores results in the `research` table for future dev cycles

## Feature Backlog (Phase 4–10)

20 features seeded across the roadmap:
- **Phase 4**: Homing missile, proximity mine, ammo pickups, minimap radar, kill-streak announcer, afterburner, weapon HUD
- **Phase 5**: 5 zone-control sectors, holographic beacons, shield recharge
- **Phase 6**: Squad formation system, spatial engine audio
- **Phase 7**: Assassination mission, escort freighter mission
- **Phase 8**: Pilot rank/XP system, rank badge labels, skin unlocks, achievement system
- **Phase 9**: Battle replay buffer
- **Phase 10**: Spectator mode
