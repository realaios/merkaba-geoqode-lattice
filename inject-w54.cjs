"use strict";
// inject-w54.cjs — Wave 54: stellar-bh-jet-precession + cosmic-void-watershed
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("stellar-bh-jet-precession"')) {
  console.log("Wave 54 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity cosmic-sheet-supercluster></a-entity>";
const HTML_INSERT = `      <a-entity cosmic-sheet-supercluster></a-entity>
      <!-- ── STELLAR BH JET PRECESSION — X-ray binary with precessing jet ── -->
      <a-entity stellar-bh-jet-precession></a-entity>
      <!-- ── COSMIC VOID WATERSHED — vast empty region with matter outflow ── -->
      <a-entity cosmic-void-watershed></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         STELLAR BH JET PRECESSION — in micro-quasar systems like SS 433,
         a stellar-mass black hole accretes from a companion star and launches
         two anti-parallel relativistic jets that precess on a ~162-day period
         due to the tilted accretion disk. This creates a double helical corkscrew
         structure visible in radio and X-ray. We render the compact binary +
         two precessing corkscrew jet arms.
         Position: (300, -500, 200).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-bh-jet-precession", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(300, -500, 200);
          scene.add(this._root);

          /* compact binary: BH + donor */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(3.5, 6, 5),
            new THREE.MeshBasicMaterial({ color: 0x111111, depthWrite: false })
          ));
          var donor = new THREE.Mesh(
            new THREE.SphereGeometry(5, 6, 5),
            new THREE.MeshBasicMaterial({
              color: 0xff5522, transparent: true, opacity: 0.7,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          donor.position.set(12, 0, 0);
          this._root.add(donor);

          /* accretion disk */
          this._disk = new THREE.Mesh(
            new THREE.RingGeometry(4, 10, 40),
            new THREE.MeshBasicMaterial({
              color: 0xff8800, transparent: true, opacity: 0.5,
              side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._disk.rotation.x = 0.8;
          this._root.add(this._disk);

          /* jet corkscrew geometry — built as line series */
          var STEPS = 100;
          var ptsA = new Float32Array(STEPS * 3);
          var ptsB = new Float32Array(STEPS * 3);
          for (var si = 0; si < STEPS; si++) {
            var t = si / STEPS;
            var r = 8 * t, h = 200 * t;
            var precAngle = t * 10;
            ptsA[si*3  ] = r * Math.cos(precAngle);
            ptsA[si*3+1] = h;
            ptsA[si*3+2] = r * Math.sin(precAngle);
            ptsB[si*3  ] = -r * Math.cos(precAngle + Math.PI);
            ptsB[si*3+1] = -h;
            ptsB[si*3+2] = -r * Math.sin(precAngle + Math.PI);
          }
          var geoA = new THREE.BufferGeometry();
          geoA.setAttribute("position", new THREE.BufferAttribute(ptsA, 3));
          this._jetA = new THREE.Line(geoA, new THREE.LineBasicMaterial({
            color: 0x44aaff, transparent: true, opacity: 0.6,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._jetA);
          var geoB = new THREE.BufferGeometry();
          geoB.setAttribute("position", new THREE.BufferAttribute(ptsB, 3));
          this._jetB = new THREE.Line(geoB, new THREE.LineBasicMaterial({
            color: 0xff4444, transparent: true, opacity: 0.6,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._jetB);

          this._precAngle = 0;
          this._sbhjTime = 0;
          console.log("[stellar-bh-jet-precession] loaded at (300,-500,200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._sbhjTime += dt;
          this._precAngle += 0.003 * dt;
          /* rotate disk to simulate precession */
          this._disk.rotation.y = this._precAngle;
          /* rotate entire jet assembly */
          this._jetA.rotation.y = this._precAngle;
          this._jetB.rotation.y = this._precAngle + Math.PI;
          this._disk.rotation.z += 0.002 * dt;
        },
      });

      /* ====================================================================
         COSMIC VOID WATERSHED — cosmic voids are enormous underdense regions
         (typically 30-300 Mly across) that expand faster than average due to
         their negative density contrast. Matter flows outward from void centres
         toward bounding filaments and walls in a "watershed" pattern. The
         Bootes Void spans ~330 Mly. We render a vast void sphere with radial
         outflow arrows and a thin shell of overdense matter at the boundary.
         Position: (1000, -200, -800).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("cosmic-void-watershed", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(1000, -200, -800);
          scene.add(this._root);

          /* void interior — very faint dark sphere */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(320, 8, 7),
            new THREE.MeshBasicMaterial({
              color: 0x000022, transparent: true, opacity: 0.06,
              blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
            })
          ));

          /* overdense shell boundary */
          this._shell = new THREE.Mesh(
            new THREE.SphereGeometry(322, 8, 7),
            new THREE.MeshBasicMaterial({
              color: 0x224488, transparent: true, opacity: 0.025,
              blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
            })
          );
          this._root.add(this._shell);

          /* outflow lines from centre toward shell */
          var FL = 60;
          var fPts = new Float32Array(FL * 6);
          for (var fi = 0; fi < FL; fi++) {
            var fa = Math.random()*2*Math.PI, fp = Math.acos(2*Math.random()-1);
            var fx = Math.sin(fp)*Math.cos(fa), fy = Math.cos(fp), fz = Math.sin(fp)*Math.sin(fa);
            fPts[fi*6  ]=30*fx; fPts[fi*6+1]=30*fy; fPts[fi*6+2]=30*fz;
            fPts[fi*6+3]=310*fx; fPts[fi*6+4]=310*fy; fPts[fi*6+5]=310*fz;
          }
          var fGeo = new THREE.BufferGeometry();
          fGeo.setAttribute("position", new THREE.BufferAttribute(fPts, 3));
          this._outflow = new THREE.LineSegments(fGeo, new THREE.LineBasicMaterial({
            color: 0x3355aa, transparent: true, opacity: 0.04,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._outflow);

          /* few residual galaxies inside void */
          for (var vg = 0; vg < 8; vg++) {
            var va = Math.random()*2*Math.PI, vp2 = Math.acos(2*Math.random()-1);
            var vr = 50 + Math.random()*200;
            var vx = vr*Math.sin(vp2)*Math.cos(va), vy2 = vr*Math.cos(vp2), vz = vr*Math.sin(vp2)*Math.sin(va);
            var vGal = new THREE.Mesh(
              new THREE.SphereGeometry(2.5, 4, 3),
              new THREE.MeshBasicMaterial({
                color: 0x8899bb, transparent: true, opacity: 0.4,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            vGal.position.set(vx, vy2, vz);
            this._root.add(vGal);
          }

          this._cvwTime = 0;
          console.log("[cosmic-void-watershed] loaded at (1000,-200,-800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cvwTime += dt;
          this._outflow.material.opacity = 0.03 + 0.02 * Math.abs(Math.sin(this._cvwTime * 0.4));
          this._root.rotation.y += 0.00002 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 54 injected! Lines:", lineCount);
