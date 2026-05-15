'use strict';
// inject-w71.cjs — Wave 71: cosmic-anisotropy-dipole + galactic-fountain-flow
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-anisotropy-dipole"')) {
  console.log('Wave 71 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity interstellar-bow-shock-nebula></a-entity>';
const HTML_INSERT = `      <a-entity interstellar-bow-shock-nebula></a-entity>
      <!-- ── COSMIC ANISOTROPY DIPOLE — CMB dipole temperature variation across sky ── -->
      <a-entity cosmic-anisotropy-dipole></a-entity>
      <!-- ── GALACTIC FOUNTAIN FLOW — supernova-driven outflows cycling through halo ── -->
      <a-entity galactic-fountain-flow></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC ANISOTROPY DIPOLE — the largest-scale anisotropy in the CMB
         is the kinematic dipole (deltaT ~ 3.3 mK) from Earth's peculiar
         velocity toward the Virgo supercluster. One hemisphere is slightly
         hotter (blueshifted), the other cooler (redshifted). We show a sky
         sphere mapped with a smooth hot/cold dipole gradient + faint higher-
         order multipole fluctuations layered on top.
         Position: (0, 0, 1500).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("cosmic-anisotropy-dipole", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(0, 0, 1500);
          scene.add(this._root);

          /* large sphere representing CMB sky — shell coloured by dipole */
          var sGeo = new THREE.SphereGeometry(220, 64, 32);
          /* colour vertices by dipole + noise */
          var positions = sGeo.attributes.position.array;
          var count = positions.length / 3;
          var colors = new Float32Array(count * 3);
          for (var ci = 0; ci < count; ci++) {
            var px = positions[ci*3], py = positions[ci*3+1], pz = positions[ci*3+2];
            var len = Math.sqrt(px*px+py*py+pz*pz);
            var nx = px/len, ny = py/len, nz = pz/len;
            /* dipole along z axis */
            var dipole = nz;
            /* pseudo-noise for higher multipoles */
            var seed = Math.sin(nx*17+ny*23+nz*31)*4325.7 % 1;
            var quad = nx*nz*0.4 + ny*ny*0.3;
            var val = 0.5 + 0.3*dipole + 0.08*quad + 0.03*seed;
            val = Math.max(0, Math.min(1, val));
            /* hot = blueish-white, cold = deep red */
            colors[ci*3  ] = 0.3 + 0.7*val;           // R
            colors[ci*3+1] = 0.1 + 0.6*val*val;        // G
            colors[ci*3+2] = val > 0.5 ? val : 0.0;    // B
          }
          sGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
          this._cmb = new THREE.Mesh(sGeo, new THREE.MeshBasicMaterial({
            vertexColors: true, side: THREE.BackSide,
            transparent: true, opacity: 0.22,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._cmb);

          /* hot pole glow */
          this._hotGlow = new THREE.Mesh(
            new THREE.SphereGeometry(30, 8, 8),
            new THREE.MeshBasicMaterial({
              color: 0xff5533, transparent: true, opacity: 0.15,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._hotGlow.position.set(0, 0, 215);
          this._root.add(this._hotGlow);

          /* cold pole glow */
          this._coldGlow = new THREE.Mesh(
            new THREE.SphereGeometry(30, 8, 8),
            new THREE.MeshBasicMaterial({
              color: 0x3355ff, transparent: true, opacity: 0.1,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._coldGlow.position.set(0, 0, -215);
          this._root.add(this._coldGlow);

          this._cadTime = 0;
          console.log("[cosmic-anisotropy-dipole] loaded at (0,0,1500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cadTime += dt;
          var t = this._cadTime;
          this._cmb.material.opacity = 0.2 + 0.04*Math.sin(t*0.5);
          this._hotGlow.material.opacity = 0.12 + 0.05*Math.sin(t*1.3);
          this._coldGlow.material.opacity = 0.08 + 0.04*Math.sin(t*1.1);
          this._root.rotation.y += 0.000015*dt;
        },
      });

      /* ====================================================================
         GALACTIC FOUNTAIN FLOW — supernova-driven outflows eject hot gas
         from the galactic disk into the halo; the gas cools, condenses into
         clouds, and falls back as high-velocity clouds (HVCs). We visualise
         this as upward jets of hot plasma from a disk plane, arcing outward
         and then raining down cool condensed clouds.
         Position: (-600, 1200, 800).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("galactic-fountain-flow", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-600, 1200, 800);
          scene.add(this._root);

          /* disk plane */
          var diskGeo = new THREE.RingGeometry(10, 80, 40);
          this._disk = new THREE.Mesh(diskGeo, new THREE.MeshBasicMaterial({
            color: 0xffcc99, transparent: true, opacity: 0.12,
            side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._disk.rotation.x = Math.PI/2;
          this._root.add(this._disk);

          /* hot outflow particles — rising from disk */
          var NUP = 350;
          var upPts = new Float32Array(NUP*3);
          this._upPts = upPts;
          this._upPhase = new Float32Array(NUP);
          this._upAngle = new Float32Array(NUP);
          this._upR = new Float32Array(NUP);
          for (var ui = 0; ui < NUP; ui++) {
            this._upPhase[ui] = Math.random();
            this._upAngle[ui] = Math.random()*2*Math.PI;
            this._upR[ui] = 10 + Math.random()*60;
          }
          var upGeo = new THREE.BufferGeometry();
          upGeo.setAttribute("position", new THREE.BufferAttribute(upPts, 3));
          this._upFlow = new THREE.Points(upGeo, new THREE.PointsMaterial({
            color: 0xff7700, size: 1.8,
            transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._upFlow);

          /* cold HVC rain — falling back down */
          var NHV = 200;
          var hvPts = new Float32Array(NHV*3);
          this._hvPts = hvPts;
          this._hvPhase = new Float32Array(NHV);
          this._hvAngle = new Float32Array(NHV);
          this._hvR = new Float32Array(NHV);
          for (var hi = 0; hi < NHV; hi++) {
            this._hvPhase[hi] = Math.random();
            this._hvAngle[hi] = Math.random()*2*Math.PI;
            this._hvR[hi] = 20 + Math.random()*80;
          }
          var hvGeo = new THREE.BufferGeometry();
          hvGeo.setAttribute("position", new THREE.BufferAttribute(hvPts, 3));
          this._hvRain = new THREE.Points(hvGeo, new THREE.PointsMaterial({
            color: 0x88ccff, size: 1.5,
            transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._hvRain);

          this._gffTime = 0;
          this._NUP = NUP;
          this._NHV = NHV;
          console.log("[galactic-fountain-flow] loaded at (-600,1200,800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._gffTime += dt;
          var t = this._gffTime;
          /* hot outflow arcs upward then disperses */
          for (var ui = 0; ui < this._NUP; ui++) {
            this._upPhase[ui] = (this._upPhase[ui] + 0.06*dt) % 1;
            var ph = this._upPhase[ui];
            var h = ph * 130;
            var spread = ph * 30;
            var a = this._upAngle[ui];
            this._upPts[ui*3  ] = (this._upR[ui] + spread)*Math.cos(a);
            this._upPts[ui*3+1] = h;
            this._upPts[ui*3+2] = (this._upR[ui] + spread)*Math.sin(a);
          }
          this._upFlow.geometry.attributes.position.needsUpdate = true;
          /* cool HVCs fall back */
          for (var hi = 0; hi < this._NHV; hi++) {
            this._hvPhase[hi] = (this._hvPhase[hi] + 0.05*dt) % 1;
            var hph = this._hvPhase[hi];
            var hy = 130 - hph*130;
            var ha = this._hvAngle[hi];
            this._hvPts[hi*3  ] = this._hvR[hi]*Math.cos(ha);
            this._hvPts[hi*3+1] = hy;
            this._hvPts[hi*3+2] = this._hvR[hi]*Math.sin(ha);
          }
          this._hvRain.geometry.attributes.position.needsUpdate = true;
          this._root.rotation.y += 0.00003*dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 71 injected! Lines:', lineCount);
