"use strict";
// inject-w49.cjs — Wave 49: superconducting-vortex-lattice + cosmic-neutrino-haze
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes('AFRAME.registerComponent("superconducting-vortex-lattice"')
) {
  console.log("Wave 49 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity stellar-age-gradient></a-entity>";
const HTML_INSERT = `      <a-entity stellar-age-gradient></a-entity>
      <!-- ── SUPERCONDUCTING VORTEX LATTICE — Abrikosov lattice in neutron star interior ── -->
      <a-entity superconducting-vortex-lattice></a-entity>
      <!-- ── COSMIC NEUTRINO HAZ — cosmic neutrino background streaming through everything ── -->
      <a-entity cosmic-neutrino-haze></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         SUPERCONDUCTING VORTEX LATTICE — inside a neutron star the protons
         form a Type-II superconductor. Magnetic flux is confined to an
         Abrikosov lattice of quantised vortex tubes arranged in a triangular
         lattice. Each vortex carries exactly one quantum of magnetic flux
         (flux quantum = h/2e). Visualized as a hexagonal lattice of bright
         flux tubes with a central magnetized core.
         Position: (600, -300, -200).
         Components:
           - Hexagonal Abrikosov lattice: ~37 flux tubes arranged in hex grid
           - Flux tube cores: bright glowing cylinders
           - Surrounding flux halo: soft aureole around each tube
           - Lattice rotation: slow precession of the whole lattice
           - Boundary Meissner zone: superconducting shell exterior
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("superconducting-vortex-lattice", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(600, -300, -200);
          scene.add(this._root);

          /* Abrikosov hex lattice of flux tubes */
          var HEX_R = 7; /* hex grid spacing (one flux quantum per cell) */
          var directions = [
            [0,0],
            [1,0],[Math.cos(Math.PI/3), Math.sin(Math.PI/3)],
            [-Math.cos(Math.PI/3), Math.sin(Math.PI/3)],
            [-1,0],[-Math.cos(Math.PI/3),-Math.sin(Math.PI/3)],
            [Math.cos(Math.PI/3),-Math.sin(Math.PI/3)],
          ];
          var offsets = [[0,0]];
          for (var di2 = 0; di2 < directions.length; di2++) {
            offsets.push([directions[di2][0]*HEX_R, directions[di2][1]*HEX_R]);
            offsets.push([directions[di2][0]*HEX_R*2, directions[di2][1]*HEX_R*2]);
            offsets.push([
              (directions[di2][0]+directions[(di2+1)%6][0])*HEX_R,
              (directions[di2][1]+directions[(di2+1)%6][1])*HEX_R
            ]);
          }
          for (var oi = 0; oi < offsets.length; oi++) {
            var ox = offsets[oi][0], oz = offsets[oi][1];
            /* flux tube core */
            var fCore = new THREE.Mesh(
              new THREE.CylinderGeometry(0.6, 0.6, 40, 5),
              new THREE.MeshBasicMaterial({
                color: 0x88ccff, transparent: true, opacity: 0.80,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            fCore.position.set(ox, 0, oz);
            this._root.add(fCore);
            /* halo */
            this._root.add(new THREE.Mesh(
              new THREE.CylinderGeometry(2.0, 2.0, 38, 6),
              new THREE.MeshBasicMaterial({
                color: 0x4466ff, transparent: true, opacity: 0.08,
                blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
              })
            ).position||0, (function(px,pz){ var m = new THREE.Mesh(
              new THREE.CylinderGeometry(2.0,2.0,38,6),
              new THREE.MeshBasicMaterial({color:0x4466ff,transparent:true,opacity:0.08,blending:THREE.AdditiveBlending,depthWrite:false})
            ); m.position.set(px,0,pz); this._root.add(m); }.bind(this))(ox, oz));
          }

          /* Meissner exterior shell */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(55, 8, 6),
            new THREE.MeshBasicMaterial({
              color: 0x2244aa, transparent: true, opacity: 0.04,
              side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          this._svlTime = 0;
          console.log("[superconducting-vortex-lattice] loaded at (600,-300,-200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._svlTime += dt;
          this._root.rotation.y += 0.00025 * dt;
        },
      });

      /* ====================================================================
         COSMIC NEUTRINO HAZ — the cosmic neutrino background (CNB) consists
         of ~336 relic neutrinos per cm³ from 1 second after the Big Bang.
         With energies of ~0.00017 eV they pass through all matter. Visualized
         as ghostly trajectories threading through space in every direction,
         with no scattering or absorption — a truly invisible sea made visible.
         Position: (0, 100, 0) — surrounds the viewer.
         Components:
           - Neutrino trajectories: 600 long ghost lines in random directions
           - Flavor oscillation halos: 3-colour (e/mu/tau) slow-changing rings
           - Phase-space sphere: outer neutrino sky sphere
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("cosmic-neutrino-haze", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(0, 100, 0);
          scene.add(this._root);

          /* neutrino trajectory lines */
          var NN = 600;
          var nPts = new Float32Array(NN * 6);
          for (var ni = 0; ni < NN; ni++) {
            var na = Math.random()*2*Math.PI;
            var np = Math.acos(2*Math.random()-1);
            var nx = Math.sin(np)*Math.cos(na);
            var ny = Math.cos(np);
            var nz = Math.sin(np)*Math.sin(na);
            var nr = 300 + Math.random()*200;
            /* line from -nr to +nr along direction */
            nPts[ni*6  ] = -nr*nx; nPts[ni*6+1] = -nr*ny; nPts[ni*6+2] = -nr*nz;
            nPts[ni*6+3] =  nr*nx; nPts[ni*6+4] =  nr*ny; nPts[ni*6+5] =  nr*nz;
          }
          var nGeo = new THREE.BufferGeometry();
          nGeo.setAttribute("position", new THREE.BufferAttribute(nPts, 3));
          this._neutrinos = new THREE.LineSegments(nGeo, new THREE.LineBasicMaterial({
            color: 0x88bbff, transparent: true, opacity: 0.04,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._neutrinos);

          /* flavor oscillation rings (e=blue, mu=green, tau=red) */
          this._flavors = [];
          var fColors = [0x4499ff, 0x44ff99, 0xff4499];
          var fRadii  = [80, 100, 120];
          for (var fi2 = 0; fi2 < 3; fi2++) {
            var fm = new THREE.Mesh(
              new THREE.TorusGeometry(fRadii[fi2], 1.5, 4, 80),
              new THREE.MeshBasicMaterial({
                color: fColors[fi2], transparent: true, opacity: 0.12,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            fm.rotation.x = Math.random()*Math.PI;
            fm.rotation.z = Math.random()*Math.PI;
            this._root.add(fm);
            this._flavors.push({ mesh: fm, phase: fi2*2.1 });
          }

          /* phase-space sky sphere */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(500, 6, 5),
            new THREE.MeshBasicMaterial({
              color: 0x112244, transparent: true, opacity: 0.015,
              side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          this._cnbTime = 0;
          console.log("[cosmic-neutrino-haze] loaded surrounding viewer");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cnbTime += dt;

          /* slow neutrino opacity flicker */
          this._neutrinos.material.opacity = 0.025 + 0.015*Math.abs(Math.sin(this._cnbTime * 0.3));

          /* flavor oscillation */
          for (var fi = 0; fi < this._flavors.length; fi++) {
            var f = this._flavors[fi];
            f.mesh.material.opacity = 0.06 + 0.06*Math.abs(Math.sin(this._cnbTime*0.7 + f.phase));
            f.mesh.rotation.y += 0.00005 * dt;
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 49 injected! Lines:", lineCount);
