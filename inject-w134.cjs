/**
 * inject-w134.cjs  — Wave 134
 * cosmic-bow-shock-overshoot  + stellar-flux-tube-flicker-emergence
 */
"use strict";
const fs = require("fs");
const FILE = "public/cosmos-infinite.html";

let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

if (html.includes('registerComponent("cosmic-bow-shock-overshoot"')) {
  console.log("Wave 134 already injected.");
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-bow-shock-overshoot", {
        /* Bow-shock overshoot and foot structure — the region just
           upstream of a quasi-perpendicular collisionless shock where
           reflected ions create a foot, ramp and overshoot in the
           magnetic field profile; orange-crimson palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(800, -1400, 900);
          this.g = g; this.t = 0;

          /* Upstream region — low field */
          const upGeo = new THREE.PlaneGeometry(250, 160);
          const upMat = new THREE.MeshBasicMaterial({ color: 0x220000, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
          const up = new THREE.Mesh(upGeo, upMat);
          up.position.set(-140, 0, 0);
          g.add(up);

          /* Shock ramp slab */
          const rampGeo = new THREE.PlaneGeometry(30, 160);
          const rampMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
          const ramp = new THREE.Mesh(rampGeo, rampMat);
          ramp.position.set(0, 0, 0);
          g.add(ramp);
          this.rampMat = rampMat;

          /* Overshoot slab */
          const ovGeo = new THREE.PlaneGeometry(35, 160);
          const ovMat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
          const ov = new THREE.Mesh(ovGeo, ovMat);
          ov.position.set(33, 0, 0);
          g.add(ov);
          this.ovMat = ovMat;

          /* Downstream region — high field plateau */
          const dnGeo = new THREE.PlaneGeometry(180, 160);
          const dnMat = new THREE.MeshBasicMaterial({ color: 0x331100, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
          const dn = new THREE.Mesh(dnGeo, dnMat);
          dn.position.set(110, 0, 0);
          g.add(dn);

          /* Foot region lines — reflected ions upstream */
          const NFOOT = 20;
          this.footLines = [];
          for (let f = 0; f < NFOOT; f++) {
            const y = -80 + f * 8;
            const fGeo = new THREE.BufferGeometry();
            const buf = new Float32Array([-60, y, 1, 0, y, 1]);
            fGeo.setAttribute('position', new THREE.BufferAttribute(buf, 3));
            const fMat = new THREE.LineBasicMaterial({ color: 0xff6633, transparent: true, opacity: 0.4 });
            g.add(new THREE.Line(fGeo, fMat));
            this.footLines.push({ mat: fMat, phase: f * 0.22 });
          }

          /* Gyrating reflected ions — circle back upstream */
          const NION = 80;
          const ionGeo = new THREE.BufferGeometry();
          const ionBuf = new Float32Array(NION * 3);
          this.ionX = new Float32Array(NION);
          this.ionY = new Float32Array(NION);
          this.ionAngle = new Float32Array(NION);
          for (let i = 0; i < NION; i++) {
            this.ionX[i]    = (Math.random() - 0.5) * 200;
            this.ionY[i]    = (Math.random() - 0.5) * 150;
            this.ionAngle[i]= Math.random() * Math.PI * 2;
          }
          ionGeo.setAttribute('position', new THREE.BufferAttribute(ionBuf, 3));
          const ionMat = new THREE.PointsMaterial({ color: 0xffaa44, size: 2.5, transparent: true, opacity: 0.55 });
          this.ions = new THREE.Points(ionGeo, ionMat);
          g.add(this.ions);
          this.ionBuf = ionBuf; this.ionMat = ionMat; this.NION = NION;

          /* B-field profile line drawn across ramp */
          const BPTS = 60;
          const bGeo = new THREE.BufferGeometry();
          const bBuf = new Float32Array(BPTS * 3);
          bGeo.setAttribute('position', new THREE.BufferAttribute(bBuf, 3));
          const bMat = new THREE.LineBasicMaterial({ color: 0xffddbb, transparent: true, opacity: 0.8 });
          g.add(new THREE.Line(bGeo, bMat));
          this.bBuf = bBuf; this.bMat = bMat; this.bGeo = bGeo; this.BPTS = BPTS;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.015;

          /* B-field profile with ramp, overshoot, relaxation */
          const BPTS = this.BPTS;
          for (let i = 0; i < BPTS; i++) {
            const x = -200 + i * (400 / (BPTS - 1));
            let B = 0;
            if (x < -60) {
              B = 10 + 5 * Math.sin(T * 1.8 + x * 0.05); /* foot oscillation */
            } else if (x < 0) {
              const t2 = (x + 60) / 60;
              B = 10 + 40 * t2; /* ramp */
            } else if (x < 36) {
              const t2 = x / 36;
              B = 50 + 18 * Math.sin(Math.PI * t2) * (1 + 0.15 * Math.sin(T * 3.0)); /* overshoot */
            } else {
              B = 44 + 3 * Math.sin(T * 2.2 + x * 0.015); /* downstream plateau */
            }
            this.bBuf[i * 3]     = x * 0.8;
            this.bBuf[i * 3 + 1] = B * 0.9 - 45;
            this.bBuf[i * 3 + 2] = 2;
          }
          this.bGeo.attributes.position.needsUpdate = true;

          /* Foot lines flicker */
          this.footLines.forEach((fl) => {
            fl.mat.opacity = 0.2 + 0.3 * Math.abs(Math.sin(T * 4.0 + fl.phase));
          });

          /* Gyrating ions */
          for (let i = 0; i < this.NION; i++) {
            this.ionAngle[i] += dt * 2.2;
            const gyroR = 20 + 10 * Math.sin(this.ionAngle[i] * 0.5);
            this.ionX[i] += dt * (-25 + 30 * Math.cos(this.ionAngle[i]));
            if (this.ionX[i] < -200) this.ionX[i] = 200;
            this.ionBuf[i * 3]     = this.ionX[i];
            this.ionBuf[i * 3 + 1] = this.ionY[i] + gyroR * Math.sin(this.ionAngle[i]);
            this.ionBuf[i * 3 + 2] = 0;
          }
          this.ions.geometry.attributes.position.needsUpdate = true;

          this.rampMat.opacity = 0.35 + 0.15 * Math.sin(T * 2.5);
          this.ovMat.opacity   = 0.25 + 0.18 * Math.sin(T * 2.5 + 0.8);
        }
      });

      AFRAME.registerComponent("stellar-flux-tube-flicker-emergence", {
        /* Flux tube emergence through the photosphere — a magnetic flux
           tube rises and breaks through, creating a pair of bright
           footpoints that separate while the tube arches upward;
           gold-red-purple palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-500, -1200, -1100);
          this.g = g; this.t = 0; this.phase = 0;

          /* Photosphere plane */
          const phGeo = new THREE.PlaneGeometry(240, 80, 12, 4);
          const phMat = new THREE.MeshBasicMaterial({ color: 0xffaa22, transparent: true, opacity: 0.22, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(phGeo, phMat));

          /* Two footpoints — magnetic polarity regions */
          const fpGeo = new THREE.SphereGeometry(12, 16, 12);
          const fpMatP = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.9 });
          const fpMatN = new THREE.MeshBasicMaterial({ color: 0x7700cc, transparent: true, opacity: 0.9 });
          this.fpP = new THREE.Mesh(fpGeo, fpMatP);
          this.fpN = new THREE.Mesh(fpGeo.clone(), fpMatN);
          g.add(this.fpP); g.add(this.fpN);
          this.fpMatP = fpMatP; this.fpMatN = fpMatN;
          this.sepDist = 0; /* footpoint separation (grows over time) */

          /* Arching tube — series of points forming the arch */
          const NARCH = 24;
          this.archGeo = new THREE.BufferGeometry();
          this.archBuf = new Float32Array(NARCH * 3);
          this.archGeo.setAttribute('position', new THREE.BufferAttribute(this.archBuf, 3));
          const archMat = new THREE.LineBasicMaterial({ color: 0xff8844, transparent: true, opacity: 0.7 });
          g.add(new THREE.Line(this.archGeo, archMat));
          this.archMat = archMat; this.NARCH = NARCH;

          /* Side tubes (lower legs) */
          const NLEG = 10;
          this.legBufP = new Float32Array(NLEG * 3);
          this.legBufN = new Float32Array(NLEG * 3);
          const legGeoP = new THREE.BufferGeometry();
          const legGeoN = new THREE.BufferGeometry();
          legGeoP.setAttribute('position', new THREE.BufferAttribute(this.legBufP, 3));
          legGeoN.setAttribute('position', new THREE.BufferAttribute(this.legBufN, 3));
          const legMatP = new THREE.LineBasicMaterial({ color: 0xffcc66, transparent: true, opacity: 0.5 });
          const legMatN = new THREE.LineBasicMaterial({ color: 0xcc99ff, transparent: true, opacity: 0.5 });
          g.add(new THREE.Line(legGeoP, legMatP));
          g.add(new THREE.Line(legGeoN, legMatN));
          this.legGeoP = legGeoP; this.legGeoN = legGeoN;

          /* Emergence particles — plasma rising with tube */
          const N = 120;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          this.ptT = new Float32Array(N);
          for (let i = 0; i < N; i++) this.ptT[i] = Math.random();
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0xffee99, size: 2.0, transparent: true, opacity: 0.5 });
          this.pts = new THREE.Points(ptGeo, ptMat);
          g.add(this.pts);
          this.ptBuf = ptBuf; this.ptMat = ptMat; this.N = N;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.025;

          /* Footpoints separate slowly */
          this.sepDist = Math.min(90, this.sepDist + dt * 10);
          const sep = this.sepDist;
          this.fpP.position.set(sep, 0, 0);
          this.fpN.position.set(-sep, 0, 0);
          this.fpMatP.opacity = 0.6 + 0.3 * Math.abs(Math.sin(T * 1.8));
          this.fpMatN.opacity = 0.6 + 0.3 * Math.abs(Math.sin(T * 1.8 + 0.5));

          /* Arch builds upward */
          const archH = Math.min(100, this.sepDist * 1.1);
          const NARCH = this.NARCH;
          for (let i = 0; i < NARCH; i++) {
            const u = i / (NARCH - 1);
            const ax = (u - 0.5) * 2 * sep;
            const ay = archH * Math.sin(Math.PI * u) + 2 * Math.sin(T * 3.0 + u * Math.PI * 2) * (1 - u) * u * 4;
            this.archBuf[i * 3]     = ax;
            this.archBuf[i * 3 + 1] = ay;
            this.archBuf[i * 3 + 2] = 0;
          }
          this.archGeo.attributes.position.needsUpdate = true;
          this.archMat.opacity = 0.5 + 0.25 * Math.sin(T * 2.2);

          /* Legs from surface to arch base */
          const NLEG = 10;
          for (let i = 0; i < NLEG; i++) {
            const u = i / (NLEG - 1);
            const py = u * 8;
            const pxP = sep + u * 4 * Math.sin(T * 2.5);
            const pxN = -sep - u * 4 * Math.sin(T * 2.5);
            this.legBufP[i * 3] = pxP; this.legBufP[i * 3 + 1] = -py;
            this.legBufN[i * 3] = pxN; this.legBufN[i * 3 + 1] = -py;
          }
          this.legGeoP.attributes.position.needsUpdate = true;
          this.legGeoN.attributes.position.needsUpdate = true;

          /* Particles rise along arch */
          for (let i = 0; i < this.N; i++) {
            this.ptT[i] = (this.ptT[i] + dt * 0.15) % 1;
            const u = this.ptT[i];
            const ax = (u - 0.5) * 2 * sep;
            const ay = archH * Math.sin(Math.PI * u);
            const jitter = (Math.random() - 0.5) * 6;
            this.ptBuf[i * 3]     = ax + jitter;
            this.ptBuf[i * 3 + 1] = ay + jitter * 0.5;
            this.ptBuf[i * 3 + 2] = jitter * 0.3;
          }
          this.pts.geometry.attributes.position.needsUpdate = true;
          this.ptMat.opacity = 0.35 + 0.2 * Math.sin(T * 2.8);
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) {
  console.error("JS anchor not found!");
  process.exit(1);
}
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR =
  "      <a-entity stellar-convective-downflow-lane></a-entity>";
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-bow-shock-overshoot></a-entity>
      <a-entity stellar-flux-tube-flicker-emergence></a-entity>`;

if (!html.includes(HTML_ANCHOR)) {
  console.error("HTML anchor not found!");
  process.exit(1);
}
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lines = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 134 injected! Lines: " + lines);
