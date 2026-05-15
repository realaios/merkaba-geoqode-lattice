"use strict";
// inject-w21.cjs — Wave 21: baryonic-acoustic-oscillation + reionization-front
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("baryonic-acoustic-oscillation"')) {
  console.log("Wave 21 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity dark-flow></a-entity>";
const HTML_INSERT = `      <a-entity dark-flow></a-entity>
      <!-- ── BARYONIC ACOUSTIC OSCILLATION — spherical shell of over-density ── -->
      <a-entity baryonic-acoustic-oscillation></a-entity>
      <!-- ── REIONIZATION FRONT — wall of first UV starlight ionising the fog ── -->
      <a-entity reionization-front></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         BARYONIC ACOUSTIC OSCILLATION (BAO) — the spherical sound-wave imprint
         left in the baryon distribution 380,000 years after the Big Bang.
         Visualised as a hollow concentric shell of enhanced galaxy density.
         Position: (-300, -500, -700).
         Components:
           - 3 concentric wireframe SphereGeometry shells (r=200, 220, 240)
             faintly glowing with different blues — slow Y rotation
           - 800 galaxy-cluster points arranged on a spherical shell surface
             with Gaussian density peaking at r=220
           - Central void: dim SphereGeometry to emphasize the underdense interior
           - Slow oscillation: shells breathe ±5% in 20s period
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("baryonic-acoustic-oscillation", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-300, -500, -700);
          scene.add(this._root);

          /* ── concentric wireframe shells ── */
          var shellDefs = [
            { r: 200, col: 0x334488, op: 0.25 },
            { r: 220, col: 0x5577cc, op: 0.35 },
            { r: 240, col: 0x7799ff, op: 0.20 },
          ];
          this._shells = [];
          for (var si = 0; si < shellDefs.length; si++) {
            var sd = shellDefs[si];
            var mat = new THREE.MeshBasicMaterial({
              color: sd.col, transparent: true, opacity: sd.op, wireframe: true, depthWrite: false,
            });
            var mesh = new THREE.Mesh(new THREE.SphereGeometry(sd.r, 24, 16), mat);
            this._root.add(mesh);
            this._shells.push({ mesh: mesh, mat: mat, r0: sd.r, op0: sd.op });
          }

          /* ── galaxy cluster points on spherical shell ── */
          var GN = 800;
          var gPts = new Float32Array(GN * 3);
          for (var gi = 0; gi < GN; gi++) {
            /* Gaussian shell: pick r from normal near 220, sigma=20 */
            var rr = 220 + (Math.random() + Math.random() + Math.random() - 1.5) * 20;
            var phi = Math.acos(2 * Math.random() - 1);
            var theta = Math.random() * 2 * Math.PI;
            gPts[gi*3  ] = rr * Math.sin(phi) * Math.cos(theta);
            gPts[gi*3+1] = rr * Math.cos(phi);
            gPts[gi*3+2] = rr * Math.sin(phi) * Math.sin(theta);
          }
          var gGeo = new THREE.BufferGeometry();
          gGeo.setAttribute("position", new THREE.BufferAttribute(gPts, 3));
          this._root.add(new THREE.Points(gGeo, new THREE.PointsMaterial({
            color: 0xaabbff, size: 2.5, transparent: true, opacity: 0.50,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── central void ── */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(190, 12, 8),
            new THREE.MeshBasicMaterial({
              color: 0x0a0a1a, transparent: true, opacity: 0.40, depthWrite: false,
            })
          ));

          this._baoTime = 0;
          this._PERIOD = 20.0;
          console.log("[baryonic-acoustic-oscillation] sounding at (-300,-500,-700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._baoTime += dt;

          var breathe = 1.0 + 0.05 * Math.sin(2 * Math.PI * this._baoTime / this._PERIOD);
          for (var si = 0; si < this._shells.length; si++) {
            this._shells[si].mesh.scale.setScalar(breathe);
            /* flicker opacity */
            this._shells[si].mat.opacity = this._shells[si].op0 * (0.85 + 0.20 * Math.sin(this._baoTime * 1.3 + si));
          }

          this._root.rotation.y += 0.003 * dt;
          this._root.rotation.x += 0.001 * dt;
        },
      });

      /* ====================================================================
         REIONIZATION FRONT — a vast moving wall representing the epoch of
         reionization: the first stars' UV light burning through the hydrogen fog,
         gradually turning the opaque universe transparent.
         Position: (0, -200, 800).
         Components:
           - Dense fog slab BEHIND the wall: 1000 dim red-brown points (neutral H)
           - The wavefront itself: PlaneGeometry 700x500, translucent hot blue-white
             with a moving shimmer scroll-up effect (UV = texture coord animation)
           - Ionised region IN FRONT: 500 brighter blue points (plasma)
           - Small bright star blobs scattered in ionised region (sources)
           - Wall advances slowly along -Z over 60s then resets
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("reionization-front", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(0, -200, 800);
          scene.add(this._root);

          /* ── neutral fog (behind wall, +Z side) ── */
          var FN = 1000;
          var fogPts = new Float32Array(FN * 3);
          for (var fi = 0; fi < FN; fi++) {
            fogPts[fi*3  ] = (Math.random() - 0.5) * 700;
            fogPts[fi*3+1] = (Math.random() - 0.5) * 500;
            fogPts[fi*3+2] = Math.random() * 350; /* behind the wall, +Z */
          }
          var fGeo = new THREE.BufferGeometry();
          fGeo.setAttribute("position", new THREE.BufferAttribute(fogPts, 3));
          this._fogMat = new THREE.PointsMaterial({
            color: 0x884422, size: 2.0, transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._fogCloud = new THREE.Points(fGeo, this._fogMat);
          this._root.add(this._fogCloud);

          /* ── wavefront plane ── */
          var wMat = new THREE.MeshBasicMaterial({
            color: 0x88ccff, transparent: true, opacity: 0.22,
            side: THREE.DoubleSide, depthWrite: false,
          });
          this._wall = new THREE.Mesh(new THREE.PlaneGeometry(700, 500), wMat);
          this._wall.rotation.y = Math.PI / 2;
          this._root.add(this._wall);
          this._wallMat = wMat;

          /* ── ionised plasma in front (-Z) ── */
          var PN = 500;
          var plasmaPts = new Float32Array(PN * 3);
          for (var pi = 0; pi < PN; pi++) {
            plasmaPts[pi*3  ] = (Math.random() - 0.5) * 700;
            plasmaPts[pi*3+1] = (Math.random() - 0.5) * 500;
            plasmaPts[pi*3+2] = -(Math.random() * 300); /* in front, -Z */
          }
          var pGeo = new THREE.BufferGeometry();
          pGeo.setAttribute("position", new THREE.BufferAttribute(plasmaPts, 3));
          this._plasmaMat = new THREE.PointsMaterial({
            color: 0x44aaff, size: 1.8, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(pGeo, this._plasmaMat));

          /* ── star sources ── */
          for (var sti = 0; sti < 12; sti++) {
            var star = new THREE.Mesh(
              new THREE.SphereGeometry(4 + Math.random() * 6, 6, 5),
              new THREE.MeshBasicMaterial({
                color: 0xeeeeff, transparent: true, opacity: 0.60, depthWrite: false,
              })
            );
            star.position.set(
              (Math.random() - 0.5) * 600,
              (Math.random() - 0.5) * 400,
              -(20 + Math.random() * 250)
            );
            this._root.add(star);
          }

          this._rfTime = 0;
          this._ADVANCE_PERIOD = 60.0; /* wall moves -Z over 60s then resets */
          this._MAX_ADVANCE = 600;
          this._wallZ = 0;
          console.log("[reionization-front] illuminating at (0,-200,800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._rfTime += dt;

          /* ── wall advances toward viewer (-Z) ── */
          var cycle = (this._rfTime % this._ADVANCE_PERIOD) / this._ADVANCE_PERIOD;
          this._wallZ = -(cycle * this._MAX_ADVANCE);
          this._wall.position.z = this._wallZ;

          /* ── shimmer the wall ── */
          this._wallMat.opacity = 0.15 + 0.12 * Math.sin(this._rfTime * 4.0);

          /* ── fog dims as wall passes ── */
          this._fogMat.opacity = 0.25 * (1 - cycle * 0.7);

          /* ── plasma brightens behind advancing wall ── */
          this._plasmaMat.opacity = 0.20 + 0.18 * cycle;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 21 injected! Lines:", lineCount);
