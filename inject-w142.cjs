/**
 * inject-w142.cjs  — Wave 142
 * cosmic-langmuir-parametric-decay  + stellar-umbral-dot-emergence
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-langmuir-parametric-decay"')) {
  console.log('Wave 142 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-langmuir-parametric-decay", {
        /* Parametric decay instability of a Langmuir pump wave into
           a daughter Langmuir wave + ion-acoustic wave; energy cascades
           to longer scales; triplet of wavefronts collapsing in sequence;
           electric-blue wavefronts, amber ion-acoustic crests;
           electric-blue, amber, white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(2200, -2800, 1200);
          this.g = g; this.t = 0;

          /* Pump Langmuir wave — expanding ring */
          const mkRing = (col, yOff) => {
            const rGeo = new THREE.TorusGeometry(1, 2, 8, 60);
            const rMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 });
            const mesh = new THREE.Mesh(rGeo, rMat);
            mesh.position.y = yOff;
            g.add(mesh);
            return { mesh, mat: rMat };
          };
          /* 3 triplet wave fronts cycling */
          this.pump    = mkRing(0x44aaff, 0);
          this.daughter = mkRing(0x0022ff, 5);
          this.ionAc   = mkRing(0xffaa22, -5);
          this.tripTimer = 0;
          this.pumpR = 0;

          /* Collapse filaments — points imploding toward center */
          const N = 200;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          this.ptR   = new Float32Array(N);
          this.ptPhi = new Float32Array(N);
          this.ptTheta = new Float32Array(N);
          this.ptSpd = new Float32Array(N);
          this.ptAlive = new Uint8Array(N);
          for (let i = 0; i < N; i++) {
            this.ptPhi[i]   = Math.random() * Math.PI * 2;
            this.ptTheta[i] = Math.acos(2 * Math.random() - 1);
            this.ptR[i]     = 80 + Math.random() * 20;
            this.ptSpd[i]   = 15 + Math.random() * 25;
            this.ptAlive[i] = 0;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.0, transparent: true, opacity: 0 });
          g.add(new THREE.Points(ptGeo, ptMat));
          this.ptBuf = ptBuf; this.ptMat = ptMat; this.N = N;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.02;

          /* Parametric decay cycle every 8s */
          this.tripTimer += dt;
          const cycleT = this.tripTimer % 8;

          if (cycleT < 2) {
            /* Phase 1: Pump wave expands */
            this.pumpR = cycleT / 2 * 90;
            this.pump.mesh.scale.setScalar(this.pumpR / 1);
            this.pump.mat.opacity  = 0.6 - cycleT * 0.2;
            this.daughter.mat.opacity = 0;
            this.ionAc.mat.opacity    = 0;
          } else if (cycleT < 4) {
            /* Phase 2: Decay — daughter + ion-acoustic appear */
            const f = (cycleT - 2) / 2;
            this.pump.mat.opacity  = 0.2 * (1 - f);
            this.daughter.mesh.scale.setScalar(this.pumpR * 0.7 / 1);
            this.daughter.mat.opacity = 0.5 * f;
            this.ionAc.mesh.scale.setScalar(this.pumpR * 0.4 / 1);
            this.ionAc.mat.opacity    = 0.45 * f;
          } else if (cycleT < 6) {
            /* Phase 3: Collapse filaments */
            const f = (cycleT - 4) / 2;
            if (f < 0.05) {
              for (let i = 0; i < this.N; i++) {
                this.ptR[i]     = 90;
                this.ptAlive[i] = 1;
              }
            }
            this.daughter.mat.opacity = 0.5 * (1 - f);
            this.ionAc.mat.opacity    = 0.4 * (1 - f);
          } else {
            /* Phase 4: quiet */
            this.pump.mat.opacity     = 0;
            this.daughter.mat.opacity = 0;
            this.ionAc.mat.opacity    = 0;
            for (let i = 0; i < this.N; i++) this.ptAlive[i] = 0;
          }

          /* Collapse particles */
          let anyAlive = false;
          for (let i = 0; i < this.N; i++) {
            if (this.ptAlive[i]) {
              anyAlive = true;
              this.ptR[i] -= dt * this.ptSpd[i];
              if (this.ptR[i] < 2) { this.ptAlive[i] = 0; continue; }
              const sinT = Math.sin(this.ptTheta[i]);
              this.ptBuf[i * 3]     = this.ptR[i] * sinT * Math.cos(this.ptPhi[i]);
              this.ptBuf[i * 3 + 1] = this.ptR[i] * Math.cos(this.ptTheta[i]);
              this.ptBuf[i * 3 + 2] = this.ptR[i] * sinT * Math.sin(this.ptPhi[i]);
            } else {
              this.ptBuf[i * 3] = 0; this.ptBuf[i * 3 + 1] = 0; this.ptBuf[i * 3 + 2] = 0;
            }
          }
          this.ptMat.opacity = anyAlive ? 0.6 : 0;
        }
      });

      AFRAME.registerComponent("stellar-umbral-dot-emergence", {
        /* Umbral dots — bright convective upwellings inside a
           sunspot umbra; they migrate, split, merge, and disappear;
           ~10 dots at any time; warm white against deep umbral red;
           bright-white, amber, crimson palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-2400, -2600, 500);
          this.g = g; this.t = 0;

          /* Sunspot umbra — dark red disc */
          const umbGeo = new THREE.CircleGeometry(50, 40);
          const umbMat = new THREE.MeshBasicMaterial({ color: 0x440000, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
          const umb = new THREE.Mesh(umbGeo, umbMat);
          umb.rotation.x = -Math.PI / 2;
          g.add(umb);

          /* Penumbra ring */
          const penGeo = new THREE.RingGeometry(50, 80, 40);
          const penMat = new THREE.MeshBasicMaterial({ color: 0x882200, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
          const pen = new THREE.Mesh(penGeo, penMat);
          pen.rotation.x = -Math.PI / 2;
          g.add(pen);
          this.penMat = penMat;

          /* Umbral dots */
          const NDOT = 12;
          this.dots = [];
          for (let d = 0; d < NDOT; d++) {
            const dGeo = new THREE.CircleGeometry(2.5 + Math.random() * 3, 12);
            const dMat = new THREE.MeshBasicMaterial({ color: 0xfffbe0, transparent: true, opacity: Math.random(), side: THREE.DoubleSide });
            const dMesh = new THREE.Mesh(dGeo, dMat);
            dMesh.rotation.x = -Math.PI / 2;
            const r = Math.random() * 38;
            const phi = Math.random() * Math.PI * 2;
            dMesh.position.set(r * Math.cos(phi), 0.5, r * Math.sin(phi));
            g.add(dMesh);
            this.dots.push({
              mesh: dMesh, mat: dMat,
              r, phi,
              vr:    (Math.random() - 0.5) * 3,
              vphi:  (Math.random() - 0.5) * 0.5,
              life:  Math.random(),
              lifeSpd: 0.08 + Math.random() * 0.15,
              growing: Math.random() > 0.5
            });
          }

          /* Background photospheric granulation */
          const NGR = 300;
          const grGeo = new THREE.BufferGeometry();
          const grBuf = new Float32Array(NGR * 3);
          for (let i = 0; i < NGR; i++) {
            const r = 55 + Math.random() * 50;
            const phi = Math.random() * Math.PI * 2;
            grBuf[i * 3]     = r * Math.cos(phi);
            grBuf[i * 3 + 1] = Math.random() * 2;
            grBuf[i * 3 + 2] = r * Math.sin(phi);
          }
          grGeo.setAttribute('position', new THREE.BufferAttribute(grBuf, 3));
          const grMat = new THREE.PointsMaterial({ color: 0xffcc88, size: 2.0, transparent: true, opacity: 0.35 });
          g.add(new THREE.Points(grGeo, grMat));
          this.grMat = grMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.008;
          this.penMat.opacity = 0.45 + 0.12 * Math.sin(T * 0.7);
          this.grMat.opacity  = 0.3 + 0.1 * Math.abs(Math.sin(T * 1.1));

          this.dots.forEach((d) => {
            /* Lifecycle */
            if (d.growing) {
              d.life += dt * d.lifeSpd;
              if (d.life >= 1) { d.growing = false; }
            } else {
              d.life -= dt * d.lifeSpd;
              if (d.life <= 0) {
                /* Respawn */
                d.life = 0; d.growing = true;
                d.r    = Math.random() * 38;
                d.phi  = Math.random() * Math.PI * 2;
                d.vr   = (Math.random() - 0.5) * 3;
                d.vphi = (Math.random() - 0.5) * 0.5;
              }
            }

            /* Drift */
            d.r   += dt * d.vr;
            d.phi += dt * d.vphi;
            if (d.r > 44 || d.r < 2) d.vr *= -1;
            d.mesh.position.x = d.r * Math.cos(d.phi);
            d.mesh.position.z = d.r * Math.sin(d.phi);
            d.mat.opacity = Math.max(0, Math.min(1, d.life));
          });
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-differential-magnetic-twist></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-langmuir-parametric-decay></a-entity>
      <a-entity stellar-umbral-dot-emergence></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 142 injected! Lines: ' + lines);
