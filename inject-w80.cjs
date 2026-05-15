'use strict';
// inject-w80.cjs — Wave 80: cosmic-spaghettification-funnel + galactic-wind-outflow
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-spaghettification-funnel"')) {
  console.log('Wave 80 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

const HTML_ANCHOR = '      <a-entity stellar-debris-stream-fallback></a-entity>';
const HTML_INSERT = `      <a-entity stellar-debris-stream-fallback></a-entity>
      <!-- ── COSMIC SPAGHETTIFICATION FUNNEL — tidal stretching near BH event horizon ── -->
      <a-entity cosmic-spaghettification-funnel></a-entity>
      <!-- ── GALACTIC WIND OUTFLOW — starburst superwind carving superbubble ── -->
      <a-entity galactic-wind-outflow></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC SPAGHETTIFICATION FUNNEL — an object approaching a stellar-mass
         BH is stretched radially (spaghettified) by the tidal gradient. We
         render a funnel of elongated particle streams converging on the BH,
         blue-shifted near the horizon, with a photon sphere glimmer.
         Position: (0, 300, -1800).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("cosmic-spaghettification-funnel", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(0, 300, -1800);
          scene.add(this._root);

          /* BH core */
          this._bh = new THREE.Mesh(
            new THREE.SphereGeometry(6, 12, 10),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
          );
          this._root.add(this._bh);

          /* photon sphere ring */
          var pSphere = new THREE.Mesh(
            new THREE.TorusGeometry(9.5, 0.8, 6, 28),
            new THREE.MeshBasicMaterial({
              color: 0xddffff,
              transparent: true, opacity: 0.5,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          pSphere.rotation.x = Math.PI/2;
          this._root.add(pSphere);
          this._pSphere = pSphere;

          /* spaghettified stream filaments */
          var NF = 8;
          this._filaments = [];
          for (var fi = 0; fi < NF; fi++) {
            var angle = (fi/NF)*2*Math.PI;
            var NK = 3000;
            var fPts = new Float32Array(NK*3);
            var fT = new Float32Array(NK);
            for (var ki = 0; ki < NK; ki++) {
              var t0 = Math.random();
              fT[ki] = t0;
              var dist = 12 + t0*70;
              fPts[ki*3  ] = dist*Math.cos(angle) + (Math.random()-0.5)*dist*0.15;
              fPts[ki*3+1] = (Math.random()-0.5)*dist*0.15;
              fPts[ki*3+2] = dist*Math.sin(angle) + (Math.random()-0.5)*dist*0.15;
            }
            var fGeo = new THREE.BufferGeometry();
            fGeo.setAttribute("position", new THREE.BufferAttribute(fPts, 3));
            fGeo.setAttribute("t_pos", new THREE.BufferAttribute(fT, 1));
            var heat = 1 - fi/NF;
            var fMat = new THREE.PointsMaterial({
              color: new THREE.Color(0.2 + 0.8*heat, 0.5*heat, 1.0 - 0.5*heat),
              size: 0.8,
              transparent: true, opacity: 0.4,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var fMesh = new THREE.Points(fGeo, fMat);
            this._root.add(fMesh);
            this._filaments.push({ mesh: fMesh, pts: fPts, t: fT, angle: angle, NK: NK });
          }

          this._sfTime = 0;
          console.log("[cosmic-spaghettification-funnel] loaded at (0,300,-1800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._sfTime += dt;
          var tt = this._sfTime;
          /* slowly rotate whole root */
          this._root.rotation.z += 0.03 * dt;
          this._pSphere.material.opacity = 0.3 + 0.25*Math.sin(tt*2.5);
          /* drift streams inward */
          for (var fi = 0; fi < this._filaments.length; fi++) {
            var fil = this._filaments[fi];
            for (var ki = 0; ki < fil.NK; ki++) {
              fil.t[ki] -= 0.015 * dt;
              if (fil.t[ki] < 0) fil.t[ki] = 1;
              var dist = 12 + fil.t[ki]*70;
              fil.pts[ki*3  ] = dist*Math.cos(fil.angle) + (Math.random()-0.5)*dist*0.1;
              fil.pts[ki*3+1] = (Math.random()-0.5)*dist*0.12;
              fil.pts[ki*3+2] = dist*Math.sin(fil.angle) + (Math.random()-0.5)*dist*0.1;
            }
            fil.mesh.geometry.attributes.position.needsUpdate = true;
            fil.mesh.material.opacity = 0.3 + 0.15*Math.sin(tt*1.5+fi);
          }
        },
      });

      /* ====================================================================
         GALACTIC WIND OUTFLOW — intense star formation drives a superwind that
         excavates a hot superbubble extending kiloparsecs above/below the disk.
         We show the starburst disk, two conical outflow plumes of hot gas, and
         a diffuse halo enriched by entrained metal-rich gas.
         Position: (-1100, 400, 600).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("galactic-wind-outflow", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-1100, 400, 600);
          scene.add(this._root);

          /* starburst disk */
          var ND = 4000;
          var dPts = new Float32Array(ND*3);
          var dCol = new Float32Array(ND*3);
          this._dPts = dPts;
          this._dAngle = new Float32Array(ND);
          this._dR = new Float32Array(ND);
          for (var di = 0; di < ND; di++) {
            var da = Math.random()*2*Math.PI;
            var dr = 3 + Math.random()*30;
            this._dAngle[di] = da;
            this._dR[di] = dr;
            dPts[di*3  ] = dr*Math.cos(da);
            dPts[di*3+1] = (Math.random()-0.5)*2;
            dPts[di*3+2] = dr*Math.sin(da);
            var h = Math.max(0, 1-dr/30);
            dCol[di*3  ] = 1.0; dCol[di*3+1] = 0.6*h+0.2; dCol[di*3+2] = 0.1;
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

          /* conical outflow plumes (top + bottom) */
          var buildCone = function(sign) {
            var NC = 3500;
            var cPts = new Float32Array(NC*3);
            var cVy = new Float32Array(NC);
            for (var ci = 0; ci < NC; ci++) {
              var cy = sign * (5 + Math.random()*80);
              var halfAngle = 0.25;
              var cr = Math.abs(cy)*Math.tan(halfAngle)*(0.3+0.7*Math.random());
              var ca = Math.random()*2*Math.PI;
              cPts[ci*3  ] = cr*Math.cos(ca);
              cPts[ci*3+1] = cy;
              cPts[ci*3+2] = cr*Math.sin(ca);
              cVy[ci] = sign*(10+Math.random()*12);
            }
            return { pts: cPts, vy: cVy, NC: NC };
          };
          this._coneA = buildCone(1);
          this._coneB = buildCone(-1);

          var cGeoA = new THREE.BufferGeometry();
          cGeoA.setAttribute("position", new THREE.BufferAttribute(this._coneA.pts, 3));
          this._plume = new THREE.Points(cGeoA, new THREE.PointsMaterial({
            color: 0xff7733, size: 1.1,
            transparent: true, opacity: 0.3,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._plume);

          var cGeoB = new THREE.BufferGeometry();
          cGeoB.setAttribute("position", new THREE.BufferAttribute(this._coneB.pts, 3));
          this._plumeB = new THREE.Points(cGeoB, new THREE.PointsMaterial({
            color: 0xff5511, size: 1.1,
            transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._plumeB);

          this._gwTime = 0; this._ND = ND;
          console.log("[galactic-wind-outflow] loaded at (-1100,400,600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._gwTime += dt;
          var t = this._gwTime;
          /* rotate disk */
          for (var di = 0; di < this._ND; di++) {
            this._dAngle[di] += 0.05*(20/Math.max(5, this._dR[di]))*dt;
            this._dPts[di*3  ] = this._dR[di]*Math.cos(this._dAngle[di]);
            this._dPts[di*3+2] = this._dR[di]*Math.sin(this._dAngle[di]);
          }
          this._disk.geometry.attributes.position.needsUpdate = true;
          /* advect cones */
          var advect = function(cone, mesh, sign, maxH, dt2) {
            for (var ci = 0; ci < cone.NC; ci++) {
              cone.pts[ci*3+1] += cone.vy[ci]*dt2;
              if (Math.abs(cone.pts[ci*3+1]) > maxH) {
                var cy = sign*(5 + Math.random()*10);
                cone.pts[ci*3] = 0; cone.pts[ci*3+1] = cy; cone.pts[ci*3+2] = 0;
              }
            }
            mesh.geometry.attributes.position.needsUpdate = true;
          };
          advect(this._coneA, this._plume, 1, 85, dt);
          advect(this._coneB, this._plumeB, -1, 85, dt);
          this._plume.material.opacity = 0.2 + 0.15*Math.sin(t*0.7);
          this._plumeB.material.opacity = 0.18 + 0.12*Math.sin(t*0.9);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 80 injected! Lines:', lineCount);
