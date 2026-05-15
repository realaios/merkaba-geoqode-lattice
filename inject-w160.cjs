/**
 * inject-w160.cjs  — Wave 160
 * cosmic-geomagnetic-sudden-impulse + stellar-sunspot-decay-moat-flow
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-geomagnetic-sudden-impulse"')) {
  console.log('Wave 160 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-geomagnetic-sudden-impulse", {
        /* Geomagnetic Sudden Impulse (SI) / Sudden Commencement (SSC) —
           when a CME or pressure pulse hits Earth's magnetosphere the
           entire global field is compressed in seconds; a sharp
           compression wave radiates outward through the magnetosphere
           and is seen as a sharp spike on all ground magnetometers;
           animated compression ring expanding then rebounding;
           bright white leading shock ring, fading blue afterglow;
           white, blue, cyan palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-2800, 3500, -4000);
          this.g = g; this.t = 0;

          /* Earth core */
          const eGeo = new THREE.SphereGeometry(10, 12, 10);
          const eMat = new THREE.MeshBasicMaterial({ color: 0x1133aa, transparent: true, opacity: 0.5 });
          g.add(new THREE.Mesh(eGeo, eMat));

          /* Compression rings — several expanding rings, staggered */
          const NRING = 4;
          this.rings = [];
          for (let r = 0; r < NRING; r++) {
            const NSEG = 48;
            const pts  = [];
            for (let k = 0; k < NSEG; k++) {
              const ang = (k / (NSEG - 1)) * Math.PI * 2;
              pts.push(new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang)));
            }
            const rGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const rMat = new THREE.LineBasicMaterial({
              color: r === 0 ? 0xffffff : 0x44aaff,
              transparent: true, opacity: 0
            });
            const line = new THREE.Line(rGeo, rMat);
            g.add(line);
            this.rings.push({ line, mat: rMat, phase: (r / NRING) * 0.8 });
          }

          /* Dayside compressed magnetopause */
          const NFAC = 36;
          const dayPts = [];
          for (let k = 0; k < NFAC; k++) {
            const ang = ((k / (NFAC - 1)) - 0.5) * Math.PI;
            const r   = 40 + 20 * Math.cos(ang) * Math.cos(ang);
            dayPts.push(new THREE.Vector3(r * Math.cos(ang) * 0.4, r * Math.sin(ang), 0));
          }
          const dayGeo = new THREE.BufferGeometry().setFromPoints(dayPts);
          const dayMat = new THREE.LineBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.2 });
          g.add(new THREE.Line(dayGeo, dayMat));
          this.dayMat = dayMat;

          /* Particles scattered by the impulse */
          const NP = 150;
          const pGeo = new THREE.BufferGeometry();
          const pBuf = new Float32Array(NP * 3);
          this.pBuf = pBuf; this.NP = NP;
          this.pVel = new Float32Array(NP * 3);
          for (let i = 0; i < NP; i++) {
            const r  = 12 + Math.random() * 40;
            const th = Math.random() * Math.PI; const ph = Math.random() * Math.PI * 2;
            pBuf[i * 3]     = r * Math.sin(th) * Math.cos(ph);
            pBuf[i * 3 + 1] = r * Math.cos(th);
            pBuf[i * 3 + 2] = r * Math.sin(th) * Math.sin(ph);
            const speed = 0.15 + Math.random() * 0.12;
            this.pVel[i * 3]     = pBuf[i * 3]     / r * speed;
            this.pVel[i * 3 + 1] = pBuf[i * 3 + 1] / r * speed;
            this.pVel[i * 3 + 2] = pBuf[i * 3 + 2] / r * speed;
          }
          pGeo.setAttribute('position', new THREE.BufferAttribute(pBuf, 3));
          const pMat = new THREE.PointsMaterial({ color: 0xaaddff, size: 0.9, transparent: true, opacity: 0.4 });
          g.add(new THREE.Points(pGeo, pMat));
          this.pMat = pMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.006;

          /* Rings expand and fade cyclically (SI repeat) */
          const PERIOD = 6.0;
          this.rings.forEach((ring, ri) => {
            const localT = ((T / PERIOD + ring.phase) % 1.0);
            const scale  = 10 + localT * 80;
            ring.line.scale.set(scale, 1, scale);
            const fade   = localT < 0.2 ? localT / 0.2 : 1 - (localT - 0.2) / 0.8;
            ring.mat.opacity = Math.max(0, fade) * (ri === 0 ? 0.8 : 0.35);
          });

          /* Particles radiate outward and wrap */
          for (let i = 0; i < this.NP; i++) {
            this.pBuf[i * 3]     += this.pVel[i * 3];
            this.pBuf[i * 3 + 1] += this.pVel[i * 3 + 1];
            this.pBuf[i * 3 + 2] += this.pVel[i * 3 + 2];
            const r = Math.sqrt(this.pBuf[i * 3] ** 2 + this.pBuf[i * 3 + 1] ** 2 + this.pBuf[i * 3 + 2] ** 2);
            if (r > 80) {
              const rs = 12 + Math.random() * 10;
              const th = Math.random() * Math.PI; const ph = Math.random() * Math.PI * 2;
              this.pBuf[i * 3]     = rs * Math.sin(th) * Math.cos(ph);
              this.pBuf[i * 3 + 1] = rs * Math.cos(th);
              this.pBuf[i * 3 + 2] = rs * Math.sin(th) * Math.sin(ph);
            }
          }
          this.pMat.opacity = 0.3 + 0.12 * Math.abs(Math.sin(T * 0.5));
          this.dayMat.opacity = 0.15 + 0.08 * Math.abs(Math.sin(T * 0.35));
        }
      });

      AFRAME.registerComponent("stellar-sunspot-decay-moat-flow", {
        /* Sunspot decay moat flow — as a sunspot dissolves over days,
           magnetic fragments are swept away into a "moat" region of
           outward moving plasma, carrying small moving magnetic elements
           (MMFs — moving magnetic features) along the moat boundary;
           outward radial flow lines carrying bright moving dots;
           dark central umbra, grey penumbra ring, bright MMF dots;
           dark-brown, grey, white-yellow palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(4800, 2700, 2500);
          this.g = g; this.t = 0;

          /* Sunspot umbra */
          const uGeo = new THREE.SphereGeometry(7, 10, 8);
          const uMat = new THREE.MeshBasicMaterial({ color: 0x110800, transparent: true, opacity: 0.95 });
          g.add(new THREE.Mesh(uGeo, uMat));

          /* Penumbra disc */
          const pGeo = new THREE.RingGeometry(7, 14, 32);
          const pMat = new THREE.MeshBasicMaterial({ color: 0x553322, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(pGeo, pMat));
          this.pMat = pMat;

          /* Moat boundary ring */
          const NMOAT = 52;
          const moatPts = [];
          for (let k = 0; k < NMOAT; k++) {
            const ang = (k / (NMOAT - 1)) * Math.PI * 2;
            moatPts.push(new THREE.Vector3(26 * Math.cos(ang), 0, 26 * Math.sin(ang)));
          }
          const mGeo = new THREE.BufferGeometry().setFromPoints(moatPts);
          const mMat = new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.2 });
          g.add(new THREE.Line(mGeo, mMat));
          this.mMat = mMat;

          /* Radial moat flow lines */
          const NFLOW = 16;
          this.flowLines = [];
          for (let f = 0; f < NFLOW; f++) {
            const ang = (f / NFLOW) * Math.PI * 2;
            const pts = [];
            for (let k = 0; k < 12; k++) {
              const r = 14 + k * 1.2;
              pts.push(new THREE.Vector3(r * Math.cos(ang), 0, r * Math.sin(ang)));
            }
            const fGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const fMat = new THREE.LineBasicMaterial({ color: 0x887755, transparent: true, opacity: 0.18 });
            g.add(new THREE.Line(fGeo, fMat));
            this.flowLines.push(fMat);
          }

          /* MMF moving features */
          const NMMF = 30;
          const mmfGeo = new THREE.BufferGeometry();
          const mmfBuf = new Float32Array(NMMF * 3);
          this.mmfBuf = mmfBuf; this.NMMF = NMMF;
          this.mmfT   = new Float32Array(NMMF);
          this.mmfPh  = new Float32Array(NMMF);
          for (let i = 0; i < NMMF; i++) {
            this.mmfT[i]  = Math.random();
            this.mmfPh[i] = (i / NMMF) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
          }
          mmfGeo.setAttribute('position', new THREE.BufferAttribute(mmfBuf, 3));
          const mmfMat = new THREE.PointsMaterial({ color: 0xffeeaa, size: 1.2, transparent: true, opacity: 0.65 });
          g.add(new THREE.Points(mmfGeo, mmfMat));
          this.mmfMat = mmfMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.z += dt * 0.003;
          this.pMat.opacity = 0.4 + 0.12 * Math.abs(Math.sin(T * 0.4));
          this.mMat.opacity = 0.15 + 0.07 * Math.abs(Math.sin(T * 0.3));
          this.flowLines.forEach((m, fi) => { m.opacity = 0.12 + 0.08 * Math.abs(Math.sin(T * 0.45 + fi * 0.2)); });

          /* MMFs drift outward */
          for (let i = 0; i < this.NMMF; i++) {
            this.mmfT[i] += dt * 0.15;
            if (this.mmfT[i] > 1) { this.mmfT[i] = 0; this.mmfPh[i] = Math.random() * Math.PI * 2; }
            const r = 14 + this.mmfT[i] * 14;
            const ph = this.mmfPh[i];
            this.mmfBuf[i * 3]     = r * Math.cos(ph);
            this.mmfBuf[i * 3 + 1] = 0;
            this.mmfBuf[i * 3 + 2] = r * Math.sin(ph);
          }
          this.mmfMat.opacity = 0.5 + 0.18 * Math.abs(Math.sin(T * 0.55));
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-hot-spot-polar-coronal-hole></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-geomagnetic-sudden-impulse></a-entity>
      <a-entity stellar-sunspot-decay-moat-flow></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 160 injected! Lines: ' + lines);
