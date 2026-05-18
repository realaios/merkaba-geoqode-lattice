/**
 * inject-w162.cjs  — Wave 162
 * cosmic-interplanetary-coronal-mass-ejection-sheath + stellar-penumbral-intrusion-umbra-brightening
 */
"use strict";
const fs = require("fs");
const FILE = "public/cosmos-infinite.html";

let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

if (
  html.includes(
    'registerComponent("cosmic-interplanetary-coronal-mass-ejection-sheath"',
  )
) {
  console.log("Wave 162 already injected.");
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-interplanetary-coronal-mass-ejection-sheath", {
        /* ICME sheath — the turbulent compressed solar-wind plasma swept up
           ahead of a travelling CME flux rope; marked by tangled magnetic
           field, high density, and enhanced plasma; a chaotic textured shell
           surrounding a cleaner flux-rope core; turbulent orange-yellow
           sheath around a blue flux-rope core; orange, yellow, blue palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-5800, 800, -2800);
          this.g = g; this.t = 0;

          /* Flux rope core */
          const NTUBE = 20;
          const NFIB  = 6;
          this.ropeMats = [];
          for (let f = 0; f < NFIB; f++) {
            const pts = [];
            const phaseOff = (f / NFIB) * Math.PI * 2;
            for (let k = 0; k < NTUBE; k++) {
              const u   = (k / (NTUBE - 1)) - 0.5;
              const ang = u * Math.PI * 2.5 + phaseOff;
              const rad = 8;
              pts.push(new THREE.Vector3(u * 40, rad * Math.cos(ang), rad * Math.sin(ang)));
            }
            const fGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const fMat = new THREE.LineBasicMaterial({ color: 0x3366ff, transparent: true, opacity: 0.35 });
            g.add(new THREE.Line(fGeo, fMat));
            this.ropeMats.push(fMat);
          }

          /* Sheath turbulent cloud */
          const NS = 300;
          const sGeo = new THREE.BufferGeometry();
          const sBuf = new Float32Array(NS * 3);
          this.sBuf = sBuf; this.NS = NS;
          this.sVel = new Float32Array(NS * 3);
          for (let i = 0; i < NS; i++) {
            const th = Math.random() * Math.PI; const ph = Math.random() * Math.PI * 2;
            const r  = 18 + Math.random() * 22;
            sBuf[i * 3]     = r * Math.sin(th) * Math.cos(ph);
            sBuf[i * 3 + 1] = r * Math.cos(th);
            sBuf[i * 3 + 2] = r * Math.sin(th) * Math.sin(ph);
            const speed = 0.04 + Math.random() * 0.05;
            this.sVel[i * 3]     = (Math.random() - 0.5) * speed;
            this.sVel[i * 3 + 1] = (Math.random() - 0.5) * speed;
            this.sVel[i * 3 + 2] = (Math.random() - 0.5) * speed;
          }
          sGeo.setAttribute('position', new THREE.BufferAttribute(sBuf, 3));
          const sMat = new THREE.PointsMaterial({ color: 0xff9922, size: 1.1, transparent: true, opacity: 0.4 });
          g.add(new THREE.Points(sGeo, sMat));
          this.sMat = sMat;

          /* Forward shock arc */
          const NARC = 40;
          const arcPts = [];
          for (let k = 0; k < NARC; k++) {
            const ang = ((k / (NARC - 1)) - 0.5) * Math.PI;
            arcPts.push(new THREE.Vector3(-28, 38 * Math.sin(ang), 38 * Math.cos(ang)));
          }
          const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPts);
          const arcMat = new THREE.LineBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.55 });
          g.add(new THREE.Line(arcGeo, arcMat));
          this.arcMat = arcMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.007;

          /* Rope field breathe */
          this.ropeMats.forEach((m, i) => {
            m.opacity = 0.22 + 0.16 * Math.abs(Math.sin(T * 0.9 + i * 0.5));
          });

          /* Sheath turbulence */
          for (let i = 0; i < this.NS; i++) {
            this.sBuf[i * 3]     += this.sVel[i * 3];
            this.sBuf[i * 3 + 1] += this.sVel[i * 3 + 1];
            this.sBuf[i * 3 + 2] += this.sVel[i * 3 + 2];
            const r = Math.sqrt(this.sBuf[i * 3] ** 2 + this.sBuf[i * 3 + 1] ** 2 + this.sBuf[i * 3 + 2] ** 2);
            if (r > 42 || r < 14) {
              const th = Math.random() * Math.PI; const ph = Math.random() * Math.PI * 2;
              const rn = 18 + Math.random() * 22;
              this.sBuf[i * 3]     = rn * Math.sin(th) * Math.cos(ph);
              this.sBuf[i * 3 + 1] = rn * Math.cos(th);
              this.sBuf[i * 3 + 2] = rn * Math.sin(th) * Math.sin(ph);
            }
          }
          this.sMat.opacity = 0.3 + 0.14 * Math.abs(Math.sin(T * 0.8));
          this.arcMat.opacity = 0.4 + 0.22 * Math.abs(Math.sin(T * 1.4));
        }
      });

      AFRAME.registerComponent("stellar-penumbral-intrusion-umbra-brightening", {
        /* Penumbral intrusion and umbral brightening — during sunspot decay
           penumbral filaments intrude inward and the umbra develops
           bright knots (umbral dots) as convection punches through;
           radial dark filaments pointing inward with bright knot clusters
           at the umbra boundary; dark penumbra with amber filaments and
           bright white-yellow knots; black, amber, bright-yellow palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(6200, -3100, 1500);
          this.g = g; this.t = 0;

          /* Umbra */
          const uGeo = new THREE.SphereGeometry(8, 12, 10);
          const uMat = new THREE.MeshBasicMaterial({ color: 0x080400, transparent: true, opacity: 0.95 });
          g.add(new THREE.Mesh(uGeo, uMat));

          /* Penumbra disc */
          const pGeo = new THREE.RingGeometry(8, 18, 32);
          const pMat = new THREE.MeshBasicMaterial({ color: 0x442200, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(pGeo, pMat));
          this.pMat = pMat;

          /* Penumbral filaments pointing inward */
          const NFIL = 20;
          this.filMats = [];
          for (let f = 0; f < NFIL; f++) {
            const ang = (f / NFIL) * Math.PI * 2;
            const pts = [];
            for (let k = 0; k < 10; k++) {
              const r = 18 - k * 1.0;
              pts.push(new THREE.Vector3(r * Math.cos(ang), 0, r * Math.sin(ang)));
            }
            const fGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const fMat = new THREE.LineBasicMaterial({ color: 0xcc6600, transparent: true, opacity: 0.3 });
            g.add(new THREE.Line(fGeo, fMat));
            this.filMats.push(fMat);
          }

          /* Umbral bright dots (knots) */
          const NKN = 25;
          const kGeo = new THREE.BufferGeometry();
          const kBuf = new Float32Array(NKN * 3);
          this.kBuf = kBuf; this.NKN = NKN;
          this.kPh  = new Float32Array(NKN);
          this.kAng = new Float32Array(NKN);
          for (let i = 0; i < NKN; i++) {
            this.kPh[i]  = Math.random() * Math.PI * 2;
            this.kAng[i] = Math.random() * Math.PI * 2;
            const r = 6 + Math.random() * 3;
            kBuf[i * 3]     = r * Math.cos(this.kAng[i]);
            kBuf[i * 3 + 1] = 0;
            kBuf[i * 3 + 2] = r * Math.sin(this.kAng[i]);
          }
          kGeo.setAttribute('position', new THREE.BufferAttribute(kBuf, 3));
          const kMat = new THREE.PointsMaterial({ color: 0xffee88, size: 1.5, transparent: true, opacity: 0.75 });
          g.add(new THREE.Points(kGeo, kMat));
          this.kMat = kMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.z += dt * 0.004;
          this.pMat.opacity = 0.5 + 0.16 * Math.abs(Math.sin(T * 0.5));

          /* Filaments pulse inward */
          this.filMats.forEach((m, i) => {
            m.opacity = 0.18 + 0.15 * Math.abs(Math.sin(T * 0.8 + i * 0.3));
          });

          /* Umbral knots flicker */
          for (let i = 0; i < this.NKN; i++) {
            const r = 5.5 + 3 * Math.abs(Math.sin(T * 1.8 + this.kPh[i]));
            this.kBuf[i * 3]     = r * Math.cos(this.kAng[i]);
            this.kBuf[i * 3 + 2] = r * Math.sin(this.kAng[i]);
          }
          this.kMat.opacity = 0.55 + 0.25 * Math.abs(Math.sin(T * 2.4));
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) {
  console.error("JS anchor not found!");
  process.exit(1);
}
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR =
  "      <a-entity stellar-chromospheric-moreton-wave></a-entity>";
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-interplanetary-coronal-mass-ejection-sheath></a-entity>
      <a-entity stellar-penumbral-intrusion-umbra-brightening></a-entity>`;

if (!html.includes(HTML_ANCHOR)) {
  console.error("HTML anchor not found!");
  process.exit(1);
}
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lines = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 162 injected! Lines: " + lines);
