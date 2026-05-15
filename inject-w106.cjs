"use strict";
// inject-w106.cjs — Wave 106: cosmic-cosmic-string-wake-overdensity + stellar-helicity-flux-eruption
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes('AFRAME.registerComponent("cosmic-string-wake-overdensity"')
) {
  console.log("Wave 106 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity stellar-thermohaline-mixing-layer></a-entity>";
const HTML_INSERT = `      <a-entity stellar-thermohaline-mixing-layer></a-entity>
      <!-- ── COSMIC STRING WAKE OVERDENSITY — particle overdensity sheet trailing a cosmic string ── -->
      <a-entity cosmic-string-wake-overdensity></a-entity>
      <!-- ── STELLAR HELICITY FLUX ERUPTION — magnetic helicity injection erupting from convection zone ── -->
      <a-entity stellar-helicity-flux-eruption></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC STRING WAKE OVERDENSITY — a cosmic string moving through
         primordial gas creates a conical wake; baryons fall into this
         wake forming a thin planar overdensity sheet (the string wake).
         Renders: a thin glowing sheet rippling along a string trajectory.
         Position: (-600, 200, -500).
         @alignment 8→26→48:480  @frequency 72  @domain self-evolve
      ==================================================================== */
      AFRAME.registerComponent("cosmic-string-wake-overdensity", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-600, 200, -500);
          scene.add(this._root);

          var NWP = 4000;
          var wPts16 = new Float32Array(NWP*3);
          this._wPts16 = wPts16; this._NWP = NWP;
          var wGeo16 = new THREE.BufferGeometry();
          wGeo16.setAttribute("position", new THREE.BufferAttribute(wPts16, 3));
          this._sheet = new THREE.Points(wGeo16, new THREE.PointsMaterial({
            color: 0xccaaff, size: 0.45, transparent: true, opacity: 0.2,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._sheet);

          /* string trajectory line */
          var NSL16 = 80;
          var sPts16 = new Float32Array(NSL16*3);
          this._sPts16 = sPts16;
          var sGeo16 = new THREE.BufferGeometry();
          sGeo16.setAttribute("position", new THREE.BufferAttribute(sPts16, 3));
          this._strLine = new THREE.Line(sGeo16, new THREE.LineBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending,
          }));
          this._root.add(this._strLine);
          this._cswoTime = 0;
          console.log("[cosmic-string-wake-overdensity] loaded at (-600,200,-500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cswoTime += dt;
          var t = this._cswoTime;
          /* string line: diagonal trajectory */
          for (var si16 = 0; si16 < this._sPts16.length/3; si16++) {
            var sf = si16/(this._sPts16.length/3-1);
            var sx = (sf-0.5)*25;
            this._sPts16[si16*3  ] = sx;
            this._sPts16[si16*3+1] = sx*0.3 + 0.5*Math.sin(sx*0.5 + t*0.3);
            this._sPts16[si16*3+2] = 0;
          }
          this._strLine.geometry.attributes.position.needsUpdate = true;
          /* wake sheet: particles in XZ plane behind string */
          for (var wi16 = 0; wi16 < this._NWP; wi16++) {
            var wx = (Math.random()-0.5)*25;
            var wz = Math.random()*8;
            var wy = wx*0.3 + 0.5*Math.sin(wx*0.5 + t*0.3) + (Math.random()-0.5)*0.3;
            this._wPts16[wi16*3  ] = wx;
            this._wPts16[wi16*3+1] = wy;
            this._wPts16[wi16*3+2] = wz;
          }
          this._sheet.geometry.attributes.position.needsUpdate = true;
          this._sheet.material.opacity = 0.15 + 0.07*Math.sin(t*0.7);
        },
      });

      /* ====================================================================
         STELLAR HELICITY FLUX ERUPTION — magnetic helicity (twist/writhe
         of field lines) accumulates in the convection zone and erupts through
         the photosphere in periodic injections, visible as writhing loop arches.
         Renders: a spiraling twisted flux-tube arch rising from a base plane.
         Position: (400, -700, -100).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-helicity-flux-eruption", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(400, -700, -100);
          scene.add(this._root);

          var NARCH = 5;
          this._arches = [];
          for (var ai17 = 0; ai17 < NARCH; ai17++) {
            var NAP17 = 200;
            var aPts17 = new Float32Array(NAP17*3);
            var aGeo17 = new THREE.BufferGeometry();
            aGeo17.setAttribute("position", new THREE.BufferAttribute(aPts17, 3));
            var aLine17 = new THREE.Line(aGeo17, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.0 + ai17*0.05, 1.0, 0.6),
              transparent: true, opacity: 0.5,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(aLine17);
            this._arches.push({ line: aLine17, pts: aPts17, phase: ai17*0.8, xOff: (ai17-NARCH/2)*3.5 });
          }
          this._shfeTime = 0;
          console.log("[stellar-helicity-flux-eruption] loaded at (400,-700,-100)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._shfeTime += dt;
          var t = this._shfeTime;
          for (var ai18 = 0; ai18 < this._arches.length; ai18++) {
            var arch = this._arches[ai18];
            var NAP18 = arch.pts.length/3;
            for (var api = 0; api < NAP18; api++) {
              var af = api/(NAP18-1);
              var aHeight = Math.sin(af*Math.PI)*10;
              var aX = (af-0.5)*12 + arch.xOff;
              var twist = 3*Math.sin(af*Math.PI*3 + t*2 + arch.phase);
              arch.pts[api*3  ] = aX + twist*0.5;
              arch.pts[api*3+1] = aHeight;
              arch.pts[api*3+2] = twist;
            }
            arch.line.geometry.attributes.position.needsUpdate = true;
            arch.line.material.opacity = 0.4 + 0.2*Math.sin(t*1.5 + arch.phase);
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 106 injected! Lines:", lineCount);
