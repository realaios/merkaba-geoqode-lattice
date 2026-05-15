/**
 * inject-w129.cjs  — Wave 129
 * cosmic-plasma-interchange-instability  + stellar-coronal-hole-plume
 */
"use strict";
const fs = require("fs");
const FILE = "public/cosmos-infinite.html";

let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

if (
  html.includes('registerComponent("cosmic-plasma-interchange-instability"')
) {
  console.log("Wave 129 already injected.");
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-plasma-interchange-instability", {
        /* Plasma interchange instability — in magnetospheres with
           rotating plasma (e.g., Jupiter); dense plasma "fingers"
           exchange places with tenuous outer flux tubes;
           outward spikes + inward tentacles, purple-violet palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(300, 600, 1400);
          this.g = g; this.t = 0;

          /* Inner dense ring (rotating with magnetosphere) */
          const innerGeo = new THREE.TorusGeometry(50, 5, 12, 60);
          const innerMat = new THREE.MeshBasicMaterial({ color: 0x9944ff, transparent: true, opacity: 0.6, wireframe: true });
          const inner = new THREE.Mesh(innerGeo, innerMat);
          inner.rotation.x = Math.PI * 0.5;
          g.add(inner);
          this.innerRing = inner;

          /* Outer tenuous ring */
          const outerGeo = new THREE.TorusGeometry(110, 4, 12, 60);
          const outerMat = new THREE.MeshBasicMaterial({ color: 0x6622cc, transparent: true, opacity: 0.3, wireframe: true });
          const outer = new THREE.Mesh(outerGeo, outerMat);
          outer.rotation.x = Math.PI * 0.5;
          g.add(outer);
          this.outerRing = outer;

          /* Interchange "fingers" — outward dense spikes */
          this.fingers = [];
          const NFIN = 8;
          for (let i = 0; i < NFIN; i++) {
            const phi0 = (i / NFIN) * Math.PI * 2;
            const fGeo = new THREE.BufferGeometry();
            const pts = [];
            const steps = 10;
            for (let s = 0; s <= steps; s++) {
              const r = 50 + (s / steps) * 70;
              pts.push(r * Math.cos(phi0), 0, r * Math.sin(phi0));
            }
            fGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
            const fMat = new THREE.LineBasicMaterial({ color: 0xcc88ff, transparent: true, opacity: 0.8 });
            const line = new THREE.Line(fGeo, fMat);
            g.add(line);
            this.fingers.push({ line, phi0, buf: fGeo.attributes.position.array, geo: fGeo, mat: fMat, phaseOff: i * (Math.PI * 2 / NFIN) });
          }

          /* Inward tentacles (tenuous plasma moving inward) */
          this.tentacles = [];
          for (let i = 0; i < NFIN; i++) {
            const phi0 = ((i + 0.5) / NFIN) * Math.PI * 2;
            const tGeo = new THREE.BufferGeometry();
            const pts = [];
            const steps = 10;
            for (let s = 0; s <= steps; s++) {
              const r = 110 - (s / steps) * 70;
              pts.push(r * Math.cos(phi0), 0, r * Math.sin(phi0));
            }
            tGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
            const tMat = new THREE.LineBasicMaterial({ color: 0x4400aa, transparent: true, opacity: 0.55 });
            const line = new THREE.Line(tGeo, tMat);
            g.add(line);
            this.tentacles.push({ line, phi0, buf: tGeo.attributes.position.array, geo: tGeo, mat: tMat, phaseOff: i * (Math.PI * 2 / NFIN) });
          }

          /* Particle spray at fingertips */
          const N = 200;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          for (let i = 0; i < N; i++) {
            const phi = Math.random() * Math.PI * 2;
            const r = 110 + Math.random() * 30;
            ptBuf[i * 3]     = r * Math.cos(phi);
            ptBuf[i * 3 + 1] = (Math.random() - 0.5) * 20;
            ptBuf[i * 3 + 2] = r * Math.sin(phi);
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xee99ff, size: 2.5, transparent: true, opacity: 0.6 });
          this.spray = new THREE.Points(ptGeo, ptMat);
          g.add(this.spray);
          this.ptMat = ptMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.06;
          this.innerRing.rotation.z = T * 0.9;
          this.outerRing.rotation.z = T * 0.35;

          /* Fingers grow/shrink outward with instability oscillation */
          this.fingers.forEach((f, idx) => {
            const phase = T * 1.2 + f.phaseOff;
            const amp = 0.6 + 0.4 * Math.sin(phase);
            const steps = 10;
            for (let s = 0; s <= steps; s++) {
              const r = 50 + (s / steps) * 70 * amp;
              const phi = f.phi0 + 0.15 * Math.sin(phase + s * 0.5);
              f.buf[s * 3]     = r * Math.cos(phi);
              f.buf[s * 3 + 2] = r * Math.sin(phi);
            }
            f.geo.attributes.position.needsUpdate = true;
            f.mat.opacity = 0.5 + 0.3 * Math.sin(phase * 1.5);
          });

          /* Tentacles shrink/grow inward */
          this.tentacles.forEach((t) => {
            const phase = T * 1.1 + t.phaseOff + Math.PI;
            const amp = 0.6 + 0.4 * Math.sin(phase);
            const steps = 10;
            for (let s = 0; s <= steps; s++) {
              const r = 110 - (s / steps) * 70 * amp;
              const phi = t.phi0 + 0.12 * Math.sin(phase + s * 0.5);
              t.buf[s * 3]     = r * Math.cos(phi);
              t.buf[s * 3 + 2] = r * Math.sin(phi);
            }
            t.geo.attributes.position.needsUpdate = true;
            t.mat.opacity = 0.3 + 0.25 * Math.sin(phase * 1.4);
          });

          this.spray.rotation.y = T * 0.5;
          this.ptMat.opacity = 0.4 + 0.25 * Math.sin(T * 2.1);
        }
      });

      AFRAME.registerComponent("stellar-coronal-hole-plume", {
        /* Coronal hole plume — bright, narrow, nearly radial
           plasma column rooted in a coronal hole; fast solar wind
           source; warm white-yellow core with fanning plume */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-500, -600, -1300);
          this.g = g; this.t = 0;

          /* Coronal hole base — dark circle */
          const holeGeo = new THREE.CircleGeometry(30, 36);
          const holeMat = new THREE.MeshBasicMaterial({ color: 0x050515, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
          const hole = new THREE.Mesh(holeGeo, holeMat);
          hole.rotation.x = -Math.PI * 0.5;
          g.add(hole);

          /* Plume column — tapered cylinder upward */
          const plumeGeo = new THREE.CylinderGeometry(10, 28, 280, 12, 6, true);
          const plumeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, wireframe: true, side: THREE.DoubleSide });
          const plume = new THREE.Mesh(plumeGeo, plumeMat);
          plume.position.y = 140;
          g.add(plume);
          this.plumeMat = plumeMat;

          /* Inner bright core */
          const coreGeo = new THREE.CylinderGeometry(4, 14, 280, 8, 1, true);
          const coreMat = new THREE.MeshBasicMaterial({ color: 0xffeeaa, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
          const core = new THREE.Mesh(coreGeo, coreMat);
          core.position.y = 140;
          g.add(core);
          this.coreMat = coreMat;

          /* Streaming particles (fast solar wind) */
          const N = 150;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          this.streamY = new Float32Array(N);
          this.streamR = new Float32Array(N);
          this.streamPhi = new Float32Array(N);
          for (let i = 0; i < N; i++) {
            this.streamY[i]   = Math.random() * 280;
            this.streamR[i]   = (this.streamY[i] / 280) * 14 * Math.random();
            this.streamPhi[i] = Math.random() * Math.PI * 2;
            ptBuf[i * 3]     = this.streamR[i] * Math.cos(this.streamPhi[i]);
            ptBuf[i * 3 + 1] = this.streamY[i];
            ptBuf[i * 3 + 2] = this.streamR[i] * Math.sin(this.streamPhi[i]);
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xffffcc, size: 2.0, transparent: true, opacity: 0.7 });
          this.stream = new THREE.Points(ptGeo, ptMat);
          g.add(this.stream);
          this.ptBuf = ptBuf; this.ptMat = ptMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.018;

          /* Stream particles accelerate upward (fast wind) */
          const N = this.streamY.length;
          for (let i = 0; i < N; i++) {
            this.streamY[i] += dt * (80 + (this.streamY[i] / 280) * 80);
            if (this.streamY[i] > 280) { this.streamY[i] = 0; this.streamPhi[i] = Math.random() * Math.PI * 2; }
            const r = (this.streamY[i] / 280) * 14;
            this.ptBuf[i * 3]     = r * Math.cos(this.streamPhi[i]);
            this.ptBuf[i * 3 + 1] = this.streamY[i];
            this.ptBuf[i * 3 + 2] = r * Math.sin(this.streamPhi[i]);
          }
          this.stream.geometry.attributes.position.needsUpdate = true;

          this.plumeMat.opacity = 0.12 + 0.08 * Math.sin(T * 1.6);
          this.coreMat.opacity  = 0.35 + 0.15 * Math.sin(T * 2.2);
          this.ptMat.opacity    = 0.55 + 0.2 * Math.sin(T * 1.9);
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) {
  console.error("JS anchor not found!");
  process.exit(1);
}
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = "      <a-entity stellar-sunspot-moat-flow></a-entity>";
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-plasma-interchange-instability></a-entity>
      <a-entity stellar-coronal-hole-plume></a-entity>`;

if (!html.includes(HTML_ANCHOR)) {
  console.error("HTML anchor not found!");
  process.exit(1);
}
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lines = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 129 injected! Lines: " + lines);
