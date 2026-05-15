'use strict';
// inject-w98.cjs — Wave 98: cosmic-kelvin-wave-vortex + stellar-photospheric-granule-mosaic
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-kelvin-wave-vortex"')) {
  console.log('Wave 98 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-wind-cavity-bubble></a-entity>';
const HTML_INSERT = `      <a-entity stellar-wind-cavity-bubble></a-entity>
      <!-- ── COSMIC KELVIN WAVE VORTEX — Kelvin-Helmholtz roll-up vortex chain ── -->
      <a-entity cosmic-kelvin-wave-vortex></a-entity>
      <!-- ── STELLAR PHOTOSPHERIC GRANULE MOSAIC — convection cell mosaic ── -->
      <a-entity stellar-photospheric-granule-mosaic></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC KELVIN WAVE VORTEX — Kelvin-Helmholtz instability at
         shear interfaces rolls up into a chain of vortices, seen at
         magnetospheric boundaries and galactic disk interfaces.
         Renders: a row of curling vortex spirals with particle tracers.
         Position: (600, -800, -400).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("cosmic-kelvin-wave-vortex", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(600, -800, -400);
          scene.add(this._root);

          var NV = 5;
          this._vortices = [];
          for (var vi = 0; vi < NV; vi++) {
            var NVP = 600;
            var vPts = new Float32Array(NVP*3);
            var vGeo = new THREE.BufferGeometry();
            vGeo.setAttribute("position", new THREE.BufferAttribute(vPts, 3));
            var vMesh = new THREE.Points(vGeo, new THREE.PointsMaterial({
              color: [0x0088ff,0x00aaff,0x33ccff,0x55eeff,0x0066dd][vi],
              size: 0.55, transparent: true, opacity: 0.3,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(vMesh);
            this._vortices.push({ mesh: vMesh, pts: vPts, cx: (vi-2)*18 });
          }
          this._ckwTime = 0;
          console.log("[cosmic-kelvin-wave-vortex] loaded at (600,-800,-400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._ckwTime += dt;
          var t = this._ckwTime;
          for (var vi2 = 0; vi2 < this._vortices.length; vi2++) {
            var vor = this._vortices[vi2];
            var cx = vor.cx;
            var NVP2 = vor.pts.length/3;
            for (var pi = 0; pi < NVP2; pi++) {
              var phase = Math.random()*2*Math.PI;
              var rad = Math.random()*6;
              var angle = phase + t*(1.2 - vi2*0.1);
              vor.pts[pi*3  ] = cx + rad*Math.cos(angle);
              vor.pts[pi*3+1] = rad*Math.sin(angle)*0.5;
              vor.pts[pi*3+2] = (Math.random()-0.5)*4;
            }
            vor.mesh.geometry.attributes.position.needsUpdate = true;
            vor.mesh.material.opacity = 0.25 + 0.1*Math.sin(t*1.5 + vi2);
          }
        },
      });

      /* ====================================================================
         STELLAR PHOTOSPHERIC GRANULE MOSAIC — solar convection forms
         granules (bright hot cores, dark cool intergranular lanes) covering
         the photosphere in a shifting cellular mosaic.
         Renders: hexagonal cell grid with pulsating brightness cores.
         Position: (-300, 700, 600).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("stellar-photospheric-granule-mosaic", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-300, 700, 600);
          scene.add(this._root);

          var NCOLS = 10, NROWS = 10;
          var GS = 5;
          this._cells = [];
          for (var gx = 0; gx < NCOLS; gx++) {
            for (var gy = 0; gy < NROWS; gy++) {
              var NCP = 120;
              var cPts = new Float32Array(NCP*3);
              var cGeo = new THREE.BufferGeometry();
              cGeo.setAttribute("position", new THREE.BufferAttribute(cPts, 3));
              var cMat = new THREE.PointsMaterial({
                color: 0xffcc55, size: 0.45, transparent: true, opacity: 0.4,
                blending: THREE.AdditiveBlending, depthWrite: false,
              });
              var cMesh = new THREE.Points(cGeo, cMat);
              this._root.add(cMesh);
              /* hex offset */
              var ox2 = (gx - NCOLS/2)*GS + (gy%2===0 ? 0 : GS*0.5);
              var oz2 = (gy - NROWS/2)*GS*0.87;
              this._cells.push({ mesh: cMesh, pts: cPts, ox: ox2, oz: oz2, phase: Math.random()*Math.PI*2 });
            }
          }
          this._spgmTime = 0;
          console.log("[stellar-photospheric-granule-mosaic] loaded at (-300,700,600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._spgmTime += dt;
          var t = this._spgmTime;
          for (var ci = 0; ci < this._cells.length; ci++) {
            var cell = this._cells[ci];
            var bright = 0.5 + 0.5*Math.sin(t*0.8 + cell.phase);
            var NCP2 = cell.pts.length/3;
            for (var cpi = 0; cpi < NCP2; cpi++) {
              var ca = Math.random()*2*Math.PI;
              var cr = Math.random()*1.8*(0.5+0.5*bright);
              cell.pts[cpi*3  ] = cell.ox + cr*Math.cos(ca);
              cell.pts[cpi*3+1] = (Math.random()-0.5)*0.5;
              cell.pts[cpi*3+2] = cell.oz + cr*Math.sin(ca);
            }
            cell.mesh.geometry.attributes.position.needsUpdate = true;
            cell.mesh.material.opacity = 0.25 + 0.3*bright;
            var h = 0.1 + 0.05*bright;
            cell.mesh.material.color.setHSL(h, 1.0, 0.5 + 0.2*bright);
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 98 injected! Lines:', lineCount);
