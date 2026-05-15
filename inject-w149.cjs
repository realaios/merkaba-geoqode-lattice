/**
 * inject-w149.cjs  — Wave 149
 * cosmic-heliospheric-plasma-sheet-ripple  + stellar-flux-tube-convective-collapse
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-heliospheric-plasma-sheet-ripple"')) {
  console.log('Wave 149 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-heliospheric-plasma-sheet-ripple", {
        /* Heliospheric current sheet ripple — the HCS warps into a
           wavy "ballerina skirt" structure as the solar wind carries
           it outward; sector boundaries where magnetic polarity flips
           are visible as bright seams; the sheet folds and ripples
           slowly at the ecliptic; gold-red-blue-white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-5200, -300, -2800);
          this.g = g; this.t = 0;

          /* Build parametric HCS sheet (ballerina skirt) */
          const NU = 60; const NV = 60;
          const geo = new THREE.BufferGeometry();
          const verts = new Float32Array(NU * NV * 3);
          const uvs   = new Float32Array(NU * NV * 2);
          this.verts = verts; this.NU = NU; this.NV = NV;
          const indices = [];
          for (let iu = 0; iu < NU; iu++) {
            for (let iv = 0; iv < NV; iv++) {
              const idx = iu * NV + iv;
              const u = iu / (NU - 1);
              const v = iv / (NV - 1);
              uvs[idx * 2]     = u;
              uvs[idx * 2 + 1] = v;
              if (iu < NU - 1 && iv < NV - 1) {
                const a = idx; const b = idx + NV;
                const c = idx + NV + 1; const d = idx + 1;
                indices.push(a, b, c, a, c, d);
              }
            }
          }
          geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
          geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
          geo.setIndex(indices);
          const mat = new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.18, side: THREE.DoubleSide, wireframe: true });
          g.add(new THREE.Mesh(geo, mat));
          this.geo = geo; this.sheetMat = mat;

          /* Sector boundary lines (4 bright seams) */
          const NSECT = 4;
          this.sectors = [];
          for (let s = 0; s < NSECT; s++) {
            const sAngle = (s / NSECT) * Math.PI * 2;
            const N = 50;
            const pts = [];
            for (let k = 0; k < N; k++) {
              const r = 40 + k * 3;
              pts.push(new THREE.Vector3(r * Math.cos(sAngle), 0, r * Math.sin(sAngle)));
            }
            const sGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const sMat = new THREE.LineBasicMaterial({ color: 0xff6644, transparent: true, opacity: 0.55 });
            g.add(new THREE.Line(sGeo, sMat));
            this.sectors.push({ mat: sMat, angle: sAngle });
          }

          /* Radially streaming particles */
          const NP = 300;
          const pGeo = new THREE.BufferGeometry();
          const pBuf = new Float32Array(NP * 3);
          this.pBuf = pBuf; this.NP = NP;
          this.pR   = new Float32Array(NP);
          this.pPhi = new Float32Array(NP);
          this.pVR  = new Float32Array(NP);
          for (let i = 0; i < NP; i++) {
            this.pR[i]   = 40 + Math.random() * 150;
            this.pPhi[i] = Math.random() * Math.PI * 2;
            this.pVR[i]  = 20 + Math.random() * 30;
          }
          pGeo.setAttribute('position', new THREE.BufferAttribute(pBuf, 3));
          const pMat = new THREE.PointsMaterial({ color: 0xaaddff, size: 1.5, transparent: true, opacity: 0.35 });
          g.add(new THREE.Points(pGeo, pMat));
          this.pMat = pMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.006;

          /* Update HCS sheet — ballerina ripple */
          const verts = this.verts;
          const NU = this.NU; const NV = this.NV;
          for (let iu = 0; iu < NU; iu++) {
            for (let iv = 0; iv < NV; iv++) {
              const idx = iu * NV + iv;
              const u = iu / (NU - 1);
              const v = iv / (NV - 1);
              const r   = 40 + v * 170;
              const phi = u * Math.PI * 2;
              /* Ballerina skirt warp */
              const warp = 20 * Math.sin(phi * 2 + T * 0.15) * (r / 200);
              verts[idx * 3]     = r * Math.cos(phi);
              verts[idx * 3 + 1] = warp;
              verts[idx * 3 + 2] = r * Math.sin(phi);
            }
          }
          this.geo.attributes.position.needsUpdate = true;
          this.sheetMat.opacity = 0.12 + 0.08 * Math.abs(Math.sin(T * 0.2));

          this.sectors.forEach((s, n) => {
            s.mat.opacity = 0.4 + 0.2 * Math.abs(Math.sin(T * 0.3 + n * 0.8));
          });

          for (let i = 0; i < this.NP; i++) {
            this.pR[i] += dt * this.pVR[i];
            if (this.pR[i] > 200) this.pR[i] = 40;
            const phi = this.pPhi[i] + T * 0.02;
            const warp = 15 * Math.sin(phi * 2 + T * 0.15) * (this.pR[i] / 200);
            this.pBuf[i * 3]     = this.pR[i] * Math.cos(phi);
            this.pBuf[i * 3 + 1] = warp + (Math.random() - 0.5) * 6;
            this.pBuf[i * 3 + 2] = this.pR[i] * Math.sin(phi);
          }
          this.pMat.opacity = 0.25 + 0.12 * Math.abs(Math.sin(T * 0.5));
        }
      });

      AFRAME.registerComponent("stellar-flux-tube-convective-collapse", {
        /* Convective collapse of a magnetic flux tube — a horizontal
           flux tube in an intergranular lane is rapidly concentrated
           by convective collapse to ~1500 G; initially a bright flash,
           then a dark intergranular dot; cyclic events across the
           photosphere; white flash, gold transition, dark collapse;
           white, gold, amber, dark palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(2800, 3600, -900);
          this.g = g; this.t = 0;

          /* Solar photosphere disc */
          const sunGeo = new THREE.SphereGeometry(50, 20, 16);
          const sunMat = new THREE.MeshBasicMaterial({ color: 0xffcc22, transparent: true, opacity: 0.5 });
          g.add(new THREE.Mesh(sunGeo, sunMat));

          /* Granule mesh on surface — intergranular lane map */
          const NGR = 14;
          this.granules = [];
          for (let gx = 0; gx < NGR; gx++) {
            for (let gy = 0; gy < NGR; gy++) {
              const ox = (gx - NGR / 2) * 7.5;
              const oy2 = (gy - NGR / 2) * 7.5;
              if (Math.sqrt(ox * ox + oy2 * oy2) > 50) continue;
              const cGeo = new THREE.CircleGeometry(3.0 + Math.random(), 8);
              const bright = 0.35 + Math.random() * 0.25;
              const col = new THREE.Color();
              col.setHSL(0.09, 0.9, bright);
              const cMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
              const cMesh = new THREE.Mesh(cGeo, cMat);
              /* Place on sphere surface */
              const norm = new THREE.Vector3(ox, oy2, 0).normalize();
              cMesh.position.copy(norm.multiplyScalar(50.3));
              cMesh.lookAt(new THREE.Vector3(0, 0, 0));
              g.add(cMesh);
              this.granules.push({ mesh: cMesh, mat: cMat, baseBright: bright });
            }
          }

          /* Collapse events — bright dots that flash and darken */
          const NEV = 12;
          this.events = [];
          for (let e = 0; e < NEV; e++) {
            const phi = Math.random() * Math.PI * 2;
            const th  = (Math.random() - 0.5) * 0.9;
            const nx = Math.cos(th) * Math.cos(phi);
            const ny = Math.sin(th);
            const nz = Math.cos(th) * Math.sin(phi);
            const eGeo = new THREE.SphereGeometry(2, 8, 6);
            const eMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
            const eMesh = new THREE.Mesh(eGeo, eMat);
            eMesh.position.set(nx * 50.5, ny * 50.5, nz * 50.5);
            g.add(eMesh);
            this.events.push({ mesh: eMesh, mat: eMat, phase: e * 1.3 + Math.random() * 2, stage: 0 });
          }

          /* Fine plasma spray during collapse */
          const NS = 180;
          const nsGeo = new THREE.BufferGeometry();
          const nsBuf = new Float32Array(NS * 3);
          this.nsBuf = nsBuf; this.NS = NS;
          this.nsTheta = new Float32Array(NS);
          this.nsPhi   = new Float32Array(NS);
          this.nsR     = new Float32Array(NS);
          this.nsVR    = new Float32Array(NS);
          for (let i = 0; i < NS; i++) {
            this.nsTheta[i] = (Math.random() - 0.5) * Math.PI;
            this.nsPhi[i]   = Math.random() * Math.PI * 2;
            this.nsR[i]     = 50 + Math.random() * 3;
            this.nsVR[i]    = 2 + Math.random() * 10;
          }
          nsGeo.setAttribute('position', new THREE.BufferAttribute(nsBuf, 3));
          const nsMat = new THREE.PointsMaterial({ color: 0xffee99, size: 1.3, transparent: true, opacity: 0 });
          g.add(new THREE.Points(nsGeo, nsMat));
          this.nsMat = nsMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.013;

          /* Granule shimmer */
          this.granules.forEach((gr, i) => {
            gr.mat.opacity = 0.55 + 0.15 * Math.sin(T * 0.8 + i * 0.5);
          });

          /* Collapse events: flash bright (white) → amber → dark */
          this.events.forEach((ev) => {
            const tMod = (T + ev.phase) % 7;
            if (tMod < 0.5) {
              /* Flash */
              const prog = tMod / 0.5;
              const c = new THREE.Color();
              c.setRGB(1, 1, 0.8 + 0.2 * (1 - prog));
              ev.mat.color = c;
              ev.mat.opacity = prog * 0.95;
              ev.mesh.scale.setScalar(1 + prog * 0.8);
            } else if (tMod < 1.5) {
              /* Collapse to dark */
              const prog = (tMod - 0.5) / 1.0;
              const c = new THREE.Color();
              c.setRGB(1 - prog * 0.85, 0.7 - prog * 0.65, 0.2 - prog * 0.19);
              ev.mat.color = c;
              ev.mat.opacity = 0.95 - prog * 0.7;
              ev.mesh.scale.setScalar(1.8 - prog * 1.4);
            } else if (tMod < 4) {
              /* Dark flux tube */
              ev.mat.opacity = 0.25 - (tMod - 1.5) / 2.5 * 0.2;
              ev.mesh.scale.setScalar(0.4);
            } else {
              /* Decay away */
              ev.mat.opacity = Math.max(0, ev.mat.opacity - dt * 0.5);
              ev.mesh.scale.setScalar(Math.max(0.1, ev.mesh.scale.x - dt * 0.3));
            }
          });

          /* Spray during collapse events */
          const collapseOsc = Math.max(0, Math.sin(T * 1.1));
          for (let i = 0; i < this.NS; i++) {
            this.nsR[i] += dt * this.nsVR[i];
            if (this.nsR[i] > 65) this.nsR[i] = 50;
            const t2 = this.nsTheta[i];
            const p2 = this.nsPhi[i] + T * 0.04;
            this.nsBuf[i * 3]     = this.nsR[i] * Math.cos(t2) * Math.cos(p2);
            this.nsBuf[i * 3 + 1] = this.nsR[i] * Math.sin(t2);
            this.nsBuf[i * 3 + 2] = this.nsR[i] * Math.cos(t2) * Math.sin(p2);
          }
          this.nsMat.opacity = collapseOsc * 0.45;
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-light-bridge-eruption></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-heliospheric-plasma-sheet-ripple></a-entity>
      <a-entity stellar-flux-tube-convective-collapse></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 149 injected! Lines: ' + lines);
