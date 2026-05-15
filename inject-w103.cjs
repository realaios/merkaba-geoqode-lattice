"use strict";
// inject-w103.cjs — Wave 103: cosmic-tearing-mode-island-chain + stellar-differential-rotation-cone
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes('AFRAME.registerComponent("cosmic-tearing-mode-island-chain"')
) {
  console.log("Wave 103 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR = "      <a-entity stellar-subsurface-shear-band></a-entity>";
const HTML_INSERT = `      <a-entity stellar-subsurface-shear-band></a-entity>
      <!-- ── COSMIC TEARING MODE ISLAND CHAIN — magnetic island chain from tearing instability ── -->
      <a-entity cosmic-tearing-mode-island-chain></a-entity>
      <!-- ── STELLAR DIFFERENTIAL ROTATION CONE — stellar rotation iso-rotation cone surface ── -->
      <a-entity stellar-differential-rotation-cone></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC TEARING MODE ISLAND CHAIN — the tearing instability creates
         a chain of closed magnetic flux-tube islands along a neutral sheet.
         Each island is an O-point topology loop separated by X-points.
         Renders: a row of glowing flux-loop oval rings.
         Position: (700, 0, -200).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("cosmic-tearing-mode-island-chain", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(700, 0, -200);
          scene.add(this._root);

          this._islands = [];
          var NI = 7;
          for (var ii = 0; ii < NI; ii++) {
            var pts7 = new Float32Array(200*3);
            var g7 = new THREE.BufferGeometry();
            g7.setAttribute("position", new THREE.BufferAttribute(pts7, 3));
            var loop7 = new THREE.Line(g7, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.55 + ii*0.05, 1.0, 0.65),
              transparent: true, opacity: 0.6,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(loop7);
            this._islands.push({ line: loop7, pts: pts7, ix: (ii-(NI-1)/2)*5 });
          }

          /* X-point sparks */
          var NXP = 1200;
          var xPts = new Float32Array(NXP*3);
          this._xPts = xPts; this._NXP = NXP;
          var xGeo = new THREE.BufferGeometry();
          xGeo.setAttribute("position", new THREE.BufferAttribute(xPts, 3));
          this._sparks = new THREE.Points(xGeo, new THREE.PointsMaterial({
            color: 0xffffff, size: 0.4, transparent: true, opacity: 0.3,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._sparks);
          this._cticTime = 0;
          console.log("[cosmic-tearing-mode-island-chain] loaded at (700,0,-200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cticTime += dt;
          var t = this._cticTime;
          for (var ii2 = 0; ii2 < this._islands.length; ii2++) {
            var isl = this._islands[ii2];
            var NLP = isl.pts.length/3;
            for (var k7 = 0; k7 < NLP; k7++) {
              var ang7 = (k7/(NLP-1))*2*Math.PI;
              var pulsate = 1.5 + 0.3*Math.sin(t*1.4 + ii2*0.7);
              isl.pts[k7*3  ] = isl.ix;
              isl.pts[k7*3+1] = pulsate*Math.sin(ang7)*2;
              isl.pts[k7*3+2] = pulsate*Math.cos(ang7);
            }
            isl.line.geometry.attributes.position.needsUpdate = true;
          }
          for (var xi = 0; xi < this._NXP; xi++) {
            var xbi = Math.floor(Math.random()*(this._islands.length-1));
            var xBetween = (xbi-(this._islands.length-1)/2)*5 + 2.5;
            this._xPts[xi*3  ] = xBetween + (Math.random()-0.5)*1;
            this._xPts[xi*3+1] = (Math.random()-0.5)*0.5;
            this._xPts[xi*3+2] = (Math.random()-0.5)*0.5;
          }
          this._sparks.geometry.attributes.position.needsUpdate = true;
          this._sparks.material.opacity = 0.2 + 0.15*Math.abs(Math.sin(t*2.5));
        },
      });

      /* ====================================================================
         STELLAR DIFFERENTIAL ROTATION CONE — stars rotate faster at the
         equator; iso-rotation surfaces form conical shells. This renders
         the angular velocity gradient as a set of rotating latitude cones.
         Renders: nested translucent rotation-speed cones.
         Position: (-400, 600, 100).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("stellar-differential-rotation-cone", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-400, 600, 100);
          scene.add(this._root);

          this._shells8 = [];
          var NSHELL8 = 9;
          for (var si8 = 0; si8 < NSHELL8; si8++) {
            var NRP8 = 600;
            var rPts8 = new Float32Array(NRP8*3);
            var rGeo8 = new THREE.BufferGeometry();
            rGeo8.setAttribute("position", new THREE.BufferAttribute(rPts8, 3));
            var rMat8 = new THREE.PointsMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.62 - si8*0.04, 1.0, 0.55),
              size: 0.45, transparent: true, opacity: 0.25,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var rMesh8 = new THREE.Points(rGeo8, rMat8);
            this._root.add(rMesh8);
            var lat8 = (si8/(NSHELL8-1)-0.5)*Math.PI*0.85;
            var omega8 = 0.6 - 0.4*(lat8/Math.PI*2)**2;
            this._shells8.push({ mesh: rMesh8, pts: rPts8, lat: lat8, omega: omega8 });
          }
          this._sdrcTime = 0;
          console.log("[stellar-differential-rotation-cone] loaded at (-400,600,100)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._sdrcTime += dt;
          var t = this._sdrcTime;
          for (var si9 = 0; si9 < this._shells8.length; si9++) {
            var sh = this._shells8[si9];
            var NRP9 = sh.pts.length/3;
            for (var ri = 0; ri < NRP9; ri++) {
              var rA9 = Math.random()*2*Math.PI + t*sh.omega;
              var rR9 = 10 + (Math.random()-0.5)*0.8;
              sh.pts[ri*3  ] = rR9*Math.cos(sh.lat)*Math.cos(rA9);
              sh.pts[ri*3+1] = rR9*Math.sin(sh.lat) + (Math.random()-0.5)*0.5;
              sh.pts[ri*3+2] = rR9*Math.cos(sh.lat)*Math.sin(rA9);
            }
            sh.mesh.geometry.attributes.position.needsUpdate = true;
            sh.mesh.material.opacity = 0.2 + 0.08*Math.sin(t*sh.omega*2);
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 103 injected! Lines:", lineCount);
