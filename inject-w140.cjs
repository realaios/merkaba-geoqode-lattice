/**
 * inject-w140.cjs  — Wave 140
 * cosmic-radiation-belt-injection  + stellar-oscillation-mode-splitting
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-radiation-belt-injection"')) {
  console.log('Wave 140 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-radiation-belt-injection", {
        /* Radiation belt injection event — substorm injects energetic
           electrons into the inner magnetosphere; particle drift orbits
           form glowing rings at L=2-5; green-purple gradient as energy
           increases; radial injection front sweeps inward;
           green, purple, gold palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-600, 2200, 2600);
          this.g = g; this.t = 0;

          /* Planet */
          const plGeo = new THREE.SphereGeometry(30, 20, 14);
          const plMat = new THREE.MeshBasicMaterial({ color: 0x224488, transparent: true, opacity: 0.6 });
          g.add(new THREE.Mesh(plGeo, plMat));

          /* L-shell rings L=2..5 */
          const LS = [2, 2.8, 3.7, 5.0];
          this.rings = [];
          for (let i = 0; i < LS.length; i++) {
            const r = LS[i] * 32;
            const rGeo = new THREE.TorusGeometry(r, 2.5, 8, 60);
            rGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.12, 1));
            const hue = 0.32 - i * 0.07;
            const col = new THREE.Color();
            col.setHSL(Math.max(0.05, hue), 0.9, 0.55);
            const rMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55 });
            const rMesh = new THREE.Mesh(rGeo, rMat);
            g.add(rMesh);
            this.rings.push({ mesh: rMesh, mat: rMat, r, L: LS[i], phase: i * 0.8, driftOmega: 0.08 + i * 0.04 });
          }

          /* Injection front — radial expanding arc */
          const NARC = 80;
          const arcGeo = new THREE.BufferGeometry();
          const arcBuf = new Float32Array(NARC * 3);
          arcGeo.setAttribute('position', new THREE.BufferAttribute(arcBuf, 3));
          const arcMat = new THREE.LineBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0 });
          g.add(new THREE.Line(arcGeo, arcMat));
          this.arcBuf = arcBuf; this.arcMat = arcMat; this.NARC = NARC;
          this.arcGeo = arcGeo;
          this.arcR = 170; this.injecting = false; this.injectTimer = 0;

          /* Drifting electrons — dots orbiting along each ring */
          const NDRIFT = 300;
          const dGeo = new THREE.BufferGeometry();
          const dBuf = new Float32Array(NDRIFT * 3);
          this.dPhi    = new Float32Array(NDRIFT);
          this.dRing   = new Uint8Array(NDRIFT);
          this.dBright = new Float32Array(NDRIFT);
          for (let i = 0; i < NDRIFT; i++) {
            this.dPhi[i]  = Math.random() * Math.PI * 2;
            this.dRing[i] = Math.floor(i / (NDRIFT / LS.length));
            this.dBright[i] = 0.3 + Math.random() * 0.7;
          }
          dGeo.setAttribute('position', new THREE.BufferAttribute(dBuf, 3));
          const dMat = new THREE.PointsMaterial({ color: 0x88ff44, size: 2.0, transparent: true, opacity: 0.65 });
          g.add(new THREE.Points(dGeo, dMat));
          this.dBuf = dBuf; this.dMat = dMat; this.NDRIFT = NDRIFT;
          this.LS = LS;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.01;

          /* Injection event every 10s */
          this.injectTimer += dt;
          if (this.injectTimer > 10) { this.injectTimer = 0; this.injecting = true; this.arcR = 170; }
          if (this.injecting) {
            this.arcR -= dt * 50;
            if (this.arcR < 65) { this.injecting = false; this.arcMat.opacity = 0; }
          }

          /* Draw injection arc */
          if (this.injecting) {
            for (let i = 0; i < this.NARC; i++) {
              const ang = (i / (this.NARC - 1)) * Math.PI * 2;
              this.arcBuf[i * 3]     = this.arcR * Math.cos(ang);
              this.arcBuf[i * 3 + 1] = 0;
              this.arcBuf[i * 3 + 2] = this.arcR * Math.sin(ang);
            }
            this.arcGeo.attributes.position.needsUpdate = true;
            this.arcMat.opacity = 0.7 - (170 - this.arcR) / 200;
          }

          /* Drift and brightness oscillate */
          this.rings.forEach((r, idx) => {
            r.mesh.rotation.y += dt * r.driftOmega;
            const onRing = this.injecting && this.arcR < r.r + 5;
            r.mat.opacity = 0.4 + (onRing ? 0.45 : 0) + 0.1 * Math.sin(T * 2 + r.phase);
          });

          /* Electrons drift around rings */
          for (let i = 0; i < this.NDRIFT; i++) {
            const ri = this.dRing[i];
            const r = this.LS[ri] * 32;
            const omega = this.rings[ri].driftOmega * 4.5;
            this.dPhi[i] += dt * omega;
            this.dBuf[i * 3]     = r * Math.cos(this.dPhi[i]);
            this.dBuf[i * 3 + 1] = (this.LS[ri] - 3.5) * 2 * Math.sin(this.dPhi[i] * 0.5);
            this.dBuf[i * 3 + 2] = r * Math.sin(this.dPhi[i]);
          }
          this.dMat.opacity = 0.5 + 0.2 * Math.abs(Math.sin(T * 1.5));
        }
      });

      AFRAME.registerComponent("stellar-oscillation-mode-splitting", {
        /* Helioseismology — pressure (p-mode) oscillations of a star;
           global standing waves; m-mode splitting due to rotation
           visualised as interference ring patterns on the stellar
           surface; concentric ripple shells at different frequencies;
           silver-cyan-blue surface ripples palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-3400, -900, 1400);
          this.g = g; this.t = 0;

          /* Stellar sphere */
          const sGeo = new THREE.SphereGeometry(55, 48, 32);
          const sMat = new THREE.MeshBasicMaterial({ color: 0xffeedd, transparent: true, opacity: 0.55 });
          g.add(new THREE.Mesh(sGeo, sMat));
          this.sMat = sMat;

          /* Mode rings — concentric great-circle rings at diff latitudes */
          const NRING = 10;
          this.modeRings = [];
          for (let r = 0; r < NRING; r++) {
            const lat = -Math.PI / 2 + (r / (NRING - 1)) * Math.PI;
            const cosLat = Math.cos(lat);
            const sinLat = Math.sin(lat);
            const rad = 55 * cosLat;
            const rGeo = new THREE.TorusGeometry(Math.max(0.5, rad), 1.0, 6, 40);
            const hue = 0.58 + r * 0.018;
            const col = new THREE.Color();
            col.setHSL(hue % 1, 0.75, 0.65);
            const rMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35 });
            const rMesh = new THREE.Mesh(rGeo, rMat);
            rMesh.position.y = 55 * sinLat;
            g.add(rMesh);
            /* Frequency prop to cos²(lat) — equatorial modes faster */
            this.modeRings.push({ mesh: rMesh, mat: rMat, freq: 1.5 + 2.5 * cosLat * cosLat, phase: r * 0.55 });
          }

          /* Surface displacement ripple dots */
          const N = 600;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          this.ptTheta = new Float32Array(N);
          this.ptPhi   = new Float32Array(N);
          this.ptFreq  = new Float32Array(N);
          this.ptAmp   = new Float32Array(N);
          for (let i = 0; i < N; i++) {
            this.ptTheta[i] = Math.acos(2 * Math.random() - 1);
            this.ptPhi[i]   = Math.random() * Math.PI * 2;
            /* l-mode number: 0..8 */
            const l = Math.floor(Math.random() * 9);
            this.ptFreq[i]  = 1.2 + l * 0.4;
            this.ptAmp[i]   = 2 + Math.random() * 5;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xaaddff, size: 2.0, transparent: true, opacity: 0.55 });
          g.add(new THREE.Points(ptGeo, ptMat));
          this.ptBuf = ptBuf; this.ptMat = ptMat; this.N = N;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.015;

          /* Slow overall pulsation */
          const pulse = Math.sin(T * 1.3);
          this.sMat.opacity = 0.5 + 0.08 * pulse;

          /* Each mode ring oscillates in opacity — standing wave */
          this.modeRings.forEach((mr) => {
            mr.mat.opacity = 0.15 + 0.28 * Math.abs(Math.sin(T * mr.freq + mr.phase));
            mr.mesh.rotation.z += dt * (mr.freq * 0.05);
          });

          /* Surface ripple dots — radial displacement */
          for (let i = 0; i < this.N; i++) {
            const displace = this.ptAmp[i] * Math.sin(T * this.ptFreq[i] + this.ptPhi[i] * 2.0);
            const r = 55 + displace;
            const sinT = Math.sin(this.ptTheta[i]);
            this.ptBuf[i * 3]     = r * sinT * Math.cos(this.ptPhi[i]);
            this.ptBuf[i * 3 + 1] = r * Math.cos(this.ptTheta[i]);
            this.ptBuf[i * 3 + 2] = r * sinT * Math.sin(this.ptPhi[i]);
          }
          this.ptMat.opacity = 0.4 + 0.2 * Math.abs(pulse);
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-tachocline-magnetic-pumping></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-radiation-belt-injection></a-entity>
      <a-entity stellar-oscillation-mode-splitting></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 140 injected! Lines: ' + lines);
