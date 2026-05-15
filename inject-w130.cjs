/**
 * inject-w130.cjs  — Wave 130
 * cosmic-sausage-mode-flux-tube  + stellar-spicule-jet-forest
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-sausage-mode-flux-tube"')) {
  console.log('Wave 130 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-sausage-mode-flux-tube", {
        /* Sausage MHD mode — symmetric pinch oscillation of a
           magnetic flux tube; the tube cross-section alternately
           bulges and constricts in a travelling wave; red-orange palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-1200, 300, -700);
          this.g = g; this.t = 0;

          /* Build flux tube as series of torus cross-sections */
          const SEGS = 28;
          this.rings = [];
          for (let i = 0; i < SEGS; i++) {
            const y = -210 + (i / (SEGS - 1)) * 420;
            const rGeo = new THREE.TorusGeometry(12, 2.5, 8, 32);
            const c = new THREE.Color();
            c.setHSL(0.06 - i * 0.001, 0.9, 0.55);
            const rMat = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.7, wireframe: true });
            const ring = new THREE.Mesh(rGeo, rMat);
            ring.position.y = y;
            ring.rotation.x = Math.PI * 0.5;
            g.add(ring);
            this.rings.push({ mesh: ring, baseY: y, phaseOff: (i / SEGS) * Math.PI * 2, mat: rMat });
          }

          /* Axis line */
          const axGeo = new THREE.BufferGeometry();
          axGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0,  -210, 0,  0, 210, 0]), 3));
          const axMat = new THREE.LineBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.35 });
          g.add(new THREE.Line(axGeo, axMat));

          /* Travelling bright band indicating wave phase */
          const bandGeo = new THREE.TorusGeometry(18, 3.5, 8, 32);
          const bandMat = new THREE.MeshBasicMaterial({ color: 0xffaa22, transparent: true, opacity: 0.85, wireframe: false });
          this.band = new THREE.Mesh(bandGeo, bandMat);
          this.band.rotation.x = Math.PI * 0.5;
          g.add(this.band);
          this.bandMat = bandMat;

          /* Particle halo along tube */
          const N = 180;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          this.ptPhi = new Float32Array(N);
          this.ptY   = new Float32Array(N);
          for (let i = 0; i < N; i++) {
            this.ptPhi[i] = Math.random() * Math.PI * 2;
            this.ptY[i]   = -210 + Math.random() * 420;
            const r = 12 + Math.random() * 5;
            ptBuf[i * 3]     = r * Math.cos(this.ptPhi[i]);
            ptBuf[i * 3 + 1] = this.ptY[i];
            ptBuf[i * 3 + 2] = r * Math.sin(this.ptPhi[i]);
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xff8844, size: 1.8, transparent: true, opacity: 0.5 });
          this.pts = new THREE.Points(ptGeo, ptMat);
          g.add(this.pts);
          this.ptBuf = ptBuf; this.ptMat = ptMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.05;

          /* Sausage mode: radius oscillates with phase = ky - wt */
          const k = 0.022; /* wave number in 1/unit */
          this.rings.forEach((r) => {
            const phase = k * r.baseY - T * 2.8;
            const scale = 0.55 + 0.45 * Math.sin(phase);
            r.mesh.scale.x = scale;
            r.mesh.scale.z = scale;
            r.mat.opacity = 0.45 + 0.35 * scale;
          });

          /* Band sweeps upward along tube */
          const bandY = -210 + ((T * 90) % 420);
          this.band.position.y = bandY;
          this.bandMat.opacity = 0.6 + 0.35 * Math.sin(T * 3.5);

          /* Particles drift along tube */
          const N = this.ptY.length;
          for (let i = 0; i < N; i++) {
            this.ptY[i] += dt * 55;
            if (this.ptY[i] > 210) this.ptY[i] = -210;
            this.ptPhi[i] += dt * 0.6;
            const phase = k * this.ptY[i] - T * 2.8;
            const r = (0.55 + 0.45 * Math.sin(phase)) * 12 + 4;
            this.ptBuf[i * 3]     = r * Math.cos(this.ptPhi[i]);
            this.ptBuf[i * 3 + 1] = this.ptY[i];
            this.ptBuf[i * 3 + 2] = r * Math.sin(this.ptPhi[i]);
          }
          this.pts.geometry.attributes.position.needsUpdate = true;
        }
      });

      AFRAME.registerComponent("stellar-spicule-jet-forest", {
        /* Spicule forest — thin, fast-moving chromospheric jets
           that blanket the solar limb; hundreds of vertical
           needle-like jets rising and falling with random phases;
           blue-white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(700, 500, 1200);
          this.g = g; this.t = 0;

          /* Chromosphere base layer */
          const baseGeo = new THREE.CircleGeometry(130, 48);
          const baseMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
          const base = new THREE.Mesh(baseGeo, baseMat);
          base.rotation.x = -Math.PI * 0.5;
          g.add(base);

          /* Spicule jets — 80 thin vertical line strips */
          this.spicules = [];
          const NSPI = 80;
          for (let i = 0; i < NSPI; i++) {
            const phi = Math.random() * Math.PI * 2;
            const r = Math.random() * 120;
            const x0 = r * Math.cos(phi);
            const z0 = r * Math.sin(phi);
            const h = 30 + Math.random() * 60;
            const pts = [new THREE.Vector3(x0, 0, z0), new THREE.Vector3(x0, h, z0)];
            const sGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const c = new THREE.Color();
            c.setHSL(0.6 + Math.random() * 0.1, 0.8, 0.65);
            const sMat = new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.8 });
            const line = new THREE.Line(sGeo, sMat);
            g.add(line);
            this.spicules.push({
              line, mat: sMat, geo: sGeo,
              x0, z0, maxH: h,
              phaseOff: Math.random() * Math.PI * 2,
              period: 3 + Math.random() * 4,
              buf: sGeo.attributes.position.array
            });
          }

          /* Top glow — halo of ejected material */
          const N = 300;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          for (let i = 0; i < N; i++) {
            const phi = Math.random() * Math.PI * 2;
            const r = Math.random() * 125;
            ptBuf[i * 3]     = r * Math.cos(phi);
            ptBuf[i * 3 + 1] = 40 + Math.random() * 50;
            ptBuf[i * 3 + 2] = r * Math.sin(phi);
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xaaddff, size: 1.4, transparent: true, opacity: 0.4 });
          this.halo = new THREE.Points(ptGeo, ptMat);
          g.add(this.halo);
          this.ptMat = ptMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.022;

          /* Each spicule rises and falls with its own period */
          this.spicules.forEach((s) => {
            const phase = (T / s.period + s.phaseOff / (Math.PI * 2));
            const frac = (Math.sin(phase * Math.PI * 2) + 1) * 0.5; /* 0..1 */
            const h = frac * s.maxH;
            s.buf[4] = h; /* top y */
            s.geo.attributes.position.needsUpdate = true;
            s.mat.opacity = 0.3 + 0.6 * frac;
          });

          this.halo.rotation.y = T * 0.1;
          this.ptMat.opacity = 0.25 + 0.2 * Math.sin(T * 1.7);
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-coronal-hole-plume></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-sausage-mode-flux-tube></a-entity>
      <a-entity stellar-spicule-jet-forest></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 130 injected! Lines: ' + lines);
