'use strict';
// inject-w75.cjs — Wave 75: interplanetary-dust-zodiacal-band + galactic-synchrotron-radio-haze
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("interplanetary-dust-zodiacal-band"')) {
  console.log('Wave 75 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-chromosphere-spicule-forest></a-entity>';
const HTML_INSERT = `      <a-entity stellar-chromosphere-spicule-forest></a-entity>
      <!-- ── INTERPLANETARY DUST ZODIACAL BAND — disc of sunlight-scattered dust ── -->
      <a-entity interplanetary-dust-zodiacal-band></a-entity>
      <!-- ── GALACTIC SYNCHROTRON RADIO HAZE — diffuse relativistic electron glow ── -->
      <a-entity galactic-synchrotron-radio-haze></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         INTERPLANETARY DUST ZODIACAL BAND — micron-sized silicate/carbon grains
         in the plane of the ecliptic scatter sunlight to produce the zodiacal
         light band. We render a flat torus of particles with inner brightness
         gradient, slightly warped, slowly precessing.
         Position: (500, -100, 800).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("interplanetary-dust-zodiacal-band", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(500, -100, 800);
          scene.add(this._root);

          /* sun */
          this._sun = new THREE.Mesh(
            new THREE.SphereGeometry(8, 12, 10),
            new THREE.MeshBasicMaterial({
              color: 0xffee88, transparent: true, opacity: 1.0,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._sun);

          /* zodiacal band particles */
          var NZ = 8000;
          var zPts = new Float32Array(NZ*3);
          var zCol = new Float32Array(NZ*3);
          this._zPts = zPts;
          this._zAngle = new Float32Array(NZ);
          this._zR = new Float32Array(NZ);
          this._zWarp = new Float32Array(NZ);
          for (var zi = 0; zi < NZ; zi++) {
            var ang = Math.random()*2*Math.PI;
            var r = 20 + Math.random()*90;
            this._zAngle[zi] = ang;
            this._zR[zi] = r;
            this._zWarp[zi] = (Math.random()-0.5)*0.15;
            /* brightness falls off with r */
            var bright = Math.max(0.05, 0.6*(1 - (r-20)/90));
            zCol[zi*3  ] = 0.9*bright;
            zCol[zi*3+1] = 0.8*bright;
            zCol[zi*3+2] = 0.6*bright;
          }
          var zGeo = new THREE.BufferGeometry();
          zGeo.setAttribute("position", new THREE.BufferAttribute(zPts, 3));
          zGeo.setAttribute("color", new THREE.BufferAttribute(zCol, 3));
          this._band = new THREE.Points(zGeo, new THREE.PointsMaterial({
            vertexColors: true, size: 0.8,
            transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._band);

          this._zTime = 0; this._NZ = NZ;
          console.log("[interplanetary-dust-zodiacal-band] loaded at (500,-100,800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._zTime += dt;
          this._root.rotation.y += 0.008 * dt;
          for (var zi = 0; zi < this._NZ; zi++) {
            this._zAngle[zi] += (0.05 + 0.03*(50/this._zR[zi])) * dt;
            var ang = this._zAngle[zi];
            var r = this._zR[zi];
            this._zPts[zi*3  ] = r*Math.cos(ang);
            this._zPts[zi*3+1] = this._zWarp[zi]*r;
            this._zPts[zi*3+2] = r*Math.sin(ang);
          }
          this._band.geometry.attributes.position.needsUpdate = true;
        },
      });

      /* ====================================================================
         GALACTIC SYNCHROTRON RADIO HAZE — relativistic electrons spiralling in
         the Milky Way's magnetic field emit synchrotron radiation detectable
         at radio frequencies. We visualise this as a diffuse elongated haze
         tracing galactic field lines, with slow oscillating intensity.
         Position: (-1500, 0, -500).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("galactic-synchrotron-radio-haze", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-1500, 0, -500);
          scene.add(this._root);

          /* field line traces — helical along galactic plane */
          this._fieldLines = [];
          var NL = 12;
          for (var li = 0; li < NL; li++) {
            var pts = [];
            var offY = (li-NL/2)*12;
            var phase = li*0.5;
            for (var lp = 0; lp <= 80; lp++) {
              var tx = (lp/80)*300 - 150;
              var ty = offY + 8*Math.sin((lp/80)*4*Math.PI + phase);
              var tz = 6*Math.cos((lp/80)*4*Math.PI + phase);
              pts.push(new THREE.Vector3(tx, ty, tz));
            }
            var lGeo = new THREE.BufferGeometry().setFromPoints(pts);
            var lLine = new THREE.Line(lGeo, new THREE.LineBasicMaterial({
              color: 0x5599ff, transparent: true, opacity: 0.18,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(lLine);
            this._fieldLines.push({ line: lLine, phase: phase });
          }

          /* haze particles */
          var NH = 4000;
          var hPts = new Float32Array(NH*3);
          this._hPts = hPts;
          this._hPhase = new Float32Array(NH);
          for (var hi = 0; hi < NH; hi++) {
            this._hPhase[hi] = Math.random()*2*Math.PI;
            hPts[hi*3  ] = (Math.random()-0.5)*320;
            hPts[hi*3+1] = (Math.random()-0.5)*80;
            hPts[hi*3+2] = (Math.random()-0.5)*80;
          }
          var hGeo = new THREE.BufferGeometry();
          hGeo.setAttribute("position", new THREE.BufferAttribute(hPts, 3));
          this._haze = new THREE.Points(hGeo, new THREE.PointsMaterial({
            color: 0x3377dd, size: 1.3,
            transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._haze);

          this._srTime = 0; this._NH = NH;
          console.log("[galactic-synchrotron-radio-haze] loaded at (-1500,0,-500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._srTime += dt;
          var t = this._srTime;
          /* oscillate field line brightness */
          for (var li = 0; li < this._fieldLines.length; li++) {
            var fl = this._fieldLines[li];
            fl.line.material.opacity = 0.1 + 0.1*Math.sin(t*0.4 + fl.phase);
          }
          /* drift haze particles along field */
          for (var hi = 0; hi < this._NH; hi++) {
            this._hPts[hi*3] += 5*dt;
            if (this._hPts[hi*3] > 160) this._hPts[hi*3] -= 320;
            this._hPts[hi*3+1] += 0.5*Math.sin(t*0.3 + this._hPhase[hi])*dt;
          }
          this._haze.material.opacity = 0.08 + 0.06*Math.sin(t*0.25);
          this._haze.geometry.attributes.position.needsUpdate = true;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 75 injected! Lines:', lineCount);
