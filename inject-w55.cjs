'use strict';
// inject-w55.cjs — Wave 55: galactic-halo-stream + cosmic-reionization-bubble
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("galactic-halo-stream"')) {
  console.log('Wave 55 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity cosmic-void-watershed></a-entity>';
const HTML_INSERT = `      <a-entity cosmic-void-watershed></a-entity>
      <!-- ── GALACTIC HALO STREAM — Sagittarius-style tidal stellar stream ── -->
      <a-entity galactic-halo-stream></a-entity>
      <!-- ── COSMIC REIONIZATION BUBBLE — H II sphere around early quasar ── -->
      <a-entity cosmic-reionization-bubble></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         GALACTIC HALO STREAM — tidal stellar streams like the Sagittarius
         Stream wrap around the Milky Way. A dwarf galaxy falls into the
         gravity well of a larger host, gets tidally disrupted, and its stars
         disperse along a great-circle arc spanning the whole sky. SDSS found
         the Sgr stream spans ~340 degrees of the sky. We render a host galaxy
         + a trailing+leading arc of stream stars on elliptical orbits.
         Position: (-600, -100, 300).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("galactic-halo-stream", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-600, -100, 300);
          scene.add(this._root);

          /* host galaxy disk */
          this._root.add(new THREE.Mesh(
            new THREE.RingGeometry(0, 70, 60),
            new THREE.MeshBasicMaterial({
              color: 0xffeecc, transparent: true, opacity: 0.25,
              side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(12, 8, 6),
            new THREE.MeshBasicMaterial({
              color: 0xffeedd, transparent: true, opacity: 0.5,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          /* tidal stream — elliptical arc of stars */
          var NS = 600;
          var sPts = new Float32Array(NS * 3);
          for (var si = 0; si < NS; si++) {
            var sa = (si / NS) * Math.PI * 1.9 - Math.PI*0.45;
            /* elliptical orbit parameters a=200,b=130 */
            var ra = 200, rb = 130;
            var sx = ra * Math.cos(sa) + (Math.random()-0.5)*8;
            var sy = (Math.random()-0.5)*12;
            var sz = rb * Math.sin(sa) + (Math.random()-0.5)*8;
            sPts[si*3]=sx; sPts[si*3+1]=sy; sPts[si*3+2]=sz;
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(sPts, 3));
          this._stream = new THREE.Points(sGeo, new THREE.PointsMaterial({
            color: 0xddbbff, size: 2.5,
            transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._stream);

          /* dwarf galaxy remnant core */
          this._dwarf = new THREE.Mesh(
            new THREE.SphereGeometry(6, 5, 4),
            new THREE.MeshBasicMaterial({
              color: 0xccbbff, transparent: true, opacity: 0.6,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._dwarf.position.set(140, 0, 80);
          this._root.add(this._dwarf);

          this._ghsTime = 0;
          console.log("[galactic-halo-stream] loaded at (-600,-100,300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._ghsTime += dt;
          this._root.rotation.y += 0.00005 * dt;
          this._stream.material.opacity = 0.35 + 0.12 * Math.abs(Math.sin(this._ghsTime * 0.3));
        },
      });

      /* ====================================================================
         COSMIC REIONIZATION BUBBLE — during the Epoch of Reionization (z~6-12,
         roughly 400M-1B yr after the Big Bang) the first quasars and galaxies
         ionized spherical bubbles of neutral hydrogen around them. These
         Stromgren spheres expanded as ionizing photons escaped, eventually
         overlapping to fully reionize the universe. We render a quasar +
         its growing H II bubble + the neutral IGM fog outside.
         Position: (-100, 900, -700).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-reionization-bubble", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-100, 900, -700);
          scene.add(this._root);

          /* quasar core */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(5, 6, 5),
            new THREE.MeshBasicMaterial({
              color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          /* ionized bubble — inner clear region */
          this._bubble = new THREE.Mesh(
            new THREE.SphereGeometry(200, 10, 8),
            new THREE.MeshBasicMaterial({
              color: 0x6699ff, transparent: true, opacity: 0.04,
              blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
            })
          );
          this._root.add(this._bubble);

          /* ionization front shell */
          this._front = new THREE.Mesh(
            new THREE.SphereGeometry(202, 10, 8),
            new THREE.MeshBasicMaterial({
              color: 0x88aaff, transparent: true, opacity: 0.07,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._front);

          /* neutral IGM fog outside bubble */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(280, 8, 7),
            new THREE.MeshBasicMaterial({
              color: 0xaa4400, transparent: true, opacity: 0.02,
              blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
            })
          ));

          /* Ly-alpha photons — spokes radiating outward */
          var PH = 30;
          var phPts = new Float32Array(PH * 6);
          for (var pi = 0; pi < PH; pi++) {
            var pa = Math.random()*2*Math.PI, pp = Math.acos(2*Math.random()-1);
            var pxn = Math.sin(pp)*Math.cos(pa), pyn = Math.cos(pp), pzn = Math.sin(pp)*Math.sin(pa);
            phPts[pi*6  ]=5*pxn; phPts[pi*6+1]=5*pyn; phPts[pi*6+2]=5*pzn;
            phPts[pi*6+3]=195*pxn; phPts[pi*6+4]=195*pyn; phPts[pi*6+5]=195*pzn;
          }
          var phGeo = new THREE.BufferGeometry();
          phGeo.setAttribute("position", new THREE.BufferAttribute(phPts, 3));
          this._photons = new THREE.LineSegments(phGeo, new THREE.LineBasicMaterial({
            color: 0xaabbff, transparent: true, opacity: 0.05,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._photons);

          this._crbScale = 1.0;
          this._crbTime = 0;
          console.log("[cosmic-reionization-bubble] loaded at (-100,900,-700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._crbTime += dt;
          /* slow bubble expansion */
          this._crbScale += 0.000008 * dt;
          if (this._crbScale > 1.15) this._crbScale = 1.0;
          this._bubble.scale.set(this._crbScale, this._crbScale, this._crbScale);
          this._front.scale.set(this._crbScale, this._crbScale, this._crbScale);
          this._photons.material.opacity = 0.03 + 0.03*Math.abs(Math.sin(this._crbTime * 2.5));
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 55 injected! Lines:', lineCount);
