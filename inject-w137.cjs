/**
 * inject-w137.cjs  — Wave 137
 * cosmic-whistler-chorus-burst  + stellar-superflare-spray
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-whistler-chorus-burst"')) {
  console.log('Wave 137 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-whistler-chorus-burst", {
        /* Whistler-mode chorus waves in a planetary magnetosphere —
           rising-tone bursts generated near the magnetic equator,
           propagating along field lines; teal-cyan-white palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(2200, 400, -1800);
          this.g = g; this.t = 0;

          /* Dipole field shell (L=4) — egg-shaped */
          const NFLD = 12;
          this.fldLines = [];
          for (let f = 0; f < NFLD; f++) {
            const phi = (f / NFLD) * Math.PI * 2;
            const NP = 40;
            const pts = [];
            for (let p = 0; p < NP; p++) {
              const theta = Math.PI * 0.15 + (p / (NP - 1)) * Math.PI * 0.7;
              const L = 90; /* L-shell radius */
              const r = L * Math.pow(Math.sin(theta), 2);
              pts.push(new THREE.Vector3(
                r * Math.sin(theta) * Math.cos(phi),
                r * Math.cos(theta),
                r * Math.sin(theta) * Math.sin(phi)
              ));
            }
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const hue = 0.50 + f * 0.008;
            const col = new THREE.Color();
            col.setHSL(hue, 0.75, 0.5);
            const mat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.25 });
            g.add(new THREE.Line(geo, mat));
            this.fldLines.push({ mat, phi, pts });
          }

          /* Rising-tone chorus bursts — animated particles that travel
             along a field line and get brighter as they rise */
          const NBURST = 60;
          const bGeo = new THREE.BufferGeometry();
          const bBuf = new Float32Array(NBURST * 3);
          this.bU      = new Float32Array(NBURST);
          this.bPhi    = new Float32Array(NBURST);
          this.bBright = new Float32Array(NBURST);
          this.bSpd    = new Float32Array(NBURST);
          for (let i = 0; i < NBURST; i++) {
            this.bU[i]      = Math.random();
            this.bPhi[i]    = Math.random() * Math.PI * 2;
            this.bBright[i] = Math.random();
            this.bSpd[i]    = 0.15 + Math.random() * 0.3;
          }
          bGeo.setAttribute('position', new THREE.BufferAttribute(bBuf, 3));
          const bMat = new THREE.PointsMaterial({ color: 0x44ffee, size: 3.5, transparent: true, opacity: 0.7 });
          g.add(new THREE.Points(bGeo, bMat));
          this.bBuf = bBuf; this.bMat = bMat; this.NBURST = NBURST;

          /* Equatorial plane disc — emission region */
          const eqGeo = new THREE.RingGeometry(20, 100, 40);
          const eqMat = new THREE.MeshBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
          const eqMesh = new THREE.Mesh(eqGeo, eqMat);
          eqMesh.rotation.x = Math.PI / 2;
          g.add(eqMesh);
          this.eqMat = eqMat;

          /* Hiss background band — torus */
          const hGeo = new THREE.TorusGeometry(75, 8, 8, 40);
          const hMat = new THREE.MeshBasicMaterial({ color: 0x0088aa, transparent: true, opacity: 0.12, wireframe: false });
          this.hissRing = new THREE.Mesh(hGeo, hMat);
          this.hissRing.rotation.x = Math.PI / 2;
          g.add(this.hissRing);
          this.hMat = hMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.025;

          /* Burst particles travel from equator toward poles */
          for (let i = 0; i < this.NBURST; i++) {
            this.bU[i] = (this.bU[i] + dt * this.bSpd[i]) % 1;
            const u = this.bU[i];
            const phi = this.bPhi[i];
            /* Dipole field path */
            const theta = Math.PI * 0.15 + u * Math.PI * 0.7;
            const L = 90;
            const r = L * Math.pow(Math.sin(theta), 2);
            this.bBuf[i * 3]     = r * Math.sin(theta) * Math.cos(phi);
            this.bBuf[i * 3 + 1] = r * Math.cos(theta);
            this.bBuf[i * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);
            /* Chorus tone rising = brighter near equator departure */
            this.bBright[i] = Math.max(0, Math.sin(u * Math.PI));
          }
          this.bMat.opacity = 0.5 + 0.25 * Math.abs(Math.sin(T * 3.0));
          this.bMat.size = 2.5 + 1.5 * Math.abs(Math.sin(T * 2.5));
          this.bMat.needsUpdate = true;
          this.bBuf.fill && 0;
          this.hissRing.geometry.attributes && 0;
          this.eqMat.opacity = 0.05 + 0.06 * Math.abs(Math.sin(T * 2.0));
          this.hMat.opacity  = 0.08 + 0.06 * Math.abs(Math.sin(T * 1.5));

          /* Rotate hiss ring slowly */
          this.hissRing.rotation.z += dt * 0.1;
        }
      });

      AFRAME.registerComponent("stellar-superflare-spray", {
        /* Stellar superflare — an X-class flare event 10-1000x stronger
           than typical solar flares, seen on solar-type stars;
           white-blue-violet spray of plasma + gamma-ray burst ribbons;
           hot-white, blue, purple palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-2200, 1200, -800);
          this.g = g; this.t = 0;

          /* Stellar disk */
          const sdGeo = new THREE.SphereGeometry(55, 32, 24);
          const sdMat = new THREE.MeshBasicMaterial({ color: 0xffeecc, transparent: true, opacity: 0.55 });
          g.add(new THREE.Mesh(sdGeo, sdMat));
          this.sdMat = sdMat;

          /* Flare ribbons — two bright arcs sweeping outward */
          const NRIB = 4;
          this.ribbons = [];
          for (let r = 0; r < NRIB; r++) {
            const NP = 30;
            const rGeo = new THREE.BufferGeometry();
            const rBuf = new Float32Array(NP * 3);
            rGeo.setAttribute('position', new THREE.BufferAttribute(rBuf, 3));
            const hue = 0.65 + r * 0.04;
            const col = new THREE.Color();
            col.setHSL(hue, 0.9, 0.75);
            const rMat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.75, linewidth: 2 });
            g.add(new THREE.Line(rGeo, rMat));
            this.ribbons.push({ rBuf, geo: rGeo, mat: rMat, side: r % 2 === 0 ? 1 : -1, phase: r * 0.4 });
          }

          /* Ejecta spray — high-energy particles flying outward */
          const NSPRAY = 250;
          const spGeo = new THREE.BufferGeometry();
          const spBuf = new Float32Array(NSPRAY * 3);
          this.spDir  = [];
          this.spR    = new Float32Array(NSPRAY);
          this.spMax  = new Float32Array(NSPRAY);
          this.spActive = new Uint8Array(NSPRAY);
          for (let i = 0; i < NSPRAY; i++) {
            const theta = (Math.random() - 0.5) * Math.PI * 0.7 + Math.PI / 2;
            const phi   = (Math.random() - 0.5) * Math.PI * 0.9;
            this.spDir.push(new THREE.Vector3(
              Math.cos(phi) * Math.sin(theta),
              Math.cos(theta),
              Math.sin(phi) * Math.sin(theta)
            ).normalize());
            this.spR[i]   = 55 + Math.random() * 5;
            this.spMax[i] = 120 + Math.random() * 180;
            this.spActive[i] = 0;
          }
          spGeo.setAttribute('position', new THREE.BufferAttribute(spBuf, 3));
          const spMat = new THREE.PointsMaterial({ color: 0xaaccff, size: 2.5, transparent: true, opacity: 0.65 });
          this.spray = new THREE.Points(spGeo, spMat);
          g.add(this.spray);
          this.spBuf = spBuf; this.spMat = spMat; this.NSPRAY = NSPRAY;

          /* Flash corona */
          const fcGeo = new THREE.SphereGeometry(70, 24, 16);
          const fcMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 });
          this.fcMesh = new THREE.Mesh(fcGeo, fcMat);
          g.add(this.fcMesh);
          this.fcMat = fcMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.02;

          /* Superflare repeats every ~8s */
          const cycle = T % 8;
          const flaring = cycle < 3;
          const intensity = flaring ? Math.sin((cycle / 3) * Math.PI) : 0;

          /* Flash */
          this.fcMat.opacity = intensity * 0.35;
          this.sdMat.opacity = 0.5 + intensity * 0.45;

          /* Ribbons sweep outward during flare */
          this.ribbons.forEach((rb) => {
            const NP = 30;
            const sweep = intensity * 40;
            const startAngle = rb.side * 0.3 + rb.phase;
            for (let p = 0; p < NP; p++) {
              const u = p / (NP - 1);
              const ang = startAngle + rb.side * u * (0.6 + sweep * 0.015);
              const r = 55 + u * (15 + sweep * 0.4);
              rb.rBuf[p * 3]     = r * Math.cos(ang);
              rb.rBuf[p * 3 + 1] = r * Math.sin(ang) * 0.3;
              rb.rBuf[p * 3 + 2] = r * Math.sin(ang + rb.phase);
            }
            rb.geo.attributes.position.needsUpdate = true;
            rb.mat.opacity = intensity * 0.75;
          });

          /* Spray particles launch during peak */
          if (flaring && cycle > 0.5) {
            for (let i = 0; i < this.NSPRAY; i++) {
              if (!this.spActive[i] && Math.random() < 0.06) {
                this.spActive[i] = 1;
                this.spR[i] = 55;
              }
            }
          }
          if (!flaring) {
            for (let i = 0; i < this.NSPRAY; i++) {
              if (this.spR[i] > this.spMax[i]) { this.spActive[i] = 0; this.spR[i] = 55; }
            }
          }
          for (let i = 0; i < this.NSPRAY; i++) {
            if (this.spActive[i]) {
              this.spR[i] += dt * (80 + intensity * 60);
              if (this.spR[i] > this.spMax[i]) { this.spActive[i] = 0; this.spR[i] = 55; }
            }
            const r = this.spActive[i] ? this.spR[i] : 9999;
            const d = this.spDir[i];
            this.spBuf[i * 3]     = d.x * r;
            this.spBuf[i * 3 + 1] = d.y * r;
            this.spBuf[i * 3 + 2] = d.z * r;
          }
          this.spray.geometry.attributes.position.needsUpdate = true;
          this.spMat.opacity = 0.45 + intensity * 0.3;
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-pore-formation-cluster></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-whistler-chorus-burst></a-entity>
      <a-entity stellar-superflare-spray></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 137 injected! Lines: ' + lines);
