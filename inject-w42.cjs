'use strict';
// inject-w42.cjs — Wave 42: wolf-rayet-wind-bubble + cosmic-ice-giant-storm
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("wolf-rayet-wind-bubble"')) {
  console.log('Wave 42 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity magnetar-atmosphere></a-entity>';
const HTML_INSERT = `      <a-entity magnetar-atmosphere></a-entity>
      <!-- ── WOLF-RAYET WIND BUBBLE — WR star inflates a massive fast-wind bubble ── -->
      <a-entity wolf-rayet-wind-bubble></a-entity>
      <!-- ── COSMIC ICE GIANT STORM — diamond rain and hexagonal storm on ice giant ── -->
      <a-entity cosmic-ice-giant-storm></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         WOLF-RAYET WIND BUBBLE — a luminous Wolf-Rayet star drives an
         extremely fast stellar wind (3000 km/s) that sweeps up surrounding
         ISM into a giant bubble nebula. Inner wind termination shock, swept-
         up shell, and dense clumps in the shell wall.
         Position: (900, 400, -400).
         Components:
           - WR star: very hot blue-white star (bright point)
           - Stellar wind: radial streaming particles (400 pts, cyan)
           - Wind termination shock: inner boundary (ring, bright)
           - Swept-up shell: dense clumpy shell (500 pts)
           - Shell clumps: 10 dense blobs in shell wall
           - Ionized halo: faint outer ionized ISM (300 pts)
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("wolf-rayet-wind-bubble", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(900, 400, -400);
          scene.add(this._root);

          /* WR star */
          this._wrStar = new THREE.Mesh(
            new THREE.SphereGeometry(5, 8, 6),
            new THREE.MeshBasicMaterial({ color: 0x99ddff })
          );
          this._root.add(this._wrStar);

          /* stellar wind radial streams */
          var WN = 400;
          var wPts = new Float32Array(WN * 3);
          for (var wi = 0; wi < WN; wi++) {
            var wp = Math.acos(2*Math.random()-1), wa = Math.random()*2*Math.PI;
            var wr = 5 + Math.random()*35;
            wPts[wi*3  ] = wr*Math.sin(wp)*Math.cos(wa);
            wPts[wi*3+1] = wr*Math.cos(wp);
            wPts[wi*3+2] = wr*Math.sin(wp)*Math.sin(wa);
          }
          var wGeo = new THREE.BufferGeometry();
          wGeo.setAttribute("position", new THREE.BufferAttribute(wPts, 3));
          this._root.add(new THREE.Points(wGeo, new THREE.PointsMaterial({
            color: 0x00ffff, size: 1.8, transparent: true, opacity: 0.30,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* wind termination shock ring */
          var tsMat = new THREE.MeshBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0.40,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Mesh(new THREE.TorusGeometry(38, 1.5, 4, 50), tsMat));

          /* swept-up shell */
          var SN = 500;
          var sPts = new Float32Array(SN * 3);
          for (var si = 0; si < SN; si++) {
            var sp = Math.acos(2*Math.random()-1), sa = Math.random()*2*Math.PI;
            var sr = 52 + (Math.random()-0.5)*10;
            sPts[si*3  ] = sr*Math.sin(sp)*Math.cos(sa);
            sPts[si*3+1] = sr*Math.cos(sp);
            sPts[si*3+2] = sr*Math.sin(sp)*Math.sin(sa);
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(sPts, 3));
          this._root.add(new THREE.Points(sGeo, new THREE.PointsMaterial({
            color: 0xff9955, size: 2.0, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* 10 shell clumps */
          for (var ci = 0; ci < 10; ci++) {
            var cp = Math.acos(2*Math.random()-1), ca = Math.random()*2*Math.PI;
            var cm = new THREE.Mesh(
              new THREE.SphereGeometry(3+Math.random()*4, 4, 3),
              new THREE.MeshBasicMaterial({
                color: 0xffcc66, transparent: true, opacity: 0.55,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            cm.position.set(52*Math.sin(cp)*Math.cos(ca), 52*Math.cos(cp), 52*Math.sin(cp)*Math.sin(ca));
            this._root.add(cm);
          }

          /* ionized halo */
          var IHN = 300;
          var ihPts = new Float32Array(IHN * 3);
          for (var ihi = 0; ihi < IHN; ihi++) {
            var ihp = Math.acos(2*Math.random()-1), iha = Math.random()*2*Math.PI;
            var ihr = 65 + Math.random()*15;
            ihPts[ihi*3  ] = ihr*Math.sin(ihp)*Math.cos(iha);
            ihPts[ihi*3+1] = ihr*Math.cos(ihp);
            ihPts[ihi*3+2] = ihr*Math.sin(ihp)*Math.sin(iha);
          }
          var ihGeo = new THREE.BufferGeometry();
          ihGeo.setAttribute("position", new THREE.BufferAttribute(ihPts, 3));
          this._root.add(new THREE.Points(ihGeo, new THREE.PointsMaterial({
            color: 0x66aaff, size: 1.5, transparent: true, opacity: 0.10,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._wrTime = 0;
          console.log("[wolf-rayet-wind-bubble] loaded at (900,400,-400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._wrTime += dt;

          /* WR star flicker */
          var fw = 0.80 + 0.20*Math.sin(this._wrTime * 12.0);
          this._wrStar.material.opacity = fw;

          this._root.rotation.y += 0.0003 * dt;
        },
      });

      /* ====================================================================
         COSMIC ICE GIANT STORM — an ice giant (Neptune/Uranus-type) with
         a hexagonal polar vortex, supersonic jet streams, diamond rain deep
         inside, and methane absorption bands giving striking blue color.
         Position: (-100, -600, 500).
         Components:
           - Ice giant sphere: deep blue planet
           - Hexagonal polar storm: 6-sided vortex at pole (ring polygon)
           - Jet stream bands: 5 latitude bands (colored stripes)
           - Storm spots: 3 dark/bright spots (visible oval features)
           - Diamond rain: 300 falling bright points inside
           - Methane haze rings: outer haze rings (faint blue)
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("cosmic-ice-giant-storm", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-100, -600, 500);
          scene.add(this._root);

          /* ice giant body */
          this._planet = new THREE.Mesh(
            new THREE.SphereGeometry(30, 32, 24),
            new THREE.MeshBasicMaterial({ color: 0x2244bb })
          );
          this._root.add(this._planet);

          /* equatorial band stripes (5 bands) */
          var bandColors = [0x1133aa, 0x3366cc, 0x224499, 0x335588, 0x112266];
          for (var bi = 0; bi < 5; bi++) {
            var bT = -0.8 + bi*0.4;
            var bGeo = new THREE.TorusGeometry(30.5, 1.2, 4, 80);
            var bMat = new THREE.MeshBasicMaterial({
              color: bandColors[bi], transparent: true, opacity: 0.40,
              blending: THREE.NormalBlending, depthWrite: false,
            });
            var bMesh = new THREE.Mesh(bGeo, bMat);
            bMesh.rotation.x = Math.PI/2;
            bMesh.position.y = bT*28;
            this._root.add(bMesh);
          }

          /* hexagonal polar vortex — 6-sided ring approximation */
          var hexPts = [];
          for (var hi = 0; hi <= 6; hi++) {
            var hA = (hi/6)*2*Math.PI;
            hexPts.push(new THREE.Vector3(20*Math.cos(hA), 30.5, 20*Math.sin(hA)));
          }
          var hexCurve = new THREE.CatmullRomCurve3(hexPts);
          var hexGeoL = new THREE.TubeGeometry(hexCurve, 60, 0.8, 4, true);
          this._root.add(new THREE.Mesh(hexGeoL, new THREE.MeshBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false,
          })));

          /* 3 storm spots */
          var spotColors = [0xffffff, 0x000066, 0xaaddff];
          for (var si = 0; si < 3; si++) {
            var sA = (si/3)*2*Math.PI;
            var sm = new THREE.Mesh(
              new THREE.SphereGeometry(4, 6, 4),
              new THREE.MeshBasicMaterial({
                color: spotColors[si], transparent: true, opacity: 0.70,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            sm.position.set(30*Math.cos(sA), -10 + si*10, 30*Math.sin(sA));
            this._root.add(sm);
          }

          /* diamond rain inside (300 pts) */
          var DN = 300;
          var dPts = new Float32Array(DN * 3);
          this._dPts = dPts;
          for (var di = 0; di < DN; di++) {
            var dr = Math.random()*24;
            var da = Math.random()*2*Math.PI;
            dPts[di*3  ] = dr*Math.cos(da);
            dPts[di*3+1] = (Math.random()-0.5)*50;
            dPts[di*3+2] = dr*Math.sin(da);
          }
          this._dGeo = new THREE.BufferGeometry();
          this._dGeo.setAttribute("position", new THREE.BufferAttribute(dPts, 3));
          this._root.add(new THREE.Points(this._dGeo, new THREE.PointsMaterial({
            color: 0xeeffff, size: 1.5, transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* methane haze outer rings */
          for (var mhi = 0; mhi < 3; mhi++) {
            this._root.add(new THREE.Mesh(
              new THREE.TorusGeometry(32 + mhi*3, 0.6, 4, 80),
              new THREE.MeshBasicMaterial({
                color: 0x6699ff, transparent: true, opacity: 0.08,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            ));
          }

          this._igTime = 0;
          console.log("[cosmic-ice-giant-storm] loaded at (-100,-600,500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._igTime += dt;

          /* planet slow rotation */
          this._planet.rotation.y += 0.06 * dt;

          /* diamond rain falling */
          var dpa = this._dGeo.attributes.position.array;
          for (var di = 0; di < 300; di++) {
            dpa[di*3+1] -= (0.5 + (di%5)*0.3) * dt;
            if (dpa[di*3+1] < -25) dpa[di*3+1] = 25;
          }
          this._dGeo.attributes.position.needsUpdate = true;

          this._root.rotation.y += 0.0002 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 42 injected! Lines:', lineCount);
