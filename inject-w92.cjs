'use strict';
// inject-w92.cjs — Wave 92: protostellar-bipolar-cavity-wall + cosmic-collider-bar-shock
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("protostellar-bipolar-cavity-wall"')) {
  console.log('Wave 92 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity cosmic-anisotropic-synchrotron-ridge></a-entity>';
const HTML_INSERT = `      <a-entity cosmic-anisotropic-synchrotron-ridge></a-entity>
      <!-- ── PROTOSTELLAR BIPOLAR CAVITY WALL — outflow-carved cavity wall with scattered light ── -->
      <a-entity protostellar-bipolar-cavity-wall></a-entity>
      <!-- ── COSMIC COLLIDER BAR SHOCK — galaxy bar ends drive colliding flow shocks ── -->
      <a-entity cosmic-collider-bar-shock></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         PROTOSTELLAR BIPOLAR CAVITY WALL — the jet/wind from a protostar
         excavates a bipolar cavity in the surrounding envelope; scattered
         light illuminates the paraboloid cavity walls, producing the classic
         butterfly or Toby-jug shape.
         Renders: two paraboloid cavity lobes + protostar glow core.
         Position: (150, -800, 300).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("protostellar-bipolar-cavity-wall", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(150, -800, 300);
          scene.add(this._root);

          /* protostar glow */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(2.5, 8, 6),
            new THREE.MeshBasicMaterial({
              color: 0xffdd44, transparent: true, opacity: 0.9,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          /* paraboloid cavity wall — two lobes */
          var caveSides = [1, -1];
          for (var ci = 0; ci < 2; ci++) {
            var NC = 4000;
            var cPts = new Float32Array(NC*3);
            for (var cj = 0; cj < NC; cj++) {
              var cy = 3 + Math.random()*30;
              var cr = Math.sqrt(cy)*3.5 + (Math.random()-0.5)*2;
              var ca = Math.random()*2*Math.PI;
              cPts[cj*3  ] = cr*Math.cos(ca);
              cPts[cj*3+1] = caveSides[ci]*cy;
              cPts[cj*3+2] = cr*Math.sin(ca);
            }
            var cGeo = new THREE.BufferGeometry();
            cGeo.setAttribute("position", new THREE.BufferAttribute(cPts, 3));
            this._root.add(new THREE.Points(cGeo, new THREE.PointsMaterial({
              color: ci === 0 ? 0xffaa55 : 0xaaddff, size: 0.6,
              transparent: true, opacity: 0.3,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* scattered light haze */
          var NS2 = 3000;
          var sPts2 = new Float32Array(NS2*3);
          this._sPts2 = sPts2; this._NS2 = NS2;
          for (var si = 0; si < NS2; si++) {
            var sy = (Math.random()-0.5)*70;
            var sr = Math.sqrt(Math.abs(sy))*3*(Math.random()*0.5+0.5);
            var sa = Math.random()*2*Math.PI;
            sPts2[si*3  ] = sr*Math.cos(sa);
            sPts2[si*3+1] = sy;
            sPts2[si*3+2] = sr*Math.sin(sa);
          }
          var sGeo2 = new THREE.BufferGeometry();
          sGeo2.setAttribute("position", new THREE.BufferAttribute(sPts2, 3));
          this._scatter = new THREE.Points(sGeo2, new THREE.PointsMaterial({
            color: 0xffffff, size: 0.3,
            transparent: true, opacity: 0.08,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._scatter);

          this._pbcwTime = 0;
          console.log("[protostellar-bipolar-cavity-wall] loaded at (150,-800,300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._pbcwTime += dt;
          var t = this._pbcwTime;
          this._scatter.material.opacity = 0.06 + 0.03*Math.sin(t*1.2);
        },
      });

      /* ====================================================================
         COSMIC COLLIDER BAR SHOCK — at the ends of a galactic bar, gas
         streaming along the bar collides with the slower ambient disk gas,
         producing arc-shaped shocks with enhanced star formation.
         Renders: bar gas stream lines + two shock arc regions with starburst
         hot spots at the bar tips.
         Position: (700, -400, -700).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("cosmic-collider-bar-shock", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(700, -400, -700);
          scene.add(this._root);

          /* bar gas streams */
          for (var bi = 0; bi < 12; bi++) {
            var boff = -4 + bi*(8/11);
            var bPts = [];
            for (var bp = -60; bp <= 60; bp += 2) {
              bPts.push(bp, boff, Math.sin(bp*0.05)*3);
            }
            var bGeo = new THREE.BufferGeometry();
            bGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(bPts), 3));
            this._root.add(new THREE.Line(bGeo, new THREE.LineBasicMaterial({
              color: 0xffcc44, transparent: true, opacity: 0.15,
              blending: THREE.AdditiveBlending,
            })));
          }

          /* shock arcs at bar tips */
          var shockSides = [-60, 60];
          for (var si = 0; si < 2; si++) {
            var sxOff = shockSides[si];
            for (var sk = 0; sk < 3; sk++) {
              var sPts3 = [];
              var sr2 = 8 + sk*4;
              for (var saa = -70; saa <= 70; saa += 5) {
                var srad = saa * Math.PI/180;
                sPts3.push(sxOff + sr2*Math.sin(srad)*Math.sign(sxOff), sr2*Math.cos(srad), 0);
              }
              var sGeo3 = new THREE.BufferGeometry();
              sGeo3.setAttribute("position", new THREE.BufferAttribute(new Float32Array(sPts3), 3));
              this._root.add(new THREE.Line(sGeo3, new THREE.LineBasicMaterial({
                color: 0xff4400, transparent: true, opacity: 0.35 - sk*0.08,
                blending: THREE.AdditiveBlending,
              })));
            }
            /* starburst hotspot */
            var hPts = new Float32Array(500*3);
            for (var hi = 0; hi < 500; hi++) {
              hPts[hi*3  ] = sxOff + (Math.random()-0.5)*6;
              hPts[hi*3+1] = (Math.random()-0.5)*8;
              hPts[hi*3+2] = (Math.random()-0.5)*4;
            }
            var hGeo = new THREE.BufferGeometry();
            hGeo.setAttribute("position", new THREE.BufferAttribute(hPts, 3));
            this._root.add(new THREE.Points(hGeo, new THREE.PointsMaterial({
              color: 0xff6600, size: 0.7,
              transparent: true, opacity: 0.5,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          this._ccbsTime = 0;
          console.log("[cosmic-collider-bar-shock] loaded at (700,-400,-700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._ccbsTime += dt;
          var t = this._ccbsTime;
          this._root.rotation.y += 0.04*dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 92 injected! Lines:', lineCount);
