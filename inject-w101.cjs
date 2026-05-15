'use strict';
// inject-w101.cjs — Wave 101: cosmic-pinch-instability-column + stellar-oscillatory-convection-plume
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-pinch-instability-column"')) {
  console.log('Wave 101 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-turbulent-cascade-plume></a-entity>';
const HTML_INSERT = `      <a-entity stellar-turbulent-cascade-plume></a-entity>
      <!-- ── COSMIC PINCH INSTABILITY COLUMN — Z-pinch column with sausage kink modes ── -->
      <a-entity cosmic-pinch-instability-column></a-entity>
      <!-- ── STELLAR OSCILLATORY CONVECTION PLUME — oscillatory convection rising plume ── -->
      <a-entity stellar-oscillatory-convection-plume></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC PINCH INSTABILITY COLUMN — Z-pinch plasma columns carry
         current; sausage (m=0) and kink (m=1) instabilities deform the
         column into constrictions and helical bends.
         Renders: a vertical plasma column with pinch constrictions.
         Position: (450, 600, -300).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-pinch-instability-column", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(450, 600, -300);
          scene.add(this._root);

          var NCL = 200;
          var cPts4 = new Float32Array(NCL*3);
          this._cPts4 = cPts4; this._NCL = NCL;
          var cGeo4 = new THREE.BufferGeometry();
          cGeo4.setAttribute("position", new THREE.BufferAttribute(cPts4, 3));
          this._colLine = new THREE.Line(cGeo4, new THREE.LineBasicMaterial({
            color: 0xff3300, transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending,
          }));
          this._root.add(this._colLine);

          var NPP = 2000;
          var pPts4 = new Float32Array(NPP*3);
          this._pPts4 = pPts4; this._NPP = NPP;
          var pGeo4 = new THREE.BufferGeometry();
          pGeo4.setAttribute("position", new THREE.BufferAttribute(pPts4, 3));
          this._plasma = new THREE.Points(pGeo4, new THREE.PointsMaterial({
            color: 0xff8844, size: 0.55, transparent: true, opacity: 0.4,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._plasma);
          this._cpicTime = 0;
          console.log("[cosmic-pinch-instability-column] loaded at (450,600,-300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cpicTime += dt;
          var t = this._cpicTime;
          /* sausage + kink deformation */
          for (var ci2 = 0; ci2 < this._NCL; ci2++) {
            var cf = ci2/(this._NCL-1);
            var cy = (cf-0.5)*30;
            var sausage = 2.5*(1-0.6*Math.abs(Math.sin(cf*Math.PI*4 + t*2)));
            var kink = 2*Math.sin(cf*Math.PI*2 + t*1.5);
            this._cPts4[ci2*3  ] = kink;
            this._cPts4[ci2*3+1] = cy;
            this._cPts4[ci2*3+2] = 0;
          }
          this._colLine.geometry.attributes.position.needsUpdate = true;
          for (var pi3 = 0; pi3 < this._NPP; pi3++) {
            var pf = Math.random();
            var py2 = (pf-0.5)*30;
            var pSausage = 2.5*(1-0.6*Math.abs(Math.sin(pf*Math.PI*4 + t*2)));
            var pKink2 = 2*Math.sin(pf*Math.PI*2 + t*1.5);
            var pA3 = Math.random()*2*Math.PI;
            var pR3 = Math.random()*pSausage;
            this._pPts4[pi3*3  ] = pKink2 + pR3*Math.cos(pA3);
            this._pPts4[pi3*3+1] = py2 + (Math.random()-0.5)*0.5;
            this._pPts4[pi3*3+2] = pR3*Math.sin(pA3);
          }
          this._plasma.geometry.attributes.position.needsUpdate = true;
          this._plasma.material.opacity = 0.35 + 0.1*Math.sin(t*2.7);
        },
      });

      /* ====================================================================
         STELLAR OSCILLATORY CONVECTION PLUME — giant rising plumes in
         stellar interiors carry heat; they oscillate in width as they
         ascend through density-stratified layers.
         Renders: a pulsating vertical plume with spread wings.
         Position: (-600, -300, 500).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("stellar-oscillatory-convection-plume", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-600, -300, 500);
          scene.add(this._root);

          var NOP = 3000;
          var oPts3 = new Float32Array(NOP*3);
          this._oPts3 = oPts3; this._NOP = NOP;
          var oGeo3 = new THREE.BufferGeometry();
          oGeo3.setAttribute("position", new THREE.BufferAttribute(oPts3, 3));
          this._plume = new THREE.Points(oGeo3, new THREE.PointsMaterial({
            color: 0xff9900, size: 0.65, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._plume);
          this._socpTime = 0;
          console.log("[stellar-oscillatory-convection-plume] loaded at (-600,-300,500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._socpTime += dt;
          var t = this._socpTime;
          for (var oi3 = 0; oi3 < this._NOP; oi3++) {
            var oh = Math.random()*25;
            var oWidth = 3 + 5*(oh/25) + 3*Math.sin(oh*0.5 + t*1.2);
            var oA4 = Math.random()*2*Math.PI;
            var oR4 = Math.random()*oWidth;
            this._oPts3[oi3*3  ] = oR4*Math.cos(oA4);
            this._oPts3[oi3*3+1] = oh - 12;
            this._oPts3[oi3*3+2] = oR4*Math.sin(oA4);
          }
          this._plume.geometry.attributes.position.needsUpdate = true;
          this._plume.material.opacity = 0.3 + 0.1*Math.sin(t*1.3);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 101 injected! Lines:', lineCount);
