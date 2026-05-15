/**
 * inject-w150.cjs  — Wave 150
 * cosmic-alfven-wing-induced-current  + stellar-magnetic-bright-point-field
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-alfven-wing-induced-current"')) {
  console.log('Wave 150 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-alfven-wing-induced-current", {
        /* Alfven wings — when Io passes through Jupiter's magnetosphere
           it generates two Alfven wings: current-carrying tubes of
           plasma that bend along field lines down to Jupiter's
           ionosphere and create Io footprint auroras; electric current
           flows along the wing flanks; blue-white wing arcs, purple
           field lines, gold aurora footprint; blue, white, purple,
           gold palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(3600, 1200, 4800);
          this.g = g; this.t = 0;

          /* Jupiter sphere */
          const jGeo = new THREE.SphereGeometry(70, 20, 14);
          const jMat = new THREE.MeshBasicMaterial({ color: 0xddaa66, transparent: true, opacity: 0.55 });
          g.add(new THREE.Mesh(jGeo, jMat));

          /* Io sphere */
          const ioGeo = new THREE.SphereGeometry(8, 10, 8);
          const ioMat = new THREE.MeshBasicMaterial({ color: 0xffee88, transparent: true, opacity: 0.75 });
          this.ioMesh = new THREE.Mesh(ioGeo, ioMat);
          g.add(this.ioMesh);

          /* Two Alfven wing arcs (leading + trailing) */
          this.wings = [];
          for (let w = 0; w < 2; w++) {
            const pts = [];
            for (let k = 0; k < 40; k++) pts.push(new THREE.Vector3(0, 0, 0));
            const wGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const wMat = new THREE.LineBasicMaterial({ color: w === 0 ? 0x66aaff : 0xaaccff, transparent: true, opacity: 0.7, linewidth: 2 });
            const wLine = new THREE.Line(wGeo, wMat);
            g.add(wLine);
            this.wings.push({ geo: wGeo, mat: wMat, pts });
          }

          /* Field lines from Io down to Jupiter */
          const NFL = 8;
          this.fieldLines = [];
          for (let f = 0; f < NFL; f++) {
            const fPts = [];
            for (let k = 0; k < 30; k++) fPts.push(new THREE.Vector3(0, 0, 0));
            const fGeo = new THREE.BufferGeometry().setFromPoints(fPts);
            const fMat = new THREE.LineBasicMaterial({ color: 0xaa66ff, transparent: true, opacity: 0.3 });
            g.add(new THREE.Line(fGeo, fMat));
            this.fieldLines.push({ geo: fGeo, mat: fMat, pts: fPts, angle: (f / NFL) * Math.PI * 2 });
          }

          /* Aurora footprint points on Jupiter pole */
          const NAUR = 60;
          const aGeo = new THREE.BufferGeometry();
          const aBuf = new Float32Array(NAUR * 3);
          this.aBuf = aBuf; this.NAUR = NAUR;
          this.aR    = new Float32Array(NAUR);
          this.aPhi  = new Float32Array(NAUR);
          for (let i = 0; i < NAUR; i++) {
            this.aR[i]   = 70 + Math.random() * 5;
            this.aPhi[i] = Math.random() * Math.PI * 2;
          }
          aGeo.setAttribute('position', new THREE.BufferAttribute(aBuf, 3));
          const aMat = new THREE.PointsMaterial({ color: 0xffcc00, size: 2.0, transparent: true, opacity: 0.7 });
          g.add(new THREE.Points(aGeo, aMat));
          this.aMat = aMat;

          /* Current sheet particles */
          const NCS = 200;
          const csGeo = new THREE.BufferGeometry();
          const csBuf = new Float32Array(NCS * 3);
          this.csBuf = csBuf; this.NCS = NCS;
          this.csT = new Float32Array(NCS);
          for (let i = 0; i < NCS; i++) this.csT[i] = Math.random();
          csGeo.setAttribute('position', new THREE.BufferAttribute(csBuf, 3));
          const csMat = new THREE.PointsMaterial({ color: 0x88ddff, size: 1.2, transparent: true, opacity: 0.45 });
          g.add(new THREE.Points(csGeo, csMat));
          this.csMat = csMat;

          this.ioAngle = 0;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.007;

          /* Io orbital motion */
          this.ioAngle += dt * 0.25;
          const ioR = 130;
          const ioX = ioR * Math.cos(this.ioAngle);
          const ioZ = ioR * Math.sin(this.ioAngle);
          const ioY = 10 * Math.sin(this.ioAngle * 2);
          this.ioMesh.position.set(ioX, ioY, ioZ);

          /* Alfven wings: two arcs from Io bending toward north/south Jupiter poles */
          this.wings.forEach((w, wi) => {
            const sign = wi === 0 ? 1 : -1;
            const N = 40;
            for (let k = 0; k < N; k++) {
              const frac = k / (N - 1);
              const wx = ioX * (1 - frac);
              const wy = ioY + frac * sign * 70;
              const wz = ioZ * (1 - frac);
              w.pts[k].set(wx + (Math.random() - 0.5) * 2, wy, wz + (Math.random() - 0.5) * 2);
            }
            w.geo.setFromPoints(w.pts);
            w.mat.opacity = 0.55 + 0.2 * Math.abs(Math.sin(T * 0.8 + wi));
          });

          /* Field lines rotating with Io */
          this.fieldLines.forEach((fl, fi) => {
            const ang = this.ioAngle + fl.angle * 0.15;
            const N = 30;
            for (let k = 0; k < N; k++) {
              const frac = k / (N - 1);
              const r = ioR * (1 - frac) + 70 * frac;
              fl.pts[k].set(r * Math.cos(ang), 0, r * Math.sin(ang));
            }
            fl.geo.setFromPoints(fl.pts);
            fl.mat.opacity = 0.2 + 0.12 * Math.abs(Math.sin(T * 0.4 + fi * 0.6));
          });

          /* Aurora footprint arc near Jupiter north pole */
          const footAngle = this.ioAngle;
          for (let i = 0; i < this.NAUR; i++) {
            const th  = 1.2 + (i / this.NAUR) * 0.4;
            const phi = footAngle + this.aPhi[i] * 0.3 + T * 0.02;
            const r   = this.aR[i];
            this.aBuf[i * 3]     = r * Math.sin(th) * Math.cos(phi);
            this.aBuf[i * 3 + 1] = r * Math.cos(th) + 60;
            this.aBuf[i * 3 + 2] = r * Math.sin(th) * Math.sin(phi);
          }
          this.aMat.opacity = 0.55 + 0.25 * Math.abs(Math.sin(T * 1.1));

          /* Current particles along wing */
          for (let i = 0; i < this.NCS; i++) {
            this.csT[i] += dt * 0.3;
            if (this.csT[i] > 1) this.csT[i] = 0;
            const side = i % 2 === 0 ? 1 : -1;
            const frac = this.csT[i];
            const wx = ioX * (1 - frac) + (Math.random() - 0.5) * 8;
            const wy = ioY + frac * side * 70 + (Math.random() - 0.5) * 5;
            const wz = ioZ * (1 - frac) + (Math.random() - 0.5) * 8;
            this.csBuf[i * 3]     = wx;
            this.csBuf[i * 3 + 1] = wy;
            this.csBuf[i * 3 + 2] = wz;
          }
          this.csMat.opacity = 0.3 + 0.15 * Math.abs(Math.sin(T * 0.7));
        }
      });

      AFRAME.registerComponent("stellar-magnetic-bright-point-field", {
        /* Magnetic bright points — small-scale concentrations of
           magnetic flux in intergranular lanes of the solar photosphere
           appear as tiny bright spots (100-300 km); they are swept into
           lanes by convection, merge, fragment, and mark the network;
           bright white/gold points on dark intergranular background;
           they flicker and drift; white, gold, dark palette */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-1800, 2400, 3600);
          this.g = g; this.t = 0;

          /* Dark photosphere base */
          const baseGeo = new THREE.SphereGeometry(42, 16, 12);
          const baseMat = new THREE.MeshBasicMaterial({ color: 0x221100, transparent: true, opacity: 0.6 });
          g.add(new THREE.Mesh(baseGeo, baseMat));

          /* Granule cells — orange/gold */
          const NGRN = 80;
          this.granules = [];
          for (let i = 0; i < NGRN; i++) {
            const th = Math.acos(2 * Math.random() - 1);
            const ph = Math.random() * Math.PI * 2;
            const r  = 42.2;
            const gGeo = new THREE.CircleGeometry(2.5 + Math.random() * 1.5, 6);
            const brt  = 0.25 + Math.random() * 0.25;
            const col  = new THREE.Color(); col.setHSL(0.08, 0.9, brt);
            const gMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
            const gMesh = new THREE.Mesh(gGeo, gMat);
            const norm = new THREE.Vector3(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph));
            gMesh.position.copy(norm.clone().multiplyScalar(r));
            gMesh.lookAt(new THREE.Vector3(0, 0, 0));
            g.add(gMesh);
            this.granules.push({ mat: gMat, phase: Math.random() * Math.PI * 2 });
          }

          /* Magnetic bright points — white/gold pinpoints in lanes */
          const NBP = 90;
          this.bpMeshes = [];
          this.bpPhases = [];
          this.bpLifes  = [];
          this.bpMaxL   = [];
          for (let i = 0; i < NBP; i++) {
            const th = Math.acos(2 * Math.random() - 1);
            const ph = Math.random() * Math.PI * 2;
            const bGeo = new THREE.SphereGeometry(0.6 + Math.random() * 0.5, 5, 4);
            const bMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
            const bMesh = new THREE.Mesh(bGeo, bMat);
            const norm = new THREE.Vector3(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph));
            bMesh.position.copy(norm.clone().multiplyScalar(42.4));
            g.add(bMesh);
            const maxL = 3 + Math.random() * 6;
            this.bpMeshes.push({ mesh: bMesh, mat: bMat, norm });
            this.bpPhases.push(Math.random() * maxL);
            this.bpLifes.push(Math.random() * maxL);
            this.bpMaxL.push(maxL);
          }

          /* Scattered field spray from bright points */
          const NSP = 120;
          const spGeo = new THREE.BufferGeometry();
          const spBuf = new Float32Array(NSP * 3);
          this.spBuf = spBuf; this.NSP = NSP;
          this.spIdx = new Uint8Array(NSP); // which bp they belong to
          for (let i = 0; i < NSP; i++) this.spIdx[i] = Math.floor(Math.random() * NBP);
          this.spOff = new Float32Array(NSP * 3);
          for (let i = 0; i < NSP * 3; i++) this.spOff[i] = (Math.random() - 0.5) * 2.5;
          spGeo.setAttribute('position', new THREE.BufferAttribute(spBuf, 3));
          const spMat = new THREE.PointsMaterial({ color: 0xffee88, size: 0.9, transparent: true, opacity: 0.5 });
          g.add(new THREE.Points(spGeo, spMat));
          this.spMat = spMat; this.bpMeshesArr = this.bpMeshes;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.019;

          this.granules.forEach((gr, i) => {
            gr.mat.opacity = 0.45 + 0.2 * Math.sin(T * 0.6 + gr.phase);
          });

          /* Bright point flickering lifecycle */
          this.bpMeshes.forEach((bp, i) => {
            this.bpLifes[i] += dt;
            const maxL = this.bpMaxL[i];
            const life = this.bpLifes[i] % (maxL * 2);
            let alpha;
            if (life < 0.4) {
              alpha = life / 0.4;
            } else if (life < maxL) {
              alpha = 1 - (life - 0.4) / (maxL - 0.4) * 0.3;
            } else if (life < maxL + 0.6) {
              alpha = (0.7 - (life - maxL) / 0.6 * 0.7);
            } else {
              alpha = 0;
            }
            alpha *= 0.85 + 0.15 * Math.sin(T * 4 + i * 0.8);
            bp.mat.opacity = Math.max(0, alpha);
            const col = new THREE.Color();
            const hue = 0.09 + 0.03 * Math.sin(T * 0.5 + i);
            col.setHSL(hue, 0.3, 0.7 + 0.3 * alpha);
            bp.mat.color = col;
          });

          /* Spray particles near active bright points */
          for (let i = 0; i < this.NSP; i++) {
            const bpI = this.spIdx[i];
            const bp  = this.bpMeshes[bpI];
            this.spBuf[i * 3]     = bp.mesh.position.x + this.spOff[i * 3]     + Math.sin(T * 1.5 + i) * 0.3;
            this.spBuf[i * 3 + 1] = bp.mesh.position.y + this.spOff[i * 3 + 1] + Math.cos(T * 1.2 + i) * 0.3;
            this.spBuf[i * 3 + 2] = bp.mesh.position.z + this.spOff[i * 3 + 2] + Math.sin(T * 0.9 + i) * 0.3;
          }
          this.spMat.opacity = 0.35 + 0.2 * Math.abs(Math.sin(T * 0.8));
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-flux-tube-convective-collapse></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-alfven-wing-induced-current></a-entity>
      <a-entity stellar-magnetic-bright-point-field></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 150 injected! Lines: ' + lines);
