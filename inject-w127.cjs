/**
 * inject-w127.cjs  — Wave 127
 * cosmic-cross-field-diffusion-cloud  + stellar-photospheric-vortex-tube
 */
'use strict';
const fs = require('fs');
const FILE = 'public/cosmos-infinite.html';

let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

if (html.includes('registerComponent("cosmic-cross-field-diffusion-cloud"')) {
  console.log('Wave 127 already injected.');
  process.exit(0);
}

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

const NEW_JS = `      AFRAME.registerComponent("cosmic-cross-field-diffusion-cloud", {
        /* Cross-field diffusion — charged particles scattering perpendicular
           to B-field in a turbulent magnetosphere; creates a glowing
           diffuse cloud with anisotropic blob spread across B */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(-400, 700, -1100);
          this.g = g; this.t = 0;

          /* B-field spine axis (vertical cylinder) */
          const axisGeo = new THREE.CylinderGeometry(1.5, 1.5, 350, 6);
          const axisMat = new THREE.MeshBasicMaterial({ color: 0x4477ff, transparent: true, opacity: 0.4 });
          g.add(new THREE.Mesh(axisGeo, axisMat));

          /* Cross-field diffusion blobs — elongated perpendicular to y-axis */
          this.blobs = [];
          for (let i = 0; i < 12; i++) {
            const bGeo = new THREE.SphereGeometry(14 + Math.random() * 18, 10, 8);
            const c = new THREE.Color();
            c.setHSL(0.55 + Math.random() * 0.15, 0.75, 0.5);
            const bMat = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.25, wireframe: true });
            const blob = new THREE.Mesh(bGeo, bMat);
            const r = 25 + Math.random() * 55;
            const phi = Math.random() * Math.PI * 2;
            blob.position.set(r * Math.cos(phi), -120 + Math.random() * 240, r * Math.sin(phi));
            blob.scale.y = 0.25 + Math.random() * 0.3; /* squash along B */
            blob.scale.x = 1.5 + Math.random() * 0.8;
            blob.scale.z = 1.5 + Math.random() * 0.8;
            g.add(blob);
            this.blobs.push({ mesh: blob, r, phi, baseY: blob.position.y, phaseOff: Math.random() * Math.PI * 2, drift: (Math.random() - 0.5) * 0.4, mat: bMat });
          }

          /* Haze particle cloud — wide scatter perpendicular to B */
          const N = 500;
          const ptGeo = new THREE.BufferGeometry();
          const ptBuf = new Float32Array(N * 3);
          for (let i = 0; i < N; i++) {
            const r = (Math.random() + 0.3) * 90;
            const phi = Math.random() * Math.PI * 2;
            ptBuf[i * 3]     = r * Math.cos(phi);
            ptBuf[i * 3 + 1] = (Math.random() - 0.5) * 280;
            ptBuf[i * 3 + 2] = r * Math.sin(phi);
          }
          ptGeo.setAttribute('position', new THREE.BufferAttribute(ptBuf, 3));
          const ptMat = new THREE.PointsMaterial({ color: 0x88aaff, size: 1.8, transparent: true, opacity: 0.45 });
          this.haze = new THREE.Points(ptGeo, ptMat);
          g.add(this.haze);
          this.ptBuf = ptBuf; this.ptMat = ptMat;
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.04;

          /* Blobs drift radially outward + oscillate */
          this.blobs.forEach((b) => {
            const phase = T * 0.7 + b.phaseOff;
            b.r = Math.min(b.r + dt * 4, 120);
            if (b.r >= 120) b.r = 20 + Math.random() * 20;
            b.phi += b.drift * dt;
            b.mesh.position.x = b.r * Math.cos(b.phi);
            b.mesh.position.z = b.r * Math.sin(b.phi);
            b.mesh.position.y = b.baseY + 10 * Math.sin(phase);
            b.mat.opacity = (0.15 + 0.15 * Math.sin(phase * 1.2)) * (1 - b.r / 120);
          });

          this.haze.rotation.y = T * 0.08;
          this.ptMat.opacity = 0.3 + 0.15 * Math.sin(T * 1.3);
        }
      });

      AFRAME.registerComponent("stellar-photospheric-vortex-tube", {
        /* Solar photospheric vortex tubes — small-scale rotating funnels
           driven by granule convection; bright swirling cylinders with
           a central brightness spike and helical outer sheath */
        init() {
          const THREE = AFRAME.THREE;
          const g = new THREE.Group();
          this.el.object3D.add(g);
          this.el.object3D.position.set(1200, 180, 400);
          this.g = g; this.t = 0;

          /* 5 vortex tubes scattered on photosphere disc */
          this.tubes = [];
          const positions = [
            [0, 0, 0], [55, 0, 20], [-40, 0, 50], [30, 0, -60], [-60, 0, -30]
          ];
          positions.forEach((pos, idx) => {
            const tg = new THREE.Group();
            tg.position.set(pos[0], pos[1], pos[2]);
            g.add(tg);

            /* Bright core spike */
            const coreGeo = new THREE.CylinderGeometry(2, 4, 50, 10);
            const c = new THREE.Color();
            c.setHSL(0.12 - idx * 0.01, 1.0, 0.72);
            const coreMat = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.85 });
            const core = new THREE.Mesh(coreGeo, coreMat);
            tg.add(core);

            /* Outer helical sheath — torus stacked at angles */
            for (let ring = 0; ring < 5; ring++) {
              const rGeo = new THREE.TorusGeometry(6 + ring * 2, 1.2, 6, 32);
              const rMat = new THREE.MeshBasicMaterial({ color: 0xffdd88, transparent: true, opacity: 0.35 - ring * 0.04, wireframe: true });
              const r = new THREE.Mesh(rGeo, rMat);
              r.position.y = -15 + ring * 7.5;
              r.rotation.x = Math.PI * 0.5;
              tg.add(r);
            }

            /* Spiral particle stream */
            const N = 80;
            const sGeo = new THREE.BufferGeometry();
            const sBuf = new Float32Array(N * 3);
            for (let j = 0; j < N; j++) {
              const phi = (j / N) * Math.PI * 4;
              const r2 = 5 + (j / N) * 12;
              sBuf[j * 3]     = r2 * Math.cos(phi);
              sBuf[j * 3 + 1] = -25 + (j / N) * 50;
              sBuf[j * 3 + 2] = r2 * Math.sin(phi);
            }
            sGeo.setAttribute('position', new THREE.BufferAttribute(sBuf, 3));
            const sPts = new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 0.6 }));
            tg.add(sPts);

            this.tubes.push({ grp: tg, sBuf, pts: sPts, phaseOff: idx * 1.26, spinDir: idx % 2 === 0 ? 1 : -1 });
          });

          /* Photosphere base disk */
          const diskGeo = new THREE.CircleGeometry(120, 40);
          const diskMat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
          const disk = new THREE.Mesh(diskGeo, diskMat);
          disk.rotation.x = -Math.PI * 0.5;
          g.add(disk);
        },
        tick(time, delta) {
          const dt = Math.min(delta, 50) / 1000;
          this.t += dt;
          const T = this.t;

          this.g.rotation.y += dt * 0.025;

          this.tubes.forEach((tube) => {
            /* Spin each tube around its own axis */
            tube.grp.rotation.y += dt * 1.8 * tube.spinDir;

            /* Animate spiral particles */
            const N = tube.sBuf.length / 3;
            const phaseShift = T * 2.5 * tube.spinDir + tube.phaseOff;
            for (let j = 0; j < N; j++) {
              const phi = (j / N) * Math.PI * 4 + phaseShift;
              const r = 5 + (j / N) * 12;
              tube.sBuf[j * 3]     = r * Math.cos(phi);
              tube.sBuf[j * 3 + 2] = r * Math.sin(phi);
            }
            tube.pts.geometry.attributes.position.needsUpdate = true;
          });
        }
      });

${JS_ANCHOR}`;

if (!html.includes(JS_ANCHOR)) { console.error('JS anchor not found!'); process.exit(1); }
html = html.replace(JS_ANCHOR, NEW_JS);

const HTML_ANCHOR = '      <a-entity stellar-penumbral-wave-train></a-entity>';
const NEW_HTML = `${HTML_ANCHOR}
      <a-entity cosmic-cross-field-diffusion-cloud></a-entity>
      <a-entity stellar-photospheric-vortex-tube></a-entity>`;

if (!html.includes(HTML_ANCHOR)) { console.error('HTML anchor not found!'); process.exit(1); }
html = html.replace(HTML_ANCHOR, NEW_HTML);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lines = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 127 injected! Lines: ' + lines);
