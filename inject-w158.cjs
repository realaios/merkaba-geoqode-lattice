/**
 * inject-w158.cjs  — Wave 158
 * cosmic-cometary-disconnection-event + stellar-chromospheric-rosette-brightening
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-cometary-disconnection-event"')) {
  console.log('Wave 158 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-cometary-disconnection-event", {
        /* Cometary ion-tail disconnection event (DE) — a sector boundary
           crossing can cause the ion tail to pinch off and drift away as
           a disconnected plasma cloud, while a new tail re-forms;
           the old severed tail drifting downwind, a new blue ion tail
           growing from the coma; blue ion tail, white plasma cloud;
           blue, cyan, white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-1500, 4200, -7000);
          this.g = g; this.t = 0;

          /* Nucleus */
          const nucGeo = new THREE.SphereGeometry(6, 10, 8);
          const nucMat = new THREE.MeshBasicMaterial({ color: 0x443322, transparent: true, opacity: 0.85 });
          g.add(new THREE.Mesh(nucGeo, nucMat));

          /* Coma */
          const comGeo = new THREE.SphereGeometry(18, 10, 8);
          const comMat = new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.06, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(comGeo, comMat));
          this.comMat = comMat;

          /* New ion tail growing from coma */
          const NNTAIL = 28; const NPTAIL = 1;
          this.newTail = [];
          for (let s = 0; s < NNTAIL; s++) {
            const pts = [];
            const NSEG = 20;
            for (let k = 0; k < NSEG; k++) {
              const t  = k / (NSEG - 1);
              const x  = -18 - t * 120;
              const y  = (Math.random() - 0.5) * 5 * t;
              const z  = (s - NNTAIL / 2) * 1.5;
              pts.push(new THREE.Vector3(x, y, z));
            }
            const tGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const tMat = new THREE.LineBasicMaterial({ color: 0x44aaff, transparent: true, opacity: 0.3 + Math.random() * 0.15 });
            g.add(new THREE.Line(tGeo, tMat));
            this.newTail.push(tMat);
          }

          /* Severed old tail — disconnected plasma cloud drifting away */
          const NOLD = 200;
          const oldGeo = new THREE.BufferGeometry();
          const oldBuf = new Float32Array(NOLD * 3);
          this.oldBuf = oldBuf; this.NOLD = NOLD;
          this.oldVel = new Float32Array(NOLD * 3);
          for (let i = 0; i < NOLD; i++) {
            oldBuf[i * 3]     = -60 - Math.random() * 80;
            oldBuf[i * 3 + 1] = (Math.random() - 0.5) * 20;
            oldBuf[i * 3 + 2] = (Math.random() - 0.5) * 20;
            this.oldVel[i * 3]     = -0.08 - Math.random() * 0.04;
            this.oldVel[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
            this.oldVel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
          }
          oldGeo.setAttribute('position', new THREE.BufferAttribute(oldBuf, 3));
          const oldMat = new THREE.PointsMaterial({ color: 0xaaddff, size: 1.1, transparent: true, opacity: 0.35 });
          g.add(new THREE.Points(oldGeo, oldMat));
          this.oldMat = oldMat;

          /* Dust tail (yellow-white, wider fan) */
          const NDUST = 160;
          const dustGeo = new THREE.BufferGeometry();
          const dustBuf = new Float32Array(NDUST * 3);
          this.dustBuf = dustBuf; this.NDUST = NDUST;
          for (let i = 0; i < NDUST; i++) {
            const t = Math.random();
            dustBuf[i * 3]     = -16 - t * 90;
            dustBuf[i * 3 + 1] = t * (Math.random() - 0.5) * 30;
            dustBuf[i * 3 + 2] = t * (Math.random() - 0.5) * 14;
          }
          dustGeo.setAttribute('position', new THREE.BufferAttribute(dustBuf, 3));
          const dustMat = new THREE.PointsMaterial({ color: 0xffffcc, size: 0.8, transparent: true, opacity: 0.2 });
          g.add(new THREE.Points(dustGeo, dustMat));
          this.dustMat = dustMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.004;

          /* Old tail drifts and fades */
          for (let i = 0; i < this.NOLD; i++) {
            this.oldBuf[i * 3]     += this.oldVel[i * 3];
            this.oldBuf[i * 3 + 1] += this.oldVel[i * 3 + 1];
            this.oldBuf[i * 3 + 2] += this.oldVel[i * 3 + 2];
            /* Wrap */
            if (this.oldBuf[i * 3] < -300) {
              this.oldBuf[i * 3]     = -60 - Math.random() * 60;
              this.oldBuf[i * 3 + 1] = (Math.random() - 0.5) * 20;
              this.oldBuf[i * 3 + 2] = (Math.random() - 0.5) * 20;
            }
          }
          this.oldMat.opacity = 0.2 + 0.15 * Math.abs(Math.sin(T * 0.4));
          this.comMat.opacity = 0.04 + 0.04 * Math.abs(Math.sin(T * 0.3));
          this.newTail.forEach((m, ti) => { m.opacity = 0.2 + 0.15 * Math.abs(Math.sin(T * 0.5 + ti * 0.3)); });
          this.dustMat.opacity = 0.15 + 0.08 * Math.abs(Math.sin(T * 0.25));
        }
      });

      AFRAME.registerComponent("stellar-chromospheric-rosette-brightening", {
        /* Chromospheric rosette brightening — Ca II K images show
           rosette patterns in the quiet chromosphere around supergranule
           boundaries; bright Ca K emission rims surround dark inter-
           granular cells forming a flower pattern; central brightening
           and radial petal arcs; calcium K violet, bright rings, dark cells;
           violet, bright-white, blue palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(6200, -3000, 1000);
          this.g = g; this.t = 0;

          /* Central network bright point */
          const cGeo = new THREE.SphereGeometry(5, 10, 8);
          const cMat = new THREE.MeshBasicMaterial({ color: 0xddaaff, transparent: true, opacity: 0.6 });
          g.add(new THREE.Mesh(cGeo, cMat));
          this.cMat = cMat;

          /* Rosette petals */
          const NPETAL = 7;
          this.petals = [];
          for (let p = 0; p < NPETAL; p++) {
            const pAng = (p / NPETAL) * Math.PI * 2;
            const cx   = 22 * Math.cos(pAng);
            const cy   = 22 * Math.sin(pAng);
            const NPTS = 20;
            const pts  = [];
            for (let k = 0; k < NPTS; k++) {
              const a2 = (k / (NPTS - 1)) * Math.PI * 2;
              pts.push(new THREE.Vector3(cx + 8 * Math.cos(a2), cy + 8 * Math.sin(a2), 0));
            }
            const pGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const pMat = new THREE.LineBasicMaterial({ color: 0xcc88ff, transparent: true, opacity: 0.45 });
            g.add(new THREE.Line(pGeo, pMat));
            this.petals.push(pMat);
          }

          /* Bright Ca K rims between petals */
          const NRIM = NPETAL;
          this.rims = [];
          for (let r = 0; r < NRIM; r++) {
            const rAng = ((r + 0.5) / NRIM) * Math.PI * 2;
            const NSEG = 14;
            const pts  = [];
            for (let k = 0; k < NSEG; k++) {
              const t  = k / (NSEG - 1);
              const rr = 14 + t * 10;
              const da = 0.15 * Math.sin(t * Math.PI);
              pts.push(new THREE.Vector3(rr * Math.cos(rAng + da), rr * Math.sin(rAng + da), 0));
            }
            const rGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const rMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
            g.add(new THREE.Line(rGeo, rMat));
            this.rims.push(rMat);
          }

          /* Supergranule boundary ring */
          const NSUP = 50;
          const supPts = [];
          for (let k = 0; k < NSUP; k++) {
            const ang = (k / (NSUP - 1)) * Math.PI * 2;
            supPts.push(new THREE.Vector3(34 * Math.cos(ang), 34 * Math.sin(ang), 0));
          }
          const supGeo = new THREE.BufferGeometry().setFromPoints(supPts);
          const supMat = new THREE.LineBasicMaterial({ color: 0x8844cc, transparent: true, opacity: 0.2 });
          g.add(new THREE.Line(supGeo, supMat));
          this.supMat = supMat;

          /* Ca K bright particles scattered */
          const NCK = 120;
          const ckGeo = new THREE.BufferGeometry();
          const ckBuf = new Float32Array(NCK * 3);
          this.ckBuf = ckBuf; this.NCK = NCK;
          for (let i = 0; i < NCK; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = 10 + Math.random() * 24;
            ckBuf[i * 3]     = r * Math.cos(a);
            ckBuf[i * 3 + 1] = r * Math.sin(a);
            ckBuf[i * 3 + 2] = (Math.random() - 0.5) * 2;
          }
          ckGeo.setAttribute('position', new THREE.BufferAttribute(ckBuf, 3));
          const ckMat = new THREE.PointsMaterial({ color: 0xeeddff, size: 0.8, transparent: true, opacity: 0.35 });
          g.add(new THREE.Points(ckGeo, ckMat));
          this.ckMat = ckMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.z += dt * 0.007;
          this.cMat.opacity    = 0.45 + 0.2 * Math.abs(Math.sin(T * 0.8));
          this.petals.forEach((m, pi) => { m.opacity = 0.3 + 0.2 * Math.abs(Math.sin(T * 0.55 + pi * 0.4)); });
          this.rims.forEach((m, ri)   => { m.opacity = 0.2 + 0.15 * Math.abs(Math.sin(T * 0.7 + ri * 0.35)); });
          this.supMat.opacity  = 0.12 + 0.08 * Math.abs(Math.sin(T * 0.3));
          this.ckMat.opacity   = 0.25 + 0.15 * Math.abs(Math.sin(T * 0.6));
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-penumbral-magneto-convection></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-cometary-disconnection-event></a-entity>
      <a-entity stellar-chromospheric-rosette-brightening></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 158 injected! Lines: ' + lines);
