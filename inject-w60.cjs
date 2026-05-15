"use strict";
// inject-w60.cjs — Wave 60: tidal-tail-stream-merger + cosmic-spiderweb-nodes
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("tidal-tail-stream-merger"')) {
  console.log("Wave 60 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity cosmic-magnon-wave></a-entity>";
const HTML_INSERT = `      <a-entity cosmic-magnon-wave></a-entity>
      <!-- ── TIDAL TAIL STREAM MERGER — two interacting galaxies pulling stellar tidal tails ── -->
      <a-entity tidal-tail-stream-merger></a-entity>
      <!-- ── COSMIC SPIDERWEB NODES — dense cluster intersections of the cosmic web ── -->
      <a-entity cosmic-spiderweb-nodes></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         TIDAL TAIL STREAM MERGER — galaxies interact over timescales of
         hundreds of Myr, pulling long tidal tails (The Mice NGC 4676, the
         Antennae NGC 4038/9, Arp 87). Tidal tails are made of stripped
         stars and gas arcing behind the interaction. We render two galactic
         cores in a slow orbit, each throwing off a long curved tidal arc.
         Position: (900, 300, -400).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("tidal-tail-stream-merger", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(900, 300, -400);
          scene.add(this._root);

          /* galaxy A core */
          this._coreA = new THREE.Mesh(
            new THREE.SphereGeometry(14, 7, 6),
            new THREE.MeshBasicMaterial({
              color: 0xffeebb, transparent: true, opacity: 0.55,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._coreA.position.set(-60, 0, 0);
          this._root.add(this._coreA);

          /* galaxy B core */
          this._coreB = new THREE.Mesh(
            new THREE.SphereGeometry(11, 7, 6),
            new THREE.MeshBasicMaterial({
              color: 0xffddb8, transparent: true, opacity: 0.5,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._coreB.position.set(60, 30, 0);
          this._root.add(this._coreB);

          /* tidal tail A — curving arc */
          var TA = 200;
          var tAPts = new Float32Array(TA * 3);
          for (var tai = 0; tai < TA; tai++) {
            var tat = tai/(TA-1);
            var taAngle = -0.8 + tat * 2.2;
            tAPts[tai*3  ] = -60 + 130*Math.sin(taAngle)*tat + (Math.random()-0.5)*6;
            tAPts[tai*3+1] = -60*Math.pow(tat,1.4)*Math.cos(taAngle*0.5) + (Math.random()-0.5)*6;
            tAPts[tai*3+2] = 25*Math.sin(taAngle*1.3)*tat + (Math.random()-0.5)*5;
          }
          var taGeo = new THREE.BufferGeometry();
          taGeo.setAttribute("position", new THREE.BufferAttribute(tAPts, 3));
          this._tailA = new THREE.Points(taGeo, new THREE.PointsMaterial({
            color: 0xffddaa, size: 2,
            transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._tailA);

          /* tidal tail B — mirrored arc */
          var TB = 160;
          var tBPts = new Float32Array(TB * 3);
          for (var tbi = 0; tbi < TB; tbi++) {
            var tbt = tbi/(TB-1);
            var tbAngle = 0.6 - tbt * 2.0;
            tBPts[tbi*3  ] = 60 - 100*Math.sin(tbAngle)*tbt + (Math.random()-0.5)*6;
            tBPts[tbi*3+1] = 50*Math.pow(tbt,1.2)*Math.cos(tbAngle*0.6) + (Math.random()-0.5)*6;
            tBPts[tbi*3+2] = -20*Math.sin(tbAngle*1.1)*tbt + (Math.random()-0.5)*5;
          }
          var tbGeo = new THREE.BufferGeometry();
          tbGeo.setAttribute("position", new THREE.BufferAttribute(tBPts, 3));
          this._tailB = new THREE.Points(tbGeo, new THREE.PointsMaterial({
            color: 0xffccaa, size: 2,
            transparent: true, opacity: 0.4,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._tailB);

          /* bridge of gas between the two */
          var BN = 80;
          var bPts = new Float32Array(BN * 3);
          for (var bi = 0; bi < BN; bi++) {
            var bt = bi/(BN-1);
            bPts[bi*3  ] = -60 + 120*bt + (Math.random()-0.5)*12;
            bPts[bi*3+1] = bt*30 + (Math.random()-0.5)*12;
            bPts[bi*3+2] = (Math.random()-0.5)*14;
          }
          var bGeo = new THREE.BufferGeometry();
          bGeo.setAttribute("position", new THREE.BufferAttribute(bPts, 3));
          this._root.add(new THREE.Points(bGeo, new THREE.PointsMaterial({
            color: 0x99ccff, size: 2,
            transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._ttsmTime = 0;
          console.log("[tidal-tail-stream-merger] loaded at (900,300,-400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._ttsmTime += dt;
          /* slow orbital rotation of the pair */
          var orb = this._ttsmTime * 0.025;
          this._coreA.position.x = -65*Math.cos(orb);
          this._coreA.position.z = -40*Math.sin(orb);
          this._coreB.position.x =  65*Math.cos(orb + Math.PI);
          this._coreB.position.z =  40*Math.sin(orb + Math.PI);
          this._root.rotation.y += 0.000018 * dt;
        },
      });

      /* ====================================================================
         COSMIC SPIDERWEB NODES — at the intersections of the cosmic web
         filaments sit massive galaxy clusters (>10^15 solar masses). These are
         the largest gravitationally-bound structures. The "Cosmic Web" term
         was coined by Bond, Kofman & Pogosyan 1996. SpiderWeb Galaxy cluster
         (MRC1138-262) is a proto-cluster at z=2.2 with a spider-web of
         radio-emitting filaments. We render a network of web nodes with
         bright cores and connecting filament lines.
         Position: (-800, 800, 200).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("cosmic-spiderweb-nodes", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-800, 800, 200);
          scene.add(this._root);

          /* generate nodes */
          var NODES = 14;
          this._nodePos = [];
          this._nodeMeshes = [];
          for (var ni = 0; ni < NODES; ni++) {
            var np = new THREE.Vector3(
              (Math.random()-0.5)*360,
              (Math.random()-0.5)*280,
              (Math.random()-0.5)*280
            );
            this._nodePos.push(np);
            var nm = new THREE.Mesh(
              new THREE.SphereGeometry(8 + Math.random()*14, 5, 4),
              new THREE.MeshBasicMaterial({
                color: 0xffeecc, transparent: true, opacity: 0.35,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            nm.position.copy(np);
            this._root.add(nm);
            this._nodeMeshes.push(nm);
          }

          /* connecting filament lines between nearby nodes */
          var linePts = [];
          for (var ai = 0; ai < NODES; ai++) {
            for (var bi = ai+1; bi < NODES; bi++) {
              if (this._nodePos[ai].distanceTo(this._nodePos[bi]) < 200) {
                linePts.push(
                  this._nodePos[ai].x, this._nodePos[ai].y, this._nodePos[ai].z,
                  this._nodePos[bi].x, this._nodePos[bi].y, this._nodePos[bi].z
                );
              }
            }
          }
          var lineArr = new Float32Array(linePts);
          var lineGeo = new THREE.BufferGeometry();
          lineGeo.setAttribute("position", new THREE.BufferAttribute(lineArr, 3));
          this._filaments = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
            color: 0x6677aa, transparent: true, opacity: 0.1,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._filaments);

          /* void background haze */
          var VP = 200;
          var vPts = new Float32Array(VP * 3);
          for (var vi = 0; vi < VP; vi++) {
            vPts[vi*3  ] = (Math.random()-0.5)*700;
            vPts[vi*3+1] = (Math.random()-0.5)*600;
            vPts[vi*3+2] = (Math.random()-0.5)*600;
          }
          var vGeo = new THREE.BufferGeometry();
          vGeo.setAttribute("position", new THREE.BufferAttribute(vPts, 3));
          this._root.add(new THREE.Points(vGeo, new THREE.PointsMaterial({
            color: 0x334466, size: 2,
            transparent: true, opacity: 0.08,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._cswTime = 0;
          console.log("[cosmic-spiderweb-nodes] loaded at (-800,800,200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cswTime += dt;
          var pulse = 0.25 + 0.1*Math.abs(Math.sin(this._cswTime * 0.55));
          for (var ni = 0; ni < this._nodeMeshes.length; ni++) {
            this._nodeMeshes[ni].material.opacity = pulse - ni*0.01;
          }
          this._filaments.material.opacity = 0.07 + 0.04*Math.abs(Math.sin(this._cswTime * 0.3));
          this._root.rotation.y += 0.00002 * dt;
          this._root.rotation.x += 0.000008 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 60 injected! Lines:", lineCount);
