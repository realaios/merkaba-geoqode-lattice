-- MerkabaGameAgent knowledge base schema

CREATE TABLE IF NOT EXISTS features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  phase INTEGER DEFAULT 4,
  area TEXT NOT NULL, -- 'gameplay','uxp','audio','performance','visual'
  priority INTEGER DEFAULT 5, -- 1=critical, 10=nice-to-have
  status TEXT DEFAULT 'pending', -- 'pending','in_progress','done','rejected'
  pr_url TEXT,
  notes TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS research (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic TEXT NOT NULL,
  query TEXT NOT NULL,
  findings TEXT NOT NULL,
  sources TEXT, -- JSON array of URLs
  used_by_feature INTEGER REFERENCES features(id),
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS commits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_id INTEGER REFERENCES features(id),
  sha TEXT,
  pr_number INTEGER,
  pr_url TEXT,
  summary TEXT NOT NULL,
  files_changed TEXT, -- JSON array
  lines_added INTEGER DEFAULT 0,
  lines_removed INTEGER DEFAULT 0,
  committed_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS telemetry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_ts INTEGER NOT NULL,
  player_count INTEGER DEFAULT 0,
  events TEXT, -- JSON array of game events
  top_pilots TEXT, -- JSON array [{name, kills, score}]
  recorded_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS agent_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cycle_ts INTEGER NOT NULL,
  action TEXT NOT NULL,
  result TEXT,
  tokens_used INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  logged_at INTEGER DEFAULT (unixepoch())
);

-- Seed initial Phase 4-10 feature backlog
INSERT OR IGNORE INTO features (id, title, description, phase, area, priority) VALUES
(1, 'Weapon Arsenal: Homing Missile', 'Secondary weapon: slow homing missile with 3s travel, tracks nearest ghost. Key: M to fire. 5 per life.', 4, 'gameplay', 1),
(2, 'Weapon Arsenal: Proximity Mine', 'Drop mines (key: N) that detonate when an enemy enters 15 AU. Max 3 active mines per pilot.', 4, 'gameplay', 1),
(3, 'Ammo & Pickup System', 'Ammo crates spawned at random galaxy anchors every 2 minutes. Fly through to collect (animated SpotLight orb).', 4, 'gameplay', 2),
(4, 'Weapon HUD Switcher', 'Three-weapon carousel in bottom-center HUD. Keyed 1/2/3. Shows ammo count and cooldown bar per slot.', 4, 'uxp', 2),
(5, 'Zone Control: 5 Capture Sectors', '5 holographic IcosahedronGeometry zones at deep-space anchors. Capture by 10s proximity. Team scoring.', 5, 'gameplay', 1),
(6, 'Zone Visual: Holographic Beacon', 'Each zone: pulsing wireframe IcosahedronGeometry + colour-coded owner ring + capture progress bar overlay.', 5, 'visual', 2),
(7, 'Squad Formation System', '2-4 pilots form squad (invite via kill-feed command). Shared radar overlay, +20% accuracy in formation.', 6, 'gameplay', 2),
(8, 'Spatial Audio: Engine Proximity', 'Ghost engine sfx: Web Audio gain scaled by 1/distance^2. Each ghost has own oscillator looping at ~220Hz.', 6, 'audio', 3),
(9, 'Dynamic Mission: Assassination', 'Server selects random pilot as target every 15min. Bounty = 500pts. Target gets warning + shield boost.', 7, 'gameplay', 2),
(10, 'Dynamic Mission: Escort Freighter', 'AI freighter spawns at galaxy anchor, must be escorted to destination. Attackers get 200pts if they destroy it.', 7, 'gameplay', 3),
(11, 'Pilot Rank & XP System', 'XP per kill/assist/zone. Ranks: Cadet→Pilot→Ace→Commodore→Admiral. Server persists in dogfight-scores.json.', 8, 'gameplay', 1),
(12, 'Rank Badge on Label', 'Pilot callsign label includes rank insignia prefix (★ Ace, ★★ Commodore etc). Color-coded by rank tier.', 8, 'uxp', 2),
(13, 'Ship Skin Unlock by Rank', 'Each rank tier shifts hull HSL hue +30°. Admiral gets gold wireframe secondary + corona always visible.', 8, 'visual', 3),
(14, 'Battle Replay Buffer', 'Server stores rolling 10min ring buffer of pos/event packets. /replay endpoint returns JSON for playback.', 9, 'gameplay', 3),
(15, 'Spectator Mode', 'Join with ?spectate=1. No ship spawned. Free-fly camera. Click ghost name to snap-follow that pilot.', 10, 'gameplay', 2),
(16, 'Minimap Radar Overlay', '2D circular radar in bottom-right HUD. Friendly dots (team colour), enemy dots (red), zone icons. 5000 AU range.', 4, 'uxp', 1),
(17, 'Kill Streak Announcer', 'At 3/5/7+ kills without dying: voice-style big-text pop (TRIPLE KILL / RAMPAGE / GODLIKE) with particle burst.', 4, 'uxp', 2),
(18, 'Afterburner Boost', 'Double-tap W for 3s speed boost. Engine nacelles glow white, corona emits trail particles. 10s cooldown.', 4, 'gameplay', 2),
(19, 'Shield Recharge Mechanic', 'Shield (IcosahedronGeometry opacity) acts as ablative HP. Recharges at 5% per second if no damage for 4s.', 5, 'gameplay', 2),
(20, 'Achievement System', 'First Blood, Ace (5 kills in one life), Galaxy Warden (capture all 5 zones). Server badge persisted per callsign.', 8, 'gameplay', 3);
