'use strict';
// inject-w76.cjs — Wave 76: cosmic-void-bubble-nucleation + magnetar-crust-fracture-quake
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-void-bubble-nucleation"')) {
  console.log('Wave 76 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity galactic-synchrotron-radio-haze></a-entity>';
const HTML_INSERT = `      <a-entity galactic-synchrotron-radio-haze></a-entity>
      <!-- ── COSMIC VOID BUBBLE NUCLEATION — false-vacuum bubble expanding ── -->
      <a-entity cosmic-void-bubble-nucleation></a-entity>
      <!-- ── MAGNETAR CRUST FRACTURE QUAKE — seismic mode oscillations ── -->
      <a-entity magnetar-crust-fracture-quake></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC VOID BUBBLE NUCLEATION — in eternal inflation models, bubbles
         of true vacuum nucleate within the false vacuum and expand at nearly
         the speed of light. We show concentric expanding shells born at random
         positions within a void, each shell thinning and brightening as it grows.
         Position: (-400, 300, 1800).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-void-bubble-nucleation", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-400, 300, 1800);
          scene.add(this._root);

          /* bubble pool */
          var NB = 8;
          this._bubbles = [];
          for (var bi = 0; bi < NB; bi++) {
            var geo = new THREE.SphereGeometry(1, 14, 10);
            var mat = new THREE.MeshBasicMaterial({
              color: 0x88ccff, wireframe: true,
              transparent: true, opacity: 0,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(
              (Math.random()-0.5)*60,
              (Math.random()-0.5)*60,
              (Math.random()-0.5)*60
            );
            this._root.add(mesh);
            this._bubbles.push({
              mesh: mesh,
              r: 0, active: false,
              birthTime: bi * 2.5,
              maxR: 60 + Math.random()*60,
              speed: 20 + Math.random()*20,
              origin: mesh.position.clone(),
            });
          }

          /* ambient void particles */
          var NV = 1200;
          var vPts = new Float32Array(NV*3);
          for (var vi = 0; vi < NV; vi++) {
            vPts[vi*3  ] = (Math.random()-0.5)*300;
            vPts[vi*3+1] = (Math.random()-0.5)*300;
            vPts[vi*3+2] = (Math.random()-0.5)*300;
          }
          var vGeo = new THREE.BufferGeometry();
          vGeo.setAttribute("position", new THREE.BufferAttribute(vPts, 3));
          this._void = new THREE.Points(vGeo, new THREE.PointsMaterial({
            color: 0x334466, size: 0.8,
            transparent: true, opacity: 0.1,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._void);

          this._vbTime = 0; this._NB = NB;
          console.log("[cosmic-void-bubble-nucleation] loaded at (-400,300,1800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._vbTime += dt;
          var t = this._vbTime;
          for (var bi = 0; bi < this._NB; bi++) {
            var b = this._bubbles[bi];
            if (t < b.birthTime) continue;
            if (!b.active) { b.active = true; b.r = 0; }
            b.r += b.speed * dt;
            if (b.r >= b.maxR) {
              /* reset */
              b.r = 0; b.active = false;
              b.birthTime = t + 1 + Math.random()*3;
              b.mesh.position.set(
                (Math.random()-0.5)*60,
                (Math.random()-0.5)*60,
                (Math.random()-0.5)*60
              );
              continue;
            }
            var frac = b.r / b.maxR;
            b.mesh.scale.setScalar(b.r);
            b.mesh.material.opacity = 0.4 * (1-frac) * (1 - Math.abs(frac-0.5)*2 + 0.5);
          }
        },
      });

      /* ====================================================================
         MAGNETAR CRUST FRACTURE QUAKE — magnetars undergo starquakes when
         magnetic stress fractures the rigid crystalline crust, releasing energy
         and exciting toroidal seismic modes. We show a neutron star mesh whose
         crust tiles crack and glow along random fracture planes, then re-seal.
         Position: (1200, -400, 200).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("magnetar-crust-fracture-quake", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(1200, -400, 200);
          scene.add(this._root);

          /* NS body */
          this._ns = new THREE.Mesh(
            new THREE.SphereGeometry(22, 20, 16),
            new THREE.MeshBasicMaterial({
              color: 0x334455, transparent: true, opacity: 0.9,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._ns);

          /* crust lattice wireframe */
          this._crust = new THREE.Mesh(
            new THREE.SphereGeometry(23, 16, 12),
            new THREE.MeshBasicMaterial({
              color: 0x5588aa, wireframe: true,
              transparent: true, opacity: 0.25,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._crust);

          /* fracture line pool */
          this._fractures = [];
          for (var fi = 0; fi < 6; fi++) {
            var pts = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0)];
            var fGeo = new THREE.BufferGeometry().setFromPoints(pts);
            var fLine = new THREE.Line(fGeo, new THREE.LineBasicMaterial({
              color: 0xff8833, transparent: true, opacity: 0,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(fLine);
            this._fractures.push({ line: fLine, life: 0, maxLife: 0, active: false });
          }

          /* magnetic field lines */
          for (var ml = 0; ml < 6; ml++) {
            var mPts = [];
            var mPhi = ml*Math.PI/3;
            for (var mp = 0; mp <= 30; mp++) {
              var mT = (mp/30)*Math.PI;
              var mR = 23 + 15*Math.sin(mT);
              mPts.push(new THREE.Vector3(
                mR*Math.sin(mT)*Math.cos(mPhi),
                mR*Math.cos(mT),
                mR*Math.sin(mT)*Math.sin(mPhi)
              ));
            }
            var mGeo = new THREE.BufferGeometry().setFromPoints(mPts);
            this._root.add(new THREE.Line(mGeo, new THREE.LineBasicMaterial({
              color: 0x4488ff, transparent: true, opacity: 0.2,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          this._mcTime = 0; this._nextQuake = 1;
          console.log("[magnetar-crust-fracture-quake] loaded at (1200,-400,200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._mcTime += dt;
          this._root.rotation.y += 0.12 * dt;
          /* trigger quake */
          if (this._mcTime > this._nextQuake) {
            this._nextQuake = this._mcTime + 1.5 + Math.random()*2;
            /* spawn fracture lines */
            for (var fi = 0; fi < this._fractures.length; fi++) {
              var f = this._fractures[fi];
              if (!f.active) {
                f.active = true; f.life = 0; f.maxLife = 0.5 + Math.random()*0.8;
                /* random great-circle segment on sphere */
                var theta = Math.acos(2*Math.random()-1);
                var phi = Math.random()*2*Math.PI;
                var nx = Math.sin(theta)*Math.cos(phi);
                var ny = Math.cos(theta);
                var nz = Math.sin(theta)*Math.sin(phi);
                var perp = new AFRAME.THREE.Vector3(ny,-nx,0).normalize().multiplyScalar(23);
                var pArr = f.line.geometry.attributes.position;
                pArr.setXYZ(0, nx*23, ny*23, nz*23);
                pArr.setXYZ(1, nx*23 + perp.x, ny*23 + perp.y, nz*23 + perp.z);
                pArr.needsUpdate = true;
                f.line.material.opacity = 0.9;
                /* crust glow on quake */
                this._crust.material.opacity = 0.7;
                break;
              }
            }
          }
          this._crust.material.opacity = Math.max(0.25, this._crust.material.opacity - 2*dt);
          /* age fractures */
          for (var fi2 = 0; fi2 < this._fractures.length; fi2++) {
            var f2 = this._fractures[fi2];
            if (f2.active) {
              f2.life += dt;
              f2.line.material.opacity = Math.max(0, 0.9*(1 - f2.life/f2.maxLife));
              if (f2.life >= f2.maxLife) f2.active = false;
            }
          }
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 76 injected! Lines:', lineCount);
