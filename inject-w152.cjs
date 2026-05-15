/**
 * inject-w152.cjs  — Wave 152
 * cosmic-magnetosheath-foreshock-beam  + stellar-chromospheric-network-brightening
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-magnetosheath-foreshock-beam"')) {
  console.log('Wave 152 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-magnetosheath-foreshock-beam", {
        /* Earth foreshock — ions backscattered from the bow shock
           stream back upstream along IMF field lines forming an
           electron and ion foreshock; wave-particle interactions
           generate field-aligned beams and gyrating distributions;
           blue bow shock surface, white/yellow streaming beams,
           diffuse back-scattered cloud; blue, yellow, white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(5500, 600, -2400);
          this.g = g; this.t = 0;

          /* Bow shock paraboloid */
          const NTHBS = 20; const NPHBS = 24;
          const bsGeo = new THREE.BufferGeometry();
          const bsVerts = [];
          for (let it = 0; it < NTHBS; it++) {
            for (let ip = 0; ip < NPHBS; ip++) {
              const th = (it / (NTHBS - 1)) * Math.PI;
              const ph = (ip / (NPHBS - 1)) * Math.PI * 2;
              const r  = 75 + 25 * (1 - Math.abs(Math.cos(th)));
              bsVerts.push(r * Math.sin(th) * Math.cos(ph), r * Math.cos(th), r * Math.sin(th) * Math.sin(ph));
            }
          }
          bsGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bsVerts), 3));
          const bsMat = new THREE.PointsMaterial({ color: 0x3366ff, size: 1.3, transparent: true, opacity: 0.3 });
          g.add(new THREE.Points(bsGeo, bsMat));
          this.bsMat = bsMat;

          /* Earth sphere */
          const eGeo = new THREE.SphereGeometry(18, 14, 10);
          const eMat = new THREE.MeshBasicMaterial({ color: 0x114488, transparent: true, opacity: 0.6 });
          g.add(new THREE.Mesh(eGeo, eMat));

          /* Magnetopause surface */
          const mpVerts = [];
          for (let it = 0; it < NTHBS; it++) {
            for (let ip = 0; ip < NPHBS; ip++) {
              const th = (it / (NTHBS - 1)) * Math.PI;
              const ph = (ip / (NPHBS - 1)) * Math.PI * 2;
              const r  = 45 + 10 * (1 - Math.abs(Math.cos(th)));
              mpVerts.push(r * Math.sin(th) * Math.cos(ph), r * Math.cos(th), r * Math.sin(th) * Math.sin(ph));
            }
          }
          const mpGeo = new THREE.BufferGeometry();
          mpGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(mpVerts), 3));
          const mpMat = new THREE.PointsMaterial({ color: 0x44aaff, size: 0.9, transparent: true, opacity: 0.18 });
          g.add(new THREE.Points(mpGeo, mpMat));
          this.mpMat = mpMat;

          /* Foreshock beam lines — backstreaming along IMF */
          const NBEAM = 18;
          this.beams = [];
          for (let b = 0; b < NBEAM; b++) {
            const startPhi = (b / NBEAM) * Math.PI * 2;
            const pts = [];
            for (let k = 0; k < 30; k++) pts.push(new THREE.Vector3(0, 0, 0));
            const bGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const hue = 0.13 + 0.05 * Math.sin(b * 0.5);
            const col = new THREE.Color(); col.setHSL(hue, 0.95, 0.65);
            const bMat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.4 });
            g.add(new THREE.Line(bGeo, bMat));
            this.beams.push({ geo: bGeo, mat: bMat, pts, phi: startPhi });
          }

          /* Backscattered ion cloud */
          const NION = 260;
          const ionGeo = new THREE.BufferGeometry();
          const ionBuf = new Float32Array(NION * 3);
          this.ionBuf = ionBuf; this.NION = NION;
          this.ionT   = new Float32Array(NION);
          this.ionPhi = new Float32Array(NION);
          this.ionTh  = new Float32Array(NION);
          for (let i = 0; i < NION; i++) {
            this.ionT[i]   = Math.random();
            this.ionPhi[i] = Math.random() * Math.PI * 2;
            this.ionTh[i]  = Math.random() * Math.PI;
          }
          ionGeo.setAttribute('position', new THREE.BufferAttribute(ionBuf, 3));
          const ionMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.1, transparent: true, opacity: 0.35 });
          g.add(new THREE.Points(ionGeo, ionMat));
          this.ionMat = ionMat;

          /* Solar wind upstream flow */
          const NSW = 200;
          const swGeo = new THREE.BufferGeometry();
          const swBuf = new Float32Array(NSW * 3);
          this.swBuf = swBuf; this.NSW = NSW;
          this.swT   = new Float32Array(NSW);
          for (let i = 0; i < NSW; i++) {
            this.swT[i] = Math.random();
            swBuf[i * 3]     = -100 + Math.random() * 60;
            swBuf[i * 3 + 1] = (Math.random() - 0.5) * 140;
            swBuf[i * 3 + 2] = (Math.random() - 0.5) * 140;
          }
          swGeo.setAttribute('position', new THREE.BufferAttribute(swBuf, 3));
          const swMat = new THREE.PointsMaterial({ color: 0xaaddff, size: 0.8, transparent: true, opacity: 0.25 });
          g.add(new THREE.Points(swGeo, swMat));
          this.swMat = swMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.008;

          this.bsMat.opacity = 0.2 + 0.12 * Math.abs(Math.sin(T * 0.4));
          this.mpMat.opacity = 0.12 + 0.07 * Math.abs(Math.sin(T * 0.5));

          /* Beam lines angled upstream */
          this.beams.forEach((bm, bi) => {
            const N = 30;
            for (let k = 0; k < N; k++) {
              const frac = k / (N - 1);
              const r    = 85 + frac * 70;
              const ph   = bm.phi + T * 0.04;
              const th   = 0.6 + frac * 0.4;
              bm.pts[k].set(r * Math.sin(th) * Math.cos(ph), r * Math.cos(th) * 0.6, r * Math.sin(th) * Math.sin(ph));
            }
            bm.geo.setFromPoints(bm.pts);
            bm.mat.opacity = 0.25 + 0.2 * Math.abs(Math.sin(T * 0.6 + bi * 0.3));
          });

          /* Ion backstreaming */
          for (let i = 0; i < this.NION; i++) {
            this.ionT[i] += dt * 0.18;
            if (this.ionT[i] > 1) { this.ionT[i] = 0; this.ionPhi[i] = Math.random() * Math.PI * 2; }
            const frac = this.ionT[i];
            const r    = 85 + frac * 60;
            const ph   = this.ionPhi[i] + T * 0.03;
            const th   = this.ionTh[i];
            this.ionBuf[i * 3]     = r * Math.sin(th) * Math.cos(ph) + (Math.random() - 0.5) * 6;
            this.ionBuf[i * 3 + 1] = r * Math.cos(th) * 0.5 + (Math.random() - 0.5) * 4;
            this.ionBuf[i * 3 + 2] = r * Math.sin(th) * Math.sin(ph) + (Math.random() - 0.5) * 6;
          }
          this.ionMat.opacity = 0.25 + 0.15 * Math.abs(Math.sin(T * 0.8));

          /* Solar wind advecting toward Earth */
          for (let i = 0; i < this.NSW; i++) {
            this.swBuf[i * 3] += dt * 22;
            if (this.swBuf[i * 3] > 85) {
              this.swBuf[i * 3]     = -100;
              this.swBuf[i * 3 + 1] = (Math.random() - 0.5) * 140;
              this.swBuf[i * 3 + 2] = (Math.random() - 0.5) * 140;
            }
          }
          this.swMat.opacity = 0.18 + 0.1 * Math.abs(Math.sin(T * 0.6));
        }
      });

      AFRAME.registerComponent("stellar-chromospheric-network-brightening", {
        /* Chromospheric network brightenings (CBNs) — small rapid
           brightenings (< 1 min) that repeat at the same locations
           in the chromospheric network; they mark supergranule
           boundaries; white-blue flashes at network nodes; possibly
           linked to chromospheric heating; white, blue, gold palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-4800, -1200, 2600);
          this.g = g; this.t = 0;

          /* Solar disc */
          const sGeo = new THREE.SphereGeometry(48, 18, 14);
          const sMat = new THREE.MeshBasicMaterial({ color: 0xffaa22, transparent: true, opacity: 0.5 });
          g.add(new THREE.Mesh(sGeo, sMat));

          /* Supergranule network — hex-ish Voronoi-like boundaries */
          const NNODE = 55;
          this.nodes = [];
          for (let i = 0; i < NNODE; i++) {
            const th = Math.acos(2 * Math.random() - 1);
            const ph = Math.random() * Math.PI * 2;
            const r  = 48.2;
            const norm = new THREE.Vector3(
              Math.sin(th) * Math.cos(ph),
              Math.cos(th),
              Math.sin(th) * Math.sin(ph)
            );
            const pos = norm.clone().multiplyScalar(r);
            /* Node glow */
            const nGeo = new THREE.SphereGeometry(0.8 + Math.random() * 0.5, 5, 4);
            const nMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
            const nMesh = new THREE.Mesh(nGeo, nMat);
            nMesh.position.copy(pos);
            g.add(nMesh);
            const period = 1.5 + Math.random() * 4.5;
            const phase  = Math.random() * period;
            this.nodes.push({ mat: nMat, mesh: nMesh, norm, period, phase, life: phase });
          }

          /* Network edge lines connecting nodes */
          const NEDGE = 70;
          this.edges = [];
          for (let e = 0; e < NEDGE; e++) {
            const i1 = Math.floor(Math.random() * NNODE);
            let i2 = i1;
            while (i2 === i1) i2 = Math.floor(Math.random() * NNODE);
            const p1 = this.nodes[i1].mesh.position;
            const p2 = this.nodes[i2].mesh.position;
            const ePts = [p1.clone(), p2.clone()];
            const eGeo = new THREE.BufferGeometry().setFromPoints(ePts);
            const eMat = new THREE.LineBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.2 });
            g.add(new THREE.Line(eGeo, eMat));
            this.edges.push({ mat: eMat });
          }

          /* Brightening flash — point burst */
          const NBF = 120;
          const bfGeo = new THREE.BufferGeometry();
          const bfBuf = new Float32Array(NBF * 3);
          this.bfBuf = bfBuf; this.NBF = NBF;
          this.bfNodeIdx = new Uint8Array(NBF);
          this.bfT       = new Float32Array(NBF);
          this.bfOff     = new Float32Array(NBF * 3);
          for (let i = 0; i < NBF; i++) {
            this.bfNodeIdx[i] = Math.floor(Math.random() * NNODE);
            this.bfT[i]       = Math.random() * 2;
            for (let d = 0; d < 3; d++) this.bfOff[i * 3 + d] = (Math.random() - 0.5) * 2.5;
          }
          bfGeo.setAttribute('position', new THREE.BufferAttribute(bfBuf, 3));
          const bfMat = new THREE.PointsMaterial({ color: 0xaaccff, size: 1.0, transparent: true, opacity: 0.45 });
          g.add(new THREE.Points(bfGeo, bfMat));
          this.bfMat = bfMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.014;

          /* Brightening nodes — repeat flickering */
          this.nodes.forEach((nd, i) => {
            nd.life += dt;
            const phase = nd.life % nd.period;
            let alpha;
            if (phase < 0.15) {
              alpha = phase / 0.15;
            } else if (phase < 0.55) {
              alpha = 1 - (phase - 0.15) / 0.4 * 0.7;
            } else if (phase < 0.75) {
              alpha = 0.3 - (phase - 0.55) / 0.2 * 0.3;
            } else {
              alpha = 0;
            }
            alpha = Math.max(0, alpha);
            nd.mat.opacity = alpha * 0.9;
            const col = new THREE.Color();
            col.setHSL(0.58 + 0.08 * alpha, 0.5, 0.5 + 0.5 * alpha);
            nd.mat.color = col;
          });

          this.edges.forEach((e, i) => {
            e.mat.opacity = 0.12 + 0.08 * Math.abs(Math.sin(T * 0.3 + i * 0.4));
          });

          /* Flash burst particles */
          for (let i = 0; i < this.NBF; i++) {
            this.bfT[i] += dt * 0.5;
            if (this.bfT[i] > 2) this.bfT[i] = 0;
            const nd  = this.nodes[this.bfNodeIdx[i]];
            const pos = nd.mesh.position;
            this.bfBuf[i * 3]     = pos.x + this.bfOff[i * 3]     * this.bfT[i];
            this.bfBuf[i * 3 + 1] = pos.y + this.bfOff[i * 3 + 1] * this.bfT[i];
            this.bfBuf[i * 3 + 2] = pos.z + this.bfOff[i * 3 + 2] * this.bfT[i];
          }
          this.bfMat.opacity = 0.3 + 0.2 * Math.abs(Math.sin(T * 0.9));
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-solar-tornado-prominence></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-magnetosheath-foreshock-beam></a-entity>
      <a-entity stellar-chromospheric-network-brightening></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 152 injected! Lines: ' + lines);
