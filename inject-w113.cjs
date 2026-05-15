'use strict';
// inject-w113.cjs — Wave 113: cosmic-pair-plasma-fireball + stellar-tachocline-shear-layer
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-pair-plasma-fireball"')) {
  console.log('Wave 113 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-convective-overshoot-plume></a-entity>';
const HTML_INSERT = `      <a-entity stellar-convective-overshoot-plume></a-entity>
      <!-- ── COSMIC PAIR PLASMA FIREBALL — opaque electron-positron pair plasma fireball from GRB ── -->
      <a-entity cosmic-pair-plasma-fireball></a-entity>
      <!-- ── STELLAR TACHOCLINE SHEAR LAYER — thin rotational shear at base of solar convection zone ── -->
      <a-entity stellar-tachocline-shear-layer></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC PAIR PLASMA FIREBALL — the initial GRB explosion creates a
         hot radiation-dominated fireball optically thick with electron-
         positron pairs; as it expands and cools, pairs annihilate and photons
         escape, producing the prompt gamma-ray emission.
         Renders: an exploding bright sphere with radial gamma streaks.
         Position: (200, 700, -600).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-pair-plasma-fireball", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(200, 700, -600);
          scene.add(this._root);

          var NSP34 = 700;
          var sPts34 = new Float32Array(NSP34*3);
          this._sGeo34 = new THREE.BufferGeometry();
          this._sGeo34.setAttribute("position", new THREE.BufferAttribute(sPts34, 3));
          this._sMesh34 = new THREE.Points(this._sGeo34, new THREE.PointsMaterial({
            color: 0xffaaff, size: 0.2, transparent: true, opacity: 0.3,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._sMesh34);
          this._sPts34 = sPts34;
          this._phi34 = []; this._theta34 = [];
          for (var si34 = 0; si34 < NSP34; si34++) {
            this._phi34.push(Math.random()*2*Math.PI);
            this._theta34.push(Math.acos(2*Math.random()-1));
          }

          var NSTR34 = 20;
          this._gStreaks = [];
          for (var gi34 = 0; gi34 < NSTR34; gi34++) {
            var NGP34 = 30;
            var gPts34 = new Float32Array(NGP34*3);
            var gGeo34 = new THREE.BufferGeometry();
            gGeo34.setAttribute("position", new THREE.BufferAttribute(gPts34, 3));
            var gLine34 = new THREE.Line(gGeo34, new THREE.LineBasicMaterial({
              color: 0xffffff,
              transparent: true, opacity: 0.5,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(gLine34);
            var ga34 = Math.random()*2*Math.PI;
            var gt34 = Math.acos(2*Math.random()-1);
            this._gStreaks.push({ line: gLine34, pts: gPts34, phi: ga34, theta: gt34 });
          }
          this._cppfTime = 0;
          console.log("[cosmic-pair-plasma-fireball] loaded at (200,700,-600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cppfTime += dt;
          var t = this._cppfTime;
          var R34 = 4 + 3*Math.sin(t*0.5);
          for (var si35 = 0; si35 < this._phi34.length; si35++) {
            var p34 = this._phi34[si35]; var th34 = this._theta34[si35];
            var r34 = R34*(1 + 0.08*Math.sin(6*p34 + t*2));
            this._sPts34[si35*3  ] = r34*Math.sin(th34)*Math.cos(p34);
            this._sPts34[si35*3+1] = r34*Math.cos(th34);
            this._sPts34[si35*3+2] = r34*Math.sin(th34)*Math.sin(p34);
          }
          this._sGeo34.attributes.position.needsUpdate = true;
          for (var gi35 = 0; gi35 < this._gStreaks.length; gi35++) {
            var gst = this._gStreaks[gi35];
            var NGP35 = gst.pts.length/3;
            var dx = Math.sin(gst.theta)*Math.cos(gst.phi);
            var dy = Math.cos(gst.theta);
            var dz = Math.sin(gst.theta)*Math.sin(gst.phi);
            for (var gpi = 0; gpi < NGP35; gpi++) {
              var sf35 = gpi/(NGP35-1);
              var r35 = R34*(0.5 + sf35*1.0);
              gst.pts[gpi*3  ] = r35*dx;
              gst.pts[gpi*3+1] = r35*dy;
              gst.pts[gpi*3+2] = r35*dz;
            }
            gst.line.geometry.attributes.position.needsUpdate = true;
          }
          this._sMesh34.material.opacity = 0.2 + 0.15*Math.sin(t*3);
        },
      });

      /* ====================================================================
         STELLAR TACHOCLINE SHEAR LAYER — a thin (~0.04 R_sun) transition
         layer between the differentially-rotating convection zone and the
         uniformly-rotating radiative interior; believed to be the seat of
         the solar dynamo that generates the magnetic cycle.
         Renders: a flat equatorial disc of shearing rings at different speeds.
         Position: (0, 0, 0).  Offset ring at (500, 0, -800).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("stellar-tachocline-shear-layer", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(500, 0, -800);
          scene.add(this._root);

          var NRNG34 = 12;
          this._rings = [];
          for (var ri34 = 0; ri34 < NRNG34; ri34++) {
            var NRP34 = 120;
            var rPts34 = new Float32Array(NRP34*3);
            var rGeo34 = new THREE.BufferGeometry();
            rGeo34.setAttribute("position", new THREE.BufferAttribute(rPts34, 3));
            var rLine34 = new THREE.Line(rGeo34, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.05 + ri34*0.04, 1.0, 0.6),
              transparent: true, opacity: 0.4,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(rLine34);
            var R34r = 2 + ri34*0.5;
            var omega34 = 0.6 + ri34*0.04;
            this._rings.push({ line: rLine34, pts: rPts34, R: R34r, omega: omega34, phase: ri34*0.3 });
          }
          this._stslTime = 0;
          console.log("[stellar-tachocline-shear-layer] loaded at (500,0,-800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._stslTime += dt;
          var t = this._stslTime;
          for (var ri35 = 0; ri35 < this._rings.length; ri35++) {
            var ring35 = this._rings[ri35];
            var NRP35 = ring35.pts.length/3;
            var off35 = ring35.omega*t + ring35.phase;
            for (var rpi35 = 0; rpi35 < NRP35; rpi35++) {
              var th35 = (rpi35/(NRP35-1))*2*Math.PI + off35;
              ring35.pts[rpi35*3  ] = ring35.R*Math.cos(th35);
              ring35.pts[rpi35*3+1] = 0.1*Math.sin(4*th35 + t);
              ring35.pts[rpi35*3+2] = ring35.R*Math.sin(th35);
            }
            ring35.line.geometry.attributes.position.needsUpdate = true;
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 113 injected! Lines:', lineCount);
