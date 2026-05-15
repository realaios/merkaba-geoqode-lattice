"use strict";
// inject-w26.cjs — Wave 26: einstein-ring + cosmic-dust-lane
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("einstein-ring"')) {
  console.log("Wave 26 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity stellar-bow-shock></a-entity>";
const HTML_INSERT = `      <a-entity stellar-bow-shock></a-entity>
      <!-- ── EINSTEIN RING — perfect gravitational lensing arc around a massive lens ── -->
      <a-entity einstein-ring></a-entity>
      <!-- ── COSMIC DUST LANE — dark extinction band bisecting a spiral galaxy ── -->
      <a-entity cosmic-dust-lane></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         EINSTEIN RING — when a background galaxy is perfectly aligned behind a
         massive foreground lens (galaxy or cluster), its light is bent into
         a complete ring (Einstein ring). Incredibly rare, incredibly beautiful.
         Position: (900, 200, -500).
         Components:
           - Lens galaxy: compact bright elliptical (r=30), slowly rotating
           - Einstein ring: 3 overlapping torus-shaped point arcs at different
             radii (r=80, 85, 90) giving ring a slight thickness, pulsing blue-white
           - Partial arcs when offset: 4 additional arc segments at 70° each
             offset by ±20 from perfect alignment
           - Background source ghost: dim orange blob behind the lens (lensed origin)
           - Ring shimmer: brightness modulates at ~0.4 Hz (seeing variation)
           - Slow lens wobble simulating proper motion
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("einstein-ring", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(900, 200, -500);
          scene.add(this._root);

          /* ── lens galaxy (compact elliptical) ── */
          var LN = 400;
          var lPts = new Float32Array(LN * 3);
          for (var li = 0; li < LN; li++) {
            var rr = 30 * Math.cbrt(Math.random());
            var phi = Math.acos(2*Math.random()-1);
            var theta = Math.random()*2*Math.PI;
            lPts[li*3  ] = rr * Math.sin(phi)*Math.cos(theta) * 1.6;
            lPts[li*3+1] = rr * Math.cos(phi);
            lPts[li*3+2] = rr * Math.sin(phi)*Math.sin(theta) * 0.6;
          }
          var lGeo = new THREE.BufferGeometry();
          lGeo.setAttribute("position", new THREE.BufferAttribute(lPts, 3));
          this._root.add(new THREE.Points(lGeo, new THREE.PointsMaterial({
            color: 0xffdd88, size: 2.0, transparent: true, opacity: 0.60,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));
          this._lens = new THREE.Group();
          this._root.add(this._lens);

          /* ── Einstein ring arcs (3 radii × 1500 pts each) ── */
          var radii = [80, 85, 90];
          this._ringPts = [];
          this._ringMats = [];
          for (var ri = 0; ri < radii.length; ri++) {
            var RR = radii[ri];
            var RN = 1500;
            var rPts = new Float32Array(RN * 3);
            for (var rpi = 0; rpi < RN; rpi++) {
              var ang = Math.random() * 2 * Math.PI;
              rPts[rpi*3  ] = RR * Math.cos(ang);
              rPts[rpi*3+1] = (Math.random()-0.5) * 8;
              rPts[rpi*3+2] = RR * Math.sin(ang);
            }
            var rGeo = new THREE.BufferGeometry();
            rGeo.setAttribute("position", new THREE.BufferAttribute(rPts, 3));
            var rMat = new THREE.PointsMaterial({
              color: 0xaaddff, size: 2.0, transparent: true, opacity: 0.55,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            this._ringMats.push(rMat);
            this._root.add(new THREE.Points(rGeo, rMat));
          }

          /* ── partial arc segments (4 × 70°) ── */
          var arcStarts = [0, 0.55, 1.1, 1.65].map(function(v){ return v * 2 * Math.PI; });
          var arcSpan = 70 * Math.PI / 180;
          for (var ai = 0; ai < arcStarts.length; ai++) {
            var APN = 200;
            var aPts = new Float32Array(APN * 3);
            for (var api = 0; api < APN; api++) {
              var a = arcStarts[ai] + arcSpan * (api / (APN-1));
              var offR = 95 + Math.random() * 10;
              aPts[api*3  ] = offR * Math.cos(a);
              aPts[api*3+1] = (Math.random()-0.5) * 12;
              aPts[api*3+2] = offR * Math.sin(a);
            }
            var aGeo = new THREE.BufferGeometry();
            aGeo.setAttribute("position", new THREE.BufferAttribute(aPts, 3));
            this._root.add(new THREE.Points(aGeo, new THREE.PointsMaterial({
              color: 0x66aaff, size: 1.5, transparent: true, opacity: 0.35,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* ── background source ghost ── */
          var BGN = 300;
          var bgPts = new Float32Array(BGN * 3);
          for (var bi = 0; bi < BGN; bi++) {
            bgPts[bi*3  ] = (Math.random()-0.5)*30;
            bgPts[bi*3+1] = (Math.random()-0.5)*20;
            bgPts[bi*3+2] = 30 + Math.random()*20;
          }
          var bgGeo = new THREE.BufferGeometry();
          bgGeo.setAttribute("position", new THREE.BufferAttribute(bgPts, 3));
          this._root.add(new THREE.Points(bgGeo, new THREE.PointsMaterial({
            color: 0xff9944, size: 2.5, transparent: true, opacity: 0.15,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._erTime = 0;
          console.log("[einstein-ring] lensing at (900,200,-500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._erTime += dt;
          /* ── ring shimmer at 0.4 Hz ── */
          var shimmer = 0.40 + 0.20 * Math.abs(Math.sin(this._erTime * 0.4 * 2 * Math.PI));
          for (var ri = 0; ri < this._ringMats.length; ri++) {
            this._ringMats[ri].opacity = shimmer - ri * 0.03;
          }
          /* ── lens wobble (proper motion) ── */
          this._root.position.x = 900 + 5 * Math.sin(this._erTime * 0.07);
          this._root.position.y = 200 + 3 * Math.cos(this._erTime * 0.05);
          /* ── slow ring rotation ── */
          this._root.rotation.z += 0.004 * dt;
        },
      });

      /* ====================================================================
         COSMIC DUST LANE — the dark extinction band that bisects the bright
         disk of an edge-on spiral galaxy. Dust absorbs starlight so intensely
         that a crisp dark channel runs through the bright galactic core.
         Position: (-600, -700, 300).
         Components:
           - Bright disk of stars (2500 pts, flattened ellipsoid ~r=200, thin)
           - Dark lane: subtract zone simulated by a dense band of very dark
             absorbing "dust clumps" (800 pts, nearly black, very opaque, no
             additive — use NormalBlending at low opacity to darken region)
           - Dust clumps: 300 larger brownish pts with random size variation
           - Nuclear bulge: dense spheroidal concentration (600 pts, r=40)
           - Halo: faint diffuse sphere (500 pts, r=280) of old metal-poor stars
           - Slow rotation around disk normal axis
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("cosmic-dust-lane", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-600, -700, 300);
          scene.add(this._root);

          /* ── stellar disk (2500 pts) ── */
          var DN = 2500;
          var dPts = new Float32Array(DN * 3);
          for (var di = 0; di < DN; di++) {
            var rDisk = 20 + Math.random() * 200;
            var angD = Math.random() * 2 * Math.PI;
            dPts[di*3  ] = rDisk * Math.cos(angD);
            dPts[di*3+1] = (Math.random()-0.5) * 20; /* thin disk */
            dPts[di*3+2] = rDisk * Math.sin(angD) * 0.25; /* edge-on tilt */
          }
          var dGeo = new THREE.BufferGeometry();
          dGeo.setAttribute("position", new THREE.BufferAttribute(dPts, 3));
          this._diskMat = new THREE.PointsMaterial({
            color: 0xffeedd, size: 2.0, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._disk = new THREE.Points(dGeo, this._diskMat);
          this._root.add(this._disk);

          /* ── nuclear bulge (600 pts) ── */
          var BLN = 600;
          var blPts = new Float32Array(BLN * 3);
          for (var bli = 0; bli < BLN; bli++) {
            var rb = 40 * Math.cbrt(Math.random());
            var pb = Math.acos(2*Math.random()-1);
            var tb = Math.random()*2*Math.PI;
            blPts[bli*3  ] = rb*Math.sin(pb)*Math.cos(tb);
            blPts[bli*3+1] = rb*Math.cos(pb)*0.7;
            blPts[bli*3+2] = rb*Math.sin(pb)*Math.sin(tb)*0.25;
          }
          var blGeo = new THREE.BufferGeometry();
          blGeo.setAttribute("position", new THREE.BufferAttribute(blPts, 3));
          this._root.add(new THREE.Points(blGeo, new THREE.PointsMaterial({
            color: 0xffddaa, size: 2.5, transparent: true, opacity: 0.70,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── dust lane clumps (800 pts, dark absorbing band) ── */
          var DUSTN = 800;
          var dustPts = new Float32Array(DUSTN * 3);
          for (var dui = 0; dui < DUSTN; dui++) {
            var rDust = 15 + Math.random() * 185;
            var angDust = Math.random() * 2 * Math.PI;
            dustPts[dui*3  ] = rDust * Math.cos(angDust);
            dustPts[dui*3+1] = (Math.random()-0.5) * 6;
            dustPts[dui*3+2] = rDust * Math.sin(angDust) * 0.25;
          }
          var dustGeo = new THREE.BufferGeometry();
          dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPts, 3));
          this._root.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({
            color: 0x221100, size: 5.0, transparent: true, opacity: 0.65,
            blending: THREE.NormalBlending, depthWrite: false,
          })));

          /* ── 300 large dust clumps ── */
          var DCN = 300;
          var dcPts = new Float32Array(DCN * 3);
          for (var dci = 0; dci < DCN; dci++) {
            var rDc = 10 + Math.random() * 180;
            var angDc = Math.random() * 2 * Math.PI;
            dcPts[dci*3  ] = rDc * Math.cos(angDc);
            dcPts[dci*3+1] = (Math.random()-0.5) * 8;
            dcPts[dci*3+2] = rDc * Math.sin(angDc) * 0.25;
          }
          var dcGeo = new THREE.BufferGeometry();
          dcGeo.setAttribute("position", new THREE.BufferAttribute(dcPts, 3));
          this._root.add(new THREE.Points(dcGeo, new THREE.PointsMaterial({
            color: 0x332211, size: 8.0, transparent: true, opacity: 0.50,
            blending: THREE.NormalBlending, depthWrite: false,
          })));

          /* ── halo (500 pts) ── */
          var HN = 500;
          var hPts = new Float32Array(HN * 3);
          for (var hi = 0; hi < HN; hi++) {
            var rh = 200 + Math.random() * 80;
            var ph = Math.acos(2*Math.random()-1);
            var th = Math.random()*2*Math.PI;
            hPts[hi*3  ] = rh*Math.sin(ph)*Math.cos(th);
            hPts[hi*3+1] = rh*Math.cos(ph)*0.5;
            hPts[hi*3+2] = rh*Math.sin(ph)*Math.sin(th)*0.25;
          }
          var hGeo = new THREE.BufferGeometry();
          hGeo.setAttribute("position", new THREE.BufferAttribute(hPts, 3));
          this._root.add(new THREE.Points(hGeo, new THREE.PointsMaterial({
            color: 0xffccaa, size: 1.5, transparent: true, opacity: 0.15,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._cdlTime = 0;
          console.log("[cosmic-dust-lane] absorbing at (-600,-700,300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cdlTime += dt;
          /* ── disk rotation ── */
          this._disk.rotation.y += 0.008 * dt;
          this._root.rotation.z += 0.001 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 26 injected! Lines:", lineCount);
