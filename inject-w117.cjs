'use strict';
// inject-w117.cjs — Wave 117: cosmic-wakefield-plasma-bubble + stellar-helioseismic-ridge
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-wakefield-plasma-bubble"')) {
  console.log('Wave 117 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-supergranule-network></a-entity>';
const HTML_INSERT = `      <a-entity stellar-supergranule-network></a-entity>
      <!-- ── COSMIC WAKEFIELD PLASMA BUBBLE — electron-depleted bubble behind a laser/particle driver ── -->
      <a-entity cosmic-wakefield-plasma-bubble></a-entity>
      <!-- ── STELLAR HELIOSEISMIC RIDGE — ridges in the p-mode power spectrum mapping interior structure ── -->
      <a-entity stellar-helioseismic-ridge></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC WAKEFIELD PLASMA BUBBLE — a relativistic driver (laser
         pulse or particle beam) traveling through plasma pushes electrons
         out radially, leaving an ion cavity "bubble" with enormous
         accelerating electric fields; the accelerated particles ride the
         rear of the bubble.
         Renders: a hollow sphere with a bright trailing electron sheath
         and a particle streak inside.
         Position: (600, 500, 500).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-wakefield-plasma-bubble", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(600, 500, 500);
          scene.add(this._root);

          var NSHTH42 = 600;
          var sPts42 = new Float32Array(NSHTH42*3);
          this._sGeo42 = new THREE.BufferGeometry();
          this._sGeo42.setAttribute("position", new THREE.BufferAttribute(sPts42, 3));
          this._sMesh42 = new THREE.Points(this._sGeo42, new THREE.PointsMaterial({
            color: 0x88aaff, size: 0.12, transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._sMesh42);
          this._sPts42 = sPts42;
          this._sPhi42 = []; this._sTheta42 = [];
          for (var si42 = 0; si42 < NSHTH42; si42++) {
            this._sPhi42.push(Math.random()*2*Math.PI);
            this._sTheta42.push(Math.acos(2*Math.random()-1));
          }

          var NSTR42 = 30;
          var stPts42 = new Float32Array(NSTR42*3);
          this._stGeo42 = new THREE.BufferGeometry();
          this._stGeo42.setAttribute("position", new THREE.BufferAttribute(stPts42, 3));
          this._stLine42 = new THREE.Line(this._stGeo42, new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true, opacity: 0.8,
            blending: THREE.AdditiveBlending,
          }));
          this._root.add(this._stLine42);
          this._stPts42 = stPts42;
          this._cwfTime = 0;
          console.log("[cosmic-wakefield-plasma-bubble] loaded at (600,500,500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cwfTime += dt;
          var t = this._cwfTime;
          var R42 = 3 + 0.3*Math.sin(t*2);
          for (var si43 = 0; si43 < this._sPhi42.length; si43++) {
            var p43 = this._sPhi42[si43]; var th43 = this._sTheta42[si43];
            this._sPts42[si43*3  ] = R42*Math.sin(th43)*Math.cos(p43);
            this._sPts42[si43*3+1] = R42*Math.cos(th43);
            this._sPts42[si43*3+2] = R42*Math.sin(th43)*Math.sin(p43);
          }
          this._sGeo42.attributes.position.needsUpdate = true;
          var NST43 = this._stPts42.length/3;
          for (var sti43 = 0; sti43 < NST43; sti43++) {
            var sf43 = sti43/(NST43-1);
            this._stPts42[sti43*3  ] = 0;
            this._stPts42[sti43*3+1] = (sf43 - 0.5)*R42*1.6;
            this._stPts42[sti43*3+2] = 0;
          }
          this._stGeo42.attributes.position.needsUpdate = true;
          this._stLine42.material.opacity = 0.5 + 0.3*Math.sin(t*5);
        },
      });

      /* ====================================================================
         STELLAR HELIOSEISMIC RIDGE — in the acoustic power spectrum of
         solar oscillations, discrete ridges (n=0 f-mode, n=1,2,… p-modes)
         appear as parabolic tracks in the k-omega diagram; their spacing
         constrains the sound-speed profile throughout the solar interior.
         Renders: stacked parabolic curve-lines representing power ridges.
         Position: (-400, 600, 700).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("stellar-helioseismic-ridge", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-400, 600, 700);
          scene.add(this._root);

          var NRIDG42 = 8;
          this._ridges = [];
          for (var ri42 = 0; ri42 < NRIDG42; ri42++) {
            var NRP42 = 80;
            var rPts42 = new Float32Array(NRP42*3);
            var rGeo42 = new THREE.BufferGeometry();
            rGeo42.setAttribute("position", new THREE.BufferAttribute(rPts42, 3));
            var rLine42 = new THREE.Line(rGeo42, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.6 + ri42*0.05, 1.0, 0.6),
              transparent: true, opacity: 0.4,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(rLine42);
            this._ridges.push({ line: rLine42, pts: rPts42, n: ri42+1, phase: ri42*0.5 });
          }
          this._shrTime = 0;
          console.log("[stellar-helioseismic-ridge] loaded at (-400,600,700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._shrTime += dt;
          var t = this._shrTime;
          for (var ri43 = 0; ri43 < this._ridges.length; ri43++) {
            var rdg = this._ridges[ri43];
            var NRP43 = rdg.pts.length/3;
            for (var rpi43 = 0; rpi43 < NRP43; rpi43++) {
              var kv43 = (rpi43/(NRP43-1) - 0.5)*8;
              var om43 = rdg.n*0.8 + 0.15*kv43*kv43 + 0.05*Math.sin(t*0.5 + rdg.phase);
              rdg.pts[rpi43*3  ] = kv43;
              rdg.pts[rpi43*3+1] = om43 - 1.5;
              rdg.pts[rpi43*3+2] = 0.05*Math.sin(kv43*2 + t + rdg.phase);
            }
            rdg.line.geometry.attributes.position.needsUpdate = true;
            rdg.line.material.opacity = 0.3 + 0.15*Math.sin(t + rdg.phase);
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 117 injected! Lines:', lineCount);
