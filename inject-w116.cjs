'use strict';
// inject-w116.cjs — Wave 116: cosmic-ion-acoustic-shocklet + stellar-supergranule-network
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-ion-acoustic-shocklet"')) {
  console.log('Wave 116 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-ellerman-bomb-burst></a-entity>';
const HTML_INSERT = `      <a-entity stellar-ellerman-bomb-burst></a-entity>
      <!-- ── COSMIC ION ACOUSTIC SHOCKLET — small amplitude ion-acoustic shocklets in solar wind ── -->
      <a-entity cosmic-ion-acoustic-shocklet></a-entity>
      <!-- ── STELLAR SUPERGRANULE NETWORK — large-scale convection cells forming the chromospheric network ── -->
      <a-entity stellar-supergranule-network></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC ION ACOUSTIC SHOCKLET — in the turbulent solar wind and
         planetary foreshocks, ion-acoustic waves steepen nonlinearly into
         compressive shocklets; their high-frequency oscillations ride on
         larger MHD fluctuations.
         Renders: compressed parallel oscillation strands along a beam axis.
         Position: (-900, 200, -500).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-ion-acoustic-shocklet", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-900, 200, -500);
          scene.add(this._root);

          var NSH40 = 10;
          this._shocks = [];
          for (var si40 = 0; si40 < NSH40; si40++) {
            var NP40 = 80;
            var pts40 = new Float32Array(NP40*3);
            var geo40 = new THREE.BufferGeometry();
            geo40.setAttribute("position", new THREE.BufferAttribute(pts40, 3));
            var line40 = new THREE.Line(geo40, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.15 + si40*0.05, 1.0, 0.65),
              transparent: true, opacity: 0.45,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(line40);
            this._shocks.push({ line: line40, pts: pts40, yOff: (si40 - NSH40/2)*0.8, phase: si40*0.6 });
          }
          this._ciasTime = 0;
          console.log("[cosmic-ion-acoustic-shocklet] loaded at (-900,200,-500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._ciasTime += dt;
          var t = this._ciasTime;
          for (var si41 = 0; si41 < this._shocks.length; si41++) {
            var sh = this._shocks[si41];
            var NP41 = sh.pts.length/3;
            for (var pi41 = 0; pi41 < NP41; pi41++) {
              var sf41 = pi41/(NP41-1);
              var x41 = (sf41 - 0.5)*12;
              var env41 = Math.exp(-4*(sf41 - 0.5 - 0.15*Math.sin(t*0.4 + sh.phase))*(sf41 - 0.5 - 0.15*Math.sin(t*0.4 + sh.phase)));
              var y41 = sh.yOff + env41*0.6*Math.sin(20*sf41 - t*4 + sh.phase);
              sh.pts[pi41*3  ] = x41;
              sh.pts[pi41*3+1] = y41;
              sh.pts[pi41*3+2] = env41*0.2*Math.cos(12*sf41 - t*3 + sh.phase);
            }
            sh.line.geometry.attributes.position.needsUpdate = true;
          }
        },
      });

      /* ====================================================================
         STELLAR SUPERGRANULE NETWORK — supergranules are ~30 Mm wide
         convection cells whose horizontal flows sweep magnetic field to
         cell boundaries, creating the chromospheric network of bright
         magnetic knots visible in Ca II and UV.
         Renders: a hexagonal tiling of cell outlines pulsing gently.
         Position: (0, -800, 200).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("stellar-supergranule-network", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(0, -800, 200);
          scene.add(this._root);

          var NCELL40 = 30;
          this._cells = [];
          for (var ci40 = 0; ci40 < NCELL40; ci40++) {
            var NC40 = 7;
            var cPts40 = new Float32Array(NC40*3);
            var cGeo40 = new THREE.BufferGeometry();
            cGeo40.setAttribute("position", new THREE.BufferAttribute(cPts40, 3));
            var cLine40 = new THREE.Line(cGeo40, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.6 + ci40*0.01, 0.8, 0.55),
              transparent: true, opacity: 0.3,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(cLine40);
            var col40 = ci40 % 6;
            var row40 = Math.floor(ci40 / 6);
            var cx40 = (col40 - 3)*3 + (row40%2)*1.5;
            var cz40 = (row40 - 2)*2.6;
            var R40 = 1.2 + Math.random()*0.3;
            this._cells.push({ line: cLine40, pts: cPts40, cx: cx40, cz: cz40, R: R40, phase: ci40*0.4 });
          }
          this._ssgnTime = 0;
          console.log("[stellar-supergranule-network] loaded at (0,-800,200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._ssgnTime += dt;
          var t = this._ssgnTime;
          for (var ci41 = 0; ci41 < this._cells.length; ci41++) {
            var cell = this._cells[ci41];
            var NV41 = 6;
            for (var vi41 = 0; vi41 <= NV41; vi41++) {
              var th41 = (vi41/NV41)*2*Math.PI;
              var r41 = cell.R*(1 + 0.05*Math.sin(t*0.5 + cell.phase));
              cell.pts[vi41*3  ] = cell.cx + r41*Math.cos(th41);
              cell.pts[vi41*3+1] = 0.1*Math.sin(t*0.8 + cell.phase);
              cell.pts[vi41*3+2] = cell.cz + r41*Math.sin(th41);
            }
            cell.line.geometry.attributes.position.needsUpdate = true;
            cell.line.material.opacity = 0.2 + 0.15*Math.sin(t*0.6 + cell.phase);
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 116 injected! Lines:', lineCount);
