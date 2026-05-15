"use strict";
// inject-w37.cjs — Wave 37: magnetar-wind-nebula + tidal-tail-bridge
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("magnetar-wind-nebula"')) {
  console.log("Wave 37 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity planetary-nebula-halo></a-entity>";
const HTML_INSERT = `      <a-entity planetary-nebula-halo></a-entity>
      <!-- ── MAGNETAR WIND NEBULA — PWN driven by a spinning-down magnetar ── -->
      <a-entity magnetar-wind-nebula></a-entity>
      <!-- ── TIDAL TAIL BRIDGE — stellar stream bridge between two merging galaxies ── -->
      <a-entity tidal-tail-bridge></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         MAGNETAR WIND NEBULA — a pulsar wind nebula whose central engine is
         a magnetar (ultra-high B-field neutron star). The wind is more
         energetic than a normal PWN, producing a bright compact torus,
         counter-jets, and a halo of accelerated particles.
         Position: (-600, 350, -800).
         Components:
           - Central magnetar: pulsing white-blue dot
           - Wind torus: 500 pts equatorial torus (bright, rapidly rotating)
           - Counter-jets: two jets N/S (150 pts each, white-blue, fast)
           - Compact nebula inner: 400 pts bright X-ray nebula body
           - Outer cocoon: 300 pts fainter outer nebula
           - Striped wind: 3 bands of alternating polarity (color-modulated)
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("magnetar-wind-nebula", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-600, 350, -800);
          scene.add(this._root);

          /* central magnetar */
          this._mag = new THREE.Mesh(
            new THREE.SphereGeometry(3, 6, 4),
            new THREE.MeshBasicMaterial({ color: 0xaaddff })
          );
          this._root.add(this._mag);

          /* wind torus */
          var TN = 500;
          var tPts = new Float32Array(TN * 3);
          for (var ti = 0; ti < TN; ti++) {
            var ta = (ti/TN)*2*Math.PI + (Math.random()-0.5)*0.2;
            var tr = 28 + (Math.random()-0.5)*6;
            var tz = (Math.random()-0.5)*8;
            tPts[ti*3  ] = tr*Math.cos(ta);
            tPts[ti*3+1] = tz;
            tPts[ti*3+2] = tr*Math.sin(ta);
          }
          var tGeo = new THREE.BufferGeometry();
          tGeo.setAttribute("position", new THREE.BufferAttribute(tPts, 3));
          this._torusMat = new THREE.PointsMaterial({
            color: 0x88ddff, size: 2.8, transparent: true, opacity: 0.70,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._torusMesh = new THREE.Points(tGeo, this._torusMat);
          this._root.add(this._torusMesh);

          /* counter-jets */
          for (var jj = 0; jj < 2; jj++) {
            var JN = 150;
            var jPts = new Float32Array(JN * 3);
            var jsign = jj===0 ? 1 : -1;
            for (var ji = 0; ji < JN; ji++) {
              var jlen = (ji/JN)*80 + 5;
              var jR = (1 - ji/JN)*5 + 0.5;
              var ja = Math.random()*2*Math.PI;
              jPts[ji*3  ] = jR*Math.cos(ja);
              jPts[ji*3+1] = jsign*jlen;
              jPts[ji*3+2] = jR*Math.sin(ja);
            }
            var jGeo = new THREE.BufferGeometry();
            jGeo.setAttribute("position", new THREE.BufferAttribute(jPts, 3));
            this._root.add(new THREE.Points(jGeo, new THREE.PointsMaterial({
              color: 0xffffff, size: 2.5, transparent: true, opacity: 0.65,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* inner nebula body */
          var IN = 400;
          var iPts = new Float32Array(IN * 3);
          for (var ini = 0; ini < IN; ini++) {
            var ip = Math.acos(2*Math.random()-1);
            var ia = Math.random()*2*Math.PI;
            var ir = 10 + Math.random()*35;
            iPts[ini*3  ] = ir*Math.sin(ip)*Math.cos(ia);
            iPts[ini*3+1] = ir*Math.cos(ip)*1.5;
            iPts[ini*3+2] = ir*Math.sin(ip)*Math.sin(ia);
          }
          var iGeo = new THREE.BufferGeometry();
          iGeo.setAttribute("position", new THREE.BufferAttribute(iPts, 3));
          this._root.add(new THREE.Points(iGeo, new THREE.PointsMaterial({
            color: 0x66aaee, size: 2.0, transparent: true, opacity: 0.40,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* outer cocoon */
          var ON = 300;
          var oPts = new Float32Array(ON * 3);
          for (var oi = 0; oi < ON; oi++) {
            var op = Math.acos(2*Math.random()-1);
            var oa = Math.random()*2*Math.PI;
            var or2 = 55 + (Math.random()-0.5)*15;
            oPts[oi*3  ] = or2*Math.sin(op)*Math.cos(oa);
            oPts[oi*3+1] = or2*Math.cos(op)*1.3;
            oPts[oi*3+2] = or2*Math.sin(op)*Math.sin(oa);
          }
          var oGeo = new THREE.BufferGeometry();
          oGeo.setAttribute("position", new THREE.BufferAttribute(oPts, 3));
          this._root.add(new THREE.Points(oGeo, new THREE.PointsMaterial({
            color: 0x334488, size: 1.8, transparent: true, opacity: 0.18,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._mwnTime = 0;
          console.log("[magnetar-wind-nebula] loaded at (-600,350,-800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._mwnTime += dt;

          /* fast torus spin */
          this._torusMesh.rotation.y = this._mwnTime * 1.5;

          /* magnetar strobe */
          var pulse = 0.6 + 0.4 * Math.abs(Math.sin(this._mwnTime * 6.3));
          this._mag.material.color.setHSL(0.55, 1.0, pulse);

          /* torus opacity wave */
          this._torusMat.opacity = 0.55 + 0.20 * Math.sin(this._mwnTime * 2.7);

          this._root.rotation.x += 0.0002 * dt;
        },
      });

      /* ====================================================================
         TIDAL TAIL BRIDGE — the long stellar tidal tail connecting two
         interacting/merging galaxies. Stars pulled out of one galaxy stream
         toward the other and continue past, forming an arc bridge and
         counter-tail.
         Position: (500, 600, -400).
         Components:
           - Galaxy A nucleus: 500 pts (gold, compact)
           - Galaxy B nucleus: 400 pts (blue-white, offset 250 units)
           - Main tidal bridge: 800 pts streaming from A→B (arc trajectory)
           - Counter-tail A: 400 pts streaming away from B (back side)
           - Counter-tail B: 300 pts smaller counter-tail from B
           - Interbody gas: 200 pts diffuse gas between nuclei
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("tidal-tail-bridge", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(500, 600, -400);
          scene.add(this._root);

          /* galaxy A nucleus */
          var AN = 500;
          var aPts = new Float32Array(AN * 3);
          for (var ai = 0; ai < AN; ai++) {
            var aa = Math.random()*2*Math.PI;
            var ar = Math.sqrt(Math.random())*22;
            aPts[ai*3  ] = ar*Math.cos(aa) - 125;
            aPts[ai*3+1] = ar*Math.sin(aa)*0.4 + (Math.random()-0.5)*5;
            aPts[ai*3+2] = (Math.random()-0.5)*8;
          }
          var aGeo = new THREE.BufferGeometry();
          aGeo.setAttribute("position", new THREE.BufferAttribute(aPts, 3));
          this._root.add(new THREE.Points(aGeo, new THREE.PointsMaterial({
            color: 0xffcc44, size: 2.2, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* galaxy B nucleus */
          var BN = 400;
          var bPts = new Float32Array(BN * 3);
          for (var bi = 0; bi < BN; bi++) {
            var ba = Math.random()*2*Math.PI;
            var br = Math.sqrt(Math.random())*18;
            bPts[bi*3  ] = br*Math.cos(ba) + 125;
            bPts[bi*3+1] = br*Math.sin(ba)*0.5 + 30 + (Math.random()-0.5)*5;
            bPts[bi*3+2] = (Math.random()-0.5)*8;
          }
          var bGeo = new THREE.BufferGeometry();
          bGeo.setAttribute("position", new THREE.BufferAttribute(bPts, 3));
          this._root.add(new THREE.Points(bGeo, new THREE.PointsMaterial({
            color: 0x99ccff, size: 2.2, transparent: true, opacity: 0.50,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* main tidal bridge: arc from A→B */
          var TN = 800;
          var tPts = new Float32Array(TN * 3);
          for (var ti = 0; ti < TN; ti++) {
            var tt = ti/TN;
            /* parametric arc */
            var tx = -125 + tt*250;
            var ty = tt*(1-tt)*80 + tt*30;
            var tz = (Math.random()-0.5)*15;
            var tr = (Math.random()-0.5)*12;
            tPts[ti*3  ] = tx + tr;
            tPts[ti*3+1] = ty + (Math.random()-0.5)*8;
            tPts[ti*3+2] = tz;
          }
          var tGeo = new THREE.BufferGeometry();
          tGeo.setAttribute("position", new THREE.BufferAttribute(tPts, 3));
          this._root.add(new THREE.Points(tGeo, new THREE.PointsMaterial({
            color: 0xffffcc, size: 1.8, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* counter-tail from A */
          var CTN = 400;
          var ctPts = new Float32Array(CTN * 3);
          for (var cti = 0; cti < CTN; cti++) {
            var ctt = cti/CTN;
            var ctx = -125 - ctt*180;
            var cty = ctt*(-40) + (Math.random()-0.5)*12;
            ctPts[cti*3  ] = ctx + (Math.random()-0.5)*10;
            ctPts[cti*3+1] = cty;
            ctPts[cti*3+2] = (Math.random()-0.5)*12;
          }
          var ctGeo = new THREE.BufferGeometry();
          ctGeo.setAttribute("position", new THREE.BufferAttribute(ctPts, 3));
          this._root.add(new THREE.Points(ctGeo, new THREE.PointsMaterial({
            color: 0xffdd88, size: 1.5, transparent: true, opacity: 0.22,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* counter-tail from B */
          var CT2N = 300;
          var ct2Pts = new Float32Array(CT2N * 3);
          for (var ct2i = 0; ct2i < CT2N; ct2i++) {
            var ct2t = ct2i/CT2N;
            ct2Pts[ct2i*3  ] = 125 + ct2t*130 + (Math.random()-0.5)*10;
            ct2Pts[ct2i*3+1] = 30 - ct2t*50 + (Math.random()-0.5)*10;
            ct2Pts[ct2i*3+2] = (Math.random()-0.5)*10;
          }
          var ct2Geo = new THREE.BufferGeometry();
          ct2Geo.setAttribute("position", new THREE.BufferAttribute(ct2Pts, 3));
          this._root.add(new THREE.Points(ct2Geo, new THREE.PointsMaterial({
            color: 0xaaccff, size: 1.5, transparent: true, opacity: 0.20,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* interbody gas */
          var IGN = 200;
          var igPts = new Float32Array(IGN * 3);
          for (var igi = 0; igi < IGN; igi++) {
            igPts[igi*3  ] = (Math.random()-0.5)*260;
            igPts[igi*3+1] = (Math.random()-0.5)*60 + 15;
            igPts[igi*3+2] = (Math.random()-0.5)*30;
          }
          var igGeo = new THREE.BufferGeometry();
          igGeo.setAttribute("position", new THREE.BufferAttribute(igPts, 3));
          this._root.add(new THREE.Points(igGeo, new THREE.PointsMaterial({
            color: 0xeeddff, size: 1.5, transparent: true, opacity: 0.08,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._ttTime = 0;
          console.log("[tidal-tail-bridge] loaded at (500,600,-400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._ttTime += dt;
          this._root.rotation.y += 0.0003 * dt;
          this._root.rotation.z = 0.15 * Math.sin(this._ttTime * 0.07);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 37 injected! Lines:", lineCount);
