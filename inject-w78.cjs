'use strict';
// inject-w78.cjs — Wave 78: cosmic-vortex-ring-jet + protostellar-accretion-burst
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-vortex-ring-jet"')) {
  console.log('Wave 78 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity cosmic-pair-instability-remnant></a-entity>';
const HTML_INSERT = `      <a-entity cosmic-pair-instability-remnant></a-entity>
      <!-- ── COSMIC VORTEX RING JET — toroidal vortex rings in AGN jet ── -->
      <a-entity cosmic-vortex-ring-jet></a-entity>
      <!-- ── PROTOSTELLAR ACCRETION BURST — FU Ori type luminosity outburst ── -->
      <a-entity protostellar-accretion-burst></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC VORTEX RING JET — AGN jets are not smooth flows; instabilities
         generate Kelvin-Helmholtz vortex rings that propagate along the beam,
         forming bright knots. We render a jet axis with traveling torus rings
         that expand transversely as they move, plus a particle spine.
         Position: (-600, 0, -1600).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("cosmic-vortex-ring-jet", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-600, 0, -1600);
          scene.add(this._root);

          /* torus rings */
          this._rings = [];
          var NR = 10;
          for (var ri = 0; ri < NR; ri++) {
            var geo = new THREE.TorusGeometry(5, 1.2, 8, 20);
            var mat = new THREE.MeshBasicMaterial({
              color: 0x44aaff,
              transparent: true, opacity: 0,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var mesh = new THREE.Mesh(geo, mat);
            this._root.add(mesh);
            this._rings.push({
              mesh: mesh,
              z: -ri*20,
              speed: 18 + Math.random()*8,
              maxZ: 100, r: 5,
              phase: ri * 0.6,
            });
          }

          /* jet spine particles */
          var NP = 4000;
          var jPts = new Float32Array(NP*3);
          this._jPts = jPts;
          this._jVel = new Float32Array(NP);
          for (var pi = 0; pi < NP; pi++) {
            jPts[pi*3  ] = (Math.random()-0.5)*3;
            jPts[pi*3+1] = (Math.random()-0.5)*3;
            jPts[pi*3+2] = Math.random()*200 - 100;
            this._jVel[pi] = 25 + Math.random()*20;
          }
          var jGeo = new THREE.BufferGeometry();
          jGeo.setAttribute("position", new THREE.BufferAttribute(jPts, 3));
          this._spine = new THREE.Points(jGeo, new THREE.PointsMaterial({
            color: 0x88ccff, size: 0.7,
            transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._spine);

          /* counter-jet (dimmer) */
          var cjGeo = new THREE.BufferGeometry();
          var cjPts = new Float32Array(1200*3);
          for (var ci = 0; ci < 1200; ci++) {
            cjPts[ci*3  ] = (Math.random()-0.5)*2;
            cjPts[ci*3+1] = (Math.random()-0.5)*2;
            cjPts[ci*3+2] = -(Math.random()*120);
          }
          cjGeo.setAttribute("position", new THREE.BufferAttribute(cjPts, 3));
          this._root.add(new THREE.Points(cjGeo, new THREE.PointsMaterial({
            color: 0x335577, size: 0.5,
            transparent: true, opacity: 0.15,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._vrjTime = 0; this._NP = NP; this._NR = NR;
          console.log("[cosmic-vortex-ring-jet] loaded at (-600,0,-1600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._vrjTime += dt;
          var t = this._vrjTime;
          /* advance rings */
          for (var ri = 0; ri < this._NR; ri++) {
            var rg = this._rings[ri];
            rg.z += rg.speed * dt;
            rg.r = 5 + (rg.z + 100)/15;
            rg.mesh.position.z = rg.z;
            rg.mesh.scale.setScalar(rg.r/5);
            rg.mesh.rotation.x += 0.5*dt;
            var rfrac = (rg.z + 100)/200;
            rg.mesh.material.opacity = Math.max(0, 0.55*(1-rfrac*rfrac));
            if (rg.z > rg.maxZ) {
              rg.z = -100 - Math.random()*20;
              rg.r = 5;
            }
          }
          /* spine drift */
          for (var pi = 0; pi < this._NP; pi++) {
            this._jPts[pi*3+2] += this._jVel[pi]*dt;
            if (this._jPts[pi*3+2] > 100) this._jPts[pi*3+2] = -100;
          }
          this._spine.geometry.attributes.position.needsUpdate = true;
          this._root.rotation.z += 0.01 * dt;
        },
      });

      /* ====================================================================
         PROTOSTELLAR ACCRETION BURST — FU Orionis type outburst: disk thermal
         instability causes runaway accretion onto a young stellar object,
         boosting luminosity 100x for years to decades. We show the disk
         brightening, outflow jets strengthening, and an optical light echo.
         Position: (300, 500, -600).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("protostellar-accretion-burst", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(300, 500, -600);
          scene.add(this._root);

          /* YSO + disk */
          this._yso = new THREE.Mesh(
            new THREE.SphereGeometry(6, 12, 10),
            new THREE.MeshBasicMaterial({
              color: 0xffaa44,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._yso);

          /* disk particles */
          var ND = 5000;
          var dPts = new Float32Array(ND*3);
          var dCol = new Float32Array(ND*3);
          this._dPts = dPts;
          this._dAngle = new Float32Array(ND);
          this._dR = new Float32Array(ND);
          this._dCol = dCol;
          for (var di = 0; di < ND; di++) {
            var da = Math.random()*2*Math.PI;
            var dr = 10 + Math.random()*50;
            this._dAngle[di] = da;
            this._dR[di] = dr;
            dPts[di*3  ] = dr*Math.cos(da);
            dPts[di*3+1] = (Math.random()-0.5)*2*(10/dr);
            dPts[di*3+2] = dr*Math.sin(da);
            var heat = Math.max(0, 1 - dr/60);
            dCol[di*3  ] = 0.9 + 0.1*heat;
            dCol[di*3+1] = 0.4*heat + 0.1;
            dCol[di*3+2] = 0.05;
          }
          var dGeo = new THREE.BufferGeometry();
          dGeo.setAttribute("position", new THREE.BufferAttribute(dPts, 3));
          dGeo.setAttribute("color", new THREE.BufferAttribute(dCol, 3));
          this._disk = new THREE.Points(dGeo, new THREE.PointsMaterial({
            vertexColors: true, size: 0.9,
            transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._disk);

          /* bipolar outflow jets */
          var NJ = 2000;
          var ojPts = new Float32Array(NJ*3);
          this._ojPts = ojPts;
          this._ojVz = new Float32Array(NJ);
          for (var ji = 0; ji < NJ; ji++) {
            var jsign = ji < NJ/2 ? 1 : -1;
            ojPts[ji*3  ] = (Math.random()-0.5)*2;
            ojPts[ji*3+1] = jsign * (5 + Math.random()*55);
            ojPts[ji*3+2] = (Math.random()-0.5)*2;
            this._ojVz[ji] = jsign * (15 + Math.random()*15);
          }
          var ojGeo = new THREE.BufferGeometry();
          ojGeo.setAttribute("position", new THREE.BufferAttribute(ojPts, 3));
          this._jets = new THREE.Points(ojGeo, new THREE.PointsMaterial({
            color: 0x66eeff, size: 0.8,
            transparent: true, opacity: 0.3,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._jets);

          this._pabTime = 0; this._ND = ND; this._NJ = NJ;
          this._burstPhase = 0; this._burstPeriod = 6;
          console.log("[protostellar-accretion-burst] loaded at (300,500,-600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._pabTime += dt;
          var t = this._pabTime;
          var burst = 0.5 + 0.5*Math.sin((t / this._burstPeriod)*2*Math.PI);
          /* disk rotation */
          for (var di = 0; di < this._ND; di++) {
            this._dAngle[di] += (0.04 + 0.06*(15/this._dR[di])) * dt;
            this._dPts[di*3  ] = this._dR[di]*Math.cos(this._dAngle[di]);
            this._dPts[di*3+2] = this._dR[di]*Math.sin(this._dAngle[di]);
          }
          this._disk.geometry.attributes.position.needsUpdate = true;
          this._disk.material.opacity = 0.3 + 0.35*burst;
          /* YSO brightness */
          this._yso.scale.setScalar(1 + burst*0.6);
          this._yso.material.color.setRGB(1.0, 0.4 + 0.4*burst, 0.1*burst);
          /* jets strengthen in burst */
          for (var ji = 0; ji < this._NJ; ji++) {
            this._ojPts[ji*3+1] += this._ojVz[ji] * dt * (0.5 + burst);
            var absy = Math.abs(this._ojPts[ji*3+1]);
            if (absy > 60) {
              var sg = this._ojVz[ji] > 0 ? 1 : -1;
              this._ojPts[ji*3+1] = sg * 5;
            }
          }
          this._jets.material.opacity = 0.15 + 0.35*burst;
          this._jets.geometry.attributes.position.needsUpdate = true;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 78 injected! Lines:', lineCount);
