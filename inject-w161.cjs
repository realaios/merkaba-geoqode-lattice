/**
 * inject-w161.cjs  — Wave 161
 * cosmic-magnetopause-reconnection-x-line + stellar-chromospheric-moreton-wave
 */
"use strict";
const fs = require("fs");
const FILE = "public/cosmos-infinite.html";

let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

if (
  html.includes('registerComponent("cosmic-magnetopause-reconnection-x-line"')
) {
  console.log("Wave 161 already injected.");
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-magnetopause-reconnection-x-line", {
        /* Magnetopause magnetic reconnection X-line — where solar-wind
           and magnetospheric field lines break and re-join at the X-line
           neutral point; produces fast ion jets along the exhaust and an
           electron diffusion region at the centre; X-shaped crossing with
           jets shooting outward along the four lobes; energy release lights
           the tips; orange, yellow, white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(3800, -2200, -5500);
          this.g = g; this.t = 0;

          /* X-line arms — 4 lobes */
          const LOBE = [
            [1, 1, 0], [-1, -1, 0], [1, -1, 0], [-1, 1, 0]
          ];
          this.armMats = [];
          LOBE.forEach((dir) => {
            const NP = 18;
            const pts = [];
            for (let k = 0; k < NP; k++) {
              pts.push(new THREE.Vector3(dir[0] * k * 2.6, dir[1] * k * 2.6, 0));
            }
            const aGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const aMat = new THREE.LineBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.55 });
            g.add(new THREE.Line(aGeo, aMat));
            this.armMats.push(aMat);
          });

          /* Central diffusion region glow */
          const cGeo = new THREE.SphereGeometry(3.5, 10, 8);
          const cMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
          g.add(new THREE.Mesh(cGeo, cMat));
          this.cMat = cMat;

          /* Ion exhaust jets — two opposing bursts */
          const JET_DIR = [[1, 0, 0], [-1, 0, 0]];
          this.jetBufs = [];
          this.jetMats = [];
          JET_DIR.forEach((dir) => {
            const NJ = 80;
            const jGeo = new THREE.BufferGeometry();
            const jBuf = new Float32Array(NJ * 3);
            for (let i = 0; i < NJ; i++) {
              const spread = 4 + Math.random() * 8;
              jBuf[i * 3]     = dir[0] * spread;
              jBuf[i * 3 + 1] = (Math.random() - 0.5) * 12;
              jBuf[i * 3 + 2] = (Math.random() - 0.5) * 12;
            }
            jGeo.setAttribute('position', new THREE.BufferAttribute(jBuf, 3));
            const jMat = new THREE.PointsMaterial({ color: 0xffee55, size: 1.2, transparent: true, opacity: 0.5 });
            g.add(new THREE.Points(jGeo, jMat));
            this.jetBufs.push(jBuf);
            this.jetMats.push(jMat);
          });

          /* Field line arcs — incoming and outgoing */
          const ARC_COLORS = [0xff6600, 0x4477ff];
          this.arcMats = [];
          ARC_COLORS.forEach((col, ci) => {
            const NARC = 5;
            for (let a = 0; a < NARC; a++) {
              const ARC = 20;
              const pts = [];
              const yOff = (a - 2) * 7;
              for (let k = 0; k < ARC; k++) {
                const ang = ((k / (ARC - 1)) - 0.5) * Math.PI;
                const r   = 22 + a * 3;
                const xS  = (ci === 0 ? 1 : -1);
                pts.push(new THREE.Vector3(xS * r * Math.cos(ang), yOff + r * Math.sin(ang) * 0.4, 0));
              }
              const fGeo = new THREE.BufferGeometry().setFromPoints(pts);
              const fMat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.18 });
              g.add(new THREE.Line(fGeo, fMat));
              this.arcMats.push(fMat);
            }
          });
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.z += dt * 0.008;

          /* Arm pulse */
          this.armMats.forEach((m, i) => {
            m.opacity = 0.35 + 0.25 * Math.abs(Math.sin(T * 1.3 + i * 0.8));
          });

          /* Central flash */
          this.cMat.opacity = 0.5 + 0.4 * Math.abs(Math.sin(T * 2.2));

          /* Jets ripple outward */
          this.jetBufs.forEach((buf, ji) => {
            const NJ = buf.length / 3;
            const dir = ji === 0 ? 1 : -1;
            for (let i = 0; i < NJ; i++) {
              buf[i * 3] += dir * (0.04 + Math.random() * 0.03);
              if (Math.abs(buf[i * 3]) > 28) buf[i * 3] = dir * (4 + Math.random() * 4);
            }
            this.jetMats[ji].opacity = 0.3 + 0.22 * Math.abs(Math.sin(T * 1.6 + ji));
          });

          /* Arc field lines breathe */
          this.arcMats.forEach((m, i) => {
            m.opacity = 0.10 + 0.10 * Math.abs(Math.sin(T * 0.7 + i * 0.3));
          });
        }
      });

      AFRAME.registerComponent("stellar-chromospheric-moreton-wave", {
        /* Moreton wave — a chromospheric disturbance visible in H-alpha
           sweeping across the solar disk after a large flare; it is the
           imprint of a coronal EIT/EUV wave pressing down on the
           chromosphere; a bright concentric arc expands rapidly from the
           flare site; crimson solar disc, bright-pink arc, white flare
           core; crimson, bright-pink, white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-4200, 3800, 3200);
          this.g = g; this.t = 0;

          /* Solar disc */
          const dGeo = new THREE.SphereGeometry(18, 16, 14);
          const dMat = new THREE.MeshBasicMaterial({ color: 0x880011, transparent: true, opacity: 0.75 });
          g.add(new THREE.Mesh(dGeo, dMat));
          this.dMat = dMat;

          /* Flare core */
          const fGeo = new THREE.SphereGeometry(2.5, 8, 6);
          const fMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
          const flare = new THREE.Mesh(fGeo, fMat);
          flare.position.set(10, 8, 0);
          g.add(flare);
          this.fMat = fMat;

          /* Expanding wave arcs — two simultaneous waves at different phases */
          const NWAVE = 2;
          this.waves = [];
          for (let w = 0; w < NWAVE; w++) {
            const NARC = 36;
            const pts  = [];
            for (let k = 0; k < NARC; k++) {
              const ang = (k / (NARC - 1)) * Math.PI;
              pts.push(new THREE.Vector3(Math.cos(ang), Math.sin(ang), 0));
            }
            const wGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const wMat = new THREE.LineBasicMaterial({
              color: w === 0 ? 0xff44aa : 0xff8866,
              transparent: true, opacity: 0
            });
            const line = new THREE.Line(wGeo, wMat);
            line.position.set(10, 8, 0);
            g.add(line);
            this.waves.push({ line, mat: wMat, phase: w * 0.5 });
          }

          /* Chromospheric brightening particles behind the wave */
          const NB = 120;
          const bGeo = new THREE.BufferGeometry();
          const bBuf = new Float32Array(NB * 3);
          this.bBuf = bBuf; this.NB = NB;
          this.bAge = new Float32Array(NB);
          this.bPh  = new Float32Array(NB);
          for (let i = 0; i < NB; i++) {
            this.bAge[i] = Math.random();
            this.bPh[i]  = Math.random() * Math.PI;
          }
          bGeo.setAttribute('position', new THREE.BufferAttribute(bBuf, 3));
          const bMat = new THREE.PointsMaterial({ color: 0xff66bb, size: 0.9, transparent: true, opacity: 0.45 });
          g.add(new THREE.Points(bGeo, bMat));
          this.bMat = bMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.005;

          /* Flare pulse */
          this.fMat.opacity = 0.6 + 0.38 * Math.abs(Math.sin(T * 3.0));

          /* Wave arcs expand from flare site */
          const PERIOD = 5.0;
          this.waves.forEach((w) => {
            const localT = ((T / PERIOD + w.phase) % 1.0);
            const scale  = 2 + localT * 26;
            w.line.scale.set(scale, scale, 1);
            const fade   = localT < 0.15 ? localT / 0.15 : 1 - (localT - 0.15) / 0.85;
            w.mat.opacity = Math.max(0, fade) * 0.8;
          });

          /* Brightening particles trail the wave front */
          const WR = ((T / PERIOD) % 1.0);
          const frontR = 2 + WR * 26;
          for (let i = 0; i < this.NB; i++) {
            this.bAge[i] += dt * 0.2;
            if (this.bAge[i] > 1) { this.bAge[i] = 0; this.bPh[i] = Math.random() * Math.PI; }
            const r = frontR * (0.7 + this.bAge[i] * 0.35);
            const ang = this.bPh[i];
            this.bBuf[i * 3]     = 10 + r * Math.cos(ang);
            this.bBuf[i * 3 + 1] = 8  + r * Math.sin(ang);
            this.bBuf[i * 3 + 2] = (Math.random() - 0.5) * 2;
          }
          this.bMat.opacity = 0.3 + 0.18 * Math.abs(Math.sin(T * 1.1));
          this.dMat.opacity = 0.65 + 0.12 * Math.abs(Math.sin(T * 0.4));
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) {
  console.error("JS anchor not found!");
  process.exit(1);
}
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR =
  "      <a-entity stellar-sunspot-decay-moat-flow></a-entity>";
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-magnetopause-reconnection-x-line></a-entity>
      <a-entity stellar-chromospheric-moreton-wave></a-entity>`;

if (!html.includes(HTML_ANCHOR)) {
  console.error("HTML anchor not found!");
  process.exit(1);
}
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lines = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 161 injected! Lines: " + lines);
