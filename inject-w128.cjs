/**
 * inject-w128.cjs  — Wave 128
 * cosmic-magnetoacoustic-surface-wave  + stellar-sunspot-moat-flow
 */
"use strict";
const fs = require("fs");
const FILE = "public/cosmos-infinite.html";

let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

if (html.includes('registerComponent("cosmic-magnetoacoustic-surface-wave"')) {
  console.log("Wave 128 already injected.");
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-magnetoacoustic-surface-wave", {
        /* Magnetoacoustic surface wave — propagates along a plasma
           interface (e.g., solar corona boundary); rippling 2-D sheet
           with standing transverse oscillation, teal-cyan palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(1400, -300, -200);
          this.g = g; this.t = 0;

          /* Plasma interface sheet — grid of rows/cols */
          const ROWS = 18, COLS = 26;
          const W = 280, H = 160;
          const sheetGeo = new THREE.PlaneGeometry(W, H, COLS - 1, ROWS - 1);
          const sheetMat = new THREE.MeshBasicMaterial({ color: 0x00cccc, transparent: true, opacity: 0.22, wireframe: true, side: THREE.DoubleSide });
          this.sheet = new THREE.Mesh(sheetGeo, sheetMat);
          this.sheet.rotation.y = Math.PI * 0.5;
          g.add(this.sheet);
          this.posAttr = sheetGeo.attributes.position;
          this.origPos = new Float32Array(this.posAttr.array);

          /* Upper boundary glow ribbon */
          const ribPts = [];
          for (let i = 0; i <= COLS; i++) ribPts.push(new THREE.Vector3(-W / 2 + (i / COLS) * W, H / 2, 0));
          const ribGeo = new THREE.BufferGeometry().setFromPoints(ribPts);
          const ribMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.7 });
          this.ribbon = new THREE.Line(ribGeo, ribMat);
          this.ribbon.rotation.y = Math.PI * 0.5;
          g.add(this.ribbon);
          this.ribPts = ribPts; this.ribGeo = ribGeo; this.ribCols = COLS;
          this.ribW = W;

          /* Lower boundary */
          const loPts = ribPts.map(p => new THREE.Vector3(p.x, -H / 2, p.z));
          const loGeo = new THREE.BufferGeometry().setFromPoints(loPts);
          const loMat = new THREE.LineBasicMaterial({ color: 0x006666, transparent: true, opacity: 0.5 });
          this.lowerRib = new THREE.Line(loGeo, loMat);
          this.lowerRib.rotation.y = Math.PI * 0.5;
          g.add(this.lowerRib);
          this.loPts = loPts; this.loGeo = loGeo;

          /* Surface particles riding the wave */
          const N = 120;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          for (let i = 0; i < N; i++) {
            ptBuf[i * 3]     = 0;
            ptBuf[i * 3 + 1] = H / 2 + Math.random() * 8;
            ptBuf[i * 3 + 2] = -W / 2 + Math.random() * W;
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xaaffff, size: 2.2, transparent: true, opacity: 0.65 });
          this.wavePts = new THREE.Points(ptGeo, ptMat);
          this.wavePts.rotation.y = Math.PI * 0.5;
          g.add(this.wavePts);
          this.ptBuf = ptBuf; this.ptMat = ptMat; this.W = W; this.H = H;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.04;

          /* Animate sheet — sinusoidal surface wave in z (depth) direction */
          const pos = this.posAttr.array;
          const orig = this.origPos;
          const n = pos.length / 3;
          for (let i = 0; i < n; i++) {
            const x = orig[i * 3 + 2]; /* x in plane = col position (-W/2 to W/2) rotated to z */
            pos[i * 3]     = orig[i * 3] + 18 * Math.sin(x * 0.045 - T * 2.4);
            pos[i * 3 + 1] = orig[i * 3 + 1];
            pos[i * 3 + 2] = orig[i * 3 + 2];
          }
          this.posAttr.needsUpdate = true;

          /* Animate upper ribbon */
          const ribArr = this.ribGeo.attributes.position.array;
          for (let i = 0; i <= this.ribCols; i++) {
            const x = -this.ribW / 2 + (i / this.ribCols) * this.ribW;
            ribArr[i * 3]     = 18 * Math.sin(x * 0.045 - T * 2.4);
            ribArr[i * 3 + 1] = this.H / 2;
            ribArr[i * 3 + 2] = x;
          }
          this.ribGeo.attributes.position.needsUpdate = true;

          /* Lower ribbon (dampened) */
          const loArr = this.loGeo.attributes.position.array;
          for (let i = 0; i <= this.ribCols; i++) {
            const x = -this.ribW / 2 + (i / this.ribCols) * this.ribW;
            loArr[i * 3]     = 8 * Math.sin(x * 0.045 - T * 2.4 + Math.PI);
            loArr[i * 3 + 1] = -this.H / 2;
            loArr[i * 3 + 2] = x;
          }
          this.loGeo.attributes.position.needsUpdate = true;

          /* Surface particles drift along wave crest */
          const N = this.ptBuf.length / 3;
          for (let i = 0; i < N; i++) {
            this.ptBuf[i * 3 + 2] += dt * 28;
            if (this.ptBuf[i * 3 + 2] > this.W / 2) this.ptBuf[i * 3 + 2] = -this.W / 2;
            const x = this.ptBuf[i * 3 + 2];
            this.ptBuf[i * 3] = 18 * Math.sin(x * 0.045 - T * 2.4) + (Math.random() - 0.5) * 4;
          }
          this.wavePts.geometry.attributes.position.needsUpdate = true;
          this.ptMat.opacity = 0.5 + 0.2 * Math.sin(T * 1.8);
        }
      });

      AFRAME.registerComponent("stellar-sunspot-moat-flow", {
        /* Sunspot moat flow — radial outward flow of plasma in the moat
           surrounding a sunspot; visible as moving small magnetic
           features drifting away from spot boundary */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-900, -400, 600);
          this.g = g; this.t = 0;

          /* Sunspot umbra */
          const umbraGeo = new THREE.CircleGeometry(22, 40);
          const umbraMat = new THREE.MeshBasicMaterial({ color: 0x110500, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
          const umbra = new THREE.Mesh(umbraGeo, umbraMat);
          umbra.rotation.x = -Math.PI * 0.5;
          g.add(umbra);

          /* Penumbra ring */
          const penGeo = new THREE.RingGeometry(22, 50, 48);
          const penMat = new THREE.MeshBasicMaterial({ color: 0x552200, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
          const pen = new THREE.Mesh(penGeo, penMat);
          pen.rotation.x = -Math.PI * 0.5;
          g.add(pen);

          /* Moat region */
          const moatGeo = new THREE.RingGeometry(50, 110, 48);
          const moatMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.10, side: THREE.DoubleSide });
          const moat = new THREE.Mesh(moatGeo, moatMat);
          moat.rotation.x = -Math.PI * 0.5;
          g.add(moat);

          /* Photosphere background beyond moat */
          const photoGeo = new THREE.CircleGeometry(180, 40);
          const photoMat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.07, side: THREE.DoubleSide });
          const photo = new THREE.Mesh(photoGeo, photoMat);
          photo.rotation.x = -Math.PI * 0.5;
          g.add(photo);

          /* Moving magnetic features — small dots drifting radially outward */
          const NUM = 60;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(NUM * 3);
          this.mmfR = new Float32Array(NUM);
          this.mmfPhi = new Float32Array(NUM);
          for (let i = 0; i < NUM; i++) {
            this.mmfR[i]   = 52 + Math.random() * 55;
            this.mmfPhi[i] = Math.random() * Math.PI * 2;
            ptBuf[i * 3]     = this.mmfR[i] * Math.cos(this.mmfPhi[i]);
            ptBuf[i * 3 + 1] = 0;
            ptBuf[i * 3 + 2] = this.mmfR[i] * Math.sin(this.mmfPhi[i]);
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xffcc44, size: 3.0, transparent: true, opacity: 0.8 });
          this.mmfPts = new THREE.Points(ptGeo, ptMat);
          g.add(this.mmfPts);
          this.ptBuf = ptBuf; this.ptMat = ptMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.02;

          /* Features drift radially outward at ~5 units/s */
          const N = this.mmfR.length;
          for (let i = 0; i < N; i++) {
            this.mmfR[i] += dt * (3 + Math.random() * 3);
            if (this.mmfR[i] > 110) {
              this.mmfR[i] = 52 + Math.random() * 5;
              this.mmfPhi[i] = Math.random() * Math.PI * 2;
            }
            this.mmfPhi[i] += dt * 0.04 * (Math.random() - 0.5); /* small angular wander */
            this.ptBuf[i * 3]     = this.mmfR[i] * Math.cos(this.mmfPhi[i]);
            this.ptBuf[i * 3 + 2] = this.mmfR[i] * Math.sin(this.mmfPhi[i]);
          }
          this.mmfPts.geometry.attributes.position.needsUpdate = true;
          this.ptMat.opacity = 0.6 + 0.2 * Math.sin(T * 1.4);
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) {
  console.error("JS anchor not found!");
  process.exit(1);
}
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR =
  "      <a-entity stellar-photospheric-vortex-tube></a-entity>";
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-magnetoacoustic-surface-wave></a-entity>
      <a-entity stellar-sunspot-moat-flow></a-entity>`;

if (!html.includes(HTML_ANCHOR)) {
  console.error("HTML anchor not found!");
  process.exit(1);
}
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lines = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 128 injected! Lines: " + lines);
