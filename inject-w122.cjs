"use strict";
// inject-w122.cjs — Wave 122: cosmic-z-pinch-sausage-instability + stellar-flare-ribbon-sweep
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes('AFRAME.registerComponent("cosmic-z-pinch-sausage-instability"')
) {
  console.log("Wave 122 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity stellar-post-flare-loop-arcade></a-entity>";
const HTML_INSERT = `      <a-entity stellar-post-flare-loop-arcade></a-entity>
      <!-- ── COSMIC Z-PINCH SAUSAGE INSTABILITY — m=0 pinch mode necking a current-carrying plasma column ── -->
      <a-entity cosmic-z-pinch-sausage-instability></a-entity>
      <!-- ── STELLAR FLARE RIBBON SWEEP — bright chromospheric ribbons sweeping apart across an active region during a two-ribbon flare ── -->
      <a-entity stellar-flare-ribbon-sweep></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC Z-PINCH SAUSAGE INSTABILITY — a self-pinched plasma column
         carrying axial current is unstable to the m=0 (sausage) mode:
         azimuthally symmetric necking and bulging grow exponentially until
         the column fragments into isolated plasmoids.
         Renders: undulating tube that develops periodic necks and bulges.
         Position: (-400, 1000, 300).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-z-pinch-sausage-instability", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-400, 1000, 300);
          scene.add(this._root);

          var NSEG52 = 80;
          this._seg52 = NSEG52;
          var N52 = NSEG52 + 1;
          var NRING52 = 16;
          var verts52 = new Float32Array(N52*NRING52*3);
          this._geo52 = new THREE.BufferGeometry();
          this._geo52.setAttribute("position", new THREE.BufferAttribute(verts52, 3));
          var idx52 = [];
          for (var si52 = 0; si52 < NSEG52; si52++) {
            for (var ri52 = 0; ri52 < NRING52; ri52++) {
              var a52 = si52*NRING52 + ri52;
              var b52 = a52 + NRING52;
              var c52 = si52*NRING52 + (ri52+1)%NRING52;
              var d52 = b52 - NRING52 + (ri52+1)%NRING52;
              idx52.push(a52, b52, c52, b52, d52, c52);
            }
          }
          this._geo52.setIndex(idx52);
          this._tube52 = new THREE.Mesh(this._geo52, new THREE.MeshBasicMaterial({
            color: 0x88ddff, wireframe: true, transparent: true, opacity: 0.35,
          }));
          this._root.add(this._tube52);
          this._verts52 = verts52;
          this._zpsiTime = 0;
          console.log("[cosmic-z-pinch-sausage-instability] loaded at (-400,1000,300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._zpsiTime += dt;
          var t = this._zpsiTime;
          var NRING52 = 16;
          var N52 = this._seg52 + 1;
          for (var si53 = 0; si53 < N52; si53++) {
            var s53 = si53 / this._seg52;
            var z53 = (s53 - 0.5) * 8;
            var kmode53 = 2.5;
            var r53 = 0.7 + 0.35*Math.sin(kmode53*2*Math.PI*s53 - t*1.8);
            for (var ri53 = 0; ri53 < NRING52; ri53++) {
              var phi53 = (ri53/NRING52)*2*Math.PI;
              var vi53 = si53*NRING52 + ri53;
              this._verts52[vi53*3  ] = r53*Math.cos(phi53);
              this._verts52[vi53*3+1] = z53;
              this._verts52[vi53*3+2] = r53*Math.sin(phi53);
            }
          }
          this._geo52.attributes.position.needsUpdate = true;
        },
      });

      /* ====================================================================
         STELLAR FLARE RIBBON SWEEP — during a solar eruptive flare, two
         bright UV/H-alpha ribbons form along the footpoints of the growing
         arcade, and progressively separate as reconnection climbs higher.
         The sweep velocity reveals the reconnection rate.
         Renders: two luminous curved lines separating symmetrically.
         Position: (-800, -100, 900).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-flare-ribbon-sweep", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-800, -100, 900);
          scene.add(this._root);

          var NP52 = 80;
          var r1Pts52 = new Float32Array(NP52*3);
          var r2Pts52 = new Float32Array(NP52*3);
          this._r1geo = new THREE.BufferGeometry();
          this._r2geo = new THREE.BufferGeometry();
          this._r1geo.setAttribute("position", new THREE.BufferAttribute(r1Pts52, 3));
          this._r2geo.setAttribute("position", new THREE.BufferAttribute(r2Pts52, 3));
          this._r1 = new THREE.Line(this._r1geo, new THREE.LineBasicMaterial({
            color: 0xff9944, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending,
          }));
          this._r2 = new THREE.Line(this._r2geo, new THREE.LineBasicMaterial({
            color: 0xff9944, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending,
          }));
          this._root.add(this._r1);
          this._root.add(this._r2);
          this._r1pts = r1Pts52; this._r2pts = r2Pts52;
          this._sfrswTime = 0;
          this._NP = NP52;
          console.log("[stellar-flare-ribbon-sweep] loaded at (-800,-100,900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._sfrswTime += dt;
          var t = this._sfrswTime;
          var sep52 = 0.5 + Math.min(t*0.4, 4);
          var NP52 = this._NP;
          for (var pi52 = 0; pi52 < NP52; pi52++) {
            var sf52 = (pi52/(NP52-1) - 0.5)*8;
            var curve52 = 0.3*Math.sin(pi52*Math.PI/NP52);
            this._r1pts[pi52*3  ] = sf52;
            this._r1pts[pi52*3+1] =  sep52 + curve52;
            this._r1pts[pi52*3+2] = 0;
            this._r2pts[pi52*3  ] = sf52;
            this._r2pts[pi52*3+1] = -sep52 - curve52;
            this._r2pts[pi52*3+2] = 0;
          }
          this._r1geo.attributes.position.needsUpdate = true;
          this._r2geo.attributes.position.needsUpdate = true;
          this._r1.material.opacity = 0.5 + 0.3*Math.abs(Math.sin(t*1.5));
          this._r2.material.opacity = this._r1.material.opacity;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 122 injected! Lines:", lineCount);
