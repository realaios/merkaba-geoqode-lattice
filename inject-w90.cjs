'use strict';
// inject-w90.cjs — Wave 90: cosmic-reconnection-exhaust-jet + interstellar-turbulence-kolmogorov-cascade
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-reconnection-exhaust-jet"')) {
  console.log('Wave 90 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-polycyclic-aromatic-haze></a-entity>';
const HTML_INSERT = `      <a-entity stellar-polycyclic-aromatic-haze></a-entity>
      <!-- ── COSMIC RECONNECTION EXHAUST JET — plasmoid-mediated reconnection exhaust ── -->
      <a-entity cosmic-reconnection-exhaust-jet></a-entity>
      <!-- ── INTERSTELLAR KOLMOGOROV CASCADE — turbulence energy cascade in ISM ── -->
      <a-entity interstellar-turbulence-kolmogorov-cascade></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC RECONNECTION EXHAUST JET — during fast plasmoid-mediated
         magnetic reconnection the outflowing exhaust jets carry reconnected
         flux at Alfvénic speed, forming two symmetric jets from the X-point.
         Renders: X-point neutral sheet glow + two high-speed plasma jets
         with plasmoid blobs propagating along them.
         Position: (0, -300, 900).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("cosmic-reconnection-exhaust-jet", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(0, -300, 900);
          scene.add(this._root);

          /* neutral sheet */
          var NS = 2000;
          var nsPts = new Float32Array(NS*3);
          this._nsPts = nsPts; this._NS = NS;
          for (var ni = 0; ni < NS; ni++) {
            nsPts[ni*3  ] = (Math.random()-0.5)*4;
            nsPts[ni*3+1] = (Math.random()-0.5)*40;
            nsPts[ni*3+2] = (Math.random()-0.5)*4;
          }
          var nsGeo = new THREE.BufferGeometry();
          nsGeo.setAttribute("position", new THREE.BufferAttribute(nsPts, 3));
          this._sheet = new THREE.Points(nsGeo, new THREE.PointsMaterial({
            color: 0xffffaa, size: 0.6,
            transparent: true, opacity: 0.4,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._sheet);

          /* two exhaust jets with plasmoids */
          this._jets = [];
          var jetDirs = [1, -1];
          for (var ji = 0; ji < 2; ji++) {
            var jd = jetDirs[ji];
            var jPts = new Float32Array(60*3);
            var jGeo = new THREE.BufferGeometry();
            jGeo.setAttribute("position", new THREE.BufferAttribute(jPts, 3));
            var jLine = new THREE.Line(jGeo, new THREE.LineBasicMaterial({
              color: 0x00aaff, transparent: true, opacity: 0.5,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(jLine);

            /* plasmoid blobs */
            var blobs = [];
            for (var bi = 0; bi < 6; bi++) {
              var bGeo = new THREE.BufferGeometry();
              var bPts = new Float32Array(200*3);
              bGeo.setAttribute("position", new THREE.BufferAttribute(bPts, 3));
              var bMesh = new THREE.Points(bGeo, new THREE.PointsMaterial({
                color: 0x44ffff, size: 0.5,
                transparent: true, opacity: 0.0,
                blending: THREE.AdditiveBlending, depthWrite: false,
              }));
              this._root.add(bMesh);
              blobs.push({ mesh: bMesh, pts: bPts, pos: bi/6, phase: bi*1.05 });
            }
            this._jets.push({ line: jLine, pts: jPts, dir: jd, blobs: blobs });
          }

          this._crejTime = 0;
          console.log("[cosmic-reconnection-exhaust-jet] loaded at (0,-300,900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._crejTime += dt;
          var t = this._crejTime;
          for (var ji = 0; ji < this._jets.length; ji++) {
            var j = this._jets[ji];
            for (var pi = 0; pi < 60; pi++) {
              var pf = pi/59;
              var jx = j.dir * pf * 60;
              var jy = (Math.random()-0.5)*2*(1-pf);
              j.pts[pi*3  ] = jx; j.pts[pi*3+1] = jy; j.pts[pi*3+2] = 0;
            }
            j.line.geometry.attributes.position.needsUpdate = true;
            for (var bi = 0; bi < j.blobs.length; bi++) {
              var b = j.blobs[bi];
              b.pos += dt*0.6;
              if (b.pos > 1) b.pos = 0;
              var bx = j.dir * b.pos * 60;
              for (var bpi = 0; bpi < 200; bpi++) {
                b.pts[bpi*3  ] = bx + (Math.random()-0.5)*3;
                b.pts[bpi*3+1] = (Math.random()-0.5)*3;
                b.pts[bpi*3+2] = (Math.random()-0.5)*3;
              }
              b.mesh.geometry.attributes.position.needsUpdate = true;
              b.mesh.material.opacity = 0.5*(1-Math.abs(2*b.pos-1));
            }
          }
          this._sheet.material.opacity = 0.35 + 0.1*Math.sin(t*2.5);
        },
      });

      /* ====================================================================
         INTERSTELLAR TURBULENCE KOLMOGOROV CASCADE — MHD turbulence in
         the ISM follows a Kolmogorov-like energy cascade from outer driving
         scales to inner dissipation scales, visible as a fractal hierarchy
         of density fluctuations and velocity eddies.
         Renders: nested eddies at multiple scales producing a fractal
         density-fluctuation cloud.
         Position: (-600, -200, -600).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("interstellar-turbulence-kolmogorov-cascade", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-600, -200, -600);
          scene.add(this._root);

          /* fractal density cloud — 3 scales */
          this._eddies = [];
          var scales = [80, 35, 14, 5];
          var counts = [1000, 1500, 2500, 4000];
          var colors = [0x4466aa, 0x6688cc, 0x88aaee, 0xaaccff];
          for (var si = 0; si < scales.length; si++) {
            var NE = counts[si];
            var ePts = new Float32Array(NE*3);
            for (var ei = 0; ei < NE; ei++) {
              var ea = Math.random()*2*Math.PI, eb = Math.random()*Math.PI;
              var er = Math.random()*scales[si];
              ePts[ei*3  ] = er*Math.sin(eb)*Math.cos(ea);
              ePts[ei*3+1] = er*Math.cos(eb)*0.8;
              ePts[ei*3+2] = er*Math.sin(eb)*Math.sin(ea);
            }
            var eGeo = new THREE.BufferGeometry();
            eGeo.setAttribute("position", new THREE.BufferAttribute(ePts, 3));
            var eMesh = new THREE.Points(eGeo, new THREE.PointsMaterial({
              color: colors[si], size: 0.4 + si*0.2,
              transparent: true, opacity: 0.06 + si*0.04,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(eMesh);
            this._eddies.push({ mesh: eMesh, speed: 0.03 + si*0.05 });
          }

          this._itkTime = 0;
          console.log("[interstellar-turbulence-kolmogorov-cascade] loaded at (-600,-200,-600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._itkTime += dt;
          var t = this._itkTime;
          for (var si = 0; si < this._eddies.length; si++) {
            var e = this._eddies[si];
            e.mesh.rotation.x = t * e.speed;
            e.mesh.rotation.y = t * e.speed * 0.7;
            e.mesh.material.opacity = (0.06 + si*0.04) * (0.8 + 0.2*Math.sin(t*(1+si*0.4)));
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 90 injected! Lines:', lineCount);
