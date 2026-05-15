'use strict';
// inject-w58.cjs — Wave 58: dark-matter-caustic-fold + circumstellar-maser-shell
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("dark-matter-caustic-fold"')) {
  console.log('Wave 58 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity stellar-wind-bow-nebula></a-entity>';
const HTML_INSERT = `      <a-entity stellar-wind-bow-nebula></a-entity>
      <!-- ── DARK MATTER CAUSTIC FOLD — shell-like caustic rings from DM collapse ── -->
      <a-entity dark-matter-caustic-fold></a-entity>
      <!-- ── CIRCUMSTELLAR MASER SHELL — OH/H2O maser emission ring around AGB star ── -->
      <a-entity circumstellar-maser-shell></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         DARK MATTER CAUSTIC FOLD — in CDM models, dark matter halos have
         caustic shells where particle streams fold on themselves, producing
         sharp density spikes detectable (perhaps) as rings in rotation curves
         (Sikivie 1998, 2003). Tidal streams from accreting sub-halos also form
         cold stellar streams that show caustic patterns. We render nested
         caustic ring shells around a central halo, with faint fold edges.
         Position: (-400, 600, -800).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("dark-matter-caustic-fold", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-400, 600, -800);
          scene.add(this._root);

          /* central DM halo */
          this._halo = new THREE.Mesh(
            new THREE.SphereGeometry(50, 7, 6),
            new THREE.MeshBasicMaterial({
              color: 0x333366, transparent: true, opacity: 0.1,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._halo);

          /* caustic ring shells */
          this._causticRings = [];
          var radii = [70, 105, 145, 190, 240];
          for (var ci = 0; ci < radii.length; ci++) {
            var cr = radii[ci];
            var cm = new THREE.Mesh(
              new THREE.TorusGeometry(cr, 1.5, 6, 80),
              new THREE.MeshBasicMaterial({
                color: 0x7766aa, transparent: true, opacity: 0.18 - ci*0.025,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            cm.rotation.x = Math.PI/2 + ci * 0.3;
            this._root.add(cm);
            this._causticRings.push(cm);
          }

          /* fold edge arcs — points on caustic surfaces */
          var FP = 300;
          var fPts = new Float32Array(FP * 3);
          for (var fi = 0; fi < FP; fi++) {
            var fth = Math.random() * 2 * Math.PI;
            var fphi = Math.random() * Math.PI;
            var fr = radii[Math.floor(Math.random()*radii.length)];
            fr += (Math.random()-0.5)*8;
            fPts[fi*3  ] = fr*Math.sin(fphi)*Math.cos(fth);
            fPts[fi*3+1] = fr*Math.sin(fphi)*Math.sin(fth);
            fPts[fi*3+2] = fr*Math.cos(fphi);
          }
          var fGeo = new THREE.BufferGeometry();
          fGeo.setAttribute("position", new THREE.BufferAttribute(fPts, 3));
          this._root.add(new THREE.Points(fGeo, new THREE.PointsMaterial({
            color: 0x9988cc, size: 2,
            transparent: true, opacity: 0.2,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._dmcfTime = 0;
          console.log("[dark-matter-caustic-fold] loaded at (-400,600,-800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._dmcfTime += dt;
          for (var ci = 0; ci < this._causticRings.length; ci++) {
            this._causticRings[ci].material.opacity =
              (0.14 - ci*0.02) + 0.05*Math.abs(Math.sin(this._dmcfTime * (0.5+ci*0.3)));
          }
          this._root.rotation.x += 0.000012 * dt;
          this._root.rotation.y += 0.000018 * dt;
        },
      });

      /* ====================================================================
         CIRCUMSTELLAR MASER SHELL — Asymptotic Giant Branch stars have slow
         dense winds that form extended circumstellar envelopes where OH and H2O
         molecules produce maser emission. These masers appear in expanding shells
         at radii of ~1000-10000 AU and provide precise VLBI proper-motion
         distance measurements (VERA project). We render an AGB star, a dense
         molecular wind, and bright maser spot beads on the shell.
         Position: (700, -400, -700).
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("circumstellar-maser-shell", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(700, -400, -700);
          scene.add(this._root);

          /* AGB star */
          this._star = new THREE.Mesh(
            new THREE.SphereGeometry(8, 7, 6),
            new THREE.MeshBasicMaterial({
              color: 0xff6600, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._star);

          /* inner dust wind shell */
          this._wind = new THREE.Mesh(
            new THREE.SphereGeometry(40, 8, 7),
            new THREE.MeshBasicMaterial({
              color: 0xff4400, transparent: true, opacity: 0.05,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._wind);

          /* maser shell */
          this._maserShell = new THREE.Mesh(
            new THREE.SphereGeometry(70, 8, 7),
            new THREE.MeshBasicMaterial({
              color: 0xaaff88, transparent: true, opacity: 0.04,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._maserShell);

          /* maser spots — bright beads on the shell */
          var MS = 40;
          var msPts = new Float32Array(MS * 3);
          this._maserColors = new Float32Array(MS * 3);
          for (var mi = 0; mi < MS; mi++) {
            var mth = Math.random() * 2 * Math.PI;
            var mphi = Math.random() * Math.PI;
            msPts[mi*3  ] = 70*Math.sin(mphi)*Math.cos(mth);
            msPts[mi*3+1] = 70*Math.sin(mphi)*Math.sin(mth);
            msPts[mi*3+2] = 70*Math.cos(mphi);
            /* alternate OH (red) and H2O (blue-green) spots */
            if (mi%2===0) { this._maserColors[mi*3]=1; this._maserColors[mi*3+1]=0.3; this._maserColors[mi*3+2]=0.1; }
            else          { this._maserColors[mi*3]=0.2; this._maserColors[mi*3+1]=1; this._maserColors[mi*3+2]=0.5; }
          }
          var msGeo = new THREE.BufferGeometry();
          msGeo.setAttribute("position", new THREE.BufferAttribute(msPts, 3));
          msGeo.setAttribute("color", new THREE.BufferAttribute(this._maserColors, 3));
          this._maserPts = new THREE.Points(msGeo, new THREE.PointsMaterial({
            size: 4, vertexColors: true,
            transparent: true, opacity: 0.85,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._maserPts);

          this._cmsTime = 0;
          console.log("[circumstellar-maser-shell] loaded at (700,-400,-700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cmsTime += dt;
          /* pulsating AGB star */
          var pScale = 1 + 0.15*Math.sin(this._cmsTime * 0.4);
          this._star.scale.setScalar(pScale);
          /* maser flickering */
          this._maserPts.material.opacity = 0.5 + 0.45*Math.abs(Math.sin(this._cmsTime * 3.7));
          this._wind.material.opacity = 0.03 + 0.025*Math.abs(Math.sin(this._cmsTime * 0.9));
          this._root.rotation.y += 0.00005 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 58 injected! Lines:', lineCount);
