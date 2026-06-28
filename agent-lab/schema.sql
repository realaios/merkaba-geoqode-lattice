-- Merkaba Lab Agent Knowledge Base
-- Run: wrangler d1 execute merkaba-lab-knowledge --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS features (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT,
  module      TEXT DEFAULT 'all',        -- physics|chemistry|biology|engineering|hub|all
  area        TEXT DEFAULT 'experiment',  -- experiment|ux|visual|audio|curriculum|multiuser
  phase       INTEGER DEFAULT 1,
  priority    INTEGER DEFAULT 5,         -- 1=highest, 10=lowest
  status      TEXT DEFAULT 'pending',    -- pending|in_progress|done|wont_do
  pr_url      TEXT,
  created_at  INTEGER DEFAULT (unixepoch()),
  updated_at  INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS research (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  topic      TEXT NOT NULL,
  query      TEXT,
  findings   TEXT,
  sources    TEXT DEFAULT '[]',
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS commits (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_id   INTEGER,
  pr_url       TEXT,
  summary      TEXT,
  lines_added  INTEGER DEFAULT 0,
  lines_removed INTEGER DEFAULT 0,
  committed_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS agent_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  cycle_ts    INTEGER,
  action      TEXT,
  result      TEXT,
  duration_ms INTEGER,
  logged_at   INTEGER DEFAULT (unixepoch())
);

-- ── Phase 1: Core experiment enhancements ─────────────────────────────────────
INSERT INTO features (title, description, module, area, phase, priority) VALUES
  ('Pendulum phase space plot', 'Add a θ vs ω Lissajous/phase-space canvas overlay — renders the pendulum attractor shape in real time', 'physics', 'experiment', 1, 1),
  ('Wave interference colormap', 'Color the wave mesh by amplitude using a gradient (blue=trough, red=crest) using vertex colors on the PlaneGeometry', 'physics', 'experiment', 1, 1),
  ('Orbital energy diagram', 'Add a side HUD bar chart showing KE, PE, and total energy per planet in real time', 'physics', 'experiment', 1, 2),
  ('Molecule rotation controls', 'Add X/Y/Z lock axis buttons + reset orientation button to the chemistry controls panel', 'chemistry', 'ux', 1, 2),
  ('Glucose molecule (C6H12O6)', 'Add full glucose structure: 6 carbons, 6 oxygens, 12 hydrogens in ring conformation', 'chemistry', 'experiment', 1, 2),
  ('DNA base-pair coloring legend', 'Add A/T/G/C color legend HUD panel; label the four bases in DNA helix view', 'biology', 'ux', 1, 3),
  ('Cell membrane animation', 'Animate phospholipid bilayer: slowly undulating outer sphere + brownian motion of embedded protein spheres', 'biology', 'experiment', 1, 3),
  ('Gear torque display', 'Show torque arrows scaled by radius on each gear; display τ = F·r in data panel', 'engineering', 'experiment', 1, 3),
  ('Rocket staging animation', 'Animate first stage detachment: separate lower cylinder drops away when fuel hits 0%', 'engineering', 'experiment', 1, 4),
  ('Portal ring pulse on switch', 'Trigger bright pulse animation on hub portal rings when entering a module', 'hub', 'visual', 1, 4),
  ('Keyboard shortcut cheatsheet', 'Add "?" key to show/hide a semi-transparent overlay listing all keyboard shortcuts', 'all', 'ux', 1, 4);

-- ── Phase 2: Advanced simulations ────────────────────────────────────────────
INSERT INTO features (title, description, module, area, phase, priority) VALUES
  ('Double pendulum chaos', 'Add a second pendulum hanging from the first; demonstrates chaotic behavior — θ₁/θ₂ with full Lagrangian equations', 'physics', 'experiment', 2, 1),
  ('Standing wave resonance modes', 'Add mode selector (n=1..6) for 1D standing wave on a string; show nodes/antinodes', 'physics', 'experiment', 2, 1),
  ('Lewis structure overlay', 'Add toggleable 2D Lewis structure diagram (SVG) as HUD overlay for each molecule', 'chemistry', 'experiment', 2, 2),
  ('pH indicator simulation', 'Animate acid-base reaction: drop pH value, sphere colors shift from blue→green→red based on indicator', 'chemistry', 'experiment', 2, 2),
  ('Protein folding visualization', 'Show 20-amino-acid chain folding via simulated annealing — spheres connected by springs', 'biology', 'experiment', 2, 3),
  ('Mitosis cell division animation', 'Animate cell division: nucleus splits, chromosomes segregate, membrane pinches — 6-phase cycle', 'biology', 'experiment', 2, 3),
  ('Bridge load simulation', 'Add truss bridge: toggle load weight, watch stress vectors on members, member color encodes tension/compression', 'engineering', 'experiment', 2, 2),
  ('Fluid dynamics streamlines', 'Add 2D Navier-Stokes streamline visualization around a cylinder (Joukowski flow) using particle tracers', 'engineering', 'experiment', 2, 2);

-- ── Phase 3: Curriculum + multi-user ─────────────────────────────────────────
INSERT INTO features (title, description, module, area, phase, priority) VALUES
  ('Experiment narration mode', 'Add auto-narrate toggle: typewriter text box explains current experiment step by step with equations', 'all', 'curriculum', 3, 1),
  ('Quiz mode', 'After each experiment, show 3 multiple-choice questions. Track score, highlight correct answers in green', 'all', 'curriculum', 3, 2),
  ('Shared experiment state sync', 'Broadcast experiment parameters over /ws/lab experiment_state packets so all users see same sim', 'all', 'multiuser', 3, 1),
  ('Researcher Merkaba avatars', 'Render peer researchers as small Merkaba wireframe avatars at their ws/lab positions', 'all', 'multiuser', 3, 2),
  ('Chat overlay', 'Add floating chat panel: messages broadcast over ws/lab chat packets, 30-second fade', 'all', 'multiuser', 3, 3);
