'use strict';
// inject-w63.cjs — Wave 63: coronal-mass-ejection-flux + protoplanetary-ring-gap
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("coronal-mass-ejection-flux"')) {
  console.log('Wave 63 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity magnetized-accretion-column></a-entity>';
const HTML_INSERT = `      <a-entity magnetized-accretion-column></a-entity>
      <!-- ── CORONAL MASS EJECTION FLUX — plasma ejecta erupting from stellar corona ── -->
      <a-entity coronal-mass-ejection-flux></a-entity>
      <!-- ── PROTOPLANETARY RING GAP — planet-carved gap in dusty disk ── -->
      <a-entity protoplanetary-ring-gap></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         CORONAL MASS EJECTION FLUX — CMEs are magnetized plasma eruptions from
         the solar corona (or any stellar corona). They carry 10^12 kg of
         magnetized plasma at 250-3000 km/s. When earth-directed, CMEs cause
         geomagnetic storms (Dst index, aurora). The 1859 Carrington Event was
         a CME. We render a prominently twisted flux rope eruption with a
         piston-driven shock ahead and a spiral magnetic footpoint on the star.
         Position: (-1100, 200, -600).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("coronal-mass-ejection-flux", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-1100, 200, -600);
          scene.add(this._root);

          /* star */
          this._star = new THREE.Mesh(
            new THREE.SphereGeometry(20, 8, 7),
            new THREE.MeshBasicMaterial({
              color: 0xffdd44, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._star);

          /* twisted flux rope — helical tube */
          var FR = 80;
          var frPts = new Float32Array(FR * 3);
          for (var fi = 0; fi < FR; fi++) {
            var ft = fi/(FR-1);
            var fh = ft * 140 + 22;
            var fAngle = ft * 4*Math.PI;
            frPts[fi*3  ] = 12*Math.cos(fAngle);
            frPts[fi*3+1] = fh;
            frPts[fi*3+2] = 12*Math.sin(fAngle);
          }
          var frGeo = new THREE.BufferGeometry();
          frGeo.setAttribute("position", new THREE.BufferAttribute(frPts, 3));
          this._fluxRope = new THREE.Line(frGeo, new THREE.LineBasicMaterial({
            color: 0xff7700, transparent: true, opacity: 0.7,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._fluxRope);

          /* CME plasma particles streaming outward */
          var CP = 400;
          var cPts = new Float32Array(CP * 3);
          var cPhase = new Float32Array(CP);
          this._cmePts = cPts;
          this._cmePhase = cPhase;
          for (var ci = 0; ci < CP; ci++) {
            cPhase[ci] = Math.random();
            var cTh = (Math.random()-0.5)*0.9;
            var cPhi = (Math.random()-0.5)*0.9;
            var cR = 20 + cPhase[ci]*150;
            cPts[ci*3  ] = cR*Math.sin(cPhi)*Math.cos(cTh) + (Math.random()-0.5)*15;
            cPts[ci*3+1] = cR*Math.cos(cPhi) + 20;
            cPts[ci*3+2] = cR*Math.sin(cPhi)*Math.sin(cTh) + (Math.random()-0.5)*15;
            this._cmeDir = this._cmeDir || [];
            this._cmeDir.push(cPts[ci*3]/cR, cPts[ci*3+1]/cR, cPts[ci*3+2]/cR);
          }
          var cGeo = new THREE.BufferGeometry();
          cGeo.setAttribute("position", new THREE.BufferAttribute(cPts, 3));
          this._cmeCloud = new THREE.Points(cGeo, new THREE.PointsMaterial({
            color: 0xff9933, size: 2.5,
            transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._cmeCloud);

          /* shock hemisphere ahead */
          this._shock = new THREE.Mesh(
            new THREE.SphereGeometry(1, 8, 5, 0, Math.PI*2, 0, Math.PI*0.5),
            new THREE.MeshBasicMaterial({
              color: 0xaaddff, transparent: true, opacity: 0.05,
              blending: THREE.AdditiveBlending, depthWrite: false,
              side: THREE.BackSide,
            })
          );
          this._shockR = 40;
          this._root.add(this._shock);

          this._cmeTime = 0;
          console.log("[coronal-mass-ejection-flux] loaded at (-1100,200,-600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cmeTime += dt;
          /* advance particle phases */
          var CP = this._cmePhase.length;
          for (var ci = 0; ci < CP; ci++) {
            this._cmePhase[ci] = (this._cmePhase[ci] + 0.08*dt) % 1;
            var ph = this._cmePhase[ci];
            var cR = 20 + ph*160;
            var di = ci*3;
            this._cmePts[di  ] = this._cmeDir[di]*cR + (Math.random()-0.5)*10;
            this._cmePts[di+1] = this._cmeDir[di+1]*cR + (Math.random()-0.5)*10;
            this._cmePts[di+2] = this._cmeDir[di+2]*cR + (Math.random()-0.5)*10;
          }
          this._cmeCloud.geometry.attributes.position.needsUpdate = true;
          /* shock grows then resets */
          this._shockR += 1.5*dt;
          if (this._shockR > 220) this._shockR = 40;
          this._shock.scale.setScalar(this._shockR);
          this._shock.position.y = this._shockR * 0.8;
          /* flux rope twist */
          this._fluxRope.rotation.y += 0.0004*dt;
          this._root.rotation.y += 0.00006*dt;
        },
      });

      /* ====================================================================
         PROTOPLANETARY RING GAP — ALMA and SPHERE have revealed spectacular
         ring-gap structures in protoplanetary disks (HL Tau, AS 209, Elias 2-44).
         Planets orbiting at specific resonances clear dust gaps and trap pebbles
         in pressure bumps just outside, creating bright rings. This is direct
         evidence of planet formation in action. We render a disk with 3 gaps
         and bright adjacent rings, plus a forming planet in one gap.
         Position: (600, 700, -800).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("protoplanetary-ring-gap", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(600, 700, -800);
          scene.add(this._root);

          /* star */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(8, 7, 6),
            new THREE.MeshBasicMaterial({
              color: 0xffee99, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          /* dust disk as particle annuli — rings and gaps */
          var ringDefs = [
            { rMin:12, rMax:25, color: 0xffbb66, alpha: 0.55 },  // inner ring
            // gap at 25-32
            { rMin:32, rMax:48, color: 0xffcc77, alpha: 0.6 },   // ring B
            // gap at 48-57
            { rMin:57, rMax:75, color: 0xffdd88, alpha: 0.5 },   // ring C
            // gap at 75-83
            { rMin:83, rMax:105, color: 0xffcc55, alpha: 0.38 }, // outer ring
            { rMin:108, rMax:135, color: 0xff9933, alpha: 0.18 }, // diffuse outer
          ];

          this._disks = [];
          for (var ri = 0; ri < ringDefs.length; ri++) {
            var rd = ringDefs[ri];
            var NP = Math.round((rd.rMax-rd.rMin)*40);
            var dPts = new Float32Array(NP*3);
            for (var di = 0; di < NP; di++) {
              var dA = Math.random()*2*Math.PI;
              var dR = rd.rMin + Math.random()*(rd.rMax-rd.rMin);
              var dH = (Math.random()-0.5)*(2-0.008*dR);
              dPts[di*3  ] = dR*Math.cos(dA);
              dPts[di*3+1] = dH;
              dPts[di*3+2] = dR*Math.sin(dA);
            }
            var dGeo = new THREE.BufferGeometry();
            dGeo.setAttribute("position", new THREE.BufferAttribute(dPts, 3));
            var dMesh = new THREE.Points(dGeo, new THREE.PointsMaterial({
              color: rd.color, size: 1.5,
              transparent: true, opacity: rd.alpha,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(dMesh);
            this._disks.push(dMesh);
          }

          /* forming planet in gap 2 */
          this._planet = new THREE.Mesh(
            new THREE.SphereGeometry(3, 5, 4),
            new THREE.MeshBasicMaterial({
              color: 0x88aaff, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._planetAngle = 0;
          this._root.add(this._planet);

          this._prgTime = 0;
          console.log("[protoplanetary-ring-gap] loaded at (600,700,-800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._prgTime += dt;
          this._root.rotation.y += 0.00004*dt;
          /* orbit the forming planet around gap 2 */
          this._planetAngle += 0.08*dt;
          this._planet.position.set(52*Math.cos(this._planetAngle), 0, 52*Math.sin(this._planetAngle));
          this._planet.material.color.setHSL(
            0.6, 0.8, 0.4+0.15*Math.abs(Math.sin(this._prgTime*1.5))
          );
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 63 injected! Lines:', lineCount);
