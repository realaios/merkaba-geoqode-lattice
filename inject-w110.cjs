'use strict';
// inject-w110.cjs — Wave 110: cosmic-kelvin-helmholtz-cat-eye + stellar-sunspot-umbra-darkening
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-kelvin-helmholtz-cat-eye"')) {
  console.log('Wave 110 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-magnetoconvection-flux-sheet></a-entity>';
const HTML_INSERT = `      <a-entity stellar-magnetoconvection-flux-sheet></a-entity>
      <!-- ── COSMIC KELVIN-HELMHOLTZ CAT-EYE — KH billow cat-eye vortex roll-up at a shear interface ── -->
      <a-entity cosmic-kelvin-helmholtz-cat-eye></a-entity>
      <!-- ── STELLAR SUNSPOT UMBRA DARKENING — dark umbral core with bright penumbral filaments ── -->
      <a-entity stellar-sunspot-umbra-darkening></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC KELVIN-HELMHOLTZ CAT-EYE — when two fluids flow at different
         velocities across a shared interface, the KH instability rolls the
         interface up into a row of "cat-eye" vortices; seen at cloud layers,
         magnetopause, and galactic disk interfaces.
         Renders: stacked spiral cat-eye vortex rings along a shear interface.
         Position: (400, -500, -700).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("cosmic-kelvin-helmholtz-cat-eye", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(400, -500, -700);
          scene.add(this._root);

          var NEYE26 = 10;
          this._eyes = [];
          for (var ei26 = 0; ei26 < NEYE26; ei26++) {
            var NRING26 = 6;
            var group26 = new THREE.Group();
            this._root.add(group26);
            var rings26 = [];
            for (var ri26 = 0; ri26 < NRING26; ri26++) {
              var NRP26 = 80;
              var rPts26 = new Float32Array(NRP26*3);
              var rGeo26 = new THREE.BufferGeometry();
              rGeo26.setAttribute("position", new THREE.BufferAttribute(rPts26, 3));
              var rLine26 = new THREE.Line(rGeo26, new THREE.LineBasicMaterial({
                color: new AFRAME.THREE.Color().setHSL(0.6 + ri26*0.05, 1.0, 0.65),
                transparent: true, opacity: 0.4,
                blending: THREE.AdditiveBlending,
              }));
              group26.add(rLine26);
              rings26.push({ line: rLine26, pts: rPts26, r: (ri26+1)*0.8 });
            }
            group26.position.set((ei26 - NEYE26/2)*3.5, 0, 0);
            this._eyes.push({ group: group26, rings: rings26, phase: ei26*0.6 });
          }
          this._ckhcTime = 0;
          console.log("[cosmic-kelvin-helmholtz-cat-eye] loaded at (400,-500,-700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._ckhcTime += dt;
          var t = this._ckhcTime;
          for (var ei27 = 0; ei27 < this._eyes.length; ei27++) {
            var eye = this._eyes[ei27];
            var rollAngle = t*0.5 + eye.phase;
            for (var ri27 = 0; ri27 < eye.rings.length; ri27++) {
              var ring = eye.rings[ri27];
              var NRP27 = ring.pts.length/3;
              for (var rpi26 = 0; rpi26 < NRP27; rpi26++) {
                var th26 = (rpi26/(NRP27-1))*2*Math.PI + rollAngle;
                ring.pts[rpi26*3  ] = ring.r*Math.cos(th26);
                ring.pts[rpi26*3+1] = ring.r*Math.sin(th26)*0.5;
                ring.pts[rpi26*3+2] = 0;
              }
              ring.line.geometry.attributes.position.needsUpdate = true;
              ring.line.material.opacity = 0.3 + 0.15*Math.sin(t*2 + eye.phase + ri27);
            }
          }
        },
      });

      /* ====================================================================
         STELLAR SUNSPOT UMBRA DARKENING — the umbra of a sunspot is ~2000 K
         cooler than the surrounding photosphere due to strong vertical magnetic
         field inhibiting convective energy transport; the penumbra shows
         bright horizontal filaments carrying energy around the umbra.
         Renders: a dark central disc with radiating bright penumbral streaks.
         Position: (600, 200, 500).
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("stellar-sunspot-umbra-darkening", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(600, 200, 500);
          scene.add(this._root);

          var NFIL26 = 36;
          this._filaments = [];
          for (var fi26 = 0; fi26 < NFIL26; fi26++) {
            var NFL26 = 60;
            var fPts26 = new Float32Array(NFL26*3);
            var fGeo26 = new THREE.BufferGeometry();
            fGeo26.setAttribute("position", new THREE.BufferAttribute(fPts26, 3));
            var fLine26 = new THREE.Line(fGeo26, new THREE.LineBasicMaterial({
              color: 0xffcc44,
              transparent: true, opacity: 0.5,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(fLine26);
            var fAngle26 = (fi26/NFIL26)*2*Math.PI;
            this._filaments.push({ line: fLine26, pts: fPts26, angle: fAngle26, phase: fi26*0.17 });
          }
          this._ssudTime = 0;
          console.log("[stellar-sunspot-umbra-darkening] loaded at (600,200,500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._ssudTime += dt;
          var t = this._ssudTime;
          for (var fi27 = 0; fi27 < this._filaments.length; fi27++) {
            var fil27 = this._filaments[fi27];
            var NFL27 = fil27.pts.length/3;
            var cosA27 = Math.cos(fil27.angle);
            var sinA27 = Math.sin(fil27.angle);
            for (var fpi27 = 0; fpi27 < NFL27; fpi27++) {
              var sf27 = fpi27/(NFL27-1);
              var r27 = 2 + sf27*5;
              var wave27 = 0.2*Math.sin(r27*2 + t*2 + fil27.phase);
              fil27.pts[fpi27*3  ] = r27*cosA27 + wave27*sinA27;
              fil27.pts[fpi27*3+1] = wave27;
              fil27.pts[fpi27*3+2] = r27*sinA27;
            }
            fil27.line.geometry.attributes.position.needsUpdate = true;
            fil27.line.material.opacity = 0.4 + 0.15*Math.sin(t*1.5 + fil27.phase);
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 110 injected! Lines:', lineCount);
