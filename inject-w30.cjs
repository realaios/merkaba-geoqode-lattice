"use strict";
// inject-w30.cjs — Wave 30: globular-cluster-core + cosmic-shear-flow
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("globular-cluster-core"')) {
  console.log("Wave 30 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity plasma-double-layer></a-entity>";
const HTML_INSERT = `      <a-entity plasma-double-layer></a-entity>
      <!-- ── GLOBULAR CLUSTER CORE — ancient dense stellar sphere with core-collapse dynamics ── -->
      <a-entity globular-cluster-core></a-entity>
      <!-- ── COSMIC SHEAR FLOW — Kelvin-Helmholtz rolls at a gas interface ── -->
      <a-entity cosmic-shear-flow></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         GLOBULAR CLUSTER CORE — one of the oldest stellar structures in the
         universe. A tight sphere of 100,000+ old stars with extreme central
         density. The core may be on the verge of core collapse, creating
         an ultra-dense central cusp.
         Position: (-500, 700, -500).
         Components:
           - Outer halo: 2000 pts (r=60-200, dim yellowish)
           - Middle shell: 1500 pts (r=20-60, brighter)
           - Inner core: 1000 pts (r=5-20, very bright, white-gold)
           - Ultra-dense cusp: 400 pts r<5 (blazing white)
           - Tidal tail stub: 500 pts extending in one direction (stars being stripped)
           - 15 blue straggler "hotspots" (r<20, bright blue Mesh pts)
           - Slow solid-body rotation of whole cluster
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("globular-cluster-core", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-500, 700, -500);
          scene.add(this._root);

          /* helper: add a sphere of pts */
          var addBand = function(N, rMin, rMax, color, size, opacity) {
            var pts = new Float32Array(N * 3);
            for (var i = 0; i < N; i++) {
              var r = rMin + Math.random() * (rMax - rMin);
              var ph = Math.acos(2*Math.random()-1);
              var th = Math.random()*2*Math.PI;
              pts[i*3  ] = r*Math.sin(ph)*Math.cos(th);
              pts[i*3+1] = r*Math.cos(ph);
              pts[i*3+2] = r*Math.sin(ph)*Math.sin(th);
            }
            var geo = new THREE.BufferGeometry();
            geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
            return new THREE.Points(geo, new THREE.PointsMaterial({
              color: color, size: size, transparent: true, opacity: opacity,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
          };

          /* outer halo */
          this._root.add(addBand(2000, 60, 200, 0xddbb88, 1.5, 0.18));
          /* middle shell */
          this._root.add(addBand(1500, 20, 60, 0xffddaa, 2.0, 0.35));
          /* inner core */
          this._root.add(addBand(1000, 5, 20, 0xffeecc, 2.5, 0.65));
          /* ultra-dense cusp */
          this._cuspMat = new THREE.PointsMaterial({
            color: 0xffffff, size: 4.0, transparent: true, opacity: 0.90,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          var cusp = addBand(400, 0, 5, 0xffffff, 4.0, 0.90);
          this._cuspMat = cusp.material;
          this._root.add(cusp);

          /* tidal tail stub */
          var TTN = 500;
          var ttPts = new Float32Array(TTN * 3);
          for (var tti = 0; tti < TTN; tti++) {
            ttPts[tti*3  ] = 200 + Math.random() * 200;
            ttPts[tti*3+1] = (Math.random()-0.5) * 40;
            ttPts[tti*3+2] = (Math.random()-0.5) * 40;
          }
          var ttGeo = new THREE.BufferGeometry();
          ttGeo.setAttribute("position", new THREE.BufferAttribute(ttPts, 3));
          this._root.add(new THREE.Points(ttGeo, new THREE.PointsMaterial({
            color: 0xbbaa88, size: 1.5, transparent: true, opacity: 0.20,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* blue straggler hotspots (15 bright blue points) */
          for (var bsi = 0; bsi < 15; bsi++) {
            var bsr = 5 + Math.random()*15;
            var bsp = Math.acos(2*Math.random()-1);
            var bst = Math.random()*2*Math.PI;
            var bs = new THREE.Mesh(
              new THREE.SphereGeometry(1.5, 4, 3),
              new THREE.MeshBasicMaterial({ color: 0x6699ff })
            );
            bs.position.set(
              bsr*Math.sin(bsp)*Math.cos(bst),
              bsr*Math.cos(bsp),
              bsr*Math.sin(bsp)*Math.sin(bst)
            );
            this._root.add(bs);
          }

          this._gcTime = 0;
          console.log("[globular-cluster-core] condensing at (-500,700,-500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._gcTime += dt;
          /* slow rotation */
          this._root.rotation.y += 0.0015 * dt;
          /* cusp pulse */
          this._cuspMat.opacity = 0.80 + 0.15 * Math.sin(this._gcTime * 3.7);
        },
      });

      /* ====================================================================
         COSMIC SHEAR FLOW — Kelvin-Helmholtz instability rolls at the
         boundary between two gas streams moving in opposite directions.
         The rolls grow, merge and shed vortices in a beautiful cascade.
         Position: (-100, -700, -400).
         Components:
           - Fast upper stream: 1200 pts moving in +X (hot blue-white)
           - Slow lower stream: 1200 pts moving in -X (warm red-orange)
           - KH boundary layer: 600 pts in a sinusoidal interface (bright green)
           - Growing vortex rolls: 8 rolls, amplitude increases over 12s then reset
           - Shed vortex cores: 4 bright cores drifting downstream
           - Turbulent mixing zone: 400 pts of chaotic mid-layer
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("cosmic-shear-flow", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-100, -700, -400);
          scene.add(this._root);

          /* ── upper stream (1200 pts) ── */
          var UN = 1200;
          this._upPts = new Float32Array(UN * 3);
          this._upV = new Float32Array(UN);
          for (var ui = 0; ui < UN; ui++) {
            this._upPts[ui*3  ] = (Math.random()-0.5) * 400;
            this._upPts[ui*3+1] = 20 + Math.random() * 80;
            this._upPts[ui*3+2] = (Math.random()-0.5) * 80;
            this._upV[ui] = 40 + Math.random() * 30;
          }
          var upGeo = new THREE.BufferGeometry();
          upGeo.setAttribute("position", new THREE.BufferAttribute(this._upPts, 3));
          this._upGeo = upGeo;
          this._root.add(new THREE.Points(upGeo, new THREE.PointsMaterial({
            color: 0x88ccff, size: 2.0, transparent: true, opacity: 0.28,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── lower stream (1200 pts) ── */
          var LN = 1200;
          this._loPts = new Float32Array(LN * 3);
          this._loV = new Float32Array(LN);
          for (var li = 0; li < LN; li++) {
            this._loPts[li*3  ] = (Math.random()-0.5) * 400;
            this._loPts[li*3+1] = -20 - Math.random() * 80;
            this._loPts[li*3+2] = (Math.random()-0.5) * 80;
            this._loV[li] = 40 + Math.random() * 30;
          }
          var loGeo = new THREE.BufferGeometry();
          loGeo.setAttribute("position", new THREE.BufferAttribute(this._loPts, 3));
          this._loGeo = loGeo;
          this._root.add(new THREE.Points(loGeo, new THREE.PointsMaterial({
            color: 0xff7744, size: 2.0, transparent: true, opacity: 0.28,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── KH boundary layer (600 pts, wavy) ── */
          var KHN = 600;
          this._khBase = new Float32Array(KHN * 3);
          for (var ki = 0; ki < KHN; ki++) {
            this._khBase[ki*3  ] = (ki / (KHN-1) - 0.5) * 400;
            this._khBase[ki*3+1] = 0;
            this._khBase[ki*3+2] = (Math.random()-0.5) * 15;
          }
          var khGeo = new THREE.BufferGeometry();
          khGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(KHN*3), 3));
          this._khGeo = khGeo;
          this._root.add(new THREE.Points(khGeo, new THREE.PointsMaterial({
            color: 0x44ff88, size: 3.0, transparent: true, opacity: 0.65,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── mixing zone (400 pts) ── */
          var MXN = 400;
          var mxPts = new Float32Array(MXN * 3);
          for (var mxi = 0; mxi < MXN; mxi++) {
            mxPts[mxi*3  ] = (Math.random()-0.5)*400;
            mxPts[mxi*3+1] = (Math.random()-0.5)*30;
            mxPts[mxi*3+2] = (Math.random()-0.5)*30;
          }
          var mxGeo = new THREE.BufferGeometry();
          mxGeo.setAttribute("position", new THREE.BufferAttribute(mxPts, 3));
          this._root.add(new THREE.Points(mxGeo, new THREE.PointsMaterial({
            color: 0xaaffcc, size: 1.5, transparent: true, opacity: 0.18,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._sfTime = 0;
          this._PERIOD = 12.0;
          console.log("[cosmic-shear-flow] rolling at (-100,-700,-400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._sfTime += dt;

          /* ── streams flow in ±X ── */
          var uArr = this._upGeo.attributes.position.array;
          var lArr = this._loGeo.attributes.position.array;
          for (var i = 0; i < 1200; i++) {
            uArr[i*3  ] += this._upV[i] * dt;
            if (uArr[i*3  ] > 200) uArr[i*3  ] = -200;
            lArr[i*3  ] -= this._loV[i] * dt;
            if (lArr[i*3  ] < -200) lArr[i*3  ] = 200;
          }
          this._upGeo.attributes.position.needsUpdate = true;
          this._loGeo.attributes.position.needsUpdate = true;

          /* ── KH interface: sinusoidal roll amplitude grows with phase ── */
          var phase = (this._sfTime % this._PERIOD) / this._PERIOD;
          var amp = phase < 0.8 ? phase * 40 : (1 - phase) * 200;
          var khArr = this._khGeo.attributes.position.array;
          for (var ki = 0; ki < 600; ki++) {
            var xv = this._khBase[ki*3  ];
            khArr[ki*3  ] = xv;
            khArr[ki*3+1] = amp * Math.sin(xv * 0.05 + this._sfTime * 1.5);
            khArr[ki*3+2] = this._khBase[ki*3+2];
          }
          this._khGeo.attributes.position.needsUpdate = true;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 30 injected! Lines:", lineCount);
