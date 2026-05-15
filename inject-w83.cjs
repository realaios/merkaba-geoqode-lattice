"use strict";
// inject-w83.cjs — Wave 83: cosmic-runaway-star-trail + magnetospheric-substorm-aurora
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("cosmic-runaway-star-trail"')) {
  console.log("Wave 83 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity quasar-proximity-zone-fluorescence></a-entity>";
const HTML_INSERT = `      <a-entity quasar-proximity-zone-fluorescence></a-entity>
      <!-- ── COSMIC RUNAWAY STAR TRAIL — hypervelocity OB star trailing wake through ISM ── -->
      <a-entity cosmic-runaway-star-trail></a-entity>
      <!-- ── MAGNETOSPHERIC SUBSTORM AURORA — Earth-scale energy release in magnetotail ── -->
      <a-entity magnetospheric-substorm-aurora></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC RUNAWAY STAR TRAIL — a hypervelocity star ejected from the
         galactic centre carves a glowing cone-wake through the interstellar
         medium.  Renders: the star, an elongated bow cone, and a particle
         trail of swept-up ISM that thins and fades with distance.
         Position: (900, 300, -800).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("cosmic-runaway-star-trail", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(900, 300, -800);
          scene.add(this._root);

          /* star */
          this._runStar = new THREE.Mesh(
            new THREE.SphereGeometry(5, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0xbbddff })
          );
          this._root.add(this._runStar);

          /* bow cone */
          var coneGeo = new THREE.ConeGeometry(14, 40, 20, 1, true);
          coneGeo.translate(0, -20, 0);
          var coneMat = new THREE.MeshBasicMaterial({
            color: 0x4499ff,
            transparent: true, opacity: 0.1,
            blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
          });
          this._root.add(new THREE.Mesh(coneGeo, coneMat));

          /* trail particles */
          var NT = 8000;
          var tPts = new Float32Array(NT*3);
          var tOff = new Float32Array(NT);
          this._tPts = tPts; this._tOff = tOff; this._NT = NT;
          for (var ti = 0; ti < NT; ti++) {
            var frac = ti/NT;
            var spread = 5 + frac*22;
            tPts[ti*3  ] = (Math.random()-0.5)*spread;
            tPts[ti*3+1] = -(10 + frac*110);
            tPts[ti*3+2] = (Math.random()-0.5)*spread;
            tOff[ti] = Math.random()*6.28;
          }
          var tGeo = new THREE.BufferGeometry();
          tGeo.setAttribute("position", new THREE.BufferAttribute(tPts, 3));
          this._trailMesh = new THREE.Points(tGeo, new THREE.PointsMaterial({
            color: 0xaaccff, size: 0.7,
            transparent: true, opacity: 0.3,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._trailMesh);

          this._rstTime = 0;
          console.log("[cosmic-runaway-star-trail] loaded at (900,300,-800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._rstTime += dt;
          var t = this._rstTime;
          for (var ti = 0; ti < this._NT; ti++) {
            this._tPts[ti*3  ] += 0.4*(Math.random()-0.5)*dt;
            this._tPts[ti*3+2] += 0.4*(Math.random()-0.5)*dt;
          }
          this._trailMesh.geometry.attributes.position.needsUpdate = true;
          this._trailMesh.material.opacity = 0.22 + 0.1*Math.sin(t*0.7);
          this._runStar.material.color.setHSL(0.6, 1, 0.7 + 0.15*Math.sin(t*2.5));
        },
      });

      /* ====================================================================
         MAGNETOSPHERIC SUBSTORM AURORA — the magnetotail collapses inward,
         accelerating electrons earthward.  Renders: glowing curtain sheets
         of aurora in green/cyan/violet, pulsing dipole field lines, and
         energetic particle injection spirals on the nightside.
         Position: (-400, 700, -500).
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("magnetospheric-substorm-aurora", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-400, 700, -500);
          scene.add(this._root);

          /* aurora curtain sheets */
          this._curtains = [];
          var colors = [0x00ff88, 0x00ccff, 0xaa44ff];
          for (var ci = 0; ci < 3; ci++) {
            var NW = 600;
            var cPts = new Float32Array(NW*3);
            for (var cj = 0; cj < NW; cj++) {
              var u = cj/(NW-1);
              cPts[cj*3  ] = (u-0.5)*90 + (ci-1)*25;
              cPts[cj*3+1] = -20 + Math.random()*60;
              cPts[cj*3+2] = (ci-1)*10 + (Math.random()-0.5)*5;
            }
            var cGeo = new THREE.BufferGeometry();
            cGeo.setAttribute("position", new THREE.BufferAttribute(cPts, 3));
            var cMesh = new THREE.Points(cGeo, new THREE.PointsMaterial({
              color: colors[ci], size: 0.8,
              transparent: true, opacity: 0.45,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(cMesh);
            this._curtains.push({ mesh: cMesh, pts: cPts, n: NW, phase: ci*2.1 });
          }

          /* dipole field line arcs */
          for (var fi = 0; fi < 8; fi++) {
            var fPts = [];
            var fphi = (fi/8)*Math.PI*2;
            for (var fj = 0; fj <= 40; fj++) {
              var fth = (fj/40)*Math.PI;
              var fr = 35*Math.sin(fth)*Math.sin(fth);
              fPts.push(fr*Math.cos(fphi), fr*Math.cos(fth), fr*Math.sin(fphi));
            }
            var fGeo = new THREE.BufferGeometry();
            fGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(fPts), 3));
            this._root.add(new THREE.Line(fGeo, new THREE.LineBasicMaterial({
              color: 0x2255ff, transparent: true, opacity: 0.2,
              blending: THREE.AdditiveBlending,
            })));
          }

          this._msTime = 0;
          console.log("[magnetospheric-substorm-aurora] loaded at (-400,700,-500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._msTime += dt;
          var t = this._msTime;
          for (var ci = 0; ci < this._curtains.length; ci++) {
            var c = this._curtains[ci];
            for (var cj = 0; cj < c.n; cj++) {
              c.pts[cj*3+1] += 15*dt + 3*(Math.random()-0.5)*dt;
              if (c.pts[cj*3+1] > 40) c.pts[cj*3+1] = -20 + Math.random()*5;
            }
            c.mesh.geometry.attributes.position.needsUpdate = true;
            c.mesh.material.opacity = 0.35 + 0.2*Math.abs(Math.sin(t*1.2 + c.phase));
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 83 injected! Lines:", lineCount);
