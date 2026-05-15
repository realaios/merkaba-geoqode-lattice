"use strict";
// inject-w67.cjs — Wave 67: stellar-flare-loop-arcade + cosmic-accretion-shock
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("stellar-flare-loop-arcade"')) {
  console.log("Wave 67 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR = "      <a-entity cosmic-vortex-sheet></a-entity>";
const HTML_INSERT = `      <a-entity cosmic-vortex-sheet></a-entity>
      <!-- ── STELLAR FLARE LOOP ARCADE — post-flare coronal loop arcade on active star ── -->
      <a-entity stellar-flare-loop-arcade></a-entity>
      <!-- ── COSMIC ACCRETION SHOCK — standing shock at inner edge of accretion disk ── -->
      <a-entity cosmic-accretion-shock></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         STELLAR FLARE LOOP ARCADE — during a major solar/stellar flare the
         magnetic field reconnects high in the corona. The energy release
         drives plasma downward along newly formed loops. As the loops cool
         they form an arcade of post-flare loops visible in EUV/soft X-ray.
         Each loop is a semi-torus with plasma flowing along field lines.
         Position: (-1400, 600, 200).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-flare-loop-arcade", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-1400, 600, 200);
          scene.add(this._root);

          /* stellar disk */
          this._star = new THREE.Mesh(
            new THREE.SphereGeometry(30, 12, 12),
            new THREE.MeshBasicMaterial({
              color: 0xff6600, transparent: true, opacity: 0.4,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._star);

          /* flare arcade — 7 loops, each a Catmull-Rom arc */
          this._loopLines = [];
          var NC = 7;
          for (var li = 0; li < NC; li++) {
            var az = (li / (NC-1) - 0.5) * 60; // degrees spread
            var azR = az * Math.PI / 180;
            var h = 28 + li*4;
            var pts = [];
            for (var pi = 0; pi <= 24; pi++) {
              var ang = (pi/24) * Math.PI;
              var lx = Math.sin(azR)*30 + h*Math.sin(ang)*Math.cos(azR);
              var ly = 30 + h*Math.sin(ang);
              var lz = Math.cos(azR)*30 - h*Math.sin(ang)*Math.sin(azR);
              pts.push(new THREE.Vector3(lx, ly, lz));
            }
            var curve = new THREE.CatmullRomCurve3(pts);
            var lGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
            var loopCol = new THREE.Color().setHSL(0.05 - li*0.005, 1, 0.7);
            var loopLine = new THREE.Line(lGeo, new THREE.LineBasicMaterial({
              color: loopCol, transparent: true, opacity: 0.6,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(loopLine);
            this._loopLines.push({ line: loopLine, base: li, h: h, azR: azR });
          }

          /* plasma particle tracers flowing down each loop */
          var NP = 250;
          var pPts = new Float32Array(NP*3);
          this._pPts = pPts;
          this._pPhase = new Float32Array(NP);
          this._pLoop = new Uint8Array(NP);
          for (var pi2 = 0; pi2 < NP; pi2++) {
            this._pPhase[pi2] = Math.random();
            this._pLoop[pi2] = Math.floor(Math.random()*NC);
          }
          var pGeo = new THREE.BufferGeometry();
          pGeo.setAttribute("position", new THREE.BufferAttribute(pPts, 3));
          this._plasma = new THREE.Points(pGeo, new THREE.PointsMaterial({
            color: 0xffee99, size: 1.8,
            transparent: true, opacity: 0.7,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._plasma);
          this._NC = NC;
          this._flaTime = 0;
          this._flareFlash = 0;
          console.log("[stellar-flare-loop-arcade] loaded at (-1400,600,200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._flaTime += dt;
          this._flareFlash = Math.max(0, this._flareFlash - 0.4*dt);
          /* flash at intervals */
          if (Math.floor(this._flaTime*10) % 80 === 0) this._flareFlash = 1;
          this._star.material.opacity = 0.4 + 0.3*this._flareFlash;
          /* plasma tracers */
          var t = this._flaTime;
          var NC = this._NC;
          for (var pi = 0; pi < this._pPhase.length; pi++) {
            this._pPhase[pi] = (this._pPhase[pi] + 0.18*dt) % 1;
            var ang = this._pPhase[pi] * Math.PI;
            var li = this._pLoop[pi];
            var ll = this._loopLines[li];
            var lx = Math.sin(ll.azR)*30 + ll.h*Math.sin(ang)*Math.cos(ll.azR);
            var ly = 30 + ll.h*Math.sin(ang);
            var lz = Math.cos(ll.azR)*30 - ll.h*Math.sin(ang)*Math.sin(ll.azR);
            this._pPts[pi*3  ] = lx + (Math.random()-0.5)*1.5;
            this._pPts[pi*3+1] = ly + (Math.random()-0.5)*1.5;
            this._pPts[pi*3+2] = lz + (Math.random()-0.5)*1.5;
          }
          this._plasma.geometry.attributes.position.needsUpdate = true;
          this._root.rotation.y += 0.00008*dt;
        },
      });

      /* ====================================================================
         COSMIC ACCRETION SHOCK — at the magnetospheric truncation radius of
         an accreting NS or white dwarf, infalling matter hits the standing
         accretion shock. Just inside the shock the plasma is compressed and
         heated to X-ray temperatures. The shock front is a ring that oscillates
         (shock oscillation / quasi-periodic oscillations). Below it matter
         channels along field lines to the poles.
         Position: (400, 900, -600).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-accretion-shock", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(400, 900, -600);
          scene.add(this._root);

          /* accretor — small dense star */
          this._accrStar = new THREE.Mesh(
            new THREE.SphereGeometry(8, 12, 12),
            new THREE.MeshBasicMaterial({
              color: 0xaaddff, transparent: true, opacity: 0.6,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._accrStar);

          /* standing shock ring */
          var shockR = 35;
          this._shockR = shockR;
          var shPts = [];
          var NSH = 64;
          for (var si = 0; si <= NSH; si++) {
            var a = (si/NSH)*2*Math.PI;
            shPts.push(new THREE.Vector3(shockR*Math.cos(a), 0, shockR*Math.sin(a)));
          }
          var shGeo = new THREE.BufferGeometry().setFromPoints(shPts);
          this._shockRing = new THREE.Line(shGeo, new THREE.LineBasicMaterial({
            color: 0xff4400, transparent: true, opacity: 0.8,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._shockRing);

          /* hot post-shock glow disk */
          this._hotDisk = new THREE.Mesh(
            new THREE.RingGeometry(8, shockR, 32),
            new THREE.MeshBasicMaterial({
              color: 0xff6600, transparent: true, opacity: 0.08,
              side: THREE.DoubleSide,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._hotDisk.rotation.x = Math.PI/2;
          this._root.add(this._hotDisk);

          /* infalling plasma above shock */
          var NIN = 300;
          var inPts = new Float32Array(NIN*3);
          this._inPts = inPts;
          this._inPhase = new Float32Array(NIN);
          this._inAngle = new Float32Array(NIN);
          for (var ii = 0; ii < NIN; ii++) {
            this._inPhase[ii] = Math.random();
            this._inAngle[ii] = Math.random()*2*Math.PI;
          }
          var inGeo = new THREE.BufferGeometry();
          inGeo.setAttribute("position", new THREE.BufferAttribute(inPts, 3));
          this._inflowPts = new THREE.Points(inGeo, new THREE.PointsMaterial({
            color: 0x88ccff, size: 1.5,
            transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._inflowPts);

          /* polar accretion columns — field-channeled flow to poles */
          var colPts1 = [new THREE.Vector3(0, shockR*0.4, 0), new THREE.Vector3(0, 8, 0)];
          var colPts2 = [new THREE.Vector3(0, -shockR*0.4, 0), new THREE.Vector3(0, -8, 0)];
          this._colLine1 = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(colPts1),
            new THREE.LineBasicMaterial({ color: 0xffaaff, transparent:true, opacity:0.5, blending: THREE.AdditiveBlending, depthWrite:false })
          );
          this._colLine2 = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(colPts2),
            new THREE.LineBasicMaterial({ color: 0xffaaff, transparent:true, opacity:0.5, blending: THREE.AdditiveBlending, depthWrite:false })
          );
          this._root.add(this._colLine1);
          this._root.add(this._colLine2);

          this._casTime = 0;
          this._NIN = NIN;
          console.log("[cosmic-accretion-shock] loaded at (400,900,-600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._casTime += dt;
          var t = this._casTime;
          /* QPO shock radius oscillation */
          var sr = this._shockR * (1 + 0.05*Math.sin(t*4.7));
          this._shockRing.scale.set(sr/this._shockR, 1, sr/this._shockR);
          this._hotDisk.material.opacity = 0.06 + 0.04*Math.sin(t*4.7);
          /* infalling plasma */
          for (var ii = 0; ii < this._NIN; ii++) {
            this._inPhase[ii] = (this._inPhase[ii] + 0.12*dt) % 1;
            var r = sr + 5 + (1-this._inPhase[ii])*60;
            var a = this._inAngle[ii];
            this._inPts[ii*3  ] = r*Math.cos(a) + (Math.random()-0.5)*2;
            this._inPts[ii*3+1] = (Math.random()-0.5)*4;
            this._inPts[ii*3+2] = r*Math.sin(a) + (Math.random()-0.5)*2;
          }
          this._inflowPts.geometry.attributes.position.needsUpdate = true;
          this._root.rotation.y += 0.00006*dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 67 injected! Lines:", lineCount);
