/**
 * inject-w143.cjs  — Wave 143
 * cosmic-van-allen-proton-belt  + stellar-penumbra-counter-evershed
 */
"use strict";
const fs = require("fs");
const FILE = "public/cosmos-infinite.html";

let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

if (html.includes('registerComponent("cosmic-van-allen-proton-belt"')) {
  console.log("Wave 143 already injected.");
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-van-allen-proton-belt", {
        /* Inner Van Allen proton belt (L~1.5) — high-energy protons
           trapped in Earth's inner radiation belt; bounce-drift motion
           along field lines from pole to pole while drifting westward;
           compact, intense ring; amber-white with field-line cage;
           amber, white, blue palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-1400, 700, 3200);
          this.g = g; this.t = 0;

          /* Earth globe */
          const eGeo = new THREE.SphereGeometry(32, 24, 16);
          const eMat = new THREE.MeshBasicMaterial({ color: 0x113399, transparent: true, opacity: 0.5 });
          g.add(new THREE.Mesh(eGeo, eMat));

          /* Inner belt torus L~1.5 */
          const btGeo = new THREE.TorusGeometry(50, 9, 14, 60);
          btGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.22, 1));
          const btMat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.4 });
          this.belt = new THREE.Mesh(btGeo, btMat);
          g.add(this.belt);
          this.btMat = btMat;

          /* Dipole field line cage — 8 meridian loops */
          const NL = 8;
          for (let l = 0; l < NL; l++) {
            const phi = (l / NL) * Math.PI * 2;
            const N = 50;
            const pts = [];
            for (let k = 0; k < N; k++) {
              const theta = (k / (N - 1)) * Math.PI;
              const sinT = Math.sin(theta);
              const r = 50 * sinT * sinT;
              pts.push(new THREE.Vector3(
                r * sinT * Math.cos(phi),
                r * Math.cos(theta),
                r * sinT * Math.sin(phi)
              ));
            }
            const lGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const lMat = new THREE.LineBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0.18 });
            g.add(new THREE.Line(lGeo, lMat));
          }

          /* Bouncing protons */
          const NP = 250;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(NP * 3);
          this.ptPhi   = new Float32Array(NP);    /* drift longitude */
          this.ptLat   = new Float32Array(NP);    /* bounce latitude −1..1 */
          this.ptLatDir = new Int8Array(NP);       /* bounce direction */
          this.ptBounceSpd = new Float32Array(NP);
          this.ptDriftSpd  = new Float32Array(NP);
          for (let i = 0; i < NP; i++) {
            this.ptPhi[i]       = Math.random() * Math.PI * 2;
            this.ptLat[i]       = (Math.random() - 0.5) * 2;
            this.ptLatDir[i]    = Math.random() > 0.5 ? 1 : -1;
            this.ptBounceSpd[i] = 1.0 + Math.random() * 1.5;
            this.ptDriftSpd[i]  = -0.12 - Math.random() * 0.08; /* westward */
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xffd060, size: 2.0, transparent: true, opacity: 0.7 });
          g.add(new THREE.Points(ptGeo, ptMat));
          this.ptBuf = ptBuf; this.ptMat = ptMat; this.NP = NP;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.01;
          this.btMat.opacity = 0.3 + 0.12 * Math.sin(T * 1.3);

          for (let i = 0; i < this.NP; i++) {
            /* Bounce: lat oscillates −1..1 */
            this.ptLat[i] += dt * this.ptBounceSpd[i] * this.ptLatDir[i];
            if (Math.abs(this.ptLat[i]) >= 1) {
              this.ptLatDir[i] *= -1;
              this.ptLat[i] = Math.max(-1, Math.min(1, this.ptLat[i]));
            }
            /* Westward drift */
            this.ptPhi[i] += dt * this.ptDriftSpd[i];

            /* Map lat+phi to dipole shell r=L*sin²θ with L=1.5 */
            const lat = this.ptLat[i];
            const theta = Math.acos(lat);
            const sinT = Math.sin(theta);
            const L = 1.52;
            const r = 32 * L * sinT * sinT;
            this.ptBuf[i * 3]     = r * sinT * Math.cos(this.ptPhi[i]);
            this.ptBuf[i * 3 + 1] = r * lat;
            this.ptBuf[i * 3 + 2] = r * sinT * Math.sin(this.ptPhi[i]);
          }
          this.ptMat.opacity = 0.55 + 0.15 * Math.abs(Math.sin(T * 1.0));
        }
      });

      AFRAME.registerComponent("stellar-penumbra-counter-evershed", {
        /* Counter-Evershed flow — at high atmospheric levels above a
           sunspot penumbra the flow REVERSES relative to the surface
           Evershed flow; seen in Ca II chromospheric observations;
           flows converge toward the umbra at higher heights;
           creates inward-spiralling chromospheric fibrils;
           purple-rose-gold palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(3800, 2200, 400);
          this.g = g; this.t = 0;

          /* Sunspot dark umbra */
          const umbGeo = new THREE.CircleGeometry(22, 32);
          const umbMat = new THREE.MeshBasicMaterial({ color: 0x330011, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
          const umb = new THREE.Mesh(umbGeo, umbMat);
          umb.rotation.x = -Math.PI / 2;
          g.add(umb);

          /* Penumbra — reddish ring */
          const penGeo = new THREE.RingGeometry(22, 60, 40);
          const penMat = new THREE.MeshBasicMaterial({ color: 0x992244, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
          const pen = new THREE.Mesh(penGeo, penMat);
          pen.rotation.x = -Math.PI / 2;
          g.add(pen);
          this.penMat = penMat;

          /* Chromospheric fibril height layer */
          const chGeo = new THREE.CircleGeometry(80, 40);
          const chMat = new THREE.MeshBasicMaterial({ color: 0xcc66aa, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
          const ch = new THREE.Mesh(chGeo, chMat);
          ch.rotation.x = -Math.PI / 2;
          ch.position.y = 18;
          g.add(ch);
          this.chMat = chMat;

          /* Inward-spiralling fibril particles (counter-Evershed) */
          const NF = 350;
          const fGeo = new THREE.BufferGeometry();
          const fBuf = new Float32Array(NF * 3);
          this.fPhi  = new Float32Array(NF);
          this.fR    = new Float32Array(NF);
          this.fSpd  = new Float32Array(NF);
          this.fOmega= new Float32Array(NF);
          for (let i = 0; i < NF; i++) {
            this.fPhi[i]  = Math.random() * Math.PI * 2;
            this.fR[i]    = 26 + Math.random() * 52;
            this.fSpd[i]  = 4 + Math.random() * 8;   /* inward speed */
            this.fOmega[i]= (Math.random() - 0.5) * 0.8;
          }
          fGeo.setAttribute('position', new THREE.BufferAttribute(fBuf, 3));
          const fMat = new THREE.PointsMaterial({ color: 0xff99cc, size: 2.0, transparent: true, opacity: 0.65 });
          g.add(new THREE.Points(fGeo, fMat));
          this.fBuf = fBuf; this.fMat = fMat; this.NF = NF;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.009;
          this.penMat.opacity = 0.4 + 0.12 * Math.sin(T * 0.9);
          this.chMat.opacity  = 0.1 + 0.08 * Math.abs(Math.sin(T * 1.2));

          /* Inward spiralling fibrils */
          for (let i = 0; i < this.NF; i++) {
            /* Move inward */
            this.fR[i] -= dt * this.fSpd[i];
            if (this.fR[i] < 24) {
              /* Respawn at outer edge */
              this.fR[i]    = 70 + Math.random() * 12;
              this.fPhi[i]  = Math.random() * Math.PI * 2;
            }
            /* Slow inward spiral rotation */
            this.fPhi[i] += dt * this.fOmega[i];
            this.fBuf[i * 3]     = this.fR[i] * Math.cos(this.fPhi[i]);
            this.fBuf[i * 3 + 1] = 18;
            this.fBuf[i * 3 + 2] = this.fR[i] * Math.sin(this.fPhi[i]);
          }
          this.fMat.opacity = 0.5 + 0.18 * Math.abs(Math.sin(T * 1.5));
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) {
  console.error("JS anchor not found!");
  process.exit(1);
}
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = "      <a-entity stellar-umbral-dot-emergence></a-entity>";
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-van-allen-proton-belt></a-entity>
      <a-entity stellar-penumbra-counter-evershed></a-entity>`;

if (!html.includes(HTML_ANCHOR)) {
  console.error("HTML anchor not found!");
  process.exit(1);
}
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lines = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 143 injected! Lines: " + lines);
