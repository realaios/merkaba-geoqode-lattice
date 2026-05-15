'use strict';
// inject-w109.cjs — Wave 109: cosmic-brunt-vaisala-gravity-wave + stellar-magnetoconvection-flux-sheet
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-brunt-vaisala-gravity-wave"')) {
  console.log('Wave 109 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-flux-emergence-serpentine></a-entity>';
const HTML_INSERT = `      <a-entity stellar-flux-emergence-serpentine></a-entity>
      <!-- ── COSMIC BRUNT-VAISALA GRAVITY WAVE — internal buoyancy oscillations at the Brunt-Vaisala freq ── -->
      <a-entity cosmic-brunt-vaisala-gravity-wave></a-entity>
      <!-- ── STELLAR MAGNETOCONVECTION FLUX SHEET — thin bright flux sheets formed by magnetoconvection ── -->
      <a-entity stellar-magnetoconvection-flux-sheet></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC BRUNT-VAISALA GRAVITY WAVE — in a stably stratified region
         of a star or the interstellar medium, displaced fluid parcels oscillate
         at the Brunt-Vaisala frequency N; these internal gravity waves carry
         energy and momentum far from their source.
         Renders: oscillating horizontal wave sheets with vertical phase propagation.
         Position: (0, 800, -500).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("cosmic-brunt-vaisala-gravity-wave", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(0, 800, -500);
          scene.add(this._root);

          var NWAVE24 = 8;
          this._waveLayers = [];
          for (var wi24 = 0; wi24 < NWAVE24; wi24++) {
            var NWP24 = 60*60;
            var wPts24 = new Float32Array(NWP24*3);
            var wGeo24 = new THREE.BufferGeometry();
            wGeo24.setAttribute("position", new THREE.BufferAttribute(wPts24, 3));
            var wMat24 = new THREE.PointsMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.52 + wi24*0.02, 1.0, 0.6),
              size: 0.3, transparent: true, opacity: 0.2,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var wMesh24 = new THREE.Points(wGeo24, wMat24);
            this._root.add(wMesh24);
            var yBase = (wi24 - NWAVE24/2)*2.5;
            var kx24 = 1.2 + wi24*0.15;
            this._waveLayers.push({ mesh: wMesh24, pts: wPts24, yBase: yBase, kx: kx24, phase: wi24*0.4 });
          }
          this._cbvgwTime = 0;
          console.log("[cosmic-brunt-vaisala-gravity-wave] loaded at (0,800,-500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cbvgwTime += dt;
          var t = this._cbvgwTime;
          for (var wi25 = 0; wi25 < this._waveLayers.length; wi25++) {
            var wl = this._waveLayers[wi25];
            var NWP25 = wl.pts.length/3;
            var NX = 60; var NZ = 60;
            for (var ix25 = 0; ix25 < NX; ix25++) {
              for (var iz25 = 0; iz25 < NZ; iz25++) {
                var idx25 = ix25*NZ + iz25;
                var xp25 = (ix25/(NX-1)-0.5)*20;
                var zp25 = (iz25/(NZ-1)-0.5)*20;
                var disp = 0.6*Math.sin(wl.kx*(xp25+zp25*0.5) - t*1.5 + wl.phase);
                wl.pts[idx25*3  ] = xp25;
                wl.pts[idx25*3+1] = wl.yBase + disp;
                wl.pts[idx25*3+2] = zp25;
              }
            }
            wl.mesh.geometry.attributes.position.needsUpdate = true;
            wl.mesh.material.opacity = 0.15 + 0.08*Math.sin(t*1.4 + wl.phase);
          }
        },
      });

      /* ====================================================================
         STELLAR MAGNETOCONVECTION FLUX SHEET — simulations show that in
         regions where strong vertical magnetic field concentrations exist,
         convection sweeps field into a thin intergranular flux sheet at the
         downflow lanes; these sheets shine brightly in the UV.
         Renders: a bright thin planar network of criss-crossing flux sheets.
         Position: (-800, 100, 300).
         @alignment 8→26→48:480  @frequency 852  @domain security-forge
      ==================================================================== */
      AFRAME.registerComponent("stellar-magnetoconvection-flux-sheet", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-800, 100, 300);
          scene.add(this._root);

          var NSHEET24 = 20;
          this._sheets = [];
          for (var si24 = 0; si24 < NSHEET24; si24++) {
            var NSP24 = 200;
            var sPts24 = new Float32Array(NSP24*3);
            var sGeo24 = new THREE.BufferGeometry();
            sGeo24.setAttribute("position", new THREE.BufferAttribute(sPts24, 3));
            var vert24 = si24%2===0;
            var sLine24 = new THREE.Line(sGeo24, new THREE.LineBasicMaterial({
              color: 0xffffaa,
              transparent: true, opacity: 0.4,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(sLine24);
            var fixedCoord = (Math.random()-0.5)*20;
            this._sheets.push({ line: sLine24, pts: sPts24, vert: vert24, fixed: fixedCoord, phase: si24*0.3 });
          }
          this._smcfsTime = 0;
          console.log("[stellar-magnetoconvection-flux-sheet] loaded at (-800,100,300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._smcfsTime += dt;
          var t = this._smcfsTime;
          for (var si25 = 0; si25 < this._sheets.length; si25++) {
            var sh = this._sheets[si25];
            var NSP25 = sh.pts.length/3;
            for (var spi25 = 0; spi25 < NSP25; spi25++) {
              var sf25 = (spi25/(NSP25-1)-0.5)*20;
              var amp25 = 0.25*Math.sin(sf25*1.5 + t*1.8 + sh.phase);
              if (sh.vert) {
                sh.pts[spi25*3  ] = sh.fixed + amp25;
                sh.pts[spi25*3+1] = sf25;
                sh.pts[spi25*3+2] = 0;
              } else {
                sh.pts[spi25*3  ] = sf25;
                sh.pts[spi25*3+1] = sh.fixed + amp25;
                sh.pts[spi25*3+2] = 0;
              }
            }
            sh.line.geometry.attributes.position.needsUpdate = true;
            sh.line.material.opacity = 0.3 + 0.15*Math.abs(Math.sin(t*1.1 + sh.phase));
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 109 injected! Lines:', lineCount);
