"use strict";
// inject-w104.cjs — Wave 104: cosmic-magneto-acoustic-compressional-mode + stellar-rossby-wave-vortex-lattice
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes(
    'AFRAME.registerComponent("cosmic-magneto-acoustic-compressional-mode"',
  )
) {
  console.log("Wave 104 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity stellar-differential-rotation-cone></a-entity>";
const HTML_INSERT = `      <a-entity stellar-differential-rotation-cone></a-entity>
      <!-- ── COSMIC MAGNETO-ACOUSTIC COMPRESSIONAL MODE — magneto-acoustic fast-mode density rings ── -->
      <a-entity cosmic-magneto-acoustic-compressional-mode></a-entity>
      <!-- ── STELLAR ROSSBY WAVE VORTEX LATTICE — Rossby wave vortex lattice in stellar atmosphere ── -->
      <a-entity stellar-rossby-wave-vortex-lattice></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC MAGNETO-ACOUSTIC COMPRESSIONAL MODE — fast magneto-acoustic
         waves propagate isotropically and can compress and rarefy the plasma
         in alternating rings at the Alfvén-sound hybrid speed.
         Renders: expanding concentric density rings with brightness pulses.
         Position: (0, 300, -700).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("cosmic-magneto-acoustic-compressional-mode", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(0, 300, -700);
          scene.add(this._root);

          this._rings10 = [];
          var NRINGS10 = 10;
          for (var ri10 = 0; ri10 < NRINGS10; ri10++) {
            var NRL10 = 120;
            var rPts10 = new Float32Array(NRL10*3);
            var rGeo10 = new THREE.BufferGeometry();
            rGeo10.setAttribute("position", new THREE.BufferAttribute(rPts10, 3));
            var rLine10 = new THREE.Line(rGeo10, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.5, 1.0, 0.65),
              transparent: true, opacity: 0.5,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(rLine10);
            this._rings10.push({ line: rLine10, pts: rPts10, phase: ri10/NRINGS10 });
          }
          this._cmacmTime = 0;
          console.log("[cosmic-magneto-acoustic-compressional-mode] loaded at (0,300,-700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cmacmTime += dt;
          var t = this._cmacmTime;
          for (var ri11 = 0; ri11 < this._rings10.length; ri11++) {
            var ring = this._rings10[ri11];
            var NRL11 = ring.pts.length/3;
            var phase11 = ring.phase;
            var tmod = (t*0.4 + phase11) % 1.0;
            var rRadius = tmod * 20;
            var rBright = Math.sin(tmod * Math.PI);
            for (var k10 = 0; k10 < NRL11; k10++) {
              var ang10 = (k10/(NRL11-1))*2*Math.PI;
              ring.pts[k10*3  ] = rRadius*Math.cos(ang10);
              ring.pts[k10*3+1] = 0;
              ring.pts[k10*3+2] = rRadius*Math.sin(ang10);
            }
            ring.line.geometry.attributes.position.needsUpdate = true;
            ring.line.material.opacity = 0.6 * rBright;
          }
        },
      });

      /* ====================================================================
         STELLAR ROSSBY WAVE VORTEX LATTICE — stellar Rossby waves (r-modes)
         form a latitude-dependent vortex lattice in rapidly rotating stars;
         each latitude band exhibits a periodic pattern of cyclone/anticyclone
         pairs at the Rossby radius.
         Renders: a grid of alternating rotating vortex circles.
         Position: (-700, -500, 0).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("stellar-rossby-wave-vortex-lattice", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-700, -500, 0);
          scene.add(this._root);

          this._vortices = [];
          var NLAT12 = 5;
          var NLON12 = 6;
          for (var la12 = 0; la12 < NLAT12; la12++) {
            for (var lo12 = 0; lo12 < NLON12; lo12++) {
              var NVP12 = 200;
              var vPts12 = new Float32Array(NVP12*3);
              var vGeo12 = new THREE.BufferGeometry();
              vGeo12.setAttribute("position", new THREE.BufferAttribute(vPts12, 3));
              var sign12 = ((la12+lo12)%2===0) ? 1 : -1;
              var vMat12 = new THREE.PointsMaterial({
                color: sign12>0 ? 0x4499ff : 0xff6622,
                size: 0.45, transparent: true, opacity: 0.3,
                blending: THREE.AdditiveBlending, depthWrite: false,
              });
              var vMesh12 = new THREE.Points(vGeo12, vMat12);
              this._root.add(vMesh12);
              var cx12 = (lo12-NLON12/2)*5;
              var cy12 = (la12-NLAT12/2)*5;
              this._vortices.push({ mesh: vMesh12, pts: vPts12, cx: cx12, cy: cy12, sign: sign12 });
            }
          }
          this._srwvlTime = 0;
          console.log("[stellar-rossby-wave-vortex-lattice] loaded at (-700,-500,0)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._srwvlTime += dt;
          var t = this._srwvlTime;
          for (var vi12 = 0; vi12 < this._vortices.length; vi12++) {
            var vrt = this._vortices[vi12];
            var NVP13 = vrt.pts.length/3;
            for (var vpi = 0; vpi < NVP13; vpi++) {
              var rA13 = Math.random()*2*Math.PI;
              var rR13 = Math.random()*2;
              var vBase = rA13 + t*vrt.sign*0.6;
              vrt.pts[vpi*3  ] = vrt.cx + rR13*Math.cos(vBase);
              vrt.pts[vpi*3+1] = vrt.cy + rR13*Math.sin(vBase);
              vrt.pts[vpi*3+2] = (Math.random()-0.5)*0.3;
            }
            vrt.mesh.geometry.attributes.position.needsUpdate = true;
            vrt.mesh.material.opacity = 0.25 + 0.1*Math.sin(t*1.1 + vi12*0.5);
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 104 injected! Lines:", lineCount);
