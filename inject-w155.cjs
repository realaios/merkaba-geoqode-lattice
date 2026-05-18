/**
 * inject-w155.cjs  — Wave 155
 * cosmic-magnetosphere-plasmasphere-plume  + stellar-coronal-pseudo-streamer
 */
"use strict";
const fs = require("fs");
const FILE = "public/cosmos-infinite.html";

let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

if (
  html.includes('registerComponent("cosmic-magnetosphere-plasmasphere-plume"')
) {
  console.log("Wave 155 already injected.");
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-magnetosphere-plasmasphere-plume", {
        /* Plasmasphere erosion plume — during geomagnetic storms the
           plasmasphere is eroded and a corotating plume of cold dense
           plasma extends outward in the afternoon MLT sector;
           cold dense torus around Earth with elongated afternoon plume;
           blue-white torus, gold plume tail;
           blue, white, gold, teal palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-7000, 800, -500);
          this.g = g; this.t = 0;

          /* Earth */
          const eGeo = new THREE.SphereGeometry(18, 14, 10);
          const eMat = new THREE.MeshBasicMaterial({ color: 0x112244, transparent: true, opacity: 0.75 });
          g.add(new THREE.Mesh(eGeo, eMat));

          /* Plasmasphere torus */
          const torGeo = new THREE.TorusGeometry(42, 10, 14, 28);
          const torMat = new THREE.MeshBasicMaterial({ color: 0x3399ff, transparent: true, opacity: 0.08, wireframe: false, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(torGeo, torMat));
          this.torMat = torMat;

          /* Plasmasphere particle density */
          const NPS = 350;
          const psGeo = new THREE.BufferGeometry();
          const psBuf = new Float32Array(NPS * 3);
          this.psBuf = psBuf; this.NPS = NPS;
          this.psPh  = new Float32Array(NPS);
          this.psR   = new Float32Array(NPS);
          this.psZ   = new Float32Array(NPS);
          for (let i = 0; i < NPS; i++) {
            this.psPh[i] = Math.random() * Math.PI * 2;
            this.psR[i]  = 32 + Math.random() * 20;
            this.psZ[i]  = (Math.random() - 0.5) * 18;
          }
          psGeo.setAttribute('position', new THREE.BufferAttribute(psBuf, 3));
          const psMat = new THREE.PointsMaterial({ color: 0x88ccff, size: 0.9, transparent: true, opacity: 0.3 });
          g.add(new THREE.Points(psGeo, psMat));
          this.psMat = psMat;

          /* Afternoon erosion plume — stretched blob */
          const NPL = 280;
          const plGeo = new THREE.BufferGeometry();
          const plBuf = new Float32Array(NPL * 3);
          this.plBuf = plBuf; this.NPL = NPL;
          this.plT   = new Float32Array(NPL);
          this.plPh  = new Float32Array(NPL);
          for (let i = 0; i < NPL; i++) {
            this.plT[i]  = Math.random();
            this.plPh[i] = (Math.random() - 0.5) * 0.8 + Math.PI * 0.5;
          }
          plGeo.setAttribute('position', new THREE.BufferAttribute(plBuf, 3));
          const plMat = new THREE.PointsMaterial({ color: 0xffdd88, size: 1.1, transparent: true, opacity: 0.4 });
          g.add(new THREE.Points(plGeo, plMat));
          this.plMat = plMat;

          /* Plasmapause boundary line */
          const NBND = 50;
          const bndPts = [];
          for (let k = 0; k < NBND; k++) {
            const ph = (k / (NBND - 1)) * Math.PI * 2;
            bndPts.push(new THREE.Vector3(52 * Math.cos(ph), 0, 52 * Math.sin(ph)));
          }
          const bndGeo = new THREE.BufferGeometry().setFromPoints(bndPts);
          const bndMat = new THREE.LineBasicMaterial({ color: 0x44ddff, transparent: true, opacity: 0.35 });
          g.add(new THREE.Line(bndGeo, bndMat));
          this.bndMat = bndMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.007;

          this.torMat.opacity = 0.05 + 0.04 * Math.abs(Math.sin(T * 0.3));
          this.bndMat.opacity = 0.25 + 0.1 * Math.abs(Math.sin(T * 0.4));

          /* Corotating plasmasphere */
          for (let i = 0; i < this.NPS; i++) {
            this.psPh[i] += dt * 0.04;
            const r  = this.psR[i];
            const ph = this.psPh[i];
            this.psBuf[i * 3]     = r * Math.cos(ph);
            this.psBuf[i * 3 + 1] = this.psZ[i];
            this.psBuf[i * 3 + 2] = r * Math.sin(ph);
          }
          this.psMat.opacity = 0.22 + 0.1 * Math.abs(Math.sin(T * 0.5));

          /* Plume stretching outward in afternoon sector */
          for (let i = 0; i < this.NPL; i++) {
            this.plT[i] += dt * 0.12;
            if (this.plT[i] > 1) { this.plT[i] = 0; this.plPh[i] = (Math.random() - 0.5) * 0.8 + Math.PI * 0.5; }
            const frac = this.plT[i];
            const r    = 42 + frac * 55;
            const ph   = this.plPh[i] + T * 0.06;
            this.plBuf[i * 3]     = r * Math.cos(ph) + (Math.random() - 0.5) * 4;
            this.plBuf[i * 3 + 1] = (Math.random() - 0.5) * 10;
            this.plBuf[i * 3 + 2] = r * Math.sin(ph) + (Math.random() - 0.5) * 4;
          }
          this.plMat.opacity = 0.3 + 0.15 * Math.abs(Math.sin(T * 0.6));
        }
      });

      AFRAME.registerComponent("stellar-coronal-pseudo-streamer", {
        /* Coronal pseudo-streamer — a multi-lobed coronal structure
           sitting above a unipolar region (no helmet streamer;
           instead a bi-modal arcade); they are the source region
           of slow solar wind and coronal mass ejections;
           bright arch pair with narrow stalk above;
           white-yellow arched arcade, narrow stalk column;
           white, gold, orange palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(3600, -4600, 4200);
          this.g = g; this.t = 0;

          /* Solar limb disc */
          const sunGeo = new THREE.SphereGeometry(40, 16, 12);
          const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa22, transparent: true, opacity: 0.45 });
          g.add(new THREE.Mesh(sunGeo, sunMat));

          /* Bi-modal arcade — two arching loops */
          const NARCH = 2;
          this.arches = [];
          for (let a = 0; a < NARCH; a++) {
            const xOff = (a - 0.5) * 16;
            const NARC = 35;
            const pts  = [];
            for (let k = 0; k < NARC; k++) {
              const ang = (k / (NARC - 1)) * Math.PI;
              pts.push(new THREE.Vector3(xOff + 10 * Math.cos(ang - Math.PI * 0.5), 40 + 22 * Math.sin(ang), (Math.random() - 0.5) * 2));
            }
            const aGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const aMat = new THREE.LineBasicMaterial({ color: 0xffee88, transparent: true, opacity: 0.55 });
            g.add(new THREE.Line(aGeo, aMat));
            this.arches.push({ mat: aMat });
          }

          /* Stalk above the bi-polar region */
          const NSTALK = 30;
          const stalkPts = [];
          for (let k = 0; k < NSTALK; k++) {
            const frac = k / (NSTALK - 1);
            stalkPts.push(new THREE.Vector3((Math.random() - 0.5) * 2, 62 + frac * 80, (Math.random() - 0.5) * 2));
          }
          const stalkGeo = new THREE.BufferGeometry().setFromPoints(stalkPts);
          const stalkMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
          g.add(new THREE.Line(stalkGeo, stalkMat));
          this.stalkMat = stalkMat;

          /* Streamer sheet above stalk */
          const NSheet = 120;
          const shGeo  = new THREE.BufferGeometry();
          const shBuf  = new Float32Array(NSheet * 3);
          this.shBuf = shBuf; this.NSheet = NSheet;
          for (let i = 0; i < NSheet; i++) {
            shBuf[i * 3]     = (Math.random() - 0.5) * 18;
            shBuf[i * 3 + 1] = 62 + Math.random() * 80;
            shBuf[i * 3 + 2] = (Math.random() - 0.5) * 8;
          }
          shGeo.setAttribute('position', new THREE.BufferAttribute(shBuf, 3));
          const shMat = new THREE.PointsMaterial({ color: 0xffd080, size: 1.1, transparent: true, opacity: 0.35 });
          g.add(new THREE.Points(shGeo, shMat));
          this.shMat = shMat;

          /* Slow wind outflow particles */
          const NSW = 180;
          const swGeo = new THREE.BufferGeometry();
          const swBuf = new Float32Array(NSW * 3);
          this.swBuf = swBuf; this.NSW = NSW;
          this.swT   = new Float32Array(NSW);
          for (let i = 0; i < NSW; i++) {
            this.swT[i]      = Math.random();
            swBuf[i * 3]     = (Math.random() - 0.5) * 10;
            swBuf[i * 3 + 1] = 62 + Math.random() * 80;
            swBuf[i * 3 + 2] = (Math.random() - 0.5) * 6;
          }
          swGeo.setAttribute('position', new THREE.BufferAttribute(swBuf, 3));
          const swMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0.3 });
          g.add(new THREE.Points(swGeo, swMat));
          this.swMat = swMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.012;

          this.arches.forEach((a, ai) => {
            a.mat.opacity = 0.4 + 0.2 * Math.abs(Math.sin(T * 0.4 + ai));
          });
          this.stalkMat.opacity = 0.35 + 0.2 * Math.abs(Math.sin(T * 0.5));
          this.shMat.opacity    = 0.25 + 0.12 * Math.abs(Math.sin(T * 0.35));

          /* Slow wind escaping upward */
          for (let i = 0; i < this.NSW; i++) {
            this.swT[i] += dt * 0.15;
            if (this.swT[i] > 1) {
              this.swT[i]      = 0;
              this.swBuf[i * 3]     = (Math.random() - 0.5) * 10;
              this.swBuf[i * 3 + 1] = 62;
              this.swBuf[i * 3 + 2] = (Math.random() - 0.5) * 6;
            }
            this.swBuf[i * 3 + 1] += dt * 20;
          }
          this.swMat.opacity = 0.2 + 0.12 * Math.abs(Math.sin(T * 0.55));
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) {
  console.error("JS anchor not found!");
  process.exit(1);
}
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR =
  "      <a-entity stellar-chromospheric-flash-spectrum></a-entity>";
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-magnetosphere-plasmasphere-plume></a-entity>
      <a-entity stellar-coronal-pseudo-streamer></a-entity>`;

if (!html.includes(HTML_ANCHOR)) {
  console.error("HTML anchor not found!");
  process.exit(1);
}
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lines = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 155 injected! Lines: " + lines);
