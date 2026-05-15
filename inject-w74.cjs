'use strict';
// inject-w74.cjs — Wave 74: cosmic-lensing-caustic-web + stellar-chromosphere-spicule-forest
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-lensing-caustic-web"')) {
  console.log('Wave 74 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity cosmic-dust-devil-tower></a-entity>';
const HTML_INSERT = `      <a-entity cosmic-dust-devil-tower></a-entity>
      <!-- ── COSMIC LENSING CAUSTIC WEB — gravitational focusing ridges ── -->
      <a-entity cosmic-lensing-caustic-web></a-entity>
      <!-- ── STELLAR CHROMOSPHERE SPICULE FOREST — thin chromospheric jets ── -->
      <a-entity stellar-chromosphere-spicule-forest></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC LENSING CAUSTIC WEB — when a gravitational lens focuses light
         to a curve rather than a point the image forms a caustic: a bright
         ridge of infinite magnification. We render a network of such ridges
         as luminous curves threading through a dark-matter halo,
         shimmering as background sources move.
         Position: (200, -500, 1500).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-lensing-caustic-web", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(200, -500, 1500);
          scene.add(this._root);

          /* dark matter halo wireframe */
          var haloGeo = new THREE.SphereGeometry(120, 8, 5);
          this._halo = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({
            color: 0x220044, wireframe: true,
            transparent: true, opacity: 0.06,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._halo);

          /* caustic ridges — astroid curves in tilted planes */
          this._ridges = [];
          var ridgeColors = [0xffeeaa, 0xaaffee, 0xffaacc, 0xaaccff, 0xffddaa];
          for (var rc = 0; rc < 5; rc++) {
            var a = 50 + rc*12;
            var pts = [];
            for (var rp = 0; rp <= 120; rp++) {
              var t = (rp/120)*2*Math.PI;
              /* astroid: x=a*cos^3(t), y=a*sin^3(t) */
              var cx = a*Math.pow(Math.cos(t),3);
              var cy = a*Math.pow(Math.sin(t),3)*0.6;
              var cz = (Math.random()-0.5)*4;
              pts.push(new THREE.Vector3(cx, cy, cz));
            }
            var cGeo = new THREE.BufferGeometry().setFromPoints(pts);
            var cLine = new THREE.Line(cGeo, new THREE.LineBasicMaterial({
              color: ridgeColors[rc%ridgeColors.length],
              transparent: true, opacity: 0.35,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            cLine.rotation.x = (rc*0.63)%Math.PI;
            cLine.rotation.z = (rc*0.41)%Math.PI;
            this._root.add(cLine);
            this._ridges.push({ line: cLine, baseRotX: cLine.rotation.x, baseRotZ: cLine.rotation.z, phase: rc*1.2 });
          }

          /* glow particles along ridges */
          var NG = 600;
          var gPts = new Float32Array(NG*3);
          this._gPts = gPts;
          this._gPhase = new Float32Array(NG);
          this._gRidgeIdx = new Uint8Array(NG);
          for (var gi = 0; gi < NG; gi++) {
            this._gPhase[gi] = Math.random()*2*Math.PI;
            this._gRidgeIdx[gi] = gi % 5;
          }
          var gGeo = new THREE.BufferGeometry();
          gGeo.setAttribute("position", new THREE.BufferAttribute(gPts, 3));
          this._glow = new THREE.Points(gGeo, new THREE.PointsMaterial({
            color: 0xffffaa, size: 1.0,
            transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._glow);

          this._lcTime = 0; this._NG = NG;
          console.log("[cosmic-lensing-caustic-web] loaded at (200,-500,1500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._lcTime += dt;
          var t = this._lcTime;
          /* shimmer ridges */
          for (var ri = 0; ri < this._ridges.length; ri++) {
            var r = this._ridges[ri];
            r.line.material.opacity = 0.25 + 0.15*Math.sin(t*0.7 + r.phase);
            r.line.rotation.y = t*0.04*(ri%2===0?1:-1);
          }
          /* drift glow particles along astroid paths */
          for (var gi = 0; gi < this._NG; gi++) {
            this._gPhase[gi] = (this._gPhase[gi] + 0.4*dt) % (2*Math.PI);
            var rid = this._gRidgeIdx[gi];
            var a = 50 + rid*12;
            var ph = this._gPhase[gi];
            this._gPts[gi*3  ] = a*Math.pow(Math.cos(ph),3);
            this._gPts[gi*3+1] = a*0.6*Math.pow(Math.sin(ph),3);
            this._gPts[gi*3+2] = (rid-2)*12;
          }
          this._glow.geometry.attributes.position.needsUpdate = true;
        },
      });

      /* ====================================================================
         STELLAR CHROMOSPHERE SPICULE FOREST — thin plasma jets (~500 km dia,
         5000 km tall) that cover the sun's chromosphere, lasting ~5 min each.
         We render a hemisphere bristling with hundreds of thin luminous needles
         that flicker, rise and fall.
         Position: (-100, 600, -1400).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-chromosphere-spicule-forest", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-100, 600, -1400);
          scene.add(this._root);

          /* stellar disk */
          this._star = new THREE.Mesh(
            new THREE.SphereGeometry(40, 16, 12),
            new THREE.MeshBasicMaterial({
              color: 0xff8800, transparent: true, opacity: 0.9,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._star);

          /* chromosphere shell */
          this._chrom = new THREE.Mesh(
            new THREE.SphereGeometry(42, 16, 12),
            new THREE.MeshBasicMaterial({
              color: 0xff4400, wireframe: true,
              transparent: true, opacity: 0.1,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._chrom);

          /* spicule particles — each spicule is a series of stacked points */
          var NS = 300;
          var PPS = 5; /* points per spicule */
          var N = NS * PPS;
          var sPts = new Float32Array(N*3);
          this._sPts = sPts;
          this._sRoot = []; /* base direction vectors on sphere */
          this._sPhase = new Float32Array(NS);
          this._sH = new Float32Array(NS); /* current height fraction 0-1 */
          this._sGrow = new Float32Array(NS); /* grow direction +1/-1 */
          for (var si = 0; si < NS; si++) {
            var sTheta = Math.acos(1 - 2*Math.random()*0.7); /* upper hemi */
            var sPhi = Math.random()*2*Math.PI;
            var sx = Math.sin(sTheta)*Math.cos(sPhi);
            var sy = Math.cos(sTheta);
            var sz = Math.sin(sTheta)*Math.sin(sPhi);
            this._sRoot.push(new THREE.Vector3(sx, sy, sz));
            this._sPhase[si] = Math.random()*2*Math.PI;
            this._sH[si] = Math.random();
            this._sGrow[si] = Math.random() < 0.5 ? 1 : -1;
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(sPts, 3));
          this._spicules = new THREE.Points(sGeo, new THREE.PointsMaterial({
            color: 0xffddaa, size: 0.9,
            transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._spicules);

          this._scTime = 0; this._NS = NS; this._PPS = PPS;
          console.log("[stellar-chromosphere-spicule-forest] loaded at (-100,600,-1400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._scTime += dt;
          for (var si = 0; si < this._NS; si++) {
            this._sH[si] += this._sGrow[si] * 0.18 * dt;
            if (this._sH[si] >= 1) { this._sH[si] = 1; this._sGrow[si] = -1; }
            if (this._sH[si] <= 0) { this._sH[si] = 0; this._sGrow[si] = 1; this._sPhase[si] = Math.random()*2*Math.PI; }
            var base = this._sRoot[si];
            var maxLen = 18;
            var curLen = this._sH[si] * maxLen;
            for (var p = 0; p < this._PPS; p++) {
              var frac = p / (this._PPS-1);
              var r = 40 + frac*curLen;
              var idx = (si*this._PPS + p)*3;
              this._sPts[idx  ] = base.x * r;
              this._sPts[idx+1] = base.y * r;
              this._sPts[idx+2] = base.z * r;
            }
          }
          this._spicules.geometry.attributes.position.needsUpdate = true;
          this._star.material.opacity = 0.85 + 0.05*Math.sin(this._scTime*0.4);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 74 injected! Lines:', lineCount);
