"use strict";
// inject-w94.cjs — Wave 94: cosmic-ram-pressure-bow-wave + interstellar-alf-speed-mach-cone
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("cosmic-ram-pressure-bow-wave"')) {
  console.log("Wave 94 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity stellar-cepheid-pulsation-shell></a-entity>";
const HTML_INSERT = `      <a-entity stellar-cepheid-pulsation-shell></a-entity>
      <!-- ── COSMIC RAM PRESSURE BOW WAVE — galaxy stripping bow shock ── -->
      <a-entity cosmic-ram-pressure-bow-wave></a-entity>
      <!-- ── INTERSTELLAR ALFVEN MACH CONE — super-Alfvenic bow cone in ISM ── -->
      <a-entity interstellar-alf-speed-mach-cone></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC RAM PRESSURE BOW WAVE — a galaxy moving supersonically
         through the ICM generates a bow shock; ram pressure strips its
         gas tail.  Renders: bow shock arc + stripped gas tail streaming.
         Position: (900, 200, 0).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("cosmic-ram-pressure-bow-wave", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(900, 200, 0);
          scene.add(this._root);

          /* galaxy body */
          var gPts = new Float32Array(2000*3);
          for (var gi = 0; gi < 2000; gi++) {
            var ga = Math.random()*2*Math.PI;
            var gr = Math.random()*15;
            gPts[gi*3  ] = gr*Math.cos(ga);
            gPts[gi*3+1] = gr*Math.sin(ga)*0.3;
            gPts[gi*3+2] = (Math.random()-0.5)*2;
          }
          var gGeo = new THREE.BufferGeometry();
          gGeo.setAttribute("position", new THREE.BufferAttribute(gPts, 3));
          this._root.add(new THREE.Points(gGeo, new THREE.PointsMaterial({
            color: 0xffffcc, size: 0.4,
            transparent: true, opacity: 0.6,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* bow shock arc */
          var bsPts = [];
          for (var bsa = -90; bsa <= 90; bsa += 3) {
            var bsrad = bsa * Math.PI/180;
            bsPts.push(-20 + 10*Math.abs(Math.cos(bsrad)), 30*Math.sin(bsrad), 0);
          }
          var bsGeo = new THREE.BufferGeometry();
          bsGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(bsPts), 3));
          this._bowShock = new THREE.Line(bsGeo, new THREE.LineBasicMaterial({
            color: 0xff5500, transparent: true, opacity: 0.7,
            blending: THREE.AdditiveBlending,
          }));
          this._root.add(this._bowShock);

          /* stripped gas tail */
          var NT = 4000;
          var tPts = new Float32Array(NT*3);
          this._tPts = tPts; this._NT = NT;
          for (var ti = 0; ti < NT; ti++) {
            var tf = Math.random();
            tPts[ti*3  ] = 20 + tf*80 + (Math.random()-0.5)*10;
            tPts[ti*3+1] = (Math.random()-0.5)*20*(1-tf);
            tPts[ti*3+2] = (Math.random()-0.5)*6;
          }
          var tGeo = new THREE.BufferGeometry();
          tGeo.setAttribute("position", new THREE.BufferAttribute(tPts, 3));
          this._tail = new THREE.Points(tGeo, new THREE.PointsMaterial({
            color: 0x44aaff, size: 0.5,
            transparent: true, opacity: 0.2,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._tail);
          this._crpbwTime = 0;
          console.log("[cosmic-ram-pressure-bow-wave] loaded at (900,200,0)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._crpbwTime += dt;
          var t = this._crpbwTime;
          this._bowShock.material.opacity = 0.6 + 0.15*Math.sin(t*2.1);
          this._tail.material.opacity = 0.15 + 0.07*Math.sin(t*1.5);
        },
      });

      /* ====================================================================
         INTERSTELLAR ALFVEN MACH CONE — a stellar-wind source moving
         super-Alfvenically through the magnetized ISM drives an oblique
         Mach cone analogous to a sonic boom.
         Renders: cone surface + interior field compression stripes.
         Position: (200, -600, -900).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("interstellar-alf-speed-mach-cone", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(200, -600, -900);
          scene.add(this._root);

          /* Mach cone outline — 3 lines */
          var halfAngle = 20 * Math.PI/180;
          var dirs = [1, -1];
          for (var di = 0; di < 2; di++) {
            var cPts = [0,0,0, 60*Math.cos(halfAngle), dirs[di]*60*Math.sin(halfAngle), 0];
            var cGeo = new THREE.BufferGeometry();
            cGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(cPts), 3));
            this._root.add(new THREE.Line(cGeo, new THREE.LineBasicMaterial({
              color: 0x00ddff, transparent: true, opacity: 0.7,
              blending: THREE.AdditiveBlending,
            })));
          }

          /* cone interior field compression */
          var NC2 = 5000;
          var cPts2 = new Float32Array(NC2*3);
          this._cPts2 = cPts2; this._NC2 = NC2;
          for (var ci2 = 0; ci2 < NC2; ci2++) {
            var cx = Math.random()*60;
            var maxY = cx*Math.tan(halfAngle);
            cPts2[ci2*3  ] = cx;
            cPts2[ci2*3+1] = (Math.random()*2-1)*maxY;
            cPts2[ci2*3+2] = (Math.random()-0.5)*10;
          }
          var cGeo2 = new THREE.BufferGeometry();
          cGeo2.setAttribute("position", new THREE.BufferAttribute(cPts2, 3));
          this._interior = new THREE.Points(cGeo2, new THREE.PointsMaterial({
            color: 0x88eeff, size: 0.4,
            transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._interior);

          /* apex source point */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(2, 6, 5),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })
          ));

          this._iamcTime = 0;
          console.log("[interstellar-alf-speed-mach-cone] loaded at (200,-600,-900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._iamcTime += dt;
          var t = this._iamcTime;
          this._interior.material.opacity = 0.1 + 0.05*Math.sin(t*1.9);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 94 injected! Lines:", lineCount);
