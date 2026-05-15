'use strict';
// inject-w84.cjs — Wave 84: cosmic-fossil-radio-lobe + starburst-superwind-chimney
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-fossil-radio-lobe"')) {
  console.log('Wave 84 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity magnetospheric-substorm-aurora></a-entity>';
const HTML_INSERT = `      <a-entity magnetospheric-substorm-aurora></a-entity>
      <!-- ── COSMIC FOSSIL RADIO LOBE — relic AGN lobe fading in the ICM ── -->
      <a-entity cosmic-fossil-radio-lobe></a-entity>
      <!-- ── STARBURST SUPERWIND CHIMNEY — galactic superwind driven by a compact starburst ── -->
      <a-entity starburst-superwind-chimney></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC FOSSIL RADIO LOBE — the remnant of an AGN jet lobe that has
         detached and is fading inside the intracluster medium.  Two lobes
         rendered as ellipsoidal particle clouds that slowly expand and dim,
         plus a thin connecting bridge.
         Position: (-600, -400, 900).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-fossil-radio-lobe", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-600, -400, 900);
          scene.add(this._root);

          this._lobes = [];
          var lobeCenters = [[0, 45, 0], [0, -45, 0]];
          var lobeColors = [0x5533ff, 0x3355ff];
          for (var li = 0; li < 2; li++) {
            var NL = 4000;
            var lPts = new Float32Array(NL*3);
            for (var lj = 0; lj < NL; lj++) {
              var la = Math.random()*2*Math.PI;
              var lb = Math.random()*Math.PI;
              var rx = 20, ry = 28, rz = 20;
              lPts[lj*3  ] = lobeCenters[li][0] + rx*Math.sin(lb)*Math.cos(la)*(0.6+Math.random()*0.4);
              lPts[lj*3+1] = lobeCenters[li][1] + ry*Math.cos(lb)*(0.6+Math.random()*0.4);
              lPts[lj*3+2] = lobeCenters[li][2] + rz*Math.sin(lb)*Math.sin(la)*(0.6+Math.random()*0.4);
            }
            var lGeo = new THREE.BufferGeometry();
            lGeo.setAttribute("position", new THREE.BufferAttribute(lPts, 3));
            var lMesh = new THREE.Points(lGeo, new THREE.PointsMaterial({
              color: lobeColors[li], size: 0.9,
              transparent: true, opacity: 0.28,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(lMesh);
            this._lobes.push({ mesh: lMesh, pts: lPts, n: NL, cx: lobeCenters[li][0], cy: lobeCenters[li][1], cz: lobeCenters[li][2] });
          }

          /* bridge */
          var bPts = [];
          for (var bi = 0; bi <= 30; bi++) {
            var by = -45 + bi*3;
            bPts.push((Math.random()-0.5)*4, by, (Math.random()-0.5)*4);
          }
          var bGeo = new THREE.BufferGeometry();
          bGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(bPts), 3));
          this._root.add(new THREE.Line(bGeo, new THREE.LineBasicMaterial({
            color: 0x9977ff, transparent: true, opacity: 0.15,
            blending: THREE.AdditiveBlending,
          })));

          this._frlTime = 0;
          console.log("[cosmic-fossil-radio-lobe] loaded at (-600,-400,900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._frlTime += dt;
          var t = this._frlTime;
          for (var li = 0; li < this._lobes.length; li++) {
            var l = this._lobes[li];
            for (var lj = 0; lj < l.n; lj++) {
              var dx = l.pts[lj*3  ] - l.cx;
              var dy = l.pts[lj*3+1] - l.cy;
              var dz = l.pts[lj*3+2] - l.cz;
              l.pts[lj*3  ] += dx*0.002*dt;
              l.pts[lj*3+1] += dy*0.002*dt;
              l.pts[lj*3+2] += dz*0.002*dt;
            }
            l.mesh.geometry.attributes.position.needsUpdate = true;
            l.mesh.material.opacity = Math.max(0.05, 0.28 - t*0.003 + 0.06*Math.sin(t*0.9));
          }
          this._root.rotation.y += 0.004*dt;
        },
      });

      /* ====================================================================
         STARBURST SUPERWIND CHIMNEY — a nuclear starburst drives a biconical
         superwind that breaks through the disk and escapes into the CGM.
         Renders: disk plane particles, a biconical outflow of hot gas, and
         cool shell fragments entrained in the wind.
         Position: (200, -800, 600).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("starburst-superwind-chimney", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(200, -800, 600);
          scene.add(this._root);

          /* disk plane */
          var ND = 5000;
          var dPts = new Float32Array(ND*3);
          for (var di = 0; di < ND; di++) {
            var dr = 10 + Math.random()*60;
            var da = Math.random()*2*Math.PI;
            dPts[di*3  ] = dr*Math.cos(da);
            dPts[di*3+1] = (Math.random()-0.5)*6;
            dPts[di*3+2] = dr*Math.sin(da);
          }
          var dGeo = new THREE.BufferGeometry();
          dGeo.setAttribute("position", new THREE.BufferAttribute(dPts, 3));
          this._root.add(new THREE.Points(dGeo, new THREE.PointsMaterial({
            color: 0xff8833, size: 0.7,
            transparent: true, opacity: 0.3,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* biconical wind */
          var NW = 6000;
          var wPts = new Float32Array(NW*3);
          this._wPts = wPts; this._NW = NW;
          for (var wi = 0; wi < NW; wi++) {
            var frac = Math.random();
            var sign = wi < NW/2 ? 1 : -1;
            var wy = sign*(3 + frac*80);
            var wr = frac*28;
            var wa = Math.random()*2*Math.PI;
            wPts[wi*3  ] = wr*Math.cos(wa) + (Math.random()-0.5)*5;
            wPts[wi*3+1] = wy;
            wPts[wi*3+2] = wr*Math.sin(wa) + (Math.random()-0.5)*5;
          }
          var wGeo = new THREE.BufferGeometry();
          wGeo.setAttribute("position", new THREE.BufferAttribute(wPts, 3));
          this._windMesh = new THREE.Points(wGeo, new THREE.PointsMaterial({
            color: 0xff4400, size: 0.85,
            transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._windMesh);

          this._sscTime = 0;
          console.log("[starburst-superwind-chimney] loaded at (200,-800,600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._sscTime += dt;
          var t = this._sscTime;
          for (var wi = 0; wi < this._NW; wi++) {
            var sign = this._wPts[wi*3+1] >= 0 ? 1 : -1;
            this._wPts[wi*3+1] += sign*20*dt;
            var limit = 80;
            if (Math.abs(this._wPts[wi*3+1]) > limit) {
              var frac2 = Math.random();
              this._wPts[wi*3  ] = frac2*8*Math.cos(Math.random()*6.28);
              this._wPts[wi*3+1] = sign*3;
              this._wPts[wi*3+2] = frac2*8*Math.sin(Math.random()*6.28);
            }
          }
          this._windMesh.geometry.attributes.position.needsUpdate = true;
          this._windMesh.material.opacity = 0.28 + 0.12*Math.sin(t*1.5);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 84 injected! Lines:', lineCount);
