'use strict';
// inject-w68.cjs — Wave 68: circumstellar-volatility-wave + dark-energy-void-expansion
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("circumstellar-volatility-wave"')) {
  console.log('Wave 68 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity cosmic-accretion-shock></a-entity>';
const HTML_INSERT = `      <a-entity cosmic-accretion-shock></a-entity>
      <!-- ── CIRCUMSTELLAR VOLATILITY WAVE — thermal wave propagating through proto-disk ── -->
      <a-entity circumstellar-volatility-wave></a-entity>
      <!-- ── DARK ENERGY VOID EXPANSION — accelerating void bubble with cluster walls ── -->
      <a-entity dark-energy-void-expansion></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         CIRCUMSTELLAR VOLATILITY WAVE — during episodic outbursts in FU Ori
         class protostars, a thermal instability wave sweeps through the
         accretion disk. The ionization front / heating wave propagates
         outward, temporarily brightening the disk by 100x. We show a
         radially propagating brightness wave moving across a disk around a
         protostar, lit by rings of increasing radius that brighten and fade.
         Position: (-700, -800, 500).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("circumstellar-volatility-wave", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-700, -800, 500);
          scene.add(this._root);

          /* protostar core */
          this._protoStar = new THREE.Mesh(
            new THREE.SphereGeometry(10, 10, 10),
            new THREE.MeshBasicMaterial({
              color: 0xff9900, transparent: true, opacity: 0.7,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._protoStar);

          /* disk rings — 20 concentric rings at increasing radii */
          var NR = 20;
          this._rings = [];
          for (var ri = 0; ri < NR; ri++) {
            var rad = 15 + ri * 6;
            var rPts = [];
            for (var rp = 0; rp <= 64; rp++) {
              var ra = (rp/64)*2*Math.PI;
              rPts.push(new THREE.Vector3(rad*Math.cos(ra), 0, rad*Math.sin(ra)));
            }
            var rGeo = new THREE.BufferGeometry().setFromPoints(rPts);
            var rLine = new THREE.Line(rGeo, new THREE.LineBasicMaterial({
              color: 0xffcc44,
              transparent: true, opacity: 0.1,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(rLine);
            this._rings.push({ line: rLine, rad: rad, idx: ri });
          }
          this._NR = NR;

          /* disk particle field */
          var ND = 600;
          var dPts = new Float32Array(ND*3);
          this._dPts = dPts;
          this._dAngle = new Float32Array(ND);
          this._dRad = new Float32Array(ND);
          for (var di = 0; di < ND; di++) {
            this._dAngle[di] = Math.random()*2*Math.PI;
            this._dRad[di] = 15 + Math.random()*114;
          }
          var dGeo = new THREE.BufferGeometry();
          dGeo.setAttribute("position", new THREE.BufferAttribute(dPts, 3));
          this._diskPts = new THREE.Points(dGeo, new THREE.PointsMaterial({
            color: 0xffaa33, size: 1.5,
            transparent: true, opacity: 0.18,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._diskPts);

          this._cvwTime = 0;
          this._wavePhase = 0;
          this._wavePeriod = 18;
          this._ND = ND;
          console.log("[circumstellar-volatility-wave] loaded at (-700,-800,500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cvwTime += dt;
          this._wavePhase = (this._wavePhase + dt/this._wavePeriod) % 1;
          var wp = this._wavePhase;
          var maxRad = 15 + (this._NR-1)*6;
          var waveFront = 15 + wp * maxRad;
          for (var ri = 0; ri < this._NR; ri++) {
            var dist = Math.abs(this._rings[ri].rad - waveFront);
            var glow = Math.max(0, 1 - dist/25);
            this._rings[ri].line.material.opacity = 0.06 + 0.7*glow;
          }
          /* disk particles orbit */
          var t = this._cvwTime;
          for (var di = 0; di < this._ND; di++) {
            var speed = 0.4 / Math.sqrt(this._dRad[di]);
            this._dAngle[di] += speed * dt;
            this._dPts[di*3  ] = this._dRad[di]*Math.cos(this._dAngle[di]);
            this._dPts[di*3+1] = (Math.random()-0.5)*3;
            this._dPts[di*3+2] = this._dRad[di]*Math.sin(this._dAngle[di]);
          }
          this._diskPts.geometry.attributes.position.needsUpdate = true;
          this._root.rotation.y += 0.00004*dt;
        },
      });

      /* ====================================================================
         DARK ENERGY VOID EXPANSION — cosmic voids grow faster than
         structure because dark energy's negative pressure dominates inside
         them. We render an expanding void bubble: a sparse outer wall of
         compressed cluster filaments surrounding an evacuated interior that
         expands outward. Galaxy-cluster nodes pile up on the shell.
         Position: (0, -1400, 0).
         @alignment 8→26→48:480  @frequency 72  @domain self-evolve
      ==================================================================== */
      AFRAME.registerComponent("dark-energy-void-expansion", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(0, -1400, 0);
          scene.add(this._root);

          /* void interior — sparse nearly empty haze */
          var NV = 200;
          var vPts = new Float32Array(NV*3);
          for (var vi = 0; vi < NV; vi++) {
            var phi = Math.acos(2*Math.random()-1);
            var th = Math.random()*2*Math.PI;
            var rv = Math.random()*90;
            vPts[vi*3  ] = rv*Math.sin(phi)*Math.cos(th);
            vPts[vi*3+1] = rv*Math.sin(phi)*Math.sin(th);
            vPts[vi*3+2] = rv*Math.cos(phi);
          }
          var vGeo = new THREE.BufferGeometry();
          vGeo.setAttribute("position", new THREE.BufferAttribute(vPts, 3));
          this._voidPts = new THREE.Points(vGeo, new THREE.PointsMaterial({
            color: 0x113333, size: 1,
            transparent: true, opacity: 0.08,
            blending: THREE.NormalBlending, depthWrite: false,
          }));
          this._root.add(this._voidPts);

          /* expanding shell — cluster filaments compressed onto wall */
          var NS = 600;
          var sPts = new Float32Array(NS*3);
          this._sPts = sPts;
          this._sBaseR = new Float32Array(NS);
          this._sPhi = new Float32Array(NS);
          this._sTh = new Float32Array(NS);
          for (var si = 0; si < NS; si++) {
            this._sPhi[si] = Math.acos(2*Math.random()-1);
            this._sTh[si] = Math.random()*2*Math.PI;
            this._sBaseR[si] = 90 + Math.random()*20;
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(sPts, 3));
          this._shell = new THREE.Points(sGeo, new THREE.PointsMaterial({
            color: 0xaaccdd, size: 2,
            transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._shell);

          /* cluster nodes on wall */
          var NCL = 12;
          this._clusters = [];
          for (var ci = 0; ci < NCL; ci++) {
            var cphi = Math.acos(2*Math.random()-1);
            var cth = Math.random()*2*Math.PI;
            var cr = 95;
            var cx = cr*Math.sin(cphi)*Math.cos(cth);
            var cy = cr*Math.sin(cphi)*Math.sin(cth);
            var cz = cr*Math.cos(cphi);
            var cl = new THREE.Mesh(
              new THREE.SphereGeometry(3+Math.random()*3, 5, 5),
              new THREE.MeshBasicMaterial({
                color: 0xffffff, transparent: true, opacity: 0.5,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            cl.position.set(cx, cy, cz);
            this._root.add(cl);
            this._clusters.push({ mesh: cl, phi: cphi, th: cth, baseR: cr });
          }

          this._devTime = 0;
          this._NS = NS;
          this._NCL = NCL;
          console.log("[dark-energy-void-expansion] loaded at (0,-1400,0)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._devTime += dt;
          var t = this._devTime;
          /* slow expansion */
          var expansion = 1 + 0.015*t;
          for (var si = 0; si < this._NS; si++) {
            var r = this._sBaseR[si] * expansion;
            this._sPts[si*3  ] = r*Math.sin(this._sPhi[si])*Math.cos(this._sTh[si]);
            this._sPts[si*3+1] = r*Math.sin(this._sPhi[si])*Math.sin(this._sTh[si]);
            this._sPts[si*3+2] = r*Math.cos(this._sPhi[si]);
          }
          this._shell.geometry.attributes.position.needsUpdate = true;
          for (var ci = 0; ci < this._NCL; ci++) {
            var cr = this._clusters[ci].baseR * expansion;
            this._clusters[ci].mesh.position.set(
              cr*Math.sin(this._clusters[ci].phi)*Math.cos(this._clusters[ci].th),
              cr*Math.sin(this._clusters[ci].phi)*Math.sin(this._clusters[ci].th),
              cr*Math.cos(this._clusters[ci].phi)
            );
          }
          this._root.rotation.y += 0.00002*dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 68 injected! Lines:', lineCount);
