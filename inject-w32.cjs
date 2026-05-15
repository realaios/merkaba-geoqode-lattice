"use strict";
// inject-w32.cjs — Wave 32: lyman-alpha-forest + cosmic-spider-pulsar
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("lyman-alpha-forest"')) {
  console.log("Wave 32 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity superbubble-wall></a-entity>";
const HTML_INSERT = `      <a-entity superbubble-wall></a-entity>
      <!-- ── LYMAN-ALPHA FOREST — quasar absorption line forest in 3D ── -->
      <a-entity lyman-alpha-forest></a-entity>
      <!-- ── COSMIC SPIDER PULSAR — black widow MSP ablating its companion ── -->
      <a-entity cosmic-spider-pulsar></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         LYMAN-ALPHA FOREST — the forest of hydrogen Lyman-alpha absorption
         lines seen in high-z quasar spectra, each line from a different
         HI cloud along the line of sight. Visualised as floating spectral
         slabs arranged along a quasar beam, dimmer/denser at high redshift.
         Position: (-900, 300, 600).
         Components:
           - Quasar beam: 800 pts (axial, hot blue-white)
           - Absorption slabs: 24 thin particle discs along beam (random opacity)
           - Lyα clouds: 24 diffuse particle puffs flanking beam
           - Proximity effect: inner 3 slabs noticeably fainter
           - Spectral bar: color gradient panel (UV blue → optical red)
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("lyman-alpha-forest", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-900, 300, 600);
          scene.add(this._root);

          /* quasar beam — 800 pts along Z */
          var QBN = 800;
          var qbPts = new Float32Array(QBN * 3);
          for (var qi = 0; qi < QBN; qi++) {
            qbPts[qi*3  ] = (Math.random()-0.5)*5;
            qbPts[qi*3+1] = (Math.random()-0.5)*5;
            qbPts[qi*3+2] = qi * 0.75 - 50;
          }
          var qbGeo = new THREE.BufferGeometry();
          qbGeo.setAttribute("position", new THREE.BufferAttribute(qbPts, 3));
          this._root.add(new THREE.Points(qbGeo, new THREE.PointsMaterial({
            color: 0x88bbff, size: 1.8, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* absorption slabs + clouds */
          this._slabMats = [];
          this._cloudRoots = [];
          var NUM_SLABS = 24;
          for (var si = 0; si < NUM_SLABS; si++) {
            var zPos = si * 24 - 200;
            /* slab: thin disc perpendicular to beam */
            var slabN = 120 + Math.floor(Math.random()*80);
            var slPts = new Float32Array(slabN * 3);
            for (var sli = 0; sli < slabN; sli++) {
              var ang = Math.random()*2*Math.PI;
              var rad = Math.random()*25;
              slPts[sli*3  ] = rad*Math.cos(ang);
              slPts[sli*3+1] = rad*Math.sin(ang);
              slPts[sli*3+2] = (Math.random()-0.5)*2;
            }
            var slGeo = new THREE.BufferGeometry();
            slGeo.setAttribute("position", new THREE.BufferAttribute(slPts, 3));
            /* color: bluer near quasar (low z), redder far (high z) */
            var t = si / NUM_SLABS;
            var slColor = new THREE.Color().setHSL(0.6 - t*0.45, 1, 0.65);
            /* proximity effect: first 3 slabs fainter */
            var baseOp = (si < 3) ? 0.08 : 0.22 + Math.random()*0.38;
            var slMat = new THREE.PointsMaterial({
              color: slColor, size: 2.2, transparent: true, opacity: baseOp,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            this._slabMats.push({ mat: slMat, base: baseOp });
            var slMesh = new THREE.Points(slGeo, slMat);
            slMesh.position.z = zPos;
            this._root.add(slMesh);

            /* cloud: diffuse puff at same Z */
            var clN = 80;
            var clPts = new Float32Array(clN * 3);
            for (var cli = 0; cli < clN; cli++) {
              clPts[cli*3  ] = (Math.random()-0.5)*60;
              clPts[cli*3+1] = (Math.random()-0.5)*60;
              clPts[cli*3+2] = (Math.random()-0.5)*8;
            }
            var clGeo = new THREE.BufferGeometry();
            clGeo.setAttribute("position", new THREE.BufferAttribute(clPts, 3));
            var clMesh = new THREE.Points(clGeo, new THREE.PointsMaterial({
              color: slColor, size: 1.5, transparent: true, opacity: 0.08,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            clMesh.position.z = zPos;
            this._cloudRoots.push(clMesh);
            this._root.add(clMesh);
          }

          this._lafTime = 0;
          console.log("[lyman-alpha-forest] loaded at (-900,300,600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._lafTime += dt;

          /* gentle shimmer on slab opacities */
          for (var si = 0; si < this._slabMats.length; si++) {
            var entry = this._slabMats[si];
            entry.mat.opacity = entry.base * (0.85 + 0.15 * Math.sin(this._lafTime * 1.3 + si * 0.8));
          }
          this._root.rotation.y += 0.0004 * dt;
        },
      });

      /* ====================================================================
         COSMIC SPIDER PULSAR — a black widow millisecond pulsar (MSP) in a
         tight orbit with a companion it is ablating with its energetic wind.
         The evaporative wind forms an eclipse-causing cloud around the system.
         Position: (600, -400, 800).
         Components:
           - MSP: bright white central sphere, rapid pulse flash (1/7s cycle)
           - Companion: orange subdwarf sphere, orbiting r=20 in 4s
           - Pulsar beam cones: two narrow cones sweeping perpendicular to orbit
           - Evaporative wind: 1000 pts blown off companion toward Lagrange point
           - Eclipse cloud: 400 pts cocoon around system, opacity peaks at conjunction
           - Intrabinary shock: 300 pts crescent shock between stars
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("cosmic-spider-pulsar", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(600, -400, 800);
          scene.add(this._root);

          /* MSP: bright white sphere */
          this._msp = new THREE.Mesh(
            new THREE.SphereGeometry(3, 8, 5),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          this._root.add(this._msp);

          /* companion: orange subdwarf */
          this._comp = new THREE.Mesh(
            new THREE.SphereGeometry(6, 8, 5),
            new THREE.MeshBasicMaterial({ color: 0xff8822 })
          );
          this._root.add(this._comp);

          /* pulsar beam cones (two halves) */
          this._beams = [];
          for (var b = 0; b < 2; b++) {
            var bSign = b === 0 ? 1 : -1;
            var bPts = new Float32Array(150 * 3);
            for (var bi = 0; bi < 150; bi++) {
              var bz = (bi / 149) * 80 * bSign;
              var br = (bi / 149) * 10;
              var ba = Math.random()*2*Math.PI;
              bPts[bi*3  ] = br*Math.cos(ba);
              bPts[bi*3+1] = br*Math.sin(ba);
              bPts[bi*3+2] = bz;
            }
            var bGeo = new THREE.BufferGeometry();
            bGeo.setAttribute("position", new THREE.BufferAttribute(bPts, 3));
            var bMesh = new THREE.Points(bGeo, new THREE.PointsMaterial({
              color: 0x88ffff, size: 2.0, transparent: true, opacity: 0.60,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._beams.push(bMesh);
            this._msp.add(bMesh);
          }

          /* evaporative wind from companion */
          var EWN = 1000;
          var ewPts = new Float32Array(EWN * 3);
          for (var ewi = 0; ewi < EWN; ewi++) {
            ewPts[ewi*3  ] = (Math.random()-0.5)*30;
            ewPts[ewi*3+1] = (Math.random()-0.5)*30;
            ewPts[ewi*3+2] = (Math.random()-0.5)*30;
          }
          var ewGeo = new THREE.BufferGeometry();
          ewGeo.setAttribute("position", new THREE.BufferAttribute(ewPts, 3));
          this._ewMat = new THREE.PointsMaterial({
            color: 0xff6633, size: 1.5, transparent: true, opacity: 0.30,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._ewMesh = new THREE.Points(ewGeo, this._ewMat);
          this._root.add(this._ewMesh);

          /* eclipse cloud */
          var ECN = 400;
          var ecPts = new Float32Array(ECN * 3);
          for (var eci = 0; eci < ECN; eci++) {
            var ep = Math.acos(2*Math.random()-1);
            var et = Math.random()*2*Math.PI;
            var er = 15 + Math.random()*10;
            ecPts[eci*3  ] = er*Math.sin(ep)*Math.cos(et);
            ecPts[eci*3+1] = er*Math.cos(ep);
            ecPts[eci*3+2] = er*Math.sin(ep)*Math.sin(et);
          }
          var ecGeo = new THREE.BufferGeometry();
          ecGeo.setAttribute("position", new THREE.BufferAttribute(ecPts, 3));
          this._ecMat = new THREE.PointsMaterial({
            color: 0xff4422, size: 2.0, transparent: true, opacity: 0.18,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._ecMesh = new THREE.Points(ecGeo, this._ecMat);
          this._root.add(this._ecMesh);

          /* intrabinary shock crescent */
          var ISN = 300;
          var isPts = new Float32Array(ISN * 3);
          for (var isi = 0; isi < ISN; isi++) {
            var ia = Math.PI/2 + (Math.random()-0.5)*Math.PI;
            var ir = 10 + Math.random()*5;
            isPts[isi*3  ] = ir*Math.cos(ia);
            isPts[isi*3+1] = (Math.random()-0.5)*4;
            isPts[isi*3+2] = ir*Math.sin(ia);
          }
          var isGeo = new THREE.BufferGeometry();
          isGeo.setAttribute("position", new THREE.BufferAttribute(isPts, 3));
          this._isRoot = new THREE.Points(isGeo, new THREE.PointsMaterial({
            color: 0xaaffff, size: 2.2, transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._isRoot);

          this._spTime = 0;
          this._ORB_PERIOD = 4.0;
          this._PULSE_PERIOD = 1/7.0;
          console.log("[cosmic-spider-pulsar] loaded at (600,-400,800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._spTime += dt;

          /* companion orbital position */
          var orbAngle = (this._spTime / this._ORB_PERIOD) * 2 * Math.PI;
          var ORBIT_R = 20;
          this._comp.position.set(ORBIT_R * Math.cos(orbAngle), 0, ORBIT_R * Math.sin(orbAngle));

          /* evaporative wind follows companion */
          this._ewMesh.position.copy(this._comp.position);

          /* intrabinary shock between MSP and comp */
          var midX = this._comp.position.x * 0.5;
          var midZ = this._comp.position.z * 0.5;
          this._isRoot.position.set(midX, 0, midZ);
          this._isRoot.lookAt(this._comp.position);

          /* eclipse cloud at conjunction (comp between MSP and viewer) */
          var conjunction = Math.abs(Math.sin(orbAngle));
          this._ecMat.opacity = 0.08 + 0.22 * (1 - conjunction);
          this._ecMesh.position.set(midX * 0.5, 0, midZ * 0.5);

          /* pulsar beam sweeps in orbital plane */
          var sweepAngle = (this._spTime / this._PULSE_PERIOD) * Math.PI;
          this._msp.rotation.z = sweepAngle;

          /* rapid pulse flash */
          var pulsePhase = (this._spTime % this._PULSE_PERIOD) / this._PULSE_PERIOD;
          var flashOp = pulsePhase < 0.05 ? 1.0 : 0.3;
          this._beams[0].material.opacity = flashOp;
          this._beams[1].material.opacity = flashOp;

          this._root.rotation.y += 0.0004 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 32 injected! Lines:", lineCount);
