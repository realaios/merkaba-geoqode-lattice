# Cosmos-Infinite — Pitch & Roadmap

**Live:** [realaios.com/cosmos-infinite](https://realaios.com/cosmos-infinite)
**Owner:** Bradley Levitan · realaios / AIOS · MERKABA480
**Attestation:** `8,26,48:480`

> A frictionless, browser-native gateway into an immersive planetary universe — with a
> populated, always-on multiplayer game (Defend the Core) running inside it 24/7.

---

## THE PITCH

### Why the "Enter Universe" experience stands out

If we focus purely on the unique qualities of the **"Enter Universe"** web experience, here's
what makes it valid and viable as a platform in its own right:

**What makes it unique**

- **Instant access** — No installs, no accounts, no downloads. Tap "Enter Universe" and you're
  inside. Frictionless entry that Unity/Unreal/Roblox/VR apps cannot match.
- **Cross-platform** — Any modern browser: phone, tablet, desktop. No app store, no OS-version
  dependency. This universality is rare in immersive environments.
- **Interactive holographic UI** — Tap planets, objects, and HUD elements directly in the
  simulation. It's an interactive holographic interface in the browser, not a passive animation.
- **Persistent environments** — The planetary worlds and HUDs are always available. No separate
  worlds to load, no assets to download — the environment is persistent and ready instantly.

**Why it's valid and viable**

- **vs. other websites:** most are static or media-driven. This is a live, interactive planetary
  simulation.
- **vs. apps:** no APK, no flash, no store friction.
- **Viable for scale:** browser-based → reaches anyone with a device, no special hardware.
- **Valid as a platform:** it already demonstrates immersive navigation, HUD interaction, and
  planetary animation — a working foundation for AIOS-powered semantic-mesh integration later.

### The differentiator we shipped: it's *populated*

The honest gap in most WebGL "worlds" is that **you arrive and it's empty** — impressive, then
lonely. **Defend the Core** closes that: with the server-side agent pilots, the universe is
**populated and alive the moment you enter, with zero other humans required.** That's the
difference between "a place I looked at once" and "a place that's always doing something when I
show up" — the single biggest retention/virality lever the experience has.

The AIOS / semantic-mesh layer is the eventual "why it's more than a game," but it isn't required
to be viable. As of the current deploy the gateway is **populated, joinable, and self-sustaining.**

---

## CURRENT STATE (LIVE)

Loading `realaios.com/cosmos-infinite` right now gives you:

- **4 gold agent star-fighters flying 24/7** — `VEGA-ATK`, `RIGEL-ATK` (attackers weaving the
  Merkaba Core); `ORION-DEF`, `LYRA-DEF` (defenders intercepting). Server-authoritative — every
  visitor sees the same living battle. They bank into turns, vary speed (afterburner/ease),
  attackers jink when threatened, defenders fly cut-off intercept curves.
- **⚔ JOIN DEFEND THE CORE** button, always visible (no `?mode=dtc` needed). Tap → auto-assigned
  to a team in the ongoing endless round; a team badge appears. It's a persistent 24/7 game you
  tap to join mid-flight.
- **Auto-Fire** (ON by default, Options → Combat) — fires when an enemy sits in your crosshairs
  (~5° cone); crosshair locks red; 25-dmg / health-bar damage model. Manual fire button still works.
- **Core-approach alert** for defenders, **round-history** panel (Options → Defend the Core),
  **background drone muted by default** (Options → Sound), and a **mobile-optimized laser**.
- **End-to-end verified** against the live server: connect → welcome → callsign → ready →
  teamAssign → fire → **kill credited & persisted to the leaderboard**.

### Foundation (all live)

WebSocket presence · team assignment + auto-balance · laser fire + hit/kill · persistent scores
(`dogfight-scores.json`) + all-time leaderboard · core health drain + tiered scoring · round
system (timer/end/side-swap) · round history (`dtc-rounds.json`) · spectator mode · quick-join
`?mode=dtc` · invite + kill-share cards · reconnect with team restore.

---

## ROADMAP — BUILD ON (Next Unlocks)

Two next unlocks the experience's own strengths imply — **both already half-seeded**:

### 1. Frictionless-but-identifiable

"No account" is the right *entry*, but the persistence we already have (callsigns +
`dogfight-scores.json` + round history) means we can offer an **optional identity later without
ever adding a signup wall.** That's the sweet spot: **anonymous entry, opt-in memory.**

- Callsign persists locally today; add optional lightweight claim (magic link / passkey) that
  *binds* an existing callsign's stats — never gates entry.
- Carry stats across devices once claimed; stay anonymous until then.
- Foundation for profiles, cosmetics, and squads without breaking instant access.

### 2. "Instant access" as the share unit

The `?mode=dtc&invite=CALLSIGN` link + kill-share card are the growth loop: **the experience is
the ad.** Every match is a shareable moment that opens in one tap on any device — no other
immersive platform can say that.

- Every kill/round-win → one-tap share card (Instagram-story dimensions) already scaffolded.
- Invite links deep-link straight into the live round (skip lobby).
- Optimize the share card for autoplay previews so the shared artifact *is* a trailer.

### Also queued

- **Agent flight via the FLM** — the in-browser Flight Learning Model (`MerkabaFLM`, 12→24→4
  REINFORCE policy, `window.MERKABA_FLM`) is trained to navigate toward Merkaba cores — exactly
  the attacker objective. Its `forward()` pass is pure math and portable to the server; export
  trained weights → ship as JSON → drive attacker navigation with learned flight. (Current bot
  flight is hand-tuned and does not depend on this.)
- Distinct attacker/defender agent tint (currently shared agent gold).
- Voice proximity chat (WebRTC), 3D minimap polish, spectator tournaments.
- AIOS semantic-mesh integration: game-announcer / matchmaker / anti-grief agents driving the
  round from the STORM lattice.

---

## ARCHITECTURE NOTES

- **Client** (`public/cosmos-infinite.html`): A-Frame + Three.js monolith. Connects **same-origin**
  to `/ws/presence` (do **not** hardcode a host — the old `aios-mesh.realaios.com` was not a
  configured domain and 502'd; the game server is same-origin on `realaios.com`).
- **Server** (`server.js`, Railway service `merkaba-geoqode-os` → `realaios.com`): serves the page
  *and* the `/ws/presence` game server. DTC agent pilots + game state live here. Agent-pilot
  changes require a Railway restart/redeploy.
- **Canonical constants** attest `8,26,48:480` throughout.

_Founder: Bradley Levitan — realaios.com_
