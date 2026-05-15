'use strict';
// inject-w89.cjs — Wave 89: circumgalactic-hot-halo-sloshing + stellar-polycyclic-aromatic-haze
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("circumgalactic-hot-halo-sloshing"')) {
  console.log('Wave 89 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity cosmic-electron-whistler-wave></a-entity>';
const HTML_INSERT = `      <a-entity cosmic-electron-whistler-wave></a-entity>
      <!-- ── CIRCUMGALACTIC HOT HALO SLOSHING — off-center hot halo sloshing after a merger ── -->
      <a-entity circumgalactic-hot-halo-sloshing></a-entity>
      <!-- ── STELLAR PAH HAZE — polycyclic aromatic hydrocarbon fluorescence in PDR edges ── -->
      <a-entity stellar-polycyclic-aromatic-haze></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         CIRCUMGALACTIC HOT HALO SLOSHING — after a galaxy-group minor
         merger the hot X-ray emitting halo is set sloshing: a characteristic
         cold front cold-core spiral appears as the cool dense gas sloshes
         past the hot ambient.
         Renders: large translucent sloshing halo + rotating cold-front
         spiral arc.
         Position: (600, 0, -900).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("circumgalactic-hot-halo-sloshing", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(600, 0, -900);
          scene.add(this._root);

          /* outer hot halo */
          var NH = 8000;
          var hPts = new Float32Array(NH*3);
          this._hPts = hPts; this._NH = NH;
          for (var hi = 0; hi < NH; hi++) {
            var ha = Math.random()*2*Math.PI, he2 = Math.random()*Math.PI;
            var hr = 40 + Math.pow(Math.random(), 0.5)*100;
            hPts[hi*3  ] = hr*Math.sin(he2)*Math.cos(ha);
            hPts[hi*3+1] = hr*Math.cos(he2)*0.6;
            hPts[hi*3+2] = hr*Math.sin(he2)*Math.sin(ha);
          }
          var hGeo = new THREE.BufferGeometry();
          hGeo.setAttribute("position", new THREE.BufferAttribute(hPts, 3));
          this._halo = new THREE.Points(hGeo, new THREE.PointsMaterial({
            color: 0xff4400, size: 0.8,
            transparent: true, opacity: 0.08,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._halo);

          /* sloshing spiral arc (cold front) */
          var NS2 = 200;
          var sPts2 = [];
          for (var si = 0; si < NS2; si++) {
            var sf = si/NS2;
            var sa = sf*3.5*Math.PI;
            var sr = 20 + sf*50;
            sPts2.push(sr*Math.cos(sa), sr*Math.sin(sa)*0.3, sr*Math.sin(sa));
          }
          var sGeo2 = new THREE.BufferGeometry();
          sGeo2.setAttribute("position", new THREE.BufferAttribute(new Float32Array(sPts2), 3));
          this._spiral = new THREE.Line(sGeo2, new THREE.LineBasicMaterial({
            color: 0x66ccff, transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending,
          }));
          this._root.add(this._spiral);

          this._chhsTime = 0;
          console.log("[circumgalactic-hot-halo-sloshing] loaded at (600,0,-900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._chhsTime += dt;
          var t = this._chhsTime;
          this._spiral.rotation.y = t*0.15;
          this._halo.material.opacity = 0.06 + 0.03*Math.sin(t*0.7);
        },
      });

      /* ====================================================================
         STELLAR POLYCYCLIC AROMATIC HAZE — large PAH molecules at the
         surfaces of photodissociation regions (PDRs) fluoresce in UV,
         emitting the characteristic 3.3/6.2/7.7 μm mid-IR bands as a
         reddish-orange glowing fringe at the illuminated edge of
         molecular clouds.
         Renders: thin illuminated edge haze fringe + embedded molecule
         sparkle.
         Position: (-200, 500, 600).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("stellar-polycyclic-aromatic-haze", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-200, 500, 600);
          scene.add(this._root);

          /* background dense cloud */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(30, 10, 8),
            new THREE.MeshBasicMaterial({
              color: 0x1a1020, transparent: true, opacity: 0.7,
              blending: THREE.NormalBlending, depthWrite: false,
            })
          ));

          /* illuminated PDR fringe */
          var NF = 5000;
          var fPts = new Float32Array(NF*3);
          this._fPts = fPts; this._NF = NF;
          for (var fi = 0; fi < NF; fi++) {
            var fa = Math.random()*2*Math.PI;
            var fe = Math.random()*Math.PI;
            var fr = 29 + Math.random()*4;
            fPts[fi*3  ] = fr*Math.sin(fe)*Math.cos(fa);
            fPts[fi*3+1] = fr*Math.cos(fe);
            fPts[fi*3+2] = fr*Math.sin(fe)*Math.sin(fa);
          }
          var fGeo = new THREE.BufferGeometry();
          fGeo.setAttribute("position", new THREE.BufferAttribute(fPts, 3));
          this._fringe = new THREE.Points(fGeo, new THREE.PointsMaterial({
            color: 0xff7700, size: 0.7,
            transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._fringe);

          /* PAH sparkles */
          var NM = 800;
          var mPts = new Float32Array(NM*3);
          this._mPts = mPts; this._NM = NM;
          for (var mi = 0; mi < NM; mi++) {
            var ma = Math.random()*2*Math.PI;
            var me = Math.random()*Math.PI;
            var mr = 28 + Math.random()*6;
            mPts[mi*3  ] = mr*Math.sin(me)*Math.cos(ma);
            mPts[mi*3+1] = mr*Math.cos(me);
            mPts[mi*3+2] = mr*Math.sin(me)*Math.sin(ma);
          }
          var mGeo = new THREE.BufferGeometry();
          mGeo.setAttribute("position", new THREE.BufferAttribute(mPts, 3));
          this._mols = new THREE.Points(mGeo, new THREE.PointsMaterial({
            color: 0xffaa22, size: 1.2,
            transparent: true, opacity: 0.6,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._mols);

          this._spahTime = 0;
          console.log("[stellar-polycyclic-aromatic-haze] loaded at (-200,500,600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._spahTime += dt;
          var t = this._spahTime;
          this._fringe.material.opacity = 0.3 + 0.1*Math.sin(t*1.8);
          this._mols.material.opacity = 0.5 + 0.2*Math.sin(t*4.2);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 89 injected! Lines:', lineCount);
