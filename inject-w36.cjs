'use strict';
// inject-w36.cjs — Wave 36: stellar-coronal-loop + planetary-nebula-halo
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("stellar-coronal-loop"')) {
  console.log('Wave 36 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity cometary-plasma-tail></a-entity>';
const HTML_INSERT = `      <a-entity cometary-plasma-tail></a-entity>
      <!-- ── STELLAR CORONAL LOOP — hot plasma arc above an active star surface ── -->
      <a-entity stellar-coronal-loop></a-entity>
      <!-- ── PLANETARY NEBULA HALO — extended outer arc of a bipolar planetary nebula ── -->
      <a-entity planetary-nebula-halo></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         STELLAR CORONAL LOOP — a hot (1-10 MK) magnetic plasma loop rooted
         in the stellar chromosphere, arching through the corona. These are
         the dominant structure visible in EUV/X-ray images of the Sun.
         Position: (-500, -200, -600).
         Components:
           - Stellar disk: 400 pts, orange-yellow, flickering
           - Multiple loops: 5 arcs of pts (each 200 pts), different heights/widths
           - Hot apex glow: bright white sphere at loop tops
           - Footpoints: bright regions at chromospheric anchor
           - Thermal emission: diffuse halo along loops (hot plasma glow)
         Loops oscillate (Alfven wave resonance) in tick.
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("stellar-coronal-loop", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-500, -200, -600);
          scene.add(this._root);

          /* stellar disk */
          var SDN = 400;
          var sdPts = new Float32Array(SDN * 3);
          for (var sdi = 0; sdi < SDN; sdi++) {
            var sa = Math.random() * 2 * Math.PI;
            var sr = Math.sqrt(Math.random()) * 30;
            sdPts[sdi*3  ] = sr * Math.cos(sa);
            sdPts[sdi*3+1] = sr * Math.sin(sa);
            sdPts[sdi*3+2] = (Math.random()-0.5)*2;
          }
          var sdGeo = new THREE.BufferGeometry();
          sdGeo.setAttribute("position", new THREE.BufferAttribute(sdPts, 3));
          this._sdMat = new THREE.PointsMaterial({
            color: 0xff8833, size: 2.5, transparent: true, opacity: 0.60,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(sdGeo, this._sdMat));

          /* coronal loops — semicircular arcs in XY plane at different widths */
          this._loops = [];
          var loopParams = [
            { r: 35, spread: 20, color: 0x88ccff, height: 1.0 },
            { r: 50, spread: 30, color: 0x99eeff, height: 1.2 },
            { r: 65, spread: 40, color: 0x66aaff, height: 0.9 },
            { r: 45, spread: 25, color: 0xaaddff, height: 1.5 },
            { r: 28, spread: 15, color: 0xffeedd, height: 0.8 },
          ];
          for (var li = 0; li < loopParams.length; li++) {
            var lp = loopParams[li];
            var LN = 200;
            var lPts = new Float32Array(LN * 3);
            for (var lni = 0; lni < LN; lni++) {
              /* semicircle rising above disk */
              var lt = lni / (LN-1);
              var la = lt * Math.PI;
              var lr = lp.r + (Math.random()-0.5)*3;
              lPts[lni*3  ] = lr * Math.cos(la) - lp.spread/2 + Math.random()*lp.spread*0.1;
              lPts[lni*3+1] = lr * Math.sin(la) * lp.height;
              lPts[lni*3+2] = (Math.random()-0.5)*5;
            }
            var lGeo = new THREE.BufferGeometry();
            lGeo.setAttribute("position", new THREE.BufferAttribute(lPts, 3));
            var lMat = new THREE.PointsMaterial({
              color: lp.color, size: 2.2, transparent: true, opacity: 0.65,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var lMesh = new THREE.Points(lGeo, lMat);
            this._root.add(lMesh);
            this._loops.push({ mesh: lMesh, mat: lMat, r: lp.r });
          }

          /* apex glow */
          this._apex = new THREE.Mesh(
            new THREE.SphereGeometry(4, 6, 4),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.80 })
          );
          this._apex.position.set(0, 65, 0);
          this._root.add(this._apex);

          /* footpoints */
          for (var fp = 0; fp < 2; fp++) {
            var fpm = new THREE.Mesh(
              new THREE.SphereGeometry(3, 5, 3),
              new THREE.MeshBasicMaterial({ color: 0xffcc66, transparent: true, opacity: 0.90 })
            );
            fpm.position.set((fp===0 ? -35 : 35), 0, 0);
            this._root.add(fpm);
          }

          this._clTime = 0;
          console.log("[stellar-coronal-loop] loaded at (-500,-200,-600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._clTime += dt;

          /* Alfven wave oscillation on loop opacity */
          for (var li = 0; li < this._loops.length; li++) {
            this._loops[li].mat.opacity = 0.50 + 0.25 * Math.sin(this._clTime * (1.8 + li * 0.4));
          }

          /* stellar flicker */
          this._sdMat.opacity = 0.55 + 0.10 * Math.sin(this._clTime * 11.7);

          /* apex pulse */
          this._apex.material.opacity = 0.70 + 0.25 * Math.sin(this._clTime * 3.2);

          this._root.rotation.z += 0.0003 * dt;
        },
      });

      /* ====================================================================
         PLANETARY NEBULA HALO — the faint extended outer halo of a bipolar
         planetary nebula. Shows inner bright lobes, equatorial torus, and
         the ancient slow-wind halo left from AGB mass loss.
         Position: (800, -500, -200).
         Components:
           - Inner bipolar lobes: 2 bright ellipsoidal cavities (north/south)
           - Equatorial torus: dense ring of ionized gas (green-cyan)
           - Outer halo: 600 pts faint sphere (ancient slow-wind shell)
           - Halo arcs: 3 detached arc structures (multiple ejection episodes)
           - Central star: hot white dwarf point
           - Ionization gradient: color shifts with distance (red→green→blue)
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("planetary-nebula-halo", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(800, -500, -200);
          scene.add(this._root);

          /* inner bipolar lobes */
          var lobeColors = [0xff6644, 0xffaa44];
          for (var lb = 0; lb < 2; lb++) {
            var LN = 500;
            var lPts = new Float32Array(LN * 3);
            var sign = lb===0 ? 1 : -1;
            for (var lni = 0; lni < LN; lni++) {
              var la = Math.random()*2*Math.PI;
              var lr = Math.random()*28;
              var lz = sign*(20 + Math.sqrt(Math.random())*40);
              lPts[lni*3  ] = lr*Math.cos(la)*0.6;
              lPts[lni*3+1] = lz + (Math.random()-0.5)*5;
              lPts[lni*3+2] = lr*Math.sin(la)*0.6;
            }
            var lGeo = new THREE.BufferGeometry();
            lGeo.setAttribute("position", new THREE.BufferAttribute(lPts, 3));
            this._root.add(new THREE.Points(lGeo, new THREE.PointsMaterial({
              color: lobeColors[lb], size: 2.0, transparent: true, opacity: 0.50,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* equatorial torus */
          var TN = 500;
          var tPts = new Float32Array(TN * 3);
          for (var ti = 0; ti < TN; ti++) {
            var ta = Math.random()*2*Math.PI;
            var tr = 28 + (Math.random()-0.5)*8;
            var tz = (Math.random()-0.5)*10;
            tPts[ti*3  ] = tr*Math.cos(ta);
            tPts[ti*3+1] = tz;
            tPts[ti*3+2] = tr*Math.sin(ta);
          }
          var tGeo = new THREE.BufferGeometry();
          tGeo.setAttribute("position", new THREE.BufferAttribute(tPts, 3));
          this._root.add(new THREE.Points(tGeo, new THREE.PointsMaterial({
            color: 0x44ffaa, size: 2.5, transparent: true, opacity: 0.65,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* outer halo: diffuse spherical shell */
          var HN = 600;
          var hPts = new Float32Array(HN * 3);
          for (var hi = 0; hi < HN; hi++) {
            var hp = Math.acos(2*Math.random()-1);
            var ha = Math.random()*2*Math.PI;
            var hr = 100 + (Math.random()-0.5)*20;
            hPts[hi*3  ] = hr*Math.sin(hp)*Math.cos(ha);
            hPts[hi*3+1] = hr*Math.cos(hp);
            hPts[hi*3+2] = hr*Math.sin(hp)*Math.sin(ha);
          }
          var hGeo = new THREE.BufferGeometry();
          hGeo.setAttribute("position", new THREE.BufferAttribute(hPts, 3));
          this._root.add(new THREE.Points(hGeo, new THREE.PointsMaterial({
            color: 0xff4488, size: 1.5, transparent: true, opacity: 0.08,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* halo arcs (3 rings at different latitudes) */
          var arcAngles = [Math.PI*0.3, Math.PI*0.5, Math.PI*0.7];
          var arcColors = [0xff8855, 0xffcc44, 0xaa44ff];
          for (var arc = 0; arc < 3; arc++) {
            var AN = 200;
            var aPts = new Float32Array(AN * 3);
            var aLat = arcAngles[arc];
            for (var ani = 0; ani < AN; ani++) {
              var aa = (ani/AN)*2*Math.PI + (Math.random()-0.5)*0.3;
              var ar = (90 + arc*15) + (Math.random()-0.5)*5;
              aPts[ani*3  ] = ar*Math.sin(aLat)*Math.cos(aa);
              aPts[ani*3+1] = ar*Math.cos(aLat) + (Math.random()-0.5)*5;
              aPts[ani*3+2] = ar*Math.sin(aLat)*Math.sin(aa);
            }
            var aGeo = new THREE.BufferGeometry();
            aGeo.setAttribute("position", new THREE.BufferAttribute(aPts, 3));
            this._root.add(new THREE.Points(aGeo, new THREE.PointsMaterial({
              color: arcColors[arc], size: 1.8, transparent: true, opacity: 0.12,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* central white dwarf */
          var wd = new THREE.Mesh(
            new THREE.SphereGeometry(2, 5, 3),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          this._root.add(wd);
          this._wd = wd;

          this._pnTime = 0;
          console.log("[planetary-nebula-halo] loaded at (800,-500,-200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._pnTime += dt;

          /* WD flicker */
          this._wd.material.color.setHSL(0, 0, 0.85 + 0.15 * Math.sin(this._pnTime * 7.3));

          this._root.rotation.y += 0.0004 * dt;
          this._root.rotation.x = 0.2;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 36 injected! Lines:', lineCount);
