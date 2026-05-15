'use strict';
// inject-w93.cjs — Wave 93: cosmic-gyrokinetic-drift-wave + stellar-cepheid-pulsation-shell
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-gyrokinetic-drift-wave"')) {
  console.log('Wave 93 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity cosmic-collider-bar-shock></a-entity>';
const HTML_INSERT = `      <a-entity cosmic-collider-bar-shock></a-entity>
      <!-- ── COSMIC GYROKINETIC DRIFT WAVE — drift-wave turbulence in magnetized plasma ── -->
      <a-entity cosmic-gyrokinetic-drift-wave></a-entity>
      <!-- ── STELLAR CEPHEID PULSATION SHELL — periodic kappa-mechanism radial pulsation ── -->
      <a-entity stellar-cepheid-pulsation-shell></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC GYROKINETIC DRIFT WAVE — in magnetized plasma, density
         gradients drive drift waves; the resulting turbulence causes
         anomalous cross-field transport. Renders as propagating phase
         ripples across a glowing plasma slab.
         Position: (-300, 800, -500).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-gyrokinetic-drift-wave", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-300, 800, -500);
          scene.add(this._root);

          var NW = 80, NWY = 50;
          this._NW = NW; this._NWY = NWY;
          var wPts = new Float32Array(NW*NWY*3);
          this._wPts = wPts;
          for (var wx = 0; wx < NW; wx++) {
            for (var wy = 0; wy < NWY; wy++) {
              var idx = wx*NWY+wy;
              wPts[idx*3  ] = -40 + wx*(80/(NW-1));
              wPts[idx*3+1] = -20 + wy*(40/(NWY-1));
              wPts[idx*3+2] = 0;
            }
          }
          var wGeo = new THREE.BufferGeometry();
          wGeo.setAttribute("position", new THREE.BufferAttribute(wPts, 3));
          this._slab = new THREE.Points(wGeo, new THREE.PointsMaterial({
            color: 0x3399ff, size: 0.7,
            transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
            vertexColors: false,
          }));
          this._root.add(this._slab);
          this._cgdwTime = 0;
          console.log("[cosmic-gyrokinetic-drift-wave] loaded at (-300,800,-500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cgdwTime += dt;
          var t = this._cgdwTime;
          var NW = this._NW, NWY = this._NWY;
          for (var wx = 0; wx < NW; wx++) {
            for (var wy = 0; wy < NWY; wy++) {
              var idx = wx*NWY+wy;
              var xv = -40 + wx*(80/(NW-1));
              var yv = -20 + wy*(40/(NWY-1));
              var phase = xv*0.25 - t*4 + yv*0.12;
              this._wPts[idx*3+2] = 5*Math.sin(phase);
            }
          }
          this._slab.geometry.attributes.position.needsUpdate = true;
          this._slab.material.opacity = 0.2 + 0.08*Math.sin(t*2.3);
        },
      });

      /* ====================================================================
         STELLAR CEPHEID PULSATION SHELL — the kappa-mechanism in the HeII
         ionization zone drives periodic radial oscillations; the photosphere
         expands and contracts, with a traveling thermal ionization front.
         Renders: rhythmically breathing stellar shell with color shift.
         Position: (-100, 500, 800).
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("stellar-cepheid-pulsation-shell", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-100, 500, 800);
          scene.add(this._root);

          /* photosphere shell layers */
          this._shells = [];
          for (var sl = 0; sl < 4; sl++) {
            var NS3 = 2000;
            var sPts4 = new Float32Array(NS3*3);
            var r0 = 12 + sl*4;
            for (var si2 = 0; si2 < NS3; si2++) {
              var sa2 = Math.random()*2*Math.PI, sb2 = Math.random()*Math.PI;
              sPts4[si2*3  ] = r0*Math.sin(sb2)*Math.cos(sa2);
              sPts4[si2*3+1] = r0*Math.cos(sb2);
              sPts4[si2*3+2] = r0*Math.sin(sb2)*Math.sin(sa2);
            }
            var sGeo4 = new THREE.BufferGeometry();
            sGeo4.setAttribute("position", new THREE.BufferAttribute(sPts4, 3));
            var sMat = new THREE.PointsMaterial({
              color: 0xffee88, size: 0.5,
              transparent: true, opacity: 0.2 - sl*0.04,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var sMesh = new THREE.Points(sGeo4, sMat);
            this._root.add(sMesh);
            this._shells.push({ mesh: sMesh, r0: r0, phase: sl*0.7 });
          }

          /* ionization front ring */
          var ifPts = [];
          for (var ia = 0; ia < 120; ia++) {
            var iang = ia/120 * 2*Math.PI;
            ifPts.push(16*Math.cos(iang), 16*Math.sin(iang), 0);
          }
          var ifGeo = new THREE.BufferGeometry();
          ifGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(ifPts), 3));
          this._ionRing = new THREE.Line(ifGeo, new THREE.LineBasicMaterial({
            color: 0xffaacc, transparent: true, opacity: 0.6,
            blending: THREE.AdditiveBlending,
          }));
          this._root.add(this._ionRing);

          this._scpsTime = 0;
          console.log("[stellar-cepheid-pulsation-shell] loaded at (-100,500,800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._scpsTime += dt;
          var t = this._scpsTime;
          /* pulsation period ~5.3s visually */
          var pulsate = Math.sin(t*1.18);
          for (var sl = 0; sl < this._shells.length; sl++) {
            var sh = this._shells[sl];
            var scale = 1 + 0.15*Math.sin(t*1.18 + sh.phase);
            sh.mesh.scale.set(scale, scale, scale);
            sh.mesh.material.opacity = (0.2 - sl*0.04) * (0.7 + 0.4*(pulsate+1)*0.5);
          }
          var ir = 16 + 3*pulsate;
          this._ionRing.scale.set(ir/16, ir/16, 1);
          this._ionRing.material.opacity = 0.5 + 0.3*(pulsate+1)*0.5;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 93 injected! Lines:', lineCount);
