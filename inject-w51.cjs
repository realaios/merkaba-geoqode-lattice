'use strict';
// inject-w51.cjs — Wave 51: blazar-jet-knot + magnetar-wind-termination-shock
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("blazar-jet-knot"')) {
  console.log('Wave 51 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity heliopause-boundary></a-entity>';
const HTML_INSERT = `      <a-entity heliopause-boundary></a-entity>
      <!-- ── BLAZAR JET KNOT — superluminal knot in a relativistic AGN jet ── -->
      <a-entity blazar-jet-knot></a-entity>
      <!-- ── MAGNETAR WIND TERMINATION SHOCK — where magnetar wind meets SNR ── -->
      <a-entity magnetar-wind-termination-shock></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         BLAZAR JET KNOT — In a blazar the relativistic jet points almost
         directly at us. Bright knots (compact emission regions) in the jet
         appear to move superluminally (e.g. 3C 279 shows ~25c apparent speed)
         because the light travel time difference makes fast-moving plasma
         blobs seem to outrun light. We render the overall AGN + a luminous
         jet beam with several distinct knots moving outward.
         Position: (-400, 400, -900).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("blazar-jet-knot", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-400, 400, -900);
          scene.add(this._root);

          /* AGN core */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(6, 8, 6),
            new THREE.MeshBasicMaterial({
              color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          /* accretion disk */
          this._root.add(new THREE.Mesh(
            new THREE.RingGeometry(8, 22, 64),
            new THREE.MeshBasicMaterial({
              color: 0xff9900, transparent: true, opacity: 0.35,
              side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          /* jet beam — two cones pointing toward viewer */
          var jMat = new THREE.MeshBasicMaterial({
            color: 0x6699ff, transparent: true, opacity: 0.08,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          var jFront = new THREE.Mesh(new THREE.ConeGeometry(12, 200, 6, 1, true), jMat);
          jFront.position.set(0, 100, 0); jFront.rotation.x = Math.PI;
          this._root.add(jFront);
          var jBack = new THREE.Mesh(new THREE.ConeGeometry(8, 150, 6, 1, true), jMat.clone());
          jBack.position.set(0, -75, 0);
          this._root.add(jBack);

          /* knots — 4 bright blobs along jet */
          this._knots = [];
          var kColors = [0xffffff, 0xaaccff, 0x88aaff, 0x6699ff];
          for (var ki = 0; ki < 4; ki++) {
            var km = new THREE.Mesh(
              new THREE.SphereGeometry(3.5 - ki*0.5, 6, 4),
              new THREE.MeshBasicMaterial({
                color: kColors[ki], blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            km.position.y = 20 + ki * 35;
            this._root.add(km);
            this._knots.push({ mesh: km, baseY: 20 + ki * 35, speed: 0.4 + ki * 0.15 });
          }

          this._bjkTime = 0;
          console.log("[blazar-jet-knot] loaded at (-400,400,-900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._bjkTime += dt;

          /* move knots outward (superluminal apparent motion) */
          for (var ki = 0; ki < this._knots.length; ki++) {
            var k = this._knots[ki];
            k.mesh.position.y += k.speed * dt;
            if (k.mesh.position.y > 200) {
              k.mesh.position.y = k.baseY;
            }
            k.mesh.material.opacity = 0.5 + 0.5 * Math.abs(Math.sin(this._bjkTime * 2 + ki));
          }
        },
      });

      /* ====================================================================
         MAGNETAR WIND TERMINATION SHOCK — a magnetar spins down very rapidly,
         injecting a relativistic particle wind into its surrounding supernova
         remnant. Where this wind hits the slower SNR ejecta a termination
         shock forms, producing a torus-shaped synchrotron nebula (a "wind
         nebula") similar to the Crab but powered entirely by magnetism not
         rotation spin-down alone. We render the wind zone + termination shock
         torus + outer SNR shell.
         Position: (800, 0, -600).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("magnetar-wind-termination-shock", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(800, 0, -600);
          scene.add(this._root);

          /* magnetar central object */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(3, 8, 6),
            new THREE.MeshBasicMaterial({
              color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          /* wind zone: inner bright sphere */
          this._windSphere = new THREE.Mesh(
            new THREE.SphereGeometry(30, 10, 8),
            new THREE.MeshBasicMaterial({
              color: 0x88ccff, transparent: true, opacity: 0.08,
              blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
            })
          );
          this._root.add(this._windSphere);

          /* termination shock torus */
          this._tsTorus = new THREE.Mesh(
            new THREE.TorusGeometry(38, 8, 8, 60),
            new THREE.MeshBasicMaterial({
              color: 0x4488ff, transparent: true, opacity: 0.25,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._tsTorus.rotation.x = Math.PI / 2;
          this._root.add(this._tsTorus);

          /* wind nebula outer shell */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(70, 10, 8),
            new THREE.MeshBasicMaterial({
              color: 0x2244aa, transparent: true, opacity: 0.06,
              blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
            })
          ));

          /* SNR outer shell */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(120, 10, 8),
            new THREE.MeshBasicMaterial({
              color: 0x662200, transparent: true, opacity: 0.04,
              blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
            })
          ));

          /* particle wind streams — radial lines from centre */
          var wPts = new Float32Array(200 * 6);
          for (var wi = 0; wi < 200; wi++) {
            var wa = Math.random()*2*Math.PI, wp = Math.acos(2*Math.random()-1);
            var wr = 30 + Math.random()*40;
            var wx = Math.sin(wp)*Math.cos(wa), wy = Math.cos(wp), wz = Math.sin(wp)*Math.sin(wa);
            wPts[wi*6  ]=0; wPts[wi*6+1]=0; wPts[wi*6+2]=0;
            wPts[wi*6+3]=wr*wx; wPts[wi*6+4]=wr*wy; wPts[wi*6+5]=wr*wz;
          }
          var wGeo = new THREE.BufferGeometry();
          wGeo.setAttribute("position", new THREE.BufferAttribute(wPts, 3));
          this._wind = new THREE.LineSegments(wGeo, new THREE.LineBasicMaterial({
            color: 0x88aaff, transparent: true, opacity: 0.07,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._wind);

          this._mwtsTime = 0;
          console.log("[magnetar-wind-termination-shock] loaded at (800,0,-600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._mwtsTime += dt;
          this._tsTorus.rotation.z += 0.001 * dt;
          this._windSphere.material.opacity = 0.06 + 0.04*Math.abs(Math.sin(this._mwtsTime * 1.3));
          this._wind.material.opacity = 0.05 + 0.03*Math.abs(Math.sin(this._mwtsTime * 2.1));
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 51 injected! Lines:', lineCount);
