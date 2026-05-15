/**
 * inject-w139.cjs  — Wave 139
 * cosmic-cusp-ion-fountain  + stellar-tachocline-magnetic-pumping
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-cusp-ion-fountain"')) {
  console.log('Wave 139 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-cusp-ion-fountain", {
        /* Polar cusp of a magnetosphere — funnel-shaped region where
           solar wind ions precipitate directly into the ionosphere,
           creating a poleward ion fountain; dual-cusp (N+S);
           gold-orange-white ion streams spiralling inward;
           gold, orange, white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(1800, -1800, -2400);
          this.g = g; this.t = 0;

          /* Planet sphere */
          const plGeo = new THREE.SphereGeometry(50, 24, 18);
          const plMat = new THREE.MeshBasicMaterial({ color: 0x1133aa, transparent: true, opacity: 0.55 });
          g.add(new THREE.Mesh(plGeo, plMat));

          /* Cusp funnel — hourglass from north pole */
          const buildCusp = (sign) => {
            const NR = 8;
            const funGeo = new THREE.CylinderGeometry(30, 8, 80, 16, 1, true);
            funGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(0, sign * 90, 0));
            const funMat = new THREE.MeshBasicMaterial({ color: 0xffaa22, transparent: true, opacity: 0.12, side: THREE.DoubleSide, wireframe: false });
            g.add(new THREE.Mesh(funGeo, funMat));
            return funMat;
          };
          this.cuspN = buildCusp(1);
          this.cuspS = buildCusp(-1);

          /* Particle streams spiralling into each cusp */
          const NTOT = 300;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(NTOT * 3);
          this.ptPhi    = new Float32Array(NTOT);
          this.ptU      = new Float32Array(NTOT);
          this.ptSign   = new Float32Array(NTOT);
          this.ptOmega  = new Float32Array(NTOT);
          this.ptSpd    = new Float32Array(NTOT);
          for (let i = 0; i < NTOT; i++) {
            this.ptPhi[i]   = Math.random() * Math.PI * 2;
            this.ptU[i]     = Math.random();
            this.ptSign[i]  = i < NTOT / 2 ? 1 : -1;
            this.ptOmega[i] = 1.5 + Math.random() * 2.0;
            this.ptSpd[i]   = 0.1 + Math.random() * 0.15;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xffcc44, size: 2.0, transparent: true, opacity: 0.7 });
          g.add(new THREE.Points(ptGeo, ptMat));
          this.ptBuf = ptBuf; this.ptMat = ptMat; this.NTOT = NTOT;

          /* Magnetopause outline */
          const mpGeo = new THREE.SphereGeometry(110, 20, 14);
          const mpMat = new THREE.MeshBasicMaterial({ color: 0x0066ff, transparent: true, opacity: 0.07, wireframe: true });
          g.add(new THREE.Mesh(mpGeo, mpMat));
          this.mpMat = mpMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.018;
          this.mpMat.opacity = 0.05 + 0.04 * Math.sin(T * 1.2);
          this.cuspN.opacity = 0.10 + 0.06 * Math.sin(T * 2.0);
          this.cuspS.opacity = 0.10 + 0.06 * Math.sin(T * 2.0 + 1.0);

          for (let i = 0; i < this.NTOT; i++) {
            this.ptU[i] = (this.ptU[i] + dt * this.ptSpd[i]) % 1;
            const u = this.ptU[i];
            /* Spiral inward from outer funnel to planet pole */
            const height  = this.ptSign[i] * (130 - u * 80);
            const radius  = 30 - u * 22;
            this.ptPhi[i] += dt * this.ptOmega[i];
            const px = radius * Math.cos(this.ptPhi[i]);
            const py = height;
            const pz = radius * Math.sin(this.ptPhi[i]);
            this.ptBuf[i * 3]     = px;
            this.ptBuf[i * 3 + 1] = py;
            this.ptBuf[i * 3 + 2] = pz;
          }
          this.ptMat.opacity = 0.55 + 0.2 * Math.abs(Math.sin(T * 1.5));
        }
      });

      AFRAME.registerComponent("stellar-tachocline-magnetic-pumping", {
        /* Solar/stellar tachocline — thin shear layer between the
           radiative zone and the convection zone where differential
           rotation shears and amplifies magnetic fields through
           flux pumping; toroidal field belts being wound up
           by the Omega-effect; amber-copper-blue belt layers;
           amber, copper, dark-blue palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-3200, 600, -200);
          this.g = g; this.t = 0;

          /* Stellar interior cross-section — nested shells */
          const NSHELL = 5;
          this.shells = [];
          for (let s = 0; s < NSHELL; s++) {
            const r = 18 + s * 14;
            const sGeo = new THREE.SphereGeometry(r, 18, 12);
            const hue = s < 2 ? 0.62 : 0.08 - s * 0.01;
            const col = new THREE.Color();
            col.setHSL(Math.max(0, hue), 0.75, 0.42);
            const sMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.1 + s * 0.02 });
            g.add(new THREE.Mesh(sGeo, sMat));
            this.shells.push({ mat: sMat, r, phase: s * 0.7 });
          }

          /* Tachocline belt — flattened torus at r~0.71R */
          const tGeo = new THREE.TorusGeometry(50, 8, 10, 40);
          tGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.3, 1));
          const tMat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.45 });
          this.tachocline = new THREE.Mesh(tGeo, tMat);
          g.add(this.tachocline);
          this.tMat = tMat;

          /* Toroidal field belts — wound-up field lines */
          const NBELT = 6;
          this.belts = [];
          for (let b = 0; b < NBELT; b++) {
            const bGeo = new THREE.TorusGeometry(44 + b * 2, 2.5, 6, 36);
            bGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.28, 1));
            bGeo.applyMatrix4(new THREE.Matrix4().makeRotationX(b * 0.15));
            const hue = 0.06 + b * 0.015;
            const col = new THREE.Color();
            col.setHSL(hue, 0.9, 0.6);
            const bMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.4 });
            const bMesh = new THREE.Mesh(bGeo, bMat);
            g.add(bMesh);
            this.belts.push({ mesh: bMesh, mat: bMat, phase: b * Math.PI / NBELT });
          }

          /* Flux pump jets — radial arrows of field being pumped down */
          const N = 90;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          this.ptPhi   = new Float32Array(N);
          this.ptR     = new Float32Array(N);
          this.ptTheta = new Float32Array(N);
          this.ptSpd   = new Float32Array(N);
          for (let i = 0; i < N; i++) {
            this.ptPhi[i]   = Math.random() * Math.PI * 2;
            this.ptR[i]     = 42 + Math.random() * 16;
            this.ptTheta[i] = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
            this.ptSpd[i]   = 0.3 + Math.random() * 0.5;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xffcc88, size: 2.5, transparent: true, opacity: 0.65 });
          g.add(new THREE.Points(ptGeo, ptMat));
          this.ptBuf = ptBuf; this.ptMat = ptMat; this.N = N;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          /* Tachocline differentially rotates */
          this.tachocline.rotation.y += dt * 0.18;
          this.belts.forEach((b, idx) => {
            b.mesh.rotation.y += dt * (0.12 + idx * 0.015);
            b.mat.opacity = 0.3 + 0.15 * Math.sin(T * 1.5 + b.phase);
          });

          this.g.rotation.y += dt * 0.01;
          this.tMat.opacity = 0.38 + 0.12 * Math.abs(Math.sin(T * 1.2));

          /* Shells oscillate */
          this.shells.forEach((s, idx) => {
            s.mat.opacity = 0.08 + 0.04 * Math.sin(T * 0.8 + s.phase);
          });

          /* Pump jet particles circulate around tachocline radius */
          for (let i = 0; i < this.N; i++) {
            this.ptPhi[i] += dt * this.ptSpd[i];
            const px = this.ptR[i] * Math.sin(this.ptTheta[i]) * Math.cos(this.ptPhi[i]);
            const py = this.ptR[i] * Math.cos(this.ptTheta[i]) * 0.28;
            const pz = this.ptR[i] * Math.sin(this.ptTheta[i]) * Math.sin(this.ptPhi[i]);
            this.ptBuf[i * 3]     = px;
            this.ptBuf[i * 3 + 1] = py;
            this.ptBuf[i * 3 + 2] = pz;
          }
          this.ptMat.opacity = 0.5 + 0.2 * Math.sin(T * 1.8);
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-helium-flash-burst></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-cusp-ion-fountain></a-entity>
      <a-entity stellar-tachocline-magnetic-pumping></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 139 injected! Lines: ' + lines);
