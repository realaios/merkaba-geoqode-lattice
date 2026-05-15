/**
 * inject-w148.cjs  — Wave 148
 * cosmic-magnetospheric-pc5-pulsation  + stellar-light-bridge-eruption
 */
"use strict";
const fs = require("fs");
const FILE = "public/cosmos-infinite.html";

let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

if (html.includes('registerComponent("cosmic-magnetospheric-pc5-pulsation"')) {
  console.log("Wave 148 already injected.");
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-magnetospheric-pc5-pulsation", {
        /* Pc5 ULF pulsations — standing Alfven waves on closed field
           lines in the outer magnetosphere at 1-5 mHz; field lines
           sway back and forth in oscillatory mode; toroidal vs
           poloidal oscillation visible; green field lines on dipole;
           oscillating aurora footprints; green, teal, purple palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(4800, 1200, 1600);
          this.g = g; this.t = 0;

          /* Earth */
          const eGeo = new THREE.SphereGeometry(22, 16, 12);
          const eMat = new THREE.MeshBasicMaterial({ color: 0x223344, transparent: true, opacity: 0.7 });
          g.add(new THREE.Mesh(eGeo, eMat));

          /* Dipole field lines (closed) */
          const NLINES = 8;
          this.flines = [];
          for (let n = 0; n < NLINES; n++) {
            const fline = this._buildFieldLine(n, NLINES);
            this.flines.push(fline);
          }

          /* Aurora oval footprints (two rings at polar caps) */
          const mkOval = (lat) => {
            const ovalGeo = new THREE.TorusGeometry(22 * Math.cos(lat), 1.2, 6, 50);
            const ovalMat = new THREE.MeshBasicMaterial({ color: 0x44ffaa, transparent: true, opacity: 0.5 });
            const oval = new THREE.Mesh(ovalGeo, ovalMat);
            oval.rotation.x = Math.PI / 2;
            oval.position.y = 22 * Math.sin(lat);
            g.add(oval);
            return { mesh: oval, mat: ovalMat };
          };
          this.ovalN = mkOval(Math.PI / 3.5);
          this.ovalS = mkOval(-Math.PI / 3.5);

          /* ULF wave particles oscillating along field */
          const NP = 200;
          const pGeo = new THREE.BufferGeometry();
          const pBuf = new Float32Array(NP * 3);
          this.pBuf = pBuf; this.NP = NP;
          this.pPhase = new Float32Array(NP);
          this.pLine  = new Float32Array(NP);
          for (let i = 0; i < NP; i++) {
            this.pPhase[i] = Math.random() * Math.PI * 2;
            this.pLine[i]  = Math.floor(Math.random() * NLINES);
          }
          pGeo.setAttribute('position', new THREE.BufferAttribute(pBuf, 3));
          const pMat = new THREE.PointsMaterial({ color: 0xaaffcc, size: 2, transparent: true, opacity: 0.5 });
          g.add(new THREE.Points(pGeo, pMat));
          this.pMat = pMat;
        },
        _buildFieldLine(n, total) {
          const THREE = AFRAME.THREE;
          const phi = (n / total) * Math.PI * 2;
          const L = 60 + n * 5;
          const NP = 50;
          const pts = [];
          for (let k = 0; k < NP; k++) {
            const theta = (k / (NP - 1)) * Math.PI;
            const r = L * Math.sin(theta) * Math.sin(theta);
            pts.push(new THREE.Vector3(r * Math.cos(phi), r * Math.cos(theta), r * Math.sin(phi)));
          }
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          const mat = new THREE.LineBasicMaterial({ color: 0x33cc88, transparent: true, opacity: 0.4 });
          const line = new THREE.Line(geo, mat);
          this.g.add(line);
          /* Store base points for pulsation */
          return { line, mat, geo, pts: pts.map(p => p.clone()), phi, L };
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.012;

          /* Pc5: ~0.002 Hz → use 0.3 rad/s visually */
          const oscFreq = 0.3;
          const amp = 5 * Math.abs(Math.sin(T * 0.1));

          this.flines.forEach((fl, n) => {
            const phase = n * Math.PI / 4;
            const sway = amp * Math.sin(T * oscFreq + phase);
            const positions = fl.geo.attributes.position.array;
            for (let k = 0; k < fl.pts.length; k++) {
              const p = fl.pts[k];
              positions[k * 3]     = p.x + sway * Math.cos(fl.phi + Math.PI / 2);
              positions[k * 3 + 1] = p.y;
              positions[k * 3 + 2] = p.z + sway * Math.sin(fl.phi + Math.PI / 2);
            }
            fl.geo.attributes.position.needsUpdate = true;
            fl.mat.opacity = 0.3 + 0.2 * Math.abs(Math.sin(T * oscFreq + phase));
          });

          const aulOsc = 0.4 + 0.35 * Math.abs(Math.sin(T * oscFreq));
          this.ovalN.mat.opacity = aulOsc;
          this.ovalS.mat.opacity = aulOsc;

          /* Particles oscillating along field lines */
          for (let i = 0; i < this.NP; i++) {
            this.pPhase[i] += dt * 0.8;
            const fl = this.flines[this.pLine[i]];
            const f = (Math.sin(this.pPhase[i]) + 1) / 2;
            const idx = Math.floor(f * (fl.pts.length - 1));
            const pos = fl.geo.attributes.position.array;
            this.pBuf[i * 3]     = pos[idx * 3];
            this.pBuf[i * 3 + 1] = pos[idx * 3 + 1];
            this.pBuf[i * 3 + 2] = pos[idx * 3 + 2];
          }
          this.pMat.opacity = 0.45 + 0.2 * Math.abs(Math.sin(T * 0.6));
        }
      });

      AFRAME.registerComponent("stellar-light-bridge-eruption", {
        /* Light bridge eruption — plasma jets and surges launched from
           active light bridges crossing sunspot umbrae; jets reach
           chromospheric heights; bright linear bridge with episodic
           surge jets shooting upward; yellow bridge, white-cyan jets,
           orange surge arcs; yellow, white, cyan, orange palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(1400, -2200, 3600);
          this.g = g; this.t = 0;

          /* Sun */
          const sGeo = new THREE.SphereGeometry(48, 20, 16);
          const sMat = new THREE.MeshBasicMaterial({ color: 0xffcc33, transparent: true, opacity: 0.5 });
          g.add(new THREE.Mesh(sGeo, sMat));

          /* Umbra */
          const uGeo = new THREE.CircleGeometry(18, 30);
          const uMat = new THREE.MeshBasicMaterial({ color: 0x110000, transparent: true, opacity: 0.88, side: THREE.DoubleSide });
          const u = new THREE.Mesh(uGeo, uMat);
          u.rotation.x = -Math.PI / 2;
          u.position.y = 48.5;
          g.add(u);

          /* Light bridge — bright linear band */
          const lbGeo = new THREE.BoxGeometry(36, 2.5, 5);
          const lbMat = new THREE.MeshBasicMaterial({ color: 0xffee88, transparent: true, opacity: 0.85 });
          this.lb = new THREE.Mesh(lbGeo, lbMat);
          this.lb.position.y = 49;
          g.add(this.lb);
          this.lbMat = lbMat;

          /* Surge jets from bridge centre */
          const NSURGE = 5;
          this.surges = [];
          for (let s = 0; s < NSURGE; s++) {
            const surg = this._spawnSurge(s);
            this.surges.push(surg);
          }

          /* Fine particle spray */
          const NS = 220;
          const nsGeo = new THREE.BufferGeometry();
          const nsBuf = new Float32Array(NS * 3);
          this.nsBuf = nsBuf; this.NS = NS;
          this.nsX   = new Float32Array(NS);
          this.nsH   = new Float32Array(NS);
          this.nsVH  = new Float32Array(NS);
          this.nsVX  = new Float32Array(NS);
          for (let i = 0; i < NS; i++) {
            this.nsX[i]  = (Math.random() - 0.5) * 34;
            this.nsH[i]  = 49 + Math.random() * 10;
            this.nsVH[i] = 10 + Math.random() * 40;
            this.nsVX[i] = (Math.random() - 0.5) * 8;
          }
          nsGeo.setAttribute('position', new THREE.BufferAttribute(nsBuf, 3));
          const nsMat = new THREE.PointsMaterial({ color: 0xaaffff, size: 1.5, transparent: true, opacity: 0 });
          g.add(new THREE.Points(nsGeo, nsMat));
          this.nsMat = nsMat;
        },
        _spawnSurge(idx) {
          const THREE = AFRAME.THREE;
          const ox = (Math.random() - 0.5) * 30;
          const N = 28;
          const pts = [];
          for (let k = 0; k < N; k++) {
            const f = k / (N - 1);
            pts.push(new THREE.Vector3(ox + (Math.random() - 0.5) * 3, 49 + f * (40 + Math.random() * 30), (Math.random() - 0.5) * 4));
          }
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          const col = new THREE.Color();
          col.setHSL(0.08 + Math.random() * 0.05, 1, 0.75);
          const mat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0 });
          const line = new THREE.Line(geo, mat);
          this.g.add(line);
          return { line, mat, phase: idx * 2.4 + Math.random() * 1.5, lifeMax: 2 + Math.random() };
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.011;

          this.lbMat.opacity = 0.7 + 0.15 * Math.abs(Math.sin(T * 1.5));

          this.surges.forEach((s) => {
            const tMod = (T + s.phase) % 8;
            if (tMod < s.lifeMax) {
              const prog = tMod / s.lifeMax;
              s.mat.opacity = prog < 0.2 ? prog / 0.2 * 0.8 : (1 - prog) * 0.8;
            } else {
              s.mat.opacity = 0;
            }
          });

          /* Spray particles */
          const eruptOsc = Math.max(0, Math.sin(T * 0.7));
          for (let i = 0; i < this.NS; i++) {
            this.nsH[i] += dt * this.nsVH[i] * eruptOsc;
            this.nsX[i] += dt * this.nsVX[i] * eruptOsc;
            if (this.nsH[i] > 100) {
              this.nsH[i] = 49;
              this.nsX[i] = (Math.random() - 0.5) * 34;
            }
            this.nsBuf[i * 3]     = this.nsX[i];
            this.nsBuf[i * 3 + 1] = this.nsH[i];
            this.nsBuf[i * 3 + 2] = (Math.random() - 0.5) * 5;
          }
          this.nsMat.opacity = eruptOsc * 0.55;
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) {
  console.error("JS anchor not found!");
  process.exit(1);
}
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR =
  "      <a-entity stellar-evershed-reverse-funnel></a-entity>";
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-magnetospheric-pc5-pulsation></a-entity>
      <a-entity stellar-light-bridge-eruption></a-entity>`;

if (!html.includes(HTML_ANCHOR)) {
  console.error("HTML anchor not found!");
  process.exit(1);
}
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lines = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 148 injected! Lines: " + lines);
