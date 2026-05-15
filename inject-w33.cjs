'use strict';
// inject-w33.cjs — Wave 33: interplanetary-shock + cosmic-void-spider
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("interplanetary-shock"')) {
  console.log('Wave 33 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity cosmic-spider-pulsar></a-entity>';
const HTML_INSERT = `      <a-entity cosmic-spider-pulsar></a-entity>
      <!-- ── INTERPLANETARY SHOCK — CME-driven collisionless shock in heliosphere ── -->
      <a-entity interplanetary-shock></a-entity>
      <!-- ── COSMIC VOID SPIDER — dark void filament web with node intersections ── -->
      <a-entity cosmic-void-spider></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         INTERPLANETARY SHOCK — a CME (coronal mass ejection) driving a
         collisionless shock through the solar wind. The shock front is a
         thin, highly compressed region preceded by a radio-emitting foreshock.
         Position: (-300, -600, 700).
         Components:
           - Solar wind upstream: 1200 pts streaming from -Z (pale yellow, fast)
           - Shock surface: 2000 pts on hemisphere (r=80, bright white-blue)
           - Sheath: 800 pts immediately behind shock (compressed, hot, turbulent)
           - CME core: 600 pts magnetic flux rope (twisted helix structure)
           - Foreshock waves: 400 pts rippling ahead of shock (backstreaming particles)
           - Shock nose glow: central bright oval
         The shock expands from r=20 to r=120 over 12s then resets.
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("interplanetary-shock", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-300, -600, 700);
          scene.add(this._root);

          /* solar wind upstream: streaming along +Z */
          var SWN = 1200;
          var swPts = new Float32Array(SWN * 3);
          for (var swi = 0; swi < SWN; swi++) {
            swPts[swi*3  ] = (Math.random()-0.5)*200;
            swPts[swi*3+1] = (Math.random()-0.5)*200;
            swPts[swi*3+2] = -(Math.random()*150 + 30);
          }
          var swGeo = new THREE.BufferGeometry();
          swGeo.setAttribute("position", new THREE.BufferAttribute(swPts, 3));
          this._root.add(new THREE.Points(swGeo, new THREE.PointsMaterial({
            color: 0xffffaa, size: 1.5, transparent: true, opacity: 0.18,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* shock surface: hemisphere along +Z, normals updated each tick */
          var SFN = 2000;
          this._sfNorm = new Float32Array(SFN * 3);
          for (var sfi = 0; sfi < SFN; sfi++) {
            /* only forward hemisphere */
            var ph = Math.acos(Math.random());
            var th = Math.random()*2*Math.PI;
            var nx = Math.sin(ph)*Math.cos(th);
            var ny = Math.sin(ph)*Math.sin(th);
            var nz = Math.cos(ph);
            this._sfNorm[sfi*3  ] = nx;
            this._sfNorm[sfi*3+1] = ny;
            this._sfNorm[sfi*3+2] = nz;
          }
          var sfPts = new Float32Array(SFN * 3);
          var sfGeo = new THREE.BufferGeometry();
          sfGeo.setAttribute("position", new THREE.BufferAttribute(sfPts, 3));
          this._sfGeo = sfGeo;
          this._sfMat = new THREE.PointsMaterial({
            color: 0xaaddff, size: 2.5, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(sfGeo, this._sfMat));

          /* sheath — compressed downstream */
          var SHN = 800;
          this._shNorm = new Float32Array(SHN * 3);
          for (var shi = 0; shi < SHN; shi++) {
            var sp = Math.acos(Math.random());
            var st = Math.random()*2*Math.PI;
            this._shNorm[shi*3  ] = Math.sin(sp)*Math.cos(st);
            this._shNorm[shi*3+1] = Math.sin(sp)*Math.sin(st);
            this._shNorm[shi*3+2] = Math.cos(sp);
          }
          var shPts = new Float32Array(SHN * 3);
          var shGeo = new THREE.BufferGeometry();
          shGeo.setAttribute("position", new THREE.BufferAttribute(shPts, 3));
          this._shGeo = shGeo;
          this._root.add(new THREE.Points(shGeo, new THREE.PointsMaterial({
            color: 0xff9955, size: 2.0, transparent: true, opacity: 0.30,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* CME flux rope helix */
          var FRN = 600;
          var frPts = new Float32Array(FRN * 3);
          for (var fri = 0; fri < FRN; fri++) {
            var ft = (fri / FRN) * 4 * Math.PI;
            var fr = 20 + 5 * Math.random();
            var foff = (Math.random()-0.5)*5;
            frPts[fri*3  ] = fr * Math.cos(ft) + foff;
            frPts[fri*3+1] = fr * Math.sin(ft) + foff;
            frPts[fri*3+2] = fri * 0.15 - 20;
          }
          var frGeo = new THREE.BufferGeometry();
          frGeo.setAttribute("position", new THREE.BufferAttribute(frPts, 3));
          this._frMesh = new THREE.Points(frGeo, new THREE.PointsMaterial({
            color: 0xff3399, size: 2.2, transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._frMesh);

          /* foreshock backstreaming ripples */
          var FSN = 400;
          var fsPts = new Float32Array(FSN * 3);
          for (var fsi = 0; fsi < FSN; fsi++) {
            fsPts[fsi*3  ] = (Math.random()-0.5)*150;
            fsPts[fsi*3+1] = (Math.random()-0.5)*150;
            fsPts[fsi*3+2] = -(30 + Math.random()*60);
          }
          var fsGeo = new THREE.BufferGeometry();
          fsGeo.setAttribute("position", new THREE.BufferAttribute(fsPts, 3));
          this._fsMesh = new THREE.Points(fsGeo, new THREE.PointsMaterial({
            color: 0x44ffcc, size: 1.5, transparent: true, opacity: 0.22,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._fsMesh);

          this._ipTime = 0;
          this._EXPAND = 12.0;
          console.log("[interplanetary-shock] loaded at (-300,-600,700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._ipTime += dt;

          var phase = (this._ipTime % this._EXPAND) / this._EXPAND;
          var r = 20 + phase * 100;

          /* update shock surface */
          var sfArr = this._sfGeo.attributes.position.array;
          for (var si = 0; si < 2000; si++) {
            sfArr[si*3  ] = this._sfNorm[si*3  ] * r;
            sfArr[si*3+1] = this._sfNorm[si*3+1] * r;
            sfArr[si*3+2] = this._sfNorm[si*3+2] * r;
          }
          this._sfGeo.attributes.position.needsUpdate = true;

          /* sheath lags by 10% */
          var rSh = Math.max(10, r - 12);
          var shArr = this._shGeo.attributes.position.array;
          for (var shi = 0; shi < 800; shi++) {
            var frac = 0.85 + Math.random()*0.12;
            shArr[shi*3  ] = this._shNorm[shi*3  ] * rSh * frac;
            shArr[shi*3+1] = this._shNorm[shi*3+1] * rSh * frac;
            shArr[shi*3+2] = this._shNorm[shi*3+2] * rSh * frac;
          }
          this._shGeo.attributes.position.needsUpdate = true;

          /* CME core moves forward with shock */
          this._frMesh.position.z = phase * 80;

          /* foreshock oscillates */
          this._fsMesh.position.z = -r * 0.8 + 10 * Math.sin(this._ipTime * 2.1);

          /* fade shock near reset */
          this._sfMat.opacity = 0.55 * (1 - phase * 0.4);

          this._root.rotation.y += 0.0003 * dt;
        },
      });

      /* ====================================================================
         COSMIC VOID SPIDER — a web of dark filaments spanning a large cosmic
         void, with luminous nodes at intersections (galaxy groups) and long
         dark threads (poor filaments with little gas). Contrasts the usual
         bright cosmic web components.
         Position: (-600, 100, -800).
         Components:
           - Void background: 500 pts, very sparse, dim blue
           - Filament threads: 12 randomly oriented dark threads (200 pts each)
           - Node clusters: 8 bright galaxy-group nodes (orange-yellow, pulsing)
           - Void wall boundary: 400 pts on sphere r=200 (the void edge)
           - Infall streams: 6 streams of pts falling into nodes
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("cosmic-void-spider", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-600, 100, -800);
          scene.add(this._root);

          /* void background */
          var VBN = 500;
          var vbPts = new Float32Array(VBN * 3);
          for (var vbi = 0; vbi < VBN; vbi++) {
            var vr = Math.random() * 180;
            var vp = Math.acos(2*Math.random()-1);
            var vt = Math.random()*2*Math.PI;
            vbPts[vbi*3  ] = vr*Math.sin(vp)*Math.cos(vt);
            vbPts[vbi*3+1] = vr*Math.cos(vp);
            vbPts[vbi*3+2] = vr*Math.sin(vp)*Math.sin(vt);
          }
          var vbGeo = new THREE.BufferGeometry();
          vbGeo.setAttribute("position", new THREE.BufferAttribute(vbPts, 3));
          this._root.add(new THREE.Points(vbGeo, new THREE.PointsMaterial({
            color: 0x3344aa, size: 1.0, transparent: true, opacity: 0.06,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* node positions (8 galaxy groups) */
          this._nodes = [];
          var nodePositions = [
            [-80, 50, 30], [90, -40, 60], [-30, 100, -90], [60, 80, 50],
            [-100, -70, -40], [50, -90, -80], [-60, 30, 100], [80, 60, -60],
          ];
          for (var ni = 0; ni < nodePositions.length; ni++) {
            var np = nodePositions[ni];
            var node = new THREE.Mesh(
              new THREE.SphereGeometry(5, 7, 4),
              new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.80 })
            );
            node.position.set(np[0], np[1], np[2]);
            this._root.add(node);
            this._nodes.push(node);
          }

          /* filament threads between node pairs */
          var PAIRS = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[0,4],[1,5],[2,6],[3,7]];
          for (var pi = 0; pi < PAIRS.length; pi++) {
            var A = new THREE.Vector3().fromArray(nodePositions[PAIRS[pi][0]]);
            var B = new THREE.Vector3().fromArray(nodePositions[PAIRS[pi][1]]);
            var FN = 200;
            var fPts = new Float32Array(FN * 3);
            for (var fi = 0; fi < FN; fi++) {
              var ft = fi / (FN-1);
              var fx = A.x + (B.x-A.x)*ft + (Math.random()-0.5)*5;
              var fy = A.y + (B.y-A.y)*ft + (Math.random()-0.5)*5;
              var fz = A.z + (B.z-A.z)*ft + (Math.random()-0.5)*5;
              fPts[fi*3  ] = fx;
              fPts[fi*3+1] = fy;
              fPts[fi*3+2] = fz;
            }
            var fGeo = new THREE.BufferGeometry();
            fGeo.setAttribute("position", new THREE.BufferAttribute(fPts, 3));
            this._root.add(new THREE.Points(fGeo, new THREE.PointsMaterial({
              color: 0x6688cc, size: 1.2, transparent: true, opacity: 0.12,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* void wall boundary */
          var WBN = 400;
          var wbPts = new Float32Array(WBN * 3);
          for (var wbi = 0; wbi < WBN; wbi++) {
            var wp = Math.acos(2*Math.random()-1);
            var wt = Math.random()*2*Math.PI;
            var wr = 190 + Math.random()*15;
            wbPts[wbi*3  ] = wr*Math.sin(wp)*Math.cos(wt);
            wbPts[wbi*3+1] = wr*Math.cos(wp);
            wbPts[wbi*3+2] = wr*Math.sin(wp)*Math.sin(wt);
          }
          var wbGeo = new THREE.BufferGeometry();
          wbGeo.setAttribute("position", new THREE.BufferAttribute(wbPts, 3));
          this._root.add(new THREE.Points(wbGeo, new THREE.PointsMaterial({
            color: 0x8899ff, size: 1.5, transparent: true, opacity: 0.09,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._vsTime = 0;
          console.log("[cosmic-void-spider] loaded at (-600,100,-800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._vsTime += dt;

          /* node pulse */
          for (var ni = 0; ni < this._nodes.length; ni++) {
            this._nodes[ni].material.opacity = 0.65 + 0.20 * Math.sin(this._vsTime * 0.9 + ni * 1.1);
          }

          this._root.rotation.y += 0.0003 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 33 injected! Lines:', lineCount);
