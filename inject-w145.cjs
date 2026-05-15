/**
 * inject-w145.cjs  — Wave 145
 * cosmic-interstellar-bow-shock-termination  + stellar-crochet-sfe-wave
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-interstellar-bow-shock-termination"')) {
  console.log('Wave 145 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-interstellar-bow-shock-termination", {
        /* Astrospheric termination shock (like the heliospheric one but
           around another star) where the stellar wind slows from
           supersonic to subsonic; flat ellipsoidal shell upstream,
           elongated tail downstream; supersonic wind particles pile up;
           blue-cyan upstream, purple downstream; blue, purple, white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-3800, -1600, -2200);
          this.g = g; this.t = 0;

          /* Host star */
          const sGeo = new THREE.SphereGeometry(18, 16, 12);
          const sMat = new THREE.MeshBasicMaterial({ color: 0xffee88, transparent: true, opacity: 0.8 });
          g.add(new THREE.Mesh(sGeo, sMat));

          /* Termination shock shell — oblate ellipsoid upstream */
          const tsGeo = new THREE.SphereGeometry(80, 28, 20);
          tsGeo.applyMatrix4(new THREE.Matrix4().makeScale(1.0, 0.7, 0.8));
          const tsMat = new THREE.MeshBasicMaterial({ color: 0x2255ff, transparent: true, opacity: 0.18, side: THREE.DoubleSide, wireframe: true });
          g.add(new THREE.Mesh(tsGeo, tsMat));
          this.tsMat = tsMat;

          /* Heliopause — further out, elongated tail side */
          const hpGeo = new THREE.SphereGeometry(1, 28, 18);
          hpGeo.applyMatrix4(new THREE.Matrix4().makeScale(110, 80, 200));
          const hpMat = new THREE.MeshBasicMaterial({ color: 0x8833cc, transparent: true, opacity: 0.08, side: THREE.DoubleSide, wireframe: true });
          g.add(new THREE.Mesh(hpGeo, hpMat));
          this.hpMat = hpMat;

          /* Supersonic wind particles */
          const NW = 400;
          const wGeo = new THREE.BufferGeometry();
          const wBuf = new Float32Array(NW * 3);
          this.wR   = new Float32Array(NW);
          this.wPhi = new Float32Array(NW);
          this.wTheta = new Float32Array(NW);
          this.wSpd = new Float32Array(NW);
          for (let i = 0; i < NW; i++) {
            this.wR[i]     = 20 + Math.random() * 58;
            this.wPhi[i]   = Math.random() * Math.PI * 2;
            this.wTheta[i] = Math.acos(2 * Math.random() - 1);
            this.wSpd[i]   = 20 + Math.random() * 30;
          }
          wGeo.setAttribute('position', new THREE.BufferAttribute(wBuf, 3));
          const wMat = new THREE.PointsMaterial({ color: 0x88ccff, size: 1.8, transparent: true, opacity: 0.5 });
          g.add(new THREE.Points(wGeo, wMat));
          this.wBuf = wBuf; this.wMat = wMat; this.NW = NW;

          /* Post-shock particles beyond TS */
          const NPS = 200;
          const psGeo = new THREE.BufferGeometry();
          const psBuf = new Float32Array(NPS * 3);
          this.psPhi   = new Float32Array(NPS);
          this.psTheta = new Float32Array(NPS);
          this.psR     = new Float32Array(NPS);
          for (let i = 0; i < NPS; i++) {
            this.psR[i]     = 82 + Math.random() * 26;
            this.psPhi[i]   = Math.random() * Math.PI * 2;
            this.psTheta[i] = Math.acos(2 * Math.random() - 1);
          }
          psGeo.setAttribute('position', new THREE.BufferAttribute(psBuf, 3));
          const psMat = new THREE.PointsMaterial({ color: 0xcc88ff, size: 1.8, transparent: true, opacity: 0.4 });
          g.add(new THREE.Points(psGeo, psMat));
          this.psBuf = psBuf; this.psMat = psMat; this.NPS = NPS;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.013;

          /* Supersonic outward wind */
          for (let i = 0; i < this.NW; i++) {
            this.wR[i] += dt * this.wSpd[i];
            if (this.wR[i] > 78) this.wR[i] = 20 + Math.random() * 5;
            const sinT = Math.sin(this.wTheta[i]);
            this.wBuf[i * 3]     = this.wR[i] * sinT * Math.cos(this.wPhi[i]);
            this.wBuf[i * 3 + 1] = this.wR[i] * Math.cos(this.wTheta[i]) * 0.7;
            this.wBuf[i * 3 + 2] = this.wR[i] * sinT * Math.sin(this.wPhi[i]);
          }
          this.wMat.opacity = 0.4 + 0.12 * Math.abs(Math.sin(T * 0.8));

          /* Post-shock slow drift */
          for (let i = 0; i < this.NPS; i++) {
            this.psPhi[i] += dt * 0.04;
            const sinT = Math.sin(this.psTheta[i]);
            this.psBuf[i * 3]     = this.psR[i] * sinT * Math.cos(this.psPhi[i]);
            this.psBuf[i * 3 + 1] = this.psR[i] * Math.cos(this.psTheta[i]) * 0.7;
            this.psBuf[i * 3 + 2] = this.psR[i] * sinT * Math.sin(this.psPhi[i]);
          }
          this.psMat.opacity = 0.3 + 0.1 * Math.abs(Math.sin(T * 1.2));

          this.tsMat.opacity = 0.12 + 0.08 * Math.abs(Math.sin(T * 0.6));
          this.hpMat.opacity = 0.06 + 0.04 * Math.abs(Math.sin(T * 0.5));
        }
      });

      AFRAME.registerComponent("stellar-crochet-sfe-wave", {
        /* Solar flare effect (SFE) / geomagnetic crochet — sudden
           ionospheric disturbance caused by EUV from a solar flare
           ionising the dayside ionosphere; propagates as a wavefront
           across the sunlit hemisphere; short sharp pulse then slower
           recovery; green-cyan ionospheric wavefront on a blue globe;
           teal, cyan, white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(1800, 3600, -1800);
          this.g = g; this.t = 0;

          /* Earth globe */
          const eGeo = new THREE.SphereGeometry(35, 24, 18);
          const eMat = new THREE.MeshBasicMaterial({ color: 0x0033aa, transparent: true, opacity: 0.6 });
          g.add(new THREE.Mesh(eGeo, eMat));

          /* Ionosphere shell */
          const ioGeo = new THREE.SphereGeometry(38, 24, 18);
          ioGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, 1));
          const ioMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(ioGeo, ioMat));
          this.ioMat = ioMat;

          /* SFE wavefront ring — circle of latitude */
          const mkWave = () => {
            const wGeo = new THREE.TorusGeometry(1, 1.5, 6, 60);
            const wMat = new THREE.MeshBasicMaterial({ color: 0x44ffdd, transparent: true, opacity: 0 });
            const wMesh = new THREE.Mesh(wGeo, wMat);
            g.add(wMesh);
            return { mesh: wMesh, mat: wMat };
          };
          this.wave = mkWave();
          this.waveTimer = 0;
          this.waveR = 0;

          /* Day-hemisphere bright patch */
          const dpGeo = new THREE.SphereGeometry(37, 20, 20, 0, Math.PI);
          const dpMat = new THREE.MeshBasicMaterial({ color: 0x00eedd, transparent: true, opacity: 0.06, side: THREE.DoubleSide });
          this.dayPatch = new THREE.Mesh(dpGeo, dpMat);
          this.dayPatch.rotation.y = -Math.PI / 2;
          g.add(this.dayPatch);
          this.dpMat = dpMat;

          /* Ionospheric particle patch */
          const NI = 200;
          const iGeo = new THREE.BufferGeometry();
          const iBuf = new Float32Array(NI * 3);
          this.iPhi   = new Float32Array(NI);
          this.iTheta = new Float32Array(NI);
          for (let i = 0; i < NI; i++) {
            this.iPhi[i]   = Math.random() * Math.PI;        /* dayside */
            this.iTheta[i] = Math.random() * Math.PI;
          }
          iGeo.setAttribute('position', new THREE.BufferAttribute(iBuf, 3));
          const iMat = new THREE.PointsMaterial({ color: 0xaaffee, size: 1.8, transparent: true, opacity: 0 });
          g.add(new THREE.Points(iGeo, iMat));
          this.iBuf = iBuf; this.iMat = iMat; this.NI = NI;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.018;

          /* SFE pulse every 12s */
          this.waveTimer += dt;
          const cycle = this.waveTimer % 12;

          let pulseIntensity = 0;
          if (cycle < 0.5) {
            /* Flare onset — sudden */
            pulseIntensity = cycle / 0.5;
            this.waveR = cycle / 0.5 * 38;
          } else if (cycle < 3) {
            /* Wavefront propagates */
            pulseIntensity = 1 - (cycle - 0.5) / 2.5 * 0.6;
            this.waveR = 38;
          } else if (cycle < 8) {
            /* Recovery */
            pulseIntensity = 0.4 * (1 - (cycle - 3) / 5);
          } else {
            pulseIntensity = 0;
          }

          /* Scale wave ring to simulate latitude propagation */
          const rScale = Math.max(0.1, this.waveR);
          this.wave.mesh.scale.setScalar(rScale / 1);
          this.wave.mat.opacity = Math.max(0, pulseIntensity * 0.7);

          this.ioMat.opacity = 0.06 + pulseIntensity * 0.18;
          this.dpMat.opacity = 0.04 + pulseIntensity * 0.12;

          /* Ionospheric glow particles */
          for (let i = 0; i < this.NI; i++) {
            const r = 38;
            const sinT = Math.sin(this.iTheta[i]);
            this.iBuf[i * 3]     = r * sinT * Math.cos(this.iPhi[i]);
            this.iBuf[i * 3 + 1] = r * Math.cos(this.iTheta[i]);
            this.iBuf[i * 3 + 2] = r * sinT * Math.sin(this.iPhi[i]);
          }
          this.iMat.opacity = Math.max(0, pulseIntensity * 0.5);
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-magnetic-carpet-emergence></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-interstellar-bow-shock-termination></a-entity>
      <a-entity stellar-crochet-sfe-wave></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 145 injected! Lines: ' + lines);
