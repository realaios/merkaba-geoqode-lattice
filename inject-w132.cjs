/**
 * inject-w132.cjs  — Wave 132
 * cosmic-magnetopause-kelvin-cat-eye  + stellar-rsp-oscillation-plume
 */
"use strict";
const fs = require("fs");
const FILE = "public/cosmos-infinite.html";

let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

if (html.includes('registerComponent("cosmic-magnetopause-kelvin-cat-eye"')) {
  console.log("Wave 132 already injected.");
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-magnetopause-kelvin-cat-eye", {
        /* Kelvin-Helmholtz cat-eye vortices rolling along the
           magnetopause where the solar wind shears past the
           magnetosphere; spiral vortex rolls in the x-z plane;
           green-teal palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(600, 1200, -800);
          this.g = g; this.t = 0;

          /* Main interface layer — thin horizontal sheet */
          const sheetGeo = new THREE.PlaneGeometry(420, 50, 42, 5);
          const sheetMat = new THREE.MeshBasicMaterial({ color: 0x003322, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(sheetGeo, sheetMat));
          this.sheetMat = sheetMat;

          /* Cat-eye vortex rings — circles in the x-y plane along interface */
          const NVOR = 6;
          this.vortices = [];
          for (let v = 0; v < NVOR; v++) {
            const cx = -180 + v * 72;
            const vGrp = new THREE.Group();
            vGrp.position.set(cx, 0, 0);
            g.add(vGrp);
            /* Spiral arms of the cat-eye */
            const armCount = 36;
            const arm = [];
            for (let a = 0; a < armCount; a++) {
              const theta = (a / armCount) * Math.PI * 2;
              const rad   = 12 + a * 0.5;
              const pGeo  = new THREE.SphereGeometry(2.5, 6, 4);
              const hue   = 0.44 + a * 0.003;
              const col   = new THREE.Color();
              col.setHSL(hue, 0.85, 0.48);
              const pMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7 });
              const p = new THREE.Mesh(pGeo, pMat);
              p.position.set(rad * Math.cos(theta), rad * Math.sin(theta), 0);
              vGrp.add(p);
              arm.push({ mesh: p, theta0: theta, mat: pMat });
            }
            this.vortices.push({ grp: vGrp, arm, phase: v * 0.9, dir: v % 2 === 0 ? 1 : -1 });
          }

          /* Trailing streaks upstream/downstream of each vortex */
          const streakCount = 60;
          this.streaks = [];
          for (let s = 0; s < streakCount; s++) {
            const sGeo = new THREE.BufferGeometry();
            sGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
            const sMat = new THREE.LineBasicMaterial({ color: 0x22ffaa, transparent: true, opacity: 0.3 });
            g.add(new THREE.Line(sGeo, sMat));
            this.streaks.push({
              geo: sGeo, mat: sMat, buf: sGeo.attributes.position.array,
              x0: (Math.random() - 0.5) * 400, y0: (Math.random() - 0.5) * 40,
              speed: 30 + Math.random() * 30, phase: Math.random() * Math.PI * 2
            });
          }

          /* Particle cloud entrained in vortex */
          const N = 220;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          this.ptAngle = new Float32Array(N);
          this.ptVor   = new Uint8Array(N);
          this.ptRad   = new Float32Array(N);
          for (let i = 0; i < N; i++) {
            this.ptAngle[i] = Math.random() * Math.PI * 2;
            this.ptVor[i]   = Math.floor(Math.random() * 6);
            this.ptRad[i]   = 6 + Math.random() * 24;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0x55ffcc, size: 2.0, transparent: true, opacity: 0.45 });
          this.pts = new THREE.Points(ptGeo, ptMat);
          g.add(this.pts);
          this.ptBuf = ptBuf; this.ptMat = ptMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.x += dt * 0.008;

          /* Vortices roll along interface */
          this.vortices.forEach((vor) => {
            const omega = 0.55 * vor.dir;
            vor.grp.rotation.z += dt * omega;
            vor.arm.forEach((a) => {
              a.mat.opacity = 0.4 + 0.4 * Math.abs(Math.cos(a.theta0 + vor.grp.rotation.z));
            });
          });

          /* Streaks advect downstream then wrap */
          this.streaks.forEach((s) => {
            s.x0 += dt * s.speed;
            if (s.x0 > 220) s.x0 = -220;
            const yWave = 12 * Math.sin(s.x0 * 0.025 - T * 3.2 + s.phase);
            s.buf[0] = s.x0;     s.buf[1] = s.y0 + yWave;     s.buf[2] = 0;
            s.buf[3] = s.x0 - 28; s.buf[4] = s.y0 + yWave * 0.6; s.buf[5] = 0;
            s.geo.attributes.position.needsUpdate = true;
            s.mat.opacity = 0.15 + 0.2 * Math.abs(Math.sin(s.x0 * 0.018 + T * 1.5));
          });

          /* Particles orbit their vortex */
          const N = this.ptAngle.length;
          for (let i = 0; i < N; i++) {
            const v = this.ptVor[i];
            this.ptAngle[i] += dt * (0.7 + 0.3 * Math.sin(T + v)) * this.vortices[v].dir;
            const cx = -180 + v * 72;
            const r  = this.ptRad[i];
            this.ptBuf[i * 3]     = cx + r * Math.cos(this.ptAngle[i]);
            this.ptBuf[i * 3 + 1] = r * Math.sin(this.ptAngle[i]);
            this.ptBuf[i * 3 + 2] = (Math.random() - 0.5) * 8;
          }
          this.pts.geometry.attributes.position.needsUpdate = true;
          this.ptMat.opacity = 0.35 + 0.15 * Math.sin(T * 2.1);
          this.sheetMat.opacity = 0.12 + 0.08 * Math.sin(T * 1.4);
        }
      });

      AFRAME.registerComponent("stellar-rsp-oscillation-plume", {
        /* Rapidly-oscillating Ap (roAp) star — RSP standing acoustic
           pulsation; vertical plumes pulsate with short period ~6-12 min;
           magnetic poles emit brightening pillars alternately;
           violet-indigo-white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-1600, 500, -300);
          this.g = g; this.t = 0;

          /* Star body */
          const sGeo = new THREE.SphereGeometry(55, 32, 24);
          const sMat = new THREE.MeshBasicMaterial({ color: 0xddccff, transparent: true, opacity: 0.85 });
          g.add(new THREE.Mesh(sGeo, sMat));
          this.sMat = sMat;

          /* Magnetic poles at top and bottom */
          const pGeo = new THREE.SphereGeometry(12, 16, 12);
          const pMatN = new THREE.MeshBasicMaterial({ color: 0xaaaaff, transparent: true, opacity: 0.9 });
          const pMatS = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
          this.poleN = new THREE.Mesh(pGeo, pMatN);
          this.poleS = new THREE.Mesh(pGeo, pMatS);
          this.poleN.position.set(0, 55, 0);
          this.poleS.position.set(0, -55, 0);
          g.add(this.poleN); g.add(this.poleS);
          this.pMatN = pMatN; this.pMatS = pMatS;

          /* Pulsation plume rings — stacked rings that scale in/out */
          const NRINGS = 8;
          this.ringsN = []; this.ringsS = [];
          for (let r = 0; r < NRINGS; r++) {
            const rGeo = new THREE.TorusGeometry(16 + r * 10, 2, 8, 24);
            const rMatN = new THREE.MeshBasicMaterial({ color: 0xccaaff, transparent: true, opacity: 0.0 });
            const rMatS = new THREE.MeshBasicMaterial({ color: 0xeeeeff, transparent: true, opacity: 0.0 });
            const rN = new THREE.Mesh(rGeo, rMatN);
            const rS = new THREE.Mesh(rGeo.clone(), rMatS);
            rN.position.set(0, 55 + 15 + r * 14, 0);
            rS.position.set(0, -55 - 15 - r * 14, 0);
            rN.rotation.x = Math.PI / 2; rS.rotation.x = Math.PI / 2;
            g.add(rN); g.add(rS);
            this.ringsN.push({ mesh: rN, mat: rMatN, i: r });
            this.ringsS.push({ mesh: rS, mat: rMatS, i: r });
          }

          /* Particles pulsing upward from pole N */
          const N = 120;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          this.ptY  = new Float32Array(N);
          this.ptR  = new Float32Array(N);
          this.ptPhi = new Float32Array(N);
          this.ptDir = new Int8Array(N);
          for (let i = 0; i < N; i++) {
            this.ptY[i]   = Math.random() * 120;
            this.ptR[i]   = Math.random() * 14;
            this.ptPhi[i] = Math.random() * Math.PI * 2;
            this.ptDir[i] = i < N / 2 ? 1 : -1;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xddbbff, size: 2.5, transparent: true, opacity: 0.55 });
          this.pts = new THREE.Points(ptGeo, ptMat);
          g.add(this.pts);
          this.ptBuf = ptBuf; this.ptMat = ptMat; this.N = N;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.06;

          /* roAp pulsation period ~0.08 (fast) */
          const pulse = Math.sin(T * 12.0);
          const pulseN =  pulse;
          const pulseS = -pulse; /* anti-phase at opposite pole */

          /* Pole brightness */
          this.pMatN.opacity = 0.6 + 0.35 * Math.max(0, pulseN);
          this.pMatS.opacity = 0.6 + 0.35 * Math.max(0, pulseS);

          /* Rings scale with pulsation */
          this.ringsN.forEach((r) => {
            const delay = r.i * 0.35;
            const p = Math.max(0, Math.sin(T * 12.0 - delay));
            r.mat.opacity = p * 0.55;
            const sc = 1 + 0.12 * p;
            r.mesh.scale.set(sc, sc, sc);
          });
          this.ringsS.forEach((r) => {
            const delay = r.i * 0.35;
            const p = Math.max(0, Math.sin(T * 12.0 + Math.PI - delay));
            r.mat.opacity = p * 0.55;
            const sc = 1 + 0.12 * p;
            r.mesh.scale.set(sc, sc, sc);
          });

          /* Particles stream from both poles */
          for (let i = 0; i < this.N; i++) {
            const spd = 35 + 25 * Math.abs(Math.sin(T * 12.0));
            this.ptY[i] += dt * spd * this.ptDir[i];
            const maxY = 190;
            if (this.ptY[i] > maxY) { this.ptY[i] = 55; this.ptR[i] = Math.random() * 12; }
            if (this.ptY[i] < -maxY){ this.ptY[i] = -55; this.ptR[i] = Math.random() * 12; }
            const sign = this.ptDir[i];
            const r = this.ptR[i] * (1 - (Math.abs(this.ptY[i]) - 55) / 140);
            const yAbs = Math.max(55, Math.abs(this.ptY[i]));
            this.ptBuf[i * 3]     = r * Math.cos(this.ptPhi[i]);
            this.ptBuf[i * 3 + 1] = sign * yAbs;
            this.ptBuf[i * 3 + 2] = r * Math.sin(this.ptPhi[i]);
          }
          this.pts.geometry.attributes.position.needsUpdate = true;
          this.ptMat.opacity = 0.4 + 0.2 * Math.abs(pulse);
          this.sMat.opacity  = 0.7 + 0.15 * Math.abs(pulse);
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) {
  console.error("JS anchor not found!");
  process.exit(1);
}
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR =
  "      <a-entity stellar-penumbral-fibril-migration></a-entity>";
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-magnetopause-kelvin-cat-eye></a-entity>
      <a-entity stellar-rsp-oscillation-plume></a-entity>`;

if (!html.includes(HTML_ANCHOR)) {
  console.error("HTML anchor not found!");
  process.exit(1);
}
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lines = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 132 injected! Lines: " + lines);
