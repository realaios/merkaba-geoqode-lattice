"use strict";
// inject-w105.cjs — Wave 105: cosmic-electromagnetic-drift-surface + stellar-thermohaline-mixing-layer
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes(
    'AFRAME.registerComponent("cosmic-electromagnetic-drift-surface"',
  )
) {
  console.log("Wave 105 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity stellar-rossby-wave-vortex-lattice></a-entity>";
const HTML_INSERT = `      <a-entity stellar-rossby-wave-vortex-lattice></a-entity>
      <!-- ── COSMIC ELECTROMAGNETIC DRIFT SURFACE — E×B drift shell around a magnetized body ── -->
      <a-entity cosmic-electromagnetic-drift-surface></a-entity>
      <!-- ── STELLAR THERMOHALINE MIXING LAYER — double-diffusive fingers from thermohaline instability ── -->
      <a-entity stellar-thermohaline-mixing-layer></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC ELECTROMAGNETIC DRIFT SURFACE — charged particles in a
         dipole magnetic field drift azimuthally due to the E×B, gradient-B,
         and curvature drifts, tracing out closed drift shells around the body.
         Renders: nested drift-shell tori with flowing particles.
         Position: (600, -400, 300).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-electromagnetic-drift-surface", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(600, -400, 300);
          scene.add(this._root);

          this._tori = [];
          var NTORI = 5;
          for (var ti14 = 0; ti14 < NTORI; ti14++) {
            var NTP14 = 1200;
            var tPts14 = new Float32Array(NTP14*3);
            var tGeo14 = new THREE.BufferGeometry();
            tGeo14.setAttribute("position", new THREE.BufferAttribute(tPts14, 3));
            var tMat14 = new THREE.PointsMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.6 - ti14*0.07, 1.0, 0.6),
              size: 0.45, transparent: true, opacity: 0.3,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var tMesh14 = new THREE.Points(tGeo14, tMat14);
            this._root.add(tMesh14);
            var rMain14 = 5 + ti14*2.5;
            var rTube14 = 0.5 + ti14*0.15;
            var driftOmega = 0.4 + ti14*0.12;
            this._tori.push({ mesh: tMesh14, pts: tPts14, rMain: rMain14, rTube: rTube14, omega: driftOmega });
          }
          this._cedsTime = 0;
          console.log("[cosmic-electromagnetic-drift-surface] loaded at (600,-400,300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cedsTime += dt;
          var t = this._cedsTime;
          for (var ti15 = 0; ti15 < this._tori.length; ti15++) {
            var tor = this._tori[ti15];
            var NTP15 = tor.pts.length/3;
            for (var tpi = 0; tpi < NTP15; tpi++) {
              var uA14 = Math.random()*2*Math.PI;
              var vA14 = Math.random()*2*Math.PI + t*tor.omega;
              tor.pts[tpi*3  ] = (tor.rMain + tor.rTube*Math.cos(uA14))*Math.cos(vA14);
              tor.pts[tpi*3+1] = tor.rTube*Math.sin(uA14)*2;
              tor.pts[tpi*3+2] = (tor.rMain + tor.rTube*Math.cos(uA14))*Math.sin(vA14);
            }
            tor.mesh.geometry.attributes.position.needsUpdate = true;
            tor.mesh.material.opacity = 0.25 + 0.1*Math.sin(t*tor.omega*2 + ti15);
          }
        },
      });

      /* ====================================================================
         STELLAR THERMOHALINE MIXING LAYER — when helium-enriched material
         settles above a hydrogen layer, double-diffusive (thermohaline)
         instability forms thin vertical salt-finger columns that mix the
         composition.
         Renders: a forest of thin vertical mixing fingers.
         Position: (-200, 700, -100).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("stellar-thermohaline-mixing-layer", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-200, 700, -100);
          scene.add(this._root);

          this._fingers = [];
          var NFIN = 30;
          for (var fi14 = 0; fi14 < NFIN; fi14++) {
            var NFP14 = 120;
            var fPts14 = new Float32Array(NFP14*3);
            var fGeo14 = new THREE.BufferGeometry();
            fGeo14.setAttribute("position", new THREE.BufferAttribute(fPts14, 3));
            var fLine14 = new THREE.Line(fGeo14, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.15 + Math.random()*0.1, 1.0, 0.6),
              transparent: true, opacity: 0.45,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(fLine14);
            var fx14 = (Math.random()-0.5)*20;
            var fz14 = (Math.random()-0.5)*20;
            this._fingers.push({ line: fLine14, pts: fPts14, fx: fx14, fz: fz14, phase: Math.random()*2*Math.PI });
          }
          this._stmlTime = 0;
          console.log("[stellar-thermohaline-mixing-layer] loaded at (-200,700,-100)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._stmlTime += dt;
          var t = this._stmlTime;
          for (var fi15 = 0; fi15 < this._fingers.length; fi15++) {
            var fin = this._fingers[fi15];
            var NFP15 = fin.pts.length/3;
            for (var fpi = 0; fpi < NFP15; fpi++) {
              var fh = (fpi/(NFP15-1))*12 - 6;
              var fWobble = 0.3*Math.sin(fh*1.2 + t*1.5 + fin.phase);
              fin.pts[fpi*3  ] = fin.fx + fWobble;
              fin.pts[fpi*3+1] = fh;
              fin.pts[fpi*3+2] = fin.fz;
            }
            fin.line.geometry.attributes.position.needsUpdate = true;
            fin.line.material.opacity = 0.3 + 0.2*Math.abs(Math.sin(t*1.1 + fin.phase));
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 105 injected! Lines:", lineCount);
