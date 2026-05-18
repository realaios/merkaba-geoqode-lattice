/**
 * inject-w153.cjs  — Wave 153
 * cosmic-geocorona-hydrogen-cloud  + stellar-sunspot-light-bridge-plasma-jet
 */
"use strict";
const fs = require("fs");
const FILE = "public/cosmos-infinite.html";

let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

if (html.includes('registerComponent("cosmic-geocorona-hydrogen-cloud"')) {
  console.log("Wave 153 already injected.");
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-geocorona-hydrogen-cloud", {
        /* Earth geocorona — the outermost tenuous layer of neutral
           hydrogen surrounding Earth; extends to 100,000 km;
           glows in Lyman-alpha UV scattered from sunlight;
           diffuse ellipsoidal halo around Earth; white-blue glow;
           white, blue, cyan palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(2400, -3600, -1800);
          this.g = g; this.t = 0;

          /* Earth */
          const eGeo = new THREE.SphereGeometry(22, 16, 12);
          const eMat = new THREE.MeshBasicMaterial({ color: 0x224488, transparent: true, opacity: 0.7 });
          g.add(new THREE.Mesh(eGeo, eMat));

          /* Geocorona shells — nested transparent spheres */
          const NSHELL = 8;
          this.shellMats = [];
          for (let s = 0; s < NSHELL; s++) {
            const frac = s / (NSHELL - 1);
            const r    = 28 + frac * 90;
            const sGeo = new THREE.SphereGeometry(r, 14, 10);
            const hue  = 0.56 + frac * 0.08;
            const col  = new THREE.Color(); col.setHSL(hue, 0.7, 0.7 + frac * 0.15);
            const sMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.04 - frac * 0.003, wireframe: false, side: THREE.FrontSide });
            g.add(new THREE.Mesh(sGeo, sMat));
            this.shellMats.push({ mat: sMat, frac, r });
          }

          /* Hydrogen atom density cloud — volume scatter particles */
          const NHY = 400;
          const hyGeo = new THREE.BufferGeometry();
          const hyBuf = new Float32Array(NHY * 3);
          this.hyBuf = hyBuf; this.NHY = NHY;
          this.hyR   = new Float32Array(NHY);
          this.hyTh  = new Float32Array(NHY);
          this.hyPh  = new Float32Array(NHY);
          this.hyVPh = new Float32Array(NHY);
          for (let i = 0; i < NHY; i++) {
            this.hyR[i]   = 28 + Math.random() * 90;
            this.hyTh[i]  = Math.acos(2 * Math.random() - 1);
            this.hyPh[i]  = Math.random() * Math.PI * 2;
            this.hyVPh[i] = (Math.random() - 0.5) * 0.12;
          }
          hyGeo.setAttribute('position', new THREE.BufferAttribute(hyBuf, 3));
          const hyMat = new THREE.PointsMaterial({ color: 0xaaddff, size: 0.7, transparent: true, opacity: 0.35 });
          g.add(new THREE.Points(hyGeo, hyMat));
          this.hyMat = hyMat;

          /* Lyman-alpha glow halo — flat ring facing sun direction */
          const NGLOW = 180;
          const glGeo = new THREE.BufferGeometry();
          const glBuf = new Float32Array(NGLOW * 3);
          this.glBuf = glBuf; this.NGLOW = NGLOW;
          for (let i = 0; i < NGLOW; i++) {
            const ang = (i / NGLOW) * Math.PI * 2;
            const r   = 50 + Math.random() * 50;
            glBuf[i * 3]     = r * Math.cos(ang);
            glBuf[i * 3 + 1] = (Math.random() - 0.5) * 20;
            glBuf[i * 3 + 2] = r * Math.sin(ang);
          }
          glGeo.setAttribute('position', new THREE.BufferAttribute(glBuf, 3));
          const glMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.0, transparent: true, opacity: 0.2 });
          g.add(new THREE.Points(glGeo, glMat));
          this.glMat = glMat;

          /* Sunlit crescent highlight on geocorona */
          const NCRES = 60;
          const crGeo = new THREE.BufferGeometry();
          const crBuf = new Float32Array(NCRES * 3);
          this.crBuf = crBuf; this.NCRES = NCRES;
          crGeo.setAttribute('position', new THREE.BufferAttribute(crBuf, 3));
          const crMat = new THREE.PointsMaterial({ color: 0xeeffff, size: 1.4, transparent: true, opacity: 0.4 });
          g.add(new THREE.Points(crGeo, crMat));
          this.crMat = crMat;
          for (let i = 0; i < NCRES; i++) {
            const ang = (i / NCRES - 0.5) * Math.PI * 0.6;
            const r   = 22 + Math.random() * 80;
            crBuf[i * 3]     = r * Math.sin(ang) + 30;
            crBuf[i * 3 + 1] = r * Math.cos(ang) * 0.4;
            crBuf[i * 3 + 2] = (Math.random() - 0.5) * 20;
          }
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.006;

          this.shellMats.forEach((sh, i) => {
            sh.mat.opacity = 0.025 + 0.012 * Math.abs(Math.sin(T * 0.2 + i * 0.5)) - sh.frac * 0.002;
          });

          for (let i = 0; i < this.NHY; i++) {
            this.hyPh[i] += dt * this.hyVPh[i];
            const r  = this.hyR[i];
            const th = this.hyTh[i];
            const ph = this.hyPh[i];
            this.hyBuf[i * 3]     = r * Math.sin(th) * Math.cos(ph);
            this.hyBuf[i * 3 + 1] = r * Math.cos(th);
            this.hyBuf[i * 3 + 2] = r * Math.sin(th) * Math.sin(ph);
          }
          this.hyMat.opacity = 0.25 + 0.12 * Math.abs(Math.sin(T * 0.3));
          this.glMat.opacity = 0.12 + 0.08 * Math.abs(Math.sin(T * 0.4));
          this.crMat.opacity = 0.3 + 0.15 * Math.abs(Math.sin(T * 0.5));
        }
      });

      AFRAME.registerComponent("stellar-sunspot-light-bridge-plasma-jet", {
        /* Plasma jets from light bridge — narrow bright jets that
           erupt from light bridge structures crossing sunspot umbras;
           they shoot upward into the chromosphere and transition
           region at 10-80 km/s; repetitive; white-yellow narrow
           columns; white, yellow, orange palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-600, 5200, -3400);
          this.g = g; this.t = 0;

          /* Sunspot umbra disc */
          const umbGeo = new THREE.CircleGeometry(20, 18);
          const umbMat = new THREE.MeshBasicMaterial({ color: 0x110800, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
          const umbMesh = new THREE.Mesh(umbGeo, umbMat);
          g.add(umbMesh);

          /* Penumbra ring */
          const penGeo = new THREE.RingGeometry(20, 32, 20);
          const penMat = new THREE.MeshBasicMaterial({ color: 0x885533, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(penGeo, penMat));

          /* Light bridge — narrow bright bar crossing umbra */
          const lbGeo = new THREE.PlaneGeometry(40, 3);
          const lbMat = new THREE.MeshBasicMaterial({ color: 0xffdd88, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(lbGeo, lbMat));
          this.lbMat = lbMat;

          /* Plasma jets — 6 along bridge */
          const NJET = 6;
          this.jets = [];
          for (let j = 0; j < NJET; j++) {
            const xOff = (j - (NJET - 1) / 2) * 7;
            const pts  = [];
            for (let k = 0; k < 25; k++) pts.push(new THREE.Vector3(0, 0, 0));
            const jGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const jMat = new THREE.LineBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0 });
            g.add(new THREE.Line(jGeo, jMat));
            const period = 2 + Math.random() * 4;
            this.jets.push({ geo: jGeo, mat: jMat, pts, xOff, period, phase: Math.random() * period, life: Math.random() * period });
          }

          /* Jet particle cloud */
          const NJP = 180;
          const jpGeo = new THREE.BufferGeometry();
          const jpBuf = new Float32Array(NJP * 3);
          this.jpBuf = jpBuf; this.NJP = NJP;
          this.jpT   = new Float32Array(NJP);
          this.jpJ   = new Uint8Array(NJP);
          this.jpOff = new Float32Array(NJP * 2);
          for (let i = 0; i < NJP; i++) {
            this.jpT[i]       = Math.random();
            this.jpJ[i]       = Math.floor(Math.random() * NJET);
            this.jpOff[i * 2]     = (Math.random() - 0.5) * 3;
            this.jpOff[i * 2 + 1] = (Math.random() - 0.5) * 3;
          }
          jpGeo.setAttribute('position', new THREE.BufferAttribute(jpBuf, 3));
          const jpMat = new THREE.PointsMaterial({ color: 0xffee77, size: 1.2, transparent: true, opacity: 0.45 });
          g.add(new THREE.Points(jpGeo, jpMat));
          this.jpMat = jpMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.z += dt * 0.018;

          this.lbMat.opacity = 0.55 + 0.2 * Math.abs(Math.sin(T * 1.2));

          /* Jet eruption cycle */
          this.jets.forEach((j, ji) => {
            j.life += dt;
            const phase = j.life % j.period;
            const ramp  = phase / j.period;
            let alpha, height;
            if (ramp < 0.15) {
              alpha = ramp / 0.15;
              height = alpha * 50;
            } else if (ramp < 0.6) {
              alpha = 1 - (ramp - 0.15) / 0.45 * 0.4;
              height = 50;
            } else {
              alpha = 0.6 - (ramp - 0.6) / 0.4 * 0.6;
              height = 50 * (1 - (ramp - 0.6) / 0.4);
            }
            j.mat.opacity = Math.max(0, alpha) * 0.8;
            const N = 25;
            for (let k = 0; k < N; k++) {
              const frac = k / (N - 1);
              j.pts[k].set(j.xOff + (Math.random() - 0.5) * 1.5, frac * height, (Math.random() - 0.5) * 1.5);
            }
            j.geo.setFromPoints(j.pts);
          });

          /* Jet particles */
          for (let i = 0; i < this.NJP; i++) {
            this.jpT[i] += dt * 0.4;
            if (this.jpT[i] > 1) this.jpT[i] = 0;
            const j    = this.jets[this.jpJ[i]];
            const frac = this.jpT[i];
            this.jpBuf[i * 3]     = j.xOff + this.jpOff[i * 2];
            this.jpBuf[i * 3 + 1] = frac * 50 + (Math.random() - 0.5) * 3;
            this.jpBuf[i * 3 + 2] = this.jpOff[i * 2 + 1];
          }
          this.jpMat.opacity = 0.3 + 0.2 * Math.abs(Math.sin(T * 1.5));
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) {
  console.error("JS anchor not found!");
  process.exit(1);
}
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR =
  "      <a-entity stellar-chromospheric-network-brightening></a-entity>";
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-geocorona-hydrogen-cloud></a-entity>
      <a-entity stellar-sunspot-light-bridge-plasma-jet></a-entity>`;

if (!html.includes(HTML_ANCHOR)) {
  console.error("HTML anchor not found!");
  process.exit(1);
}
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lines = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 153 injected! Lines: " + lines);
