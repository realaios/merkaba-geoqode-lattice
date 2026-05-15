/**
 * inject-w136.cjs  — Wave 136
 * cosmic-flux-rope-eruption-channel  + stellar-pore-formation-cluster
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-flux-rope-eruption-channel"')) {
  console.log('Wave 136 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-flux-rope-eruption-channel", {
        /* Magnetic flux rope CME channel — a helical flux rope
           propagating outward from the Sun through the corona,
           twisting and expanding; red-gold-white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(1200, 900, 2000);
          this.g = g; this.t = 0;

          /* Rope axis path — parabolic outward */
          const NPTS = 30;
          this.ropePts = [];
          for (let i = 0; i < NPTS; i++) {
            const u = i / (NPTS - 1);
            this.ropePts.push(new THREE.Vector3(
              (u - 0.5) * 200,
              60 + u * 140,
              (u - 0.5) * 60
            ));
          }

          /* Helical strands wound around rope axis */
          const NSTRANDS = 5;
          this.strands = [];
          for (let s = 0; s < NSTRANDS; s++) {
            const NP2 = 80;
            const sGeo = new THREE.BufferGeometry();
            const sBuf = new Float32Array(NP2 * 3);
            sGeo.setAttribute('position', new THREE.BufferAttribute(sBuf, 3));
            const hue = 0.04 + s * 0.025;
            const col = new THREE.Color();
            col.setHSL(hue, 0.9, 0.55);
            const sMat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.6 });
            g.add(new THREE.Line(sGeo, sMat));
            this.strands.push({ sBuf, geo: sGeo, mat: sMat, phaseOff: (s / NSTRANDS) * Math.PI * 2 });
          }

          /* Expansion envelope — ellipsoid that grows */
          const envGeo = new THREE.SphereGeometry(60, 24, 16);
          const envMat = new THREE.MeshBasicMaterial({ color: 0xff3300, transparent: true, opacity: 0.08, wireframe: false });
          this.envMesh = new THREE.Mesh(envGeo, envMat);
          this.envMesh.position.set(0, 120, 0);
          g.add(this.envMesh);
          this.envMat = envMat;
          this.envScale = 1;

          /* Leading edge shock sheath */
          const sheathGeo = new THREE.TorusGeometry(65, 5, 8, 32);
          sheathGeo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
          const sheathMat = new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.3 });
          this.sheathMesh = new THREE.Mesh(sheathGeo, sheathMat);
          this.sheathMesh.position.set(0, 185, 0);
          g.add(this.sheathMesh);
          this.sheathMat = sheathMat;

          /* Plasma particles entrained in rope */
          const N = 160;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          this.ptU   = new Float32Array(N);
          this.ptPhi = new Float32Array(N);
          this.ptR   = new Float32Array(N);
          for (let i = 0; i < N; i++) {
            this.ptU[i]   = Math.random();
            this.ptPhi[i] = Math.random() * Math.PI * 2;
            this.ptR[i]   = 5 + Math.random() * 18;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xffeeaa, size: 2.2, transparent: true, opacity: 0.5 });
          this.pts = new THREE.Points(ptGeo, ptMat);
          g.add(this.pts);
          this.ptBuf = ptBuf; this.ptMat = ptMat; this.N = N;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.018;

          /* Expand envelope slowly */
          this.envScale = Math.min(2.2, 1 + this.t * 0.08);
          this.envMesh.scale.setScalar(this.envScale);
          this.sheathMesh.scale.setScalar(this.envScale * 0.98);
          this.envMat.opacity = 0.06 + 0.04 * Math.sin(T * 2.0);
          this.sheathMat.opacity = 0.2 + 0.12 * Math.sin(T * 2.5);

          /* Helical strands twist and propagate */
          const NPTS = this.ropePts.length;
          this.strands.forEach((s) => {
            const NP2 = 80;
            for (let p = 0; p < NP2; p++) {
              const u = p / (NP2 - 1);
              const idxF = Math.min(u * (NPTS - 1), NPTS - 2);
              const idx = Math.floor(idxF);
              const frac = idxF - idx;
              const ptA = this.ropePts[idx];
              const ptB = this.ropePts[Math.min(idx + 1, NPTS - 1)];
              const ax = ptA.x + (ptB.x - ptA.x) * frac;
              const ay = ptA.y + (ptB.y - ptA.y) * frac;
              const az = ptA.z + (ptB.z - ptA.z) * frac;
              const helixAngle = s.phaseOff + u * Math.PI * 6 - T * 2.0;
              const helixR = 18 + 8 * u;
              s.sBuf[p * 3]     = ax + helixR * Math.cos(helixAngle);
              s.sBuf[p * 3 + 1] = ay;
              s.sBuf[p * 3 + 2] = az + helixR * Math.sin(helixAngle);
            }
            s.geo.attributes.position.needsUpdate = true;
            s.mat.opacity = 0.45 + 0.2 * Math.sin(T * 1.8 + s.phaseOff);
          });

          /* Particles orbit helically and stream outward */
          const NPTS2 = this.ropePts.length;
          for (let i = 0; i < this.N; i++) {
            this.ptPhi[i] += dt * 1.8;
            this.ptU[i]   = (this.ptU[i] + dt * 0.08) % 1;
            const u = this.ptU[i];
            const idxF = Math.min(u * (NPTS2 - 1), NPTS2 - 2);
            const idx = Math.floor(idxF);
            const frac = idxF - idx;
            const ptA = this.ropePts[idx];
            const ptB = this.ropePts[Math.min(idx + 1, NPTS2 - 1)];
            const ax = ptA.x + (ptB.x - ptA.x) * frac;
            const ay = ptA.y + (ptB.y - ptA.y) * frac;
            const az = ptA.z + (ptB.z - ptA.z) * frac;
            const r = this.ptR[i];
            this.ptBuf[i * 3]     = ax + r * Math.cos(this.ptPhi[i]);
            this.ptBuf[i * 3 + 1] = ay;
            this.ptBuf[i * 3 + 2] = az + r * Math.sin(this.ptPhi[i]);
          }
          this.pts.geometry.attributes.position.needsUpdate = true;
          this.ptMat.opacity = 0.35 + 0.2 * Math.sin(T * 2.2);
        }
      });

      AFRAME.registerComponent("stellar-pore-formation-cluster", {
        /* Solar magnetic pores — small dark concentrations of magnetic
           flux that appear in the photosphere, smaller than full
           sunspots; cluster of dark pores with surrounding bright rings;
           dark-maroon, orange, cream palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-1800, -400, 1600);
          this.g = g; this.t = 0;

          /* Photosphere background */
          const phGeo = new THREE.PlaneGeometry(260, 260, 1, 1);
          const phMat = new THREE.MeshBasicMaterial({ color: 0xffbb33, transparent: true, opacity: 0.22, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(phGeo, phMat));
          this.phMat = phMat;

          /* Individual pore discs — dark with bright ring */
          const NPORE = 12;
          this.pores = [];
          for (let p = 0; p < NPORE; p++) {
            const px = (Math.random() - 0.5) * 200;
            const py = (Math.random() - 0.5) * 200;
            const r = 8 + Math.random() * 14;
            /* Dark interior */
            const dGeo = new THREE.CircleGeometry(r, 20);
            const dMat = new THREE.MeshBasicMaterial({ color: 0x110000, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
            const dark = new THREE.Mesh(dGeo, dMat);
            dark.position.set(px, py, 0.5);
            g.add(dark);
            /* Bright ring around pore */
            const rGeo = new THREE.RingGeometry(r, r + 6, 24);
            const rMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
            const ring = new THREE.Mesh(rGeo, rMat);
            ring.position.set(px, py, 0.6);
            g.add(ring);
            /* Faint field lines radiating from pore */
            const NFAN = 6;
            for (let f = 0; f < NFAN; f++) {
              const fanAngle = (f / NFAN) * Math.PI * 2;
              const fGeo = new THREE.BufferGeometry();
              const buf = new Float32Array([
                px + (r + 6) * Math.cos(fanAngle), py + (r + 6) * Math.sin(fanAngle), 1,
                px + (r + 30) * Math.cos(fanAngle), py + (r + 30) * Math.sin(fanAngle), 1
              ]);
              fGeo.setAttribute('position', new THREE.BufferAttribute(buf, 3));
              const fMat = new THREE.LineBasicMaterial({ color: 0xffcc77, transparent: true, opacity: 0.25 });
              g.add(new THREE.Line(fGeo, fMat));
            }
            this.pores.push({ dark, dMat, ring, rMat, phase: Math.random() * Math.PI * 2, r0: r });
          }

          /* Granule background — bright cells */
          const NGRAN = 20;
          this.grans = [];
          for (let gn = 0; gn < NGRAN; gn++) {
            const gx = (Math.random() - 0.5) * 250;
            const gy = (Math.random() - 0.5) * 250;
            const gr2 = 10 + Math.random() * 18;
            const grGeo = new THREE.CircleGeometry(gr2, 12);
            const hue = 0.09 + Math.random() * 0.04;
            const col = new THREE.Color();
            col.setHSL(hue, 0.85, 0.60);
            const grMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
            const gran = new THREE.Mesh(grGeo, grMat);
            gran.position.set(gx, gy, 0.2);
            g.add(gran);
            this.grans.push({ mat: grMat, phase: Math.random() * Math.PI * 2 });
          }
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.x += dt * 0.012;

          /* Pores brighten/darken with magnetic flux oscillation */
          this.pores.forEach((p) => {
            const osc = 0.5 + 0.5 * Math.sin(T * 0.9 + p.phase);
            p.dMat.opacity = 0.65 + 0.25 * (1 - osc); /* darker when stronger */
            p.rMat.opacity = 0.3 + 0.35 * osc;
            /* Pore grows/shrinks slightly */
            const sc = 1 + 0.12 * Math.sin(T * 1.4 + p.phase);
            p.dark.scale.setScalar(sc);
            p.ring.scale.setScalar(sc);
          });

          /* Granules flicker */
          this.grans.forEach((gn) => {
            gn.mat.opacity = 0.22 + 0.18 * Math.sin(T * 2.0 + gn.phase);
          });

          this.phMat.opacity = 0.15 + 0.08 * Math.sin(T * 1.1);
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-oscillatory-convection-cell></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-flux-rope-eruption-channel></a-entity>
      <a-entity stellar-pore-formation-cluster></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 136 injected! Lines: ' + lines);
