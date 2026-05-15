/**
 * inject-w146.cjs  — Wave 146
 * cosmic-flux-transfer-event-vortex  + stellar-umbral-oscillation-beacon
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-flux-transfer-event-vortex"')) {
  console.log('Wave 146 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-flux-transfer-event-vortex", {
        /* Flux Transfer Event (FTE) — intermittent reconnection at the
           magnetopause produces short-lived flux ropes that twist and
           convect over the boundary layer; helical rope twists away;
           quasi-periodic bursts every ~8 minutes; red-orange field-
           aligned currents with blue-white open flux; warm red, orange,
           white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(600, -2800, -3500);
          this.g = g; this.t = 0;

          /* Magnetopause boundary plane */
          const mpGeo = new THREE.PlaneGeometry(180, 180, 10, 10);
          const mpMat = new THREE.MeshBasicMaterial({ color: 0x3355cc, transparent: true, opacity: 0.12, side: THREE.DoubleSide, wireframe: true });
          g.add(new THREE.Mesh(mpGeo, mpMat));
          this.mpMat = mpMat;

          /* Pool of FTE rope tubes */
          const NFTE = 6;
          this.ftes = [];
          for (let i = 0; i < NFTE; i++) {
            this.ftes.push(this._spawnFTE(i));
          }

          /* Background drifting open-flux particles */
          const NP = 280;
          const pGeo = new THREE.BufferGeometry();
          const pBuf = new Float32Array(NP * 3);
          this.pBuf = pBuf; this.NP = NP;
          this.pX = new Float32Array(NP); this.pY = new Float32Array(NP); this.pZ = new Float32Array(NP);
          this.pVY = new Float32Array(NP);
          for (let i = 0; i < NP; i++) {
            this.pX[i] = (Math.random() - 0.5) * 160;
            this.pY[i] = (Math.random() - 0.5) * 160;
            this.pZ[i] = (Math.random() - 0.5) * 30;
            this.pVY[i] = (Math.random() - 0.5) * 20;
          }
          pGeo.setAttribute('position', new THREE.BufferAttribute(pBuf, 3));
          const pMat = new THREE.PointsMaterial({ color: 0x88aaff, size: 1.5, transparent: true, opacity: 0.3 });
          g.add(new THREE.Points(pGeo, pMat));
          this.pMat = pMat;
        },
        _spawnFTE(idx) {
          const THREE = AFRAME.THREE;
          const ox = (Math.random() - 0.5) * 120;
          const oy = (Math.random() - 0.5) * 120;
          /* Build helical points */
          const N = 40;
          const pts = [];
          const len = 50 + Math.random() * 40;
          for (let k = 0; k < N; k++) {
            const f = k / (N - 1);
            const twist = f * Math.PI * 4;
            const rad = 5 + 3 * Math.sin(f * Math.PI);
            pts.push(new THREE.Vector3(ox + rad * Math.cos(twist), oy + rad * Math.sin(twist), -len / 2 + f * len));
          }
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          const hue = 0.04 + Math.random() * 0.06;
          const col = new THREE.Color();
          col.setHSL(hue, 1, 0.6);
          const mat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0 });
          const line = new THREE.Line(geo, mat);
          this.g.add(line);
          /* Delay stagger */
          return { line, mat, phase: idx * 1.8 + Math.random(), active: false, life: 0, lifeMax: 2.5 };
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.z += dt * 0.009;
          this.mpMat.opacity = 0.08 + 0.05 * Math.abs(Math.sin(T * 0.4));

          this.ftes.forEach((f) => {
            const tMod = (T + f.phase) % 8;
            if (tMod < f.lifeMax) {
              const progress = tMod / f.lifeMax;
              f.mat.opacity = progress < 0.2 ? progress / 0.2 * 0.8 : (progress < 0.8 ? 0.8 : (1 - (progress - 0.8) / 0.2) * 0.8);
              f.line.rotation.z += dt * 0.6;
            } else {
              f.mat.opacity = Math.max(0, f.mat.opacity - dt * 2);
            }
          });

          for (let i = 0; i < this.NP; i++) {
            this.pY[i] += dt * this.pVY[i];
            if (this.pY[i] > 80) this.pY[i] = -80;
            if (this.pY[i] < -80) this.pY[i] = 80;
            this.pBuf[i * 3]     = this.pX[i];
            this.pBuf[i * 3 + 1] = this.pY[i];
            this.pBuf[i * 3 + 2] = this.pZ[i] + 4 * Math.sin(T * 0.5 + this.pX[i] * 0.05);
          }
          this.pMat.opacity = 0.25 + 0.1 * Math.abs(Math.sin(T * 0.7));
        }
      });

      AFRAME.registerComponent("stellar-umbral-oscillation-beacon", {
        /* 3-minute umbral oscillations in sunspot umbrae — vertically
           propagating acoustic shocks leak into the chromosphere every
           ~3 minutes; standing wave beacon pulses; hot bright column
           above dark umbra; white-orange pulses on dark background;
           white, amber, deep-red palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(3600, 2400, -400);
          this.g = g; this.t = 0;

          /* Solar photospheric disc */
          const sunGeo = new THREE.SphereGeometry(55, 24, 18);
          const sunMat = new THREE.MeshBasicMaterial({ color: 0xffcc33, transparent: true, opacity: 0.5 });
          g.add(new THREE.Mesh(sunGeo, sunMat));

          /* Umbra (dark patch) */
          const uGeo = new THREE.CircleGeometry(16, 32);
          const uMat = new THREE.MeshBasicMaterial({ color: 0x220000, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
          this.umbra = new THREE.Mesh(uGeo, uMat);
          this.umbra.rotation.x = -Math.PI / 2;
          this.umbra.position.y = 55.5;
          g.add(this.umbra);

          /* Oscillation column — vertical cylinder above umbra */
          const colGeo = new THREE.CylinderGeometry(8, 12, 60, 14, 1, true);
          const colMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide });
          this.col = new THREE.Mesh(colGeo, colMat);
          this.col.position.y = 55 + 30;
          g.add(this.col);
          this.colMat = colMat;

          /* Shock front rings */
          const NRING = 6;
          this.rings = [];
          for (let r = 0; r < NRING; r++) {
            const rGeo = new THREE.TorusGeometry(10, 1.5, 6, 40);
            const rMat = new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0 });
            const rMesh = new THREE.Mesh(rGeo, rMat);
            rMesh.position.y = 55;
            rMesh.rotation.x = Math.PI / 2;
            g.add(rMesh);
            this.rings.push({ mesh: rMesh, mat: rMat, phase: r / NRING * 3, h: 0 });
          }

          /* Chromospheric brightening particles above */
          const NC = 120;
          const cGeo = new THREE.BufferGeometry();
          const cBuf = new Float32Array(NC * 3);
          this.cBuf = cBuf; this.NC = NC;
          this.cH = new Float32Array(NC);
          this.cPhi = new Float32Array(NC);
          for (let i = 0; i < NC; i++) {
            this.cH[i]   = 56 + Math.random() * 60;
            this.cPhi[i] = Math.random() * Math.PI * 2;
          }
          cGeo.setAttribute('position', new THREE.BufferAttribute(cBuf, 3));
          const cMat = new THREE.PointsMaterial({ color: 0xffffaa, size: 1.8, transparent: true, opacity: 0 });
          g.add(new THREE.Points(cGeo, cMat));
          this.cMat = cMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.012;

          /* 3-minute (use 4s for visual) oscillation */
          const osc = Math.max(0, Math.sin(T * Math.PI / 2));
          this.colMat.opacity = osc * 0.35;

          this.rings.forEach((r) => {
            const ph = (T + r.phase) % 4;
            if (ph < 2) {
              r.h = 56 + ph / 2 * 60;
              r.mat.opacity = (1 - ph / 2) * 0.6;
            } else {
              r.mat.opacity = 0;
              r.h = 56;
            }
            r.mesh.position.y = r.h;
            const rScale = 1 + r.h / 56 * 0.3;
            r.mesh.scale.setScalar(rScale);
          });

          for (let i = 0; i < this.NC; i++) {
            const r = 5 * Math.random() + 2;
            this.cBuf[i * 3]     = r * Math.cos(this.cPhi[i]);
            this.cBuf[i * 3 + 1] = this.cH[i] + 4 * Math.sin(T * Math.PI / 2 + i * 0.3);
            this.cBuf[i * 3 + 2] = r * Math.sin(this.cPhi[i]);
          }
          this.cMat.opacity = osc * 0.45;
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-crochet-sfe-wave></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-flux-transfer-event-vortex></a-entity>
      <a-entity stellar-umbral-oscillation-beacon></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 146 injected! Lines: ' + lines);
