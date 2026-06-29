# Launch Announcements

## Show HN — Hacker News

**Title:** Show HN: We built an AI agent that autonomously improves our open source science lab (Cloudflare Workers + Claude)

**Body:**
We're open-sourcing MERKABA/AIOS — and the piece I think is most interesting to HN is this:

We have a 24/7 autonomous agent running on Cloudflare Workers + Claude Opus 4.7 that:
- Every 4 hours: picks a feature from a D1 SQLite backlog, reads the live code via GitHub API, writes a surgical code improvement, and opens a PR
- Every hour: a Claude Haiku sub-agent pre-researches upcoming features

It operates on cosmos-lab.html — a browser-based 3D interactive science lab (physics pendulums, wave interference, molecular viewer, DNA helix, orbital mechanics). No install. Multi-user via WebSocket.

The agent code is in /agent-lab — it's a Cloudflare Durable Object with scheduled crons. The whole thing is about 400 lines of TypeScript + Zod schemas for the tools.

Repo: https://github.com/realaios/merkaba-geoqode-lattice
Live: https://realaios.com/cosmos-lab
MIT licensed. Attribution required.

---

## Product Hunt

**Name:** Cosmos Lab by MERKABA AIOS
**Tagline:** A self-improving open-source 3D science lab — AI writes its own code every 4 hours
**Description:**
Cosmos Lab is a free, browser-based 3D interactive science universe with four labs:
⚡ Physics — pendulum, wave interference, orbital mechanics, projectile motion
⚗ Chemistry — molecular viewer, reaction animator, electron orbitals
⬡ Biology — DNA double helix, cell organelle viewer, ecosystem
⚙ Engineering — gear dynamics, circuit simulator, rocket launch

No account. No install. Multi-user presence. Mobile-friendly.

The twist: a 24/7 autonomous AI agent (Cloudflare Workers + Claude Opus 4.7) continuously improves it — picking features from a backlog, reading the live code, writing patches, and opening PRs.

MIT open source. Runs in any browser.

**Tags:** Open Source, Education, AI, 3D, Science

---

## Dev.to / Hashnode article outline

**Title:** How we built a 24/7 autonomous AI agent that writes its own code (Cloudflare Workers + Claude Opus 4.7)

1. The problem: open source projects need continuous improvement but no one has time
2. The solution: a Cloudflare Durable Object with cron triggers
3. The tools: fetch_lab_code, search_lab_code, commit_improvement, query_knowledge, store_research
4. The loop: pick feature → read code → write patch → commit via GitHub API → open PR
5. The research cycle: Claude Haiku pre-researches upcoming features every hour
6. The result: 24 features in the backlog, PRs being opened automatically
7. The code: it's all open source in /agent-lab

---

## GitHub Topics to add manually (Settings → Topics on GitHub)

open-source, ai-agents, cloudflare-workers, autonomous-agents, science-education,
threejs, aframe, webxr, claude, anthropic, interactive-science, mit-license,
browser-game, websocket, education, geoqode, merkaba, aios
