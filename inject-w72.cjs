'use strict';
// inject-w72.cjs — Wave 72: stellar-opacity-photosphere-pulse + cosmic-topology-wormhole-lattice
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("stellar-opacity-photosphere-pulse"')) {
  console.log('Wave 72 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity galactic-fountain-flow></a-entity>';
const HTML_INSERT = `      <a-entity galactic-fountain-flow></a-entity>
      <!-- ── STELLAR OPACITY PHOTOSPHERE PULSE — cepheid-like radial oscillation ── -->
      <a-entity stellar-opacity-photosphere-pulse></a-entity>
      <!-- ── COSMIC TOPOLOGY WORMHOLE LATTICE — multi-connected universe geometry ── -->
      <a-entity cosmic-topology-wormhole-lattice></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         STELLAR OPACITY PHOTOSPHERE PULSE — Cepheid variables pulsate because
         the opacity of a helium ionization zone drives a kappa mechanism:
         during compression He gets doubly ionized (more opaque), trapping
         heat that then re-expands the star. Net result: luminosity varies
         1-2 mag over periods of 1–50 days. We show a star with breathing
         radial oscillation, brightness correlated with radius, and an
         ionization-zone shell visible during partial ionization.
         Position: (600, -600, 700).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-opacity-photosphere-pulse", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(600, -600, 700);
          scene.add(this._root);

          /* main photosphere sphere */
          this._photo = new THREE.Mesh(
            new THREE.SphereGeometry(1, 24, 24),
            new THREE.MeshBasicMaterial({
              color: 0xffdd88, transparent: true, opacity: 0.85,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._photo);
          this._baseR = 18;

          /* ionization zone shell */
          this._ionShell = new THREE.Mesh(
            new THREE.SphereGeometry(1, 12, 12),
            new THREE.MeshBasicMaterial({
              color: 0x9966ff, transparent: true, opacity: 0.1,
              blending: THREE.AdditiveBlending, depthWrite: false, wireframe: true,
            })
          );
          this._root.add(this._ionShell);
          this._ionBaseR = 24;

          /* convection cells — surface granules */
          this._granules = [];
          for (var gi = 0; gi < 30; gi++) {
            var phi = Math.acos(2*Math.random()-1);
            var th = Math.random()*2*Math.PI;
            var gr = new THREE.Mesh(
              new THREE.SphereGeometry(0.8+Math.random()*0.5, 4, 4),
              new THREE.MeshBasicMaterial({
                color: 0xffaa33, transparent: true, opacity: 0.4,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            gr.userData.phi = phi;
            gr.userData.th = th;
            this._root.add(gr);
            this._granules.push(gr);
          }

          /* outer wind haze */
          var NW = 150;
          var wPts = new Float32Array(NW*3);
          this._wPts = wPts;
          this._wPhi = new Float32Array(NW);
          this._wTh = new Float32Array(NW);
          this._wR = new Float32Array(NW);
          for (var wi = 0; wi < NW; wi++) {
            this._wPhi[wi] = Math.acos(2*Math.random()-1);
            this._wTh[wi] = Math.random()*2*Math.PI;
            this._wR[wi] = 25 + Math.random()*20;
          }
          var wGeo = new THREE.BufferGeometry();
          wGeo.setAttribute("position", new THREE.BufferAttribute(wPts, 3));
          this._wind = new THREE.Points(wGeo, new THREE.PointsMaterial({
            color: 0xffeecc, size: 1.2,
            transparent: true, opacity: 0.18,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._wind);

          this._soppTime = 0;
          this._period = 14;
          this._NW = NW;
          console.log("[stellar-opacity-photosphere-pulse] loaded at (600,-600,700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._soppTime += dt;
          var t = this._soppTime;
          var phase = (t % this._period) / this._period;
          /* radial oscillation — expansion then contraction */
          var oscR = this._baseR * (1 + 0.22 * Math.sin(phase * 2 * Math.PI));
          this._photo.scale.setScalar(oscR);
          var bright = 0.5 + 0.5*(oscR/this._baseR - 0.78)/(0.22);
          this._photo.material.opacity = 0.6 + 0.3*Math.max(0, Math.min(1, bright));
          /* ionization zone */
          var ionR = this._ionBaseR + 4*Math.sin(phase*2*Math.PI + 0.5);
          this._ionShell.scale.setScalar(ionR);
          /* peak opacity */
          var ionOpacity = 0.08 + 0.15*Math.max(0, Math.sin(phase*Math.PI));
          this._ionShell.material.opacity = ionOpacity;
          /* granules at surface */
          for (var gi = 0; gi < this._granules.length; gi++) {
            var gr = this._granules[gi];
            var gr_r = oscR + 0.5;
            gr.position.set(
              gr_r*Math.sin(gr.userData.phi)*Math.cos(gr.userData.th),
              gr_r*Math.cos(gr.userData.phi),
              gr_r*Math.sin(gr.userData.phi)*Math.sin(gr.userData.th)
            );
          }
          /* wind drift */
          for (var wi = 0; wi < this._NW; wi++) {
            this._wR[wi] += 0.5*dt;
            if (this._wR[wi] > 55) this._wR[wi] = 25 + Math.random()*5;
            this._wPts[wi*3  ] = this._wR[wi]*Math.sin(this._wPhi[wi])*Math.cos(this._wTh[wi]);
            this._wPts[wi*3+1] = this._wR[wi]*Math.cos(this._wPhi[wi]);
            this._wPts[wi*3+2] = this._wR[wi]*Math.sin(this._wPhi[wi])*Math.sin(this._wTh[wi]);
          }
          this._wind.geometry.attributes.position.needsUpdate = true;
          this._root.rotation.y += 0.0001*dt;
        },
      });

      /* ====================================================================
         COSMIC TOPOLOGY WORMHOLE LATTICE — if the universe has non-trivial
         topology (e.g. torus, Poincare dodecahedral space, or handle bodies),
         there could be multiple images of the same structure. We visualise
         a lattice of wormhole throats connecting distant sites, each throat
         rendered as a glowing ring with Schwarzschild-like lensing rings
         and connecting tubes. Position: (-300, -1200, 1200).
         @alignment 8→26→48:480  @frequency 72  @domain self-evolve
      ==================================================================== */
      AFRAME.registerComponent("cosmic-topology-wormhole-lattice", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-300, -1200, 1200);
          scene.add(this._root);

          /* lattice of wormhole pairs */
          var WORMHOLES = [
            [[-80, 0, 0],   [80, 0, 0]],
            [[0, -80, 0],   [0, 80, 0]],
            [[0, 0, -80],   [0, 0, 80]],
            [[-55, 55, 55], [55, -55, -55]],
          ];

          this._throats = [];
          for (var wi = 0; wi < WORMHOLES.length; wi++) {
            var pair = WORMHOLES[wi];
            for (var side = 0; side < 2; side++) {
              var cx = pair[side][0], cy = pair[side][1], cz = pair[side][2];
              /* throat ring */
              var rPts = [];
              for (var rp = 0; rp <= 48; rp++) {
                var ra = (rp/48)*2*Math.PI;
                rPts.push(new THREE.Vector3(cx + 12*Math.cos(ra), cy + 12*Math.sin(ra), cz));
              }
              var rGeo = new THREE.BufferGeometry().setFromPoints(rPts);
              var rLine = new THREE.Line(rGeo, new THREE.LineBasicMaterial({
                color: 0x00ffcc, transparent: true, opacity: 0.6,
                blending: THREE.AdditiveBlending, depthWrite: false,
              }));
              this._root.add(rLine);
              /* lensing halos */
              for (var lh = 1; lh <= 3; lh++) {
                var lhPts = [];
                for (var lp = 0; lp <= 48; lp++) {
                  var la = (lp/48)*2*Math.PI;
                  lhPts.push(new THREE.Vector3(cx + (12+lh*4)*Math.cos(la), cy + (12+lh*4)*Math.sin(la), cz));
                }
                var lhGeo = new THREE.BufferGeometry().setFromPoints(lhPts);
                var lhLine = new THREE.Line(lhGeo, new THREE.LineBasicMaterial({
                  color: 0x0066ff, transparent: true, opacity: 0.3/lh,
                  blending: THREE.AdditiveBlending, depthWrite: false,
                }));
                this._root.add(lhLine);
              }
              this._throats.push(rLine);
            }
            /* connecting tube particles */
            var NT = 60;
            var tPts2 = new Float32Array(NT*3);
            var a0 = pair[0], a1 = pair[1];
            for (var ti = 0; ti < NT; ti++) {
              var tf = ti/NT;
              tPts2[ti*3  ] = a0[0]*(1-tf) + a1[0]*tf;
              tPts2[ti*3+1] = a0[1]*(1-tf) + a1[1]*tf;
              tPts2[ti*3+2] = a0[2]*(1-tf) + a1[2]*tf;
            }
            var tGeo = new THREE.BufferGeometry();
            tGeo.setAttribute("position", new THREE.BufferAttribute(tPts2, 3));
            this._root.add(new THREE.Points(tGeo, new THREE.PointsMaterial({
              color: 0x55ffcc, size: 1,
              transparent: true, opacity: 0.2,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          this._ctwTime = 0;
          console.log("[cosmic-topology-wormhole-lattice] loaded at (-300,-1200,1200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._ctwTime += dt;
          var t = this._ctwTime;
          for (var ti = 0; ti < this._throats.length; ti++) {
            this._throats[ti].material.opacity = 0.5 + 0.2*Math.sin(t*2 + ti*1.3);
          }
          this._root.rotation.y += 0.00004*dt;
          this._root.rotation.x += 0.000015*dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 72 injected! Lines:', lineCount);
