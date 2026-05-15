"use strict";
// inject-w79.cjs — Wave 79: cosmic-magnetorotational-instability + stellar-debris-stream-fallback
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes(
    'AFRAME.registerComponent("cosmic-magnetorotational-instability"',
  )
) {
  console.log("Wave 79 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR = "      <a-entity protostellar-accretion-burst></a-entity>";
const HTML_INSERT = `      <a-entity protostellar-accretion-burst></a-entity>
      <!-- ── COSMIC MAGNETOROTATIONAL INSTABILITY — turbulent accretion disc channels ── -->
      <a-entity cosmic-magnetorotational-instability></a-entity>
      <!-- ── STELLAR DEBRIS STREAM FALLBACK — TDE stream returning to BH ── -->
      <a-entity stellar-debris-stream-fallback></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC MAGNETOROTATIONAL INSTABILITY — MRI drives turbulence inside
         accretion disks, generating Maxwell stresses that transport angular
         momentum outward. We visualise a turbulent shearing disk with radial
         field channel modes rendered as glowing flux tubes riding on a
         differential-rotation disk of particles.
         Position: (-400, -350, -800).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-magnetorotational-instability", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-400, -350, -800);
          scene.add(this._root);

          /* differential-rotation disk */
          var ND = 6500;
          var dPts = new Float32Array(ND*3);
          var dCol = new Float32Array(ND*3);
          this._dPts = dPts;
          this._dAngle = new Float32Array(ND);
          this._dR = new Float32Array(ND);
          for (var di = 0; di < ND; di++) {
            var da = Math.random()*2*Math.PI;
            var dr = 12 + Math.random()*55;
            this._dAngle[di] = da;
            this._dR[di] = dr;
            dPts[di*3  ] = dr*Math.cos(da);
            dPts[di*3+1] = (Math.random()-0.5)*2.5;
            dPts[di*3+2] = dr*Math.sin(da);
            var h = Math.max(0, 1-(dr-12)/55);
            dCol[di*3  ] = 0.7+0.3*h; dCol[di*3+1] = 0.3*h; dCol[di*3+2] = 0.5*h;
          }
          var dGeo = new THREE.BufferGeometry();
          dGeo.setAttribute("position", new THREE.BufferAttribute(dPts, 3));
          dGeo.setAttribute("color", new THREE.BufferAttribute(dCol, 3));
          this._disk = new THREE.Points(dGeo, new THREE.PointsMaterial({
            vertexColors: true, size: 0.7,
            transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._disk);

          /* MRI channel mode flux tubes */
          this._tubes = [];
          var NTubes = 12;
          for (var ti = 0; ti < NTubes; ti++) {
            var tr = 18 + Math.random()*35;
            var ta = Math.random()*2*Math.PI;
            var pts2 = [];
            for (var k = 0; k < 10; k++) {
              var ang = ta + k*0.15;
              pts2.push(new THREE.Vector3(tr*Math.cos(ang), (Math.random()-0.5)*5, tr*Math.sin(ang)));
            }
            var curve = new THREE.CatmullRomCurve3(pts2);
            var tubeGeo = new THREE.TubeGeometry(curve, 12, 0.4 + Math.random()*0.5, 5, false);
            var tubeMat = new THREE.MeshBasicMaterial({
              color: new THREE.Color().setHSL(0.6+Math.random()*0.15, 1, 0.6),
              transparent: true, opacity: 0.25,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var tube = new THREE.Mesh(tubeGeo, tubeMat);
            this._root.add(tube);
            this._tubes.push({ mesh: tube, r: tr, baseA: ta, omega: 0.3/Math.sqrt(tr) });
          }

          this._mriTime = 0; this._ND = ND; this._NT = NTubes;
          console.log("[cosmic-magnetorotational-instability] loaded at (-400,-350,-800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._mriTime += dt;
          var t = this._mriTime;
          for (var di = 0; di < this._ND; di++) {
            this._dAngle[di] += (0.08/Math.sqrt(this._dR[di])) * dt * 60;
            this._dPts[di*3  ] = this._dR[di]*Math.cos(this._dAngle[di]);
            this._dPts[di*3+2] = this._dR[di]*Math.sin(this._dAngle[di]);
            this._dPts[di*3+1] += 0.3*(Math.random()-0.5)*dt;
            this._dPts[di*3+1] = Math.max(-2, Math.min(2, this._dPts[di*3+1]));
          }
          this._disk.geometry.attributes.position.needsUpdate = true;
          for (var ti = 0; ti < this._NT; ti++) {
            this._tubes[ti].mesh.rotation.y += this._tubes[ti].omega * dt * 60;
            this._tubes[ti].mesh.material.opacity = 0.15 + 0.2*Math.abs(Math.sin(t*0.7+ti));
          }
        },
      });

      /* ====================================================================
         STELLAR DEBRIS STREAM FALLBACK — after a tidal disruption event the
         bound half of the star's debris falls back onto the black hole in an
         elongated stream that circularises and heats. We render the infalling
         arc stream, a growing proto-accretion ring, and shocks at the
         self-intersection point.
         Position: (900, -100, -200).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-debris-stream-fallback", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(900, -100, -200);
          scene.add(this._root);

          /* central BH */
          this._bh = new THREE.Mesh(
            new THREE.SphereGeometry(5, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
          );
          this._root.add(this._bh);
          /* BH glow ring */
          var bhRing = new THREE.Mesh(
            new THREE.TorusGeometry(8, 2, 6, 24),
            new THREE.MeshBasicMaterial({
              color: 0xff6600,
              transparent: true, opacity: 0.4,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(bhRing);

          /* stream particles on elliptical arc */
          var NS = 5500;
          var sPts = new Float32Array(NS*3);
          var sCol = new Float32Array(NS*3);
          this._sPts = sPts;
          this._sT = new Float32Array(NS);
          this._sSpeed = new Float32Array(NS);
          for (var si = 0; si < NS; si++) {
            var st = Math.random();
            this._sT[si] = st;
            this._sSpeed[si] = 0.04 + Math.random()*0.02;
            var angle = st*1.8*Math.PI;
            var a = 60, b = 20;
            sPts[si*3  ] = a*Math.cos(angle);
            sPts[si*3+1] = (Math.random()-0.5)*3;
            sPts[si*3+2] = b*Math.sin(angle);
            var heat = Math.max(0, 1-st);
            sCol[si*3  ] = 1.0; sCol[si*3+1] = 0.4*heat; sCol[si*3+2] = 0.1*heat;
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(sPts, 3));
          sGeo.setAttribute("color", new THREE.BufferAttribute(sCol, 3));
          this._stream = new THREE.Points(sGeo, new THREE.PointsMaterial({
            vertexColors: true, size: 1.0,
            transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._stream);

          /* self-intersection shock flare */
          this._shock = new THREE.Mesh(
            new THREE.SphereGeometry(3, 8, 6),
            new THREE.MeshBasicMaterial({
              color: 0xffffaa,
              transparent: true, opacity: 0.8,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._shock.position.set(-58, 0, 8);
          this._root.add(this._shock);

          this._sdfTime = 0; this._NS = NS; this._bhRing = bhRing;
          console.log("[stellar-debris-stream-fallback] loaded at (900,-100,-200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._sdfTime += dt;
          var t = this._sdfTime;
          for (var si = 0; si < this._NS; si++) {
            this._sT[si] = (this._sT[si] + this._sSpeed[si]*dt) % 1;
            var angle = this._sT[si]*1.8*Math.PI;
            this._sPts[si*3  ] = 60*Math.cos(angle);
            this._sPts[si*3+2] = 20*Math.sin(angle);
          }
          this._stream.geometry.attributes.position.needsUpdate = true;
          this._shock.material.opacity = 0.6 + 0.35*Math.sin(t*4);
          this._shock.scale.setScalar(1 + 0.4*Math.sin(t*6));
          this._bhRing.rotation.z += 0.4*dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 79 injected! Lines:", lineCount);
