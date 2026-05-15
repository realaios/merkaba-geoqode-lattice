"use strict";
// inject-w123.cjs — Wave 123: cosmic-alf-speed-resonance-cavity + stellar-granule-supergranule-boundary
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes('AFRAME.registerComponent("cosmic-alf-speed-resonance-cavity"')
) {
  console.log("Wave 123 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR = "      <a-entity stellar-flare-ribbon-sweep></a-entity>";
const HTML_INSERT = `      <a-entity stellar-flare-ribbon-sweep></a-entity>
      <!-- ── COSMIC ALF-SPEED RESONANCE CAVITY — standing Alfven-wave resonance bouncing between plasma boundaries ── -->
      <a-entity cosmic-alf-speed-resonance-cavity></a-entity>
      <!-- ── STELLAR GRANULE-SUPERGRANULE BOUNDARY — turbulent interface where ~1 Mm granules tile within a ~30 Mm supergranule cell ── -->
      <a-entity stellar-granule-supergranule-boundary></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC ALF-SPEED RESONANCE CAVITY — the field-aligned Alfvén wave
         bounces between magnetic mirror points, setting up a standing-wave
         resonance (FLR — field-line resonance) that drives discrete Pc5
         ULF pulsations in planetary magnetospheres.
         Renders: standing-wave envelope oscillating along a field line.
         Position: (600, 800, -200).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-alf-speed-resonance-cavity", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(600, 800, -200);
          scene.add(this._root);

          var NM53 = 5;
          this._modes53 = [];
          for (var mi53 = 0; mi53 < NM53; mi53++) {
            var NP53 = 120;
            var mPts53 = new Float32Array(NP53*3);
            var mGeo53 = new THREE.BufferGeometry();
            mGeo53.setAttribute("position", new THREE.BufferAttribute(mPts53, 3));
            var mLine53 = new THREE.Line(mGeo53, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.55 + mi53*0.05, 1.0, 0.6),
              transparent: true, opacity: 0.55,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(mLine53);
            this._modes53.push({ line: mLine53, pts: mPts53, n: mi53+1 });
          }
          this._alfTime = 0;
          console.log("[cosmic-alf-speed-resonance-cavity] loaded at (600,800,-200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._alfTime += dt;
          var t = this._alfTime;
          for (var mi54 = 0; mi54 < this._modes53.length; mi54++) {
            var md = this._modes53[mi54];
            var NP54 = md.pts.length/3;
            for (var pi54 = 0; pi54 < NP54; pi54++) {
              var s54 = pi54/(NP54-1);
              var y54 = (s54-0.5)*8;
              var amp54 = Math.sin(md.n*Math.PI*s54) * Math.cos(t*(md.n*0.8+0.5)) * 0.6;
              md.pts[pi54*3  ] = amp54;
              md.pts[pi54*3+1] = y54;
              md.pts[pi54*3+2] = 0;
            }
            md.line.geometry.attributes.position.needsUpdate = true;
            md.line.material.opacity = 0.3 + 0.3*Math.abs(Math.sin(t*0.7 + mi54));
          }
        },
      });

      /* ====================================================================
         STELLAR GRANULE-SUPERGRANULE BOUNDARY — the photosphere is tiled by
         convective granules (~1 Mm, 5–10 min lifetime) nested within larger
         supergranule cells (~30 Mm, ~1 day lifetime); magnetic network lanes
         outline the supergranule edges where field is swept.
         Renders: large hex cell with small nested hexagons along the boundary.
         Position: (-1000, 400, -400).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-granule-supergranule-boundary", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-1000, 400, -400);
          scene.add(this._root);

          var drawHex53 = function(R, cx, cy, mat) {
            var NP = 7;
            var pts = new Float32Array(NP*3);
            for (var k=0; k<6; k++) {
              var a = (k/6)*2*Math.PI;
              pts[k*3  ] = cx + R*Math.cos(a);
              pts[k*3+1] = cy + R*Math.sin(a);
              pts[k*3+2] = 0;
            }
            pts[6*3]=pts[0]; pts[6*3+1]=pts[1]; pts[6*3+2]=0;
            var g = new THREE.BufferGeometry();
            g.setAttribute("position", new THREE.BufferAttribute(pts, 3));
            return new THREE.Line(g, mat);
          };

          var supMat = new THREE.LineBasicMaterial({ color: 0x4499ff, transparent: true, opacity: 0.5 });
          this._sup = drawHex53(4, 0, 0, supMat);
          this._root.add(this._sup);

          this._grans = [];
          var NGran = 12;
          for (var gi53 = 0; gi53 < NGran; gi53++) {
            var ang53 = (gi53/NGran)*2*Math.PI;
            var grMat = new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.1 + 0.05*(gi53%3), 1.0, 0.65),
              transparent: true, opacity: 0.45,
            });
            var gx53 = 4*Math.cos(ang53);
            var gy53 = 4*Math.sin(ang53);
            var gLine53 = drawHex53(0.5, gx53, gy53, grMat);
            this._root.add(gLine53);
            this._grans.push({ line: gLine53, ang: ang53 });
          }
          this._sgsbTime = 0;
          console.log("[stellar-granule-supergranule-boundary] loaded at (-1000,400,-400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._sgsbTime += dt;
          var t = this._sgsbTime;
          this._root.rotation.y = t * 0.05;
          for (var gi54 = 0; gi54 < this._grans.length; gi54++) {
            var gr = this._grans[gi54];
            gr.line.material.opacity = 0.3 + 0.25*Math.abs(Math.sin(t*2 + gr.ang));
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 123 injected! Lines:", lineCount);
