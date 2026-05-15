'use strict';
// inject-w82.cjs — Wave 82: interstellar-bow-shock-astrosphere + quasar-proximity-zone-fluorescence
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("interstellar-bow-shock-astrosphere"')) {
  console.log('Wave 82 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity circumgalactic-rain></a-entity>';
const HTML_INSERT = `      <a-entity circumgalactic-rain></a-entity>
      <!-- ── INTERSTELLAR BOW-SHOCK ASTROSPHERE — star moving supersonically through ISM ── -->
      <a-entity interstellar-bow-shock-astrosphere></a-entity>
      <!-- ── QUASAR PROXIMITY ZONE FLUORESCENCE — UV-photoionised IGM near bright quasar ── -->
      <a-entity quasar-proximity-zone-fluorescence></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         INTERSTELLAR BOW-SHOCK ASTROSPHERE — a runaway OB star drives its
         stellar wind against the oncoming ISM, sculpting a parabolic bow shock.
         We render the stellar bubble, the stand-off shock surface as a glowing
         paraboloid, and swept-up ISM dust forming the bright arc.
         Position: (400, -600, 300).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("interstellar-bow-shock-astrosphere", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(400, -600, 300);
          scene.add(this._root);

          /* central OB star */
          this._star = new THREE.Mesh(
            new THREE.SphereGeometry(6, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0x99ccff })
          );
          this._root.add(this._star);

          /* stellar wind bubble */
          var bubble = new THREE.Mesh(
            new THREE.SphereGeometry(18, 14, 10),
            new THREE.MeshBasicMaterial({
              color: 0x3366ff,
              transparent: true, opacity: 0.08,
              blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
            })
          );
          this._root.add(bubble);

          /* parabolic bow-shock arc particles */
          var NA = 5000;
          var aPts = new Float32Array(NA*3);
          var aOff = new Float32Array(NA);
          this._aPts = aPts; this._aOff = aOff; this._NA = NA;
          for (var ai = 0; ai < NA; ai++) {
            var theta = (Math.random()-0.5)*Math.PI*0.85;
            var phi   = Math.random()*2*Math.PI;
            /* parabola: y = standoff + r*(1-cos(theta)), x = r*sin(theta)*cos(phi) */
            var r = 35;
            var standoff = 22;
            var px = r*Math.sin(theta)*Math.cos(phi);
            var py = standoff + r*(1-Math.cos(theta));
            var pz = r*Math.sin(theta)*Math.sin(phi);
            aPts[ai*3] = px; aPts[ai*3+1] = py*0.5; aPts[ai*3+2] = pz;
            aOff[ai] = Math.random()*Math.PI*2;
          }
          var aGeo = new THREE.BufferGeometry();
          aGeo.setAttribute("position", new THREE.BufferAttribute(aPts, 3));
          this._arcMesh = new THREE.Points(aGeo, new THREE.PointsMaterial({
            color: 0xff9933, size: 1.0,
            transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._arcMesh);

          /* ISM dust particles streaming past from behind */
          var NI = 3000;
          var iPts = new Float32Array(NI*3);
          this._iPts = iPts; this._NI = NI;
          for (var ii = 0; ii < NI; ii++) {
            iPts[ii*3  ] = (Math.random()-0.5)*100;
            iPts[ii*3+1] = -(30 + Math.random()*60);
            iPts[ii*3+2] = (Math.random()-0.5)*100;
          }
          var iGeo = new THREE.BufferGeometry();
          iGeo.setAttribute("position", new THREE.BufferAttribute(iPts, 3));
          this._ismMesh = new THREE.Points(iGeo, new THREE.PointsMaterial({
            color: 0xddccaa, size: 0.6,
            transparent: true, opacity: 0.2,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._ismMesh);

          this._bsTime = 0;
          console.log("[interstellar-bow-shock-astrosphere] loaded at (400,-600,300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._bsTime += dt;
          var t = this._bsTime;
          /* shimmer arc */
          for (var ai = 0; ai < this._NA; ai++) {
            this._aPts[ai*3] += 0.3*(Math.random()-0.5)*dt;
            this._aPts[ai*3+2] += 0.3*(Math.random()-0.5)*dt;
          }
          this._arcMesh.geometry.attributes.position.needsUpdate = true;
          this._arcMesh.material.opacity = 0.35 + 0.15*Math.sin(t*1.3);
          /* drift ISM upward */
          for (var ii = 0; ii < this._NI; ii++) {
            this._iPts[ii*3+1] += 8*dt;
            if (this._iPts[ii*3+1] > 30) {
              this._iPts[ii*3  ] = (Math.random()-0.5)*100;
              this._iPts[ii*3+1] = -(30+Math.random()*40);
              this._iPts[ii*3+2] = (Math.random()-0.5)*100;
            }
          }
          this._ismMesh.geometry.attributes.position.needsUpdate = true;
          this._star.material.color.setHSL(0.6, 1, 0.7 + 0.15*Math.sin(t*3));
        },
      });

      /* ====================================================================
         QUASAR PROXIMITY ZONE FLUORESCENCE — a bright quasar's intense UV
         keeps the surrounding IGM highly ionised within its "proximity zone".
         We render a gradient glow that fades with distance, Lyman-alpha
         fluorescent blobs in the haze, and the quasar core with a relativistic
         jet stub.
         Position: (-800, 200, -1200).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("quasar-proximity-zone-fluorescence", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-800, 200, -1200);
          scene.add(this._root);

          /* quasar core */
          this._core = new THREE.Mesh(
            new THREE.SphereGeometry(8, 12, 10),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          this._root.add(this._core);

          /* jet stub */
          var jetGeo = new THREE.CylinderGeometry(0.5, 2.5, 50, 8);
          var jetMat = new THREE.MeshBasicMaterial({
            color: 0x88aaff,
            transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          var jetA = new THREE.Mesh(jetGeo, jetMat);
          jetA.position.set(0, 35, 0);
          this._root.add(jetA);
          var jetB = new THREE.Mesh(jetGeo, jetMat.clone());
          jetB.position.set(0, -35, 0); jetB.rotation.x = Math.PI;
          this._root.add(jetB);

          /* proximity zone glow haze */
          var NZ = 6000;
          var zPts = new Float32Array(NZ*3);
          var zCol = new Float32Array(NZ*3);
          this._zPts = zPts; this._NZ = NZ;
          for (var zi = 0; zi < NZ; zi++) {
            var za = Math.random()*2*Math.PI;
            var ze = Math.random()*Math.PI;
            var zr = 15 + Math.random()*90;
            zPts[zi*3  ] = zr*Math.sin(ze)*Math.cos(za);
            zPts[zi*3+1] = zr*Math.cos(ze);
            zPts[zi*3+2] = zr*Math.sin(ze)*Math.sin(za);
            var fade = 1 - zr/105;
            zCol[zi*3  ] = 0.4*fade; zCol[zi*3+1] = 0.7*fade; zCol[zi*3+2] = 1.0*fade;
          }
          var zGeo = new THREE.BufferGeometry();
          zGeo.setAttribute("position", new THREE.BufferAttribute(zPts, 3));
          zGeo.setAttribute("color", new THREE.BufferAttribute(zCol, 3));
          this._haze = new THREE.Points(zGeo, new THREE.PointsMaterial({
            vertexColors: true, size: 0.9,
            transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._haze);

          this._qpTime = 0;
          console.log("[quasar-proximity-zone-fluorescence] loaded at (-800,200,-1200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._qpTime += dt;
          var t = this._qpTime;
          this._core.material.color.setHSL(0, 0, 0.8 + 0.2*Math.abs(Math.sin(t*4)));
          this._haze.material.opacity = 0.2 + 0.1*Math.sin(t*0.6);
          this._root.rotation.y += 0.006 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 82 injected! Lines:', lineCount);
