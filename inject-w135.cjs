/**
 * inject-w135.cjs  — Wave 135
 * cosmic-plasma-sheet-flapping  + stellar-oscillatory-convection-cell
 */
"use strict";
const fs = require("fs");
const FILE = "public/cosmos-infinite.html";

let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

if (html.includes('registerComponent("cosmic-plasma-sheet-flapping"')) {
  console.log("Wave 135 already injected.");
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-plasma-sheet-flapping", {
        /* Magnetotail plasma sheet — the thin equatorial current sheet
           in Earth's magnetotail that flaps up and down driven by solar
           wind dynamic pressure variations; blue-white-violet palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-800, 1600, -1200);
          this.g = g; this.t = 0;

          /* Sheet surface */
          const SEGS = 40;
          const shGeo = new THREE.PlaneGeometry(400, 80, SEGS, 6);
          const shMat = new THREE.MeshBasicMaterial({ color: 0x0000aa, transparent: true, opacity: 0.18, side: THREE.DoubleSide, wireframe: false });
          this.shMesh = new THREE.Mesh(shGeo, shMat);
          g.add(this.shMesh);
          this.shMat = shMat; this.shGeo = shGeo;
          this.shPos = shGeo.attributes.position;

          /* Magnetic field lines — arching across the sheet */
          const NLINES = 10;
          this.fieldLines = [];
          for (let f = 0; f < NLINES; f++) {
            const fPts = [];
            const NP = 24;
            for (let p = 0; p < NP; p++) fPts.push(new THREE.Vector3());
            const fGeo = new THREE.BufferGeometry().setFromPoints(fPts);
            const fBuf = fGeo.attributes.position.array;
            const hue = 0.62 + f * 0.018;
            const col = new THREE.Color();
            col.setHSL(hue, 0.8, 0.55);
            const fMat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.35 });
            g.add(new THREE.Line(fGeo, fMat));
            this.fieldLines.push({ fBuf, geo: fGeo, mat: fMat, phase: f * 0.7, x0: -180 + f * 40 });
          }

          /* Current sheet particles */
          const N = 200;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          this.ptX  = new Float32Array(N);
          this.ptY  = new Float32Array(N);
          this.ptSpd = new Float32Array(N);
          for (let i = 0; i < N; i++) {
            this.ptX[i]   = (Math.random() - 0.5) * 400;
            this.ptY[i]   = (Math.random() - 0.5) * 20;
            this.ptSpd[i] = 20 + Math.random() * 30;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xaabbff, size: 2.0, transparent: true, opacity: 0.5 });
          this.pts = new THREE.Points(ptGeo, ptMat);
          g.add(this.pts);
          this.ptBuf = ptBuf; this.ptMat = ptMat; this.N = N;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.x += dt * 0.01;

          /* Flap the sheet vertically — wave traveling along x */
          const pos = this.shPos;
          const count = pos.count;
          for (let i = 0; i < count; i++) {
            const x = pos.getX(i);
            const yBase = pos.getY(i);
            const flapY = 22 * Math.sin(x * 0.022 - T * 1.8) + 6 * Math.sin(x * 0.045 + T * 2.5);
            pos.setZ(i, flapY);
          }
          pos.needsUpdate = true;
          this.shGeo.computeVertexNormals();

          /* Field lines follow the sheet flap */
          this.fieldLines.forEach((fl) => {
            const NP = 24;
            const x0 = fl.x0;
            for (let p = 0; p < NP; p++) {
              const u = p / (NP - 1);
              const xPt = x0;
              const yPt = 40 * Math.sin(Math.PI * u);
              const zSheet = 22 * Math.sin(x0 * 0.022 - T * 1.8 + fl.phase);
              fl.fBuf[p * 3]     = xPt;
              fl.fBuf[p * 3 + 1] = yPt - 20;
              fl.fBuf[p * 3 + 2] = zSheet + yPt * 0.15;
            }
            fl.geo.attributes.position.needsUpdate = true;
            fl.mat.opacity = 0.2 + 0.2 * Math.abs(Math.sin(T * 2.0 + fl.phase));
          });

          /* Particles stream tailward */
          for (let i = 0; i < this.N; i++) {
            this.ptX[i] += dt * this.ptSpd[i];
            if (this.ptX[i] > 210) this.ptX[i] = -210;
            const flap = 22 * Math.sin(this.ptX[i] * 0.022 - T * 1.8);
            this.ptBuf[i * 3]     = this.ptX[i];
            this.ptBuf[i * 3 + 1] = this.ptY[i];
            this.ptBuf[i * 3 + 2] = flap * 0.8;
          }
          this.pts.geometry.attributes.position.needsUpdate = true;
          this.shMat.opacity = 0.12 + 0.08 * Math.abs(Math.sin(T * 1.4));
        }
      });

      AFRAME.registerComponent("stellar-oscillatory-convection-cell", {
        /* Giant convective cell in a stellar interior — large-scale
           oscillatory circulation that reverses direction periodically
           (similar to hypothesised giant cells in the Sun);
           amber-coral-yellow palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(1800, -800, 800);
          this.g = g; this.t = 0;

          /* Outer convection zone shell */
          const czGeo = new THREE.SphereGeometry(90, 32, 24);
          const czMat = new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.14, wireframe: false });
          g.add(new THREE.Mesh(czGeo, czMat));
          this.czMat = czMat;

          /* Inner tachocline boundary */
          const tcGeo = new THREE.SphereGeometry(55, 32, 24);
          const tcMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.08 });
          g.add(new THREE.Mesh(tcGeo, tcMat));

          /* Giant cell flow arrows (10 cells around equator + poles) */
          const NCELL = 8;
          this.cells = [];
          for (let c = 0; c < NCELL; c++) {
            const phi = (c / NCELL) * Math.PI * 2;
            const cellGrp = new THREE.Group();
            cellGrp.rotation.y = phi;
            g.add(cellGrp);
            /* Upflow column */
            const upGeo = new THREE.CylinderGeometry(3, 5, 40, 8);
            const hue = 0.08 + c * 0.015;
            const col = new THREE.Color();
            col.setHSL(hue, 0.85, 0.55);
            const upMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.45 });
            const up = new THREE.Mesh(upGeo, upMat);
            up.position.set(70, 0, 0);
            up.rotation.z = Math.PI / 2;
            cellGrp.add(up);
            /* Downflow column */
            const dnMat = new THREE.MeshBasicMaterial({ color: 0xcc6600, transparent: true, opacity: 0.3 });
            const dn = new THREE.Mesh(new THREE.CylinderGeometry(3, 5, 40, 8), dnMat);
            dn.position.set(45, 0, 0);
            dn.rotation.z = Math.PI / 2;
            cellGrp.add(dn);
            this.cells.push({ grp: cellGrp, upMat, dnMat, phase: c * 0.55 });
          }

          /* Particle circulation — two counter-rotating streams */
          const N = 180;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          this.ptAngle = new Float32Array(N);
          this.ptR     = new Float32Array(N);
          this.ptTheta = new Float32Array(N);
          this.ptDir   = new Int8Array(N);
          for (let i = 0; i < N; i++) {
            this.ptAngle[i] = Math.random() * Math.PI * 2;
            this.ptR[i]     = 50 + Math.random() * 38;
            this.ptTheta[i] = Math.random() * Math.PI;
            this.ptDir[i]   = i % 2 === 0 ? 1 : -1;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xffcc66, size: 2.2, transparent: true, opacity: 0.5 });
          this.pts = new THREE.Points(ptGeo, ptMat);
          g.add(this.pts);
          this.ptBuf = ptBuf; this.ptMat = ptMat; this.N = N;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.04;

          /* Cell circulation reversal every ~10s */
          const reversal = Math.sin(T * 0.31);
          this.cells.forEach((c) => {
            const omega = 0.5 * reversal * (c.phase % 2 < 1 ? 1 : -1);
            c.grp.rotation.y += dt * omega;
            c.upMat.opacity = 0.3 + 0.25 * Math.max(0, reversal * (c.phase % 2 < 1 ? 1 : -1));
            c.dnMat.opacity = 0.15 + 0.2 * Math.max(0, -reversal * (c.phase % 2 < 1 ? 1 : -1));
          });

          /* Particle convection orbits */
          for (let i = 0; i < this.N; i++) {
            this.ptAngle[i] += dt * 0.45 * reversal * this.ptDir[i];
            const phi = this.ptAngle[i];
            const th  = this.ptTheta[i];
            const r   = this.ptR[i];
            this.ptBuf[i * 3]     = r * Math.sin(th) * Math.cos(phi);
            this.ptBuf[i * 3 + 1] = r * Math.cos(th);
            this.ptBuf[i * 3 + 2] = r * Math.sin(th) * Math.sin(phi);
          }
          this.pts.geometry.attributes.position.needsUpdate = true;

          this.ptMat.opacity = 0.35 + 0.18 * Math.abs(Math.sin(T * 1.5));
          this.czMat.opacity = 0.10 + 0.06 * Math.abs(Math.sin(T * 0.8));
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) {
  console.error("JS anchor not found!");
  process.exit(1);
}
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR =
  "      <a-entity stellar-flux-tube-flicker-emergence></a-entity>";
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-plasma-sheet-flapping></a-entity>
      <a-entity stellar-oscillatory-convection-cell></a-entity>`;

if (!html.includes(HTML_ANCHOR)) {
  console.error("HTML anchor not found!");
  process.exit(1);
}
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lines = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 135 injected! Lines: " + lines);
