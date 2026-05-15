'use strict';
// inject-w88.cjs — Wave 88: interstellar-magnetic-draping-layer + cosmic-electron-whistler-wave
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("interstellar-magnetic-draping-layer"')) {
  console.log('Wave 88 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity cosmic-beta-decay-nebula></a-entity>';
const HTML_INSERT = `      <a-entity cosmic-beta-decay-nebula></a-entity>
      <!-- ── INTERSTELLAR MAGNETIC DRAPING LAYER — ISM field draping over a moving obstacle ── -->
      <a-entity interstellar-magnetic-draping-layer></a-entity>
      <!-- ── COSMIC ELECTRON WHISTLER WAVE — whistler-mode chorus waves in a magnetosphere ── -->
      <a-entity cosmic-electron-whistler-wave></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         INTERSTELLAR MAGNETIC DRAPING LAYER — the ambient ISM magnetic
         field is swept around a moving dense cloud, draping into a
         characteristic U-shaped morphology behind the obstacle.
         Renders: the obstacle sphere + draping field lines bending around
         it and stretching into a long magnetotail.
         Position: (-300, -500, 700).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("interstellar-magnetic-draping-layer", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-300, -500, 700);
          scene.add(this._root);

          /* dense cloud obstacle */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(12, 12, 10),
            new THREE.MeshBasicMaterial({
              color: 0x334466, transparent: true, opacity: 0.5,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          /* draping field lines */
          var NL = 18;
          for (var li = 0; li < NL; li++) {
            var lOff = -20 + li*(40/NL);
            var lPts = [];
            for (var pi = 0; pi <= 80; pi++) {
              var pf = pi/80;
              var px = -80 + pf*160;
              /* draping: field deflected around sphere */
              var dist = Math.sqrt(px*px + lOff*lOff);
              var py = lOff + (dist < 20 ? (20-dist)*1.2*Math.sign(lOff || 0.001) : 0);
              var pz = 0;
              lPts.push(px, py, pz);
            }
            var lGeo = new THREE.BufferGeometry();
            lGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lPts), 3));
            this._root.add(new THREE.Line(lGeo, new THREE.LineBasicMaterial({
              color: 0x6699ff, transparent: true, opacity: 0.18,
              blending: THREE.AdditiveBlending,
            })));
          }

          /* magnetotail particles */
          var NT = 4000;
          var tPts = new Float32Array(NT*3);
          this._tPts = tPts; this._NT = NT;
          for (var ti = 0; ti < NT; ti++) {
            tPts[ti*3  ] = 12 + Math.random()*100;
            tPts[ti*3+1] = (Math.random()-0.5)*10;
            tPts[ti*3+2] = (Math.random()-0.5)*10;
          }
          var tGeo = new THREE.BufferGeometry();
          tGeo.setAttribute("position", new THREE.BufferAttribute(tPts, 3));
          this._tail = new THREE.Points(tGeo, new THREE.PointsMaterial({
            color: 0x4488cc, size: 0.5,
            transparent: true, opacity: 0.2,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._tail);

          this._imdlTime = 0;
          console.log("[interstellar-magnetic-draping-layer] loaded at (-300,-500,700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._imdlTime += dt;
          var t = this._imdlTime;
          /* drift tail downstream */
          for (var ti = 0; ti < this._NT; ti++) {
            this._tPts[ti*3  ] += 5*dt;
            if (this._tPts[ti*3  ] > 120) this._tPts[ti*3  ] = 12;
          }
          this._tail.geometry.attributes.position.needsUpdate = true;
          this._tail.material.opacity = 0.15 + 0.08*Math.sin(t*1.6);
        },
      });

      /* ====================================================================
         COSMIC ELECTRON WHISTLER WAVE — chorus-mode whistler waves in a
         planetary magnetosphere: right-hand circularly polarised EM waves
         propagating along field lines, visible through energetic electron
         precipitation in discrete rising/falling tones.
         Renders: helical wave packet ribbons spiraling along a dipole field
         line + glowing precipitation curtain at the foot.
         Position: (0, 1000, -300).
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("cosmic-electron-whistler-wave", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(0, 1000, -300);
          scene.add(this._root);

          /* helical wave ribbons */
          this._helixes = [];
          for (var hi = 0; hi < 5; hi++) {
            var NW = 120;
            var wPts = new Float32Array(NW*3);
            var wGeo = new THREE.BufferGeometry();
            wGeo.setAttribute("position", new THREE.BufferAttribute(wPts, 3));
            var wMesh = new THREE.Line(wGeo, new THREE.LineBasicMaterial({
              color: 0x00ddff, transparent: true, opacity: 0.35,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(wMesh);
            this._helixes.push({ mesh: wMesh, pts: wPts, phase: hi*1.25, n: NW });
          }

          /* precipitation curtain */
          var NP2 = 3000;
          var pPts2 = new Float32Array(NP2*3);
          this._pPts2 = pPts2; this._NP2 = NP2;
          for (var pi2 = 0; pi2 < NP2; pi2++) {
            pPts2[pi2*3  ] = (Math.random()-0.5)*40;
            pPts2[pi2*3+1] = -40 + Math.random()*20;
            pPts2[pi2*3+2] = (Math.random()-0.5)*2;
          }
          var pGeo2 = new THREE.BufferGeometry();
          pGeo2.setAttribute("position", new THREE.BufferAttribute(pPts2, 3));
          this._precip = new THREE.Points(pGeo2, new THREE.PointsMaterial({
            color: 0x66ffcc, size: 0.6,
            transparent: true, opacity: 0.3,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._precip);

          this._cewTime = 0;
          console.log("[cosmic-electron-whistler-wave] loaded at (0,1000,-300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cewTime += dt;
          var t = this._cewTime;
          /* update helical ribbons */
          for (var hi = 0; hi < this._helixes.length; hi++) {
            var h = this._helixes[hi];
            var pts = h.pts; var n = h.n;
            var amp = 6;
            for (var pi = 0; pi < n; pi++) {
              var pf = pi/(n-1);
              var y = -50 + pf*100;
              var phase = h.phase + pf*8 - t*4;
              pts[pi*3  ] = amp*Math.cos(phase);
              pts[pi*3+1] = y;
              pts[pi*3+2] = amp*Math.sin(phase);
            }
            h.mesh.geometry.attributes.position.needsUpdate = true;
          }
          /* precipitation drift */
          for (var pi2 = 0; pi2 < this._NP2; pi2++) {
            this._pPts2[pi2*3+1] -= 15*dt;
            if (this._pPts2[pi2*3+1] < -55) this._pPts2[pi2*3+1] = -40;
          }
          this._precip.geometry.attributes.position.needsUpdate = true;
          this._precip.material.opacity = 0.25 + 0.1*Math.sin(t*3.5);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 88 injected! Lines:', lineCount);
