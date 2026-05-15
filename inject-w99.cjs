'use strict';
// inject-w99.cjs — Wave 99: cosmic-gyrosynchrotron-arc + stellar-acoustic-running-wave
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-gyrosynchrotron-arc"')) {
  console.log('Wave 99 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-photospheric-granule-mosaic></a-entity>';
const HTML_INSERT = `      <a-entity stellar-photospheric-granule-mosaic></a-entity>
      <!-- ── COSMIC GYROSYNCHROTRON ARC — mildly relativistic gyrosynchrotron radiation arc ── -->
      <a-entity cosmic-gyrosynchrotron-arc></a-entity>
      <!-- ── STELLAR ACOUSTIC RUNNING WAVE — running acoustic wave packet in stellar interior ── -->
      <a-entity stellar-acoustic-running-wave></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC GYROSYNCHROTRON ARC — mildly relativistic electrons
         spiraling along coronal loop magnetic field lines emit
         gyrosynchrotron radiation visible in microwaves during solar flares.
         Renders: a glowing spiral arc with spiraling electron tracers.
         Position: (-700, 600, 200).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-gyrosynchrotron-arc", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-700, 600, 200);
          scene.add(this._root);

          /* arc backbone */
          var NAB = 200;
          var abPts = new Float32Array(NAB*3);
          this._abPts = abPts;
          var abGeo = new THREE.BufferGeometry();
          abGeo.setAttribute("position", new THREE.BufferAttribute(abPts, 3));
          this._arc = new THREE.Line(abGeo, new THREE.LineBasicMaterial({
            color: 0xff6600, transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending,
          }));
          this._root.add(this._arc);

          /* electron spiral particles */
          var NE = 1500;
          var ePts = new Float32Array(NE*3);
          this._ePts = ePts; this._NE = NE;
          var eGeo = new THREE.BufferGeometry();
          eGeo.setAttribute("position", new THREE.BufferAttribute(ePts, 3));
          this._electrons = new THREE.Points(eGeo, new THREE.PointsMaterial({
            color: 0xffdd88, size: 0.55, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._electrons);
          this._cgsTime = 0;
          console.log("[cosmic-gyrosynchrotron-arc] loaded at (-700,600,200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cgsTime += dt;
          var t = this._cgsTime;
          var NAB2 = this._abPts.length/3;
          for (var ai = 0; ai < NAB2; ai++) {
            var af = ai/(NAB2-1);
            var aAngle = af*Math.PI;
            this._abPts[ai*3  ] = 20*Math.cos(aAngle);
            this._abPts[ai*3+1] = 12*Math.sin(aAngle);
            this._abPts[ai*3+2] = 0;
          }
          this._arc.geometry.attributes.position.needsUpdate = true;

          for (var ei = 0; ei < this._NE; ei++) {
            var ef = Math.random();
            var eAngle = ef*Math.PI;
            var eR = 20, eH = 12;
            var exb = eR*Math.cos(eAngle), eyb = eH*Math.sin(eAngle);
            var eSpin = ef*Math.PI*12 + t*6;
            var eRad = 1.2;
            var eTang = Math.atan2(eyb, exb) + Math.PI/2;
            this._ePts[ei*3  ] = exb + eRad*Math.cos(eSpin)*Math.cos(eTang);
            this._ePts[ei*3+1] = eyb + eRad*Math.sin(eSpin);
            this._ePts[ei*3+2] = eRad*Math.cos(eSpin)*Math.sin(eTang);
          }
          this._electrons.geometry.attributes.position.needsUpdate = true;
          this._electrons.material.opacity = 0.3 + 0.1*Math.sin(t*2.3);
        },
      });

      /* ====================================================================
         STELLAR ACOUSTIC RUNNING WAVE — acoustic running waves propagate
         outward through the stellar convection zone, measurable as Doppler
         oscillations at the surface.
         Renders: concentric ripple shells propagating outward.
         Position: (0, -900, -200).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("stellar-acoustic-running-wave", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(0, -900, -200);
          scene.add(this._root);

          /* multiple wave shells */
          var NSHELLS = 6;
          this._shells = [];
          for (var si2 = 0; si2 < NSHELLS; si2++) {
            var NSP = 3000;
            var sPts2 = new Float32Array(NSP*3);
            for (var sp = 0; sp < NSP; sp++) {
              var sa2 = Math.random()*2*Math.PI, sb2 = Math.random()*Math.PI;
              sPts2[sp*3  ] = Math.sin(sb2)*Math.cos(sa2);
              sPts2[sp*3+1] = Math.cos(sb2);
              sPts2[sp*3+2] = Math.sin(sb2)*Math.sin(sa2);
            }
            var sGeo2 = new THREE.BufferGeometry();
            sGeo2.setAttribute("position", new THREE.BufferAttribute(sPts2, 3));
            var sMesh2 = new THREE.Points(sGeo2, new THREE.PointsMaterial({
              color: 0x55bbff, size: 0.5, transparent: true, opacity: 0,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(sMesh2);
            this._shells.push({ mesh: sMesh2, phase: (si2/NSHELLS)*Math.PI*2 });
          }
          this._sarwTime = 0;
          console.log("[stellar-acoustic-running-wave] loaded at (0,-900,-200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._sarwTime += dt;
          var t = this._sarwTime;
          for (var si3 = 0; si3 < this._shells.length; si3++) {
            var shl = this._shells[si3];
            var cycle = (t*0.5 + shl.phase/Math.PI/2) % 1;
            var r = 5 + cycle*25;
            var fade = cycle < 0.5 ? cycle*2 : 2-cycle*2;
            shl.mesh.scale.set(r, r, r);
            shl.mesh.material.opacity = 0.35*fade;
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 99 injected! Lines:', lineCount);
