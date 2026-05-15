"use strict";
// inject-w97.cjs — Wave 97: cosmic-flux-rope-kink-instability + stellar-wind-cavity-bubble
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes('AFRAME.registerComponent("cosmic-flux-rope-kink-instability"')
) {
  console.log("Wave 97 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity stellar-p-mode-oscillation-web></a-entity>";
const HTML_INSERT = `      <a-entity stellar-p-mode-oscillation-web></a-entity>
      <!-- ── COSMIC FLUX ROPE KINK INSTABILITY — kinked flux rope eruption ── -->
      <a-entity cosmic-flux-rope-kink-instability></a-entity>
      <!-- ── STELLAR WIND CAVITY BUBBLE — stellar wind blows cavity in ISM ── -->
      <a-entity stellar-wind-cavity-bubble></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC FLUX ROPE KINK INSTABILITY — coronal flux ropes become
         kink-unstable above a critical twist angle, erupting as CMEs.
         Renders: a twisted helical tube that kinks and writhes over time.
         Position: (900, 200, -600).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-flux-rope-kink-instability", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(900, 200, -600);
          scene.add(this._root);

          var NKS = 300;
          var kPts = new Float32Array(NKS*3);
          this._kPts = kPts;
          this._NKS = NKS;
          var kGeo = new THREE.BufferGeometry();
          kGeo.setAttribute("position", new THREE.BufferAttribute(kPts, 3));
          this._kline = new THREE.Line(kGeo, new THREE.LineBasicMaterial({
            color: 0xff3300, transparent: true, opacity: 0.6,
            blending: THREE.AdditiveBlending,
          }));
          this._root.add(this._kline);

          /* halo points */
          var NH2 = 2000;
          var hPts2 = new Float32Array(NH2*3);
          this._hPts2 = hPts2; this._NH2 = NH2;
          var hGeo2 = new THREE.BufferGeometry();
          hGeo2.setAttribute("position", new THREE.BufferAttribute(hPts2, 3));
          this._halo2 = new THREE.Points(hGeo2, new THREE.PointsMaterial({
            color: 0xff9900, size: 0.6, transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._halo2);
          this._cfrkTime = 0;
          console.log("[cosmic-flux-rope-kink-instability] loaded at (900,200,-600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cfrkTime += dt;
          var t = this._cfrkTime;
          var NKS = this._NKS;
          for (var ki = 0; ki < NKS; ki++) {
            var kf = ki/(NKS-1);
            var kz = -30 + kf*60;
            var kink = 6*Math.sin(kf*Math.PI*2 + t*0.8);
            var twist = kf*Math.PI*6 + t*0.5;
            var kr = 4 + 2*Math.sin(kf*Math.PI + t*0.3);
            this._kPts[ki*3  ] = kr*Math.cos(twist) + kink;
            this._kPts[ki*3+1] = kz;
            this._kPts[ki*3+2] = kr*Math.sin(twist);
          }
          this._kline.geometry.attributes.position.needsUpdate = true;
          /* scatter halo near kink */
          for (var hi2 = 0; hi2 < this._NH2; hi2++) {
            var hf = Math.random();
            var hz = -30 + hf*60;
            var hkink = 6*Math.sin(hf*Math.PI*2 + t*0.8);
            var ht2 = hf*Math.PI*6 + t*0.5;
            var hr2 = 4 + 2*Math.sin(hf*Math.PI + t*0.3);
            this._hPts2[hi2*3  ] = hr2*Math.cos(ht2) + hkink + (Math.random()-0.5)*3;
            this._hPts2[hi2*3+1] = hz + (Math.random()-0.5)*2;
            this._hPts2[hi2*3+2] = hr2*Math.sin(ht2) + (Math.random()-0.5)*3;
          }
          this._halo2.geometry.attributes.position.needsUpdate = true;
          this._halo2.material.opacity = 0.2 + 0.1*Math.sin(t*1.7);
        },
      });

      /* ====================================================================
         STELLAR WIND CAVITY BUBBLE — fast stellar wind sweeps surrounding
         ISM into a hot low-density bubble with a dense compressed shell.
         Renders: a slowly expanding bubble with bright compressed rim.
         Position: (200, -600, 900).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("stellar-wind-cavity-bubble", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(200, -600, 900);
          scene.add(this._root);

          /* interior hot wind particles */
          var NI = 2000;
          var iPts = new Float32Array(NI*3);
          for (var ii = 0; ii < NI; ii++) {
            var ia = Math.random()*2*Math.PI, ib = Math.random()*Math.PI;
            var ir = Math.random()*14;
            iPts[ii*3  ] = ir*Math.sin(ib)*Math.cos(ia);
            iPts[ii*3+1] = ir*Math.cos(ib);
            iPts[ii*3+2] = ir*Math.sin(ib)*Math.sin(ia);
          }
          var iGeo = new THREE.BufferGeometry();
          iGeo.setAttribute("position", new THREE.BufferAttribute(iPts, 3));
          this._root.add(new THREE.Points(iGeo, new THREE.PointsMaterial({
            color: 0x44aaff, size: 0.35, transparent: true, opacity: 0.07,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* shell */
          var NS = 5000;
          var sPts = new Float32Array(NS*3);
          this._sPts = sPts; this._NS = NS;
          for (var si = 0; si < NS; si++) {
            var sa = Math.random()*2*Math.PI, sb = Math.random()*Math.PI;
            sPts[si*3  ] = Math.sin(sb)*Math.cos(sa);
            sPts[si*3+1] = Math.cos(sb);
            sPts[si*3+2] = Math.sin(sb)*Math.sin(sa);
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(sPts, 3));
          this._shell3 = new THREE.Points(sGeo, new THREE.PointsMaterial({
            color: 0x88ddff, size: 0.7, transparent: true, opacity: 0.4,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._shell3);
          this._swcbTime = 0;
          console.log("[stellar-wind-cavity-bubble] loaded at (200,-600,900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._swcbTime += dt;
          var r = 16 + 4*Math.sin(this._swcbTime*0.4);
          this._shell3.scale.set(r, r, r);
          this._shell3.material.opacity = 0.35 + 0.1*Math.sin(this._swcbTime*0.9);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 97 injected! Lines:", lineCount);
