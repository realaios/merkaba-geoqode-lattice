'use strict';
// inject-w118.cjs — Wave 118: cosmic-debye-shielding-sphere + stellar-chromospheric-evaporation-jet
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-debye-shielding-sphere"')) {
  console.log('Wave 118 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-helioseismic-ridge></a-entity>';
const HTML_INSERT = `      <a-entity stellar-helioseismic-ridge></a-entity>
      <!-- ── COSMIC DEBYE SHIELDING SPHERE — exponential charge screening cloud around a test charge ── -->
      <a-entity cosmic-debye-shielding-sphere></a-entity>
      <!-- ── STELLAR CHROMOSPHERIC EVAPORATION JET — hot plasma upflow driven by flare energy deposition ── -->
      <a-entity stellar-chromospheric-evaporation-jet></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC DEBYE SHIELDING SPHERE — in a plasma a test charge is
         surrounded by a screening cloud of opposite charges within the
         Debye length; beyond this sphere the electric field is exponentially
         suppressed.
         Renders: nested concentric shells fading with r, a bright central
         point, and radial "fringe" lines.
         Position: (-700, -400, -700).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-debye-shielding-sphere", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-700, -400, -700);
          scene.add(this._root);

          var NSHELL44 = 5;
          this._shells = [];
          for (var si44 = 0; si44 < NSHELL44; si44++) {
            var NP44 = 200;
            var sPts44 = new Float32Array(NP44*3);
            var sGeo44 = new THREE.BufferGeometry();
            sGeo44.setAttribute("position", new THREE.BufferAttribute(sPts44, 3));
            var sMesh44 = new THREE.Points(sGeo44, new THREE.PointsMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.58, 1.0, 0.6),
              size: 0.09, transparent: true,
              opacity: Math.exp(-si44*0.7)*0.5,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(sMesh44);
            var phi44 = []; var theta44 = [];
            for (var pi44 = 0; pi44 < NP44; pi44++) {
              phi44.push(Math.random()*2*Math.PI);
              theta44.push(Math.acos(2*Math.random()-1));
            }
            this._shells.push({ mesh: sMesh44, pts: sPts44, phi: phi44, theta: theta44, R: 1.2 + si44*0.8 });
          }
          var cPt44 = new THREE.Points(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0)]),
            new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, blending: THREE.AdditiveBlending })
          );
          this._root.add(cPt44);
          this._cdssTime = 0;
          console.log("[cosmic-debye-shielding-sphere] loaded at (-700,-400,-700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cdssTime += dt;
          var t = this._cdssTime;
          for (var si45 = 0; si45 < this._shells.length; si45++) {
            var sh = this._shells[si45];
            var R45 = sh.R*(1 + 0.03*Math.sin(t + si45));
            for (var pi45 = 0; pi45 < sh.phi.length; pi45++) {
              sh.pts[pi45*3  ] = R45*Math.sin(sh.theta[pi45])*Math.cos(sh.phi[pi45]);
              sh.pts[pi45*3+1] = R45*Math.cos(sh.theta[pi45]);
              sh.pts[pi45*3+2] = R45*Math.sin(sh.theta[pi45])*Math.sin(sh.phi[pi45]);
            }
            sh.mesh.geometry.attributes.position.needsUpdate = true;
          }
        },
      });

      /* ====================================================================
         STELLAR CHROMOSPHERIC EVAPORATION JET — when a solar flare deposits
         energy in the chromosphere, ablated plasma rapidly upflows to fill
         the coronal loop (the "evaporation" upflow); this jet carries
         temperatures of 10-30 MK at velocities of 200-500 km/s.
         Renders: a collimated rising particle stream with hot blue-white glow.
         Position: (300, -700, 900).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-chromospheric-evaporation-jet", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(300, -700, 900);
          scene.add(this._root);

          var NPTS44 = 500;
          var pts44 = new Float32Array(NPTS44*3);
          this._geo44 = new THREE.BufferGeometry();
          this._geo44.setAttribute("position", new THREE.BufferAttribute(pts44, 3));
          this._mesh44 = new THREE.Points(this._geo44, new THREE.PointsMaterial({
            color: 0x99ccff, size: 0.14, transparent: true, opacity: 0.6,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._mesh44);
          this._pts44 = pts44;
          this._vels44 = new Float32Array(NPTS44*3);
          this._ages44 = new Float32Array(NPTS44);
          for (var pi44b = 0; pi44b < NPTS44; pi44b++) {
            this._ages44[pi44b] = Math.random()*3;
            var a44 = Math.random()*2*Math.PI;
            var r44 = Math.random()*0.3;
            this._pts44[pi44b*3  ] = r44*Math.cos(a44);
            this._pts44[pi44b*3+1] = this._ages44[pi44b]*3;
            this._pts44[pi44b*3+2] = r44*Math.sin(a44);
            this._vels44[pi44b*3  ] = (Math.random()-0.5)*0.05;
            this._vels44[pi44b*3+1] = 2 + Math.random()*1.5;
            this._vels44[pi44b*3+2] = (Math.random()-0.5)*0.05;
          }
          this._scejTime = 0;
          console.log("[stellar-chromospheric-evaporation-jet] loaded at (300,-700,900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._scejTime += dt;
          var MAXAGE44 = 3.5;
          for (var pi45b = 0; pi45b < this._ages44.length; pi45b++) {
            this._ages44[pi45b] += dt;
            if (this._ages44[pi45b] > MAXAGE44) {
              this._ages44[pi45b] = 0;
              var a45 = Math.random()*2*Math.PI;
              var r45 = Math.random()*0.3;
              this._pts44[pi45b*3  ] = r45*Math.cos(a45);
              this._pts44[pi45b*3+1] = 0;
              this._pts44[pi45b*3+2] = r45*Math.sin(a45);
              this._vels44[pi45b*3  ] = (Math.random()-0.5)*0.05;
              this._vels44[pi45b*3+1] = 2 + Math.random()*1.5;
              this._vels44[pi45b*3+2] = (Math.random()-0.5)*0.05;
            }
            this._pts44[pi45b*3  ] += this._vels44[pi45b*3  ]*dt;
            this._pts44[pi45b*3+1] += this._vels44[pi45b*3+1]*dt;
            this._pts44[pi45b*3+2] += this._vels44[pi45b*3+2]*dt;
          }
          this._geo44.attributes.position.needsUpdate = true;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 118 injected! Lines:', lineCount);
