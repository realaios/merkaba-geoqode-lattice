/**
 * inject-w138.cjs  — Wave 138
 * cosmic-magnetotail-plasmoid-ejection  + stellar-helium-flash-burst
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-magnetotail-plasmoid-ejection"')) {
  console.log('Wave 138 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-magnetotail-plasmoid-ejection", {
        /* Magnetotail substorm — reconnection forms a plasmoid (magnetic
           bubble) in the plasmasheet which is then rapidly ejected
           downtail; teal-blue-silver plasmoid with field-aligned jets;
           teal, silver, orange palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-1400, 600, 2800);
          this.g = g; this.t = 0;

          /* Tail current-sheet slab */
          const shGeo = new THREE.BoxGeometry(320, 20, 40);
          const shMat = new THREE.MeshBasicMaterial({ color: 0x224488, transparent: true, opacity: 0.22, wireframe: false });
          g.add(new THREE.Mesh(shGeo, shMat));
          this.shMat = shMat;

          /* Plasmoid — ellipsoidal magnetic bubble */
          const plGeo = new THREE.SphereGeometry(28, 20, 14);
          plGeo.applyMatrix4(new THREE.Matrix4().makeScale(1.8, 0.5, 0.8));
          const plMat = new THREE.MeshBasicMaterial({ color: 0x00ffee, transparent: true, opacity: 0.45, wireframe: false });
          this.plMesh = new THREE.Mesh(plGeo, plMat);
          this.plMesh.position.set(-20, 0, 0);
          g.add(this.plMesh);
          this.plMat = plMat;
          this.plX = -20; this.plVX = 0;

          /* Internal field loops of plasmoid */
          const NLOOP = 5;
          this.loops = [];
          for (let l = 0; l < NLOOP; l++) {
            const loopGeo = new THREE.TorusGeometry(20 - l * 3, 1.5, 6, 24);
            loopGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.35, 1));
            const hue = 0.50 + l * 0.02;
            const col = new THREE.Color();
            col.setHSL(hue, 0.8, 0.6);
            const loopMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.5 });
            const loopMesh = new THREE.Mesh(loopGeo, loopMat);
            loopMesh.position.set(-20, 0, 0);
            loopMesh.rotation.y = (l / NLOOP) * Math.PI;
            g.add(loopMesh);
            this.loops.push({ mesh: loopMesh, mat: loopMat, phase: l * 0.5 });
          }

          /* Bursty bulk flow jet — narrow cylinder shooting tailward */
          const jetGeo = new THREE.CylinderGeometry(4, 8, 160, 8);
          jetGeo.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
          const jetMat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.28 });
          this.jetMesh = new THREE.Mesh(jetGeo, jetMat);
          this.jetMesh.position.set(-120, 0, 0);
          g.add(this.jetMesh);
          this.jetMat = jetMat;

          /* Plasmoid plasma particles */
          const N = 140;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          this.ptPhi = new Float32Array(N);
          this.ptR   = new Float32Array(N);
          this.ptZ   = new Float32Array(N);
          for (let i = 0; i < N; i++) {
            this.ptPhi[i] = Math.random() * Math.PI * 2;
            this.ptR[i]   = 5 + Math.random() * 22;
            this.ptZ[i]   = (Math.random() - 0.5) * 14;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xaaffee, size: 2.0, transparent: true, opacity: 0.6 });
          g.add(new THREE.Points(ptGeo, ptMat));
          this.ptBuf = ptBuf; this.ptMat = ptMat; this.N = N;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.014;

          /* Substorm cycle ~12s */
          const cycle = T % 12;
          const ejecting = cycle > 4 && cycle < 10;
          const acc = ejecting ? 15 : -8;
          this.plVX = Math.max(-80, Math.min(80, this.plVX + acc * dt));
          if (!ejecting) { this.plVX *= Math.pow(0.95, dt * 30); }
          this.plX += this.plVX * dt;
          if (this.plX < -180 || this.plX > 60) {
            this.plX = -20; this.plVX = 0;
          }

          this.plMesh.position.x = this.plX;
          this.loops.forEach((l) => {
            l.mesh.position.x = this.plX;
            l.mesh.rotation.x += dt * 0.6;
            l.mat.opacity = ejecting ? 0.55 : 0.3;
          });

          this.jetMesh.position.x = this.plX - 100;
          this.jetMat.opacity = ejecting ? 0.28 + 0.12 * Math.sin(T * 5) : 0.06;
          this.plMat.opacity = 0.3 + 0.2 * (ejecting ? 1 : 0.2);
          this.shMat.opacity = 0.15 + 0.08 * Math.sin(T * 2);

          /* Particles orbit around plasmoid center */
          for (let i = 0; i < this.N; i++) {
            this.ptPhi[i] += dt * (0.8 + ejecting * 0.5);
            const px = this.plX + this.ptR[i] * 1.8 * Math.cos(this.ptPhi[i]);
            const py = this.ptR[i] * 0.4 * Math.sin(this.ptPhi[i]);
            const pz = this.ptZ[i] + 0.8 * Math.sin(this.ptPhi[i] * 2);
            this.ptBuf[i * 3]     = px;
            this.ptBuf[i * 3 + 1] = py;
            this.ptBuf[i * 3 + 2] = pz;
          }
          this.ptMat.opacity = 0.4 + 0.25 * (ejecting ? 1 : 0);
        }
      });

      AFRAME.registerComponent("stellar-helium-flash-burst", {
        /* Helium flash — explosive onset of helium burning in the
           degenerate core of a low-mass red giant; runaway thermonuclear
           event that releases ~10^11 solar luminosities for a few seconds
           inside the star (not seen externally); depicted as expanding
           shock ring deep inside a stellar cross-section;
           crimson-gold-white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(3000, -1200, 600);
          this.g = g; this.t = 0;

          /* Stellar envelope layers */
          const NLAYER = 5;
          this.layers = [];
          for (let l = 0; l < NLAYER; l++) {
            const r = 35 + l * 22;
            const lGeo = new THREE.SphereGeometry(r, 24, 16);
            const hue = 0.04 - l * 0.005;
            const col = new THREE.Color();
            col.setHSL(Math.max(0, hue), 0.85, 0.5 + l * 0.05);
            const lMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.08 + l * 0.01 });
            g.add(new THREE.Mesh(lGeo, lMat));
            this.layers.push({ mat: lMat, r, phase: l * 0.6 });
          }

          /* Degenerate core — tiny bright sphere */
          const cGeo = new THREE.SphereGeometry(18, 20, 14);
          const cMat = new THREE.MeshBasicMaterial({ color: 0xffeedd, transparent: true, opacity: 0.7 });
          g.add(new THREE.Mesh(cGeo, cMat));
          this.cMat = cMat;

          /* Helium flash ring — expanding shock */
          const NSHOCK = 4;
          this.shocks = [];
          for (let s = 0; s < NSHOCK; s++) {
            const sGeo = new THREE.SphereGeometry(18, 20, 14);
            const sMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0, wireframe: true });
            const sMesh = new THREE.Mesh(sGeo, sMat);
            g.add(sMesh);
            this.shocks.push({ mesh: sMesh, mat: sMat, r: 18, phase: s * 2.5, active: false });
          }

          /* Thermonuclear ash spray inside core */
          const N = 200;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          this.ptDir = [];
          this.ptR   = new Float32Array(N);
          this.ptAct = new Uint8Array(N);
          for (let i = 0; i < N; i++) {
            const th = Math.random() * Math.PI;
            const ph = Math.random() * Math.PI * 2;
            this.ptDir.push(new THREE.Vector3(
              Math.sin(th) * Math.cos(ph),
              Math.cos(th),
              Math.sin(th) * Math.sin(ph)
            ));
            this.ptR[i] = 0;
            this.ptAct[i] = 0;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xffcc88, size: 2.0, transparent: true, opacity: 0 });
          g.add(new THREE.Points(ptGeo, ptMat));
          this.ptBuf = ptBuf; this.ptMat = ptMat; this.N = N;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.016;

          /* Helium flash repeats every 9s */
          const cycle = T % 9;
          const flashing = cycle < 2.5;
          const intensity = flashing ? Math.sin((cycle / 2.5) * Math.PI) : 0;

          this.cMat.opacity = 0.55 + intensity * 0.45;

          /* Layers pulse outward */
          this.layers.forEach((l, idx) => {
            const pulse = flashing ? Math.sin(cycle * Math.PI / 2.5 - idx * 0.5) : 0;
            l.mat.opacity = 0.07 + Math.max(0, pulse) * 0.15;
          });

          /* Shock rings expand during flash */
          this.shocks.forEach((s) => {
            if (flashing && !s.active && cycle > s.phase * 0.6 % 2.5) {
              s.active = true; s.r = 18;
            }
            if (!flashing) { s.active = false; s.r = 18; }
            if (s.active) {
              s.r += dt * 35;
              s.mesh.scale.setScalar(s.r / 18);
              s.mat.opacity = Math.max(0, 0.5 - (s.r - 18) / 80);
            } else {
              s.mat.opacity = 0;
            }
          });

          /* Spray particles */
          if (flashing && intensity > 0.3) {
            for (let i = 0; i < this.N; i++) {
              if (!this.ptAct[i] && Math.random() < 0.08) {
                this.ptAct[i] = 1; this.ptR[i] = 18;
              }
            }
          }
          if (!flashing) {
            for (let i = 0; i < this.N; i++) { this.ptAct[i] = 0; this.ptR[i] = 0; }
          }
          for (let i = 0; i < this.N; i++) {
            if (this.ptAct[i]) {
              this.ptR[i] += dt * 45;
              if (this.ptR[i] > 100) { this.ptAct[i] = 0; this.ptR[i] = 0; }
            }
            const r = this.ptAct[i] ? this.ptR[i] : 9999;
            const d = this.ptDir[i];
            this.ptBuf[i * 3]     = d.x * r;
            this.ptBuf[i * 3 + 1] = d.y * r;
            this.ptBuf[i * 3 + 2] = d.z * r;
          }
          this.ptMat.needsUpdate = true;
          this.ptMat.opacity = intensity * 0.7;
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-superflare-spray></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-magnetotail-plasmoid-ejection></a-entity>
      <a-entity stellar-helium-flash-burst></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 138 injected! Lines: ' + lines);
