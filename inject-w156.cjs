/**
 * inject-w156.cjs  — Wave 156
 * cosmic-interplanetary-magnetic-sector-boundary  + stellar-annular-eclipse-ring
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-interplanetary-magnetic-sector-boundary"')) {
  console.log('Wave 156 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-interplanetary-magnetic-sector-boundary", {
        /* Interplanetary magnetic sector boundary (IMSB) — the abrupt
           reversal of the IMF polarity (toward / away from the sun)
           as planets cross the heliospheric current sheet;
           Parker-spiral field lines in two opposing sectors,
           a distinct boundary plane between them;
           blue sector vs. gold sector separated by a pale white plane;
           blue, gold, white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(4200, 3500, -6000);
          this.g = g; this.t = 0;

          /* Sector plane boundary */
          const plGeo = new THREE.PlaneGeometry(280, 160, 1, 1);
          const plMat = new THREE.MeshBasicMaterial({ color: 0xddeeff, transparent: true, opacity: 0.07, side: THREE.DoubleSide });
          const plMesh = new THREE.Mesh(plGeo, plMat);
          plMesh.rotation.z = 0.12;
          g.add(plMesh);
          this.plMat = plMat;

          /* Parker spiral lines — positive sector (blue/toward) */
          const NLINES = 8; const NPT = 30;
          this.blueLines = [];
          for (let l = 0; l < NLINES; l++) {
            const pts = [];
            for (let k = 0; k < NPT; k++) {
              const t  = k / (NPT - 1);
              const ph = l * (Math.PI / NLINES) - Math.PI * 0.5 + t * 1.5;
              const r  = 15 + t * 120;
              pts.push(new THREE.Vector3(r * Math.cos(ph), (Math.random() - 0.5) * 8, r * Math.sin(ph)));
            }
            const lGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const lMat = new THREE.LineBasicMaterial({ color: 0x3399ff, transparent: true, opacity: 0.4 });
            g.add(new THREE.Line(lGeo, lMat));
            this.blueLines.push(lMat);
          }

          /* Parker spiral lines — negative sector (gold/away) */
          this.goldLines = [];
          for (let l = 0; l < NLINES; l++) {
            const pts = [];
            for (let k = 0; k < NPT; k++) {
              const t  = k / (NPT - 1);
              const ph = l * (Math.PI / NLINES) + Math.PI * 0.5 + t * 1.5;
              const r  = 15 + t * 120;
              pts.push(new THREE.Vector3(r * Math.cos(ph), (Math.random() - 0.5) * 8, r * Math.sin(ph)));
            }
            const lGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const lMat = new THREE.LineBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.4 });
            g.add(new THREE.Line(lGeo, lMat));
            this.goldLines.push(lMat);
          }

          /* Field-direction arrows (blue sector) */
          const NARR = 5;
          this.arrows = [];
          for (let a = 0; a < NARR; a++) {
            const origin = new THREE.Vector3(-60 + a * 28, 0, (Math.random() - 0.5) * 30);
            const dir    = new THREE.Vector3(0.7, 0.0, -0.7).normalize();
            const arrowHelper = new THREE.ArrowHelper(dir, origin, 22, 0x3399ff, 5, 3);
            arrowHelper.line.material.transparent = true;
            arrowHelper.line.material.opacity = 0.45;
            g.add(arrowHelper);
            this.arrows.push(arrowHelper);
          }

          /* Boundary particles */
          const NBP = 150;
          const bpGeo = new THREE.BufferGeometry();
          const bpBuf = new Float32Array(NBP * 3);
          this.bpBuf = bpBuf; this.NBP = NBP;
          for (let i = 0; i < NBP; i++) {
            bpBuf[i * 3]     = (Math.random() - 0.5) * 250;
            bpBuf[i * 3 + 1] = (Math.random() - 0.5) * 120;
            bpBuf[i * 3 + 2] = (Math.random() - 0.5) * 8;
          }
          bpGeo.setAttribute('position', new THREE.BufferAttribute(bpBuf, 3));
          const bpMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.9, transparent: true, opacity: 0.35 });
          g.add(new THREE.Points(bpGeo, bpMat));
          this.bpMat = bpMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.006;
          this.plMat.opacity = 0.05 + 0.04 * Math.abs(Math.sin(T * 0.3));
          this.blueLines.forEach((m, i) => { m.opacity = 0.3 + 0.15 * Math.abs(Math.sin(T * 0.4 + i)); });
          this.goldLines.forEach((m, i) => { m.opacity = 0.3 + 0.15 * Math.abs(Math.sin(T * 0.45 + i)); });
          this.bpMat.opacity = 0.25 + 0.1 * Math.abs(Math.sin(T * 0.55));
        }
      });

      AFRAME.registerComponent("stellar-annular-eclipse-ring", {
        /* Annular solar eclipse — "ring of fire"; when the moon is
           near apogee its angular diameter is smaller than the sun's
           leaving a brilliant annulus of photosphere; Baily's beads
           visible at start and end; intense chromatic ring;
           gold-orange ring, bright beads, dark moon disc;
           gold, orange, white, red palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-3200, -1800, -5200);
          this.g = g; this.t = 0;

          /* Sun disc background glow */
          const sunGeo = new THREE.SphereGeometry(30, 16, 12);
          const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa22, transparent: true, opacity: 0.55 });
          g.add(new THREE.Mesh(sunGeo, sunMat));
          this.sunMat = sunMat;

          /* Moon disc (slightly smaller — annular condition) */
          const moonGeo = new THREE.SphereGeometry(26, 16, 12);
          const moonMat = new THREE.MeshBasicMaterial({ color: 0x080808, transparent: true, opacity: 0.95 });
          g.add(new THREE.Mesh(moonGeo, moonMat));

          /* Annular ring */
          const NRING = 80;
          const ringPts = [];
          for (let k = 0; k < NRING; k++) {
            const ang = (k / (NRING - 1)) * Math.PI * 2;
            ringPts.push(new THREE.Vector3(27.2 * Math.cos(ang), 27.2 * Math.sin(ang), 0));
          }
          const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
          const ringMat = new THREE.LineBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.9 });
          g.add(new THREE.Line(ringGeo, ringMat));
          this.ringMat = ringMat;

          /* Inner edge of annulus — brighter */
          const NRING2 = 80;
          const ring2Pts = [];
          for (let k = 0; k < NRING2; k++) {
            const ang = (k / (NRING2 - 1)) * Math.PI * 2;
            ring2Pts.push(new THREE.Vector3(26.2 * Math.cos(ang), 26.2 * Math.sin(ang), 0));
          }
          const ring2Geo = new THREE.BufferGeometry().setFromPoints(ring2Pts);
          const ring2Mat = new THREE.LineBasicMaterial({ color: 0xff8822, transparent: true, opacity: 0.7 });
          g.add(new THREE.Line(ring2Geo, ring2Mat));

          /* Baily's beads — bright spots at limb contacts */
          const NBEADS = 14;
          const beadGeo = new THREE.BufferGeometry();
          const beadBuf = new Float32Array(NBEADS * 3);
          this.beadBuf = beadBuf; this.NBEADS = NBEADS;
          this.beadPh  = new Float32Array(NBEADS);
          for (let i = 0; i < NBEADS; i++) {
            this.beadPh[i]       = (i / NBEADS) * Math.PI * 2;
            beadBuf[i * 3]       = 26.7 * Math.cos(this.beadPh[i]);
            beadBuf[i * 3 + 1]   = 26.7 * Math.sin(this.beadPh[i]);
            beadBuf[i * 3 + 2]   = 0;
          }
          beadGeo.setAttribute('position', new THREE.BufferAttribute(beadBuf, 3));
          const beadMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.8, transparent: true, opacity: 0.85 });
          g.add(new THREE.Points(beadGeo, beadMat));
          this.beadMat = beadMat;

          /* Outer corona halos */
          const NCOR = 5;
          this.coronaRings = [];
          for (let c = 0; c < NCOR; c++) {
            const NCPTS = 60;
            const cPts = [];
            const r = 30 + c * 5;
            for (let k = 0; k < NCPTS; k++) {
              const ang = (k / (NCPTS - 1)) * Math.PI * 2;
              cPts.push(new THREE.Vector3(r * Math.cos(ang), r * Math.sin(ang), 0));
            }
            const cGeo = new THREE.BufferGeometry().setFromPoints(cPts);
            const cMat = new THREE.LineBasicMaterial({ color: 0xffdd88, transparent: true, opacity: 0.08 - c * 0.012 });
            g.add(new THREE.Line(cGeo, cMat));
            this.coronaRings.push(cMat);
          }
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.z += dt * 0.01;

          /* Baily's beads twinkle */
          for (let i = 0; i < this.NBEADS; i++) {
            const flash = Math.sin(T * 3 + i * 0.8) > 0.7 ? 1 : 0.2;
            this.beadBuf[i * 3]     = 26.7 * Math.cos(this.beadPh[i]);
            this.beadBuf[i * 3 + 1] = 26.7 * Math.sin(this.beadPh[i]);
          }
          this.beadMat.opacity = 0.6 + 0.35 * Math.abs(Math.sin(T * 2.5));
          this.ringMat.opacity = 0.75 + 0.2 * Math.abs(Math.sin(T * 1.5));
          this.sunMat.opacity  = 0.45 + 0.1 * Math.abs(Math.sin(T * 0.4));
          this.coronaRings.forEach((m, ci) => {
            m.opacity = (0.08 - ci * 0.012) + 0.04 * Math.abs(Math.sin(T * 0.35 + ci));
          });
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-coronal-pseudo-streamer></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-interplanetary-magnetic-sector-boundary></a-entity>
      <a-entity stellar-annular-eclipse-ring></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 156 injected! Lines: ' + lines);
