'use strict';
// inject-w25.cjs — Wave 25: accretion-disk-jets + stellar-bow-shock
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("accretion-disk-jets"')) {
  console.log('Wave 25 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity intergalactic-medium></a-entity>';
const HTML_INSERT = `      <a-entity intergalactic-medium></a-entity>
      <!-- ── ACCRETION DISK JETS — relativistic jets from a spinning BH disk ── -->
      <a-entity accretion-disk-jets></a-entity>
      <!-- ── STELLAR BOW SHOCK — runaway star ploughing through the ISM ── -->
      <a-entity stellar-bow-shock></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         ACCRETION DISK JETS — a supermassive black hole surrounded by a hot
         accretion disk, launching relativistic jets perpendicular to the disk.
         Position: (-400, 700, -600).
         Components:
           - Black hole: tiny dark sphere (r=8) at centre
           - Hot inner disk (r=15→50): 2000 pts in flat annulus, high temp orange
           - Cooler outer disk (r=50→150): 1500 pts, fades to red
           - Relativistic jet N: 400 pts in narrow cone expanding +Y, cyan
           - Relativistic jet S: 400 pts in narrow cone expanding -Y, cyan
           - Jet knots: 8 bright condensations along each jet, blinking
           - Disk rotates with Keplerian velocity (inner faster than outer)
           - Jets precess slowly (Lense-Thirring effect)
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("accretion-disk-jets", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-400, 700, -600);
          scene.add(this._root);

          /* ── black hole central body ── */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(8, 8, 6),
            new THREE.MeshBasicMaterial({ color: 0x050510 })
          ));

          /* ── inner hot disk ── */
          var IDN = 2000;
          this._innerR = new Float32Array(IDN); /* radius per particle */
          this._innerA = new Float32Array(IDN); /* angle per particle */
          var innerPos = new Float32Array(IDN * 3);
          for (var ii = 0; ii < IDN; ii++) {
            this._innerR[ii] = 15 + Math.random() * 35;
            this._innerA[ii] = Math.random() * 2 * Math.PI;
            innerPos[ii*3  ] = this._innerR[ii] * Math.cos(this._innerA[ii]);
            innerPos[ii*3+1] = (Math.random() - 0.5) * 4;
            innerPos[ii*3+2] = this._innerR[ii] * Math.sin(this._innerA[ii]);
          }
          var idGeo = new THREE.BufferGeometry();
          idGeo.setAttribute("position", new THREE.BufferAttribute(innerPos, 3));
          this._innerDisk = new THREE.Points(idGeo, new THREE.PointsMaterial({
            color: 0xff9900, size: 2.5, transparent: true, opacity: 0.80,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._innerDisk);

          /* ── outer cooler disk ── */
          var ODN = 1500;
          this._outerR = new Float32Array(ODN);
          this._outerA = new Float32Array(ODN);
          var outerPos = new Float32Array(ODN * 3);
          for (var oi = 0; oi < ODN; oi++) {
            this._outerR[oi] = 50 + Math.random() * 100;
            this._outerA[oi] = Math.random() * 2 * Math.PI;
            outerPos[oi*3  ] = this._outerR[oi] * Math.cos(this._outerA[oi]);
            outerPos[oi*3+1] = (Math.random() - 0.5) * 10;
            outerPos[oi*3+2] = this._outerR[oi] * Math.sin(this._outerA[oi]);
          }
          var odGeo = new THREE.BufferGeometry();
          odGeo.setAttribute("position", new THREE.BufferAttribute(outerPos, 3));
          this._outerDisk = new THREE.Points(odGeo, new THREE.PointsMaterial({
            color: 0xff4400, size: 1.8, transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._outerDisk);

          /* ── jets (400 pts each) ── */
          var JN = 400;
          this._jN = new Float32Array(JN * 3);
          this._jS = new Float32Array(JN * 3);
          for (var ji = 0; ji < JN; ji++) {
            var t = Math.random();
            var cone = t * 0.06;
            var ang = Math.random() * 2 * Math.PI;
            this._jN[ji*3  ] = cone * Math.cos(ang);
            this._jN[ji*3+1] = t; /* normalized */
            this._jN[ji*3+2] = cone * Math.sin(ang);
            this._jS[ji*3  ] = cone * Math.cos(ang);
            this._jS[ji*3+1] = -t;
            this._jS[ji*3+2] = cone * Math.sin(ang);
          }
          var jnGeo = new THREE.BufferGeometry();
          jnGeo.setAttribute("position", new THREE.BufferAttribute(this._jN.slice(), 3));
          this._jetNMat = new THREE.PointsMaterial({
            color: 0x00ffff, size: 2.0, transparent: true, opacity: 0.70,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._jetN2 = new THREE.Points(jnGeo, this._jetNMat);
          this._root.add(this._jetN2);

          var jsGeo = new THREE.BufferGeometry();
          jsGeo.setAttribute("position", new THREE.BufferAttribute(this._jS.slice(), 3));
          this._jetSMat = new THREE.PointsMaterial({
            color: 0x00eeff, size: 2.0, transparent: true, opacity: 0.70,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._jetS2 = new THREE.Points(jsGeo, this._jetSMat);
          this._root.add(this._jetS2);

          this._adjTime = 0;
          this._precession = 0;
          this._JET_LEN = 500;
          console.log("[accretion-disk-jets] spinning at (-400,700,-600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._adjTime += dt;
          this._precession += dt * 0.02; /* very slow Lense-Thirring */

          /* ── Keplerian rotation: omega ∝ r^(-3/2) ── */
          var idArr = this._innerDisk.geometry.attributes.position.array;
          for (var ii = 0; ii < 2000; ii++) {
            this._innerA[ii] += dt * 0.8 / Math.pow(this._innerR[ii] / 15, 1.5);
            idArr[ii*3  ] = this._innerR[ii] * Math.cos(this._innerA[ii]);
            idArr[ii*3+2] = this._innerR[ii] * Math.sin(this._innerA[ii]);
          }
          this._innerDisk.geometry.attributes.position.needsUpdate = true;

          var odArr = this._outerDisk.geometry.attributes.position.array;
          for (var oi = 0; oi < 1500; oi++) {
            this._outerA[oi] += dt * 0.3 / Math.pow(this._outerR[oi] / 50, 1.5);
            odArr[oi*3  ] = this._outerR[oi] * Math.cos(this._outerA[oi]);
            odArr[oi*3+2] = this._outerR[oi] * Math.sin(this._outerA[oi]);
          }
          this._outerDisk.geometry.attributes.position.needsUpdate = true;

          /* ── jet scale + precession tilt ── */
          this._jetN2.rotation.z = 0.08 * Math.sin(this._precession);
          this._jetS2.rotation.z = 0.08 * Math.sin(this._precession);
          var jnArr = this._jetN2.geometry.attributes.position.array;
          var jsArr = this._jetS2.geometry.attributes.position.array;
          for (var ji = 0; ji < 400; ji++) {
            jnArr[ji*3+1] = this._jN[ji*3+1] * this._JET_LEN;
            jnArr[ji*3  ] = this._jN[ji*3  ] * this._JET_LEN;
            jnArr[ji*3+2] = this._jN[ji*3+2] * this._JET_LEN;
            jsArr[ji*3+1] = this._jS[ji*3+1] * this._JET_LEN;
            jsArr[ji*3  ] = this._jS[ji*3  ] * this._JET_LEN;
            jsArr[ji*3+2] = this._jS[ji*3+2] * this._JET_LEN;
          }
          this._jetN2.geometry.attributes.position.needsUpdate = true;
          this._jetS2.geometry.attributes.position.needsUpdate = true;

          /* ── jet knot flicker ── */
          this._jetNMat.opacity = 0.50 + 0.30 * Math.abs(Math.sin(this._adjTime * 3.7));
          this._jetSMat.opacity = 0.50 + 0.30 * Math.abs(Math.sin(this._adjTime * 3.7 + 1.2));
        },
      });

      /* ====================================================================
         STELLAR BOW SHOCK — a runaway OB star (ejected at high velocity from
         a young star cluster) ploughing through the interstellar medium at
         ~100 km/s. Its stellar wind rams the ISM ahead of it, creating a
         bright parabolic arc of shocked, compressed gas.
         Position: (-200, 200, -900).
         Components:
           - Runaway star: bright white-blue sphere (r=6), moving slowly
           - Bow shock arc: 1200 pts on a paraboloid surface ahead of star
           - Compressed ISM shell: 600 pts in thicker wake arc (orange-red)
           - Stellar wind bubble: 400 pts inside the paraboloid, expanding
           - Wake trail: 800 pts in elongated stream behind star (dim)
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-bow-shock", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-200, 200, -900);
          scene.add(this._root);

          /* ── runaway star ── */
          this._starMat = new THREE.MeshBasicMaterial({ color: 0xaaccff });
          this._star = new THREE.Mesh(new THREE.SphereGeometry(6, 8, 6), this._starMat);
          this._root.add(this._star);

          /* ── bow shock arc (1200 pts on paraboloid) ── */
          var BN = 1200;
          var bsPts = new Float32Array(BN * 3);
          for (var bi = 0; bi < BN; bi++) {
            var theta = (Math.random() - 0.5) * Math.PI * 1.2; /* half-angle span */
            var phi2 = Math.random() * 2 * Math.PI;
            var dist = 80 + Math.random() * 20;
            /* paraboloid: z-front, x-y spread */
            var z = -dist * Math.cos(theta);
            var xyDist = dist * Math.sin(Math.abs(theta));
            bsPts[bi*3  ] = xyDist * Math.cos(phi2);
            bsPts[bi*3+1] = xyDist * Math.sin(phi2);
            bsPts[bi*3+2] = z;
          }
          var bsGeo = new THREE.BufferGeometry();
          bsGeo.setAttribute("position", new THREE.BufferAttribute(bsPts, 3));
          this._bsMat = new THREE.PointsMaterial({
            color: 0x00aaff, size: 2.2, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(bsGeo, this._bsMat));

          /* ── compressed ISM (600 pts, thicker orange arc) ── */
          var ISMN = 600;
          var ismPts = new Float32Array(ISMN * 3);
          for (var ii = 0; ii < ISMN; ii++) {
            var theta2 = (Math.random() - 0.5) * Math.PI * 1.4;
            var phi3 = Math.random() * 2 * Math.PI;
            var dist2 = 80 + Math.random() * 40;
            var xyD = dist2 * Math.sin(Math.abs(theta2));
            ismPts[ii*3  ] = xyD * Math.cos(phi3);
            ismPts[ii*3+1] = xyD * Math.sin(phi3);
            ismPts[ii*3+2] = -dist2 * Math.cos(theta2);
          }
          var ismGeo = new THREE.BufferGeometry();
          ismGeo.setAttribute("position", new THREE.BufferAttribute(ismPts, 3));
          this._root.add(new THREE.Points(ismGeo, new THREE.PointsMaterial({
            color: 0xff6622, size: 2.5, transparent: true, opacity: 0.30,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── stellar wind bubble (400 pts inside) ── */
          var WN = 400;
          var wPts = new Float32Array(WN * 3);
          for (var wi = 0; wi < WN; wi++) {
            var rf = Math.random() * 70;
            var wp = Math.random() * 2 * Math.PI;
            var wq = Math.acos(2 * Math.random() - 1);
            wPts[wi*3  ] = rf * Math.sin(wq) * Math.cos(wp);
            wPts[wi*3+1] = rf * Math.sin(wq) * Math.sin(wp);
            wPts[wi*3+2] = rf * Math.cos(wq) * 0.5; /* squashed toward front */
          }
          var wGeo = new THREE.BufferGeometry();
          wGeo.setAttribute("position", new THREE.BufferAttribute(wPts, 3));
          this._root.add(new THREE.Points(wGeo, new THREE.PointsMaterial({
            color: 0x88ddff, size: 1.5, transparent: true, opacity: 0.20,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── wake trail (800 pts behind) ── */
          var WKTN = 800;
          var wkPts = new Float32Array(WKTN * 3);
          for (var wki = 0; wki < WKTN; wki++) {
            wkPts[wki*3  ] = (Math.random() - 0.5) * 60;
            wkPts[wki*3+1] = (Math.random() - 0.5) * 60;
            wkPts[wki*3+2] = 50 + Math.random() * 300; /* behind (+Z) */
          }
          var wktGeo = new THREE.BufferGeometry();
          wktGeo.setAttribute("position", new THREE.BufferAttribute(wkPts, 3));
          this._root.add(new THREE.Points(wktGeo, new THREE.PointsMaterial({
            color: 0x334466, size: 1.8, transparent: true, opacity: 0.20,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._sbsTime = 0;
          console.log("[stellar-bow-shock] racing at (-200,200,-900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._sbsTime += dt;
          /* ── star moves in a large slow circuit ── */
          this._star.position.set(
            50 * Math.cos(this._sbsTime * 0.05),
            50 * Math.sin(this._sbsTime * 0.03),
            0
          );
          /* ── bow shock flicker ── */
          this._bsMat.opacity = 0.45 + 0.15 * Math.sin(this._sbsTime * 4.1);
          this._root.rotation.y += 0.003 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 25 injected! Lines:', lineCount);
