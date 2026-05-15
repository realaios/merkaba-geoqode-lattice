'use strict';
// inject-w52.cjs — Wave 52: cosmic-baryon-acoustic-feature + polar-ring-galaxy
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-baryon-acoustic-feature"')) {
  console.log('Wave 52 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity magnetar-wind-termination-shock></a-entity>';
const HTML_INSERT = `      <a-entity magnetar-wind-termination-shock></a-entity>
      <!-- ── COSMIC BARYON ACOUSTIC FEATURE — BAO shell at ~150 Mpc ── -->
      <a-entity cosmic-baryon-acoustic-feature></a-entity>
      <!-- ── POLAR RING GALAXY — galaxy with perpendicular gas+star ring ── -->
      <a-entity polar-ring-galaxy></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC BARYON ACOUSTIC FEATURE — shortly after the Big Bang, a sonic
         wave propagated outward through the baryon-photon fluid at ~half the
         speed of light, freezing at recombination (~380,000 yr) at a comoving
         radius of ~150 Mpc (489 million light-years). This BAO "standard ruler"
         appears as a subtle overdensity ring in galaxy surveys (SDSS/BOSS/DESI).
         We render it as a faint overdense shell with galaxy-cluster nodes along
         the ring.
         Position: (0, -800, -500). Scale: enormous.
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("cosmic-baryon-acoustic-feature", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(0, -800, -500);
          scene.add(this._root);

          /* BAO shell — large faint sphere */
          this._baoShell = new THREE.Mesh(
            new THREE.SphereGeometry(400, 12, 10),
            new THREE.MeshBasicMaterial({
              color: 0x3355aa, transparent: true, opacity: 0.03,
              side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._baoShell);

          /* shell rim: brighter torus at equator representing overdensity ring */
          this._root.add(new THREE.Mesh(
            new THREE.TorusGeometry(400, 6, 5, 120),
            new THREE.MeshBasicMaterial({
              color: 0x4466cc, transparent: true, opacity: 0.06,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          /* cluster nodes along the shell */
          var CN = 40;
          for (var ci = 0; ci < CN; ci++) {
            var ca = Math.random()*2*Math.PI, cp = Math.acos(2*Math.random()-1);
            var cxn = Math.sin(cp)*Math.cos(ca), cyn = Math.cos(cp), czn = Math.sin(cp)*Math.sin(ca);
            var clust = new THREE.Mesh(
              new THREE.SphereGeometry(4 + Math.random()*6, 4, 3),
              new THREE.MeshBasicMaterial({
                color: 0x8899ff, transparent: true, opacity: 0.25 + Math.random()*0.15,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            clust.position.set(400*cxn, 400*cyn, 400*czn);
            this._root.add(clust);
          }

          this._baofTime = 0;
          console.log("[cosmic-baryon-acoustic-feature] loaded at (0,-800,-500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._baofTime += dt;
          /* very slow expansion of the shell to simulate Hubble flow */
          var sc = 1.0 + this._baofTime * 0.00001;
          this._baoShell.scale.set(sc, sc, sc);
        },
      });

      /* ====================================================================
         POLAR RING GALAXY — a rare class of galaxy (e.g. NGC 4650A, Hoag's
         Object) where a ring of gas, dust and stars orbits perpendicular to
         the main disk. Likely formed by a galaxy merger or tidally captured
         gas. Two distinct structural components: a central lenticular/elliptical
         host and an outer polar ring nearly at 90 degrees.
         Position: (-900, 300, 400).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("polar-ring-galaxy", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-900, 300, 400);
          scene.add(this._root);

          /* host galaxy: inner disk */
          this._hostDisk = new THREE.Mesh(
            new THREE.RingGeometry(0, 60, 64),
            new THREE.MeshBasicMaterial({
              color: 0xffcc88, transparent: true, opacity: 0.30,
              side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._hostDisk.rotation.x = 0.35;
          this._root.add(this._hostDisk);

          /* host bulge */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(14, 8, 6),
            new THREE.MeshBasicMaterial({
              color: 0xffddaa, transparent: true, opacity: 0.40,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          /* polar ring: torus at 90 deg to host */
          this._polarRing = new THREE.Mesh(
            new THREE.TorusGeometry(90, 9, 8, 120),
            new THREE.MeshBasicMaterial({
              color: 0x88ccff, transparent: true, opacity: 0.22,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._polarRing.rotation.y = Math.PI / 2; /* perpendicular */
          this._root.add(this._polarRing);

          /* ring star clusters */
          for (var ri = 0; ri < 20; ri++) {
            var ra = (ri / 20) * 2 * Math.PI;
            var rClust = new THREE.Mesh(
              new THREE.SphereGeometry(2.5, 4, 3),
              new THREE.MeshBasicMaterial({
                color: 0xaaddff, blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            rClust.position.set(0, 90*Math.sin(ra), 90*Math.cos(ra));
            this._root.add(rClust);
          }

          this._prgTime = 0;
          console.log("[polar-ring-galaxy] loaded at (-900,300,400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._prgTime += dt;
          /* ring rotates around the host */
          this._polarRing.rotation.x += 0.00012 * dt;
          /* host disk slow spin */
          this._hostDisk.rotation.z += 0.00008 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 52 injected! Lines:', lineCount);
