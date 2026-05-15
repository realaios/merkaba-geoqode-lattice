'use strict';
// inject-w35.cjs — Wave 35: galactic-bar-resonance + cometary-plasma-tail
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("galactic-bar-resonance"')) {
  console.log('Wave 35 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity radio-jet-knots></a-entity>';
const HTML_INSERT = `      <a-entity radio-jet-knots></a-entity>
      <!-- ── GALACTIC BAR RESONANCE — rotating bar structure driving spiral arm density waves ── -->
      <a-entity galactic-bar-resonance></a-entity>
      <!-- ── COMETARY PLASMA TAIL — ion tail blown anti-sunward by solar wind ── -->
      <a-entity cometary-plasma-tail></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         GALACTIC BAR RESONANCE — a rotating stellar bar in a spiral galaxy
         driving Lindblad resonances and density waves that create spiral arms.
         Shows bar stars, driven density-wave spirals, and co-rotation ring.
         Position: (700, 200, 600).
         Components:
           - Bar region: 800 pts (ellipsoidal, gold-white, rotating)
           - Inner Lindblad resonance ring: 300 pts (hot orange circle)
           - Outer Lindblad resonance ring: 300 pts (blue circle)
           - Co-rotation ring: 200 pts (dim white)
           - Driven spiral arms: 2 arms 600 pts each (blue-white, lagging bar)
           - Background disk stars: 400 pts (dim disk)
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("galactic-bar-resonance", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(700, 200, 600);
          scene.add(this._root);

          /* bar region: ellipsoidal distribution of stars */
          var BN = 800;
          var bPts = new Float32Array(BN * 3);
          for (var bi = 0; bi < BN; bi++) {
            var ba = (Math.random()-0.5)*Math.PI;
            var br = Math.random() * 60;
            var bz = (Math.random()-0.5)*10;
            bPts[bi*3  ] = br * Math.cos(ba) * 1.8;
            bPts[bi*3+1] = bz;
            bPts[bi*3+2] = br * Math.sin(ba);
          }
          var bGeo = new THREE.BufferGeometry();
          bGeo.setAttribute("position", new THREE.BufferAttribute(bPts, 3));
          this._barMesh = new THREE.Points(bGeo, new THREE.PointsMaterial({
            color: 0xffeeaa, size: 2.0, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._barMesh);

          /* ILR ring */
          var IN = 300;
          var iPts = new Float32Array(IN * 3);
          for (var ii = 0; ii < IN; ii++) {
            var ia = (ii / IN) * 2 * Math.PI + (Math.random()-0.5)*0.3;
            var ir = 70 + (Math.random()-0.5)*6;
            iPts[ii*3  ] = ir * Math.cos(ia);
            iPts[ii*3+1] = (Math.random()-0.5)*3;
            iPts[ii*3+2] = ir * Math.sin(ia);
          }
          var iGeo = new THREE.BufferGeometry();
          iGeo.setAttribute("position", new THREE.BufferAttribute(iPts, 3));
          this._root.add(new THREE.Points(iGeo, new THREE.PointsMaterial({
            color: 0xff8822, size: 1.8, transparent: true, opacity: 0.50,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* OLR ring */
          var ON = 300;
          var oPts = new Float32Array(ON * 3);
          for (var oi = 0; oi < ON; oi++) {
            var oa = (oi / ON) * 2 * Math.PI + (Math.random()-0.5)*0.3;
            var or2 = 140 + (Math.random()-0.5)*8;
            oPts[oi*3  ] = or2 * Math.cos(oa);
            oPts[oi*3+1] = (Math.random()-0.5)*4;
            oPts[oi*3+2] = or2 * Math.sin(oa);
          }
          var oGeo = new THREE.BufferGeometry();
          oGeo.setAttribute("position", new THREE.BufferAttribute(oPts, 3));
          this._root.add(new THREE.Points(oGeo, new THREE.PointsMaterial({
            color: 0x88aaff, size: 1.8, transparent: true, opacity: 0.40,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* co-rotation ring */
          var CRN = 200;
          var crPts = new Float32Array(CRN * 3);
          for (var cri = 0; cri < CRN; cri++) {
            var cra = (cri / CRN) * 2 * Math.PI + (Math.random()-0.5)*0.2;
            var crr = 105 + (Math.random()-0.5)*5;
            crPts[cri*3  ] = crr * Math.cos(cra);
            crPts[cri*3+1] = (Math.random()-0.5)*2;
            crPts[cri*3+2] = crr * Math.sin(cra);
          }
          var crGeo = new THREE.BufferGeometry();
          crGeo.setAttribute("position", new THREE.BufferAttribute(crPts, 3));
          this._root.add(new THREE.Points(crGeo, new THREE.PointsMaterial({
            color: 0xffffff, size: 1.0, transparent: true, opacity: 0.20,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* two driven spiral arms */
          for (var arm = 0; arm < 2; arm++) {
            var AN = 600;
            var aPts = new Float32Array(AN * 3);
            var armOffset = arm * Math.PI;
            for (var ai = 0; ai < AN; ai++) {
              var at = ai / AN;
              var ar = 70 + at * 80;
              var aa = armOffset + at * 2.5 + (Math.random()-0.5)*0.25;
              aPts[ai*3  ] = ar * Math.cos(aa);
              aPts[ai*3+1] = (Math.random()-0.5)*5;
              aPts[ai*3+2] = ar * Math.sin(aa);
            }
            var aGeo = new THREE.BufferGeometry();
            aGeo.setAttribute("position", new THREE.BufferAttribute(aPts, 3));
            this._root.add(new THREE.Points(aGeo, new THREE.PointsMaterial({
              color: 0xaaccff, size: 2.5, transparent: true, opacity: 0.45,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* background disk */
          var DN = 400;
          var dPts = new Float32Array(DN * 3);
          for (var di = 0; di < DN; di++) {
            var dr = Math.sqrt(Math.random()) * 160;
            var da = Math.random() * 2 * Math.PI;
            dPts[di*3  ] = dr * Math.cos(da);
            dPts[di*3+1] = (Math.random()-0.5)*6;
            dPts[di*3+2] = dr * Math.sin(da);
          }
          var dGeo = new THREE.BufferGeometry();
          dGeo.setAttribute("position", new THREE.BufferAttribute(dPts, 3));
          this._root.add(new THREE.Points(dGeo, new THREE.PointsMaterial({
            color: 0xfff5cc, size: 1.2, transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._gbTime = 0;
          console.log("[galactic-bar-resonance] loaded at (700,200,600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._gbTime += dt;

          /* bar rotates at angular rate */
          this._barMesh.rotation.y = this._gbTime * 0.08;

          /* whole structure tilts slowly */
          this._root.rotation.y += 0.0003 * dt;
          this._root.rotation.x = 0.35;
        },
      });

      /* ====================================================================
         COMETARY PLASMA TAIL — the ion (Type I) tail of a comet, blown
         anti-sunward by the solar wind. Distinct from the dust tail: straight,
         thin, blue-white, with disconnection events and knots.
         Position: (0, -400, 900).
         Components:
           - Nucleus: small bright core
           - Coma: 300 pts spherical halo
           - Plasma tail: 800 pts streaming +Z (anti-sunward), straight
           - Knots: 6 bright knots propagating along tail
           - Disconnection event: periodic tail pinch that separates
           - Dust tail: 200 pts curved, yellow-white, curved off-axis
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("cometary-plasma-tail", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(0, -400, 900);
          scene.add(this._root);

          /* nucleus */
          this._nucleus = new THREE.Mesh(
            new THREE.SphereGeometry(4, 6, 4),
            new THREE.MeshBasicMaterial({ color: 0xaaaaaa })
          );
          this._root.add(this._nucleus);

          /* coma */
          var CN = 300;
          var cPts = new Float32Array(CN * 3);
          for (var ci = 0; ci < CN; ci++) {
            var cr2 = Math.random() * 18;
            var cp = Math.acos(2*Math.random()-1);
            var ca = Math.random()*2*Math.PI;
            cPts[ci*3  ] = cr2*Math.sin(cp)*Math.cos(ca);
            cPts[ci*3+1] = cr2*Math.cos(cp);
            cPts[ci*3+2] = cr2*Math.sin(cp)*Math.sin(ca) + cr2*0.3;
          }
          var cGeo = new THREE.BufferGeometry();
          cGeo.setAttribute("position", new THREE.BufferAttribute(cPts, 3));
          this._root.add(new THREE.Points(cGeo, new THREE.PointsMaterial({
            color: 0x99ccff, size: 2.0, transparent: true, opacity: 0.30,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* plasma tail */
          var PTN = 800;
          var ptPts = new Float32Array(PTN * 3);
          for (var pti = 0; pti < PTN; pti++) {
            var ptLen = (pti / PTN) * 200 + 5;
            var ptR = (1 - pti/PTN) * 3 + 0.5;
            var ptA = Math.random() * 2 * Math.PI;
            ptPts[pti*3  ] = ptR * Math.cos(ptA) + (Math.random()-0.5)*2;
            ptPts[pti*3+1] = ptR * Math.sin(ptA) + (Math.random()-0.5)*2;
            ptPts[pti*3+2] = ptLen;
          }
          var ptGeo = new THREE.BufferGeometry();
          ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPts, 3));
          this._ptMat = new THREE.PointsMaterial({
            color: 0x66aaff, size: 2.2, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(ptGeo, this._ptMat));

          /* knots */
          this._knots = [];
          for (var ki = 0; ki < 6; ki++) {
            var kn = new THREE.Mesh(
              new THREE.SphereGeometry(2, 5, 3),
              new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.80 })
            );
            kn.position.z = ki * 30 + 10;
            this._root.add(kn);
            this._knots.push({ mesh: kn, offset: ki * 30 });
          }

          /* dust tail (curved, off-axis, yellow) */
          var DTN = 200;
          var dtPts = new Float32Array(DTN * 3);
          for (var dti = 0; dti < DTN; dti++) {
            var dtLen = (dti / DTN) * 120;
            dtPts[dti*3  ] = -dtLen * 0.30 + (Math.random()-0.5)*8;
            dtPts[dti*3+1] = dtLen * 0.08 + (Math.random()-0.5)*8;
            dtPts[dti*3+2] = dtLen;
          }
          var dtGeo = new THREE.BufferGeometry();
          dtGeo.setAttribute("position", new THREE.BufferAttribute(dtPts, 3));
          this._root.add(new THREE.Points(dtGeo, new THREE.PointsMaterial({
            color: 0xffdd88, size: 2.5, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._ctTime = 0;
          console.log("[cometary-plasma-tail] loaded at (0,-400,900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._ctTime += dt;

          /* knots propagate along tail and loop */
          for (var ki = 0; ki < this._knots.length; ki++) {
            var k = this._knots[ki];
            k.mesh.position.z = ((this._ctTime * 20 + k.offset * 5) % 200) + 5;
            k.mesh.material.opacity = 0.60 + 0.30 * Math.sin(this._ctTime * 3 + ki);
          }

          /* disconnection event: periodic brief opacity drop in tail */
          var discoPhase = (this._ctTime % 8.0) / 8.0;
          var discoGlitch = discoPhase > 0.85 ? 0.10 : 0.55;
          this._ptMat.opacity = discoGlitch;

          /* nucleus pulse */
          var np = 0.8 + 0.2 * Math.sin(this._ctTime * 2.3);
          this._nucleus.scale.setScalar(np);

          this._root.rotation.z += 0.0003 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 35 injected! Lines:', lineCount);
