"use strict";
// inject-w111.cjs — Wave 111: cosmic-neutrino-wind-bubble + stellar-differential-emission-measure
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("cosmic-neutrino-wind-bubble"')) {
  console.log("Wave 111 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity stellar-sunspot-umbra-darkening></a-entity>";
const HTML_INSERT = `      <a-entity stellar-sunspot-umbra-darkening></a-entity>
      <!-- ── COSMIC NEUTRINO WIND BUBBLE — hot neutrino-driven wind expanding from proto-neutron star core ── -->
      <a-entity cosmic-neutrino-wind-bubble></a-entity>
      <!-- ── STELLAR DIFFERENTIAL EMISSION MEASURE — multi-temp corona EM distribution as layered shells ── -->
      <a-entity stellar-differential-emission-measure></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC NEUTRINO WIND BUBBLE — in the seconds after core collapse, the
         newborn proto-neutron star drives a powerful neutrino-heated wind that
         inflates a hot bubble, separated from the freely-falling material by
         the neutrino-driven reverse shock.
         Renders: an expanding spherical bubble with inward-pointing shock streaks.
         Position: (-300, 400, 700).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-neutrino-wind-bubble", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-300, 400, 700);
          scene.add(this._root);

          var NSPH28 = 600;
          var bPts28 = new Float32Array(NSPH28*3);
          var bGeo28 = new THREE.BufferGeometry();
          bGeo28.setAttribute("position", new THREE.BufferAttribute(bPts28, 3));
          this._bubbleMesh = new THREE.Points(bGeo28, new THREE.PointsMaterial({
            color: 0xaaffee, size: 0.3, transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._bubbleMesh);
          this._bPts = bPts28;
          this._phi28 = []; this._theta28 = [];
          for (var bi28 = 0; bi28 < NSPH28; bi28++) {
            this._phi28.push(Math.random()*2*Math.PI);
            this._theta28.push(Math.acos(2*Math.random()-1));
          }

          var NSTRK28 = 24;
          this._streaks = [];
          for (var si28 = 0; si28 < NSTRK28; si28++) {
            var NSP28 = 30;
            var sPts28 = new Float32Array(NSP28*3);
            var sGeo28 = new THREE.BufferGeometry();
            sGeo28.setAttribute("position", new THREE.BufferAttribute(sPts28, 3));
            var sLine28 = new THREE.Line(sGeo28, new THREE.LineBasicMaterial({
              color: 0xff8844,
              transparent: true, opacity: 0.45,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(sLine28);
            var sa28 = Math.random()*2*Math.PI;
            var st28 = Math.acos(2*Math.random()-1);
            this._streaks.push({ line: sLine28, pts: sPts28, phi: sa28, theta: st28 });
          }
          this._cnwbTime = 0;
          console.log("[cosmic-neutrino-wind-bubble] loaded at (-300,400,700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cnwbTime += dt;
          var t = this._cnwbTime;
          var R28 = 6 + 1.5*Math.sin(t*0.7);
          for (var bi29 = 0; bi29 < this._phi28.length; bi29++) {
            var p28 = this._phi28[bi29]; var th28 = this._theta28[bi29];
            var r28 = R28*(1 + 0.05*Math.sin(8*p28 + t));
            this._bPts[bi29*3  ] = r28*Math.sin(th28)*Math.cos(p28);
            this._bPts[bi29*3+1] = r28*Math.cos(th28);
            this._bPts[bi29*3+2] = r28*Math.sin(th28)*Math.sin(p28);
          }
          this._bubbleMesh.geometry.attributes.position.needsUpdate = true;
          for (var si29 = 0; si29 < this._streaks.length; si29++) {
            var str = this._streaks[si29];
            var NSP29 = str.pts.length/3;
            var dxs = Math.sin(str.theta)*Math.cos(str.phi);
            var dys = Math.cos(str.theta);
            var dzs = Math.sin(str.theta)*Math.sin(str.phi);
            for (var spi29 = 0; spi29 < NSP29; spi29++) {
              var sf29 = spi29/(NSP29-1);
              var r29 = R28*(0.6 + sf29*0.5);
              str.pts[spi29*3  ] = r29*dxs;
              str.pts[spi29*3+1] = r29*dys;
              str.pts[spi29*3+2] = r29*dzs;
            }
            str.line.geometry.attributes.position.needsUpdate = true;
          }
        },
      });

      /* ====================================================================
         STELLAR DIFFERENTIAL EMISSION MEASURE — the corona contains plasma
         at a broad range of temperatures; DEM analysis distributes coronal
         emission across temperature bins, revealing the multi-thermal
         structure as nested shells glowing at different colours.
         Renders: concentric tinted shells representing temperature bins.
         Position: (900, -200, -400).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("stellar-differential-emission-measure", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(900, -200, -400);
          scene.add(this._root);

          var NBIN28 = 7;
          this._shells = [];
          for (var bi30 = 0; bi30 < NBIN28; bi30++) {
            var NMP28 = 400;
            var mPts28 = new Float32Array(NMP28*3);
            var mGeo28 = new THREE.BufferGeometry();
            mGeo28.setAttribute("position", new THREE.BufferAttribute(mPts28, 3));
            var phis28 = []; var thetas28 = [];
            for (var mi28 = 0; mi28 < NMP28; mi28++) {
              phis28.push(Math.random()*2*Math.PI);
              thetas28.push(Math.acos(2*Math.random()-1));
            }
            var mMesh28 = new THREE.Points(mGeo28, new THREE.PointsMaterial({
              color: new AFRAME.THREE.Color().setHSL(bi30/NBIN28, 1.0, 0.65),
              size: 0.25, transparent: true, opacity: 0.2,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(mMesh28);
            var R28b = 2 + bi30*1.2;
            this._shells.push({ mesh: mMesh28, pts: mPts28, phis: phis28, thetas: thetas28, R: R28b, phase: bi30*0.5 });
          }
          this._sdemTime = 0;
          console.log("[stellar-differential-emission-measure] loaded at (900,-200,-400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._sdemTime += dt;
          var t = this._sdemTime;
          for (var bi31 = 0; bi31 < this._shells.length; bi31++) {
            var sh = this._shells[bi31];
            var NMP29 = sh.pts.length/3;
            for (var mi29 = 0; mi29 < NMP29; mi29++) {
              var ph = sh.phis[mi29]; var th = sh.thetas[mi29];
              var r = sh.R*(1 + 0.07*Math.sin(5*ph + t + sh.phase));
              sh.pts[mi29*3  ] = r*Math.sin(th)*Math.cos(ph);
              sh.pts[mi29*3+1] = r*Math.cos(th);
              sh.pts[mi29*3+2] = r*Math.sin(th)*Math.sin(ph);
            }
            sh.mesh.geometry.attributes.position.needsUpdate = true;
            sh.mesh.material.opacity = 0.15 + 0.08*Math.sin(t*1.3 + sh.phase);
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 111 injected! Lines:", lineCount);
