"use strict";
// inject-w87.cjs — Wave 87: galactic-tidal-shock-ridge + cosmic-beta-decay-nebula
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("galactic-tidal-shock-ridge"')) {
  console.log("Wave 87 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity cosmic-mirror-instability-patch></a-entity>";
const HTML_INSERT = `      <a-entity cosmic-mirror-instability-patch></a-entity>
      <!-- ── GALACTIC TIDAL SHOCK RIDGE — tidal compression triggers a star-formation ridge ── -->
      <a-entity galactic-tidal-shock-ridge></a-entity>
      <!-- ── COSMIC BETA DECAY NEBULA — neutron-rich ejecta cloud undergoing beta-decay glow ── -->
      <a-entity cosmic-beta-decay-nebula></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         GALACTIC TIDAL SHOCK RIDGE — when a satellite galaxy passes through
         a disk it compresses gas into a narrow ridge triggering a burst of
         star formation.  Renders: an elongated shock ridge of bright young
         stars + compressed HII gas glowing along it.
         Position: (-900, 300, 200).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("galactic-tidal-shock-ridge", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-900, 300, 200);
          scene.add(this._root);

          /* ridge line */
          var NR = 100;
          var rPts = [];
          for (var ri = 0; ri < NR; ri++) {
            var rx = -70 + ri*1.4;
            var ry = 6*Math.sin(ri*0.2);
            rPts.push(rx, ry, 0);
          }
          var rGeo = new THREE.BufferGeometry();
          rGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(rPts), 3));
          this._ridgeLine = new THREE.Line(rGeo, new THREE.LineBasicMaterial({
            color: 0x88ffaa, transparent: true, opacity: 0.7,
            blending: THREE.AdditiveBlending,
          }));
          this._root.add(this._ridgeLine);

          /* young star clusters along ridge */
          var NS = 5000;
          var sPts = new Float32Array(NS*3);
          this._sPts = sPts; this._NS = NS;
          for (var si = 0; si < NS; si++) {
            var sx = (Math.random()-0.5)*150;
            var sy = (Math.random()-0.5)*5 + 4*Math.sin(sx*0.1);
            var sz = (Math.random()-0.5)*5;
            sPts[si*3  ] = sx; sPts[si*3+1] = sy; sPts[si*3+2] = sz;
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(sPts, 3));
          this._stars3 = new THREE.Points(sGeo, new THREE.PointsMaterial({
            color: 0xaaffcc, size: 0.6,
            transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._stars3);

          /* compressed HII haze */
          var NH2 = 3000;
          var hPts2 = new Float32Array(NH2*3);
          this._hPts2 = hPts2; this._NH2 = NH2;
          for (var hi2 = 0; hi2 < NH2; hi2++) {
            hPts2[hi2*3  ] = (Math.random()-0.5)*150;
            hPts2[hi2*3+1] = (Math.random()-0.5)*18;
            hPts2[hi2*3+2] = (Math.random()-0.5)*12;
          }
          var hGeo2 = new THREE.BufferGeometry();
          hGeo2.setAttribute("position", new THREE.BufferAttribute(hPts2, 3));
          this._hiIhaze = new THREE.Points(hGeo2, new THREE.PointsMaterial({
            color: 0xff66aa, size: 1.0,
            transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._hiIhaze);

          this._gtsTime = 0;
          console.log("[galactic-tidal-shock-ridge] loaded at (-900,300,200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._gtsTime += dt;
          var t = this._gtsTime;
          this._stars3.material.opacity = 0.3 + 0.1*Math.sin(t*2.1);
          this._hiIhaze.material.opacity = 0.1 + 0.05*Math.sin(t*1.3 + 1);
          this._root.rotation.z += 0.002*dt;
        },
      });

      /* ====================================================================
         COSMIC BETA DECAY NEBULA — freshly synthesised neutron-rich nuclei
         in supernova ejecta undergo beta-minus decay, releasing electrons
         and neutrinos that partially thermalize in the surrounding nebula
         creating a characteristic soft X-ray glow.
         Renders: diffuse glowing nebula cloud with slow energetic electron
         streak tracers.
         Position: (300, -600, -400).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-beta-decay-nebula", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(300, -600, -400);
          scene.add(this._root);

          /* nebula haze */
          var NC = 6000;
          var nPts = new Float32Array(NC*3);
          this._nPts = nPts; this._NC = NC;
          for (var ni = 0; ni < NC; ni++) {
            var na = Math.random()*2*Math.PI, ne = Math.random()*Math.PI;
            var nr = 5 + Math.pow(Math.random(), 0.6)*60;
            nPts[ni*3  ] = nr*Math.sin(ne)*Math.cos(na);
            nPts[ni*3+1] = nr*Math.cos(ne)*0.7;
            nPts[ni*3+2] = nr*Math.sin(ne)*Math.sin(na);
          }
          var nGeo = new THREE.BufferGeometry();
          nGeo.setAttribute("position", new THREE.BufferAttribute(nPts, 3));
          this._nebula = new THREE.Points(nGeo, new THREE.PointsMaterial({
            color: 0x44ccff, size: 0.9,
            transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._nebula);

          /* electron streaks */
          this._streaks = [];
          for (var ei = 0; ei < 40; ei++) {
            var ePts = new Float32Array(20*3);
            var eGeo = new THREE.BufferGeometry();
            eGeo.setAttribute("position", new THREE.BufferAttribute(ePts, 3));
            var eMesh = new THREE.Line(eGeo, new THREE.LineBasicMaterial({
              color: 0x00ffff, transparent: true, opacity: 0.0,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(eMesh);
            this._streaks.push({
              mesh: eMesh, pts: ePts, life: Math.random(),
              maxLife: 0.4 + Math.random()*0.8,
              dir: new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize(),
              origin: new THREE.Vector3((Math.random()-0.5)*20, (Math.random()-0.5)*20, (Math.random()-0.5)*20),
            });
          }

          this._cbdTime = 0;
          console.log("[cosmic-beta-decay-nebula] loaded at (300,-600,-400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cbdTime += dt;
          var t = this._cbdTime;
          this._nebula.material.opacity = 0.2 + 0.08*Math.sin(t*0.9);
          for (var ei = 0; ei < this._streaks.length; ei++) {
            var s = this._streaks[ei];
            s.life += dt;
            if (s.life > s.maxLife) {
              s.life = 0;
              s.dir.set(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
              s.origin.set((Math.random()-0.5)*20, (Math.random()-0.5)*20, (Math.random()-0.5)*20);
              s.maxLife = 0.4 + Math.random()*0.8;
            }
            var f = s.life/s.maxLife;
            s.mesh.material.opacity = (1-f)*0.6;
            var len = 20*f;
            for (var pi = 0; pi < 20; pi++) {
              var pf = pi/19;
              s.pts[pi*3  ] = s.origin.x + s.dir.x*len*pf;
              s.pts[pi*3+1] = s.origin.y + s.dir.y*len*pf;
              s.pts[pi*3+2] = s.origin.z + s.dir.z*len*pf;
            }
            s.mesh.geometry.attributes.position.needsUpdate = true;
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 87 injected! Lines:", lineCount);
