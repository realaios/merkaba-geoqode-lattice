'use strict';
// inject-w31.cjs — Wave 31: magnetotail-current-sheet + superbubble-wall
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("magnetotail-current-sheet"')) {
  console.log('Wave 31 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity cosmic-shear-flow></a-entity>';
const HTML_INSERT = `      <a-entity cosmic-shear-flow></a-entity>
      <!-- ── MAGNETOTAIL CURRENT SHEET — Earth's stretched night-side magnetotail ── -->
      <a-entity magnetotail-current-sheet></a-entity>
      <!-- ── SUPERBUBBLE WALL — expanding shell from collective supernova feedback ── -->
      <a-entity superbubble-wall></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         MAGNETOTAIL CURRENT SHEET — the narrow neutral current sheet in
         Earth's stretched magnetotail. The sheet is the site of magnetic
         reconnection events, generating substorm particle injections.
         Position: (800, 200, 400).
         Components:
           - Tail lobes: two hemispheres of field-aligned pts (north/south, dark blue)
           - Current sheet: thin slab of pts at y=0 (bright hot-orange/yellow)
           - Plasma sheet boundary: 600 pts, gradient from lobes to sheet
           - Reconnection X-line: triggered every 8s — bright white flash
           - Plasmoid ejection: 400 pts blobbing tailward after each X-line
           - Dipolarization front: 300 pts injecting earthward
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("magnetotail-current-sheet", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(800, 200, 400);
          scene.add(this._root);

          /* tail lobes: north (y>0) south (y<0) */
          for (var side = 0; side < 2; side++) {
            var ySign = side === 0 ? 1 : -1;
            var lPts = new Float32Array(1400 * 3);
            for (var li = 0; li < 1400; li++) {
              lPts[li*3  ] = (Math.random()-0.5)*400;
              lPts[li*3+1] = ySign*(10 + Math.random()*120);
              lPts[li*3+2] = (Math.random()-0.5)*80;
            }
            var lGeo = new THREE.BufferGeometry();
            lGeo.setAttribute("position", new THREE.BufferAttribute(lPts, 3));
            this._root.add(new THREE.Points(lGeo, new THREE.PointsMaterial({
              color: 0x2244aa, size: 1.8, transparent: true, opacity: 0.20,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* current sheet (thin slab y = ±8) */
          var CSN = 1000;
          var csPts = new Float32Array(CSN * 3);
          for (var csi = 0; csi < CSN; csi++) {
            csPts[csi*3  ] = (Math.random()-0.5)*400;
            csPts[csi*3+1] = (Math.random()-0.5)*8;
            csPts[csi*3+2] = (Math.random()-0.5)*80;
          }
          var csGeo = new THREE.BufferGeometry();
          csGeo.setAttribute("position", new THREE.BufferAttribute(csPts, 3));
          this._csMat = new THREE.PointsMaterial({
            color: 0xffaa33, size: 2.5, transparent: true, opacity: 0.75,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(csGeo, this._csMat));

          /* plasma sheet boundary */
          var PSN = 600;
          var psPts = new Float32Array(PSN * 3);
          for (var psi2 = 0; psi2 < PSN; psi2++) {
            psPts[psi2*3  ] = (Math.random()-0.5)*400;
            psPts[psi2*3+1] = (Math.random()-0.5)*2 + (Math.random()>0.5?1:-1)*10;
            psPts[psi2*3+2] = (Math.random()-0.5)*80;
          }
          var psGeo = new THREE.BufferGeometry();
          psGeo.setAttribute("position", new THREE.BufferAttribute(psPts, 3));
          this._root.add(new THREE.Points(psGeo, new THREE.PointsMaterial({
            color: 0xff6644, size: 2.0, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* X-line flash mesh */
          this._xFlash = new THREE.Mesh(
            new THREE.SphereGeometry(12, 8, 5),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
          );
          this._xFlash.position.set(0, 0, 0);
          this._root.add(this._xFlash);

          /* plasmoid (hidden until reconnect) */
          var pmPts = new Float32Array(400 * 3);
          for (var pmi = 0; pmi < 400; pmi++) {
            pmPts[pmi*3  ] = (Math.random()-0.5)*30;
            pmPts[pmi*3+1] = (Math.random()-0.5)*12;
            pmPts[pmi*3+2] = (Math.random()-0.5)*15;
          }
          var pmGeo = new THREE.BufferGeometry();
          pmGeo.setAttribute("position", new THREE.BufferAttribute(pmPts, 3));
          this._pmMat = new THREE.PointsMaterial({
            color: 0xff3399, size: 2.5, transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._pmMesh = new THREE.Points(pmGeo, this._pmMat);
          this._root.add(this._pmMesh);

          /* dipolarization front */
          var dfPts = new Float32Array(300 * 3);
          for (var dfi = 0; dfi < 300; dfi++) {
            dfPts[dfi*3  ] = (Math.random()-0.5)*40;
            dfPts[dfi*3+1] = (Math.random()-0.5)*20;
            dfPts[dfi*3+2] = 0;
          }
          var dfGeo = new THREE.BufferGeometry();
          dfGeo.setAttribute("position", new THREE.BufferAttribute(dfPts, 3));
          this._dfMat = new THREE.PointsMaterial({
            color: 0x00eeff, size: 2.5, transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._dfMesh = new THREE.Points(dfGeo, this._dfMat);
          this._root.add(this._dfMesh);

          this._mtTime = 0;
          this._SUBSTORM = 8.0;
          this._substormPhase = 0;
          console.log("[magnetotail-current-sheet] loading at (800,200,400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._mtTime += dt;

          /* substorm cycle */
          var cycleT = this._mtTime % this._SUBSTORM;
          var phase = cycleT / this._SUBSTORM;

          /* X-flash: brief 0.3s window at phase==0 */
          this._xFlash.material.opacity = (phase < 0.04) ? (1 - phase/0.04) * 0.9 : 0;

          /* plasmoid ejects tailward for 2s */
          if (phase > 0.04 && phase < 0.30) {
            var pm2 = (phase - 0.04) / 0.26;
            this._pmMat.opacity = 0.8 * (1 - pm2);
            this._pmMesh.position.x = pm2 * 200;
          } else {
            this._pmMat.opacity = 0;
            this._pmMesh.position.x = 0;
          }

          /* dipolarization front injects earthward */
          if (phase > 0.04 && phase < 0.25) {
            var df2 = (phase - 0.04) / 0.21;
            this._dfMat.opacity = 0.7 * (1 - df2);
            this._dfMesh.position.z = -df2 * 100;
          } else {
            this._dfMat.opacity = 0;
            this._dfMesh.position.z = 0;
          }

          /* sheet flicker */
          this._csMat.opacity = 0.60 + 0.20 * Math.sin(this._mtTime * 7.3);
          this._root.rotation.y += 0.0008 * dt;
        },
      });

      /* ====================================================================
         SUPERBUBBLE WALL — the giant expanding shock shell created by the
         combined energy input of ~100 OB star supernovae and stellar winds
         in a star-forming region. The thin shell is bright in X-rays/H-alpha.
         Position: (100, 500, 900).
         Components:
           - Shell wall: 3000 pts on a growing sphere (r grows 100→250 over 15s)
           - Interior hot plasma: 800 pts inside the bubble (dim, hot, sparse)
           - Shell fractures: 6 bright filamentary breaks in the shell (brightened pts)
           - OB star winds: 12 bright points inside (stellar wind sources)
           - Shock apex: 200 pts on leading edge (brightest rim)
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("superbubble-wall", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(100, 500, 900);
          scene.add(this._root);

          /* shell wall (3000 pts on sphere) */
          var SWN = 3000;
          this._shellPts = new Float32Array(SWN * 3);
          this._shellNorm = new Float32Array(SWN * 3);  /* unit normals */
          for (var si = 0; si < SWN; si++) {
            var ph = Math.acos(2*Math.random()-1);
            var th = Math.random()*2*Math.PI;
            var nx = Math.sin(ph)*Math.cos(th);
            var ny2 = Math.cos(ph);
            var nz = Math.sin(ph)*Math.sin(th);
            this._shellNorm[si*3  ] = nx;
            this._shellNorm[si*3+1] = ny2;
            this._shellNorm[si*3+2] = nz;
          }
          var shGeo = new THREE.BufferGeometry();
          shGeo.setAttribute("position", new THREE.BufferAttribute(this._shellPts, 3));
          this._shGeo = shGeo;
          this._shellMat = new THREE.PointsMaterial({
            color: 0xff6688, size: 2.5, transparent: true, opacity: 0.50,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(shGeo, this._shellMat));

          /* interior hot plasma */
          var IBN = 800;
          var ibPts = new Float32Array(IBN * 3);
          for (var ibi = 0; ibi < IBN; ibi++) {
            var ir = Math.random() * 90;
            var ip = Math.acos(2*Math.random()-1);
            var it = Math.random()*2*Math.PI;
            ibPts[ibi*3  ] = ir*Math.sin(ip)*Math.cos(it);
            ibPts[ibi*3+1] = ir*Math.cos(ip);
            ibPts[ibi*3+2] = ir*Math.sin(ip)*Math.sin(it);
          }
          var ibGeo = new THREE.BufferGeometry();
          ibGeo.setAttribute("position", new THREE.BufferAttribute(ibPts, 3));
          this._root.add(new THREE.Points(ibGeo, new THREE.PointsMaterial({
            color: 0xffaacc, size: 1.5, transparent: true, opacity: 0.10,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* OB star wind sources (12 bright spheres) */
          for (var obi = 0; obi < 12; obi++) {
            var or2 = Math.random() * 70;
            var op = Math.acos(2*Math.random()-1);
            var ot = Math.random()*2*Math.PI;
            var ob = new THREE.Mesh(
              new THREE.SphereGeometry(2, 5, 3),
              new THREE.MeshBasicMaterial({ color: 0x6699ff })
            );
            ob.position.set(or2*Math.sin(op)*Math.cos(ot), or2*Math.cos(op), or2*Math.sin(op)*Math.sin(ot));
            this._root.add(ob);
          }

          /* shock apex (200 pts on leading hemisphere) */
          var APn = 200;
          var apPts = new Float32Array(APn * 3);
          for (var api2 = 0; api2 < APn; api2++) {
            var apr = 1.0;
            var app = Math.acos(2*Math.random()-1);
            while (Math.cos(app) < 0.6) app = Math.acos(2*Math.random()-1);
            var apt = Math.random()*2*Math.PI;
            apPts[api2*3  ] = apr*Math.sin(app)*Math.cos(apt);
            apPts[api2*3+1] = apr*Math.cos(app);
            apPts[api2*3+2] = apr*Math.sin(app)*Math.sin(apt);
          }
          var apGeo = new THREE.BufferGeometry();
          apGeo.setAttribute("position", new THREE.BufferAttribute(apPts, 3));
          this._apGeo = apGeo;
          this._root.add(new THREE.Points(apGeo, new THREE.PointsMaterial({
            color: 0xffffff, size: 4.0, transparent: true, opacity: 0.70,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._sbTime = 0;
          this._PERIOD = 15.0;
          console.log("[superbubble-wall] expanding at (100,500,900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._sbTime += dt;

          /* expanding shell radius */
          var phase = (this._sbTime % this._PERIOD) / this._PERIOD;
          var r = 100 + phase * 150;

          /* update shell pts */
          var shArr = this._shGeo.attributes.position.array;
          for (var si = 0; si < 3000; si++) {
            shArr[si*3  ] = this._shellNorm[si*3  ] * r;
            shArr[si*3+1] = this._shellNorm[si*3+1] * r;
            shArr[si*3+2] = this._shellNorm[si*3+2] * r;
          }
          this._shGeo.attributes.position.needsUpdate = true;

          /* update apex pts */
          var apArr = this._apGeo.attributes.position.array;
          for (var api2 = 0; api2 < 200; api2++) {
            var scale = r * 1.01;
            apArr[api2*3  ] = apArr[api2*3  ] / (scale - 1) * scale;
            apArr[api2*3+1] = apArr[api2*3+1] / (scale - 1) * scale;
            apArr[api2*3+2] = apArr[api2*3+2] / (scale - 1) * scale;
          }
          /* keep apex scale with r */
          this._apGeo.attributes.position.needsUpdate = true;

          /* shell opacity fades as it expands */
          this._shellMat.opacity = 0.55 * (1 - phase * 0.6);
          this._root.rotation.y += 0.0005 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 31 injected! Lines:', lineCount);
