/**
 * inject-w133.cjs  — Wave 133
 * cosmic-heliospheric-termination-ripple  + stellar-convective-downflow-lane
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-heliospheric-termination-ripple"')) {
  console.log('Wave 133 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-heliospheric-termination-ripple", {
        /* Ripples propagating along the heliospheric termination shock
           (where the solar wind goes subsonic ~85-100 AU); shock surface
           breathes in and out with pressure pulses; gold-orange-silver palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-2000, -600, 1200);
          this.g = g; this.t = 0;

          /* Base heliosphere sphere */
          const hGeo = new THREE.SphereGeometry(200, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.55);
          const hMat = new THREE.MeshBasicMaterial({ color: 0x221100, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(hGeo, hMat));
          this.hMat = hMat;

          /* Concentric ripple rings — shock wave expanding outward */
          const NRINGS = 10;
          this.rings = [];
          for (let r = 0; r < NRINGS; r++) {
            const angle = 0.3 + r * 0.22;
            const rGeo = new THREE.TorusGeometry(190 + r * 5, 2.5, 6, 48);
            rGeo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
            const hue = 0.08 + r * 0.015;
            const col = new THREE.Color();
            col.setHSL(hue, 0.85, 0.52);
            const rMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.0 });
            const ring = new THREE.Mesh(rGeo, rMat);
            ring.rotation.x = angle;
            g.add(ring);
            this.rings.push({ mesh: ring, mat: rMat, phase: r * 0.62, baseR: 190 + r * 5, geo: rGeo });
          }

          /* Upstream solar wind particles streaming inward */
          const N = 200;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          this.ptR    = new Float32Array(N);
          this.ptTheta = new Float32Array(N);
          this.ptPhi   = new Float32Array(N);
          for (let i = 0; i < N; i++) {
            this.ptR[i]    = 120 + Math.random() * 100;
            this.ptTheta[i]= Math.random() * Math.PI * 0.55;
            this.ptPhi[i]  = Math.random() * Math.PI * 2;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xffcc77, size: 2.0, transparent: true, opacity: 0.45 });
          this.pts = new THREE.Points(ptGeo, ptMat);
          g.add(this.pts);
          this.ptBuf = ptBuf; this.ptMat = ptMat; this.N = N;

          /* Downstream heliotail particles — slower, denser */
          const N2 = 100;
          const pt2Geo = new THREE.BufferGeometry();
          const pt2Buf = new Float32Array(N2 * 3);
          this.pt2R = new Float32Array(N2);
          this.pt2Theta = new Float32Array(N2);
          this.pt2Phi   = new Float32Array(N2);
          for (let i = 0; i < N2; i++) {
            this.pt2R[i]    = 200 + Math.random() * 60;
            this.pt2Theta[i]= 0.55 + Math.random() * 0.6;
            this.pt2Phi[i]  = Math.random() * Math.PI * 2;
          }
          pt2Geo.setAttribute('position', new THREE.BufferAttribute(pt2Buf, 3));
          const pt2Mat = new THREE.PointsMaterial({ color: 0xccddee, size: 1.8, transparent: true, opacity: 0.3 });
          this.pts2 = new THREE.Points(pt2Geo, pt2Mat);
          g.add(this.pts2);
          this.pt2Buf = pt2Buf; this.pt2Mat = pt2Mat; this.N2 = N2;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.012;

          /* Ripple rings pulse in opacity and scale with phase offset */
          this.rings.forEach((r) => {
            const p = 0.5 + 0.5 * Math.sin(T * 2.8 - r.phase);
            r.mat.opacity = p * 0.65;
            const sc = 1 + 0.07 * Math.sin(T * 2.8 - r.phase + 0.5);
            r.mesh.scale.setScalar(sc);
          });

          /* Solar wind particles stream outward to shock, then wrap */
          for (let i = 0; i < this.N; i++) {
            this.ptR[i] += dt * 18;
            if (this.ptR[i] > 210) { this.ptR[i] = 110; this.ptTheta[i] = Math.random() * Math.PI * 0.55; }
            const r = this.ptR[i];
            const th = this.ptTheta[i];
            const ph = this.ptPhi[i];
            this.ptBuf[i * 3]     = r * Math.sin(th) * Math.cos(ph);
            this.ptBuf[i * 3 + 1] = r * Math.cos(th);
            this.ptBuf[i * 3 + 2] = r * Math.sin(th) * Math.sin(ph);
          }
          this.pts.geometry.attributes.position.needsUpdate = true;

          /* Heliotail drifts away */
          for (let i = 0; i < this.N2; i++) {
            this.pt2Theta[i] += dt * 0.04;
            if (this.pt2Theta[i] > Math.PI * 1.1) this.pt2Theta[i] = 0.55;
            const r = this.pt2R[i];
            const th = this.pt2Theta[i];
            const ph = this.pt2Phi[i];
            this.pt2Buf[i * 3]     = r * Math.sin(th) * Math.cos(ph);
            this.pt2Buf[i * 3 + 1] = r * Math.cos(th);
            this.pt2Buf[i * 3 + 2] = r * Math.sin(th) * Math.sin(ph);
          }
          this.pts2.geometry.attributes.position.needsUpdate = true;

          this.hMat.opacity  = 0.08 + 0.06 * Math.sin(T * 1.6);
          this.ptMat.opacity = 0.35 + 0.15 * Math.sin(T * 2.8);
        }
      });

      AFRAME.registerComponent("stellar-convective-downflow-lane", {
        /* Convective downflow lanes — narrow dark channels between
           solar granules where cooled plasma sinks; dense grid of
           dark lanes with bright granule interiors between them;
           yellow-white-dark palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(2200, 300, -400);
          this.g = g; this.t = 0;

          /* Background photosphere */
          const bgGeo = new THREE.PlaneGeometry(300, 300);
          const bgMat = new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(bgGeo, bgMat));
          this.bgMat = bgMat;

          /* Granule cells — warm interiors */
          const ROWS = 8; const COLS = 8;
          const CW = 300 / COLS; const CH = 300 / ROWS;
          this.granules = [];
          for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
              const cx = -150 + col * CW + CW * 0.5;
              const cy = -150 + row * CH + CH * 0.5;
              const gw = CW * (0.55 + Math.random() * 0.15);
              const gh = CH * (0.55 + Math.random() * 0.15);
              const gGeo = new THREE.PlaneGeometry(gw, gh);
              const hue = 0.10 + Math.random() * 0.04;
              const col2 = new THREE.Color();
              col2.setHSL(hue, 0.9, 0.68);
              const gMat = new THREE.MeshBasicMaterial({ color: col2, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
              const gran = new THREE.Mesh(gGeo, gMat);
              gran.position.set(cx, cy, 0.5);
              g.add(gran);
              this.granules.push({ mesh: gran, mat: gMat, phase: Math.random() * Math.PI * 2, cx, cy, baseOpacity: 0.6 + Math.random() * 0.25 });
            }
          }

          /* Downflow lane lines — dark vertical + horizontal grid */
          const laneColor = 0x220800;
          this.lanes = [];
          for (let col = 0; col <= COLS; col++) {
            const x = -150 + col * CW;
            const lGeo = new THREE.BufferGeometry();
            const lBuf = new Float32Array([x, -150, 1, x, 150, 1]);
            lGeo.setAttribute('position', new THREE.BufferAttribute(lBuf, 3));
            const lMat = new THREE.LineBasicMaterial({ color: laneColor, transparent: true, opacity: 0.5 });
            g.add(new THREE.Line(lGeo, lMat));
            this.lanes.push({ mat: lMat });
          }
          for (let row = 0; row <= ROWS; row++) {
            const y = -150 + row * CH;
            const lGeo = new THREE.BufferGeometry();
            const lBuf = new Float32Array([-150, y, 1, 150, y, 1]);
            lGeo.setAttribute('position', new THREE.BufferAttribute(lBuf, 3));
            const lMat = new THREE.LineBasicMaterial({ color: laneColor, transparent: true, opacity: 0.5 });
            g.add(new THREE.Line(lGeo, lMat));
            this.lanes.push({ mat: lMat });
          }

          /* Sinking particles in downflow lanes */
          const N = 160;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          const ROWS2 = ROWS; const COLS2 = COLS;
          this.ptX = new Float32Array(N);
          this.ptY = new Float32Array(N);
          this.ptSpeed = new Float32Array(N);
          for (let i = 0; i < N; i++) {
            const laneRow = Math.floor(Math.random() * (ROWS2 + 1));
            const laneCol = Math.floor(Math.random() * (COLS2 + 1));
            const isVert = Math.random() < 0.5;
            if (isVert) {
              this.ptX[i] = -150 + laneCol * CW + (Math.random() - 0.5) * 4;
              this.ptY[i] = -150 + Math.random() * 300;
            } else {
              this.ptX[i] = -150 + Math.random() * 300;
              this.ptY[i] = -150 + laneRow * CH + (Math.random() - 0.5) * 4;
            }
            this.ptSpeed[i] = 15 + Math.random() * 20;
            ptBuf[i * 3]     = this.ptX[i];
            ptBuf[i * 3 + 1] = this.ptY[i];
            ptBuf[i * 3 + 2] = 2;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0x442200, size: 2.5, transparent: true, opacity: 0.6 });
          this.pts = new THREE.Points(ptGeo, ptMat);
          g.add(this.pts);
          this.ptBuf = ptBuf; this.ptMat = ptMat; this.N = N;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.x += dt * 0.01;

          /* Granules brighten and dim with convection cycle */
          this.granules.forEach((gr) => {
            gr.mat.opacity = gr.baseOpacity * (0.8 + 0.2 * Math.sin(T * 1.8 + gr.phase));
          });

          /* Lane opacity flickers slightly */
          this.lanes.forEach((l, idx) => {
            l.mat.opacity = 0.35 + 0.2 * Math.sin(T * 2.4 + idx * 0.3);
          });

          /* Particles sink downward (downflow) */
          for (let i = 0; i < this.N; i++) {
            this.ptY[i] -= dt * this.ptSpeed[i];
            if (this.ptY[i] < -150) this.ptY[i] = 150;
            this.ptBuf[i * 3 + 1] = this.ptY[i];
          }
          this.pts.geometry.attributes.position.needsUpdate = true;

          this.bgMat.opacity = 0.18 + 0.07 * Math.sin(T * 1.2);
          this.ptMat.opacity = 0.5 + 0.15 * Math.sin(T * 2.0);
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-rsp-oscillation-plume></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-heliospheric-termination-ripple></a-entity>
      <a-entity stellar-convective-downflow-lane></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 133 injected! Lines: ' + lines);
