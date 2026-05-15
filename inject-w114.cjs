"use strict";
// inject-w114.cjs — Wave 114: cosmic-rayleigh-taylor-mushroom + stellar-prominence-tornado-vortex
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes('AFRAME.registerComponent("cosmic-rayleigh-taylor-mushroom"')
) {
  console.log("Wave 114 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity stellar-tachocline-shear-layer></a-entity>";
const HTML_INSERT = `      <a-entity stellar-tachocline-shear-layer></a-entity>
      <!-- ── COSMIC RAYLEIGH-TAYLOR MUSHROOM — RT mushroom caps from heavy fluid falling into lighter ── -->
      <a-entity cosmic-rayleigh-taylor-mushroom></a-entity>
      <!-- ── STELLAR PROMINENCE TORNADO VORTEX — rotating tornado vortex anchored to prominence flux tube ── -->
      <a-entity stellar-prominence-tornado-vortex></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC RAYLEIGH-TAYLOR MUSHROOM — when a dense fluid (e.g. cool
         accreted shell) overlies a lighter fluid (e.g. hot interior), the
         RT instability drives mushroom-cap plumes downward while buoyant
         spikes rise; seen in supernovae, ICM sloshing, HII regions.
         Renders: columns of rising spikes capped with curling mushroom vortices.
         Position: (-500, 600, -300).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("cosmic-rayleigh-taylor-mushroom", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-500, 600, -300);
          scene.add(this._root);

          var NMUS36 = 8;
          this._mushrooms = [];
          for (var mi36 = 0; mi36 < NMUS36; mi36++) {
            var NCAP36 = 60;
            var cPts36 = new Float32Array(NCAP36*3);
            var cGeo36 = new THREE.BufferGeometry();
            cGeo36.setAttribute("position", new THREE.BufferAttribute(cPts36, 3));
            var cLine36 = new THREE.Line(cGeo36, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.7 + mi36*0.04, 1.0, 0.65),
              transparent: true, opacity: 0.45,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(cLine36);
            var NSTK36 = 40;
            var sPts36 = new Float32Array(NSTK36*3);
            var sGeo36 = new THREE.BufferGeometry();
            sGeo36.setAttribute("position", new THREE.BufferAttribute(sPts36, 3));
            var sLine36 = new THREE.Line(sGeo36, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.72 + mi36*0.04, 1.0, 0.55),
              transparent: true, opacity: 0.35,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(sLine36);
            var xOff36 = (mi36 - NMUS36/2)*2.5;
            this._mushrooms.push({ capLine: cLine36, cPts: cPts36, stalkLine: sLine36, sPts: sPts36, x: xOff36, phase: mi36*0.8 });
          }
          this._crtmTime = 0;
          console.log("[cosmic-rayleigh-taylor-mushroom] loaded at (-500,600,-300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._crtmTime += dt;
          var t = this._crtmTime;
          for (var mi37 = 0; mi37 < this._mushrooms.length; mi37++) {
            var mush = this._mushrooms[mi37];
            var capH = 3 + 1.5*Math.sin(t*0.6 + mush.phase);
            var NCAP37 = mush.cPts.length/3;
            for (var ci37 = 0; ci37 < NCAP37; ci37++) {
              var th37 = (ci37/(NCAP37-1))*2*Math.PI;
              var r37 = 0.8 + 0.15*Math.sin(3*th37 + t + mush.phase);
              mush.cPts[ci37*3  ] = mush.x + r37*Math.cos(th37 + t*0.5 + mush.phase);
              mush.cPts[ci37*3+1] = capH;
              mush.cPts[ci37*3+2] = r37*Math.sin(th37 + t*0.5 + mush.phase);
            }
            mush.capLine.geometry.attributes.position.needsUpdate = true;
            var NSTK37 = mush.sPts.length/3;
            for (var si37 = 0; si37 < NSTK37; si37++) {
              var sf37 = si37/(NSTK37-1);
              mush.sPts[si37*3  ] = mush.x + 0.1*Math.sin(sf37*8 + t);
              mush.sPts[si37*3+1] = sf37*capH;
              mush.sPts[si37*3+2] = 0.1*Math.cos(sf37*8 + t);
            }
            mush.stalkLine.geometry.attributes.position.needsUpdate = true;
          }
        },
      });

      /* ====================================================================
         STELLAR PROMINENCE TORNADO VORTEX — solar prominence tornadoes are
         rotating helical structures anchored in the photosphere and spiraling
         upward into the corona; driven by footpoint flux-tube convection and
         differential magnetic helicity injection.
         Renders: tight helical vortex ribbons rising and twisting.
         Position: (300, -400, 600).
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("stellar-prominence-tornado-vortex", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(300, -400, 600);
          scene.add(this._root);

          var NVORT36 = 5;
          this._vortices = [];
          for (var vi36 = 0; vi36 < NVORT36; vi36++) {
            var NTHD36 = 3;
            var threads36 = [];
            for (var ti36 = 0; ti36 < NTHD36; ti36++) {
              var NVP36 = 80;
              var vPts36 = new Float32Array(NVP36*3);
              var vGeo36 = new THREE.BufferGeometry();
              vGeo36.setAttribute("position", new THREE.BufferAttribute(vPts36, 3));
              var vLine36 = new THREE.Line(vGeo36, new THREE.LineBasicMaterial({
                color: new AFRAME.THREE.Color().setHSL(0.9 + ti36*0.03, 1.0, 0.65),
                transparent: true, opacity: 0.45,
                blending: THREE.AdditiveBlending,
              }));
              this._root.add(vLine36);
              threads36.push({ line: vLine36, pts: vPts36, tOff: (ti36/NTHD36)*2*Math.PI });
            }
            var xv36 = (vi36 - NVORT36/2)*3;
            this._vortices.push({ threads: threads36, x: xv36, phase: vi36*0.7 });
          }
          this._sptvTime = 0;
          console.log("[stellar-prominence-tornado-vortex] loaded at (300,-400,600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._sptvTime += dt;
          var t = this._sptvTime;
          for (var vi37 = 0; vi37 < this._vortices.length; vi37++) {
            var vort = this._vortices[vi37];
            for (var ti37 = 0; ti37 < vort.threads.length; ti37++) {
              var thrd = vort.threads[ti37];
              var NVP37 = thrd.pts.length/3;
              for (var vpi37 = 0; vpi37 < NVP37; vpi37++) {
                var sf37b = vpi37/(NVP37-1);
                var ang37 = thrd.tOff + sf37b*6*Math.PI + t*(0.8 + vi37*0.1) + vort.phase;
                var r37b = 0.3 + 0.5*(1 - sf37b);
                thrd.pts[vpi37*3  ] = vort.x + r37b*Math.cos(ang37);
                thrd.pts[vpi37*3+1] = sf37b*6;
                thrd.pts[vpi37*3+2] = r37b*Math.sin(ang37);
              }
              thrd.line.geometry.attributes.position.needsUpdate = true;
              thrd.line.material.opacity = 0.35 + 0.15*Math.sin(t*2 + vort.phase + ti37);
            }
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 114 injected! Lines:", lineCount);
