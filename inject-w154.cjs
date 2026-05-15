/**
 * inject-w154.cjs  — Wave 154
 * cosmic-heliospheric-current-sheet-ripple  + stellar-chromospheric-flash-spectrum
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-heliospheric-current-sheet-ripple"')) {
  console.log('Wave 154 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-heliospheric-current-sheet-ripple", {
        /* Heliospheric current sheet (HCS) — the warped surface in the
           heliosphere separating opposite magnetic polarities; follows
           the solar equatorial plane with a wavy "ballerina skirt" shape;
           extends to the heliopause; ripples and rotates with the sun;
           white-blue warped sheet, yellow sector boundaries;
           white, blue, yellow, gold palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-1200, 200, 5800);
          this.g = g; this.t = 0;

          /* HCS sheet — parametric warped surface */
          const NU = 60; const NV = 40;
          const sheetGeo = new THREE.BufferGeometry();
          const sheetVerts = new Float32Array(NU * NV * 3);
          this.sheetVerts = sheetVerts;
          this.NU = NU; this.NV = NV;
          for (let iu = 0; iu < NU; iu++) {
            for (let iv = 0; iv < NV; iv++) {
              sheetVerts[(iu * NV + iv) * 3]     = 0;
              sheetVerts[(iu * NV + iv) * 3 + 1] = 0;
              sheetVerts[(iu * NV + iv) * 3 + 2] = 0;
            }
          }
          sheetGeo.setAttribute('position', new THREE.BufferAttribute(sheetVerts, 3));
          const sheetMat = new THREE.PointsMaterial({ color: 0xaaccff, size: 0.8, transparent: true, opacity: 0.28 });
          g.add(new THREE.Points(sheetGeo, sheetMat));
          this.sheetMat = sheetMat;

          /* Sector boundaries — radial lines of polarity reversal */
          const NSECT = 4;
          this.sectors = [];
          for (let s = 0; s < NSECT; s++) {
            const pts = [];
            for (let k = 0; k < 30; k++) pts.push(new THREE.Vector3(0, 0, 0));
            const sGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const sMat = new THREE.LineBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.4 });
            g.add(new THREE.Line(sGeo, sMat));
            this.sectors.push({ geo: sGeo, mat: sMat, pts, basePhi: (s / NSECT) * Math.PI * 2 });
          }

          /* Polarity indicator particles — blue and gold */
          const NPL = 300;
          const plGeo = new THREE.BufferGeometry();
          const plBuf = new Float32Array(NPL * 3);
          const plCol = new Float32Array(NPL * 3);
          this.plBuf = plBuf; this.NPL = NPL;
          this.plR   = new Float32Array(NPL);
          this.plPh  = new Float32Array(NPL);
          this.plSign = new Int8Array(NPL);
          for (let i = 0; i < NPL; i++) {
            this.plR[i]    = 50 + Math.random() * 110;
            this.plPh[i]   = Math.random() * Math.PI * 2;
            this.plSign[i] = (Math.random() > 0.5) ? 1 : -1;
            const c = this.plSign[i] > 0 ? [0.2, 0.4, 1.0] : [1.0, 0.8, 0.2];
            plCol[i * 3] = c[0]; plCol[i * 3 + 1] = c[1]; plCol[i * 3 + 2] = c[2];
          }
          plGeo.setAttribute('position', new THREE.BufferAttribute(plBuf, 3));
          plGeo.setAttribute('color',    new THREE.BufferAttribute(plCol, 3));
          const plMat = new THREE.PointsMaterial({ vertexColors: true, size: 1.0, transparent: true, opacity: 0.35 });
          g.add(new THREE.Points(plGeo, plMat));
          this.plMat = plMat;

          /* Sun sphere */
          const sunGeo = new THREE.SphereGeometry(14, 14, 10);
          const sunMat = new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.75 });
          g.add(new THREE.Mesh(sunGeo, sunMat));
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.005;

          /* Update warped sheet — ballerina skirt ripple */
          const NU = this.NU; const NV = this.NV;
          for (let iu = 0; iu < NU; iu++) {
            for (let iv = 0; iv < NV; iv++) {
              const r  = 18 + (iu / (NU - 1)) * 145;
              const ph = (iv / (NV - 1)) * Math.PI * 2;
              const warpAmp = 10 + 6 * Math.sin(T * 0.4);
              const y  = warpAmp * Math.sin(2 * ph - T * 0.35) * Math.sin(0.5 * ph + T * 0.15);
              const idx = (iu * NV + iv) * 3;
              this.sheetVerts[idx]     = r * Math.cos(ph);
              this.sheetVerts[idx + 1] = y;
              this.sheetVerts[idx + 2] = r * Math.sin(ph);
            }
          }
          this.sheetMat.needsUpdate = false;
          this.sheetMat.opacity = 0.2 + 0.1 * Math.abs(Math.sin(T * 0.3));

          /* Sector radial lines */
          this.sectors.forEach((sec, si) => {
            const ph = sec.basePhi + T * 0.05;
            const N  = 30;
            for (let k = 0; k < N; k++) {
              const r = 18 + (k / (N - 1)) * 145;
              const warpAmp = 10 + 6 * Math.sin(T * 0.4);
              const y = warpAmp * Math.sin(2 * ph - T * 0.35) * 0.4;
              sec.pts[k].set(r * Math.cos(ph), y, r * Math.sin(ph));
            }
            sec.geo.setFromPoints(sec.pts);
            sec.mat.opacity = 0.3 + 0.15 * Math.abs(Math.sin(T * 0.5 + si));
          });

          /* Polarity particles rotating with sheet */
          for (let i = 0; i < this.NPL; i++) {
            this.plPh[i] += dt * (0.02 + 0.01 * this.plSign[i]);
            const r  = this.plR[i];
            const ph = this.plPh[i];
            const warpAmp = 10 + 6 * Math.sin(T * 0.4);
            const y  = warpAmp * Math.sin(2 * ph - T * 0.35) * Math.sin(0.5 * ph + T * 0.15) + this.plSign[i] * 2;
            this.plBuf[i * 3]     = r * Math.cos(ph);
            this.plBuf[i * 3 + 1] = y;
            this.plBuf[i * 3 + 2] = r * Math.sin(ph);
          }
          this.plMat.opacity = 0.28 + 0.12 * Math.abs(Math.sin(T * 0.6));
        }
      });

      AFRAME.registerComponent("stellar-chromospheric-flash-spectrum", {
        /* Flash spectrum at totality — during a solar eclipse the
           chromosphere emits an emission-line spectrum for 1-2 seconds
           as the photosphere is occulted; bright arcs of different
           emission-line colors; crescent arc of colored stripes;
           red H-alpha, blue H-beta, green Ca-H, yellow Na D;
           red, blue, green, yellow palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(6200, 2800, 1000);
          this.g = g; this.t = 0;

          /* Moon disc (occulting) */
          const moonGeo = new THREE.SphereGeometry(24, 14, 10);
          const moonMat = new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.92 });
          g.add(new THREE.Mesh(moonGeo, moonMat));

          /* Solar limb behind — partial */
          const limGeo = new THREE.SphereGeometry(25, 14, 10);
          const limMat = new THREE.MeshBasicMaterial({ color: 0xffaa22, transparent: true, opacity: 0.25 });
          g.add(new THREE.Mesh(limGeo, limMat));

          /* Flash spectrum arcs — colored emission lines around the crescent */
          const LINES = [
            { color: 0xff2222, r: 25.5, label: 'Ha', halfArc: 0.55 },
            { color: 0x4488ff, r: 26.2, label: 'Hb', halfArc: 0.45 },
            { color: 0x22cc66, r: 26.9, label: 'CaK', halfArc: 0.40 },
            { color: 0xffdd22, r: 27.6, label: 'NaD', halfArc: 0.38 },
            { color: 0xff8822, r: 28.3, label: 'HeD3', halfArc: 0.35 },
            { color: 0xcc44ff, r: 29.0, label: 'CaH', halfArc: 0.30 },
          ];
          this.specArcs = [];
          LINES.forEach((ln) => {
            const NARC = 40;
            const pts  = [];
            for (let k = 0; k < NARC; k++) {
              const ang = (k / (NARC - 1) - 0.5) * Math.PI * 2 * ln.halfArc + Math.PI;
              pts.push(new THREE.Vector3(ln.r * Math.cos(ang), ln.r * Math.sin(ang), 0));
            }
            const arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const arcMat = new THREE.LineBasicMaterial({ color: ln.color, transparent: true, opacity: 0 });
            g.add(new THREE.Line(arcGeo, arcMat));
            this.specArcs.push({ mat: arcMat, geo: arcGeo, pts, r: ln.r, halfArc: ln.halfArc });
          });

          /* Chromospheric emission cloud near crescent */
          const NCHROM = 200;
          const chGeo  = new THREE.BufferGeometry();
          const chBuf  = new Float32Array(NCHROM * 3);
          const chCol  = new Float32Array(NCHROM * 3);
          this.chBuf = chBuf; this.NCHROM = NCHROM;
          this.chT   = new Float32Array(NCHROM);
          for (let i = 0; i < NCHROM; i++) {
            this.chT[i] = Math.random();
            const ang = (Math.random() - 0.5) * Math.PI * 2 + Math.PI;
            const c   = LINES[Math.floor(Math.random() * LINES.length)];
            const col = new THREE.Color(c.color);
            chCol[i * 3] = col.r; chCol[i * 3 + 1] = col.g; chCol[i * 3 + 2] = col.b;
            chBuf[i * 3]     = (c.r + 0.5 + Math.random() * 2) * Math.cos(ang);
            chBuf[i * 3 + 1] = (c.r + 0.5 + Math.random() * 2) * Math.sin(ang);
            chBuf[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
          }
          chGeo.setAttribute('position', new THREE.BufferAttribute(chBuf, 3));
          chGeo.setAttribute('color',    new THREE.BufferAttribute(chCol, 3));
          const chMat = new THREE.PointsMaterial({ vertexColors: true, size: 1.1, transparent: true, opacity: 0 });
          g.add(new THREE.Points(chGeo, chMat));
          this.chMat = chMat;
          this.flashPhase = 0;
          this.flashPeriod = 7;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;
          this.g.rotation.y += dt * 0.018;

          /* Flash cycle */
          this.flashPhase = (this.flashPhase + dt) % this.flashPeriod;
          const fp = this.flashPhase / this.flashPeriod;
          let flashAlpha;
          if (fp < 0.03) {
            flashAlpha = fp / 0.03;
          } else if (fp < 0.15) {
            flashAlpha = 1 - (fp - 0.03) / 0.12 * 0.6;
          } else if (fp < 0.3) {
            flashAlpha = 0.4 - (fp - 0.15) / 0.15 * 0.4;
          } else {
            flashAlpha = 0;
          }
          flashAlpha = Math.max(0, flashAlpha);

          this.specArcs.forEach((arc, ai) => {
            arc.mat.opacity = flashAlpha * (0.7 + 0.2 * Math.sin(T * 2 + ai));
          });
          this.chMat.opacity = flashAlpha * 0.55;
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-sunspot-light-bridge-plasma-jet></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-heliospheric-current-sheet-ripple></a-entity>
      <a-entity stellar-chromospheric-flash-spectrum></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 154 injected! Lines: ' + lines);
