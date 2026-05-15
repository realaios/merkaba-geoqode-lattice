'use strict';
// inject-w85.cjs — Wave 85: plasma-firehose-instability + cosmic-reaccretion-infall
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("plasma-firehose-instability"')) {
  console.log('Wave 85 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity starburst-superwind-chimney></a-entity>';
const HTML_INSERT = `      <a-entity starburst-superwind-chimney></a-entity>
      <!-- ── PLASMA FIREHOSE INSTABILITY — a fast magnetised plasma jet kinking and firehosing ── -->
      <a-entity plasma-firehose-instability></a-entity>
      <!-- ── COSMIC REACCRETION INFALL — stripped gas raining back down onto a galaxy ── -->
      <a-entity cosmic-reaccretion-infall></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         PLASMA FIREHOSE INSTABILITY — a relativistic plasma jet develops a
         kink/firehose instability, causing the jet spine to oscillate into
         a helical, whipping pattern.  Renders: the kinking jet spine as a
         dynamic sinusoidal tube + sheath particles shaken loose.
         Position: (-200, 500, -900).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("plasma-firehose-instability", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-200, 500, -900);
          scene.add(this._root);

          /* jet spine — computed each tick via a sinusoidal kink */
          this._NJ = 80;
          var jPts = new Float32Array(this._NJ*3);
          var jGeo = new THREE.BufferGeometry();
          jGeo.setAttribute("position", new THREE.BufferAttribute(jPts, 3));
          this._jPts = jPts;
          this._jetLine = new THREE.Line(jGeo, new THREE.LineBasicMaterial({
            color: 0x66aaff, transparent: true, opacity: 0.7,
            blending: THREE.AdditiveBlending,
          }));
          this._root.add(this._jetLine);

          /* sheath particles */
          var NS = 5000;
          var sPts = new Float32Array(NS*3);
          this._sPts = sPts; this._NS = NS;
          for (var si = 0; si < NS; si++) {
            sPts[si*3  ] = (Math.random()-0.5)*30;
            sPts[si*3+1] = (Math.random()-0.5)*120;
            sPts[si*3+2] = (Math.random()-0.5)*30;
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(sPts, 3));
          this._sheath = new THREE.Points(sGeo, new THREE.PointsMaterial({
            color: 0x3399ff, size: 0.7,
            transparent: true, opacity: 0.22,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._sheath);

          this._pfTime = 0;
          console.log("[plasma-firehose-instability] loaded at (-200,500,-900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._pfTime += dt;
          var t = this._pfTime;
          /* kink wave: x = A*sin(k*y + omega*t) */
          var A = 12, k = 0.08, omega = 2.5;
          for (var ji = 0; ji < this._NJ; ji++) {
            var y = -60 + (ji/(this._NJ-1))*120;
            this._jPts[ji*3  ] = A*Math.sin(k*y + omega*t);
            this._jPts[ji*3+1] = y;
            this._jPts[ji*3+2] = A*0.5*Math.cos(k*y*0.7 + omega*t*1.3);
          }
          this._jetLine.geometry.attributes.position.needsUpdate = true;
          /* drift sheath */
          for (var si = 0; si < this._NS; si++) {
            this._sPts[si*3  ] += 2*(Math.random()-0.5)*dt;
            this._sPts[si*3+2] += 2*(Math.random()-0.5)*dt;
          }
          this._sheath.geometry.attributes.position.needsUpdate = true;
          this._sheath.material.opacity = 0.18 + 0.08*Math.sin(t*1.8);
        },
      });

      /* ====================================================================
         COSMIC REACCRETION INFALL — gas that was previously ejected from a
         galaxy by AGN feedback has cooled and is now raining back down as
         cold streams.  Renders: cold filamentary infall streams converging
         toward the galaxy centre, plus warm halo gas being stirred.
         Position: (600, 800, 100).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("cosmic-reaccretion-infall", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(600, 800, 100);
          scene.add(this._root);

          /* infall streams */
          this._streams = [];
          var NC = 12;
          for (var ci = 0; ci < NC; ci++) {
            var angle = (ci/NC)*2*Math.PI;
            var r0 = 55 + Math.random()*20;
            var NP = 200;
            var pts = new Float32Array(NP*3);
            for (var pi2 = 0; pi2 < NP; pi2++) {
              var frac = pi2/(NP-1);
              var r = r0*(1-frac*0.9);
              pts[pi2*3  ] = r*Math.cos(angle) + (Math.random()-0.5)*5;
              pts[pi2*3+1] = (1-frac)*60 + (Math.random()-0.5)*8;
              pts[pi2*3+2] = r*Math.sin(angle) + (Math.random()-0.5)*5;
            }
            var sGeo = new THREE.BufferGeometry();
            sGeo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
            var sMesh = new THREE.Line(sGeo, new THREE.LineBasicMaterial({
              color: 0x66ccff, transparent: true, opacity: 0.3,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(sMesh);
            this._streams.push({ mesh: sMesh, pts: pts, n: NP });
          }

          /* warm halo haze */
          var NH = 4000;
          var hPts = new Float32Array(NH*3);
          this._hPts = hPts; this._NH = NH;
          for (var hi = 0; hi < NH; hi++) {
            var hr = 15 + Math.random()*70;
            var ha = Math.random()*2*Math.PI;
            var he = Math.random()*Math.PI;
            hPts[hi*3  ] = hr*Math.sin(he)*Math.cos(ha);
            hPts[hi*3+1] = hr*Math.cos(he);
            hPts[hi*3+2] = hr*Math.sin(he)*Math.sin(ha);
          }
          var hGeo = new THREE.BufferGeometry();
          hGeo.setAttribute("position", new THREE.BufferAttribute(hPts, 3));
          this._haloMesh = new THREE.Points(hGeo, new THREE.PointsMaterial({
            color: 0xff6644, size: 0.8,
            transparent: true, opacity: 0.15,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._haloMesh);

          this._criTime = 0;
          console.log("[cosmic-reaccretion-infall] loaded at (600,800,100)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._criTime += dt;
          var t = this._criTime;
          this._haloMesh.material.opacity = 0.12 + 0.06*Math.sin(t*0.8);
          this._root.rotation.y += 0.003*dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 85 injected! Lines:', lineCount);
