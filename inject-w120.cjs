'use strict';
// inject-w120.cjs — Wave 120: cosmic-bernstein-mode-wave + stellar-coronal-fan-spine-topology
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-bernstein-mode-wave"')) {
  console.log('Wave 120 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-sunspot-light-bridge></a-entity>';
const HTML_INSERT = `      <a-entity stellar-sunspot-light-bridge></a-entity>
      <!-- ── COSMIC BERNSTEIN MODE WAVE — electrostatic waves at cyclotron harmonics in a magnetized plasma ── -->
      <a-entity cosmic-bernstein-mode-wave></a-entity>
      <!-- ── STELLAR CORONAL FAN-SPINE TOPOLOGY — magnetic fan surface + null-point spine above active region ── -->
      <a-entity stellar-coronal-fan-spine-topology></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC BERNSTEIN MODE WAVE — in a magnetized plasma, electrons
         confined to circular orbits support electrostatic Bernstein modes
         at integer multiples of the electron cyclotron frequency.
         These standing waves have no magnetic perturbation and propagate
         perpendicular to B.
         Renders: stacked ring harmonics flickering at cyclotron harmonics.
         Position: (-900, 700, 200).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-bernstein-mode-wave", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-900, 700, 200);
          scene.add(this._root);

          var NHARM48 = 7;
          this._harms = [];
          for (var hi48 = 0; hi48 < NHARM48; hi48++) {
            var NP48 = 80;
            var hPts48 = new Float32Array(NP48*3);
            var hGeo48 = new THREE.BufferGeometry();
            hGeo48.setAttribute("position", new THREE.BufferAttribute(hPts48, 3));
            var hLine48 = new THREE.Line(hGeo48, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.7 - hi48*0.04, 1.0, 0.65),
              transparent: true, opacity: 0.5,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(hLine48);
            this._harms.push({ line: hLine48, pts: hPts48, R: 0.8 + hi48*0.55, n: hi48+1 });
          }
          this._cbmwTime = 0;
          console.log("[cosmic-bernstein-mode-wave] loaded at (-900,700,200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cbmwTime += dt;
          var t = this._cbmwTime;
          var omegaCyc = 1.5;
          for (var hi49 = 0; hi49 < this._harms.length; hi49++) {
            var hm = this._harms[hi49];
            var freq = hm.n * omegaCyc;
            var ampl = 0.1 / hm.n;
            for (var pi49 = 0; pi49 < hm.pts.length/3; pi49++) {
              var th49 = (pi49/(hm.pts.length/3))*2*Math.PI;
              var r49 = hm.R + ampl * Math.cos(hm.n*th49 - freq*t);
              hm.pts[pi49*3  ] = r49*Math.cos(th49);
              hm.pts[pi49*3+1] = (hi49 - 3)*0.4;
              hm.pts[pi49*3+2] = r49*Math.sin(th49);
            }
            hm.line.geometry.attributes.position.needsUpdate = true;
            hm.line.material.opacity = 0.3 + 0.25*Math.abs(Math.sin(freq*t*0.5));
          }
        },
      });

      /* ====================================================================
         STELLAR CORONAL FAN-SPINE TOPOLOGY — a key coronal magnetic
         structure around a 3-D null point: a dome-shaped fan surface
         separates closed inner flux from open outer flux; a spine line
         threads through the null.  Reconnection here drives jets and
         circular ribbon flares.
         Renders: dome fan with latitude lines + vertical spine.
         Position: (700, 500, -800).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-coronal-fan-spine-topology", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(700, 500, -800);
          scene.add(this._root);

          // Fan: lat lines on upper hemisphere
          var NLAT48 = 8;
          this._fanLines = [];
          for (var li48 = 0; li48 < NLAT48; li48++) {
            var theta48 = (Math.PI/2) * (li48+1)/NLAT48;
            var NP48b = 60;
            var fPts48 = new Float32Array(NP48b*3);
            var fGeo48 = new THREE.BufferGeometry();
            fGeo48.setAttribute("position", new THREE.BufferAttribute(fPts48, 3));
            var R48 = 3;
            for (var pi48b = 0; pi48b < NP48b; pi48b++) {
              var phi48 = (pi48b/NP48b)*2*Math.PI;
              fPts48[pi48b*3  ] = R48*Math.sin(theta48)*Math.cos(phi48);
              fPts48[pi48b*3+1] = R48*Math.cos(theta48);
              fPts48[pi48b*3+2] = R48*Math.sin(theta48)*Math.sin(phi48);
            }
            var fLine48 = new THREE.Line(fGeo48, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.05, 0.95, 0.65 + li48*0.03),
              transparent: true, opacity: 0.4,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(fLine48);
            this._fanLines.push({ line: fLine48, pts: fPts48, theta: theta48, R: R48 });
          }
          // Spine: vertical line
          var spPts48 = new Float32Array([0, -4, 0, 0, 4, 0]);
          var spGeo48 = new THREE.BufferGeometry();
          spGeo48.setAttribute("position", new THREE.BufferAttribute(spPts48, 3));
          this._spine = new THREE.Line(spGeo48, new THREE.LineBasicMaterial({
            color: 0xffffff, blending: THREE.AdditiveBlending,
          }));
          this._root.add(this._spine);
          this._scfstTime = 0;
          console.log("[stellar-coronal-fan-spine-topology] loaded at (700,500,-800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._scfstTime += dt;
          var t = this._scfstTime;
          this._root.rotation.y = t * 0.04;
          for (var li49 = 0; li49 < this._fanLines.length; li49++) {
            var fl = this._fanLines[li49];
            var R49 = fl.R * (1 + 0.02*Math.sin(t*0.9 + li49));
            var NP49 = fl.pts.length/3;
            for (var pi49b = 0; pi49b < NP49; pi49b++) {
              var phi49 = (pi49b/NP49)*2*Math.PI;
              fl.pts[pi49b*3  ] = R49*Math.sin(fl.theta)*Math.cos(phi49);
              fl.pts[pi49b*3+1] = R49*Math.cos(fl.theta);
              fl.pts[pi49b*3+2] = R49*Math.sin(fl.theta)*Math.sin(phi49);
            }
            fl.line.geometry.attributes.position.needsUpdate = true;
            fl.line.material.opacity = 0.25 + 0.2*Math.abs(Math.sin(t*0.6 + li49));
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 120 injected! Lines:', lineCount);
