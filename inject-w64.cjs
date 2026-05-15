'use strict';
// inject-w64.cjs — Wave 64: magnetospheric-kelvin-helmholtz + stellar-tidal-oscillation
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("magnetospheric-kelvin-helmholtz"')) {
  console.log('Wave 64 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity protoplanetary-ring-gap></a-entity>';
const HTML_INSERT = `      <a-entity protoplanetary-ring-gap></a-entity>
      <!-- ── MAGNETOSPHERIC KELVIN-HELMHOLTZ — vortex roll-up at magnetopause flank ── -->
      <a-entity magnetospheric-kelvin-helmholtz></a-entity>
      <!-- ── STELLAR TIDAL OSCILLATION — binary tide-induced f-mode pulsation on star ── -->
      <a-entity stellar-tidal-oscillation></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         MAGNETOSPHERIC KELVIN-HELMHOLTZ — when the solar wind flows past the
         magnetopause flanks, the velocity shear triggers the Kelvin-Helmholtz
         instability, rolling up into large (1-2 RE) vortices. These vortices
         transport solar wind mass and energy into the magnetosphere (viscous
         interaction) and can accelerate particles via reconnection at vortex edges.
         Observed by Cluster, THEMIS, MMS missions. We render the magnetopause as
         a surface with rolling KH vortices along its flank.
         Position: (-500, 600, 700).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("magnetospheric-kelvin-helmholtz", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-500, 600, 700);
          scene.add(this._root);

          /* magnetopause paraboloid surface */
          var MPW = 40;
          var MPH = 60;
          var mpPts = new Float32Array(MPW*MPH*3);
          var mpIdx = 0;
          for (var mui = 0; mui < MPW; mui++) {
            var mu = (mui/(MPW-1))*2*Math.PI;
            for (var mvi = 0; mvi < MPH; mvi++) {
              var mv = (mvi/(MPH-1) - 0.5)*180;
              var mr = 80 - 0.003*mv*mv;
              mpPts[mpIdx*3  ] = mr*Math.cos(mu);
              mpPts[mpIdx*3+1] = mv;
              mpPts[mpIdx*3+2] = mr*Math.sin(mu);
              mpIdx++;
            }
          }
          var mpGeo = new THREE.BufferGeometry();
          mpGeo.setAttribute("position", new THREE.BufferAttribute(mpPts, 3));
          this._mpSurf = new THREE.Points(mpGeo, new THREE.PointsMaterial({
            color: 0x3366cc, size: 1.2,
            transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._mpSurf);

          /* KH vortex centers on the flank */
          var NV = 6;
          this._vortexCenters = [];
          this._vortexMeshes = [];
          for (var vi = 0; vi < NV; vi++) {
            var va = (vi/NV)*Math.PI + Math.PI/2; /* flanks */
            var vc = new THREE.Vector3(80*Math.cos(va), -90+vi*36, 80*Math.sin(va));
            this._vortexCenters.push(vc);
            var vm = new THREE.Mesh(
              new THREE.TorusGeometry(14, 3.5, 6, 16),
              new THREE.MeshBasicMaterial({
                color: 0x44aaff, transparent: true, opacity: 0.2,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            vm.position.copy(vc);
            vm.rotation.x = Math.PI/2;
            vm.rotation.z = va;
            this._root.add(vm);
            this._vortexMeshes.push(vm);
          }

          /* solar wind particles */
          var NW = 300;
          var wPts = new Float32Array(NW*3);
          this._wPts = wPts;
          this._wPhase = new Float32Array(NW);
          for (var wi = 0; wi < NW; wi++) {
            this._wPhase[wi] = Math.random();
            var wy = -120 + this._wPhase[wi]*240;
            var wa = (Math.random()-0.5)*0.3 + Math.PI*0.5;
            var wr = 90 + (Math.random()-0.5)*20;
            wPts[wi*3  ] = wr*Math.cos(wa);
            wPts[wi*3+1] = wy;
            wPts[wi*3+2] = wr*Math.sin(wa);
          }
          var wGeo = new THREE.BufferGeometry();
          wGeo.setAttribute("position", new THREE.BufferAttribute(wPts, 3));
          this._wind = new THREE.Points(wGeo, new THREE.PointsMaterial({
            color: 0xffbb33, size: 1.5,
            transparent: true, opacity: 0.4,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._wind);

          this._khTime = 0;
          console.log("[magnetospheric-kelvin-helmholtz] loaded at (-500,600,700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._khTime += dt;
          /* vortices propagate tailward */
          for (var vi = 0; vi < this._vortexMeshes.length; vi++) {
            var vm = this._vortexMeshes[vi];
            vm.position.y += 8*dt;
            if (vm.position.y > 120) vm.position.y = -120;
            vm.rotation.y += 0.003*dt;
          }
          /* solar wind drift */
          var NW = this._wPhase.length;
          for (var wi = 0; wi < NW; wi++) {
            this._wPhase[wi] = (this._wPhase[wi] + 0.06*dt) % 1;
            this._wPts[wi*3+1] = -120 + this._wPhase[wi]*240;
          }
          this._wind.geometry.attributes.position.needsUpdate = true;
          this._root.rotation.y += 0.000025*dt;
        },
      });

      /* ====================================================================
         STELLAR TIDAL OSCILLATION — in heartbeat star systems (KOI-54,
         KIC 8164262), eccentric binary orbits excite resonant tidally-driven
         oscillation modes on both stars at periastron. The stars ring like
         bells, and TEOs (tidally excited oscillations) are detectable as
         peaks in the Kepler light curve at exact harmonics of the orbital
         frequency. We render a binary pair with rhythmic surface deformation
         (f-mode pulsation) in phase with their orbit.
         Position: (-200, 900, -400).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("stellar-tidal-oscillation", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-200, 900, -400);
          scene.add(this._root);

          /* two stars on elliptical orbit */
          this._starA = new THREE.Mesh(
            new THREE.SphereGeometry(14, 8, 7),
            new THREE.MeshBasicMaterial({
              color: 0xffffcc, transparent: true, opacity: 0.8,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._starB = new THREE.Mesh(
            new THREE.SphereGeometry(10, 8, 7),
            new THREE.MeshBasicMaterial({
              color: 0xffddaa, transparent: true, opacity: 0.75,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._starA);
          this._root.add(this._starB);

          /* orbital glow */
          this._root.add(new THREE.Mesh(
            new THREE.TorusGeometry(60, 0.8, 4, 80),
            new THREE.MeshBasicMaterial({
              color: 0x445577, transparent: true, opacity: 0.15,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          /* tidal distortion lobes on starA */
          this._tidalA = new THREE.Mesh(
            new THREE.SphereGeometry(1, 8, 7),
            new THREE.MeshBasicMaterial({
              color: 0xffee66, transparent: true, opacity: 0.18,
              blending: THREE.AdditiveBlending, depthWrite: false,
              wireframe: true,
            })
          );
          this._root.add(this._tidalA);

          this._stoTime = 0;
          this._orbAngle = 0;
          console.log("[stellar-tidal-oscillation] loaded at (-200,900,-400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._stoTime += dt;
          /* eccentric orbit */
          this._orbAngle += 0.12*dt;
          var e = 0.55; /* eccentricity */
          /* approximate orbit via parametric eccentric anomaly */
          var M = this._orbAngle % (2*Math.PI);
          var E = M + e*Math.sin(M)*(1+e*Math.cos(M))/(1-e*Math.cos(M));
          var ax = Math.cos(E);
          var ay = Math.sqrt(1-e*e)*Math.sin(E);
          var aOff = 60;
          this._starA.position.set(ax*aOff*0.45, 0, ay*aOff*0.45);
          this._starB.position.set(-ax*aOff*0.55, 0, -ay*aOff*0.55);

          /* tidal amplitude peaks at periastron (E near 0) */
          var dist = Math.sqrt((this._starA.position.x-this._starB.position.x)**2+(this._starA.position.z-this._starB.position.z)**2);
          var maxDist = aOff*(1+e);
          var tidalStr = 1 - dist/maxDist;
          var scaleA = 14 + tidalStr*6;
          this._starA.scale.setScalar(scaleA/14);
          /* tidal ellipsoid elongated toward companion */
          this._tidalA.position.copy(this._starA.position);
          var stretchDir = this._starB.position.clone().sub(this._starA.position).normalize();
          this._tidalA.scale.set(
            14 + tidalStr*12,
            14,
            14 + tidalStr*12
          );
          this._tidalA.lookAt(this._starB.position);
          this._tidalA.material.opacity = 0.08 + tidalStr*0.25;
          this._root.rotation.y += 0.00003*dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 64 injected! Lines:', lineCount);
