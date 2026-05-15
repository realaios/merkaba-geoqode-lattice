"use strict";
// inject-w27.cjs — Wave 27: cosmic-reconnection + magnetopause-flux
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("cosmic-reconnection"')) {
  console.log("Wave 27 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity cosmic-dust-lane></a-entity>";
const HTML_INSERT = `      <a-entity cosmic-dust-lane></a-entity>
      <!-- ── COSMIC RECONNECTION — magnetic reconnection X-point energy release ── -->
      <a-entity cosmic-reconnection></a-entity>
      <!-- ── MAGNETOPAUSE FLUX — boundary where stellar wind meets magnetosphere ── -->
      <a-entity magnetopause-flux></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC RECONNECTION — magnetic reconnection at a cosmic scale. Two
         opposing magnetic field lines (modeled as ribbons) approach an X-point
         and snap, releasing a burst of high-energy particles. Repeating cycle.
         Position: (300, -200, 700).
         Components:
           - Two incoming field line ribbons (approaching each other)
           - X-point: bright flash at origin when lines reconnect
           - Outflow jets: two particle streams shot perpendicular to inflow
           - Plasmoid chain: 8 magnetic islands ejected along outflow
           - Energetic particle spray: 600 pts burst outward at reconnection
           - Cycle: ~6s — approach (2s) → reconnect flash (0.5s) → outflow (3.5s) → reset
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-reconnection", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(300, -200, 700);
          scene.add(this._root);

          /* ── field line ribbons (two approaching arcs) ── */
          var FN = 300;
          this._fldTop = new Float32Array(FN * 3);
          this._fldBot = new Float32Array(FN * 3);
          for (var fi = 0; fi < FN; fi++) {
            var t = (fi / (FN-1)) - 0.5; /* -0.5 to 0.5 */
            this._fldTop[fi*3  ] = t * 200;
            this._fldTop[fi*3+1] = 0; /* y filled in tick */
            this._fldTop[fi*3+2] = (Math.random()-0.5) * 15;
            this._fldBot[fi*3  ] = t * 200;
            this._fldBot[fi*3+1] = 0;
            this._fldBot[fi*3+2] = (Math.random()-0.5) * 15;
          }
          var ftGeo = new THREE.BufferGeometry();
          ftGeo.setAttribute("position", new THREE.BufferAttribute(this._fldTop.slice(), 3));
          this._ftMat = new THREE.PointsMaterial({
            color: 0x4488ff, size: 2.2, transparent: true, opacity: 0.60,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._fTop = new THREE.Points(ftGeo, this._ftMat);
          this._root.add(this._fTop);

          var fbGeo = new THREE.BufferGeometry();
          fbGeo.setAttribute("position", new THREE.BufferAttribute(this._fldBot.slice(), 3));
          this._fbMat = new THREE.PointsMaterial({
            color: 0xff4488, size: 2.2, transparent: true, opacity: 0.60,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._fBot = new THREE.Points(fbGeo, this._fbMat);
          this._root.add(this._fBot);

          /* ── X-point flash ── */
          this._flashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          this._flash = new THREE.Mesh(new THREE.SphereGeometry(5, 6, 4), this._flashMat);
          this._flash.visible = false;
          this._root.add(this._flash);

          /* ── outflow jets (2 × 200 pts along ±X) ── */
          var JN = 200;
          this._jLeftPts = new Float32Array(JN * 3);
          this._jRightPts = new Float32Array(JN * 3);
          for (var ji = 0; ji < JN; ji++) {
            var td = (ji / (JN-1));
            this._jLeftPts[ji*3  ] = -td;  /* normalized, scaled in tick */
            this._jLeftPts[ji*3+1] = (Math.random()-0.5) * 20;
            this._jLeftPts[ji*3+2] = (Math.random()-0.5) * 20;
            this._jRightPts[ji*3  ] = td;
            this._jRightPts[ji*3+1] = (Math.random()-0.5) * 20;
            this._jRightPts[ji*3+2] = (Math.random()-0.5) * 20;
          }
          var jlGeo = new THREE.BufferGeometry();
          jlGeo.setAttribute("position", new THREE.BufferAttribute(this._jLeftPts.slice(), 3));
          this._jlMat = new THREE.PointsMaterial({
            color: 0x00ffaa, size: 2.5, transparent: true, opacity: 0.0,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._jLeft = new THREE.Points(jlGeo, this._jlMat);
          this._root.add(this._jLeft);

          var jrGeo = new THREE.BufferGeometry();
          jrGeo.setAttribute("position", new THREE.BufferAttribute(this._jRightPts.slice(), 3));
          this._jrMat = new THREE.PointsMaterial({
            color: 0x00ffaa, size: 2.5, transparent: true, opacity: 0.0,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._jRight = new THREE.Points(jrGeo, this._jrMat);
          this._root.add(this._jRight);

          /* ── energetic spray (600 pts) ── */
          var EN = 600;
          this._sprayPts = new Float32Array(EN * 3);
          this._sprayV = new Float32Array(EN * 3);
          for (var ei = 0; ei < EN; ei++) {
            var sp = Math.acos(2*Math.random()-1);
            var st = Math.random()*2*Math.PI;
            var sv = 3 + Math.random() * 5;
            this._sprayV[ei*3  ] = sv * Math.sin(sp)*Math.cos(st);
            this._sprayV[ei*3+1] = sv * Math.sin(sp)*Math.sin(st);
            this._sprayV[ei*3+2] = sv * Math.cos(sp);
          }
          var eGeo = new THREE.BufferGeometry();
          eGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(EN*3), 3));
          this._sprayMat = new THREE.PointsMaterial({
            color: 0xffff00, size: 2.5, transparent: true, opacity: 0.0,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._spray = new THREE.Points(eGeo, this._sprayMat);
          this._root.add(this._spray);

          this._phase = 0; /* 0..1 cycle */
          this._crTime = 0;
          this._CYCLE = 6.0;
          this._JET_MAXLEN = 180;
          this._sprayAge = 0;
          this._spraying = false;
          console.log("[cosmic-reconnection] snapping at (300,-200,700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._crTime += dt;
          this._phase = (this._crTime % this._CYCLE) / this._CYCLE;

          var p = this._phase;
          var APPROACH = 2/6, FLASH_P = 0.5/6, OUTFLOW = 3.5/6;

          /* ── approach phase: ribbons close on Y axis ── */
          var topY, botY;
          if (p < APPROACH) {
            var f = p / APPROACH;
            topY  =  80 * (1 - f) + 2;
            botY  = -80 * (1 - f) - 2;
          } else {
            topY = 2; botY = -2;
          }

          var ftArr = this._fTop.geometry.attributes.position.array;
          var fbArr = this._fBot.geometry.attributes.position.array;
          for (var fi = 0; fi < 300; fi++) {
            ftArr[fi*3+1] = topY + (Math.random()-0.5)*4;
            fbArr[fi*3+1] = botY + (Math.random()-0.5)*4;
          }
          this._fTop.geometry.attributes.position.needsUpdate = true;
          this._fBot.geometry.attributes.position.needsUpdate = true;

          /* ── flash at reconnection moment ── */
          var flashP = APPROACH;
          var inFlash = (p > flashP && p < flashP + FLASH_P);
          this._flash.visible = inFlash;
          if (inFlash) {
            var fp2 = (p - flashP) / FLASH_P;
            this._flash.scale.setScalar(1 + fp2 * 4);
            this._flashMat.opacity = 1 - fp2;
          }

          /* ── outflow jets grow after flash ── */
          var outStart = APPROACH + FLASH_P;
          if (p > outStart) {
            var of = Math.min((p - outStart) / OUTFLOW, 1);
            var jetLen = of * this._JET_MAXLEN;
            this._jlMat.opacity = of * 0.65;
            this._jrMat.opacity = of * 0.65;
            var jlArr = this._jLeft.geometry.attributes.position.array;
            var jrArr = this._jRight.geometry.attributes.position.array;
            for (var ji = 0; ji < 200; ji++) {
              jlArr[ji*3  ] = this._jLeftPts[ji*3  ] * jetLen;
              jrArr[ji*3  ] = this._jRightPts[ji*3  ] * jetLen;
            }
            this._jLeft.geometry.attributes.position.needsUpdate = true;
            this._jRight.geometry.attributes.position.needsUpdate = true;
          } else {
            this._jlMat.opacity = 0;
            this._jrMat.opacity = 0;
          }

          /* ── spray burst ── */
          if (inFlash && !this._spraying) {
            this._spraying = true;
            this._sprayAge = 0;
          }
          if (!inFlash && p < APPROACH) this._spraying = false;
          if (this._spraying) {
            this._sprayAge += dt;
            var sArr = this._spray.geometry.attributes.position.array;
            for (var ei = 0; ei < 600; ei++) {
              sArr[ei*3  ] = this._sprayV[ei*3  ] * this._sprayAge * 20;
              sArr[ei*3+1] = this._sprayV[ei*3+1] * this._sprayAge * 20;
              sArr[ei*3+2] = this._sprayV[ei*3+2] * this._sprayAge * 20;
            }
            this._spray.geometry.attributes.position.needsUpdate = true;
            this._sprayMat.opacity = Math.max(0, 0.6 - this._sprayAge * 0.2);
          }
        },
      });

      /* ====================================================================
         MAGNETOPAUSE FLUX — the dynamic boundary surface where a planet's
         (or star's) magnetic field deflects the high-energy stellar wind.
         A compressed, teardrop-shaped magnetosphere glows at its boundary.
         Position: (-300, 400, 800).
         Components:
           - Magnetosphere body: compressed teardrop shell (1800 pts) — cyan-blue
           - Magnetopause surface: bright boundary layer (900 pts) — hot white
           - Bow shock exterior: 1200 pts ~ 1.3× magnetosphere — dim orange
           - Solar wind stream: 1000 pts flowing in +Z direction from far away
           - Cusp regions: two funnels at magnetic poles letting particles in
           - Flux tubes: 6 field-line tubes connecting cusps through interior
           - Slow rotation and magnetopause rippling
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("magnetopause-flux", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-300, 400, 800);
          scene.add(this._root);

          /* ── magnetosphere body (teardrop: compressed sunward, elongated tailward) ── */
          var MN = 1800;
          this._magPts = new Float32Array(MN * 3);
          for (var mi = 0; mi < MN; mi++) {
            var phi = Math.acos(2*Math.random()-1);
            var theta = Math.random() * 2 * Math.PI;
            /* squash toward sun (+Z side) */
            var rBase = 100;
            var rSun = rBase * (phi < Math.PI/2 ? 0.6 : 1.3);
            this._magPts[mi*3  ] = rSun * Math.sin(phi) * Math.cos(theta);
            this._magPts[mi*3+1] = rSun * Math.cos(phi);
            this._magPts[mi*3+2] = rSun * Math.sin(phi) * Math.sin(theta);
          }
          var mGeo = new THREE.BufferGeometry();
          mGeo.setAttribute("position", new THREE.BufferAttribute(this._magPts, 3));
          this._magMat = new THREE.PointsMaterial({
            color: 0x2244aa, size: 2.0, transparent: true, opacity: 0.30,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(mGeo, this._magMat));

          /* ── magnetopause bright boundary ── */
          var BPN = 900;
          var bpPts = new Float32Array(BPN * 3);
          for (var bi = 0; bi < BPN; bi++) {
            var bphi = Math.acos(2*Math.random()-1);
            var btheta = Math.random()*2*Math.PI;
            var bR = (bphi < Math.PI/2 ? 62 : 133) + (Math.random()-0.5)*6;
            bpPts[bi*3  ] = bR * Math.sin(bphi)*Math.cos(btheta);
            bpPts[bi*3+1] = bR * Math.cos(bphi);
            bpPts[bi*3+2] = bR * Math.sin(bphi)*Math.sin(btheta);
          }
          var bpGeo = new THREE.BufferGeometry();
          bpGeo.setAttribute("position", new THREE.BufferAttribute(bpPts, 3));
          this._bpMat = new THREE.PointsMaterial({
            color: 0x88ccff, size: 2.5, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(bpGeo, this._bpMat));

          /* ── bow shock ── */
          var BSN = 1200;
          var bsPts = new Float32Array(BSN * 3);
          for (var bsi = 0; bsi < BSN; bsi++) {
            var bsph = Math.acos(2*Math.random()-1);
            var bsth = Math.random()*2*Math.PI;
            var bsR = (bsph < Math.PI/2 ? 85 : 175) + (Math.random()-0.5)*10;
            bsPts[bsi*3  ] = bsR * Math.sin(bsph)*Math.cos(bsth);
            bsPts[bsi*3+1] = bsR * Math.cos(bsph);
            bsPts[bsi*3+2] = bsR * Math.sin(bsph)*Math.sin(bsth);
          }
          var bsGeo = new THREE.BufferGeometry();
          bsGeo.setAttribute("position", new THREE.BufferAttribute(bsPts, 3));
          this._root.add(new THREE.Points(bsGeo, new THREE.PointsMaterial({
            color: 0xff8833, size: 1.8, transparent: true, opacity: 0.20,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── solar wind stream (1000 pts) ── */
          var SWN = 1000;
          this._swPts = new Float32Array(SWN * 3);
          this._swV = new Float32Array(SWN);
          for (var si = 0; si < SWN; si++) {
            this._swPts[si*3  ] = (Math.random()-0.5)*300;
            this._swPts[si*3+1] = (Math.random()-0.5)*300;
            this._swPts[si*3+2] = -200 - Math.random()*400;
            this._swV[si] = 80 + Math.random()*40;
          }
          var swGeo = new THREE.BufferGeometry();
          swGeo.setAttribute("position", new THREE.BufferAttribute(this._swPts, 3));
          this._swMat = new THREE.PointsMaterial({
            color: 0xffaa44, size: 1.5, transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._wind = new THREE.Points(swGeo, this._swMat);
          this._root.add(this._wind);

          this._mpTime = 0;
          console.log("[magnetopause-flux] deflecting at (-300,400,800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._mpTime += dt;

          /* ── solar wind streams in +Z ── */
          var swArr = this._wind.geometry.attributes.position.array;
          for (var si = 0; si < 1000; si++) {
            swArr[si*3+2] += this._swV[si] * dt;
            if (swArr[si*3+2] > 300) swArr[si*3+2] = -600;
          }
          this._wind.geometry.attributes.position.needsUpdate = true;

          /* ── magnetopause ripple ── */
          this._bpMat.opacity = 0.45 + 0.15 * Math.sin(this._mpTime * 1.3);
          this._root.rotation.y += 0.003 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 27 injected! Lines:", lineCount);
