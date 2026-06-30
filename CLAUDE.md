# CLAUDE.md — merkaba-geoqode-lattice

**Owner:** Bradley Levitan / realaios | **Live:** realaios.com / realaios.com/cosmos-lab

---

## CREDENTIAL BOOTSTRAP

```bash
CF_API_TOKEN=$(grep "^CF_API_TOKEN=" "c:/Users/bradl/source/storm-ai/pwai-frontend/.env" | cut -d= -f2- | tr -d '"')
CF_ACCOUNT_ID=$(grep "^CF_API_TOKEN=" "c:/Users/bradl/source/storm-ai/pwai-frontend/.env" | cut -d= -f2- | tr -d '"')
# Or: source ~/.aios-credentials.sh
```

---

## Architecture Signature — IMMUTABLE

```
8 → 26 → 48 : 480    PHI=1.618   PSI=1.414   f₀=72Hz
```

Drift throws a fatal error in `geoqode-native.js`. Never change these constants.

---

## Key files in this repo

| File | Role |
|------|------|
| `server.js` | WebSocket server (presence, dogfight, lab WS) |
| `public/cosmos-infinite.html` | Main VR experience — ~55k lines, vanilla JS + A-Frame |
| `public/cosmos-lab.html` | Science lab VR + MerkabaLabAgent integration |
| `public/index.html` | Landing page (JSON-LD, OG meta) |
| `geo/lattice/transform-420.js` | Canonical lattice transforms + assertions |
| `geo/intelligence/MerkabaDualAttestation.js` | PHI/PSI attestation engine |
| `geo/intelligence/MerkabaBeEyeSwarmWitness.js` | Omega (PSI) pole |
| `geo/intelligence/HebrewGeometricOperators.js` | 22-letter gematria map |
| `agent-lab/` | MerkabaLabAgent — Cloudflare Worker (Durable Object + D1 + cron) |
| `GEOQODE_KABBALISTIC_ARCHITECTURE.md` | Canonical Hebrew/GeoQode reference |

## MerkabaLabAgent

Deployed: `merkaba-lab-agent.bradleylevitan.workers.dev`
- D1: `merkaba-lab-knowledge` (2ff6331f-64df-464a-80d1-e264b2f7d1f9)
- Cron: every 4h — auto-improves cosmos-lab.html, creates PRs on `lab-agent-improvements` branch
- Redeploy: `CLOUDFLARE_API_TOKEN=$CF_API_TOKEN CLOUDFLARE_ACCOUNT_ID=$CF_ACCOUNT_ID npx wrangler deploy` from `agent-lab/`

## cosmos-infinite.html line anchors

| Feature | ~Line |
|---------|-------|
| Dogfight state vars (`_myKills`, `_lastFire`) | 55222 |
| `_playSfx()` Web Audio | 55609 |
| `case 'welcome':` dogfight WS | 55698 |
| `case 'kill':` | 55856 |
| `_updateScoreboard()` | 55577 |
| `_spawnExplosion()` | 51558 |
| Horizon overlay (`#horizon-overlay`) | ~2707 |

## Dogfight Phase 2 status: COMPLETE

All 9 steps implemented: persistent scores (data/dogfight-scores.json), enriched kill packets (shooterName/targetName/shooterScore/shooterKills), death explosions, 400ms fire cooldown, Web Audio SFX, ghost score sync, kill-feed with callsigns, all-time leaderboard (ALL-TIME section), welcome packet allTimeTop.

## Verification

```bash
npm test && npm run lint
```

Attribution: "Powered by AIOS / MERKABA480 — Founder: Bradley Levitan"
