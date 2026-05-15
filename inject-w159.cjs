/**
 * inject-w159.cjs  — Wave 159
 * cosmic-solar-energetic-particle-event + stellar-hot-spot-polar-coronal-hole
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-solar-energetic-particle-event"')) {
  console.log('Wave 159 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-solar-energetic-particle-event", {
        /* Solar Energetic Particle (SEP) event — a large solar flare or
           CME shock accelerates protons and electrons to near-relativistic
           speeds; particles stream along Parker spiral field lines and
           arrive at Earth in minutes (prompt component) or hours (diffuse);
           animated particle streams racing along curved spiral paths;
           yellow-white proton streams, blue electron streams;
           gold, white, blue palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(3000, 2000, -5500);
          this.g = g; this.t = 0;

          /* Sun source */
          const sunGeo = new THREE.SphereGeometry(18, 12, 10);
          const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa22, transparent: true, opacity: 0.5 });
          g.add(new THREE.Mesh(sunGeo, sunMat));
          this.sunMat = sunMat;

          /* Parker spiral paths */
          const NSPIRAL = 4; const NSPT = 40;
          this.spiralPts = [];
          for (let s = 0; s < NSPIRAL; s++) {
            const pts = [];
            const phOff = (s / NSPIRAL) * Math.PI * 0.5;
            for (let k = 0; k < NSPT; k++) {
              const t  = k / (NSPT - 1);
              const ph = phOff + t * 2.0;
              const r  = 18 + t * 150;
              pts.push(new THREE.Vector3(r * Math.cos(ph), t * 10 - 5, r * Math.sin(ph)));
            }
            const lGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const lMat = new THREE.LineBasicMaterial({ color: 0xffdd88, transparent: true, opacity: 0.18 });
            g.add(new THREE.Line(lGeo, lMat));
            this.spiralPts.push(pts);
          }

          /* Prompt proton particles racing along spirals */
          const NPROT = 180;
          const protGeo = new THREE.BufferGeometry();
          const protBuf = new Float32Array(NPROT * 3);
          this.protBuf = protBuf; this.NPROT = NPROT;
          this.protT   = new Float32Array(NPROT);
          this.protS   = new Float32Array(NPROT);
          for (let i = 0; i < NPROT; i++) {
            this.protT[i] = Math.random();
            this.protS[i] = Math.floor(Math.random() * NSPIRAL);
          }
          protGeo.setAttribute('position', new THREE.BufferAttribute(protBuf, 3));
          const protMat = new THREE.PointsMaterial({ color: 0xffee88, size: 1.0, transparent: true, opacity: 0.6 });
          g.add(new THREE.Points(protGeo, protMat));
          this.protMat = protMat;

          /* Diffuse electron particles (blue, slower) */
          const NELEC = 100;
          const elecGeo = new THREE.BufferGeometry();
          const elecBuf = new Float32Array(NELEC * 3);
          this.elecBuf = elecBuf; this.NELEC = NELEC;
          this.elecT   = new Float32Array(NELEC);
          this.elecS   = new Float32Array(NELEC);
          for (let i = 0; i < NELEC; i++) {
            this.elecT[i] = Math.random();
            this.elecS[i] = Math.floor(Math.random() * NSPIRAL);
          }
          elecGeo.setAttribute('position', new THREE.BufferAttribute(elecBuf, 3));
          const elecMat = new THREE.PointsMaterial({ color: 0x66aaff, size: 0.9, transparent: true, opacity: 0.45 });
          g.add(new THREE.Points(elecGeo, elecMat));
          this.elecMat = elecMat;

          this.NSPIRAL = NSPIRAL; this.NSPT = NSPT;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.005;
          this.sunMat.opacity = 0.4 + 0.15 * Math.abs(Math.sin(T * 0.5));

          const NSPT = this.NSPT;
          /* Protons race (fast) */
          for (let i = 0; i < this.NPROT; i++) {
            this.protT[i] += dt * 0.55;
            if (this.protT[i] > 1) { this.protT[i] = 0; this.protS[i] = Math.floor(Math.random() * this.NSPIRAL); }
            const t = this.protT[i]; const si = this.protS[i];
            const idx = Math.min(Math.floor(t * (NSPT - 1)), NSPT - 2);
            const fr  = t * (NSPT - 1) - idx;
            const a   = this.spiralPts[si][idx]; const b = this.spiralPts[si][idx + 1];
            this.protBuf[i * 3]     = a.x + (b.x - a.x) * fr;
            this.protBuf[i * 3 + 1] = a.y + (b.y - a.y) * fr;
            this.protBuf[i * 3 + 2] = a.z + (b.z - a.z) * fr;
          }
          this.protMat.opacity = 0.45 + 0.2 * Math.abs(Math.sin(T * 0.6));

          /* Electrons drift slower */
          for (let i = 0; i < this.NELEC; i++) {
            this.elecT[i] += dt * 0.22;
            if (this.elecT[i] > 1) { this.elecT[i] = 0; this.elecS[i] = Math.floor(Math.random() * this.NSPIRAL); }
            const t = this.elecT[i]; const si = this.elecS[i];
            const idx = Math.min(Math.floor(t * (NSPT - 1)), NSPT - 2);
            const fr  = t * (NSPT - 1) - idx;
            const a   = this.spiralPts[si][idx]; const b = this.spiralPts[si][idx + 1];
            this.elecBuf[i * 3]     = a.x + (b.x - a.x) * fr;
            this.elecBuf[i * 3 + 1] = a.y + (b.y - a.y) * fr;
            this.elecBuf[i * 3 + 2] = a.z + (b.z - a.z) * fr;
          }
          this.elecMat.opacity = 0.3 + 0.15 * Math.abs(Math.sin(T * 0.45));
        }
      });

      AFRAME.registerComponent("stellar-hot-spot-polar-coronal-hole", {
        /* Polar coronal hole hot-spot — the open magnetic field
           at the solar poles creates large dark coronal holes in EUV
           that are also the source of high-speed solar wind;
           bright equatorial ring contrasts with the dark polar cap;
           within the hole, faint plume structures extend outward;
           dark polar cap, bright EUV rim, green-white plumes;
           teal, dark-blue, bright-green palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-4800, -4200, -3000);
          this.g = g; this.t = 0;

          /* Solar body */
          const sGeo = new THREE.SphereGeometry(24, 16, 12);
          const sMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.35 });
          g.add(new THREE.Mesh(sGeo, sMat));
          this.sMat = sMat;

          /* Polar cap (dark) — top */
          const capGeo = new THREE.SphereGeometry(24.5, 12, 6, 0, Math.PI * 2, 0, 0.45);
          const capMat = new THREE.MeshBasicMaterial({ color: 0x000511, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(capGeo, capMat));
          /* Bottom cap */
          const cap2Geo = new THREE.SphereGeometry(24.5, 12, 6, 0, Math.PI * 2, Math.PI - 0.45, 0.45);
          g.add(new THREE.Mesh(cap2Geo, capMat.clone()));

          /* EUV bright rim equatorial ring */
          const NRIM = 60;
          const rimPts = [];
          for (let k = 0; k < NRIM; k++) {
            const ang = (k / (NRIM - 1)) * Math.PI * 2;
            rimPts.push(new THREE.Vector3(25 * Math.cos(ang), 0, 25 * Math.sin(ang)));
          }
          const rimGeo = new THREE.BufferGeometry().setFromPoints(rimPts);
          const rimMat = new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.5 });
          g.add(new THREE.Line(rimGeo, rimMat));
          this.rimMat = rimMat;

          /* Polar plumes */
          const NPLUME = 6;
          this.plumes = [];
          for (let p = 0; p < NPLUME; p++) {
            const ph = (p / NPLUME) * Math.PI * 2;
            const pts = [];
            const NPSEG = 20;
            for (let k = 0; k < NPSEG; k++) {
              const t   = k / (NPSEG - 1);
              const r   = 24 + t * 50;
              const dPh = Math.sin(t * Math.PI) * 0.1;
              pts.push(new THREE.Vector3(r * Math.sin(dPh + ph * 0.05) * 0.3, 24 + t * 50, r * Math.cos(dPh + ph * 0.05) * 0.3));
            }
            const pGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const pMat = new THREE.LineBasicMaterial({ color: 0x88ffdd, transparent: true, opacity: 0.25 });
            g.add(new THREE.Line(pGeo, pMat));
            this.plumes.push(pMat);
          }

          /* High-speed wind particles */
          const NW = 160;
          const wGeo = new THREE.BufferGeometry();
          const wBuf = new Float32Array(NW * 3);
          this.wBuf = wBuf; this.NW = NW;
          this.wT   = new Float32Array(NW);
          this.wPh  = new Float32Array(NW);
          for (let i = 0; i < NW; i++) {
            this.wT[i]  = Math.random();
            this.wPh[i] = Math.random() * Math.PI * 2;
          }
          wGeo.setAttribute('position', new THREE.BufferAttribute(wBuf, 3));
          const wMat = new THREE.PointsMaterial({ color: 0x44ffcc, size: 0.85, transparent: true, opacity: 0.35 });
          g.add(new THREE.Points(wGeo, wMat));
          this.wMat = wMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.007;
          this.rimMat.opacity = 0.35 + 0.18 * Math.abs(Math.sin(T * 0.5));
          this.plumes.forEach((m, pi) => { m.opacity = 0.15 + 0.15 * Math.abs(Math.sin(T * 0.55 + pi * 0.4)); });

          /* Wind particles streaming from poles */
          for (let i = 0; i < this.NW; i++) {
            this.wT[i] += dt * 0.3;
            if (this.wT[i] > 1) { this.wT[i] = 0; this.wPh[i] = Math.random() * Math.PI * 2; }
            const r   = 24 + this.wT[i] * 55;
            const ph  = this.wPh[i];
            const side = i % 2 === 0 ? 1 : -1;
            this.wBuf[i * 3]     = r * Math.sin(0.08) * Math.cos(ph);
            this.wBuf[i * 3 + 1] = side * (24 + this.wT[i] * 55);
            this.wBuf[i * 3 + 2] = r * Math.sin(0.08) * Math.sin(ph);
          }
          this.wMat.opacity = 0.25 + 0.12 * Math.abs(Math.sin(T * 0.4));
          this.sMat.opacity = 0.28 + 0.08 * Math.abs(Math.sin(T * 0.35));
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-chromospheric-rosette-brightening></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-solar-energetic-particle-event></a-entity>
      <a-entity stellar-hot-spot-polar-coronal-hole></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 159 injected! Lines: ' + lines);
