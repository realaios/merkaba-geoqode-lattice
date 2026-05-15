/**
 * inject-w147.cjs  — Wave 147
 * cosmic-ring-current-injection-plume  + stellar-evershed-reverse-funnel
 */
"use strict";
const fs = require("fs");
const FILE = "public/cosmos-infinite.html";

let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

if (html.includes('registerComponent("cosmic-ring-current-injection-plume"')) {
  console.log("Wave 147 already injected.");
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-ring-current-injection-plume", {
        /* Ring current particle injection — during magnetic storms
           energetic ions are injected from the plasma sheet and drift
           westward around Earth building a ring current at ~3-5 RE;
           hot ions appear as a ring-shaped torus brightening in red
           (protons) and blue (electrons); injected plume fans outward
           from midnight sector; red, orange, blue, purple palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-2200, 800, 2800);
          this.g = g; this.t = 0;

          /* Earth */
          const eGeo = new THREE.SphereGeometry(25, 18, 14);
          const eMat = new THREE.MeshBasicMaterial({ color: 0x112244, transparent: true, opacity: 0.7 });
          g.add(new THREE.Mesh(eGeo, eMat));

          /* Ring current torus */
          const rcGeo = new THREE.TorusGeometry(65, 8, 12, 60);
          const rcMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
          this.rc = new THREE.Mesh(rcGeo, rcMat);
          g.add(this.rc);
          this.rcMat = rcMat;

          /* Electron ring (inner, blue) */
          const erGeo = new THREE.TorusGeometry(55, 5, 10, 60);
          const erMat = new THREE.MeshBasicMaterial({ color: 0x4499ff, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
          this.er = new THREE.Mesh(erGeo, erMat);
          g.add(this.er);
          this.erMat = erMat;

          /* Injection plume from midnight sector (angle PI = midnight) */
          const NINJ = 250;
          const injGeo = new THREE.BufferGeometry();
          const injBuf = new Float32Array(NINJ * 3);
          this.injBuf = injBuf; this.NINJ = NINJ;
          this.injR   = new Float32Array(NINJ);
          this.injPhi = new Float32Array(NINJ);
          this.injZ   = new Float32Array(NINJ);
          this.injVR  = new Float32Array(NINJ);
          this.injVP  = new Float32Array(NINJ);
          for (let i = 0; i < NINJ; i++) {
            this.injR[i]   = 28 + Math.random() * 40;
            this.injPhi[i] = Math.PI + (Math.random() - 0.5) * 1.0;
            this.injZ[i]   = (Math.random() - 0.5) * 20;
            this.injVR[i]  = 15 + Math.random() * 20;
            this.injVP[i]  = -0.3 - Math.random() * 0.2;  /* westward drift */
          }
          injGeo.setAttribute('position', new THREE.BufferAttribute(injBuf, 3));
          const injMat = new THREE.PointsMaterial({ color: 0xff9944, size: 2, transparent: true, opacity: 0.6 });
          g.add(new THREE.Points(injGeo, injMat));
          this.injMat = injMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.z += dt * 0.008;

          const stormOsc = 0.5 + 0.5 * Math.abs(Math.sin(T * 0.15));
          this.rcMat.opacity = 0.2 + stormOsc * 0.35;
          this.erMat.opacity = 0.15 + stormOsc * 0.25;
          this.rc.rotation.z += dt * -0.05;
          this.er.rotation.z += dt * 0.07;

          for (let i = 0; i < this.NINJ; i++) {
            this.injR[i]   += dt * this.injVR[i];
            this.injPhi[i] += dt * this.injVP[i];
            if (this.injR[i] > 72) {
              this.injR[i]   = 28 + Math.random() * 5;
              this.injPhi[i] = Math.PI + (Math.random() - 0.5) * 0.8;
            }
            const px = this.injR[i] * Math.cos(this.injPhi[i]);
            const pz = this.injR[i] * Math.sin(this.injPhi[i]);
            this.injBuf[i * 3]     = px;
            this.injBuf[i * 3 + 1] = this.injZ[i];
            this.injBuf[i * 3 + 2] = pz;
          }
          this.injMat.opacity = 0.45 + stormOsc * 0.25;
        }
      });

      AFRAME.registerComponent("stellar-evershed-reverse-funnel", {
        /* Siphon flow / reverse Evershed flow — in superpenumbra plasma
           drains inward along fibrils at chromospheric heights, opposite
           to the photospheric Evershed outflow; funnel-shaped flow
           converges toward umbra; inward-spiralling cyan fibrils on a
           radial fan; cyan-magenta-gold palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-900, -3800, 1400);
          this.g = g; this.t = 0;

          /* Solar disc base */
          const sunGeo = new THREE.SphereGeometry(50, 20, 16);
          const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa22, transparent: true, opacity: 0.45 });
          g.add(new THREE.Mesh(sunGeo, sunMat));

          /* Umbra */
          const uGeo = new THREE.SphereGeometry(14, 12, 10);
          const uMat = new THREE.MeshBasicMaterial({ color: 0x110000, transparent: true, opacity: 0.9 });
          this.uMesh = new THREE.Mesh(uGeo, uMat);
          this.uMesh.position.y = 48;
          g.add(this.uMesh);

          /* Superpenumbra fibril fan */
          const NFIB = 32;
          this.fibs = [];
          for (let f = 0; f < NFIB; f++) {
            const angle = (f / NFIB) * Math.PI * 2;
            const fib = this._buildFibril(angle);
            this.fibs.push({ line: fib.line, mat: fib.mat, angle, spiralT: 0, baseAngle: angle });
          }

          /* Inward-flowing dots */
          const ND = 300;
          const dGeo = new THREE.BufferGeometry();
          const dBuf = new Float32Array(ND * 3);
          this.dBuf = dBuf; this.ND = ND;
          this.dR   = new Float32Array(ND);
          this.dPhi = new Float32Array(ND);
          this.dVR  = new Float32Array(ND);
          for (let i = 0; i < ND; i++) {
            this.dR[i]   = 16 + Math.random() * 42;
            this.dPhi[i] = Math.random() * Math.PI * 2;
            this.dVR[i]  = -(8 + Math.random() * 12);  /* inward */
          }
          dGeo.setAttribute('position', new THREE.BufferAttribute(dBuf, 3));
          const dMat = new THREE.PointsMaterial({ color: 0x44ffee, size: 1.8, transparent: true, opacity: 0.5 });
          g.add(new THREE.Points(dGeo, dMat));
          this.dMat = dMat;
        },
        _buildFibril(angle) {
          const THREE = AFRAME.THREE;
          const N = 24;
          const pts = [];
          for (let k = 0; k < N; k++) {
            const f = k / (N - 1);
            const r = 58 - f * 44;  /* outer to inner */
            const spiralAngle = angle - f * 0.8;  /* spiral inward */
            pts.push(new THREE.Vector3(r * Math.cos(spiralAngle), 50 + f * 8, r * Math.sin(spiralAngle)));
          }
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          const col = new THREE.Color();
          col.setHSL(0.5 + Math.random() * 0.08, 0.9, 0.65);
          const mat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.45 });
          const line = new THREE.Line(geo, mat);
          this.g.add(line);
          return { line, mat };
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.014;

          /* Fibrils sway gently */
          this.fibs.forEach((f, idx) => {
            f.mat.opacity = 0.35 + 0.15 * Math.abs(Math.sin(T * 0.7 + idx * 0.4));
          });

          /* Inward drift */
          for (let i = 0; i < this.ND; i++) {
            this.dR[i] += dt * this.dVR[i];
            if (this.dR[i] < 14) {
              this.dR[i]   = 55 + Math.random() * 5;
              this.dPhi[i] = Math.random() * Math.PI * 2;
            }
            this.dBuf[i * 3]     = this.dR[i] * Math.cos(this.dPhi[i]);
            this.dBuf[i * 3 + 1] = 50 + (58 - this.dR[i]) / 44 * 8;
            this.dBuf[i * 3 + 2] = this.dR[i] * Math.sin(this.dPhi[i]);
          }
          this.dMat.opacity = 0.4 + 0.15 * Math.abs(Math.sin(T * 1.0));
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) {
  console.error("JS anchor not found!");
  process.exit(1);
}
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR =
  "      <a-entity stellar-umbral-oscillation-beacon></a-entity>";
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-ring-current-injection-plume></a-entity>
      <a-entity stellar-evershed-reverse-funnel></a-entity>`;

if (!html.includes(HTML_ANCHOR)) {
  console.error("HTML anchor not found!");
  process.exit(1);
}
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lines = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 147 injected! Lines: " + lines);
