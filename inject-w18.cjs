'use strict';
// inject-w18.cjs — Wave 18: void-bubble + plasma-vortex
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

// Idempotency check
if (html.includes('AFRAME.registerComponent("void-bubble"')) {
  console.log('Wave 18 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities (inject after cosmic-heartbeat entity) ─────────────────
const HTML_ANCHOR = '      <a-entity cosmic-heartbeat></a-entity>';
const HTML_INSERT = `      <a-entity cosmic-heartbeat></a-entity>
      <!-- ── VOID BUBBLE — dark energy bubble expanding in the cosmic void ── -->
      <a-entity void-bubble></a-entity>
      <!-- ── PLASMA VORTEX — rotating helical column of magnetised plasma ── -->
      <a-entity plasma-vortex></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components (inject before asteroid-belt) ──────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         VOID BUBBLE — a large dark-energy bubble swelling in the cosmic void.
         A primordial phase-transition pocket of true vacuum that slowly grows,
         shimmering at its boundary with displaced quantum fields.
         Position: (-600, 200, -900).
         Components:
           - Outer shell: SphereGeometry r=1 (scaled), dark violet, low opacity,
               wireframe geometry subdivided to show lattice structure
           - Inner shell: slightly smaller, nearly transparent, different hue
           - Boundary shimmer: 500-particle ring at the sphere surface,
               colours ranging from deep purple to rose-gold
           - Slow growth: r grows from 120 to 250 over 25s then resets
           - Rotates very slowly
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("void-bubble", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-600, 200, -900);
          scene.add(this._root);

          /* ── outer shell (wireframe) ── */
          var oGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(1, 18, 14));
          this._outerMat = new THREE.LineBasicMaterial({
            color: 0x9900cc, transparent: true, opacity: 0.20,
          });
          this._outerShell = new THREE.LineSegments(oGeo, this._outerMat);
          this._root.add(this._outerShell);

          /* ── inner shell ── */
          var iGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(0.88, 14, 11));
          this._innerMat = new THREE.LineBasicMaterial({
            color: 0x6600ff, transparent: true, opacity: 0.12,
          });
          this._innerShell = new THREE.LineSegments(iGeo, this._innerMat);
          this._root.add(this._innerShell);

          /* ── boundary shimmer (500 surface particles) ── */
          var BN = 500;
          this._shimPos = new Float32Array(BN * 3);
          this._shimColors = new Float32Array(BN * 3);
          for (var bi = 0; bi < BN; bi++) {
            var bTheta = Math.random() * 2 * Math.PI;
            var bPhi = (Math.random() - 0.5) * Math.PI;
            /* unit-sphere positions, will be scaled each tick */
            this._shimPos[bi*3  ] = Math.cos(bTheta) * Math.cos(bPhi);
            this._shimPos[bi*3+1] = Math.sin(bPhi);
            this._shimPos[bi*3+2] = Math.sin(bTheta) * Math.cos(bPhi);
            var t = Math.random();
            /* purple → rose-gold gradient */
            var col = new THREE.Color().setHSL(0.78 - t * 0.22, 1.0, 0.55);
            this._shimColors[bi*3  ] = col.r;
            this._shimColors[bi*3+1] = col.g;
            this._shimColors[bi*3+2] = col.b;
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(this._shimPos.slice(), 3));
          sGeo.setAttribute("color", new THREE.BufferAttribute(this._shimColors, 3));
          this._shimMat = new THREE.PointsMaterial({
            vertexColors: true, size: 2.5, transparent: true, opacity: 0.50,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._shimmer = new THREE.Points(sGeo, this._shimMat);
          this._root.add(this._shimmer);

          this._vbTime = 0;
          this._GROW_PERIOD = 25.0;
          this._R_MIN = 120;
          this._R_MAX = 250;
          console.log("[void-bubble] expanding at (-600,200,-900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._vbTime += dt;

          /* ── scale up shells ── */
          var prog = (this._vbTime % this._GROW_PERIOD) / this._GROW_PERIOD;
          var r = this._R_MIN + prog * (this._R_MAX - this._R_MIN);
          this._outerShell.scale.set(r, r, r);
          this._innerShell.scale.set(r * 0.88, r * 0.88, r * 0.88);

          /* ── shimmer opacity breathes ── */
          this._shimMat.opacity = 0.30 + 0.35 * Math.abs(Math.sin(this._vbTime * 0.7));

          /* ── update shimmer particle positions to surface of current radius ── */
          var posArr = this._shimmer.geometry.attributes.position.array;
          for (var bi = 0; bi < 500; bi++) {
            var noise = r * (0.97 + 0.06 * Math.sin(this._vbTime * 2 + bi * 0.15));
            posArr[bi*3  ] = this._shimPos[bi*3  ] * noise;
            posArr[bi*3+1] = this._shimPos[bi*3+1] * noise;
            posArr[bi*3+2] = this._shimPos[bi*3+2] * noise;
          }
          this._shimmer.geometry.attributes.position.needsUpdate = true;

          /* ── slow rotation ── */
          this._root.rotation.y += 0.005 * dt;
          this._root.rotation.x += 0.002 * dt;
        },
      });

      /* ====================================================================
         PLASMA VORTEX — a magnetised column of helical plasma streaming
         upward like a cosmic tornado made of fire and lightning.
         Position: (-200, -600, 300).
         Components:
           - Helical ribbon: 3 spiral arms, each 500 particles, tracing a
               double-helix ascending 500 units, colours: hot white core →
               electric blue outer → fading violet edges
           - Rotating column: entire Group spins around Y axis
           - Expanding sheath: cone of particles widening as they rise
           - Lightning nodes: 20 bright nodes (larger particles) periodically
               flickering at quasi-random positions along the column
           - Core spine: thin bright-white Line along the vortex axis
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("plasma-vortex", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-200, -600, 300);
          scene.add(this._root);

          /* ── helical spiral arms (3 arms × 500 particles) ── */
          this._arms = [];
          var ARMS = 3;
          var PTS_PER_ARM = 500;
          var HEIGHT = 500;
          var TURNS = 5;
          for (var arm = 0; arm < ARMS; arm++) {
            var phaseOffset = (arm / ARMS) * 2 * Math.PI;
            var pts = new Float32Array(PTS_PER_ARM * 3);
            for (var pi = 0; pi < PTS_PER_ARM; pi++) {
              var t = pi / (PTS_PER_ARM - 1);
              var y = -HEIGHT * 0.5 + t * HEIGHT;
              var radius = 8 + t * 55; /* widens as it rises */
              var angle = phaseOffset + t * TURNS * 2 * Math.PI;
              var noise = (Math.random() - 0.5) * 8;
              pts[pi*3  ] = radius * Math.cos(angle) + noise;
              pts[pi*3+1] = y;
              pts[pi*3+2] = radius * Math.sin(angle) + noise;
            }
            var geo = new THREE.BufferGeometry();
            geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
            /* colour gradient: white core arm 0, blue arm 1, violet arm 2 */
            var baseHue = [0.06, 0.60, 0.75][arm];
            var mat = new THREE.PointsMaterial({
              color: new THREE.Color().setHSL(baseHue, 1.0, 0.70),
              size: arm === 0 ? 3.0 : 2.2,
              transparent: true, opacity: arm === 0 ? 0.80 : 0.55,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var pts3D = new THREE.Points(geo, mat);
            this._root.add(pts3D);
            this._arms.push({ mesh: pts3D, mat: mat, phaseOffset: phaseOffset });
          }

          /* ── lightning nodes (20 bright nodes) ── */
          var LN = 20;
          var lPts = new Float32Array(LN * 3);
          for (var li = 0; li < LN; li++) {
            var lt = li / (LN - 1);
            var lY = -HEIGHT * 0.5 + lt * HEIGHT;
            var lR = 8 + lt * 55;
            var lA = Math.random() * 2 * Math.PI;
            lPts[li*3  ] = lR * Math.cos(lA);
            lPts[li*3+1] = lY;
            lPts[li*3+2] = lR * Math.sin(lA);
          }
          var lGeo = new THREE.BufferGeometry();
          lGeo.setAttribute("position", new THREE.BufferAttribute(lPts, 3));
          this._lightningMat = new THREE.PointsMaterial({
            color: 0xffffff, size: 7.0, transparent: true, opacity: 0.0,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._lightningNodes = new THREE.Points(lGeo, this._lightningMat);
          this._root.add(this._lightningNodes);

          /* ── core spine (line along Y axis) ── */
          var spinePts = [
            new THREE.Vector3(0, -HEIGHT * 0.5, 0),
            new THREE.Vector3(0,  HEIGHT * 0.5, 0),
          ];
          var spineGeo = new THREE.BufferGeometry().setFromPoints(spinePts);
          this._root.add(new THREE.Line(spineGeo, new THREE.LineBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0.55,
          })));

          this._pvTime = 0;
          console.log("[plasma-vortex] spinning at (-200,-600,300) arms=" + ARMS);
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._pvTime += dt;

          /* ── rotate the entire vortex ── */
          this._root.rotation.y += 0.55 * dt;

          /* ── lightning nodes flicker ── */
          var lFlicker = Math.abs(Math.sin(this._pvTime * 7.3 + 0.5));
          this._lightningMat.opacity = lFlicker * lFlicker * 0.90;

          /* ── arm opacity breathe ── */
          for (var ai = 0; ai < this._arms.length; ai++) {
            var breathe = 0.55 + 0.25 * Math.sin(this._pvTime * 1.8 + ai * 2.1);
            this._arms[ai].mat.opacity = (ai === 0 ? 0.80 : 0.55) * breathe;
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 18 injected! Lines:', lineCount);
