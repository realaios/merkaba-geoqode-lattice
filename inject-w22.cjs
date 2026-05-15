"use strict";
// inject-w22.cjs — Wave 22: magnetar-glitch + cosmic-dawn-glow
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("magnetar-glitch"')) {
  console.log("Wave 22 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity reionization-front></a-entity>";
const HTML_INSERT = `      <a-entity reionization-front></a-entity>
      <!-- ── MAGNETAR GLITCH — sudden spin-up with giant X-ray flare burst ── -->
      <a-entity magnetar-glitch></a-entity>
      <!-- ── COSMIC DAWN GLOW — warm haze of first star formation ── -->
      <a-entity cosmic-dawn-glow></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         MAGNETAR GLITCH — a magnetar (ultra-strong-field neutron star) undergoes
         a "glitch": its crust cracks and it suddenly spins up, unleashing a
         giant X-ray / gamma-ray flare visible across the galaxy.
         Position: (600, 600, 300).
         Cycle: 18s slow spin → 0.3s sudden glitch flash → 3s X-ray burst ring
                → 14.7s return to normal → repeat.
         Components:
           - Magnetar body: small dense sphere (r=12), dim blue-white
           - Spin indicator: WireframeGeometry torus spinning fast, slows mid-cycle
           - Glitch flash: SphereGeometry expanding 0→350 in 0.3s then fading
           - X-ray burst ring: expanding CylinderGeometry ring (like a supernova remnant)
             shot out perpendicular to spin axis, 600 particles on wavefront
           - Magnetic field lines: 8 arcs of 60 pts each from pole to pole
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("magnetar-glitch", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(600, 600, 300);
          scene.add(this._root);

          /* ── magnetar body ── */
          this._body = new THREE.Mesh(
            new THREE.SphereGeometry(12, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0x99bbff })
          );
          this._root.add(this._body);

          /* ── equatorial torus ── */
          this._torus = new THREE.Mesh(
            new THREE.TorusGeometry(22, 3, 8, 24),
            new THREE.MeshBasicMaterial({
              color: 0x4488ff, wireframe: true, transparent: true, opacity: 0.50, depthWrite: false,
            })
          );
          this._root.add(this._torus);

          /* ── glitch flash sphere ── */
          this._flashMat = new THREE.MeshBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false,
          });
          this._flash = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), this._flashMat);
          this._root.add(this._flash);

          /* ── X-ray burst ring (particles on expanding cylinder) ── */
          var RN = 600;
          var rPts = new Float32Array(RN * 3);
          for (var ri = 0; ri < RN; ri++) {
            var angle = Math.random() * 2 * Math.PI;
            rPts[ri*3  ] = Math.cos(angle);
            rPts[ri*3+1] = (Math.random() - 0.5) * 40;
            rPts[ri*3+2] = Math.sin(angle);
          }
          var rGeo = new THREE.BufferGeometry();
          rGeo.setAttribute("position", new THREE.BufferAttribute(rPts, 3));
          this._ringMat = new THREE.PointsMaterial({
            color: 0x00ffcc, size: 3.0, transparent: true, opacity: 0.0,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._ring = new THREE.Points(rGeo, this._ringMat);
          this._root.add(this._ring);
          this._ringBase = rPts;

          /* ── magnetic field lines (8 arcs of 60 pts) ── */
          var fieldPts = new Float32Array(8 * 60 * 3);
          for (var ai = 0; ai < 8; ai++) {
            var aLon = (ai / 8) * 2 * Math.PI;
            for (var pi = 0; pi < 60; pi++) {
              var pLat = (pi / 59) * Math.PI; /* 0..PI pole to pole */
              var r0 = 30 * Math.sin(pLat);
              var fIdx = (ai * 60 + pi) * 3;
              fieldPts[fIdx  ] = r0 * Math.cos(aLon);
              fieldPts[fIdx+1] = 30 * Math.cos(pLat);
              fieldPts[fIdx+2] = r0 * Math.sin(aLon);
            }
          }
          var fGeo = new THREE.BufferGeometry();
          fGeo.setAttribute("position", new THREE.BufferAttribute(fieldPts, 3));
          this._root.add(new THREE.Points(fGeo, new THREE.PointsMaterial({
            color: 0x0066ff, size: 1.5, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._mgTime = 0;
          this._CYCLE = 18.0;
          this._GLITCH_START = 14.7;
          this._FLASH_END = 15.0;
          this._RING_END = 18.0;
          this._RING_R_MAX = 300;
          console.log("[magnetar-glitch] spinning at (600,600,300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._mgTime += dt;
          var t = this._mgTime % this._CYCLE;

          if (t < this._GLITCH_START) {
            /* ── slow normal spin ── */
            var omega = 0.8;
            this._torus.rotation.x += omega * dt;
            this._body.rotation.y += omega * dt;
            this._flashMat.opacity = 0;
            this._ringMat.opacity = 0;

          } else if (t < this._FLASH_END) {
            /* ── glitch flash (0.3s) ── */
            var fp = (t - this._GLITCH_START) / (this._FLASH_END - this._GLITCH_START);
            /* sudden spin-up */
            this._torus.rotation.x += 8.0 * dt;
            this._flash.scale.setScalar(fp < 0.5 ? fp * 700 : (1 - fp) * 700);
            this._flashMat.opacity = fp < 0.5 ? fp * 2 : (1 - fp) * 2;
            this._ringMat.opacity = 0;

          } else {
            /* ── X-ray burst ring expanding ── */
            var rp = (t - this._FLASH_END) / (this._RING_END - this._FLASH_END);
            var radius = 8 + rp * this._RING_R_MAX;
            var posArr = this._ring.geometry.attributes.position.array;
            for (var ri = 0; ri < 600; ri++) {
              var noisy = radius + (Math.random() - 0.5) * 15;
              posArr[ri*3  ] = this._ringBase[ri*3  ] * noisy;
              posArr[ri*3+2] = this._ringBase[ri*3+2] * noisy;
            }
            this._ring.geometry.attributes.position.needsUpdate = true;
            this._ringMat.opacity = rp < 0.15 ? rp * 6 : Math.max(0, 1 - (rp - 0.15) / 0.85);
            this._flashMat.opacity = 0;
            this._torus.rotation.x += 2.5 * dt;
          }
        },
      });

      /* ====================================================================
         COSMIC DAWN GLOW — the warm, diffuse orange-red haze that permeated
         the universe during the epoch of the first stars (z~20-6), when blue
         UV light was absorbed and re-emitted as Lyman-alpha hydrogen glow.
         A large glowing cloud enveloping a zone of space, gradually brightening.
         Position: (-500, 100, 400).
         Components:
           - Outer envelope: large SphereGeometry r=400 wireframe, faint orange
           - Diffuse cloud: 1500 large dim orange-rose particles filling sphere
           - 20 "first star" bright specks inside the cloud
           - Slow breathing and drift
           - Lyman-alpha shimmer: rapid flicker at 6-8Hz over the cloud
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("cosmic-dawn-glow", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-500, 100, 400);
          scene.add(this._root);

          /* ── outer envelope sphere ── */
          this._envMat = new THREE.MeshBasicMaterial({
            color: 0xff8833, transparent: true, opacity: 0.06, wireframe: true, depthWrite: false,
          });
          this._env = new THREE.Mesh(new THREE.SphereGeometry(400, 16, 12), this._envMat);
          this._root.add(this._env);

          /* ── diffuse cloud particles (1500) ── */
          var CN = 1500;
          var cPts = new Float32Array(CN * 3);
          for (var ci = 0; ci < CN; ci++) {
            var r = Math.random() * 380;
            var phi = Math.acos(2 * Math.random() - 1);
            var theta = Math.random() * 2 * Math.PI;
            cPts[ci*3  ] = r * Math.sin(phi) * Math.cos(theta);
            cPts[ci*3+1] = r * Math.cos(phi);
            cPts[ci*3+2] = r * Math.sin(phi) * Math.sin(theta);
          }
          var cGeo = new THREE.BufferGeometry();
          cGeo.setAttribute("position", new THREE.BufferAttribute(cPts, 3));
          this._cloudMat = new THREE.PointsMaterial({
            color: 0xff7722, size: 6.0, transparent: true, opacity: 0.14,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(cGeo, this._cloudMat));

          /* ── first stars (20 bright points) ── */
          for (var si = 0; si < 20; si++) {
            var r2 = Math.random() * 300;
            var phi2 = Math.acos(2 * Math.random() - 1);
            var theta2 = Math.random() * 2 * Math.PI;
            var star = new THREE.Mesh(
              new THREE.SphereGeometry(4 + Math.random() * 5, 5, 4),
              new THREE.MeshBasicMaterial({
                color: 0xffffff, transparent: true, opacity: 0.75, depthWrite: false,
              })
            );
            star.position.set(
              r2 * Math.sin(phi2) * Math.cos(theta2),
              r2 * Math.cos(phi2),
              r2 * Math.sin(phi2) * Math.sin(theta2)
            );
            this._root.add(star);
          }

          this._cdTime = 0;
          console.log("[cosmic-dawn-glow] glowing at (-500,100,400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cdTime += dt;

          /* ── slow scale breathing ── */
          var breathe = 1.0 + 0.04 * Math.sin(this._cdTime * 0.4);
          this._env.scale.setScalar(breathe);

          /* ── Lyman-alpha shimmer flicker ── */
          this._cloudMat.opacity = 0.10 + 0.07 * Math.abs(Math.sin(this._cdTime * 7.2));
          this._envMat.opacity = 0.04 + 0.03 * Math.sin(this._cdTime * 0.7);

          /* ── slow rotation ── */
          this._root.rotation.y += 0.007 * dt;
          this._root.rotation.z += 0.003 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 22 injected! Lines:", lineCount);
