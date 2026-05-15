"use strict";
// inject-w73.cjs — Wave 73: relativistic-periastron-shift-binary + cosmic-dust-devil-tower
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes(
    'AFRAME.registerComponent("relativistic-periastron-shift-binary"',
  )
) {
  console.log("Wave 73 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity cosmic-topology-wormhole-lattice></a-entity>";
const HTML_INSERT = `      <a-entity cosmic-topology-wormhole-lattice></a-entity>
      <!-- ── RELATIVISTIC PERIASTRON SHIFT BINARY — GR precessing ellipse ── -->
      <a-entity relativistic-periastron-shift-binary></a-entity>
      <!-- ── COSMIC DUST DEVIL TOWER — rotating vortex lifting ISM grains ── -->
      <a-entity cosmic-dust-devil-tower></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         RELATIVISTIC PERIASTRON SHIFT BINARY — GR causes the orbit ellipse
         to precess; for the Hulse-Taylor pulsar the advance is 4.2 deg/yr.
         We show a compact binary (neutron star + companion) on an eccentric
         orbit whose ellipse slowly rotates, with gravitational wave strain
         ripple rings emitted at periapsis.
         Position: (900, 700, -900).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("relativistic-periastron-shift-binary", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(900, 700, -900);
          scene.add(this._root);

          /* orbit plane group — will precess */
          this._orbitPlane = new THREE.Group();
          this._root.add(this._orbitPlane);

          /* trace ellipse for orientation */
          var ea = 40, ecc = 0.6;
          var eb = ea*Math.sqrt(1-ecc*ecc);
          var ellPts = [];
          for (var ep = 0; ep <= 80; ep++) {
            var ea2 = (ep/80)*2*Math.PI;
            ellPts.push(new THREE.Vector3(ea*Math.cos(ea2), 0, eb*Math.sin(ea2)));
          }
          var ellGeo = new THREE.BufferGeometry().setFromPoints(ellPts);
          this._ellipseLine = new THREE.Line(ellGeo, new THREE.LineBasicMaterial({
            color: 0x4488ff, transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._orbitPlane.add(this._ellipseLine);

          /* NS body */
          this._ns = new THREE.Mesh(
            new THREE.SphereGeometry(3, 8, 8),
            new THREE.MeshBasicMaterial({
              color: 0xaaffee, transparent: true, opacity: 0.9,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._orbitPlane.add(this._ns);

          /* companion */
          this._comp = new THREE.Mesh(
            new THREE.SphereGeometry(4.5, 8, 8),
            new THREE.MeshBasicMaterial({
              color: 0xffbb44, transparent: true, opacity: 0.85,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._orbitPlane.add(this._comp);

          /* GW rings pool */
          this._gwRings = [];
          for (var gi = 0; gi < 5; gi++) {
            var grPts = [];
            for (var grp = 0; grp <= 40; grp++) {
              var gra = (grp/40)*2*Math.PI;
              grPts.push(new THREE.Vector3(Math.cos(gra), 0, Math.sin(gra)));
            }
            var grGeo = new THREE.BufferGeometry().setFromPoints(grPts);
            var grLine = new THREE.Line(grGeo, new THREE.LineBasicMaterial({
              color: 0x00ffaa, transparent: true, opacity: 0,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(grLine);
            this._gwRings.push({ line: grLine, r: 0, active: false });
          }

          this._rpTime = 0;
          this._precession = 0;
          this._anomaly = 0;
          this._ea = ea; this._ecc = ecc; this._eb = eb;
          this._nextRing = 0;
          console.log("[relativistic-periastron-shift-binary] loaded at (900,700,-900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._rpTime += dt;
          /* GR precession rate — exaggerated for visibility */
          this._precession += 0.015 * dt;
          this._orbitPlane.rotation.y = this._precession;

          /* Kepler mean motion */
          this._anomaly += 0.5 * dt;
          /* eccentric anomaly iteration (Newton's method) */
          var M = this._anomaly % (2*Math.PI);
          var E = M;
          for (var it = 0; it < 5; it++) {
            E = E - (E - this._ecc*Math.sin(E) - M)/(1 - this._ecc*Math.cos(E));
          }
          var x = this._ea*(Math.cos(E) - this._ecc);
          var z = this._eb*Math.sin(E);
          this._ns.position.set(x, 0, z);
          this._comp.position.set(-x*0.5, 0, -z*0.5);

          /* emit GW ring near periapsis */
          var dist2 = x*x + z*z;
          if (dist2 < 350 && this._rpTime > this._nextRing) {
            for (var gi = 0; gi < this._gwRings.length; gi++) {
              if (!this._gwRings[gi].active) {
                this._gwRings[gi].active = true;
                this._gwRings[gi].r = 5;
                this._gwRings[gi].line.material.opacity = 0.5;
                this._nextRing = this._rpTime + 0.8;
                break;
              }
            }
          }
          for (var gi2 = 0; gi2 < this._gwRings.length; gi2++) {
            var rg = this._gwRings[gi2];
            if (rg.active) {
              rg.r += 40 * dt;
              rg.line.scale.setScalar(rg.r);
              rg.line.material.opacity = Math.max(0, 0.5 - rg.r/200);
              if (rg.r > 200) rg.active = false;
            }
          }
        },
      });

      /* ====================================================================
         COSMIC DUST DEVIL TOWER — rotating vortex columns that lift dust and
         gas in irradiated low-pressure ISM regions, analogous to Martian dust
         devils but at nebula scales. Tall spiralling column with inward base
         flow, rotating core, and dispersing plume at top.
         Position: (-900, -200, -1100).
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("cosmic-dust-devil-tower", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-900, -200, -1100);
          scene.add(this._root);

          /* vortex core — tapered cylinder of particles */
          var NC = 400;
          var cPts = new Float32Array(NC*3);
          this._cPts = cPts;
          this._cPhase = new Float32Array(NC);
          this._cH = new Float32Array(NC);
          for (var ci = 0; ci < NC; ci++) {
            this._cPhase[ci] = Math.random()*2*Math.PI;
            this._cH[ci] = Math.random();
          }
          var cGeo = new THREE.BufferGeometry();
          cGeo.setAttribute("position", new THREE.BufferAttribute(cPts, 3));
          this._vortex = new THREE.Points(cGeo, new THREE.PointsMaterial({
            color: 0xcc8833, size: 1.5,
            transparent: true, opacity: 0.4,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._vortex);

          /* base inflow — ground-level dust swept inward */
          var NB = 150;
          var bPts = new Float32Array(NB*3);
          this._bPts = bPts;
          this._bPhase = new Float32Array(NB);
          this._bR = new Float32Array(NB);
          for (var bi = 0; bi < NB; bi++) {
            this._bPhase[bi] = Math.random()*2*Math.PI;
            this._bR[bi] = 15 + Math.random()*35;
          }
          var bGeo = new THREE.BufferGeometry();
          bGeo.setAttribute("position", new THREE.BufferAttribute(bPts, 3));
          this._base = new THREE.Points(bGeo, new THREE.PointsMaterial({
            color: 0xffcc77, size: 1.2,
            transparent: true, opacity: 0.3,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._base);

          /* top plume */
          var NT = 120;
          var tPts = new Float32Array(NT*3);
          this._tPts = tPts;
          this._tPhase = new Float32Array(NT);
          this._tDx = new Float32Array(NT);
          this._tDz = new Float32Array(NT);
          for (var ti = 0; ti < NT; ti++) {
            this._tPhase[ti] = Math.random();
            this._tDx[ti] = (Math.random()-0.5)*8;
            this._tDz[ti] = (Math.random()-0.5)*8;
          }
          var tGeo = new THREE.BufferGeometry();
          tGeo.setAttribute("position", new THREE.BufferAttribute(tPts, 3));
          this._plume = new THREE.Points(tGeo, new THREE.PointsMaterial({
            color: 0xddaa55, size: 1.0,
            transparent: true, opacity: 0.2,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._plume);

          this._cddTime = 0;
          this._NC = NC; this._NB = NB; this._NT = NT;
          this._H = 140;
          console.log("[cosmic-dust-devil-tower] loaded at (-900,-200,-1100)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cddTime += dt;
          var t = this._cddTime;
          /* vortex core — tapering radius */
          for (var ci = 0; ci < this._NC; ci++) {
            this._cPhase[ci] = (this._cPhase[ci] + 1.5*dt) % (2*Math.PI);
            var h = this._cH[ci] * this._H;
            var r = (1 - this._cH[ci]*0.7) * 12 + 1;
            this._cPts[ci*3  ] = r*Math.cos(this._cPhase[ci]);
            this._cPts[ci*3+1] = h;
            this._cPts[ci*3+2] = r*Math.sin(this._cPhase[ci]);
          }
          this._vortex.geometry.attributes.position.needsUpdate = true;
          /* base inflow */
          for (var bi = 0; bi < this._NB; bi++) {
            this._bPhase[bi] = (this._bPhase[bi] + 0.8*dt) % (2*Math.PI);
            this._bR[bi] -= 5*dt;
            if (this._bR[bi] < 5) this._bR[bi] = 15 + Math.random()*35;
            this._bPts[bi*3  ] = this._bR[bi]*Math.cos(this._bPhase[bi]);
            this._bPts[bi*3+1] = 0;
            this._bPts[bi*3+2] = this._bR[bi]*Math.sin(this._bPhase[bi]);
          }
          this._base.geometry.attributes.position.needsUpdate = true;
          /* top plume disperses */
          for (var ti = 0; ti < this._NT; ti++) {
            this._tPhase[ti] = (this._tPhase[ti] + 0.07*dt) % 1;
            var tf = this._tPhase[ti];
            this._tPts[ti*3  ] = this._tDx[ti]*tf;
            this._tPts[ti*3+1] = this._H + tf*30;
            this._tPts[ti*3+2] = this._tDz[ti]*tf;
          }
          this._plume.geometry.attributes.position.needsUpdate = true;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 73 injected! Lines:", lineCount);
