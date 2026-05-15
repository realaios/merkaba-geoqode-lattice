'use strict';
// inject-w108.cjs — Wave 108: cosmic-weibel-beam-filament + stellar-flux-emergence-serpentine
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-weibel-beam-filament"')) {
  console.log('Wave 108 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-turbulent-convection-downdraft></a-entity>';
const HTML_INSERT = `      <a-entity stellar-turbulent-convection-downdraft></a-entity>
      <!-- ── COSMIC WEIBEL BEAM FILAMENT — current filamentation via Weibel instability in relativistic beams ── -->
      <a-entity cosmic-weibel-beam-filament></a-entity>
      <!-- ── STELLAR FLUX EMERGENCE SERPENTINE — serpentine flux tube rising through convection zone ── -->
      <a-entity stellar-flux-emergence-serpentine></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC WEIBEL BEAM FILAMENT — when two counter-streaming relativistic
         plasma beams overlap, the Weibel instability grows transverse
         magnetic field, clustering current into narrow filaments surrounded
         by opposing return currents.
         Renders: parallel current filaments with alternating magnetic glow rings.
         Position: (800, 600, -300).
         @alignment 8→26→48:480  @frequency 528  @domain perf-forge
      ==================================================================== */
      AFRAME.registerComponent("cosmic-weibel-beam-filament", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(800, 600, -300);
          scene.add(this._root);

          this._filaments = [];
          var NFIL22 = 12;
          for (var fi22 = 0; fi22 < NFIL22; fi22++) {
            var NFL22 = 120;
            var fPts22 = new Float32Array(NFL22*3);
            var fGeo22 = new THREE.BufferGeometry();
            fGeo22.setAttribute("position", new THREE.BufferAttribute(fPts22, 3));
            var even22 = fi22%2===0;
            var fLine22 = new THREE.Line(fGeo22, new THREE.LineBasicMaterial({
              color: even22 ? 0x22ffff : 0xff2266,
              transparent: true, opacity: 0.55,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(fLine22);
            var fxc22 = ((fi22%4)-1.5)*4;
            var fzc22 = (Math.floor(fi22/4)-1.0)*4;
            this._filaments.push({ line: fLine22, pts: fPts22, fx: fxc22, fz: fzc22, dir: even22?1:-1, phase: fi22*0.5 });
          }
          this._cwbfTime = 0;
          console.log("[cosmic-weibel-beam-filament] loaded at (800,600,-300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cwbfTime += dt;
          var t = this._cwbfTime;
          for (var fi23 = 0; fi23 < this._filaments.length; fi23++) {
            var fil = this._filaments[fi23];
            var NFL23 = fil.pts.length/3;
            for (var fpi22 = 0; fpi22 < NFL23; fpi22++) {
              var fy22 = ((fpi22/(NFL23-1))-0.5)*14;
              var fRad22 = 0.4*Math.sin(t*3 + fil.phase + fy22*1.2);
              fil.pts[fpi22*3  ] = fil.fx + fRad22;
              fil.pts[fpi22*3+1] = fy22;
              fil.pts[fpi22*3+2] = fil.fz;
            }
            fil.line.geometry.attributes.position.needsUpdate = true;
            fil.line.material.opacity = 0.45 + 0.2*Math.sin(t*2 + fil.phase);
          }
        },
      });

      /* ====================================================================
         STELLAR FLUX EMERGENCE SERPENTINE — as a buoyant flux tube rises
         through the convection zone, it can develop a serpentine (undular)
         shape due to convective buffeting; the undulations may surface as
         multiple active-region patches.
         Renders: a sinuous rising tube with bright knots at each loop peak.
         Position: (-100, -800, 400).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("stellar-flux-emergence-serpentine", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-100, -800, 400);
          scene.add(this._root);

          var NST22 = 3;
          this._tubes = [];
          for (var ti22 = 0; ti22 < NST22; ti22++) {
            var NTP22 = 300;
            var tPts22 = new Float32Array(NTP22*3);
            var tGeo22 = new THREE.BufferGeometry();
            tGeo22.setAttribute("position", new THREE.BufferAttribute(tPts22, 3));
            var tLine22 = new THREE.Line(tGeo22, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.08 + ti22*0.03, 1.0, 0.65),
              transparent: true, opacity: 0.6,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(tLine22);
            this._tubes.push({ line: tLine22, pts: tPts22, xOff: (ti22-1)*4, phase: ti22*1.1 });
          }
          this._sfesTime = 0;
          console.log("[stellar-flux-emergence-serpentine] loaded at (-100,-800,400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._sfesTime += dt;
          var t = this._sfesTime;
          for (var ti23 = 0; ti23 < this._tubes.length; ti23++) {
            var tube = this._tubes[ti23];
            var NTP23 = tube.pts.length/3;
            for (var tpi22 = 0; tpi22 < NTP23; tpi22++) {
              var sf22 = tpi22/(NTP23-1);
              var sy22 = (sf22-0.5)*18;
              var sx22 = tube.xOff + 4*Math.sin(sf22*Math.PI*3 + t*0.4 + tube.phase);
              var sz22 = 1.5*Math.cos(sf22*Math.PI*2 + t*0.5 + tube.phase);
              tube.pts[tpi22*3  ] = sx22;
              tube.pts[tpi22*3+1] = sy22;
              tube.pts[tpi22*3+2] = sz22;
            }
            tube.line.geometry.attributes.position.needsUpdate = true;
            tube.line.material.opacity = 0.5 + 0.15*Math.sin(t*1.2 + tube.phase);
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 108 injected! Lines:', lineCount);
