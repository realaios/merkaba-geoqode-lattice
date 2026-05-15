/**
 * inject-w131.cjs  — Wave 131
 * cosmic-kink-mode-flux-tube  + stellar-penumbral-fibril-migration
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-kink-mode-flux-tube"')) {
  console.log('Wave 131 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-kink-mode-flux-tube", {
        /* Kink MHD mode — transverse oscillation of a magnetic
           flux tube; the tube axis swings side-to-side as a
           standing/travelling wave (solar corona coronal loops
           also do this); blue-cyan palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-900, 800, 500);
          this.g = g; this.t = 0;

          /* Tube backbone — series of spheres tracing the axis */
          const SEGS = 30;
          this.nodes = [];
          for (let i = 0; i < SEGS; i++) {
            const nGeo = new THREE.SphereGeometry(4, 8, 6);
            const c = new THREE.Color();
            c.setHSL(0.55 + i * 0.003, 0.9, 0.5);
            const nMat = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.75 });
            const node = new THREE.Mesh(nGeo, nMat);
            g.add(node);
            this.nodes.push({ mesh: node, t_frac: i / (SEGS - 1), mat: nMat });
          }

          /* Lines connecting adjacent nodes */
          this.segs = [];
          for (let i = 0; i < SEGS - 1; i++) {
            const sGeo = new THREE.BufferGeometry();
            sGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
            const sMat = new THREE.LineBasicMaterial({ color: 0x22ccff, transparent: true, opacity: 0.5 });
            g.add(new THREE.Line(sGeo, sMat));
            this.segs.push({ geo: sGeo, mat: sMat, buf: sGeo.attributes.position.array });
          }

          /* Tube envelope — translucent cylinder along rest axis */
          const envGeo = new THREE.CylinderGeometry(10, 10, 300, 12, 1, true);
          const envMat = new THREE.MeshBasicMaterial({ color: 0x0066aa, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
          const env = new THREE.Mesh(envGeo, envMat);
          g.add(env);
          this.envMat = envMat;

          /* Particles spiraling along tube */
          const N = 160;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          this.ptT    = new Float32Array(N);
          this.ptPhi  = new Float32Array(N);
          for (let i = 0; i < N; i++) {
            this.ptT[i]   = Math.random();
            this.ptPhi[i] = Math.random() * Math.PI * 2;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0x88eeff, size: 2.0, transparent: true, opacity: 0.5 });
          this.pts = new THREE.Points(ptGeo, ptMat);
          g.add(this.pts);
          this.ptBuf = ptBuf; this.ptMat = ptMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.z += dt * 0.02;

          /* Kink mode: axis displaces transversely; x = A*sin(k*y - w*t) */
          const A = 28; /* amplitude */
          const k = 0.019;
          const w = 2.4;
          const SEGS = this.nodes.length;
          for (let i = 0; i < SEGS; i++) {
            const y = -150 + this.nodes[i].t_frac * 300;
            const x = A * Math.sin(k * y - w * T);
            this.nodes[i].mesh.position.set(x, y, 0);
            this.nodes[i].mat.opacity = 0.5 + 0.35 * Math.abs(Math.sin(k * y - w * T));
          }

          /* Update connecting segments */
          for (let i = 0; i < this.segs.length; i++) {
            const a = this.nodes[i].mesh.position;
            const b = this.nodes[i + 1].mesh.position;
            const buf = this.segs[i].buf;
            buf[0] = a.x; buf[1] = a.y; buf[2] = a.z;
            buf[3] = b.x; buf[4] = b.y; buf[5] = b.z;
            this.segs[i].geo.attributes.position.needsUpdate = true;
          }

          /* Particles drift along tube with transverse offset */
          const N = this.ptT.length;
          for (let i = 0; i < N; i++) {
            this.ptT[i] = (this.ptT[i] + dt * 0.12) % 1;
            this.ptPhi[i] += dt * 1.4;
            const y = -150 + this.ptT[i] * 300;
            const xKink = A * Math.sin(k * y - w * T);
            const r = 9 + 4 * Math.random();
            this.ptBuf[i * 3]     = xKink + r * Math.cos(this.ptPhi[i]);
            this.ptBuf[i * 3 + 1] = y;
            this.ptBuf[i * 3 + 2] = r * Math.sin(this.ptPhi[i]);
          }
          this.pts.geometry.attributes.position.needsUpdate = true;
          this.ptMat.opacity = 0.35 + 0.2 * Math.sin(T * 1.8);
          this.envMat.opacity = 0.05 + 0.04 * Math.sin(T * 1.2);
        }
      });

      AFRAME.registerComponent("stellar-penumbral-fibril-migration", {
        /* Penumbral fibril migration — elongated fibrils in a
           sunspot penumbra drift radially outward (Evershed flow);
           long narrow strands stream from inner to outer penumbra;
           warm brown-orange-tan palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(1400, -200, 600);
          this.g = g; this.t = 0;

          /* Umbra (dark core) */
          const uGeo = new THREE.CircleGeometry(28, 40);
          const uMat = new THREE.MeshBasicMaterial({ color: 0x1a0800, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(uGeo, uMat));

          /* Penumbra background annulus */
          const pGeo = new THREE.RingGeometry(28, 100, 48);
          const pMat = new THREE.MeshBasicMaterial({ color: 0x7a3800, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(pGeo, pMat));

          /* Fibrils — elongated radial lines migrating outward */
          const NFIB = 48;
          this.fibrils = [];
          for (let i = 0; i < NFIB; i++) {
            const phi = (i / NFIB) * Math.PI * 2;
            const r0 = 28 + Math.random() * 8;
            const fGeo = new THREE.BufferGeometry();
            fGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
            const hue = 0.06 + Math.random() * 0.04;
            const c = new THREE.Color();
            c.setHSL(hue, 0.8, 0.52);
            const fMat = new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.7 });
            g.add(new THREE.Line(fGeo, fMat));
            this.fibrils.push({
              geo: fGeo, mat: fMat,
              buf: fGeo.attributes.position.array,
              phi, r: r0, len: 18 + Math.random() * 22,
              drift: 4 + Math.random() * 6,
              phaseOff: Math.random() * Math.PI * 2
            });
          }

          /* Outer bright boundary */
          const oGeo = new THREE.RingGeometry(98, 104, 48);
          const oMat = new THREE.MeshBasicMaterial({ color: 0xffcc88, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(oGeo, oMat));
          this.oMat = oMat;

          /* Particle dust drifting outward */
          const N = 180;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          this.ptR   = new Float32Array(N);
          this.ptPhi = new Float32Array(N);
          for (let i = 0; i < N; i++) {
            this.ptR[i]   = 28 + Math.random() * 72;
            this.ptPhi[i] = Math.random() * Math.PI * 2;
            ptBuf[i * 3]     = this.ptR[i] * Math.cos(this.ptPhi[i]);
            ptBuf[i * 3 + 1] = this.ptR[i] * Math.sin(this.ptPhi[i]);
            ptBuf[i * 3 + 2] = 0;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xffaa55, size: 1.5, transparent: true, opacity: 0.45 });
          this.dust = new THREE.Points(ptGeo, ptMat);
          g.add(this.dust);
          this.ptBuf = ptBuf; this.ptMat = ptMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.z += dt * 0.008;

          /* Fibrils drift outward, wrap when past outer edge */
          this.fibrils.forEach((f) => {
            f.r += dt * f.drift;
            if (f.r > 96) { f.r = 28 + Math.random() * 8; f.phi = Math.random() * Math.PI * 2; }
            const wave = 0.08 * Math.sin(T * 2.5 + f.phaseOff);
            const phiA = f.phi + wave;
            const phiB = f.phi + wave + 0.06;
            const rEnd = f.r + f.len;
            f.buf[0] = f.r   * Math.cos(phiA);
            f.buf[1] = f.r   * Math.sin(phiA);
            f.buf[3] = rEnd  * Math.cos(phiB);
            f.buf[4] = rEnd  * Math.sin(phiB);
            f.geo.attributes.position.needsUpdate = true;
            f.mat.opacity = 0.4 + 0.4 * (1 - (f.r - 28) / 68);
          });

          /* Dust particles drift outward (Evershed flow) */
          const N = this.ptR.length;
          for (let i = 0; i < N; i++) {
            this.ptR[i] += dt * 8;
            if (this.ptR[i] > 102) { this.ptR[i] = 28; this.ptPhi[i] = Math.random() * Math.PI * 2; }
            this.ptBuf[i * 3]     = this.ptR[i] * Math.cos(this.ptPhi[i]);
            this.ptBuf[i * 3 + 1] = this.ptR[i] * Math.sin(this.ptPhi[i]);
          }
          this.dust.geometry.attributes.position.needsUpdate = true;

          this.oMat.opacity = 0.18 + 0.1 * Math.sin(T * 2.0);
          this.ptMat.opacity = 0.35 + 0.15 * Math.sin(T * 1.6);
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-spicule-jet-forest></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-kink-mode-flux-tube></a-entity>
      <a-entity stellar-penumbral-fibril-migration></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 131 injected! Lines: ' + lines);
