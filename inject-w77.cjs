'use strict';
// inject-w77.cjs — Wave 77: stellar-wind-termination-shell + cosmic-pair-instability-remnant
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("stellar-wind-termination-shell"')) {
  console.log('Wave 77 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity magnetar-crust-fracture-quake></a-entity>';
const HTML_INSERT = `      <a-entity magnetar-crust-fracture-quake></a-entity>
      <!-- ── STELLAR WIND TERMINATION SHELL — hot shocked bubble around OB star ── -->
      <a-entity stellar-wind-termination-shell></a-entity>
      <!-- ── COSMIC PAIR INSTABILITY REMNANT — no-remnant supernova ejecta cloud ── -->
      <a-entity cosmic-pair-instability-remnant></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         STELLAR WIND TERMINATION SHELL — a massive OB star drives a fast
         stellar wind that decelerates at a termination shock, forming a hot
         bubble of shocked plasma inside a swept-up shell. We render a central
         star, an inner shock boundary, and a turbulent outer dense shell.
         Position: (700, 200, -900).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-wind-termination-shell", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(700, 200, -900);
          scene.add(this._root);

          /* OB star */
          this._star = new THREE.Mesh(
            new THREE.SphereGeometry(10, 14, 10),
            new THREE.MeshBasicMaterial({
              color: 0xaaddff,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._star);

          /* inner termination shock (hot bubble boundary) */
          this._shock = new THREE.Mesh(
            new THREE.SphereGeometry(40, 20, 14),
            new THREE.MeshBasicMaterial({
              color: 0x88aaff, wireframe: false,
              transparent: true, opacity: 0.06,
              blending: THREE.AdditiveBlending, depthWrite: false,
              side: THREE.BackSide,
            })
          );
          this._root.add(this._shock);

          /* outer swept-up shell particles */
          var NS = 6000;
          var sPts = new Float32Array(NS*3);
          this._sPts = sPts;
          this._sPhase = new Float32Array(NS);
          for (var si = 0; si < NS; si++) {
            var sTheta = Math.acos(2*Math.random()-1);
            var sPhi = Math.random()*2*Math.PI;
            var sr = 70 + (Math.random()-0.5)*8;
            sPts[si*3  ] = sr*Math.sin(sTheta)*Math.cos(sPhi);
            sPts[si*3+1] = sr*Math.cos(sTheta);
            sPts[si*3+2] = sr*Math.sin(sTheta)*Math.sin(sPhi);
            this._sPhase[si] = Math.random()*2*Math.PI;
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(sPts, 3));
          this._shell = new THREE.Points(sGeo, new THREE.PointsMaterial({
            color: 0x6699cc, size: 1.0,
            transparent: true, opacity: 0.3,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._shell);

          /* wind stream particles inside bubble */
          var NW = 3000;
          var wPts = new Float32Array(NW*3);
          this._wPts = wPts;
          this._wVel = new Float32Array(NW*3);
          for (var wi = 0; wi < NW; wi++) {
            var wT = Math.acos(2*Math.random()-1);
            var wP = Math.random()*2*Math.PI;
            var wr = Math.random()*38;
            wPts[wi*3  ] = wr*Math.sin(wT)*Math.cos(wP);
            wPts[wi*3+1] = wr*Math.cos(wT);
            wPts[wi*3+2] = wr*Math.sin(wT)*Math.sin(wP);
            var spd = 8 + Math.random()*5;
            this._wVel[wi*3  ] = spd*Math.sin(wT)*Math.cos(wP);
            this._wVel[wi*3+1] = spd*Math.cos(wT);
            this._wVel[wi*3+2] = spd*Math.sin(wT)*Math.sin(wP);
          }
          var wGeo = new THREE.BufferGeometry();
          wGeo.setAttribute("position", new THREE.BufferAttribute(wPts, 3));
          this._wind = new THREE.Points(wGeo, new THREE.PointsMaterial({
            color: 0xccddff, size: 0.6,
            transparent: true, opacity: 0.18,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._wind);

          this._wtTime = 0; this._NS = NS; this._NW = NW;
          console.log("[stellar-wind-termination-shell] loaded at (700,200,-900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._wtTime += dt;
          var t = this._wtTime;
          this._root.rotation.y += 0.015 * dt;
          /* pulse star */
          var sp = 1 + 0.08*Math.sin(t*3.1);
          this._star.scale.setScalar(sp);
          /* shell shimmer */
          for (var si = 0; si < this._NS; si++) {
            this._sPts[si*3+1] += 0.4*Math.sin(t*0.5 + this._sPhase[si])*dt;
          }
          this._shell.geometry.attributes.position.needsUpdate = true;
          /* wind outflow */
          for (var wi = 0; wi < this._NW; wi++) {
            this._wPts[wi*3  ] += this._wVel[wi*3  ] * dt;
            this._wPts[wi*3+1] += this._wVel[wi*3+1] * dt;
            this._wPts[wi*3+2] += this._wVel[wi*3+2] * dt;
            var r2 = this._wPts[wi*3]*this._wPts[wi*3] +
                     this._wPts[wi*3+1]*this._wPts[wi*3+1] +
                     this._wPts[wi*3+2]*this._wPts[wi*3+2];
            if (r2 > 38*38) {
              this._wPts[wi*3] = 0; this._wPts[wi*3+1] = 0; this._wPts[wi*3+2] = 0;
            }
          }
          this._wind.geometry.attributes.position.needsUpdate = true;
          this._shock.material.opacity = 0.05 + 0.04*Math.sin(t*1.2);
        },
      });

      /* ====================================================================
         COSMIC PAIR INSTABILITY REMNANT — a star of 140-260 Msun develops
         pair production in its core, triggering runaway oxygen burning that
         completely unbinds the star with NO compact remnant. The expanding
         cloud of radioactive nickel/iron glows brilliantly for months.
         Position: (-800, -200, 1200).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("cosmic-pair-instability-remnant", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-800, -200, 1200);
          scene.add(this._root);

          /* expanding ejecta blob cloud */
          var NE = 7000;
          var ePts = new Float32Array(NE*3);
          var eCol = new Float32Array(NE*3);
          this._ePts = ePts;
          this._eVel = new Float32Array(NE*3);
          this._ePhase = new Float32Array(NE);
          for (var ei = 0; ei < NE; ei++) {
            var eT = Math.acos(2*Math.random()-1);
            var eP = Math.random()*2*Math.PI;
            var er0 = Math.random()*5;
            ePts[ei*3  ] = er0*Math.sin(eT)*Math.cos(eP);
            ePts[ei*3+1] = er0*Math.cos(eT);
            ePts[ei*3+2] = er0*Math.sin(eT)*Math.sin(eP);
            var espd = 12 + Math.random()*25;
            this._eVel[ei*3  ] = espd*Math.sin(eT)*Math.cos(eP);
            this._eVel[ei*3+1] = espd*Math.cos(eT);
            this._eVel[ei*3+2] = espd*Math.sin(eT)*Math.sin(eP);
            this._ePhase[ei] = Math.random()*2*Math.PI;
            /* Ni/Fe decay glow — orange/yellow */
            var heat = 0.5 + 0.5*Math.random();
            eCol[ei*3  ] = 1.0*heat;
            eCol[ei*3+1] = 0.55*heat;
            eCol[ei*3+2] = 0.1*heat;
          }
          var eGeo = new THREE.BufferGeometry();
          eGeo.setAttribute("position", new THREE.BufferAttribute(ePts, 3));
          eGeo.setAttribute("color", new THREE.BufferAttribute(eCol, 3));
          this._ejecta = new THREE.Points(eGeo, new THREE.PointsMaterial({
            vertexColors: true, size: 1.2,
            transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._ejecta);

          /* bright core flash */
          this._core = new THREE.Mesh(
            new THREE.SphereGeometry(6, 10, 8),
            new THREE.MeshBasicMaterial({
              color: 0xffddaa,
              transparent: true, opacity: 1.0,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._core);

          this._piTime = 0; this._NE = NE;
          this._maxR = 100; this._period = 5; this._resetPending = false;
          console.log("[cosmic-pair-instability-remnant] loaded at (-800,-200,1200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._piTime += dt;
          var t = this._piTime;
          var cycleT = t % this._period;
          var frac = cycleT / this._period;
          /* expand */
          for (var ei = 0; ei < this._NE; ei++) {
            this._ePts[ei*3  ] += this._eVel[ei*3  ] * dt * 0.5;
            this._ePts[ei*3+1] += this._eVel[ei*3+1] * dt * 0.5;
            this._ePts[ei*3+2] += this._eVel[ei*3+2] * dt * 0.5;
            var r2 = this._ePts[ei*3]*this._ePts[ei*3] +
                     this._ePts[ei*3+1]*this._ePts[ei*3+1] +
                     this._ePts[ei*3+2]*this._ePts[ei*3+2];
            if (r2 > this._maxR*this._maxR) {
              this._ePts[ei*3] = 0; this._ePts[ei*3+1] = 0; this._ePts[ei*3+2] = 0;
            }
          }
          this._ejecta.geometry.attributes.position.needsUpdate = true;
          this._ejecta.material.opacity = Math.max(0.08, 0.55 - 0.4*frac);
          /* core flashes then dims */
          this._core.material.opacity = Math.max(0, 1.0 - frac*3);
          this._core.scale.setScalar(1 + frac*4);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 77 injected! Lines:', lineCount);
