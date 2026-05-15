/**
 * inject-w125.cjs  — Wave 125
 * cosmic-ballooning-instability-plume  + stellar-meridional-flow-conveyor
 */
"use strict";
const fs = require("fs");
const FILE = "public/cosmos-infinite.html";

let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

/* ── idempotency guard ── */
if (html.includes('registerComponent("cosmic-ballooning-instability-plume"')) {
  console.log("Wave 125 already injected.");
  process.exit(0);
}

/* ════════════════════════════════════════════════════════
   1. JS — two new AFRAME.registerComponent blocks
   Insert BEFORE: AFRAME.registerComponent("asteroid-belt",
   ════════════════════════════════════════════════════════ */
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-ballooning-instability-plume", {
        /* Ballooning instability — bulging flux-tube filaments erupting
           tailward in Earth's magnetotail; kink-unstable flux ropes bow
           outward, forming a cascade of mushroom-cap plumes */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-1100, 350, -500);
          this.g = g; this.t = 0;

          /* Central flux-rope trunk */
          const trunkGeo = new THREE.CylinderGeometry(6, 12, 220, 18);
          const trunkMat = new THREE.MeshBasicMaterial({ color: 0x6633cc, transparent: true, opacity: 0.55, wireframe: true });
          const trunk = new THREE.Mesh(trunkGeo, trunkMat);
          trunk.rotation.x = Math.PI * 0.5;
          g.add(trunk);
          this.trunk = trunk;

          /* 5 ballooning cap plumes */
          this.caps = [];
          for (let i = 0; i < 5; i++) {
            const capGeo = new THREE.SphereGeometry(20 + i * 6, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
            const hue = 270 + i * 15;
            const capMat = new THREE.MeshBasicMaterial({
              color: new THREE.Color('hsl(' + hue + ',80%,55%)'),
              transparent: true, opacity: 0.38, wireframe: true
            });
            const cap = new THREE.Mesh(capGeo, capMat);
            cap.position.set(0, 0, -80 + i * 40);
            cap.rotation.x = -Math.PI * 0.5;
            g.add(cap);
            this.caps.push({ mesh: cap, phaseOff: i * 1.26, baseZ: -80 + i * 40 });
          }

          /* Particle jets streaming from caps */
          const ptCount = 200;
          const ptGeo = new THREE.BufferGeometry();
          const pos = new Float32Array(ptCount * 3);
          for (let i = 0; i < ptCount; i++) {
            const ci = Math.floor(i / 40);
            pos[i * 3]     = (Math.random() - 0.5) * 50;
            pos[i * 3 + 1] = Math.random() * 180;
            pos[i * 3 + 2] = -80 + ci * 40 + (Math.random() - 0.5) * 20;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xcc88ff, size: 2.8, transparent: true, opacity: 0.7 });
          this.ptCloud = new THREE.Points(ptGeo, ptMat);
          g.add(this.ptCloud);
          this.ptPos = pos; this.ptBase = pos.slice();
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          /* Rotate whole group slowly */
          this.g.rotation.y += dt * 0.06;

          /* Pulse trunk */
          this.trunk.scale.x = 1 + 0.12 * Math.sin(T * 1.8);
          this.trunk.scale.z = 1 + 0.10 * Math.cos(T * 2.1);

          /* Animate caps — each balloons outward in sequence */
          this.caps.forEach((c, i) => {
            const phase = T * 1.4 + c.phaseOff;
            const bulge = 1 + 0.28 * Math.abs(Math.sin(phase));
            c.mesh.scale.setScalar(bulge);
            c.mesh.position.z = c.baseZ + 12 * Math.sin(phase * 0.7);
            c.mesh.material.opacity = 0.25 + 0.18 * Math.abs(Math.sin(phase));
          });

          /* Drift particles tailward (toward +y) */
          const N = this.ptPos.length / 3;
          for (let i = 0; i < N; i++) {
            this.ptPos[i * 3 + 1] += dt * (30 + 20 * Math.random());
            if (this.ptPos[i * 3 + 1] > 200) this.ptPos[i * 3 + 1] = this.ptBase[i * 3 + 1];
          }
          this.ptCloud.geometry.attributes.position.needsUpdate = true;
          this.ptCloud.material.opacity = 0.5 + 0.25 * Math.sin(T * 2.2);
        }
      });

      AFRAME.registerComponent("stellar-meridional-flow-conveyor", {
        /* Meridional circulation — slow poleward surface flow + equatorward
           subsurface return belt; animated curved trajectory lines on a
           solar-globe scaffold */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(900, -250, -800);
          this.g = g; this.t = 0;

          /* Solar globe scaffold */
          const globeGeo = new THREE.SphereGeometry(90, 24, 18);
          const globeMat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.10, wireframe: false });
          const globe = new THREE.Mesh(globeGeo, globeMat);
          g.add(globe);
          const wireGeo = new THREE.SphereGeometry(90.5, 18, 12);
          const wireMat = new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.14, wireframe: true });
          g.add(new THREE.Mesh(wireGeo, wireMat));

          /* Surface flow paths: poleward arcs from equator to poles */
          this.surfPaths = [];
          const NUM_PATHS = 8;
          for (let p = 0; p < NUM_PATHS; p++) {
            const phi = (p / NUM_PATHS) * Math.PI * 2;
            const pts = [];
            for (let t = 0; t <= 1; t += 0.06) {
              const lat = t * Math.PI; /* 0=N pole, PI=S pole — equator=PI/2 */
              const x = 92 * Math.sin(lat) * Math.cos(phi);
              const y = 92 * Math.cos(lat);
              const z = 92 * Math.sin(lat) * Math.sin(phi);
              pts.push(new THREE.Vector3(x, y, z));
            }
            const curve = new THREE.CatmullRomCurve3(pts);
            const pathGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
            const hue = 30 + p * 8;
            const pathMat = new THREE.LineBasicMaterial({ color: new THREE.Color('hsl(' + hue + ',90%,65%)'), transparent: true, opacity: 0.6 });
            const line = new THREE.Line(pathGeo, pathMat);
            g.add(line);
            this.surfPaths.push({ line, phi, mat: pathMat });
          }

          /* Subsurface return belt: equatorward arcs just inside globe */
          this.subPaths = [];
          for (let p = 0; p < NUM_PATHS; p++) {
            const phi = (p / NUM_PATHS) * Math.PI * 2 + 0.2;
            const pts = [];
            for (let t = 0; t <= 1; t += 0.06) {
              const lat = t * Math.PI;
              const r = 68;
              const x = r * Math.sin(lat) * Math.cos(phi);
              const y = r * Math.cos(lat);
              const z = r * Math.sin(lat) * Math.sin(phi);
              pts.push(new THREE.Vector3(x, y, z));
            }
            const curve = new THREE.CatmullRomCurve3(pts);
            const pathGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
            const pathMat = new THREE.LineBasicMaterial({ color: 0x44aaff, transparent: true, opacity: 0.38 });
            const line = new THREE.Line(pathGeo, pathMat);
            g.add(line);
            this.subPaths.push({ line, phi, mat: pathMat });
          }

          /* Flow particles — surface (orange) and subsurface (blue) */
          const N = 300;
          const sGeo = new THREE.BufferGeometry();
          const sBuf = new Float32Array(N * 3);
          const dGeo = new THREE.BufferGeometry();
          const dBuf = new Float32Array(N * 3);
          for (let i = 0; i < N; i++) {
            const phi = Math.random() * Math.PI * 2;
            const lat = Math.random() * Math.PI;
            const r = i < N / 2 ? 93 : 67;
            sBuf[i * 3]     = r * Math.sin(lat) * Math.cos(phi);
            sBuf[i * 3 + 1] = r * Math.cos(lat);
            sBuf[i * 3 + 2] = r * Math.sin(lat) * Math.sin(phi);
            dBuf[i * 3]     = sBuf[i * 3];
            dBuf[i * 3 + 1] = sBuf[i * 3 + 1];
            dBuf[i * 3 + 2] = sBuf[i * 3 + 2];
          }
          sGeo.setAttribute('position', new THREE.BufferAttribute(sBuf, 3));
          dGeo.setAttribute('position', new THREE.BufferAttribute(dBuf, 3));
          this.sPts = new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0xffcc44, size: 2.2, transparent: true, opacity: 0.75 }));
          this.dPts = new THREE.Points(dGeo, new THREE.PointsMaterial({ color: 0x44ccff, size: 1.8, transparent: true, opacity: 0.55 }));
          g.add(this.sPts); g.add(this.dPts);
          this.sBuf = sBuf; this.dBuf = dBuf;
          this.ptT = new Float32Array(N).map(() => Math.random());
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.04;

          /* Animate surface particles poleward (latitude decreasing toward 0 and PI) */
          const N = this.sBuf.length / 3;
          for (let i = 0; i < N; i++) {
            this.ptT[i] = (this.ptT[i] + dt * (i < N / 2 ? 0.08 : 0.06)) % 1.0;
            const t2 = this.ptT[i];
            const phi = (i / N) * Math.PI * 2;
            const lat = t2 * Math.PI;
            const r = i < N / 2 ? 93 : 67;
            const dir = i < N / 2 ? 1 : -1; /* surface goes to poles; sub returns equator */
            const adjustedLat = i < N / 2 ? lat : (1 - t2) * Math.PI;
            this.sBuf[i * 3]     = r * Math.sin(adjustedLat) * Math.cos(phi);
            this.sBuf[i * 3 + 1] = r * Math.cos(adjustedLat) * dir;
            this.sBuf[i * 3 + 2] = r * Math.sin(adjustedLat) * Math.sin(phi);
          }
          this.sPts.geometry.attributes.position.needsUpdate = true;

          /* Pulse path opacities */
          this.surfPaths.forEach((p, i) => { p.mat.opacity = 0.4 + 0.25 * Math.sin(T * 1.1 + i * 0.7); });
          this.subPaths.forEach((p, i) => { p.mat.opacity = 0.2 + 0.15 * Math.cos(T * 0.9 + i * 0.6); });
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) {
  console.error("JS anchor not found!");
  process.exit(1);
}
html = html.replace(JS_ANCHOR, NEW_JS);

/* ════════════════════════════════════════════════════════
   2. HTML — two new <a-entity> tags
   Insert AFTER: <a-entity stellar-umbral-flash-wave></a-entity>
   ════════════════════════════════════════════════════════ */
const HTML_ANCHOR = "      <a-entity stellar-umbral-flash-wave></a-entity>";
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-ballooning-instability-plume></a-entity>
      <a-entity stellar-meridional-flow-conveyor></a-entity>`;

if (!html.includes(HTML_ANCHOR)) {
  console.error("HTML anchor not found!");
  process.exit(1);
}
html = html.replace(HTML_ANCHOR, NEW_HTML);

/* ── restore CRLF & write ── */
if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lines = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log(`Wave 125 injected! Lines: ${lines}`);
