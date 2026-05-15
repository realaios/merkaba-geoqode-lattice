"use strict";
// inject-w23.cjs — Wave 23: dark-matter-stream + cosmic-filament-bridge
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("dark-matter-stream"')) {
  console.log("Wave 23 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity cosmic-dawn-glow></a-entity>";
const HTML_INSERT = `      <a-entity cosmic-dawn-glow></a-entity>
      <!-- ── DARK MATTER STREAM — invisible mass traced by lensed star trails ── -->
      <a-entity dark-matter-stream></a-entity>
      <!-- ── COSMIC FILAMENT BRIDGE — dark-matter thread linking two galaxy clusters ── -->
      <a-entity cosmic-filament-bridge></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         DARK MATTER STREAM — the invisible river of dark matter flowing along
         a cosmic filament. Visualised by the lensed arcs of background stars
         whose light bends around the unseen mass.
         Position: (0, 400, 500).
         Components:
           - "Invisible" cylinder representing the dark mass (faint blue-grey
             wireframe, barely visible — it's dark matter!)
           - 1000 stream particles flowing along cylinder axis with scatter
           - 80 "gravitational lens arcs": short arc segments bent around the
             cylinder centre — each arc computed as circular arc in xz-plane
             at various heights, drawn as BufferGeometry line points
           - Occasional "caustic flash" points that brighten briefly
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("dark-matter-stream", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(0, 400, 500);
          scene.add(this._root);

          /* ── barely-visible dark matter cylinder ── */
          this._root.add(new THREE.Mesh(
            new THREE.CylinderGeometry(60, 60, 600, 16, 1, true),
            new THREE.MeshBasicMaterial({
              color: 0x223355, wireframe: true, transparent: true, opacity: 0.08, depthWrite: false,
            })
          ));

          /* ── stream flow particles (1000) ── */
          var SN = 1000;
          this._streamPts = new Float32Array(SN * 3);
          for (var si = 0; si < SN; si++) {
            var angle = Math.random() * 2 * Math.PI;
            var r = 20 + Math.random() * 55;
            this._streamPts[si*3  ] = r * Math.cos(angle);
            this._streamPts[si*3+1] = (Math.random() - 0.5) * 600;
            this._streamPts[si*3+2] = r * Math.sin(angle);
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(this._streamPts.slice(), 3));
          this._streamMat = new THREE.PointsMaterial({
            color: 0x4488aa, size: 1.5, transparent: true, opacity: 0.30,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._streamPoints = new THREE.Points(sGeo, this._streamMat);
          this._root.add(this._streamPoints);

          /* ── gravitational lens arcs (80 arcs × 20pts = 1600 pts) ── */
          var AN = 80, ARC_PTS = 20;
          var arcPos = new Float32Array(AN * ARC_PTS * 3);
          this._arcParams = [];
          for (var ai = 0; ai < AN; ai++) {
            var height = (Math.random() - 0.5) * 580;
            var dist = 65 + Math.random() * 150;
            var span = 0.3 + Math.random() * 0.6; /* arc span in radians */
            var startAngle = Math.random() * 2 * Math.PI;
            this._arcParams.push({ height: height, dist: dist, span: span, start: startAngle, base: ai * ARC_PTS * 3 });
            for (var pi = 0; pi < ARC_PTS; pi++) {
              var a = startAngle + span * (pi / (ARC_PTS - 1));
              var idx = (ai * ARC_PTS + pi) * 3;
              arcPos[idx  ] = dist * Math.cos(a);
              arcPos[idx+1] = height;
              arcPos[idx+2] = dist * Math.sin(a);
            }
          }
          var aGeo = new THREE.BufferGeometry();
          aGeo.setAttribute("position", new THREE.BufferAttribute(arcPos, 3));
          this._arcMat = new THREE.PointsMaterial({
            color: 0xffffff, size: 2.2, transparent: true, opacity: 0.40,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(aGeo, this._arcMat));

          this._dmTime = 0;
          this._SPEED = 80; /* units/sec flow speed */
          console.log("[dark-matter-stream] flowing at (0,400,500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._dmTime += dt;
          var posArr = this._streamPoints.geometry.attributes.position.array;
          var N = posArr.length / 3;
          for (var si = 0; si < N; si++) {
            posArr[si*3+1] += this._SPEED * dt;
            if (posArr[si*3+1] > 300) posArr[si*3+1] -= 600;
          }
          this._streamPoints.geometry.attributes.position.needsUpdate = true;

          /* ── caustic shimmer ── */
          this._arcMat.opacity = 0.30 + 0.20 * Math.abs(Math.sin(this._dmTime * 2.3));
          this._streamMat.opacity = 0.22 + 0.12 * Math.sin(this._dmTime * 1.1);

          this._root.rotation.y += 0.005 * dt;
        },
      });

      /* ====================================================================
         COSMIC FILAMENT BRIDGE — a single massive dark-matter thread connecting
         two galaxy cluster "nodes". Gas and galaxies trace the filament in
         a thin glowing ribbon of ionised plasma.
         Position: (-800, -300, 0).
         Components:
           - Node A: large galaxy cluster blob (r=70) at one end
           - Node B: another cluster blob (r=60) at other end (bridge = 600 long)
           - Filament spine: 2000 pts arranged in a slightly curved Bezier ribbon
           - Surrounding diffuse gas: 400 pts scattered around the spine (sigma=25)
           - Faint wireframe tubes at r=15 and r=30 around the spine centre line
           - Slow Y drift rotation, gentle breathing along filament width
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("cosmic-filament-bridge", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-800, -300, 0);
          scene.add(this._root);

          /* ── cluster nodes ── */
          var mkCluster = function (x, y, z, r, col) {
            var g = new THREE.Group();
            g.position.set(x, y, z);
            var N = 300;
            var pts = new Float32Array(N * 3);
            for (var i = 0; i < N; i++) {
              var rr = r * Math.cbrt(Math.random());
              var phi = Math.acos(2 * Math.random() - 1);
              var theta = Math.random() * 2 * Math.PI;
              pts[i*3  ] = rr * Math.sin(phi) * Math.cos(theta);
              pts[i*3+1] = rr * Math.cos(phi);
              pts[i*3+2] = rr * Math.sin(phi) * Math.sin(theta);
            }
            var geo = new THREE.BufferGeometry();
            geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
            g.add(new THREE.Points(geo, new THREE.PointsMaterial({
              color: col, size: 2.5, transparent: true, opacity: 0.45,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
            return g;
          };
          this._root.add(mkCluster(-300, 0, 0, 70, 0xffaa55));
          this._root.add(mkCluster( 300, 0, 0, 60, 0xff7733));

          /* ── filament spine (2000 pts on Bezier curve) ── */
          /* Control points: start (-300,0,0) mid (0,80,0) end (300,0,0) */
          var SPINE_N = 2000;
          var spinePts = new Float32Array(SPINE_N * 3);
          for (var si = 0; si < SPINE_N; si++) {
            var t = si / (SPINE_N - 1);
            var tm = 1 - t;
            /* quadratic Bezier */
            var bx = tm*tm*(-300) + 2*tm*t*0 + t*t*300;
            var by = tm*tm*0 + 2*tm*t*80 + t*t*0;
            var bz = 0;
            /* scatter within filament width (±15) */
            var scRad = 15 + (Math.random() + Math.random() - 1) * 10;
            var scAng = Math.random() * 2 * Math.PI;
            spinePts[si*3  ] = bx + scRad * Math.cos(scAng);
            spinePts[si*3+1] = by + scRad * Math.sin(scAng);
            spinePts[si*3+2] = bz + (Math.random() - 0.5) * 20;
          }
          var spGeo = new THREE.BufferGeometry();
          spGeo.setAttribute("position", new THREE.BufferAttribute(spinePts, 3));
          this._root.add(new THREE.Points(spGeo, new THREE.PointsMaterial({
            color: 0xff6600, size: 1.2, transparent: true, opacity: 0.30,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── diffuse gas cloud around spine (400 pts) ── */
          var GN = 400;
          var gasPts = new Float32Array(GN * 3);
          for (var gi = 0; gi < GN; gi++) {
            var tg = Math.random();
            var tm2 = 1 - tg;
            gasPts[gi*3  ] = tm2*tm2*(-300) + 2*tm2*tg*0 + tg*tg*300 + (Math.random()-0.5)*50;
            gasPts[gi*3+1] = tm2*tm2*0 + 2*tm2*tg*80 + tg*tg*0 + (Math.random()-0.5)*50;
            gasPts[gi*3+2] = (Math.random()-0.5)*60;
          }
          var gGeo = new THREE.BufferGeometry();
          gGeo.setAttribute("position", new THREE.BufferAttribute(gasPts, 3));
          this._root.add(new THREE.Points(gGeo, new THREE.PointsMaterial({
            color: 0xffcc88, size: 3.0, transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._cfTime = 0;
          console.log("[cosmic-filament-bridge] bridging at (-800,-300,0)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cfTime += dt;
          this._root.rotation.y += 0.004 * dt;
          this._root.rotation.z += 0.001 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 23 injected! Lines:", lineCount);
