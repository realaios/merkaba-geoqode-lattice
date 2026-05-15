/**
 * inject-w151.cjs  — Wave 151
 * cosmic-coronal-quasi-separatrix-layer  + stellar-solar-tornado-prominence
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-coronal-quasi-separatrix-layer"')) {
  console.log('Wave 151 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-coronal-quasi-separatrix-layer", {
        /* Quasi-Separatrix Layers (QSLs) in the solar corona — thin
           3D surfaces where magnetic field line connectivity changes
           sharply; strong currents accumulate here; fan-spine topology
           visible as current sheet spines; flares often occur at QSL
           intersections; blue, white, purple, yellow palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-3200, 4100, 1200);
          this.g = g; this.t = 0;

          /* Coronal sphere base */
          const cGeo = new THREE.SphereGeometry(55, 18, 14);
          const cMat = new THREE.MeshBasicMaterial({ color: 0x331100, transparent: true, opacity: 0.5 });
          g.add(new THREE.Mesh(cGeo, cMat));

          /* QSL sheets — build as thin layered surfaces */
          const NQSL = 5;
          this.qslMats = [];
          for (let q = 0; q < NQSL; q++) {
            const angle = (q / NQSL) * Math.PI;
            const NUQ = 30; const NVQ = 20;
            const pts = [];
            for (let iu = 0; iu < NUQ; iu++) {
              for (let iv = 0; iv < NVQ; iv++) {
                const u = (iu / (NUQ - 1)) * 2 - 1;
                const v = (iv / (NVQ - 1)) * 2 - 1;
                const r = 55 + v * 35;
                const th = angle + u * 0.9;
                pts.push(new THREE.Vector3(
                  r * Math.sin(th),
                  r * Math.cos(th) * v * 0.7,
                  r * Math.cos(th) + (Math.random() - 0.5) * 4
                ));
              }
            }
            const qGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const hue = 0.6 + q * 0.08;
            const col = new THREE.Color(); col.setHSL(hue, 0.9, 0.65);
            const qMat = new THREE.PointsMaterial({ color: col, size: 1.2, transparent: true, opacity: 0.35 });
            g.add(new THREE.Points(qGeo, qMat));
            this.qslMats.push(qMat);
          }

          /* Fan-spine field lines */
          const NFAN = 16;
          this.fanLines = [];
          for (let f = 0; f < NFAN; f++) {
            const phi = (f / NFAN) * Math.PI * 2;
            const pts = [];
            for (let k = 0; k < 25; k++) {
              const r  = 55 + k * 3.5;
              const th = 0.6 + k * 0.04;
              pts.push(new THREE.Vector3(r * Math.sin(th) * Math.cos(phi), r * Math.cos(th), r * Math.sin(th) * Math.sin(phi)));
            }
            const fGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const fMat = new THREE.LineBasicMaterial({ color: 0x88aaff, transparent: true, opacity: 0.3 });
            g.add(new THREE.Line(fGeo, fMat));
            this.fanLines.push({ mat: fMat, phi });
          }

          /* Spine line (null-point axis) */
          const spinePts = [];
          for (let k = 0; k < 30; k++) {
            spinePts.push(new THREE.Vector3(0, 55 + k * 2, 0));
          }
          const spineGeo = new THREE.BufferGeometry().setFromPoints(spinePts);
          const spineMat = new THREE.LineBasicMaterial({ color: 0xffee44, transparent: true, opacity: 0.55 });
          g.add(new THREE.Line(spineGeo, spineMat));
          this.spineMat = spineMat;

          /* Current sheet flare sparks */
          const NSP = 140;
          const spGeo = new THREE.BufferGeometry();
          const spBuf = new Float32Array(NSP * 3);
          this.spBuf = spBuf; this.NSP = NSP;
          this.spTheta = new Float32Array(NSP);
          this.spPhi2  = new Float32Array(NSP);
          this.spR2    = new Float32Array(NSP);
          this.spVR2   = new Float32Array(NSP);
          for (let i = 0; i < NSP; i++) {
            this.spTheta[i] = 0.5 + Math.random() * 0.4;
            this.spPhi2[i]  = Math.random() * Math.PI * 2;
            this.spR2[i]    = 55 + Math.random() * 35;
            this.spVR2[i]   = 5 + Math.random() * 20;
          }
          spGeo.setAttribute('position', new THREE.BufferAttribute(spBuf, 3));
          const spMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.4, transparent: true, opacity: 0.4 });
          g.add(new THREE.Points(spGeo, spMat));
          this.spMat = spMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.011;

          this.qslMats.forEach((m, i) => {
            m.opacity = 0.2 + 0.18 * Math.abs(Math.sin(T * 0.35 + i * 0.7));
          });
          this.fanLines.forEach((fl, i) => {
            fl.mat.opacity = 0.2 + 0.12 * Math.abs(Math.sin(T * 0.4 + i * 0.4));
          });
          this.spineMat.opacity = 0.4 + 0.3 * Math.abs(Math.sin(T * 0.7));

          for (let i = 0; i < this.NSP; i++) {
            this.spR2[i] += dt * this.spVR2[i];
            if (this.spR2[i] > 92) this.spR2[i] = 55;
            const th = this.spTheta[i];
            const ph = this.spPhi2[i] + T * 0.05;
            this.spBuf[i * 3]     = this.spR2[i] * Math.sin(th) * Math.cos(ph);
            this.spBuf[i * 3 + 1] = this.spR2[i] * Math.cos(th);
            this.spBuf[i * 3 + 2] = this.spR2[i] * Math.sin(th) * Math.sin(ph);
          }
          this.spMat.opacity = 0.3 + 0.2 * Math.abs(Math.sin(T * 1.2));
        }
      });

      AFRAME.registerComponent("stellar-solar-tornado-prominence", {
        /* Solar tornadoes — large rotating magnetic structures above
           the solar limb filled with cool prominence plasma wound into
           a helical column; rooted in the photosphere at a bipolar
           region; the column spins and oscillates; material drains down
           slowly; red-pink column, white bright threads, violet base;
           red, pink, white, violet palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(1100, -2800, 5200);
          this.g = g; this.t = 0;

          /* Sun surface disc */
          const sunGeo = new THREE.SphereGeometry(46, 16, 12);
          const sunMat = new THREE.MeshBasicMaterial({ color: 0xffbb33, transparent: true, opacity: 0.5 });
          g.add(new THREE.Mesh(sunGeo, sunMat));

          /* Tornado column — helical tube path */
          const NRING = 40;
          this.rings = [];
          for (let r = 0; r < NRING; r++) {
            const frac = r / (NRING - 1);
            const rGeo = new THREE.TorusGeometry(4 + frac * 5, 0.5, 6, 16);
            const col  = new THREE.Color();
            const hue  = 0.92 + frac * 0.05;
            col.setHSL(hue, 0.95, 0.55 + frac * 0.2);
            const rMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.5 });
            const rMesh = new THREE.Mesh(rGeo, rMat);
            rMesh.position.y = 46 + frac * 70;
            g.add(rMesh);
            this.rings.push({ mesh: rMesh, mat: rMat, frac, baseY: 46 + frac * 70 });
          }

          /* Helical thread lines */
          const NTHR = 12;
          this.threads = [];
          for (let h = 0; h < NTHR; h++) {
            const startPhi = (h / NTHR) * Math.PI * 2;
            const tPts = [];
            for (let k = 0; k < 50; k++) {
              tPts.push(new THREE.Vector3(0, 0, 0));
            }
            const tGeo = new THREE.BufferGeometry().setFromPoints(tPts);
            const tMat = new THREE.LineBasicMaterial({ color: 0xff99cc, transparent: true, opacity: 0.45 });
            g.add(new THREE.Line(tGeo, tMat));
            this.threads.push({ geo: tGeo, mat: tMat, pts: tPts, startPhi });
          }

          /* Draining material — downward particles */
          const NDR = 120;
          const drGeo = new THREE.BufferGeometry();
          const drBuf = new Float32Array(NDR * 3);
          this.drBuf = drBuf; this.NDR = NDR;
          this.drT   = new Float32Array(NDR);
          this.drPhi = new Float32Array(NDR);
          for (let i = 0; i < NDR; i++) {
            this.drT[i]   = Math.random();
            this.drPhi[i] = Math.random() * Math.PI * 2;
          }
          drGeo.setAttribute('position', new THREE.BufferAttribute(drBuf, 3));
          const drMat = new THREE.PointsMaterial({ color: 0xff6699, size: 1.5, transparent: true, opacity: 0.5 });
          g.add(new THREE.Points(drGeo, drMat));
          this.drMat = drMat;

          /* Base glow — violet bipolar root */
          const bGeo = new THREE.SphereGeometry(8, 10, 8);
          const bMat = new THREE.MeshBasicMaterial({ color: 0xcc44ff, transparent: true, opacity: 0.45 });
          const bMesh = new THREE.Mesh(bGeo, bMat);
          bMesh.position.y = 46;
          g.add(bMesh);
          this.baseMat = bMat;

          this.spinAngle = 0;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.spinAngle += dt * 0.3;
          const SA = this.spinAngle;

          this.g.rotation.y += dt * 0.015;

          /* Tornado rings rotate and oscillate */
          this.rings.forEach((r, i) => {
            const wobble = 3 * Math.sin(T * 0.5 + i * 0.3);
            r.mesh.rotation.y = SA + i * 0.25;
            r.mesh.position.y = r.baseY + wobble;
            r.mat.opacity = 0.35 + 0.18 * Math.abs(Math.sin(T * 0.6 + i * 0.4));
          });

          /* Helical threads */
          this.threads.forEach((thr, hi) => {
            const N = 50;
            for (let k = 0; k < N; k++) {
              const frac = k / (N - 1);
              const phi  = thr.startPhi + SA + frac * Math.PI * 4;
              const rad  = 4 + frac * 5;
              thr.pts[k].set(
                rad * Math.cos(phi),
                46 + frac * 70 + 3 * Math.sin(T * 0.5 + hi),
                rad * Math.sin(phi)
              );
            }
            thr.geo.setFromPoints(thr.pts);
            thr.mat.opacity = 0.3 + 0.18 * Math.abs(Math.sin(T * 0.7 + hi * 0.5));
          });

          /* Draining particles fall downward */
          for (let i = 0; i < this.NDR; i++) {
            this.drT[i] += dt * 0.15;
            if (this.drT[i] > 1) { this.drT[i] = 0; this.drPhi[i] = Math.random() * Math.PI * 2; }
            const frac = this.drT[i];
            const phi = this.drPhi[i] + SA;
            const rad = 4 + frac * 5;
            this.drBuf[i * 3]     = rad * Math.cos(phi) + (Math.random() - 0.5) * 1.5;
            this.drBuf[i * 3 + 1] = 46 + (1 - frac) * 70 + (Math.random() - 0.5) * 3;
            this.drBuf[i * 3 + 2] = rad * Math.sin(phi) + (Math.random() - 0.5) * 1.5;
          }
          this.drMat.opacity = 0.35 + 0.2 * Math.abs(Math.sin(T * 0.9));
          this.baseMat.opacity = 0.3 + 0.2 * Math.abs(Math.sin(T * 1.1));
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-magnetic-bright-point-field></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-coronal-quasi-separatrix-layer></a-entity>
      <a-entity stellar-solar-tornado-prominence></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 151 injected! Lines: ' + lines);
