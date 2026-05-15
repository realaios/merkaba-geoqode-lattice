"use strict";
// inject-w96.cjs — Wave 96: cosmic-magnetorotational-vortex-ring + stellar-p-mode-oscillation-web
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes(
    'AFRAME.registerComponent("cosmic-magnetorotational-vortex-ring"',
  )
) {
  console.log("Wave 96 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity stellar-opacity-ionization-front></a-entity>";
const HTML_INSERT = `      <a-entity stellar-opacity-ionization-front></a-entity>
      <!-- ── COSMIC MAGNETOROTATIONAL VORTEX RING — MRI-driven vortex rings ── -->
      <a-entity cosmic-magnetorotational-vortex-ring></a-entity>
      <!-- ── STELLAR P-MODE OSCILLATION WEB — acoustic pressure mode mesh ── -->
      <a-entity stellar-p-mode-oscillation-web></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC MAGNETOROTATIONAL VORTEX RING — the MRI in differentially
         rotating plasma generates toroidal vortex rings that amplify
         magnetic fields and drive accretion turbulence.
         Renders: stacked toroidal particle rings with rotating twist.
         Position: (-800, -300, 500).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("cosmic-magnetorotational-vortex-ring", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-800, -300, 500);
          scene.add(this._root);

          this._rings = [];
          var NRL = 5;
          for (var ri = 0; ri < NRL; ri++) {
            var R = 8 + ri*5;
            var NRP = 1200;
            var rPts = new Float32Array(NRP*3);
            for (var rp = 0; rp < NRP; rp++) {
              var ra = Math.random()*2*Math.PI;
              var rt = Math.random()*2*Math.PI;
              var rr = 1.5 + Math.random()*0.5;
              rPts[rp*3  ] = (R + rr*Math.cos(rt))*Math.cos(ra);
              rPts[rp*3+1] = rr*Math.sin(rt);
              rPts[rp*3+2] = (R + rr*Math.cos(rt))*Math.sin(ra);
            }
            var rGeo = new THREE.BufferGeometry();
            rGeo.setAttribute("position", new THREE.BufferAttribute(rPts, 3));
            var rMat = new THREE.PointsMaterial({
              color: [0xff6600,0xff9933,0xffcc00,0xffaa55,0xff4400][ri],
              size: 0.5, transparent: true, opacity: 0.3,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var rMesh = new THREE.Points(rGeo, rMat);
            this._root.add(rMesh);
            this._rings.push({ mesh: rMesh, speed: 0.1 + ri*0.07, dir: ri%2===0?1:-1 });
          }
          this._cmvTime = 0;
          console.log("[cosmic-magnetorotational-vortex-ring] loaded at (-800,-300,500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cmvTime += dt;
          for (var ri2 = 0; ri2 < this._rings.length; ri2++) {
            var rng = this._rings[ri2];
            rng.mesh.rotation.y += rng.speed * rng.dir * dt;
            rng.mesh.material.opacity = 0.25 + 0.1*Math.sin(this._cmvTime*1.3 + ri2);
          }
        },
      });

      /* ====================================================================
         STELLAR P-MODE OSCILLATION WEB — the sun and stars vibrate in
         global acoustic (p-mode) standing waves detectable via
         Doppler shifts.  Renders: a concentric sphere grid pulsating in
         spatial eigenmodes.
         Position: (400, 900, -300).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("stellar-p-mode-oscillation-web", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(400, 900, -300);
          scene.add(this._root);

          /* lat/lon grid */
          var NLT = 12, NLN = 18, SRAD = 20;
          var lPts = [];
          for (var lt = 0; lt <= NLT; lt++) {
            var theta = (lt/NLT)*Math.PI;
            for (var ln = 0; ln <= NLN; ln++) {
              var phi = (ln/NLN)*2*Math.PI;
              lPts.push(SRAD*Math.sin(theta)*Math.cos(phi),
                        SRAD*Math.cos(theta),
                        SRAD*Math.sin(theta)*Math.sin(phi));
            }
          }
          var lGeo = new THREE.BufferGeometry();
          lGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lPts), 3));
          this._gridPts = new Float32Array(lPts);
          this._gridN = lPts.length/3;
          this._dispArr = new Float32Array(lPts);
          lGeo.setAttribute("position", new THREE.BufferAttribute(this._dispArr, 3));
          this._grid = new THREE.Points(lGeo, new THREE.PointsMaterial({
            color: 0xaaddff, size: 0.8, transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._grid);
          this._SRAD = SRAD;
          this._spowTime = 0;
          console.log("[stellar-p-mode-oscillation-web] loaded at (400,900,-300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._spowTime += dt;
          var t = this._spowTime;
          var gN = this._gridN;
          var gOrig = this._gridPts;
          var gDisp = this._dispArr;
          for (var gi2 = 0; gi2 < gN; gi2++) {
            var ox = gOrig[gi2*3], oy = gOrig[gi2*3+1], oz = gOrig[gi2*3+2];
            var r0 = Math.sqrt(ox*ox+oy*oy+oz*oz);
            var phase = ox*0.15 + oy*0.12 + oz*0.1 - t*2.8;
            var dr = 2.5*Math.sin(phase);
            var scale = (r0+dr)/r0;
            gDisp[gi2*3  ] = ox*scale;
            gDisp[gi2*3+1] = oy*scale;
            gDisp[gi2*3+2] = oz*scale;
          }
          this._grid.geometry.attributes.position.needsUpdate = true;
          this._grid.material.opacity = 0.45 + 0.1*Math.sin(t*2.1);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 96 injected! Lines:", lineCount);
