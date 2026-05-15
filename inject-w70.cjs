'use strict';
// inject-w70.cjs — Wave 70: magnetar-quasi-periodic-eruption + interstellar-bow-shock-nebula
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("magnetar-quasi-periodic-eruption"')) {
  console.log('Wave 70 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity cosmic-ram-pressure-stripping></a-entity>';
const HTML_INSERT = `      <a-entity cosmic-ram-pressure-stripping></a-entity>
      <!-- ── MAGNETAR QUASI-PERIODIC ERUPTION — crustal fractures firing periodically ── -->
      <a-entity magnetar-quasi-periodic-eruption></a-entity>
      <!-- ── INTERSTELLAR BOW SHOCK NEBULA — wind-blown cavity meeting ISM ── -->
      <a-entity interstellar-bow-shock-nebula></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         MAGNETAR QUASI-PERIODIC ERUPTION — soft-gamma repeaters (SGRs) emit
         bursts at irregular but statistically quasi-periodic intervals from
         magnetar starquakes — crustal fractures propagating along the
         ultra-strong field (10^15 G). We show a highly magnetized neutron
         star with a twisted dipole field, and periodic gamma-ray burst jets
         firing at random intervals, plus an expanding hot plasma halo.
         Position: (-1000, 400, 900).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("magnetar-quasi-periodic-eruption", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-1000, 400, 900);
          scene.add(this._root);

          /* magnetar body */
          this._mStar = new THREE.Mesh(
            new THREE.SphereGeometry(7, 12, 12),
            new THREE.MeshBasicMaterial({
              color: 0x00eeff, transparent: true, opacity: 0.85,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._mStar);

          /* twisted dipole field lines */
          var NF = 12;
          this._fieldLines = [];
          for (var fi = 0; fi < NF; fi++) {
            var fPts = [];
            var fphi0 = (fi/NF)*2*Math.PI;
            for (var fk = 0; fk <= 60; fk++) {
              var ftheta = (fk/60)*Math.PI;
              var r = 30*Math.sin(ftheta)*Math.sin(ftheta);
              var twist = ftheta*0.4 + fphi0;
              fPts.push(new THREE.Vector3(
                r*Math.sin(ftheta)*Math.cos(twist),
                r*Math.cos(ftheta),
                r*Math.sin(ftheta)*Math.sin(twist)
              ));
            }
            var fGeo = new THREE.BufferGeometry().setFromPoints(fPts);
            var fLine = new THREE.Line(fGeo, new THREE.LineBasicMaterial({
              color: 0x0099ff, transparent: true, opacity: 0.3,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(fLine);
            this._fieldLines.push(fLine);
          }

          /* eruption burst — two opposed jets */
          this._burstN = new THREE.Mesh(
            new THREE.ConeGeometry(4, 40, 6),
            new THREE.MeshBasicMaterial({
              color: 0xff3300, transparent: true, opacity: 0,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._burstN.position.y = 22;
          this._root.add(this._burstN);

          this._burstS = new THREE.Mesh(
            new THREE.ConeGeometry(4, 40, 6),
            new THREE.MeshBasicMaterial({
              color: 0xff5500, transparent: true, opacity: 0,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._burstS.rotation.z = Math.PI;
          this._burstS.position.y = -22;
          this._root.add(this._burstS);

          /* hot halo */
          this._halo = new THREE.Mesh(
            new THREE.SphereGeometry(50, 8, 8),
            new THREE.MeshBasicMaterial({
              color: 0xff2200, transparent: true, opacity: 0.02,
              blending: THREE.AdditiveBlending, depthWrite: false, wireframe: true,
            })
          );
          this._root.add(this._halo);

          this._mqeTime = 0;
          this._nextEruption = 3 + Math.random()*5;
          this._eruptionProgress = -1;
          console.log("[magnetar-quasi-periodic-eruption] loaded at (-1000,400,900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._mqeTime += dt;
          var t = this._mqeTime;

          /* field line pulse */
          for (var fi = 0; fi < this._fieldLines.length; fi++) {
            this._fieldLines[fi].material.opacity = 0.2 + 0.15*Math.sin(t*4 + fi);
          }

          /* eruption trigger */
          if (this._eruptionProgress < 0 && t > this._nextEruption) {
            this._eruptionProgress = 0;
          }
          if (this._eruptionProgress >= 0) {
            this._eruptionProgress += dt * 1.2;
            var ep = this._eruptionProgress;
            var glow = ep < 0.5 ? ep*2 : 2 - ep*2;
            glow = Math.max(0, glow);
            this._burstN.material.opacity = glow * 0.7;
            this._burstS.material.opacity = glow * 0.7;
            this._mStar.material.opacity = 0.7 + glow*0.3;
            this._halo.material.opacity = 0.01 + glow*0.05;
            if (ep >= 1) {
              this._eruptionProgress = -1;
              this._nextEruption = t + 4 + Math.random()*8;
            }
          }
          this._root.rotation.y += 0.0002*dt;
        },
      });

      /* ====================================================================
         INTERSTELLAR BOW SHOCK NEBULA — formed when winds from a massive
         star collide with the ambient ISM at relative velocity. Creates an
         elongated infrared nebula with a symmetric bow ahead of the star and
         a diffuse wake behind. Distinct from jellyfish: this is wind-driven
         not ram-pressure driven. Shows the wind terminal shock + ISM shell.
         Position: (1200, -300, -400).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("interstellar-bow-shock-nebula", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(1200, -300, -400);
          scene.add(this._root);

          /* OB star */
          this._obStar = new THREE.Mesh(
            new THREE.SphereGeometry(9, 10, 10),
            new THREE.MeshBasicMaterial({
              color: 0xaaddff, transparent: true, opacity: 0.9,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._obStar);

          /* wind bubble — sphere of constant stellar wind */
          this._windBubble = new THREE.Mesh(
            new THREE.SphereGeometry(32, 10, 10),
            new THREE.MeshBasicMaterial({
              color: 0x4499ff, transparent: true, opacity: 0.04,
              blending: THREE.AdditiveBlending, depthWrite: false, wireframe: true,
            })
          );
          this._root.add(this._windBubble);

          /* ISM bow shock shell — parametric paraboloid surface */
          var NTHETA = 30;
          var NPHI2  = 40;
          var R1 = 55; // standoff radius
          var ibPts = [];
          for (var ib = 0; ib < NTHETA; ib++) {
            for (var ij = 0; ij <= NPHI2; ij++) {
              var theta = (ib/NTHETA)*Math.PI*0.85;
              var phi2  = (ij/NPHI2)*2*Math.PI;
              /* theta=0 ahead (upstream, -x), theta→pi sides */
              var r2 = R1/(1 + Math.cos(theta));
              if (r2 > 300) continue;
              ibPts.push(new THREE.Vector3(
                -r2*Math.cos(theta),
                r2*Math.sin(theta)*Math.cos(phi2),
                r2*Math.sin(theta)*Math.sin(phi2)
              ));
            }
          }
          var ibGeo = new THREE.BufferGeometry().setFromPoints(ibPts);
          this._ibShell = new THREE.Points(ibGeo, new THREE.PointsMaterial({
            color: 0xff8844, size: 2,
            transparent: true, opacity: 0.38,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._ibShell);

          /* dust grains — heated by UV upstream */
          var ND = 200;
          var dPts = new Float32Array(ND*3);
          this._ibDustPts = dPts;
          this._ibDustPhi = new Float32Array(ND);
          this._ibDustTheta = new Float32Array(ND);
          for (var di = 0; di < ND; di++) {
            this._ibDustTheta[di] = Math.random()*Math.PI*0.7;
            this._ibDustPhi[di] = Math.random()*2*Math.PI;
          }
          var dGeo = new THREE.BufferGeometry();
          dGeo.setAttribute("position", new THREE.BufferAttribute(dPts, 3));
          this._ibDust = new THREE.Points(dGeo, new THREE.PointsMaterial({
            color: 0xffcc66, size: 1.5,
            transparent: true, opacity: 0.3,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._ibDust);

          this._ibsTime = 0;
          this._ND_ib = ND;
          console.log("[interstellar-bow-shock-nebula] loaded at (1200,-300,-400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._ibsTime += dt;
          var t = this._ibsTime;
          this._windBubble.material.opacity = 0.03 + 0.015*Math.sin(t*1.7);
          this._ibShell.material.opacity = 0.35 + 0.05*Math.sin(t*2.1);
          /* dust drifts slightly along shell */
          var R1 = 55;
          for (var di = 0; di < this._ND_ib; di++) {
            this._ibDustPhi[di] += 0.02*dt;
            var theta = this._ibDustTheta[di];
            var phi2 = this._ibDustPhi[di];
            var r2 = R1/(1 + Math.cos(theta));
            this._ibDustPts[di*3  ] = -r2*Math.cos(theta) + (Math.random()-0.5)*3;
            this._ibDustPts[di*3+1] = r2*Math.sin(theta)*Math.cos(phi2);
            this._ibDustPts[di*3+2] = r2*Math.sin(theta)*Math.sin(phi2);
          }
          this._ibDust.geometry.attributes.position.needsUpdate = true;
          this._root.rotation.y += 0.00003*dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 70 injected! Lines:', lineCount);
