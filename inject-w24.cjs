'use strict';
// inject-w24.cjs — Wave 24: hypernova-cocoon + intergalactic-medium
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("hypernova-cocoon"')) {
  console.log('Wave 24 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity cosmic-filament-bridge></a-entity>';
const HTML_INSERT = `      <a-entity cosmic-filament-bridge></a-entity>
      <!-- ── HYPERNOVA COCOON — collapsar jet wrapped in expanding energy shell ── -->
      <a-entity hypernova-cocoon></a-entity>
      <!-- ── INTERGALACTIC MEDIUM — warm-hot gas filling the void between clusters ── -->
      <a-entity intergalactic-medium></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         HYPERNOVA COCOON — a hypernova (super-powered supernova from a
         collapsar, the engine of a long gamma-ray burst) wrapped in a hot
         expanding cocoon of shocked gas driven by the relativistic jet.
         Position: (700, -500, 400).
         Components:
           - Central jet engine: bright compact sphere (r=10), pulsing white-blue
           - Two bipolar jets: conical point-clouds expanding ±Y at 0.9c
           - Cocoon shell: prolate SphereGeometry (stretched Y=1.8×) wireframe,
             expanding from r=50→400 over 25s, then resetting
           - Shocked interface: 800 particles at cocoon boundary, turbulent
           - Hot cocoon interior fill: 600 dim orange particles inside shell
           - Narrow recollimation shock: secondary ring at ≈60% of jet length
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("hypernova-cocoon", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(700, -500, 400);
          scene.add(this._root);

          /* ── jet engine core ── */
          this._coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          this._core = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 6), this._coreMat);
          this._root.add(this._core);

          /* ── bipolar jets (300 pts each side) ── */
          var JN = 300;
          this._jetsN = new Float32Array(JN * 3);
          this._jetsS = new Float32Array(JN * 3);
          for (var ji = 0; ji < JN; ji++) {
            var t0 = Math.random();
            var cone = t0 * 0.10; /* narrow half-angle */
            var ang = Math.random() * 2 * Math.PI;
            this._jetsN[ji*3  ] = cone * Math.cos(ang);
            this._jetsN[ji*3+1] = t0; /* normalized, will scale */
            this._jetsN[ji*3+2] = cone * Math.sin(ang);
            this._jetsS[ji*3  ] = cone * Math.cos(ang);
            this._jetsS[ji*3+1] = -t0;
            this._jetsS[ji*3+2] = cone * Math.sin(ang);
          }
          var jGeoN = new THREE.BufferGeometry();
          jGeoN.setAttribute("position", new THREE.BufferAttribute(this._jetsN.slice(), 3));
          this._jetMatN = new THREE.PointsMaterial({
            color: 0x88ddff, size: 2.0, transparent: true, opacity: 0.60,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._jetN = new THREE.Points(jGeoN, this._jetMatN);
          this._root.add(this._jetN);

          var jGeoS = new THREE.BufferGeometry();
          jGeoS.setAttribute("position", new THREE.BufferAttribute(this._jetsS.slice(), 3));
          this._jetMatS = new THREE.PointsMaterial({
            color: 0xffaa44, size: 2.0, transparent: true, opacity: 0.60,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._jetS = new THREE.Points(jGeoS, this._jetMatS);
          this._root.add(this._jetS);

          /* ── expanding cocoon shell (prolate wireframe sphere) ── */
          this._cocoonMat = new THREE.MeshBasicMaterial({
            color: 0xff6600, wireframe: true, transparent: true, opacity: 0.18, depthWrite: false,
          });
          this._cocoon = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), this._cocoonMat);
          this._cocoon.scale.set(1, 1.8, 1);
          this._root.add(this._cocoon);

          /* ── shocked boundary particles (800) ── */
          var BN = 800;
          var bPts = new Float32Array(BN * 3);
          for (var bi = 0; bi < BN; bi++) {
            var phi = Math.acos(2 * Math.random() - 1);
            var thetaB = Math.random() * 2 * Math.PI;
            bPts[bi*3  ] = Math.sin(phi) * Math.cos(thetaB);
            bPts[bi*3+1] = Math.cos(phi) * 1.8;
            bPts[bi*3+2] = Math.sin(phi) * Math.sin(thetaB);
          }
          var bGeo = new THREE.BufferGeometry();
          bGeo.setAttribute("position", new THREE.BufferAttribute(bPts, 3));
          this._boundMat = new THREE.PointsMaterial({
            color: 0xffcc66, size: 2.5, transparent: true, opacity: 0.40,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._boundPts = new THREE.Points(bGeo, this._boundMat);
          this._root.add(this._boundPts);
          this._bPtsBase = bPts;

          /* ── interior hot gas (600) ── */
          var IN = 600;
          var iPts = new Float32Array(IN * 3);
          for (var ii = 0; ii < IN; ii++) {
            var rf = Math.random() * 0.85;
            var phi2 = Math.acos(2 * Math.random() - 1);
            var theta2 = Math.random() * 2 * Math.PI;
            iPts[ii*3  ] = rf * Math.sin(phi2) * Math.cos(theta2);
            iPts[ii*3+1] = rf * Math.cos(phi2) * 1.8;
            iPts[ii*3+2] = rf * Math.sin(phi2) * Math.sin(theta2);
          }
          var iGeo = new THREE.BufferGeometry();
          iGeo.setAttribute("position", new THREE.BufferAttribute(iPts, 3));
          this._interiorPts = new THREE.Points(iGeo, new THREE.PointsMaterial({
            color: 0xff4400, size: 2.0, transparent: true, opacity: 0.15,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._interiorPts);
          this._iPtsBase = iPts;

          this._hvTime = 0;
          this._CYCLE = 25.0;
          this._R_MAX = 400;
          this._JET_MAX = 350;
          console.log("[hypernova-cocoon] exploding at (700,-500,400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._hvTime += dt;
          var phase = (this._hvTime % this._CYCLE) / this._CYCLE;

          /* ── shell expansion ── */
          var r = 50 + phase * this._R_MAX;
          this._cocoon.scale.set(r, r * 1.8, r);

          /* ── boundary particles track shell ── */
          var bArr = this._boundPts.geometry.attributes.position.array;
          for (var bi = 0; bi < 800; bi++) {
            var noisy = r + (Math.random() - 0.5) * 20;
            bArr[bi*3  ] = this._bPtsBase[bi*3  ] * noisy;
            bArr[bi*3+1] = this._bPtsBase[bi*3+1] * noisy;
            bArr[bi*3+2] = this._bPtsBase[bi*3+2] * noisy;
          }
          this._boundPts.geometry.attributes.position.needsUpdate = true;

          /* ── interior gas also scales ── */
          var iArr = this._interiorPts.geometry.attributes.position.array;
          for (var ii = 0; ii < 600; ii++) {
            var ri2 = r * Math.random() * 0.85;
            iArr[ii*3  ] = this._iPtsBase[ii*3  ] * ri2;
            iArr[ii*3+1] = this._iPtsBase[ii*3+1] * ri2;
            iArr[ii*3+2] = this._iPtsBase[ii*3+2] * ri2;
          }
          this._interiorPts.geometry.attributes.position.needsUpdate = true;

          /* ── jets extend at 0.9c equivalent ── */
          var jetLen = Math.min(phase * this._JET_MAX * 1.5, this._JET_MAX);
          var jArrN = this._jetN.geometry.attributes.position.array;
          var jArrS = this._jetS.geometry.attributes.position.array;
          for (var ji = 0; ji < 300; ji++) {
            jArrN[ji*3+1] = this._jetsN[ji*3+1] * jetLen;
            jArrN[ji*3  ] = this._jetsN[ji*3  ] * jetLen;
            jArrN[ji*3+2] = this._jetsN[ji*3+2] * jetLen;
            jArrS[ji*3+1] = this._jetsS[ji*3+1] * jetLen;
            jArrS[ji*3  ] = this._jetsS[ji*3  ] * jetLen;
            jArrS[ji*3+2] = this._jetsS[ji*3+2] * jetLen;
          }
          this._jetN.geometry.attributes.position.needsUpdate = true;
          this._jetS.geometry.attributes.position.needsUpdate = true;

          /* ── core pulse ── */
          this._core.scale.setScalar(1 + 0.4 * Math.abs(Math.sin(this._hvTime * 5)));
          this._boundMat.opacity = 0.25 + 0.25 * (1 - phase);
          this._cocoonMat.opacity = 0.08 + 0.15 * (1 - phase);
        },
      });

      /* ====================================================================
         INTERGALACTIC MEDIUM (IGM) — the warm-hot intergalactic plasma
         (WHIM) that fills the vast voids between galaxy clusters.
         Estimated to contain ~50% of ordinary matter in the universe.
         Visualised as a vast diffuse scattering of very faint particles
         with subtle temperature-colour gradient.
         Position: (200, -600, -200).
         Components:
           - 3000 ultra-dim points scattered over a large volume (±500)
           - Colour gradient from blue-white (hotter, near clusters) to faint
             red (cooler, in voids) — randomised per particle
           - Very slow drift (thermal motion) + gentle breathing
           - 5 brighter "tracer filament" corridors (200 pts each) suggesting
             where galaxies and filaments channel the gas flow
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("intergalactic-medium", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(200, -600, -200);
          scene.add(this._root);

          /* ── diffuse IGM cloud (3000 pts) ── */
          var IGN = 3000;
          var igPos = new Float32Array(IGN * 3);
          var igCol = new Float32Array(IGN * 3); /* per-vertex colour */
          for (var gi = 0; gi < IGN; gi++) {
            var x = (Math.random() - 0.5) * 1000;
            var y = (Math.random() - 0.5) * 1000;
            var z = (Math.random() - 0.5) * 1000;
            igPos[gi*3] = x; igPos[gi*3+1] = y; igPos[gi*3+2] = z;
            /* hotter (blue) near centre, cooler (red) in outskirts */
            var dist = Math.sqrt(x*x + y*y + z*z) / 700;
            var heat = Math.max(0, 1 - dist);
            igCol[gi*3  ] = heat * 0.3 + 0.15;   /* R */
            igCol[gi*3+1] = heat * 0.5 + 0.05;   /* G */
            igCol[gi*3+2] = heat * 1.0 + 0.10;   /* B */
          }
          var igGeo = new THREE.BufferGeometry();
          igGeo.setAttribute("position", new THREE.BufferAttribute(igPos, 3));
          igGeo.setAttribute("color",    new THREE.BufferAttribute(igCol, 3));
          this._igmMat = new THREE.PointsMaterial({
            vertexColors: true, size: 3.5, transparent: true, opacity: 0.08,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(igGeo, this._igmMat));

          /* ── 5 tracer corridors (200 pts each) ── */
          var corridorDefs = [
            { dir: [1, 0.2, 0], col: 0x8888ff },
            { dir: [-0.8, 0.5, 0.3], col: 0xaaccff },
            { dir: [0.3, -1, 0.5], col: 0x66aaff },
            { dir: [0.2, 0.3, -1], col: 0x99bbff },
            { dir: [-0.5, -0.5, 0.8], col: 0x4466cc },
          ];
          for (var ci = 0; ci < corridorDefs.length; ci++) {
            var corr = corridorDefs[ci];
            var cPts = new Float32Array(200 * 3);
            for (var cpi = 0; cpi < 200; cpi++) {
              var t2 = (cpi / 199 - 0.5) * 900;
              cPts[cpi*3  ] = corr.dir[0] * t2 + (Math.random()-0.5)*40;
              cPts[cpi*3+1] = corr.dir[1] * t2 + (Math.random()-0.5)*40;
              cPts[cpi*3+2] = corr.dir[2] * t2 + (Math.random()-0.5)*40;
            }
            var cGeo2 = new THREE.BufferGeometry();
            cGeo2.setAttribute("position", new THREE.BufferAttribute(cPts, 3));
            this._root.add(new THREE.Points(cGeo2, new THREE.PointsMaterial({
              color: corr.col, size: 2.0, transparent: true, opacity: 0.18,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          this._igmTime = 0;
          console.log("[intergalactic-medium] pervading at (200,-600,-200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._igmTime += dt;
          this._igmMat.opacity = 0.05 + 0.04 * Math.sin(this._igmTime * 0.3);
          this._root.rotation.y += 0.002 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 24 injected! Lines:', lineCount);
