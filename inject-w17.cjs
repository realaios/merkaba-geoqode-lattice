"use strict";
// inject-w17.cjs — Wave 17: warp-tunnel + cosmic-heartbeat
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

// Idempotency check
if (html.includes('AFRAME.registerComponent("warp-tunnel"')) {
  console.log("Wave 17 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities (inject after magnetar-flare entity) ───────────────────
const HTML_ANCHOR = "      <a-entity magnetar-flare></a-entity>";
const HTML_INSERT = `      <a-entity magnetar-flare></a-entity>
      <!-- ── WARP TUNNEL — hyperspace vortex corridor through folded space ── -->
      <a-entity warp-tunnel></a-entity>
      <!-- ── COSMIC HEARTBEAT — universe-scale pressure wave, pulsing void ── -->
      <a-entity cosmic-heartbeat></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components (inject before asteroid-belt) ──────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         WARP TUNNEL — hyperspace vortex corridor through folded spacetime.
         Position: (200, -400, 800). A 12-sided tube with streaking stars
         that appear to rush toward the viewer, giving the illusion of FTL travel.
         Components:
           - Outer tunnel rings: 40 CylinderGeometry rings, radius 80, depth 12,
               12 sides, no caps, fade-lit from indigo to cyan down the tunnel
           - Streak particles: 800 Points positioned along the tunnel axis,
               elongated in Z, offset each tick to simulate motion
           - Central corridor glow: translucent gradient cylinder core
           - Ring rotation: each ring rotates slightly faster than the last
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("warp-tunnel", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(200, -400, 800);
          scene.add(this._root);

          /* ── tunnel rings (40 hoops along Z) ── */
          this._rings = [];
          var RING_COUNT = 40;
          var RING_RADIUS = 80;
          var RING_TUBE = 3;
          var TUNNEL_DEPTH = 800;
          for (var ri = 0; ri < RING_COUNT; ri++) {
            var t = ri / (RING_COUNT - 1);
            var r = (RING_COUNT - 1) - ri; /* invert so closest ring at ri=0 */
            var zPos = -TUNNEL_DEPTH * 0.5 + t * TUNNEL_DEPTH;
            /* colour: indigo(ri=0) → cyan(ri=max) */
            var col = new THREE.Color().setHSL(0.72 - t * 0.22, 1.0, 0.5);
            var mat = new THREE.MeshBasicMaterial({
              color: col, transparent: true,
              opacity: 0.30 + t * 0.25, depthWrite: false, side: THREE.BackSide,
            });
            var mesh = new THREE.Mesh(
              new THREE.TorusGeometry(RING_RADIUS, RING_TUBE, 6, 12),
              mat
            );
            mesh.rotation.x = Math.PI / 2;
            mesh.position.z = zPos;
            this._root.add(mesh);
            this._rings.push({ mesh: mesh, baseZ: zPos, speed: 0.04 + t * 0.06 });
          }

          /* ── streak particles (800 points, elongated appearance) ── */
          var SN = 800;
          var sPts = new Float32Array(SN * 3);
          this._streakVels = new Float32Array(SN);
          for (var si = 0; si < SN; si++) {
            var sTheta = Math.random() * 2 * Math.PI;
            var sR = 12 + Math.random() * 60;
            sPts[si*3  ] = sR * Math.cos(sTheta);
            sPts[si*3+1] = sR * Math.sin(sTheta);
            sPts[si*3+2] = (Math.random() - 0.5) * TUNNEL_DEPTH;
            this._streakVels[si] = 180 + Math.random() * 220;
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(sPts, 3));
          this._streakMat = new THREE.PointsMaterial({
            color: 0x88ddff, size: 2.8, transparent: true, opacity: 0.70,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._streaks = new THREE.Points(sGeo, this._streakMat);
          this._root.add(this._streaks);
          this._streakPos = sPts;
          this._TUNNEL_DEPTH = TUNNEL_DEPTH;

          /* ── central glow spine ── */
          var spineGeo = new THREE.CylinderGeometry(6, 6, TUNNEL_DEPTH, 8, 1, true);
          var spineMat = new THREE.MeshBasicMaterial({
            color: 0x00ccff, transparent: true, opacity: 0.10,
            depthWrite: false, side: THREE.BackSide,
          });
          var spine = new THREE.Mesh(spineGeo, spineMat);
          spine.rotation.x = Math.PI / 2;
          this._root.add(spine);

          this._wtTime = 0;
          console.log("[warp-tunnel] active at (200,-400,800) — " + RING_COUNT + " rings");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._wtTime += dt;

          /* ── streak particles rush toward viewer (−Z) ── */
          var posArr = this._streaks.geometry.attributes.position.array;
          var half = this._TUNNEL_DEPTH * 0.5;
          for (var si = 0; si < 800; si++) {
            posArr[si*3+2] -= this._streakVels[si] * dt;
            if (posArr[si*3+2] < -half) posArr[si*3+2] += this._TUNNEL_DEPTH;
          }
          this._streaks.geometry.attributes.position.needsUpdate = true;

          /* ── rings rotate around Z axis ── */
          for (var ri = 0; ri < this._rings.length; ri++) {
            this._rings[ri].mesh.rotation.z += this._rings[ri].speed * dt;
          }

          /* ── slowly orbit the tunnel root ── */
          this._root.rotation.z += 0.008 * dt;
        },
      });

      /* ====================================================================
         COSMIC HEARTBEAT — universe-scale pressure wave emanating from the
         void, visible as an expanding transparent sphere that pulses like
         a heartbeat: fast systole, slow diastole.
         Position: (-400, 0, -400). Radius oscillates 50→650 over 4s.
         Components:
           - Primary wave sphere: SphereGeometry r=1 (scaled dynamically),
               blue-violet wireframe effect via WireframeGeometry
           - Secondary echo sphere: 0.8s delayed, dimmer, larger peak
           - Particle corona: 200 fixed particles at r~400, brighten on beat
           - Soft ambient glow center: small emissive core
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("cosmic-heartbeat", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-400, 0, -400);
          scene.add(this._root);

          /* ── primary wave (wireframe sphere) ── */
          var baseGeo = new THREE.SphereGeometry(1, 16, 12);
          var wfGeo = new THREE.WireframeGeometry(baseGeo);
          this._primaryMat = new THREE.LineBasicMaterial({
            color: 0x7755ff, transparent: true, opacity: 0.0,
          });
          this._primaryWave = new THREE.LineSegments(wfGeo, this._primaryMat);
          this._root.add(this._primaryWave);

          /* ── secondary echo ── */
          var echoGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(1, 12, 10));
          this._echoMat = new THREE.LineBasicMaterial({
            color: 0x4433ff, transparent: true, opacity: 0.0,
          });
          this._echoWave = new THREE.LineSegments(echoGeo, this._echoMat);
          this._root.add(this._echoWave);

          /* ── particle corona (200 fixed stars) ── */
          var CN = 200;
          var cPts = new Float32Array(CN * 3);
          for (var ci = 0; ci < CN; ci++) {
            var cTheta = Math.random() * 2 * Math.PI;
            var cPhi = (Math.random() - 0.5) * Math.PI;
            var cR = 340 + Math.random() * 80;
            cPts[ci*3  ] = cR * Math.cos(cTheta) * Math.cos(cPhi);
            cPts[ci*3+1] = cR * Math.sin(cPhi);
            cPts[ci*3+2] = cR * Math.sin(cTheta) * Math.cos(cPhi);
          }
          var cGeo = new THREE.BufferGeometry();
          cGeo.setAttribute("position", new THREE.BufferAttribute(cPts, 3));
          this._coronaMat = new THREE.PointsMaterial({
            color: 0xaa88ff, size: 3.5, transparent: true, opacity: 0.20,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(cGeo, this._coronaMat));

          /* ── soft center core ── */
          this._core = new THREE.Mesh(
            new THREE.SphereGeometry(18, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0x5533cc, transparent: true, opacity: 0.35, depthWrite: false })
          );
          this._root.add(this._core);

          this._cbTime = 0;
          this._BEAT = 4.0; /* heartbeat period seconds */
          console.log("[cosmic-heartbeat] beating at (-400,0,-400) period=" + this._BEAT + "s");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cbTime += dt;
          var T = this._BEAT;

          /* heartbeat envelope: fast systole (0-15%), long diastole (15-100%) */
          var phase = (this._cbTime % T) / T;
          var beat;
          if (phase < 0.15) {
            beat = phase / 0.15; /* 0→1 fast */
          } else {
            beat = 1.0 - (phase - 0.15) / 0.85; /* 1→0 slow */
          }

          /* ── primary wave: scale 50→650 ── */
          var pScale = 50 + beat * 600;
          this._primaryWave.scale.set(pScale, pScale, pScale);
          this._primaryMat.opacity = beat < 0.05 ? (beat / 0.05) * 0.50 : 0.50 * (1 - (beat - 0.05) / 0.95);

          /* ── echo wave: 0.8s delayed ── */
          var ePhase = ((this._cbTime - 0.8) % T) / T;
          if (ePhase < 0) ePhase += 1.0;
          var eBeat = ePhase < 0.15 ? ePhase / 0.15 : 1.0 - (ePhase - 0.15) / 0.85;
          var eScale = 50 + eBeat * 600;
          this._echoWave.scale.set(eScale, eScale, eScale);
          this._echoMat.opacity = (eBeat < 0.05 ? (eBeat / 0.05) * 0.25 : 0.25 * (1 - (eBeat - 0.05) / 0.95));

          /* ── corona brightens at peak beat ── */
          this._coronaMat.opacity = 0.20 + beat * 0.55;

          /* ── core pulses ── */
          this._core.material.opacity = 0.25 + beat * 0.45;

          /* ── very slow rotation ── */
          this._root.rotation.y += 0.004 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 17 injected! Lines:", lineCount);
