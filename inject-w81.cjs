'use strict';
// inject-w81.cjs — Wave 81: magnetohydrodynamic-turbulence-cascade + circumgalactic-rain
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("magnetohydrodynamic-turbulence-cascade"')) {
  console.log('Wave 81 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity galactic-wind-outflow></a-entity>';
const HTML_INSERT = `      <a-entity galactic-wind-outflow></a-entity>
      <!-- ── MAGNETOHYDRODYNAMIC TURBULENCE CASCADE — Kolmogorov-Iroshnikov-Kraichnan eddies ── -->
      <a-entity magnetohydrodynamic-turbulence-cascade></a-entity>
      <!-- ── CIRCUMGALACTIC RAIN — cold gas condensation raining back onto the disk ── -->
      <a-entity circumgalactic-rain></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         MAGNETOHYDRODYNAMIC TURBULENCE CASCADE — MHD turbulence in the ISM
         follows an Iroshnikov-Kraichnan cascade. We render a hierarchy of
         nested eddy rings at three scales, each with a field-aligned particle
         cloud swirling about the local magnetic direction.
         Position: (700, 500, -600).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("magnetohydrodynamic-turbulence-cascade", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(700, 500, -600);
          scene.add(this._root);

          /* three eddy scales: large, mid, small */
          var scales = [
            { n: 2200, radius: 50, thick: 14, speed: 0.12, color: 0x3399ff },
            { n: 1800, radius: 25, thick: 7,  speed: 0.25, color: 0x55ddff },
            { n: 1400, radius: 10, thick: 3,  speed: 0.55, color: 0xaaffee },
          ];
          this._eddies = [];
          for (var ei = 0; ei < scales.length; ei++) {
            var sc = scales[ei];
            var pts = new Float32Array(sc.n*3);
            var angles = new Float32Array(sc.n);
            var radii  = new Float32Array(sc.n);
            var heights = new Float32Array(sc.n);
            for (var pi = 0; pi < sc.n; pi++) {
              var a = Math.random()*2*Math.PI;
              var r = sc.radius*(0.6 + 0.4*Math.random());
              var h = (Math.random()-0.5)*sc.thick;
              angles[pi] = a; radii[pi] = r; heights[pi] = h;
              pts[pi*3] = r*Math.cos(a); pts[pi*3+1] = h; pts[pi*3+2] = r*Math.sin(a);
            }
            var geo = new THREE.BufferGeometry();
            geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
            var mat = new THREE.PointsMaterial({
              color: sc.color, size: 0.7,
              transparent: true, opacity: 0.4,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var mesh = new THREE.Points(geo, mat);
            /* tilt each scale ring at different axis */
            mesh.rotation.x = ei*0.4; mesh.rotation.z = ei*0.25;
            this._root.add(mesh);
            this._eddies.push({ mesh, pts, angles, radii, n: sc.n, speed: sc.speed });
          }
          this._mhdTime = 0;
          console.log("[magnetohydrodynamic-turbulence-cascade] loaded at (700,500,-600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._mhdTime += dt;
          for (var ei = 0; ei < this._eddies.length; ei++) {
            var ed = this._eddies[ei];
            for (var pi = 0; pi < ed.n; pi++) {
              ed.angles[pi] += ed.speed * dt * (0.8 + 0.4*Math.random());
              ed.pts[pi*3  ] = ed.radii[pi]*Math.cos(ed.angles[pi]);
              ed.pts[pi*3+2] = ed.radii[pi]*Math.sin(ed.angles[pi]);
            }
            ed.mesh.geometry.attributes.position.needsUpdate = true;
            ed.mesh.material.opacity = 0.3 + 0.15*Math.sin(this._mhdTime*1.2+ei);
          }
          this._root.rotation.y += 0.01 * dt;
        },
      });

      /* ====================================================================
         CIRCUMGALACTIC RAIN — warm CGM gas condenses into cool clouds that
         precipitate back toward the disk (the "cooling rain" or "fountain"
         cycle). We render falling cloudlets that dissolve at disk-height and
         respawn high in the halo with a turbulent halo background haze.
         Position: (-300, 600, 400).
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("circumgalactic-rain", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-300, 600, 400);
          scene.add(this._root);

          /* halo background haze */
          var NH = 4000;
          var hPts = new Float32Array(NH*3);
          for (var hi = 0; hi < NH; hi++) {
            hPts[hi*3  ] = (Math.random()-0.5)*200;
            hPts[hi*3+1] = 20 + Math.random()*160;
            hPts[hi*3+2] = (Math.random()-0.5)*200;
          }
          var hGeo = new THREE.BufferGeometry();
          hGeo.setAttribute("position", new THREE.BufferAttribute(hPts, 3));
          this._root.add(new THREE.Points(hGeo, new THREE.PointsMaterial({
            color: 0x7799cc, size: 0.6,
            transparent: true, opacity: 0.15,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* falling rain cloudlets */
          var NR = 5000;
          var rPts = new Float32Array(NR*3);
          var rVy  = new Float32Array(NR);
          this._rPts = rPts; this._rVy = rVy; this._NR = NR;
          for (var ri = 0; ri < NR; ri++) {
            rPts[ri*3  ] = (Math.random()-0.5)*180;
            rPts[ri*3+1] = 20 + Math.random()*160;
            rPts[ri*3+2] = (Math.random()-0.5)*180;
            rVy[ri] = -(8 + Math.random()*15);
          }
          var rGeo = new THREE.BufferGeometry();
          rGeo.setAttribute("position", new THREE.BufferAttribute(rPts, 3));
          this._rain = new THREE.Points(rGeo, new THREE.PointsMaterial({
            color: 0xaaddff, size: 0.9,
            transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._rain);
          this._cgrTime = 0;
          console.log("[circumgalactic-rain] loaded at (-300,600,400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cgrTime += dt;
          for (var ri = 0; ri < this._NR; ri++) {
            this._rPts[ri*3+1] += this._rVy[ri]*dt;
            if (this._rPts[ri*3+1] < 20) {
              this._rPts[ri*3  ] = (Math.random()-0.5)*180;
              this._rPts[ri*3+1] = 140 + Math.random()*40;
              this._rPts[ri*3+2] = (Math.random()-0.5)*180;
              this._rVy[ri] = -(8 + Math.random()*15);
            }
          }
          this._rain.geometry.attributes.position.needsUpdate = true;
          this._rain.material.opacity = 0.25 + 0.12*Math.sin(this._cgrTime*0.5);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 81 injected! Lines:', lineCount);
