/**
 * inject-w157.cjs  — Wave 157
 * cosmic-ring-current-inflation + stellar-penumbral-magneto-convection
 */
"use strict";
const fs = require("fs");
const FILE = "public/cosmos-infinite.html";

let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

if (html.includes('registerComponent("cosmic-ring-current-inflation"')) {
  console.log("Wave 157 already injected.");
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-ring-current-inflation", {
        /* Ring current inflation — during geomagnetic storms energetic
           particles (10-200 keV protons and O+) are injected from the
           plasma sheet and drift to form a symmetric ring current at
           3-7 Earth radii; the inflated ring depresses the geomagnetic
           field globally (Dst index drops); animated energetic torus
           that inflates and then decays;
           red-orange proton ring, green O+ ions, inner torus glow;
           red, orange, green, white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(900, -2400, -4400);
          this.g = g; this.t = 0; this.phase = 0; this.period = 10;

          /* Earth */
          const eGeo = new THREE.SphereGeometry(14, 14, 10);
          const eMat = new THREE.MeshBasicMaterial({ color: 0x112244, transparent: true, opacity: 0.7 });
          g.add(new THREE.Mesh(eGeo, eMat));

          /* Ring current torus — proton (red-orange) */
          const tor1Geo = new THREE.TorusGeometry(38, 9, 12, 28);
          const tor1Mat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(tor1Geo, tor1Mat));
          this.tor1Mat = tor1Mat;

          /* Drift ring wire */
          const NDRIFT = 60;
          const driftPts = [];
          for (let k = 0; k < NDRIFT; k++) {
            const ph = (k / (NDRIFT - 1)) * Math.PI * 2;
            driftPts.push(new THREE.Vector3(38 * Math.cos(ph), 0, 38 * Math.sin(ph)));
          }
          const driftGeo = new THREE.BufferGeometry().setFromPoints(driftPts);
          const driftMat = new THREE.LineBasicMaterial({ color: 0xff6622, transparent: true, opacity: 0.5 });
          g.add(new THREE.Line(driftGeo, driftMat));
          this.driftMat = driftMat;

          /* Proton particles drifting westward */
          const NP = 200;
          const pGeo = new THREE.BufferGeometry();
          const pBuf = new Float32Array(NP * 3);
          this.pBuf = pBuf; this.NP = NP;
          this.pPh  = new Float32Array(NP);
          this.pR   = new Float32Array(NP);
          for (let i = 0; i < NP; i++) {
            this.pPh[i] = Math.random() * Math.PI * 2;
            this.pR[i]  = 30 + Math.random() * 18;
          }
          pGeo.setAttribute('position', new THREE.BufferAttribute(pBuf, 3));
          const pMat = new THREE.PointsMaterial({ color: 0xff5500, size: 0.9, transparent: true, opacity: 0.45 });
          g.add(new THREE.Points(pGeo, pMat));
          this.pMat = pMat;

          /* O+ particles drifting eastward (green) */
          const NO = 120;
          const oGeo = new THREE.BufferGeometry();
          const oBuf = new Float32Array(NO * 3);
          this.oBuf = oBuf; this.NO = NO;
          this.oPh  = new Float32Array(NO);
          this.oR   = new Float32Array(NO);
          for (let i = 0; i < NO; i++) {
            this.oPh[i] = Math.random() * Math.PI * 2;
            this.oR[i]  = 30 + Math.random() * 18;
          }
          oGeo.setAttribute('position', new THREE.BufferAttribute(oBuf, 3));
          const oMat = new THREE.PointsMaterial({ color: 0x44ff88, size: 1.0, transparent: true, opacity: 0.4 });
          g.add(new THREE.Points(oGeo, oMat));
          this.oMat = oMat;

          /* Dst depression indicator — shrunken Bfield lines */
          const NBFL = 6;
          this.bfl = [];
          for (let b = 0; b < NBFL; b++) {
            const ph = (b / NBFL) * Math.PI * 2;
            const pts = [];
            for (let k = 0; k < 20; k++) {
              const t = k / 19;
              const r = 14 + t * 18;
              pts.push(new THREE.Vector3(r * Math.cos(ph), (t - 0.5) * 22, r * Math.sin(ph)));
            }
            const bGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const bMat = new THREE.LineBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.25 });
            g.add(new THREE.Line(bGeo, bMat));
            this.bfl.push(bMat);
          }
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.006;

          /* Storm inflation cycle */
          this.phase = (this.phase + dt) % this.period;
          const fp   = this.phase / this.period;
          let infl;
          if      (fp < 0.2) infl = fp / 0.2;
          else if (fp < 0.5) infl = 1;
          else               infl = 1 - (fp - 0.5) / 0.5;

          this.tor1Mat.opacity = 0.03 + 0.09 * infl;
          this.driftMat.opacity = 0.3 + 0.3 * infl;

          /* Protons drift westward */
          for (let i = 0; i < this.NP; i++) {
            this.pPh[i] -= dt * 0.05 * (1 + infl * 0.5);
            const r = this.pR[i];
            this.pBuf[i * 3]     = r * Math.cos(this.pPh[i]);
            this.pBuf[i * 3 + 1] = (Math.random() - 0.5) * 8;
            this.pBuf[i * 3 + 2] = r * Math.sin(this.pPh[i]);
          }
          this.pMat.opacity = 0.3 + 0.25 * infl;

          /* O+ drift eastward */
          for (let i = 0; i < this.NO; i++) {
            this.oPh[i] += dt * 0.035 * (1 + infl * 0.5);
            const r = this.oR[i];
            this.oBuf[i * 3]     = r * Math.cos(this.oPh[i]);
            this.oBuf[i * 3 + 1] = (Math.random() - 0.5) * 7;
            this.oBuf[i * 3 + 2] = r * Math.sin(this.oPh[i]);
          }
          this.oMat.opacity = 0.25 + 0.2 * infl;

          /* B-field lines compress during storm main phase */
          this.bfl.forEach((m) => { m.opacity = 0.15 + 0.2 * (1 - infl * 0.5); });
        }
      });

      AFRAME.registerComponent("stellar-penumbral-magneto-convection", {
        /* Penumbral magneto-convection — the sunspot penumbra is formed
           by inclined magnetic field lines that allow convection to
           thread through; bright and dark penumbral fibrils are driven
           by magneto-convective flow; the Evershed flow carries plasma
           outward along the fibrils; animated fibril pattern;
           alternating bright/dark radial fibrils radiating outward;
           gold, dark-brown, bright-white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-5800, 3200, 2200);
          this.g = g; this.t = 0;

          /* Umbra core */
          const umbGeo = new THREE.CircleGeometry(14, 16);
          const umbMat = new THREE.MeshBasicMaterial({ color: 0x110000, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(umbGeo, umbMat));

          /* Penumbral fibrils */
          const NFIB = 36; const NLAYER = 3;
          this.fibrils = [];
          for (let f = 0; f < NFIB; f++) {
            const ang = (f / NFIB) * Math.PI * 2;
            for (let lay = 0; lay < NLAYER; lay++) {
              const pts = [];
              const rStart = 14 + lay * 0.5;
              const rEnd   = 26 + lay * 1.5;
              const NPTS   = 15;
              for (let k = 0; k < NPTS; k++) {
                const t  = k / (NPTS - 1);
                const r  = rStart + t * (rEnd - rStart);
                const dA = Math.sin(t * Math.PI) * 0.08;
                pts.push(new THREE.Vector3(r * Math.cos(ang + dA), r * Math.sin(ang + dA), 0));
              }
              const fGeo = new THREE.BufferGeometry().setFromPoints(pts);
              const isBright = (f + lay) % 2 === 0;
              const fMat = new THREE.LineBasicMaterial({
                color: isBright ? 0xffcc44 : 0x331100,
                transparent: true,
                opacity: isBright ? 0.55 : 0.4
              });
              g.add(new THREE.Line(fGeo, fMat));
              this.fibrils.push({ mat: fMat, isBright, ang, rStart, rEnd });
            }
          }

          /* Evershed flow outward particles */
          const NEV = 180;
          const evGeo = new THREE.BufferGeometry();
          const evBuf = new Float32Array(NEV * 3);
          this.evBuf = evBuf; this.NEV = NEV;
          this.evT   = new Float32Array(NEV);
          this.evAng = new Float32Array(NEV);
          for (let i = 0; i < NEV; i++) {
            this.evT[i]   = Math.random();
            this.evAng[i] = Math.random() * Math.PI * 2;
          }
          evGeo.setAttribute('position', new THREE.BufferAttribute(evBuf, 3));
          const evMat = new THREE.PointsMaterial({ color: 0xffee88, size: 0.7, transparent: true, opacity: 0.4 });
          g.add(new THREE.Points(evGeo, evMat));
          this.evMat = evMat;

          /* Outer photosphere ring */
          const NRING = 60;
          const ringPts = [];
          for (let k = 0; k < NRING; k++) {
            const ang = (k / (NRING - 1)) * Math.PI * 2;
            ringPts.push(new THREE.Vector3(28 * Math.cos(ang), 28 * Math.sin(ang), 0));
          }
          const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
          const ringMat = new THREE.LineBasicMaterial({ color: 0xffaa22, transparent: true, opacity: 0.3 });
          g.add(new THREE.Line(ringGeo, ringMat));
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.z += dt * 0.008;

          /* Fibril breathing */
          this.fibrils.forEach((fib, fi) => {
            const pulse = Math.abs(Math.sin(T * 0.6 + fi * 0.3));
            fib.mat.opacity = fib.isBright ? (0.35 + 0.3 * pulse) : (0.25 + 0.2 * (1 - pulse));
          });

          /* Evershed outflow */
          for (let i = 0; i < this.NEV; i++) {
            this.evT[i] += dt * 0.25;
            if (this.evT[i] > 1) { this.evT[i] = 0; this.evAng[i] = Math.random() * Math.PI * 2; }
            const r = 14 + this.evT[i] * 14;
            this.evBuf[i * 3]     = r * Math.cos(this.evAng[i]);
            this.evBuf[i * 3 + 1] = r * Math.sin(this.evAng[i]);
            this.evBuf[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
          }
          this.evMat.opacity = 0.3 + 0.15 * Math.abs(Math.sin(T * 0.5));
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) {
  console.error("JS anchor not found!");
  process.exit(1);
}
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = "      <a-entity stellar-annular-eclipse-ring></a-entity>";
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-ring-current-inflation></a-entity>
      <a-entity stellar-penumbral-magneto-convection></a-entity>`;

if (!html.includes(HTML_ANCHOR)) {
  console.error("HTML anchor not found!");
  process.exit(1);
}
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lines = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 157 injected! Lines: " + lines);
