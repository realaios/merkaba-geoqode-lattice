"use strict";
// inject-w107.cjs — Wave 107: cosmic-richtmyer-meshkov-instability + stellar-turbulent-convection-downdraft
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes(
    'AFRAME.registerComponent("cosmic-richtmyer-meshkov-instability"',
  )
) {
  console.log("Wave 107 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity stellar-helicity-flux-eruption></a-entity>";
const HTML_INSERT = `      <a-entity stellar-helicity-flux-eruption></a-entity>
      <!-- ── COSMIC RICHTMYER-MESHKOV INSTABILITY — interface rolls up after shock passage ── -->
      <a-entity cosmic-richtmyer-meshkov-instability></a-entity>
      <!-- ── STELLAR TURBULENT CONVECTION DOWNDRAFT — cool dense plumes plunging into stellar interior ── -->
      <a-entity stellar-turbulent-convection-downdraft></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC RICHTMYER-MESHKOV INSTABILITY — when a shock wave crosses a
         density interface (e.g. in a supernova), the interface is impulsively
         accelerated; even tiny perturbations roll up into mushroom-cap spikes
         and bubbles (RMI).
         Renders: a grid of mushroom-cap spike/bubble rolls at an interface plane.
         Position: (0, -300, 800).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-richtmyer-meshkov-instability", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(0, -300, 800);
          scene.add(this._root);

          var NSPK = 16;
          this._spikes = [];
          for (var si19 = 0; si19 < NSPK; si19++) {
            var NSP19 = 80;
            var sPts19 = new Float32Array(NSP19*3);
            var sGeo19 = new THREE.BufferGeometry();
            sGeo19.setAttribute("position", new THREE.BufferAttribute(sPts19, 3));
            var isSpike = si19%2===0;
            var sLine19 = new THREE.Line(sGeo19, new THREE.LineBasicMaterial({
              color: isSpike ? 0xff4422 : 0x44aaff,
              transparent: true, opacity: 0.55,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(sLine19);
            var sxc = ((si19%4)-1.5)*7;
            var szc = (Math.floor(si19/4)-1.5)*7;
            this._spikes.push({ line: sLine19, pts: sPts19, cx: sxc, cz: szc, spike: isSpike, phase: si19*0.3 });
          }
          this._crmiTime = 0;
          console.log("[cosmic-richtmyer-meshkov-instability] loaded at (0,-300,800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._crmiTime += dt;
          var t = this._crmiTime;
          for (var si20 = 0; si20 < this._spikes.length; si20++) {
            var spk = this._spikes[si20];
            var NSP20 = spk.pts.length/3;
            var dir = spk.spike ? 1 : -1;
            for (var spi = 0; spi < NSP20; spi++) {
              var sf20 = spi/(NSP20-1);
              var sAngle = sf20*2*Math.PI;
              var sHeight = dir*sf20*3*(1+0.3*Math.sin(t*1.5+spk.phase));
              var sRad = 2*Math.sin(sf20*Math.PI);
              spk.pts[spi*3  ] = spk.cx + sRad*Math.cos(sAngle);
              spk.pts[spi*3+1] = sHeight;
              spk.pts[spi*3+2] = spk.cz + sRad*Math.sin(sAngle);
            }
            spk.line.geometry.attributes.position.needsUpdate = true;
            spk.line.material.opacity = 0.4 + 0.2*Math.sin(t*1.3 + spk.phase);
          }
        },
      });

      /* ====================================================================
         STELLAR TURBULENT CONVECTION DOWNDRAFT — in convective envelopes,
         cooled material at the photosphere becomes denser than the surroundings
         and descends in narrow turbulent downdraft lanes, carrying flux inward.
         Renders: downward streaming particle lanes with turbulent wobble.
         Position: (-500, 600, -200).
         @alignment 8→26→48:480  @frequency 741  @domain pain-removal
      ==================================================================== */
      AFRAME.registerComponent("stellar-turbulent-convection-downdraft", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-500, 600, -200);
          scene.add(this._root);

          var NLANE = 20;
          this._lanes = [];
          for (var li20 = 0; li20 < NLANE; li20++) {
            var NLP20 = 300;
            var lPts20 = new Float32Array(NLP20*3);
            var lGeo20 = new THREE.BufferGeometry();
            lGeo20.setAttribute("position", new THREE.BufferAttribute(lPts20, 3));
            var lMesh20 = new THREE.Points(lGeo20, new THREE.PointsMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.55+Math.random()*0.1, 1.0, 0.6),
              size: 0.4, transparent: true, opacity: 0.25,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(lMesh20);
            var lx20 = (Math.random()-0.5)*20;
            var lz20 = (Math.random()-0.5)*20;
            this._lanes.push({ mesh: lMesh20, pts: lPts20, lx: lx20, lz: lz20, phase: Math.random()*2*Math.PI });
          }
          this._stcdTime = 0;
          console.log("[stellar-turbulent-convection-downdraft] loaded at (-500,600,-200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._stcdTime += dt;
          var t = this._stcdTime;
          for (var li21 = 0; li21 < this._lanes.length; li21++) {
            var lane = this._lanes[li21];
            var NLP21 = lane.pts.length/3;
            for (var lpi = 0; lpi < NLP21; lpi++) {
              var ly21 = -((lpi/(NLP21-1) + t*0.4 + lane.phase) % 1.0)*12;
              var wobbleX = 0.5*Math.sin(ly21*1.5 + t*2 + lane.phase);
              var wobbleZ = 0.5*Math.cos(ly21*1.2 + t*1.7 + lane.phase*1.3);
              lane.pts[lpi*3  ] = lane.lx + wobbleX;
              lane.pts[lpi*3+1] = ly21;
              lane.pts[lpi*3+2] = lane.lz + wobbleZ;
            }
            lane.mesh.geometry.attributes.position.needsUpdate = true;
            lane.mesh.material.opacity = 0.2 + 0.12*Math.sin(t*1.4 + lane.phase);
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 107 injected! Lines:", lineCount);
