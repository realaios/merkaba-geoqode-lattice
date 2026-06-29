<div align="center">

# MERKABA · AIOS · GeoQode

**Open Source Interactive Science + AI Governance Runtime**

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)
[![Attribution Required](https://img.shields.io/badge/Attribution-Required-purple.svg)](#attribution)
[![Cosmos Lab](https://img.shields.io/badge/Live-Cosmos%20Lab-blue.svg)](https://realaios.com/cosmos-lab)
[![Sponsor](https://img.shields.io/badge/Sponsor-❤-ff69b4.svg)](https://github.com/sponsors/realaios)

_Built by Bradley Levitan · Storm AI / AIOS_

</div>

---

## What's in this repo

| Project              | What it is                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cosmos Lab**       | Browser-based 3D science universe — Physics, Chemistry, Biology, Engineering labs with real simulations, multi-user presence, and a 24/7 autonomous AI improving it |
| **GeoQode**          | A dimensional language runtime for writing AI governance programs as geometry                                                                                       |
| **MERKABA Lattice**  | 48-dimension governance lattice — the AI agent coordination backbone                                                                                                |
| **MerkabaGameAgent** | Autonomous Cloudflare Workers agent that self-improves `cosmos-infinite.html`                                                                                       |
| **MerkabaLabAgent**  | Autonomous agent that self-improves `cosmos-lab.html` every 4 hours                                                                                                 |

---

## Cosmos Lab — Try it now

**[https://realaios.com/cosmos-lab](https://realaios.com/cosmos-lab)**

No account. No install. Just open in any browser.

```
⚡ Physics    — Pendulum · Wave interference · Orbital mechanics · Projectile motion
⚗ Chemistry  — 3D molecular viewer · Reaction animator · Electron orbitals
⬡ Biology    — DNA double helix · Cell organelle viewer · Ecosystem food web
⚙ Engineering — Gear dynamics · Circuit simulator · Rocket launch
```

Controls: **Click canvas to fly · WASD · Space/Shift = up/down · ESC = release**
Mobile: **Left thumb = move · Right drag = look**

---

## Quick start (local)

```bash
git clone https://github.com/realaios/merkaba-geoqode-lattice.git
cd merkaba-geoqode-lattice
npm install
node server.js
```

Open `http://localhost:3000/cosmos-lab`

---

## GeoQode — Resonance as Code

GeoQode is a language where geometry is the program. Every statement maps to a dimension in the MERKABA 48-lattice.

```geo
Program AnimateWater {
  Node.emit(Δ[green], Φ[2]);
  Node.detect(⊗, ⧉);
  Water.qbit(~wave(528Hz), Φ[1]);
  Log("QBITS materialized");
}
```

```bash
node scripts/run.js examples/hello-geoqode.geo
```

| Operator              | Symbol     | Purpose                           |
| --------------------- | ---------- | --------------------------------- |
| Harmonic Resonance    | `Φ[n]`     | Set frequency ratio (φⁿ)          |
| Helixial Duality      | `⊗`        | Dual tetrahedron projection       |
| Chromodynamic Shading | `Δ[color]` | Spectral light emission           |
| Cymatic Sonic Driver  | `~wave(f)` | Frequency resonance stimulation   |
| Octahedron Resonance  | `⧉`        | Inner Octahedron field activation |

---

## MerkabaLabAgent — AI that writes its own code

The lab runs a 24/7 autonomous agent (Cloudflare Workers + Claude Opus 4.7) that:

- Every **4 hours**: picks a pending feature from the backlog, reads the live code, writes a surgical improvement, opens a PR
- Every **1 hour**: pre-researches upcoming features using Claude Haiku

```bash
cd agent-lab
npm install
npm run db:create     # create D1 database
npm run db:migrate:remote
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put GITHUB_TOKEN
npm run deploy
```

---

## Attribution

This project is MIT licensed. The only requirement: **keep the attribution line**.

Any fork, derivative, or integration must include in its UI or documentation:

> _Powered by AIOS / MERKABA480 — Founder: Bradley Levitan_

---

## Sponsor / Support

This is free, open source, and always will be. If it's useful to you:

- **GitHub Sponsors**: [github.com/sponsors/realaios](https://github.com/sponsors/realaios)
- **Ko-fi**: [ko-fi.com/merkaba](https://ko-fi.com/merkaba)
- **Star the repo** — it helps others find it

All support goes directly into compute costs for the autonomous agents and new experiment development.

---

## Contributing

Pull requests welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

Good first contributions:

- New experiment modules for any of the 4 labs
- Mobile UX improvements for Cosmos Lab
- GeoQode language extensions
- New features for the agent backlog (`agent-lab/schema.sql`)

**Bug reports** → [Issues](https://github.com/realaios/merkaba-geoqode-lattice/issues)

---

## License

**MIT** — See [LICENSE](LICENSE)

The interface layer, all apps (Cosmos Lab, GeoQode runtime, agent workers), documentation, and examples are MIT licensed with attribution requirement.

The MERKABA kernel math (lattice constants, dual-pole attestation engine) is proprietary — see [LICENSE-KERNEL](LICENSE-KERNEL). You can build on top of the published API without needing the kernel internals.

---

<div align="center">

**MERKABA · AIOS · GeoQode** — _Open to the world_

_Bradley Levitan · Storm AI · 2026_

</div>
