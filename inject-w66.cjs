'use strict';
// inject-w66.cjs — Wave 66: supercooled-neutron-superfluid + cosmic-vortex-sheet
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("supercooled-neutron-superfluid"')) {
  console.log('Wave 66 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity binary-pulsar-periastron-advance></a-entity>';
const HTML_INSERT = `      <a-entity binary-pulsar-periastron-advance></a-entity>
      <!-- ── SUPERCOOLED NEUTRON SUPERFLUID — quantized vortex array in NS core ── -->
      <a-entity supercooled-neutron-superfluid></a-entity>
      <!-- ── COSMIC VORTEX SHEET — large-scale vortex sheet at galaxy cluster boundary ── -->
      <a-entity cosmic-vortex-sheet></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         SUPERCOOLED NEUTRON SUPERFLUID — the inner crust and outer core of a
         neutron star contain superfluid neutrons (T << Tc ~5×10^9 K). Rotation
         is supported by an array of quantized vortex lines, each carrying one
         quantum of circulation (h/2m_n). When the star spins down, vortices must
         migrate outward. Vortex pinning and catastrophic unpinning drives pulsar
         glitches (sudden spin-up). We visualize the quantized vortex lattice as
         a rotating hexagonal array inside a neutron star cross-section.
         Position: (1200, 200, 400).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("supercooled-neutron-superfluid", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(1200, 200, 400);
          scene.add(this._root);

          /* NS crust disk */
          this._crust = new THREE.Mesh(
            new THREE.CylinderGeometry(50, 50, 6, 32),
            new THREE.MeshBasicMaterial({
              color: 0x3355aa, transparent: true, opacity: 0.2,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._crust);

          /* dense core */
          this._core = new THREE.Mesh(
            new THREE.CylinderGeometry(32, 32, 8, 24),
            new THREE.MeshBasicMaterial({
              color: 0x6688ff, transparent: true, opacity: 0.1,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._core);

          /* quantized vortex lines — hexagonal lattice */
          var spacing = 8;
          var rows = 6;
          this._vortexLines = [];
          for (var ry = -rows; ry <= rows; ry++) {
            for (var rx = -rows; rx <= rows; rx++) {
              var vx = rx*spacing + (ry%2)*spacing*0.5;
              var vz = ry*spacing*0.866;
              if (Math.sqrt(vx*vx+vz*vz) > 46) continue;
              var vPts = new Float32Array(2*3);
              vPts[0]=vx; vPts[1]=-5; vPts[2]=vz;
              vPts[3]=vx; vPts[4]= 5; vPts[5]=vz;
              var vGeo = new THREE.BufferGeometry();
              vGeo.setAttribute("position", new THREE.BufferAttribute(vPts, 3));
              var vLine = new THREE.Line(vGeo, new THREE.LineBasicMaterial({
                color: 0x88ddff,
                transparent: true, opacity: 0.5,
                blending: THREE.AdditiveBlending, depthWrite: false,
              }));
              this._root.add(vLine);
              this._vortexLines.push({ line: vLine, bx: vx, bz: vz, phase: Math.random()*2*Math.PI });
            }
          }

          /* glitch flash mesh */
          this._glitch = new THREE.Mesh(
            new THREE.SphereGeometry(55, 6, 5),
            new THREE.MeshBasicMaterial({
              color: 0xffffff, transparent: true, opacity: 0,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._glitch);

          this._snfTime = 0;
          this._glitchTimer = 0;
          this._glitchInterval = 12;
          console.log("[supercooled-neutron-superfluid] loaded at (1200,200,400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._snfTime += dt;
          this._glitchTimer += dt;
          /* slow NS rotation */
          this._root.rotation.y += 0.0003*dt;
          /* vortex shimmer */
          for (var vi = 0; vi < this._vortexLines.length; vi++) {
            var vl = this._vortexLines[vi];
            vl.line.material.opacity = 0.35 + 0.2*Math.abs(Math.sin(this._snfTime*1.5 + vl.phase));
          }
          /* glitch pulse */
          if (this._glitchTimer > this._glitchInterval) {
            this._glitchTimer = 0;
            this._glitchInterval = 8 + Math.random()*10;
          }
          var gp = this._glitchTimer < 0.8 ? this._glitchTimer/0.8 : 0;
          this._glitch.material.opacity = 0.15 * Math.abs(Math.sin(gp*Math.PI));
        },
      });

      /* ====================================================================
         COSMIC VORTEX SHEET — at the interface between galaxy clusters and
         filaments, large-scale vortex sheets form from the Kelvin-Helmholtz
         instability at shear layers. These megaparsec-scale features have been
         detected in X-ray cluster observations (cold fronts). We render a
         sinusoidal rolling sheet of plasma with particle tracers flowing
         along shear streamlines.
         Position: (-900, -300, -1000).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("cosmic-vortex-sheet", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-900, -300, -1000);
          scene.add(this._root);

          /* rolling sheet surface */
          var SX = 30;
          var SY = 20;
          var shPts = new Float32Array(SX*SY*3);
          this._shPts = shPts;
          var idx = 0;
          for (var syi = 0; syi < SY; syi++) {
            for (var sxi = 0; sxi < SX; sxi++) {
              var sx = (sxi/(SX-1)-0.5)*300;
              var sy = (syi/(SY-1)-0.5)*200;
              shPts[idx*3  ] = sx;
              shPts[idx*3+1] = sy;
              shPts[idx*3+2] = 0;
              idx++;
            }
          }
          var shGeo = new THREE.BufferGeometry();
          shGeo.setAttribute("position", new THREE.BufferAttribute(shPts, 3));
          this._sheet = new THREE.Points(shGeo, new THREE.PointsMaterial({
            color: 0x44aacc, size: 1.5,
            transparent: true, opacity: 0.18,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._sheet);
          this._SX = SX; this._SY = SY;
          this._shBase = [];
          for (var i = 0; i < shPts.length; i++) this._shBase.push(shPts[i]);

          /* streamline tracers — particles flowing along shear */
          var NT = 200;
          var tPts = new Float32Array(NT*3);
          this._tPts = tPts;
          this._tPhase = new Float32Array(NT);
          this._tY = new Float32Array(NT);
          for (var ti = 0; ti < NT; ti++) {
            this._tPhase[ti] = Math.random();
            this._tY[ti] = (Math.random()-0.5)*200;
            tPts[ti*3  ] = (Math.random()-0.5)*300;
            tPts[ti*3+1] = this._tY[ti];
            tPts[ti*3+2] = (Math.random()-0.5)*30;
          }
          var tGeo = new THREE.BufferGeometry();
          tGeo.setAttribute("position", new THREE.BufferAttribute(tPts, 3));
          this._tracers = new THREE.Points(tGeo, new THREE.PointsMaterial({
            color: 0xffaa44, size: 2,
            transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._tracers);

          this._cvsTime = 0;
          console.log("[cosmic-vortex-sheet] loaded at (-900,-300,-1000)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cvsTime += dt;
          var SX = this._SX; var SY = this._SY;
          var t = this._cvsTime;
          /* KH roll-up: sinusoidal ripple that grows */
          var amp = 18 * Math.abs(Math.sin(t*0.12));
          for (var syi = 0; syi < SY; syi++) {
            for (var sxi = 0; sxi < SX; sxi++) {
              var bi = (syi*SX+sxi)*3;
              var sx = this._shBase[bi];
              this._shPts[bi+2] = amp * Math.sin(sx*0.04 + t*0.8);
            }
          }
          this._sheet.geometry.attributes.position.needsUpdate = true;
          /* streamline tracers drift in x */
          var NT = this._tPhase.length;
          for (var ti = 0; ti < NT; ti++) {
            this._tPhase[ti] = (this._tPhase[ti] + 0.04*dt) % 1;
            this._tPts[ti*3  ] = -150 + this._tPhase[ti]*300;
            this._tPts[ti*3+2] = 20 * Math.sin(this._tPts[ti*3]*0.05 + t*0.8);
          }
          this._tracers.geometry.attributes.position.needsUpdate = true;
          this._root.rotation.y += 0.00002*dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 66 injected! Lines:', lineCount);
