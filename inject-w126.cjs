/**
 * inject-w126.cjs  — Wave 126
 * cosmic-drift-alfven-wave  + stellar-penumbral-wave-train
 */
"use strict";
const fs = require("fs");
const FILE = "public/cosmos-infinite.html";

let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

if (html.includes('registerComponent("cosmic-drift-alfven-wave"')) {
  console.log("Wave 126 already injected.");
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-drift-alfven-wave", {
        /* Drift-Alfven wave — low-frequency wave in magnetosphere;
           counter-streaming electrons + ions create a rotating spiral
           wave pattern; field-aligned phase fronts propagate along B */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(600, 500, 1200);
          this.g = g; this.t = 0;

          /* Field-aligned tube (B-field direction) */
          const tubeGeo = new THREE.CylinderGeometry(2, 2, 400, 8);
          const tubeMat = new THREE.MeshBasicMaterial({ color: 0x3355ff, transparent: true, opacity: 0.3 });
          const tube = new THREE.Mesh(tubeGeo, tubeMat);
          g.add(tube);

          /* Rotating spiral phase fronts — 6 flat disk rings tilted and rotating */
          this.fronts = [];
          for (let i = 0; i < 6; i++) {
            const diskGeo = new THREE.TorusGeometry(38 + i * 8, 2.5, 8, 48);
            const c = new THREE.Color();
            c.setHSL(0.62 + i * 0.04, 0.9, 0.55);
            const diskMat = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.5, wireframe: true });
            const disk = new THREE.Mesh(diskGeo, diskMat);
            disk.position.y = -150 + i * 60;
            disk.rotation.x = Math.PI * 0.5;
            g.add(disk);
            this.fronts.push({ mesh: disk, phaseOff: i * 1.05, baseY: -150 + i * 60 });
          }

          /* Ion/electron streams — opposing helix trails */
          const N = 280;
          const iGeo = new THREE.BufferGeometry();
          const iBuf = new Float32Array(N * 3);
          const eGeo = new THREE.BufferGeometry();
          const eBuf = new Float32Array(N * 3);
          for (let i = 0; i < N; i++) {
            const phi = (i / N) * Math.PI * 6;
            const r = 25 + 15 * (i / N);
            iBuf[i * 3]     = r * Math.cos(phi);
            iBuf[i * 3 + 1] = -200 + (i / N) * 400;
            iBuf[i * 3 + 2] = r * Math.sin(phi);
            eBuf[i * 3]     = r * Math.cos(-phi + Math.PI);
            eBuf[i * 3 + 1] = -200 + (i / N) * 400;
            eBuf[i * 3 + 2] = r * Math.sin(-phi + Math.PI);
          }
          iGeo.setAttribute('position', new THREE.BufferAttribute(iBuf, 3));
          eGeo.setAttribute('position', new THREE.BufferAttribute(eBuf, 3));
          this.iPts = new THREE.Points(iGeo, new THREE.PointsMaterial({ color: 0xff6644, size: 2.4, transparent: true, opacity: 0.7 }));
          this.ePts = new THREE.Points(eGeo, new THREE.PointsMaterial({ color: 0x44ccff, size: 2.0, transparent: true, opacity: 0.7 }));
          g.add(this.iPts); g.add(this.ePts);
          this.iBuf = iBuf; this.eBuf = eBuf;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.05;

          /* Phase fronts travel upward along tube + rotate */
          this.fronts.forEach((f, i) => {
            const phase = T * 0.9 + f.phaseOff;
            f.mesh.position.y = f.baseY + 18 * Math.sin(phase);
            f.mesh.rotation.z = T * (0.4 + i * 0.08);
            f.mesh.material.opacity = 0.3 + 0.25 * Math.abs(Math.sin(phase * 1.3));
          });

          /* Streams precess in helices */
          const N = this.iBuf.length / 3;
          for (let i = 0; i < N; i++) {
            const phi = (i / N) * Math.PI * 6 + T * 1.2;
            const r = 25 + 15 * (i / N);
            this.iBuf[i * 3]     = r * Math.cos(phi);
            this.iBuf[i * 3 + 2] = r * Math.sin(phi);
            this.eBuf[i * 3]     = r * Math.cos(-phi + Math.PI);
            this.eBuf[i * 3 + 2] = r * Math.sin(-phi + Math.PI);
          }
          this.iPts.geometry.attributes.position.needsUpdate = true;
          this.ePts.geometry.attributes.position.needsUpdate = true;
        }
      });

      AFRAME.registerComponent("stellar-penumbral-wave-train", {
        /* Running penumbral waves — concentric rings propagating outward
           across a sunspot penumbra at ~30 km/s, starting from inner
           umbra boundary; warm HSL amber-orange palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-700, 400, 900);
          this.g = g; this.t = 0;

          /* Umbra disk */
          const umbraGeo = new THREE.CircleGeometry(28, 36);
          const umbraMat = new THREE.MeshBasicMaterial({ color: 0x220800, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
          const umbra = new THREE.Mesh(umbraGeo, umbraMat);
          umbra.rotation.x = -Math.PI * 0.5;
          g.add(umbra);

          /* Penumbra annulus */
          const penGeo = new THREE.RingGeometry(28, 95, 48);
          const penMat = new THREE.MeshBasicMaterial({ color: 0x663300, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
          const pen = new THREE.Mesh(penGeo, penMat);
          pen.rotation.x = -Math.PI * 0.5;
          g.add(pen);

          /* Wave rings — 8 concentric circles propagating outward */
          this.waveRings = [];
          for (let i = 0; i < 8; i++) {
            const ringGeo = new THREE.TorusGeometry(1, 1.8, 6, 64);
            const c = new THREE.Color();
            c.setHSL(0.08 - i * 0.005, 0.95, 0.6);
            const ringMat = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.0 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI * 0.5;
            g.add(ring);
            this.waveRings.push({ mesh: ring, delay: i * 0.5, mat: ringMat });
          }

          /* Granule texture particles in penumbra */
          const N = 200;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          for (let i = 0; i < N; i++) {
            const r = 28 + Math.random() * 65;
            const phi = Math.random() * Math.PI * 2;
            ptBuf[i * 3]     = r * Math.cos(phi);
            ptBuf[i * 3 + 1] = (Math.random() - 0.5) * 3;
            ptBuf[i * 3 + 2] = r * Math.sin(phi);
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xffaa44, size: 2.0, transparent: true, opacity: 0.55 });
          g.add(new THREE.Points(ptGeo, ptMat));
          this.ptMat = ptMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          /* Rings expand from umbra boundary (r=28) outward to penumbra edge (r=95) */
          this.waveRings.forEach((w, i) => {
            const phase = ((T - w.delay) % 4.0 + 4.0) % 4.0; /* 0-4s period */
            const r = 28 + phase * 16.75; /* expands from 28 to ~95 in 4s */
            const fade = r < 90 ? 1 - (r - 28) / 67 : 0;
            w.mesh.scale.setScalar(r);
            w.mat.opacity = fade * 0.7;
          });

          /* Subtly rotate penumbra group */
          this.g.rotation.y += dt * 0.03;
          this.ptMat.opacity = 0.4 + 0.15 * Math.sin(T * 1.5);
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) {
  console.error("JS anchor not found!");
  process.exit(1);
}
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR =
  "      <a-entity stellar-meridional-flow-conveyor></a-entity>";
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-drift-alfven-wave></a-entity>
      <a-entity stellar-penumbral-wave-train></a-entity>`;

if (!html.includes(HTML_ANCHOR)) {
  console.error("HTML anchor not found!");
  process.exit(1);
}
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lines = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 126 injected! Lines: " + lines);
