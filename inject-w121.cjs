'use strict';
// inject-w121.cjs — Wave 121: cosmic-cyclotron-maser-emission + stellar-post-flare-loop-arcade
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-cyclotron-maser-emission"')) {
  console.log('Wave 121 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-coronal-fan-spine-topology></a-entity>';
const HTML_INSERT = `      <a-entity stellar-coronal-fan-spine-topology></a-entity>
      <!-- ── COSMIC CYCLOTRON MASER EMISSION — coherent radio bursts from electron cyclotron resonance in stellar/planetary magnetospheres ── -->
      <a-entity cosmic-cyclotron-maser-emission></a-entity>
      <!-- ── STELLAR POST-FLARE LOOP ARCADE — rows of growing coronal loops lit up by chromospheric evaporation after a two-ribbon flare ── -->
      <a-entity stellar-post-flare-loop-arcade></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC CYCLOTRON MASER EMISSION — electrons spiraling along a
         converging magnetic field near a planetary or stellar polar cap
         develop a loss-cone distribution; the resulting electron-cyclotron
         maser emits intense coherent radio waves beamed along the magnetic
         axis — responsible for Jupiter's decametric bursts and stellar
         radio flares.
         Renders: rotating spiral beam cones ejected along a polar axis.
         Position: (-200, -900, -600).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-cyclotron-maser-emission", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-200, -900, -600);
          scene.add(this._root);

          var NBEAM50 = 3;
          this._beams = [];
          for (var bi50 = 0; bi50 < NBEAM50; bi50++) {
            var NP50 = 120;
            var bPts50 = new Float32Array(NP50*3);
            var bGeo50 = new THREE.BufferGeometry();
            bGeo50.setAttribute("position", new THREE.BufferAttribute(bPts50, 3));
            var bLine50 = new THREE.Line(bGeo50, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.75 + bi50*0.05, 1.0, 0.7),
              transparent: true, opacity: 0.6,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(bLine50);
            this._beams.push({ line: bLine50, pts: bPts50, dir: bi50%2===0?1:-1, phase: bi50*1.1 });
          }
          this._ccmeTime = 0;
          console.log("[cosmic-cyclotron-maser-emission] loaded at (-200,-900,-600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._ccmeTime += dt;
          var t = this._ccmeTime;
          for (var bi51 = 0; bi51 < this._beams.length; bi51++) {
            var bm = this._beams[bi51];
            var NP51 = bm.pts.length/3;
            for (var pi51 = 0; pi51 < NP51; pi51++) {
              var s51 = pi51/NP51;
              var r51 = s51 * 3.5;
              var th51 = s51 * 8 * Math.PI + t * 2 + bm.phase;
              bm.pts[pi51*3  ] = r51 * Math.cos(th51) * 0.4;
              bm.pts[pi51*3+1] = bm.dir * s51 * 6;
              bm.pts[pi51*3+2] = r51 * Math.sin(th51) * 0.4;
            }
            bm.line.geometry.attributes.position.needsUpdate = true;
            bm.line.material.opacity = 0.4 + 0.3*Math.abs(Math.sin(t*3 + bm.phase));
          }
        },
      });

      /* ====================================================================
         STELLAR POST-FLARE LOOP ARCADE — minutes to hours after a major
         solar two-ribbon flare, successive rows of coronal loops grow and
         cool as newly reconnected field lines retract upward, each loop
         glowing in hot EUV and then cooling through soft X-ray and UV.
         Renders: stack of semi-circular loops lit with hot-to-cool gradient.
         Position: (800, -500, 400).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-post-flare-loop-arcade", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(800, -500, 400);
          scene.add(this._root);

          var NLOOP50 = 10;
          this._loops = [];
          for (var li50 = 0; li50 < NLOOP50; li50++) {
            var NP50b = 80;
            var lPts50 = new Float32Array(NP50b*3);
            var lGeo50 = new THREE.BufferGeometry();
            lGeo50.setAttribute("position", new THREE.BufferAttribute(lPts50, 3));
            var hue50 = 0.62 - li50*0.04;
            var lLine50 = new THREE.Line(lGeo50, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(hue50, 1.0, 0.65),
              transparent: true, opacity: 0.4,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(lLine50);
            this._loops.push({ line: lLine50, pts: lPts50, R: 1.2 + li50*0.25, z: li50*0.4 - 2, birthT: li50*0.5, hue: hue50 });
          }
          this._spflaTime = 0;
          console.log("[stellar-post-flare-loop-arcade] loaded at (800,-500,400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._spflaTime += dt;
          var t = this._spflaTime;
          for (var li51 = 0; li51 < this._loops.length; li51++) {
            var lp = this._loops[li51];
            var age51 = Math.max(0, t - lp.birthT);
            var grow51 = Math.min(1, age51 * 0.5);
            var R51 = lp.R * grow51;
            var NP51b = lp.pts.length/3;
            for (var pi51b = 0; pi51b < NP51b; pi51b++) {
              var phi51 = (pi51b/NP51b)*Math.PI;
              lp.pts[pi51b*3  ] = R51*Math.cos(phi51);
              lp.pts[pi51b*3+1] = R51*Math.sin(phi51);
              lp.pts[pi51b*3+2] = lp.z;
            }
            lp.line.geometry.attributes.position.needsUpdate = true;
            lp.line.material.opacity = grow51 * (0.4 + 0.2*Math.sin(t + li51));
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 121 injected! Lines:', lineCount);
