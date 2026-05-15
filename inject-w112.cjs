'use strict';
// inject-w112.cjs — Wave 112: cosmic-magnetosonic-mach-cone + stellar-convective-overshoot-plume
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-magnetosonic-mach-cone"')) {
  console.log('Wave 112 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-differential-emission-measure></a-entity>';
const HTML_INSERT = `      <a-entity stellar-differential-emission-measure></a-entity>
      <!-- ── COSMIC MAGNETOSONIC MACH CONE — bow-shock cone in a magnetized plasma ahead of a supersonic body ── -->
      <a-entity cosmic-magnetosonic-mach-cone></a-entity>
      <!-- ── STELLAR CONVECTIVE OVERSHOOT PLUME — turbulent plume overstepping the convection-radiation boundary ── -->
      <a-entity stellar-convective-overshoot-plume></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC MAGNETOSONIC MACH CONE — a fast magnetosonic wave cone
         trailing a supersonic object in a magnetized plasma, distinct from
         a hydrodynamic Mach cone because the phase speed is anisotropic
         (depends on angle to B-field), producing an asymmetric cone.
         Renders: asymmetric cone of bright arc lines.
         Position: (-700, 0, 300).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-magnetosonic-mach-cone", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-700, 0, 300);
          scene.add(this._root);

          var NARC32 = 16;
          this._arcs = [];
          for (var ai32 = 0; ai32 < NARC32; ai32++) {
            var NAP32 = 60;
            var aPts32 = new Float32Array(NAP32*3);
            var aGeo32 = new THREE.BufferGeometry();
            aGeo32.setAttribute("position", new THREE.BufferAttribute(aPts32, 3));
            var aLine32 = new THREE.Line(aGeo32, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.55 + ai32*0.025, 1.0, 0.6),
              transparent: true, opacity: 0.4,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(aLine32);
            var dist32 = 1 + ai32*0.7;
            this._arcs.push({ line: aLine32, pts: aPts32, dist: dist32, phase: ai32*0.4 });
          }
          this._cmsmcTime = 0;
          console.log("[cosmic-magnetosonic-mach-cone] loaded at (-700,0,300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cmsmcTime += dt;
          var t = this._cmsmcTime;
          for (var ai33 = 0; ai33 < this._arcs.length; ai33++) {
            var arc = this._arcs[ai33];
            var NAP33 = arc.pts.length/3;
            for (var api33 = 0; api33 < NAP33; api33++) {
              var u = (api33/(NAP33-1))*Math.PI - Math.PI/2;
              var rA = arc.dist*(1 + 0.12*Math.sin(3*u + t*1.2 + arc.phase));
              arc.pts[api33*3  ] = -arc.dist*3 + arc.dist*api33/(NAP33-1)*3;
              arc.pts[api33*3+1] = rA*Math.sin(u)*0.5;
              arc.pts[api33*3+2] = rA*Math.cos(u);
            }
            arc.line.geometry.attributes.position.needsUpdate = true;
            arc.line.material.opacity = 0.35 + 0.15*Math.sin(t*2 + arc.phase);
          }
        },
      });

      /* ====================================================================
         STELLAR CONVECTIVE OVERSHOOT PLUME — fast convective plumes overshoot
         the formal convection-radiation boundary due to their momentum and
         penetrate into the stable radiative interior, mixing material and
         generating internal gravity waves.
         Renders: rising and bouncing bright column plumes.
         Position: (-100, -600, -200).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-convective-overshoot-plume", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-100, -600, -200);
          scene.add(this._root);

          var NPLM32 = 10;
          this._plumes = [];
          for (var pi32 = 0; pi32 < NPLM32; pi32++) {
            var NPH32 = 80;
            var pPts32 = new Float32Array(NPH32*3);
            var pGeo32 = new THREE.BufferGeometry();
            pGeo32.setAttribute("position", new THREE.BufferAttribute(pPts32, 3));
            var pLine32 = new THREE.Line(pGeo32, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.12 + pi32*0.03, 1.0, 0.7),
              transparent: true, opacity: 0.45,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(pLine32);
            var ox32 = (Math.random()-0.5)*6;
            var oz32 = (Math.random()-0.5)*6;
            this._plumes.push({ line: pLine32, pts: pPts32, ox: ox32, oz: oz32, phase: pi32*0.7 });
          }
          this._scopTime = 0;
          console.log("[stellar-convective-overshoot-plume] loaded at (-100,-600,-200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._scopTime += dt;
          var t = this._scopTime;
          for (var pi33 = 0; pi33 < this._plumes.length; pi33++) {
            var plm = this._plumes[pi33];
            var NPH33 = plm.pts.length/3;
            var yTop = 5 + 2*Math.sin(t*1.1 + plm.phase);
            for (var phi33 = 0; phi33 < NPH33; phi33++) {
              var sf33 = phi33/(NPH33-1);
              var y33 = sf33*yTop;
              var wid33 = 0.3*(1 - sf33)*Math.sin(sf33*Math.PI);
              plm.pts[phi33*3  ] = plm.ox + wid33*Math.sin(t*2 + plm.phase + sf33*4);
              plm.pts[phi33*3+1] = y33;
              plm.pts[phi33*3+2] = plm.oz + wid33*Math.cos(t*2 + plm.phase + sf33*4);
            }
            plm.line.geometry.attributes.position.needsUpdate = true;
            plm.line.material.opacity = 0.4 + 0.15*Math.sin(t*1.5 + plm.phase);
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 112 injected! Lines:', lineCount);
