"use strict";
// inject-w44.cjs — Wave 44: cosmic-string-network + starburst-superwind
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("cosmic-string-network"')) {
  console.log("Wave 44 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity galactic-center-minispiral></a-entity>";
const HTML_INSERT = `      <a-entity galactic-center-minispiral></a-entity>
      <!-- ── COSMIC STRING NETWORK — topological defect network from phase transition ── -->
      <a-entity cosmic-string-network></a-entity>
      <!-- ── STARBURST SUPERWIND — galaxy-wide superwind driven by starburst SNe ── -->
      <a-entity starburst-superwind></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC STRING NETWORK — topological defect strings form at a
         cosmological phase transition. The network of strings vibrates,
         intercommutes (reconnects), and radiates gravitational waves. Shows
         oscillating string loops and long strings crossing the box.
         Position: (600, -300, -700).
         Components:
           - Long strings: 6 long wiggly strings crossing the volume
           - String loops: 8 closed oscillating loop strings
           - Cusp emission: bright flash at cusps when loops are at min
           - GW halo: faint radiated energy halo from oscillating loops
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-string-network", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(600, -300, -700);
          scene.add(this._root);

          /* 6 long strings as tube-curves */
          this._longStrings = [];
          for (var lsi = 0; lsi < 6; lsi++) {
            var sPts = [];
            var nSeg = 20;
            var startX = (Math.random()-0.5)*160;
            var startZ = (Math.random()-0.5)*160;
            for (var sk = 0; sk <= nSeg; sk++) {
              var sT = sk/nSeg;
              sPts.push(new THREE.Vector3(
                startX + (Math.random()-0.5)*30,
                -80 + sT*160,
                startZ + (Math.random()-0.5)*30
              ));
            }
            var curve = new THREE.CatmullRomCurve3(sPts);
            var geo = new THREE.TubeGeometry(curve, 50, 0.8, 4, false);
            var lsColor = new THREE.Color().setHSL(lsi/6, 1, 0.7);
            var mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
              color: lsColor, transparent: true, opacity: 0.60,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(mesh);
            this._longStrings.push({ mesh: mesh, pts: sPts, curve: curve });
          }

          /* 8 closed string loops */
          this._loops = [];
          for (var li = 0; li < 8; li++) {
            var lRadius = 15 + Math.random()*30;
            var lCenter = new THREE.Vector3((Math.random()-0.5)*120, (Math.random()-0.5)*120, (Math.random()-0.5)*120);
            var loopPts = [];
            var NLP = 24;
            for (var lk = 0; lk <= NLP; lk++) {
              var lA = (lk/NLP)*2*Math.PI;
              loopPts.push(new THREE.Vector3(
                lCenter.x + lRadius*Math.cos(lA),
                lCenter.y + lRadius*0.3*Math.sin(lA*2),
                lCenter.z + lRadius*Math.sin(lA)
              ));
            }
            var lCurve = new THREE.CatmullRomCurve3(loopPts, true);
            var lGeo = new THREE.TubeGeometry(lCurve, 60, 0.6, 4, true);
            var lColor = new THREE.Color().setHSL(li/8, 0.8, 0.8);
            var lMesh = new THREE.Mesh(lGeo, new THREE.MeshBasicMaterial({
              color: lColor, transparent: true, opacity: 0.50,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(lMesh);
            this._loops.push({ mesh: lMesh, center: lCenter, radius: lRadius, phase: Math.random()*Math.PI*2 });
          }

          /* GW halo */
          var GWN = 400;
          var gwPts = new Float32Array(GWN * 3);
          for (var gwi = 0; gwi < GWN; gwi++) {
            var gwp = Math.acos(2*Math.random()-1), gwa = Math.random()*2*Math.PI;
            var gwr = 90 + Math.random()*30;
            gwPts[gwi*3  ] = gwr*Math.sin(gwp)*Math.cos(gwa);
            gwPts[gwi*3+1] = gwr*Math.cos(gwp);
            gwPts[gwi*3+2] = gwr*Math.sin(gwp)*Math.sin(gwa);
          }
          var gwGeo = new THREE.BufferGeometry();
          gwGeo.setAttribute("position", new THREE.BufferAttribute(gwPts, 3));
          this._root.add(new THREE.Points(gwGeo, new THREE.PointsMaterial({
            color: 0xaaaaff, size: 1.5, transparent: true, opacity: 0.07,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._csnTime = 0;
          console.log("[cosmic-string-network] loaded at (600,-300,-700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._csnTime += dt;

          /* loops oscillate in size (cusp oscillation) */
          for (var li = 0; li < this._loops.length; li++) {
            var lp = this._loops[li];
            var scaleFactor = 0.7 + 0.3*Math.abs(Math.sin(this._csnTime*2.0 + lp.phase));
            lp.mesh.scale.setScalar(scaleFactor);
          }

          this._root.rotation.y += 0.0002 * dt;
        },
      });

      /* ====================================================================
         STARBURST SUPERWIND — a starburst galaxy drives a galaxy-scale
         superwind via combined mechanical energy from thousands of supernovae.
         The wind breaks out perpendicular to the disk, entrains dense clouds,
         and creates bright H-alpha filaments streaming outward. M82-like.
         Position: (500, 0, 700).
         Components:
           - Galactic disk: edge-on disk with dust lane
           - Starburst core: bright nuclear region
           - Superwind bicone: outflowing wind N and S (tube/cone)
           - Entrained clouds: 30 dense blobs being blown out
           - H-alpha filaments: 200 bright red streamers
           - X-ray halo: hot gas outer envelope
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("starburst-superwind", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(500, 0, 700);
          scene.add(this._root);

          /* galactic disk */
          this._root.add(new THREE.Mesh(
            new THREE.CylinderGeometry(60, 60, 4, 40, 1),
            new THREE.MeshBasicMaterial({ color: 0x553311, transparent: true, opacity: 0.80, depthWrite: false })
          ));

          /* starburst core */
          this._sbCore = new THREE.Mesh(
            new THREE.SphereGeometry(8, 8, 6),
            new THREE.MeshBasicMaterial({ color: 0xffeeaa })
          );
          this._root.add(this._sbCore);

          /* superwind bicone N */
          for (var wdir = 0; wdir < 2; wdir++) {
            var sign = wdir===0 ? 1 : -1;
            var WN2 = 300;
            var wPts = new Float32Array(WN2 * 3);
            for (var wk = 0; wk < WN2; wk++) {
              var wT = wk/WN2;
              var wR = wT*70;
              var wa = Math.random()*2*Math.PI;
              var openHalfAngle = 0.4; /* rad */
              var wH = sign*(wT*100 + 5);
              wPts[wk*3  ] = wR*Math.sin(openHalfAngle)*Math.cos(wa) + (Math.random()-0.5)*8;
              wPts[wk*3+1] = wH;
              wPts[wk*3+2] = wR*Math.sin(openHalfAngle)*Math.sin(wa) + (Math.random()-0.5)*8;
            }
            var wGeo2 = new THREE.BufferGeometry();
            wGeo2.setAttribute("position", new THREE.BufferAttribute(wPts, 3));
            this._root.add(new THREE.Points(wGeo2, new THREE.PointsMaterial({
              color: 0xffaa44, size: 2.0, transparent: true, opacity: 0.30,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* entrained clouds */
          this._clouds = [];
          for (var ci = 0; ci < 30; ci++) {
            var cSign = Math.random() < 0.5 ? 1 : -1;
            var cH0 = cSign*(10 + Math.random()*80);
            var cR = (Math.random()-0.5)*40;
            var cm = new THREE.Mesh(
              new THREE.SphereGeometry(3+Math.random()*4, 4, 3),
              new THREE.MeshBasicMaterial({
                color: 0xffcc88, transparent: true, opacity: 0.60,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            cm.position.set(cR, cH0, (Math.random()-0.5)*40);
            this._root.add(cm);
            this._clouds.push({ mesh: cm, vy: cSign*(3 + Math.random()*6), maxH: cSign*120 });
          }

          /* H-alpha filaments */
          var FN = 200;
          var fPts = new Float32Array(FN * 3);
          for (var fi = 0; fi < FN; fi++) {
            var fSign = Math.random() < 0.5 ? 1 : -1;
            fPts[fi*3  ] = (Math.random()-0.5)*60;
            fPts[fi*3+1] = fSign*(5 + Math.random()*95);
            fPts[fi*3+2] = (Math.random()-0.5)*60;
          }
          var fGeo = new THREE.BufferGeometry();
          fGeo.setAttribute("position", new THREE.BufferAttribute(fPts, 3));
          this._root.add(new THREE.Points(fGeo, new THREE.PointsMaterial({
            color: 0xff4444, size: 2.2, transparent: true, opacity: 0.40,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* X-ray hot gas outer halo */
          var XN = 300;
          var xPts = new Float32Array(XN * 3);
          for (var xi = 0; xi < XN; xi++) {
            var xph = Math.acos(2*Math.random()-1), xa = Math.random()*2*Math.PI;
            var xr = 120 + Math.random()*40;
            xPts[xi*3  ] = xr*Math.sin(xph)*Math.cos(xa);
            xPts[xi*3+1] = xr*Math.cos(xph)*0.5; /* flattened halo */
            xPts[xi*3+2] = xr*Math.sin(xph)*Math.sin(xa);
          }
          var xGeo = new THREE.BufferGeometry();
          xGeo.setAttribute("position", new THREE.BufferAttribute(xPts, 3));
          this._root.add(new THREE.Points(xGeo, new THREE.PointsMaterial({
            color: 0x4488ff, size: 1.5, transparent: true, opacity: 0.08,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._sbTime = 0;
          console.log("[starburst-superwind] loaded at (500,0,700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._sbTime += dt;

          /* core pulse */
          var sc = 0.85 + 0.15*Math.sin(this._sbTime*6.0);
          this._sbCore.scale.setScalar(sc);

          /* clouds drift outward */
          for (var ci = 0; ci < this._clouds.length; ci++) {
            var cl = this._clouds[ci];
            cl.mesh.position.y += cl.vy * dt;
            if (Math.abs(cl.mesh.position.y) > Math.abs(cl.maxH)) {
              cl.mesh.position.y = cl.vy > 0 ? 10 : -10;
            }
          }

          this._root.rotation.y += 0.0001 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 44 injected! Lines:", lineCount);
