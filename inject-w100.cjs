'use strict';
// inject-w100.cjs — Wave 100 (CENTURY): cosmic-omega-magnetic-null-point + stellar-turbulent-cascade-plume
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-omega-magnetic-null-point"')) {
  console.log('Wave 100 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-acoustic-running-wave></a-entity>';
const HTML_INSERT = `      <a-entity stellar-acoustic-running-wave></a-entity>
      <!-- ── COSMIC OMEGA MAGNETIC NULL POINT — 3-D magnetic null X-point reconnection ── -->
      <a-entity cosmic-omega-magnetic-null-point></a-entity>
      <!-- ── STELLAR TURBULENT CASCADE PLUME — energy cascade plume from injection scale ── -->
      <a-entity stellar-turbulent-cascade-plume></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC OMEGA MAGNETIC NULL POINT — 3-D magnetic null points are
         sites where the field goes to zero; reconnection in the fan-spine
         topology converts magnetic to kinetic+thermal energy.
         Renders: fan-plane + spine axis particle flows converging on null.
         Position: (0, 0, -1000).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
         WAVE 100 — CENTURY MARK
      ==================================================================== */
      AFRAME.registerComponent("cosmic-omega-magnetic-null-point", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(0, 0, -1000);
          scene.add(this._root);

          /* fan-plane disc */
          var NF3 = 4000;
          var fPts3 = new Float32Array(NF3*3);
          for (var fi3 = 0; fi3 < NF3; fi3++) {
            var fa3 = Math.random()*2*Math.PI;
            var fr = Math.random()*18;
            fPts3[fi3*3  ] = fr*Math.cos(fa3);
            fPts3[fi3*3+1] = (Math.random()-0.5)*1;
            fPts3[fi3*3+2] = fr*Math.sin(fa3);
          }
          var fGeo3 = new THREE.BufferGeometry();
          fGeo3.setAttribute("position", new THREE.BufferAttribute(fPts3, 3));
          this._root.add(new THREE.Points(fGeo3, new THREE.PointsMaterial({
            color: 0x4488ff, size: 0.5, transparent: true, opacity: 0.2,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* spine axis particles flowing in */
          var NS2 = 1200;
          var sPts3 = new Float32Array(NS2*3);
          this._sPts3 = sPts3; this._NS2 = NS2;
          var sGeo3 = new THREE.BufferGeometry();
          sGeo3.setAttribute("position", new THREE.BufferAttribute(sPts3, 3));
          this._spine = new THREE.Points(sGeo3, new THREE.PointsMaterial({
            color: 0xff4444, size: 0.65, transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._spine);

          /* null-point glow */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(1.2, 8, 7),
            new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false })
          ));

          this._omnTime = 0;
          console.log("[cosmic-omega-magnetic-null-point] WAVE 100 CENTURY loaded at (0,0,-1000)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._omnTime += dt;
          var t = this._omnTime;
          for (var si4 = 0; si4 < this._NS2; si4++) {
            var sf = Math.random();
            var sz = sf < 0.5 ? -(1-sf*2)*20 : (sf*2-1)*20;
            var swirl = sz*0.4 + t*1.5;
            var sr = (1-Math.abs(sz)/20)*3;
            this._sPts3[si4*3  ] = sr*Math.cos(swirl);
            this._sPts3[si4*3+1] = sz + (Math.random()-0.5)*0.5;
            this._sPts3[si4*3+2] = sr*Math.sin(swirl);
          }
          this._spine.geometry.attributes.position.needsUpdate = true;
          this._spine.material.opacity = 0.45 + 0.1*Math.sin(t*2);
        },
      });

      /* ====================================================================
         STELLAR TURBULENT CASCADE PLUME — turbulent energy injected at
         large scales cascades to smaller scales (Kolmogorov/Kraichnan
         cascade), forming a self-similar plume of eddies.
         Renders: a fractal plume of nested swirling particle clusters.
         Position: (700, 400, 700).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
         WAVE 100 — CENTURY MARK
      ==================================================================== */
      AFRAME.registerComponent("stellar-turbulent-cascade-plume", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(700, 400, 700);
          scene.add(this._root);

          /* fractal levels */
          var NLEVELS = 5;
          this._levels = [];
          for (var lv = 0; lv < NLEVELS; lv++) {
            var scale = 20/(lv+1);
            var NLP = Math.round(500*(lv+1));
            var lPts2 = new Float32Array(NLP*3);
            var lGeo2 = new THREE.BufferGeometry();
            lGeo2.setAttribute("position", new THREE.BufferAttribute(lPts2, 3));
            var lMat2 = new THREE.PointsMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.55 + lv*0.06, 1.0, 0.55),
              size: Math.max(0.2, 0.9-lv*0.15),
              transparent: true, opacity: 0.3,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var lMesh2 = new THREE.Points(lGeo2, lMat2);
            this._root.add(lMesh2);
            this._levels.push({ mesh: lMesh2, pts: lPts2, scale: scale, speed: 0.5*(lv+1) });
          }
          this._stcpTime = 0;
          console.log("[stellar-turbulent-cascade-plume] WAVE 100 CENTURY loaded at (700,400,700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._stcpTime += dt;
          var t = this._stcpTime;
          for (var lv2 = 0; lv2 < this._levels.length; lv2++) {
            var lv3 = this._levels[lv2];
            var sc = lv3.scale;
            var sp = lv3.speed;
            var NLP2 = lv3.pts.length/3;
            for (var pi2 = 0; pi2 < NLP2; pi2++) {
              var pa = Math.random()*2*Math.PI;
              var pb = Math.random()*Math.PI;
              var pr = Math.random()*sc;
              var twist = pa + t*sp*(1+lv2*0.3);
              lv3.pts[pi2*3  ] = pr*Math.sin(pb)*Math.cos(twist);
              lv3.pts[pi2*3+1] = (Math.random()-0.5)*sc*0.6 - lv2*2;
              lv3.pts[pi2*3+2] = pr*Math.sin(pb)*Math.sin(twist);
            }
            lv3.mesh.geometry.attributes.position.needsUpdate = true;
            lv3.mesh.material.opacity = 0.2 + 0.15*Math.sin(t*sp*0.4 + lv2);
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 100 CENTURY injected! Lines:', lineCount);
