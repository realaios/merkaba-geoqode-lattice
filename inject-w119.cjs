'use strict';
// inject-w119.cjs — Wave 119: cosmic-langmuir-wave-collapse + stellar-sunspot-light-bridge
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-langmuir-wave-collapse"')) {
  console.log('Wave 119 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-chromospheric-evaporation-jet></a-entity>';
const HTML_INSERT = `      <a-entity stellar-chromospheric-evaporation-jet></a-entity>
      <!-- ── COSMIC LANGMUIR WAVE COLLAPSE — modulational collapse of Langmuir turbulence into cavitons ── -->
      <a-entity cosmic-langmuir-wave-collapse></a-entity>
      <!-- ── STELLAR SUNSPOT LIGHT BRIDGE — hot convective lane crossing a sunspot umbra ── -->
      <a-entity stellar-sunspot-light-bridge></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC LANGMUIR WAVE COLLAPSE — in the modulational (Langmuir)
         turbulence of a beam-driven plasma, Langmuir wave packets are
         trapped in density cavities (cavitons) and undergo a nonlinear
         collapse, focusing energy to very small scales where wave-particle
         interaction converts it to accelerated electrons.
         Renders: bright pinching vortex clusters at random caviton sites.
         Position: (1000, 300, -300).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-langmuir-wave-collapse", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(1000, 300, -300);
          scene.add(this._root);

          var NCAV46 = 8;
          this._cavs = [];
          for (var ci46 = 0; ci46 < NCAV46; ci46++) {
            var NR46 = 6;
            var rings = [];
            for (var ri46 = 0; ri46 < NR46; ri46++) {
              var NP46 = 40;
              var rPts46 = new Float32Array(NP46*3);
              var rGeo46 = new THREE.BufferGeometry();
              rGeo46.setAttribute("position", new THREE.BufferAttribute(rPts46, 3));
              var rLine46 = new THREE.Line(rGeo46, new THREE.LineBasicMaterial({
                color: new AFRAME.THREE.Color().setHSL(0.65 + ri46*0.03, 1.0, 0.7),
                transparent: true, opacity: 0.4,
                blending: THREE.AdditiveBlending,
              }));
              this._root.add(rLine46);
              rings.push({ line: rLine46, pts: rPts46, r0: 0.4 + ri46*0.25 });
            }
            var cx46 = (Math.random()-0.5)*10;
            var cy46 = (Math.random()-0.5)*10;
            var cz46 = (Math.random()-0.5)*10;
            this._cavs.push({ rings: rings, cx: cx46, cy: cy46, cz: cz46, phase: ci46*0.8 });
          }
          this._clwcTime = 0;
          console.log("[cosmic-langmuir-wave-collapse] loaded at (1000,300,-300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._clwcTime += dt;
          var t = this._clwcTime;
          for (var ci47 = 0; ci47 < this._cavs.length; ci47++) {
            var cav = this._cavs[ci47];
            var scale47 = 0.3 + 0.7*Math.abs(Math.sin(t*0.7 + cav.phase));
            for (var ri47 = 0; ri47 < cav.rings.length; ri47++) {
              var rg = cav.rings[ri47];
              var R47 = rg.r0 * scale47;
              var NP47 = rg.pts.length/3;
              for (var pi47 = 0; pi47 < NP47; pi47++) {
                var th47 = (pi47/NP47)*2*Math.PI;
                rg.pts[pi47*3  ] = cav.cx + R47*Math.cos(th47);
                rg.pts[pi47*3+1] = cav.cy + R47*Math.sin(th47);
                rg.pts[pi47*3+2] = cav.cz + 0.05*Math.sin(4*th47 + t*2 + cav.phase);
              }
              rg.line.geometry.attributes.position.needsUpdate = true;
              rg.line.material.opacity = 0.2 + 0.3*(1 - scale47)*0.99;
            }
          }
        },
      });

      /* ====================================================================
         STELLAR SUNSPOT LIGHT BRIDGE — a convective intrusion of hotter
         plasma that cuts across the dark umbra, appearing as a bright lane;
         it often heralds sunspot decay and shows plasma jets, fibrils,
         and oscillatory activity along its length.
         Renders: a luminous curved slab with flickering fibril lines.
         Position: (-500, -200, -800).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-sunspot-light-bridge", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-500, -200, -800);
          scene.add(this._root);

          var NFIB46 = 12;
          this._fibs = [];
          for (var fi46 = 0; fi46 < NFIB46; fi46++) {
            var NFP46 = 50;
            var fPts46 = new Float32Array(NFP46*3);
            var fGeo46 = new THREE.BufferGeometry();
            fGeo46.setAttribute("position", new THREE.BufferAttribute(fPts46, 3));
            var fLine46 = new THREE.Line(fGeo46, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.1 + fi46*0.02, 0.9, 0.75),
              transparent: true, opacity: 0.5,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(fLine46);
            this._fibs.push({ line: fLine46, pts: fPts46, yo: (fi46 - NFIB46/2)*0.25, phase: fi46*0.4 });
          }
          this._sslbTime = 0;
          console.log("[stellar-sunspot-light-bridge] loaded at (-500,-200,-800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._sslbTime += dt;
          var t = this._sslbTime;
          for (var fi47 = 0; fi47 < this._fibs.length; fi47++) {
            var fb = this._fibs[fi47];
            var NP47b = fb.pts.length/3;
            for (var pi47b = 0; pi47b < NP47b; pi47b++) {
              var sf47 = pi47b/(NP47b-1);
              var xf47 = (sf47 - 0.5)*7;
              var yf47 = fb.yo + 0.15*Math.sin(sf47*Math.PI*3 + t*1.5 + fb.phase);
              fb.pts[pi47b*3  ] = xf47;
              fb.pts[pi47b*3+1] = yf47;
              fb.pts[pi47b*3+2] = 0.12*Math.sin(sf47*6 + t + fb.phase);
            }
            fb.line.geometry.attributes.position.needsUpdate = true;
            fb.line.material.opacity = 0.35 + 0.2*Math.sin(t*2 + fb.phase);
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 119 injected! Lines:', lineCount);
