"use strict";
// inject-w56.cjs — Wave 56: magnetar-giant-flare + intergalactic-bridge-filament
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("magnetar-giant-flare"')) {
  console.log("Wave 56 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity cosmic-reionization-bubble></a-entity>";
const HTML_INSERT = `      <a-entity cosmic-reionization-bubble></a-entity>
      <!-- ── MAGNETAR GIANT FLARE — soft-gamma repeater giant-flare burst ── -->
      <a-entity magnetar-giant-flare></a-entity>
      <!-- ── INTERGALACTIC BRIDGE FILAMENT — warm-hot gas bridge between galaxy clusters ── -->
      <a-entity intergalactic-bridge-filament></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         MAGNETAR GIANT FLARE — on 2004-12-27 SGR 1806-20 released more energy
         in 0.2 seconds than the Sun does in 250,000 years. The initial hard-spike
         was followed by an 8-min X-ray tail modulated at the 7.56-s spin period.
         A relativistic "fireball" plasmoid was ejected. We render the magnetar
         with a periodic hard spike, an expanding fireball, and a pulsating
         soft tail.
         Position: (-200, 350, 600).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("magnetar-giant-flare", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-200, 350, 600);
          scene.add(this._root);

          /* magnetar core */
          this._core = new THREE.Mesh(
            new THREE.SphereGeometry(4, 6, 5),
            new THREE.MeshBasicMaterial({
              color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._core);

          /* fireball — expanding sphere */
          this._fireball = new THREE.Mesh(
            new THREE.SphereGeometry(1, 8, 6),
            new THREE.MeshBasicMaterial({
              color: 0xff9900, transparent: true, opacity: 0.0,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._fireball);

          /* soft X-ray tail — elongated glow */
          this._tail = new THREE.Mesh(
            new THREE.SphereGeometry(30, 6, 5),
            new THREE.MeshBasicMaterial({
              color: 0xff5500, transparent: true, opacity: 0.0,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._tail.scale.set(1, 5, 1);
          this._root.add(this._tail);

          /* spin pulse rings */
          this._rings = [];
          for (var ri = 0; ri < 3; ri++) {
            var rm = new THREE.Mesh(
              new THREE.RingGeometry(5 + ri*6, 6 + ri*6, 32),
              new THREE.MeshBasicMaterial({
                color: 0xffaaaa, transparent: true, opacity: 0.0,
                blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
              })
            );
            rm.rotation.x = Math.PI/2;
            this._root.add(rm);
            this._rings.push(rm);
          }

          this._mgfPhase = 0;
          this._fbRadius = 1;
          this._mgfTime = 0;
          console.log("[magnetar-giant-flare] loaded at (-200,350,600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._mgfTime += dt;
          /* spin period 7.56s */
          this._mgfPhase += (2*Math.PI / 7.56) * dt;
          var pulse = Math.max(0, Math.pow(Math.cos(this._mgfPhase), 8));
          /* periodic hard spike */
          this._core.material.color.setHSL(0.1 - pulse*0.1, 1, 0.5 + pulse*0.5);
          for (var ri = 0; ri < this._rings.length; ri++) {
            this._rings[ri].material.opacity = pulse * (0.3 - ri*0.08);
          }
          /* expanding fireball — resets every ~20s */
          this._fbRadius += 4 * dt;
          if (this._fbRadius > 120) {
            this._fbRadius = 1;
            this._fireball.material.opacity = 0.6;
          }
          this._fireball.scale.setScalar(this._fbRadius);
          this._fireball.material.opacity = Math.max(0, this._fireball.material.opacity - 0.4*dt);
          /* soft tail breathes */
          this._tail.material.opacity = 0.06 + 0.05*Math.abs(Math.sin(this._mgfTime * 0.12));
        },
      });

      /* ====================================================================
         INTERGALACTIC BRIDGE FILAMENT — the WHIM (Warm-Hot Intergalactic Medium)
         makes up ~30-40% of all baryons, hiding in T=10^5-10^7 K filaments
         between galaxy clusters. Recent Sunyaev-Zeldovich detections confirmed
         bridges of warm gas (e.g. Abell 399-401 bridge, ~3 Mpc long). We render
         two galaxy clusters linked by a glowing warm-gas filament bridge with
         embedded sub-halos.
         Position: (600, 500, 900).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("intergalactic-bridge-filament", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(600, 500, 900);
          scene.add(this._root);

          /* Cluster A */
          var clA = new THREE.Mesh(
            new THREE.SphereGeometry(40, 7, 6),
            new THREE.MeshBasicMaterial({
              color: 0xffddaa, transparent: true, opacity: 0.25,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          clA.position.set(-280, 0, 0);
          this._root.add(clA);

          /* Cluster B */
          var clB = new THREE.Mesh(
            new THREE.SphereGeometry(50, 7, 6),
            new THREE.MeshBasicMaterial({
              color: 0xffddaa, transparent: true, opacity: 0.28,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          clB.position.set(280, 0, 0);
          this._root.add(clB);

          /* WHIM bridge — tube of particles */
          var BP = 200;
          var bPts = new Float32Array(BP * 3);
          for (var bi = 0; bi < BP; bi++) {
            var bt = bi/(BP-1);
            bPts[bi*3  ] = -280 + 560*bt + (Math.random()-0.5)*20;
            bPts[bi*3+1] = (Math.random()-0.5)*30;
            bPts[bi*3+2] = (Math.random()-0.5)*30;
          }
          var bGeo = new THREE.BufferGeometry();
          bGeo.setAttribute("position", new THREE.BufferAttribute(bPts, 3));
          this._bridge = new THREE.Points(bGeo, new THREE.PointsMaterial({
            color: 0x88ccff, size: 3,
            transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._bridge);

          /* spine line */
          var spPts = new Float32Array(2 * 3);
          spPts[0]=-280; spPts[1]=0; spPts[2]=0;
          spPts[3]=280;  spPts[4]=0; spPts[5]=0;
          var spGeo = new THREE.BufferGeometry();
          spGeo.setAttribute("position", new THREE.BufferAttribute(spPts, 3));
          this._spine = new THREE.Line(spGeo, new THREE.LineBasicMaterial({
            color: 0x6699cc, transparent: true, opacity: 0.08,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._spine);

          /* sub-halos */
          for (var sh = 0; sh < 5; sh++) {
            var shm = new THREE.Mesh(
              new THREE.SphereGeometry(8, 4, 3),
              new THREE.MeshBasicMaterial({
                color: 0xaaddff, transparent: true, opacity: 0.2,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            shm.position.set(-200 + sh*80, (Math.random()-0.5)*15, (Math.random()-0.5)*15);
            this._root.add(shm);
          }

          this._ibfTime = 0;
          console.log("[intergalactic-bridge-filament] loaded at (600,500,900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._ibfTime += dt;
          this._bridge.material.opacity = 0.08 + 0.06*Math.abs(Math.sin(this._ibfTime * 0.25));
          this._root.rotation.y += 0.00003 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 56 injected! Lines:", lineCount);
