/**
 * inject-w141.cjs  — Wave 141
 * cosmic-plasma-double-layer-burst  + stellar-differential-magnetic-twist
 */
"use strict";
const fs = require("fs");
const FILE = "public/cosmos-infinite.html";

let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

if (html.includes('registerComponent("cosmic-plasma-double-layer-burst"')) {
  console.log("Wave 141 already injected.");
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-plasma-double-layer-burst", {
        /* Plasma double-layer — thin electrostatic potential jump in a
           current-carrying plasma; accelerates ions one way, electrons
           the other; creates counter-streaming beams; occasional
           burst/collapse cycle; electric blue-white-orange palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(3400, 1200, -800);
          this.g = g; this.t = 0;

          /* Current channel — thin cylinder */
          const chGeo = new THREE.CylinderGeometry(6, 6, 240, 16, 1, true);
          const chMat = new THREE.MeshBasicMaterial({ color: 0x0044ff, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
          g.add(new THREE.Mesh(chGeo, chMat));
          this.chMat = chMat;

          /* Double-layer slab */
          const dlGeo = new THREE.CylinderGeometry(14, 14, 10, 20, 1, false);
          const dlMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
          g.add(new THREE.Mesh(dlGeo, dlMat));
          this.dlMat = dlMat;
          this.dlTimer = 0;

          /* Ion beam — streaming up from DL */
          const NI = 150;
          const iGeo = new THREE.BufferGeometry();
          const iBuf = new Float32Array(NI * 3);
          this.iY   = new Float32Array(NI);
          this.iPhi = new Float32Array(NI);
          for (let i = 0; i < NI; i++) {
            this.iY[i]   = Math.random() * 120;
            this.iPhi[i] = Math.random() * Math.PI * 2;
          }
          iGeo.setAttribute('position', new THREE.BufferAttribute(iBuf, 3));
          const iMat = new THREE.PointsMaterial({ color: 0xff8800, size: 2.5, transparent: true, opacity: 0.7 });
          g.add(new THREE.Points(iGeo, iMat));
          this.iBuf = iBuf; this.iMat = iMat; this.NI = NI;

          /* Electron beam — streaming down from DL */
          const NE = 150;
          const eGeo = new THREE.BufferGeometry();
          const eBuf = new Float32Array(NE * 3);
          this.eY   = new Float32Array(NE);
          this.ePhi = new Float32Array(NE);
          for (let i = 0; i < NE; i++) {
            this.eY[i]   = -Math.random() * 120;
            this.ePhi[i] = Math.random() * Math.PI * 2;
          }
          eGeo.setAttribute('position', new THREE.BufferAttribute(eBuf, 3));
          const eMat = new THREE.PointsMaterial({ color: 0x44aaff, size: 2.0, transparent: true, opacity: 0.65 });
          g.add(new THREE.Points(eGeo, eMat));
          this.eBuf = eBuf; this.eMat = eMat; this.NE = NE;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.02;

          /* DL burst cycle every 7s */
          this.dlTimer += dt;
          const burst = Math.max(0, Math.sin((this.dlTimer % 7) * Math.PI / 1.2));
          this.dlMat.opacity = 0.2 + 0.8 * burst;
          this.chMat.opacity  = 0.12 + 0.2 * burst;

          /* Ion beam rising */
          const iSpd = 30 + 90 * burst;
          for (let i = 0; i < this.NI; i++) {
            this.iY[i] += dt * iSpd;
            if (this.iY[i] > 120) this.iY[i] = 0;
            const r = 3 + 2.5 * Math.random();
            this.iBuf[i * 3]     = r * Math.cos(this.iPhi[i]);
            this.iBuf[i * 3 + 1] = this.iY[i];
            this.iBuf[i * 3 + 2] = r * Math.sin(this.iPhi[i]);
          }
          this.iMat.opacity = 0.4 + 0.4 * burst;

          /* Electron beam falling */
          const eSpd = 50 + 120 * burst;
          for (let i = 0; i < this.NE; i++) {
            this.eY[i] -= dt * eSpd;
            if (this.eY[i] < -120) this.eY[i] = 0;
            const r = 3 + 2.5 * Math.random();
            this.eBuf[i * 3]     = r * Math.cos(this.ePhi[i]);
            this.eBuf[i * 3 + 1] = this.eY[i];
            this.eBuf[i * 3 + 2] = r * Math.sin(this.ePhi[i]);
          }
          this.eMat.opacity = 0.4 + 0.4 * burst;
        }
      });

      AFRAME.registerComponent("stellar-differential-magnetic-twist", {
        /* Differential rotation along a magnetic flux tube in a stellar
           atmosphere — the tube is wound/twisted at different rates by
           different latitudes, building up free energy; coronal
           braiding; the twist accumulates then partially reconnects
           every ~11s; rope-purple-gold palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-1600, 3200, -1200);
          this.g = g; this.t = 0;

          /* Footpoint discs */
          const mkDisc = (y) => {
            const dGeo = new THREE.CircleGeometry(20, 20);
            const dMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
            const d = new THREE.Mesh(dGeo, dMat);
            d.rotation.x = Math.PI / 2;
            d.position.y = y;
            g.add(d);
            return dMat;
          };
          this.footN = mkDisc(90);
          this.footS = mkDisc(-90);

          /* Twisted flux rope — multi-strand tube */
          const NSTRAND = 5;
          this.strands = [];
          for (let s = 0; s < NSTRAND; s++) {
            const N = 60;
            const pts = [];
            const phiBase = (s / NSTRAND) * Math.PI * 2;
            for (let k = 0; k < N; k++) {
              const t = k / (N - 1);
              const y = -90 + t * 180;
              const twist = phiBase + t * 0;   /* twist added in tick */
              const r = 8;
              pts.push(new THREE.Vector3(r * Math.cos(twist), y, r * Math.sin(twist)));
            }
            const curve = new THREE.CatmullRomCurve3(pts);
            const tubeGeo = new THREE.TubeGeometry(curve, 40, 1.5, 6, false);
            const hue = 0.72 + s * 0.04;
            const col = new THREE.Color();
            col.setHSL(hue % 1, 0.85, 0.6);
            const tubeMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55 });
            const tube = new THREE.Mesh(tubeGeo, tubeMat);
            g.add(tube);
            this.strands.push({ mesh: tube, mat: tubeMat, phiBase, N, pts, curve, geo: tubeGeo });
          }

          /* Release spark particles at reconnection events */
          const NSP = 100;
          const spGeo = new THREE.BufferGeometry();
          const spBuf = new Float32Array(NSP * 3);
          this.spBuf = spBuf; this.spVel = []; this.spLife = new Float32Array(NSP);
          for (let i = 0; i < NSP; i++) {
            this.spVel.push(new THREE.Vector3(0, 0, 0));
            this.spLife[i] = 0;
          }
          spGeo.setAttribute('position', new THREE.BufferAttribute(spBuf, 3));
          const spMat = new THREE.PointsMaterial({ color: 0xffdd55, size: 3, transparent: true, opacity: 0 });
          g.add(new THREE.Points(spGeo, spMat));
          this.spGeo = spGeo; this.spMat = spMat; this.NSP = NSP;
          this.reconnectTimer = 0;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.012;
          this.footN.opacity = 0.35 + 0.15 * Math.sin(T * 1.5);
          this.footS.opacity = 0.35 + 0.15 * Math.sin(T * 1.5 + 1.2);

          /* Grow twist linearly until reconnect */
          const PERIOD = 11;
          const phase = (T % PERIOD) / PERIOD;
          const maxTwist = phase * Math.PI * 5;

          this.strands.forEach((s) => {
            const N = s.N;
            for (let k = 0; k < N; k++) {
              const u = k / (N - 1);
              const y = -90 + u * 180;
              const latFactor = 1 + 0.5 * Math.sin(u * Math.PI);
              const twist = s.phiBase + u * maxTwist * latFactor;
              const r = 8;
              s.pts[k].set(r * Math.cos(twist), y, r * Math.sin(twist));
            }
            const newCurve = new THREE.CatmullRomCurve3(s.pts);
            const newGeo = new THREE.TubeGeometry(newCurve, 40, 1.5, 6, false);
            s.mesh.geometry.dispose();
            s.mesh.geometry = newGeo;
            s.mat.opacity = 0.4 + 0.25 * phase;
          });

          /* Reconnection burst when phase resets */
          this.reconnectTimer += dt;
          if (this.reconnectTimer > PERIOD) {
            this.reconnectTimer = 0;
            for (let i = 0; i < this.NSP; i++) {
              this.spBuf[i * 3] = (Math.random() - 0.5) * 20;
              this.spBuf[i * 3 + 1] = (Math.random() - 0.5) * 60;
              this.spBuf[i * 3 + 2] = (Math.random() - 0.5) * 20;
              const spd = 20 + Math.random() * 60;
              const ang = Math.random() * Math.PI * 2;
              const el  = (Math.random() - 0.5) * Math.PI;
              this.spVel[i].set(spd * Math.cos(el) * Math.cos(ang), spd * Math.sin(el), spd * Math.cos(el) * Math.sin(ang));
              this.spLife[i] = 1.0;
            }
          }

          /* Age spark particles */
          let anyAlive = false;
          for (let i = 0; i < this.NSP; i++) {
            if (this.spLife[i] > 0) {
              anyAlive = true;
              this.spLife[i] -= dt * 0.6;
              this.spBuf[i * 3]     += this.spVel[i].x * dt;
              this.spBuf[i * 3 + 1] += this.spVel[i].y * dt;
              this.spBuf[i * 3 + 2] += this.spVel[i].z * dt;
            }
          }
          this.spGeo.attributes.position.needsUpdate = true;
          this.spMat.opacity = anyAlive ? 0.7 : 0;
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) {
  console.error("JS anchor not found!");
  process.exit(1);
}
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR =
  "      <a-entity stellar-oscillation-mode-splitting></a-entity>";
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-plasma-double-layer-burst></a-entity>
      <a-entity stellar-differential-magnetic-twist></a-entity>`;

if (!html.includes(HTML_ANCHOR)) {
  console.error("HTML anchor not found!");
  process.exit(1);
}
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lines = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 141 injected! Lines: " + lines);
