/**
 * inject-w144.cjs  — Wave 144
 * cosmic-relativistic-jet-knot-shock  + stellar-magnetic-carpet-emergence
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-relativistic-jet-knot-shock"')) {
  console.log('Wave 144 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-relativistic-jet-knot-shock", {
        /* Relativistic jet internal shock (knot) — faster parcels in the
           jet overtake slower ones forming a stationary knot; particles
           accelerated via Fermi I mechanism; bright compact emission
           region embedded in a jet; moving knot blobs upstream; blue-
           white jet with amber-gold knot blob; cyan, amber, white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(4200, -400, -2400);
          this.g = g; this.t = 0;

          /* Jet channel — two opposing cylinders */
          const mkJet = (yOff, yLen) => {
            const jGeo = new THREE.CylinderGeometry(7, 7, yLen, 12, 1, true);
            const jMat = new THREE.MeshBasicMaterial({ color: 0x22ddff, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
            const j = new THREE.Mesh(jGeo, jMat);
            j.position.y = yOff + yLen / 2;
            g.add(j);
            return jMat;
          };
          this.jetUpMat   = mkJet(0, 250);
          this.jetDownMat = mkJet(-250, 250);

          /* Knot blob at y=80 */
          const kGeo = new THREE.SphereGeometry(15, 14, 10);
          const kMat = new THREE.MeshBasicMaterial({ color: 0xffbb33, transparent: true, opacity: 0.75 });
          this.knot = new THREE.Mesh(kGeo, kMat);
          this.knot.position.y = 80;
          g.add(this.knot);
          this.kMat = kMat;
          this.kY = 80; this.kVY = 0;

          /* Fast-moving blobs upstream */
          const NB = 30;
          this.blobs = [];
          for (let b = 0; b < NB; b++) {
            const bGeo = new THREE.SphereGeometry(2.5 + Math.random() * 2, 6, 5);
            const bMat = new THREE.MeshBasicMaterial({ color: 0x88eeff, transparent: true, opacity: Math.random() * 0.5 });
            const bMesh = new THREE.Mesh(bGeo, bMat);
            bMesh.position.y = -240 + Math.random() * 480;
            bMesh.position.x = (Math.random() - 0.5) * 8;
            bMesh.position.z = (Math.random() - 0.5) * 8;
            g.add(bMesh);
            this.blobs.push({ mesh: bMesh, mat: bMat, spd: 60 + Math.random() * 100 });
          }

          /* Synchrotron halo around knot */
          const hGeo = new THREE.TorusGeometry(20, 4, 8, 40);
          const hMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
          this.halo = new THREE.Mesh(hGeo, hMat);
          this.halo.position.y = 80;
          g.add(this.halo);
          this.hMat = hMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.015;

          /* Knot wobble */
          this.kY = 80 + 12 * Math.sin(T * 0.5);
          this.knot.position.y = this.kY;
          this.kMat.opacity = 0.5 + 0.28 * Math.abs(Math.sin(T * 1.1));
          this.halo.position.y = this.kY;
          this.halo.rotation.z += dt * 0.9;
          this.hMat.opacity = 0.15 + 0.12 * Math.abs(Math.sin(T * 1.5));

          /* Moving blobs toward knot from below */
          this.blobs.forEach((b) => {
            b.mesh.position.y += dt * b.spd;
            if (b.mesh.position.y > this.kY + 10) {
              /* shock — flash and respawn below */
              b.mesh.position.y = -240 + Math.random() * 30;
              b.mat.opacity = 0.4;
            } else {
              b.mat.opacity = Math.max(0, 0.4 - (b.mesh.position.y - (-240)) / 480 * 0.3);
            }
          });

          this.jetUpMat.opacity   = 0.1 + 0.07 * Math.abs(Math.sin(T * 0.7));
          this.jetDownMat.opacity = 0.1 + 0.06 * Math.abs(Math.sin(T * 0.9));
        }
      });

      AFRAME.registerComponent("stellar-magnetic-carpet-emergence", {
        /* Magnetic carpet — the solar photosphere is threaded by a
           forest of small bipolar flux regions emerging, cancelling, and
           reconnecting on ~20-hour timescales; mini-loops light up then
           fade as they cancel; dense patchwork of loops; gold-red-white
           carpet; warm palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-3000, 1800, -600);
          this.g = g; this.t = 0;

          /* Solar surface disc */
          const surfGeo = new THREE.CircleGeometry(90, 40);
          const surfMat = new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
          const surf = new THREE.Mesh(surfGeo, surfMat);
          surf.rotation.x = -Math.PI / 2;
          g.add(surf);
          this.surfMat = surfMat;

          /* Pool of mini flux-loop instances */
          const NLOOP = 40;
          this.loops = [];
          for (let l = 0; l < NLOOP; l++) {
            const loop = this._spawnLoop();
            this.loops.push(loop);
          }

          /* Point carpet for low-level field */
          const NC = 400;
          const cGeo = new THREE.BufferGeometry();
          const cBuf = new Float32Array(NC * 3);
          for (let i = 0; i < NC; i++) {
            const r = Math.random() * 88;
            const phi = Math.random() * Math.PI * 2;
            cBuf[i * 3]     = r * Math.cos(phi);
            cBuf[i * 3 + 1] = 0;
            cBuf[i * 3 + 2] = r * Math.sin(phi);
          }
          cGeo.setAttribute('position', new THREE.BufferAttribute(cBuf, 3));
          const cMat = new THREE.PointsMaterial({ color: 0xffee99, size: 1.5, transparent: true, opacity: 0.3 });
          g.add(new THREE.Points(cGeo, cMat));
          this.cMat = cMat;
        },
        _spawnLoop() {
          const THREE = AFRAME.THREE;
          /* Random position on disc */
          const r0 = Math.random() * 80;
          const ph0 = Math.random() * Math.PI * 2;
          const cx = r0 * Math.cos(ph0), cz = r0 * Math.sin(ph0);
          const h = 8 + Math.random() * 20;
          const w = 5 + Math.random() * 15;

          /* Build arch points */
          const N = 20;
          const pts = [];
          for (let k = 0; k < N; k++) {
            const f = k / (N - 1);
            const x = cx + (f - 0.5) * w;
            const y = h * Math.sin(f * Math.PI);
            pts.push(new THREE.Vector3(x, y, cz));
          }
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          const hue = 0.06 + Math.random() * 0.1;
          const col = new THREE.Color();
          col.setHSL(hue, 0.95, 0.65);
          const mat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0 });
          const line = new THREE.Line(geo, mat);
          this.g.add(line);
          return { line, mat, life: 0, lifeMax: 1.5 + Math.random() * 2.5, growing: true, lifeSpd: 0.5 + Math.random() * 0.8 };
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.01;
          this.surfMat.opacity = 0.3 + 0.1 * Math.sin(T * 0.8);
          this.cMat.opacity    = 0.25 + 0.08 * Math.abs(Math.sin(T * 1.1));

          this.loops.forEach((l, idx) => {
            if (l.growing) {
              l.life += dt * l.lifeSpd;
              l.mat.opacity = Math.min(0.75, l.life / l.lifeMax * 0.75);
              if (l.life >= l.lifeMax / 2) { l.growing = false; }
            } else {
              l.life -= dt * l.lifeSpd;
              l.mat.opacity = Math.max(0, l.life / (l.lifeMax / 2) * 0.75);
              if (l.life <= 0) {
                /* Remove and respawn */
                this.g.remove(l.line);
                l.line.geometry.dispose();
                const newL = this._spawnLoop();
                this.loops[idx] = newL;
              }
            }
          });
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-penumbra-counter-evershed></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-relativistic-jet-knot-shock></a-entity>
      <a-entity stellar-magnetic-carpet-emergence></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 144 injected! Lines: ' + lines);
