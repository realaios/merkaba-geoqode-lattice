"use strict";
// inject-w102.cjs — Wave 102: cosmic-anisotropic-diffusion-filament + stellar-subsurface-shear-band
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes(
    'AFRAME.registerComponent("cosmic-anisotropic-diffusion-filament"',
  )
) {
  console.log("Wave 102 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity stellar-oscillatory-convection-plume></a-entity>";
const HTML_INSERT = `      <a-entity stellar-oscillatory-convection-plume></a-entity>
      <!-- ── COSMIC ANISOTROPIC DIFFUSION FILAMENT — field-aligned cosmic-ray diffusion streamer ── -->
      <a-entity cosmic-anisotropic-diffusion-filament></a-entity>
      <!-- ── STELLAR SUBSURFACE SHEAR BAND — near-surface shear layer rotational band ── -->
      <a-entity stellar-subsurface-shear-band></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC ANISOTROPIC DIFFUSION FILAMENT — cosmic rays and energetic
         particles diffuse much faster along magnetic field lines than across
         them, forming elongated diffusion streamers along flux tubes.
         Renders: a narrow bright streamer with lateral haze.
         Position: (-500, 500, -600).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("cosmic-anisotropic-diffusion-filament", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-500, 500, -600);
          scene.add(this._root);

          /* field-aligned streamer */
          var NAS = 2000;
          var asPts = new Float32Array(NAS*3);
          this._asPts = asPts; this._NAS = NAS;
          var asGeo = new THREE.BufferGeometry();
          asGeo.setAttribute("position", new THREE.BufferAttribute(asPts, 3));
          this._streamer = new THREE.Points(asGeo, new THREE.PointsMaterial({
            color: 0x66ffcc, size: 0.55, transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._streamer);

          /* lateral diffusion haze */
          var NLH = 1500;
          var lhPts = new Float32Array(NLH*3);
          this._lhPts = lhPts; this._NLH = NLH;
          var lhGeo = new THREE.BufferGeometry();
          lhGeo.setAttribute("position", new THREE.BufferAttribute(lhPts, 3));
          this._haze = new THREE.Points(lhGeo, new THREE.PointsMaterial({
            color: 0x33aa88, size: 0.4, transparent: true, opacity: 0.15,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._haze);
          this._cadfTime = 0;
          console.log("[cosmic-anisotropic-diffusion-filament] loaded at (-500,500,-600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cadfTime += dt;
          var t = this._cadfTime;
          for (var ai2 = 0; ai2 < this._NAS; ai2++) {
            var ah = (Math.random()-0.5)*30;
            var aRad = (Math.random())*0.8;
            var aA5 = Math.random()*2*Math.PI;
            this._asPts[ai2*3  ] = aRad*Math.cos(aA5) + 1.5*Math.sin(ah*0.2 + t);
            this._asPts[ai2*3+1] = ah;
            this._asPts[ai2*3+2] = aRad*Math.sin(aA5);
          }
          this._streamer.geometry.attributes.position.needsUpdate = true;
          for (var li = 0; li < this._NLH; li++) {
            var lh = (Math.random()-0.5)*30;
            var lRad = 0.8 + Math.random()*4;
            var lA5 = Math.random()*2*Math.PI;
            this._lhPts[li*3  ] = lRad*Math.cos(lA5) + 1.5*Math.sin(lh*0.2 + t);
            this._lhPts[li*3+1] = lh;
            this._lhPts[li*3+2] = lRad*Math.sin(lA5);
          }
          this._haze.geometry.attributes.position.needsUpdate = true;
          this._streamer.material.opacity = 0.4 + 0.1*Math.sin(t*1.8);
        },
      });

      /* ====================================================================
         STELLAR SUBSURFACE SHEAR BAND — a thin near-surface shear layer
         (NSSL) beneath the solar/stellar photosphere rotates differentially
         relative to the convection zone, shearing magnetic fields.
         Renders: a rotating equatorial band of shear-flow particles.
         Position: (200, -600, 400).
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("stellar-subsurface-shear-band", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(200, -600, 400);
          scene.add(this._root);

          var NBANDS = 8;
          this._bands = [];
          for (var bi2 = 0; bi2 < NBANDS; bi2++) {
            var NBP = 800;
            var bPts5 = new Float32Array(NBP*3);
            var bGeo5 = new THREE.BufferGeometry();
            bGeo5.setAttribute("position", new THREE.BufferAttribute(bPts5, 3));
            var bMat5 = new THREE.PointsMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.0 + bi2*0.04, 1.0, 0.55),
              size: 0.5, transparent: true, opacity: 0.3,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var bMesh5 = new THREE.Points(bGeo5, bMat5);
            this._root.add(bMesh5);
            var bLat = (bi2/(NBANDS-1)-0.5)*Math.PI*0.6;
            var bOmega = 0.4 + bi2*0.08;
            this._bands.push({ mesh: bMesh5, pts: bPts5, lat: bLat, omega: bOmega });
          }
          this._ssbTime = 0;
          console.log("[stellar-subsurface-shear-band] loaded at (200,-600,400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._ssbTime += dt;
          var t = this._ssbTime;
          for (var bi3 = 0; bi3 < this._bands.length; bi3++) {
            var band = this._bands[bi3];
            var NBP2 = band.pts.length/3;
            for (var bpi = 0; bpi < NBP2; bpi++) {
              var bA6 = Math.random()*2*Math.PI + t*band.omega;
              var bR6 = 12 + (Math.random()-0.5)*1.5;
              band.pts[bpi*3  ] = bR6*Math.cos(band.lat)*Math.cos(bA6);
              band.pts[bpi*3+1] = bR6*Math.sin(band.lat) + (Math.random()-0.5)*1;
              band.pts[bpi*3+2] = bR6*Math.cos(band.lat)*Math.sin(bA6);
            }
            band.mesh.geometry.attributes.position.needsUpdate = true;
            band.mesh.material.opacity = 0.25 + 0.1*Math.sin(t*band.omega);
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 102 injected! Lines:", lineCount);
