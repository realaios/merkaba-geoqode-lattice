'use strict';
// inject-w19.cjs — Wave 19: solar-prominence + cosmic-tsunami
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("solar-prominence"')) {
  console.log('Wave 19 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity plasma-vortex></a-entity>';
const HTML_INSERT = `      <a-entity plasma-vortex></a-entity>
      <!-- ── SOLAR PROMINENCE — vast arch of magnetised plasma above a star ── -->
      <a-entity solar-prominence></a-entity>
      <!-- ── COSMIC TSUNAMI — shock wavefront rolling through the filament web ── -->
      <a-entity cosmic-tsunami></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         SOLAR PROMINENCE — a towering arch of magnetised plasma erupting from
         a star's chromosphere. Bright orange-red arch, rising 300 units high.
         Position: (900, -300, 100).
         Components:
           - Star body: SphereGeometry r=70, yellow-white emissive surface
           - Arch ribbon: 300 particles tracing a parabolic arc, orange→white
           - Arch glow: wider dimmer ribbon (60 extra particles per side)
           - Drizzle: 80 particles slowly falling back to the star surface
           - Slow rotation around Y axis
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("solar-prominence", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(900, -300, 100);
          scene.add(this._root);

          /* ── star body ── */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(70, 16, 12),
            new THREE.MeshBasicMaterial({ color: 0xffee88, transparent: true, opacity: 0.92 })
          ));

          /* ── prominence arch particles ── */
          var AN = 300;
          var archPts = new Float32Array(AN * 3);
          for (var ai = 0; ai < AN; ai++) {
            var t = ai / (AN - 1);
            /* parabolic arch: x from -120 to 120, y = 300*4t(1-t), z noise */
            var x = -120 + t * 240;
            var y = 70 + 300 * 4 * t * (1 - t);
            var z = (Math.random() - 0.5) * 18;
            archPts[ai*3  ] = x;
            archPts[ai*3+1] = y;
            archPts[ai*3+2] = z;
          }
          var aGeo = new THREE.BufferGeometry();
          aGeo.setAttribute("position", new THREE.BufferAttribute(archPts, 3));
          this._archMat = new THREE.PointsMaterial({
            color: 0xff6600, size: 4.5, transparent: true, opacity: 0.85,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._arch = new THREE.Points(aGeo, this._archMat);
          this._root.add(this._arch);

          /* ── glow halo (wider arch) ── */
          var GN = 160;
          var glowPts = new Float32Array(GN * 3);
          for (var gi = 0; gi < GN; gi++) {
            var gt = gi / (GN - 1);
            var gx = -140 + gt * 280;
            var gy = 70 + 300 * 4 * gt * (1 - gt);
            var gz = (Math.random() - 0.5) * 40;
            glowPts[gi*3  ] = gx;
            glowPts[gi*3+1] = gy;
            glowPts[gi*3+2] = gz;
          }
          var gGeo = new THREE.BufferGeometry();
          gGeo.setAttribute("position", new THREE.BufferAttribute(glowPts, 3));
          this._root.add(new THREE.Points(gGeo, new THREE.PointsMaterial({
            color: 0xff3300, size: 7, transparent: true, opacity: 0.20,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── drizzle: 80 particles falling back ── */
          var DN = 80;
          this._drizzlePts = new Float32Array(DN * 3);
          this._drizzleVels = new Float32Array(DN);
          for (var di = 0; di < DN; di++) {
            var dt2 = Math.random();
            this._drizzlePts[di*3  ] = -120 + dt2 * 240;
            this._drizzlePts[di*3+1] = 70 + 300 * 4 * dt2 * (1 - dt2);
            this._drizzlePts[di*3+2] = (Math.random() - 0.5) * 10;
            this._drizzleVels[di] = 40 + Math.random() * 60;
          }
          var dGeo = new THREE.BufferGeometry();
          dGeo.setAttribute("position", new THREE.BufferAttribute(this._drizzlePts.slice(), 3));
          this._drizzleMat = new THREE.PointsMaterial({
            color: 0xffaa00, size: 3.0, transparent: true, opacity: 0.60,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._drizzle = new THREE.Points(dGeo, this._drizzleMat);
          this._root.add(this._drizzle);

          this._spTime = 0;
          console.log("[solar-prominence] erupting at (900,-300,100)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._spTime += dt;

          /* ── arch flickers ── */
          this._archMat.opacity = 0.70 + 0.20 * Math.sin(this._spTime * 3.1);

          /* ── drizzle falls back to star surface ── */
          var dPos = this._drizzle.geometry.attributes.position.array;
          for (var di = 0; di < 80; di++) {
            dPos[di*3+1] -= this._drizzleVels[di] * dt;
            if (dPos[di*3+1] < 70) {
              /* reset to arch */
              var dt2 = Math.random();
              dPos[di*3  ] = -120 + dt2 * 240;
              dPos[di*3+1] = 70 + 300 * 4 * dt2 * (1 - dt2);
              dPos[di*3+2] = (Math.random() - 0.5) * 10;
            }
          }
          this._drizzle.geometry.attributes.position.needsUpdate = true;

          /* ── slow rotation ── */
          this._root.rotation.y += 0.012 * dt;
        },
      });

      /* ====================================================================
         COSMIC TSUNAMI — a vast cylindrical shock wavefront rolling outward
         through the cosmic-web filaments, compressing gas into bright ridges.
         Position: (0, 500, -600).
         Components:
           - Ring wavefront: 3 concentric CylinderGeometry rings, expanding
               from r=50 to r=500 over 15s, then resetting.
             Colors shift cyan → white → violet as they expand.
           - Ridge particles: 600 particles densely clustered at wavefront radius
           - Trailing wake: dimmer, slightly wider zone of disturbed material
           - Expanding then fading opacity
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("cosmic-tsunami", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(0, 500, -600);
          scene.add(this._root);

          /* ── 3 expanding rings ── */
          this._rings = [];
          var RING_DEFS = [
            { offset: 0.0, col: 0x00ffee, opBase: 0.55, H: 80 },
            { offset: 0.5, col: 0xffffff, opBase: 0.35, H: 70 },
            { offset: 1.0, col: 0xaa66ff, opBase: 0.20, H: 60 },
          ];
          var PERIOD = 15.0;
          var R_MIN = 50;
          var R_MAX = 500;
          for (var ri = 0; ri < RING_DEFS.length; ri++) {
            var rd = RING_DEFS[ri];
            /* use EdgesGeometry of CylinderGeometry as open ring outline */
            var mat = new THREE.MeshBasicMaterial({
              color: rd.col, transparent: true, opacity: rd.opBase, wireframe: true,
              depthWrite: false,
            });
            var mesh = new THREE.Mesh(
              new THREE.CylinderGeometry(R_MIN, R_MIN, rd.H, 32, 1, true),
              mat
            );
            this._root.add(mesh);
            this._rings.push({ mesh: mesh, mat: mat, offset: rd.offset, opBase: rd.opBase, H: rd.H });
          }

          /* ── ridge particles (600 at wavefront) ── */
          var RN = 600;
          this._ridgePts = new Float32Array(RN * 3);
          for (var pi = 0; pi < RN; pi++) {
            var angle = Math.random() * 2 * Math.PI;
            this._ridgePts[pi*3  ] = Math.cos(angle);
            this._ridgePts[pi*3+1] = (Math.random() - 0.5) * 60;
            this._ridgePts[pi*3+2] = Math.sin(angle);
          }
          var pGeo = new THREE.BufferGeometry();
          pGeo.setAttribute("position", new THREE.BufferAttribute(this._ridgePts.slice(), 3));
          this._ridgeMat = new THREE.PointsMaterial({
            color: 0x88ffff, size: 3.0, transparent: true, opacity: 0.75,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._ridgePoints = new THREE.Points(pGeo, this._ridgeMat);
          this._root.add(this._ridgePoints);

          this._ctTime = 0;
          this._PERIOD = PERIOD;
          this._R_MIN = R_MIN;
          this._R_MAX = R_MAX;
          console.log("[cosmic-tsunami] rolling out from (0,500,-600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._ctTime += dt;
          var T = this._PERIOD;

          /* ── update each ring ── */
          for (var ri = 0; ri < this._rings.length; ri++) {
            var r = this._rings[ri];
            var phase = ((this._ctTime / T) + r.offset) % 1.0;
            var radius = this._R_MIN + phase * (this._R_MAX - this._R_MIN);
            /* envelope: fade in first 10%, full 10-70%, fade out 70-100% */
            var op;
            if (phase < 0.10) op = (phase / 0.10) * r.opBase;
            else if (phase < 0.70) op = r.opBase;
            else op = r.opBase * (1 - (phase - 0.70) / 0.30);
            /* rebuild ring at new radius (cheap: just scale x/z) */
            r.mesh.scale.set(radius / this._R_MIN, 1, radius / this._R_MIN);
            r.mat.opacity = op;
          }

          /* ── ridge particles track primary ring ── */
          var primaryPhase = (this._ctTime / T) % 1.0;
          var rRadius = this._R_MIN + primaryPhase * (this._R_MAX - this._R_MIN);
          var posArr = this._ridgePoints.geometry.attributes.position.array;
          for (var pi = 0; pi < 600; pi++) {
            /* unit circle at index, scaled to rRadius + small noise */
            var noisy = rRadius + (Math.random() - 0.5) * 18;
            posArr[pi*3  ] = this._ridgePts[pi*3  ] * noisy;
            posArr[pi*3+2] = this._ridgePts[pi*3+2] * noisy;
          }
          this._ridgePoints.geometry.attributes.position.needsUpdate = true;
          this._ridgeMat.opacity = 0.40 + 0.40 * Math.sin(this._ctTime * 2.5);

          /* ── slow tilt ── */
          this._root.rotation.z += 0.006 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 19 injected! Lines:', lineCount);
