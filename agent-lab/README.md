# MerkabaLabAgent

Autonomous 24/7 AI science lab developer for **cosmos-lab** — the Cosmos-Lab interactive science universe.

Runs on Cloudflare Workers + Agents SDK. Every 4 hours it picks the top-priority pending feature from the knowledge base, reads the relevant section of `cosmos-lab.html`, generates a surgical code improvement using Claude Opus 4.7, and creates a Pull Request. Every hour a Claude Haiku research sub-agent pre-researches upcoming features.

## Deploy

```bash
cd agent-lab
npm install

# 1. Create D1 database
npm run db:create
# Copy the database_id into wrangler.jsonc → d1_databases[0].database_id

# 2. Run schema + seed
npm run db:migrate:remote

# 3. Set secrets
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put GITHUB_TOKEN    # needs: contents:write, pull-requests:write

# 4. Deploy
npm run deploy
```

## API Endpoints

| Method | Path         | Description                                                |
| ------ | ------------ | ---------------------------------------------------------- |
| GET    | `/`          | Health check + endpoint index                              |
| GET    | `/status`    | Agent state + recent cycle log                             |
| GET    | `/knowledge` | Full feature backlog + research findings                   |
| POST   | `/trigger`   | Fire an immediate dev cycle                                |
| POST   | `/research`  | Spawn research sub-agent `{topic, query}`                  |
| POST   | `/backlog`   | Add feature `{title, description, module, area, priority}` |

## Architecture

```
Cloudflare Worker (index.ts)
└── MerkabaLabAgent Durable Object (agent.ts)
    ├── Cron: devCycle() every 4 hours
    │   ├── Claude Opus 4.7 — picks feature, reads code, writes patch (14 maxSteps)
    │   └── Commits to `lab-agent-improvements` branch → PR
    ├── Cron: researchCycle() every hour
    │   └── Claude Haiku — pre-researches top 3 pending features
    └── D1 Database (merkaba-lab-knowledge)
        ├── features    — Phase 1–3 improvement backlog (24 seeded)
        ├── research    — Web research findings indexed by topic
        ├── commits     — History of all agent commits + PR URLs
        └── agent_log   — Cycle logs with timing + results
```

## Feature Backlog (Phase 1–3)

**Phase 1 — Core experiment enhancements (11 features):**

- Pendulum phase space plot, wave interference colormap, orbital energy diagram
- Molecule rotation controls, glucose structure (C6H12O6)
- DNA base-pair legend, cell membrane animation, gear torque display
- Rocket staging animation, portal ring pulse, keyboard cheatsheet

**Phase 2 — Advanced simulations (8 features):**

- Double pendulum chaos, standing wave resonance modes
- Lewis structure overlay, pH indicator simulation
- Protein folding, mitosis cell division
- Bridge load simulation, fluid dynamics streamlines

**Phase 3 — Curriculum + multi-user (5 features):**

- Experiment narration mode, quiz mode
- Shared experiment state sync, Merkaba peer avatars, chat overlay
