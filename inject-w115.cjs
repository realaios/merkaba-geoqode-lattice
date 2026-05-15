'use strict';
// inject-w115.cjs — Wave 115: cosmic-firehose-plasma-wave + stellar-ellerman-bomb-burst
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-firehose-plasma-wave"')) {
  console.log('Wave 115 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-prominence-tornado-vortex></a-entity>';
const HTML_INSERT = `      <a-entity stellar-prominence-tornado-vortex></a-entity>
      <!-- ── COSMIC FIREHOSE PLASMA WAVE — kinetic firehose instability waves on a hot magnetized beam ── -->
      <a-entity cosmic-firehose-plasma-wave></a-entity>
      <!-- ── STELLAR ELLERMAN BOMB BURST — compact brightenings in photospheric flux tube reconnection ── -->
      <a-entity stellar-ellerman-bomb-burst></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC FIREHOSE PLASMA WAVE — the firehose instability occurs when
         parallel plasma pressure exceeds perpendicular + magnetic tension;
         it launches transverse undulations along the magnetic field that
         scramble field-line ordering in solar wind and ICM beams.
         Renders: a sinuous magnetic-field-line bundle undulating transversely.
         Position: (800, -200, 400).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-firehose-plasma-wave", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(800, -200, 400);
          scene.add(this._root);

          var NFIB38 = 12;
          this._fibers = [];
          for (var fi38 = 0; fi38 < NFIB38; fi38++) {
            var NFP38 = 100;
            var fPts38 = new Float32Array(NFP38*3);
            var fGeo38 = new THREE.BufferGeometry();
            fGeo38.setAttribute("position", new THREE.BufferAttribute(fPts38, 3));
            var fLine38 = new THREE.Line(fGeo38, new THREE.LineBasicMaterial({
              color: new AFRAME.THREE.Color().setHSL(0.55 + fi38*0.03, 1.0, 0.6),
              transparent: true, opacity: 0.45,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(fLine38);
            this._fibers.push({ line: fLine38, pts: fPts38,
              phase: fi38*0.52, amp: 0.5 + (fi38%4)*0.25 });
          }
          this._cfpwTime = 0;
          console.log("[cosmic-firehose-plasma-wave] loaded at (800,-200,400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cfpwTime += dt;
          var t = this._cfpwTime;
          for (var fi39 = 0; fi39 < this._fibers.length; fi39++) {
            var fib = this._fibers[fi39];
            var NFP39 = fib.pts.length/3;
            for (var fpi39 = 0; fpi39 < NFP39; fpi39++) {
              var sf39 = fpi39/(NFP39-1);
              var x39 = (sf39 - 0.5)*14;
              var y39 = fib.amp*Math.sin(2*Math.PI*sf39*2 + t*1.5 + fib.phase);
              var z39 = fib.amp*0.4*Math.cos(2*Math.PI*sf39*3 + t + fib.phase);
              fib.pts[fpi39*3  ] = x39;
              fib.pts[fpi39*3+1] = y39;
              fib.pts[fpi39*3+2] = z39;
            }
            fib.line.geometry.attributes.position.needsUpdate = true;
          }
        },
      });

      /* ====================================================================
         STELLAR ELLERMAN BOMB BURST — tiny energetic brightenings in the
         solar photosphere where opposite-polarity flux fragments collide in
         intergranular lanes, triggering brief reconnection jets visible in
         H-alpha line wings.
         Renders: small point flashes distributed over a disk surface.
         Position: (-300, -300, 800).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-ellerman-bomb-burst", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-300, -300, 800);
          scene.add(this._root);

          var NPTS38 = 400;
          var ePts38 = new Float32Array(NPTS38*3);
          this._eGeo38 = new THREE.BufferGeometry();
          this._eGeo38.setAttribute("position", new THREE.BufferAttribute(ePts38, 3));
          this._eMesh38 = new THREE.Points(this._eGeo38, new THREE.PointsMaterial({
            color: 0xffdd44, size: 0.18, transparent: true, opacity: 0.7,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._eMesh38);
          this._ePts38 = ePts38;
          this._eBirths = new Float32Array(NPTS38);
          this._eLifes = new Float32Array(NPTS38);
          var NOW38 = -9999;
          for (var ei38 = 0; ei38 < NPTS38; ei38++) {
            this._eBirths[ei38] = NOW38;
            this._eLifes[ei38] = 0.4 + Math.random()*0.6;
          }
          this._eClock = 0;
          this._ePool = [];
          for (var ei38b = 0; ei38b < NPTS38; ei38b++) this._ePool.push(ei38b);
          this._eBombsX = []; this._eBombsZ = [];
          for (var bi38 = 0; bi38 < 30; bi38++) {
            var ba38 = Math.random()*2*Math.PI;
            var br38 = Math.sqrt(Math.random())*4;
            this._eBombsX.push(br38*Math.cos(ba38));
            this._eBombsZ.push(br38*Math.sin(ba38));
          }
          this._sebbTime = 0;
          console.log("[stellar-ellerman-bomb-burst] loaded at (-300,-300,800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._sebbTime += dt;
          var t = this._sebbTime;
          if (Math.floor(t*20) > this._eClock) {
            this._eClock = Math.floor(t*20);
            if (this._ePool.length > 0) {
              var n38 = Math.floor(Math.random()*3)+1;
              for (var ni38 = 0; ni38 < n38 && this._ePool.length > 0; ni38++) {
                var idx38 = this._ePool.pop();
                var bi38b = Math.floor(Math.random()*this._eBombsX.length);
                this._ePts38[idx38*3  ] = this._eBombsX[bi38b] + (Math.random()-0.5)*0.3;
                this._ePts38[idx38*3+1] = 0;
                this._ePts38[idx38*3+2] = this._eBombsZ[bi38b] + (Math.random()-0.5)*0.3;
                this._eBirths[idx38] = t;
              }
            }
          }
          for (var ei39 = 0; ei39 < this._eBirths.length; ei39++) {
            var age39 = t - this._eBirths[ei39];
            if (age39 > this._eLifes[ei39]) {
              this._ePts38[ei39*3+1] = -9999;
              if (this._ePool.indexOf(ei39) < 0) this._ePool.push(ei39);
            }
          }
          this._eGeo38.attributes.position.needsUpdate = true;
          this._eMesh38.material.opacity = 0.5 + 0.2*Math.sin(t*10);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 115 injected! Lines:', lineCount);
