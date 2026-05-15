"use strict";
// inject-w124.cjs — Wave 124: cosmic-resistive-tearing-reconnection + stellar-umbral-flash-wave
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes(
    'AFRAME.registerComponent("cosmic-resistive-tearing-reconnection"',
  )
) {
  console.log("Wave 124 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity stellar-granule-supergranule-boundary></a-entity>";
const HTML_INSERT = `      <a-entity stellar-granule-supergranule-boundary></a-entity>
      <!-- ── COSMIC RESISTIVE TEARING RECONNECTION — resistive MHD tearing of a current sheet producing a chain of magnetic islands ── -->
      <a-entity cosmic-resistive-tearing-reconnection></a-entity>
      <!-- ── STELLAR UMBRAL FLASH WAVE — 3-minute oscillation driven waves that appear as upwardly propagating brightness flashes in sunspot umbrae ── -->
      <a-entity stellar-umbral-flash-wave></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC RESISTIVE TEARING RECONNECTION — a thin Harris-type current
         sheet in resistive MHD tears along wavevectors parallel to the
         sheet, creating a chain of O-point magnetic islands and X-points
         where field lines reconnect, heating plasma and expelling bidirectional jets.
         Renders: chain of oval islands along a central sheet + outflow jets.
         Position: (300, -600, -900).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-resistive-tearing-reconnection", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(300, -600, -900);
          scene.add(this._root);

          var NI54 = 6;
          this._islands = [];
          for (var ii54 = 0; ii54 < NI54; ii54++) {
            var NP54 = 50;
            var iPts54 = new Float32Array(NP54*3);
            var iGeo54 = new THREE.BufferGeometry();
            iGeo54.setAttribute("position", new THREE.BufferAttribute(iPts54, 3));
            var iLine54 = new THREE.Line(iGeo54, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.0 + ii54*0.03, 1.0, 0.6),
              transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending,
            }));
            this._root.add(iLine54);
            this._islands.push({ line: iLine54, pts: iPts54, cx: (ii54 - NI54/2 + 0.5)*2.5 });
          }
          var NP54j = 60;
          var jPts54 = new Float32Array(NP54j*3);
          var jGeo54 = new THREE.BufferGeometry();
          jGeo54.setAttribute("position", new THREE.BufferAttribute(jPts54, 3));
          this._jets = new THREE.Points(jGeo54, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.5 }));
          this._root.add(this._jets);
          this._jPts54 = jPts54;
          this._rtrTime = 0;
          console.log("[cosmic-resistive-tearing-reconnection] loaded at (300,-600,-900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._rtrTime += dt;
          var t = this._rtrTime;
          for (var ii55 = 0; ii55 < this._islands.length; ii55++) {
            var isl = this._islands[ii55];
            var NP55 = isl.pts.length/3;
            var grow55 = 0.5 + 0.4*Math.abs(Math.sin(t*0.4 + ii55));
            for (var pi55 = 0; pi55 < NP55; pi55++) {
              var ang55 = (pi55/NP55)*2*Math.PI;
              isl.pts[pi55*3  ] = isl.cx + grow55*Math.cos(ang55)*1.0;
              isl.pts[pi55*3+1] = grow55*Math.sin(ang55)*0.35;
              isl.pts[pi55*3+2] = 0;
            }
            isl.line.geometry.attributes.position.needsUpdate = true;
          }
          var NP55j = this._jPts54.length/3;
          for (var ji55 = 0; ji55 < NP55j; ji55++) {
            var jf55 = ((ji55/NP55j) - 0.5)*14;
            var jy55 = (Math.random()-0.5)*0.3;
            this._jPts54[ji55*3  ] = jf55;
            this._jPts54[ji55*3+1] = jy55;
            this._jPts54[ji55*3+2] = 0;
          }
          this._jets.geometry.attributes.position.needsUpdate = true;
        },
      });

      /* ====================================================================
         STELLAR UMBRAL FLASH WAVE — the photospheric p-mode cavity beneath
         a sunspot leaks 3-minute oscillations into the chromosphere, where
         they steepen into shocks, producing quasi-periodic bright flashes
         visible in H-alpha and Ca II that propagate upward as umbral waves.
         Renders: concentric ring pulses expanding from center.
         Position: (-500, -200, 700).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-umbral-flash-wave", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-500, -200, 700);
          scene.add(this._root);

          var NRING54 = 8;
          this._rings54 = [];
          for (var ri54 = 0; ri54 < NRING54; ri54++) {
            var NP54r = 64;
            var rPts54 = new Float32Array(NP54r*3);
            var rGeo54 = new THREE.BufferGeometry();
            rGeo54.setAttribute("position", new THREE.BufferAttribute(rPts54, 3));
            var rLine54 = new THREE.Line(rGeo54, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.1, 1.0, 0.7),
              transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
            }));
            this._root.add(rLine54);
            this._rings54.push({ line: rLine54, pts: rPts54, phase: ri54/NRING54 });
          }
          this._ufwTime = 0;
          console.log("[stellar-umbral-flash-wave] loaded at (-500,-200,700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._ufwTime += dt;
          var t = this._ufwTime;
          var PERIOD54 = 3.0;
          for (var ri55 = 0; ri55 < this._rings54.length; ri55++) {
            var rng = this._rings54[ri55];
            var phase55 = ((t/PERIOD54 + rng.phase) % 1 + 1) % 1;
            var R55 = phase55 * 4;
            var opa55 = Math.max(0, 1 - phase55*1.3);
            var NP55r = rng.pts.length/3;
            for (var pi55r = 0; pi55r < NP55r; pi55r++) {
              var ang55r = (pi55r/NP55r)*2*Math.PI;
              rng.pts[pi55r*3  ] = R55*Math.cos(ang55r);
              rng.pts[pi55r*3+1] = R55*Math.sin(ang55r);
              rng.pts[pi55r*3+2] = phase55 * 1.5;
            }
            rng.line.geometry.attributes.position.needsUpdate = true;
            rng.line.material.opacity = opa55;
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 124 injected! Lines:", lineCount);
