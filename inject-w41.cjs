"use strict";
// inject-w41.cjs — Wave 41: interstellar-comet-outburst + magnetar-atmosphere
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("interstellar-comet-outburst"')) {
  console.log("Wave 41 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity stellar-mass-bh-binary></a-entity>";
const HTML_INSERT = `      <a-entity stellar-mass-bh-binary></a-entity>
      <!-- ── INTERSTELLAR COMET OUTBURST — 2I/Borisov-style visitor with outburst jets ── -->
      <a-entity interstellar-comet-outburst></a-entity>
      <!-- ── MAGNETAR ATMOSPHERE — ultra-magnetised NS with solid crust quake and QPO ── -->
      <a-entity magnetar-atmosphere></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         INTERSTELLAR COMET OUTBURST — an interstellar comet (like 2I/Borisov)
         visits the inner solar system and undergoes a sudden outburst. The
         nucleus sublimates volatile ices, blasting dust and gas jets into a
         bright extended coma and twin ion+dust tails.
         Position: (-300, 100, 600).
         Components:
           - Nucleus: tiny icy dirty sphere (tumbling)
           - Coma: bright near-spherical gas cloud (500 pts, cyan)
           - Dust tail: broad curved tail (400 pts, yellow-white)
           - Ion tail: straight blue ion tail pointing antisunward (300 pts)
           - Outburst jets: 3 narrow jets from active pits (200 pts each)
           - Extended halo: faint outermost coma shell (200 pts)
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("interstellar-comet-outburst", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-300, 100, 600);
          scene.add(this._root);

          /* nucleus */
          this._nucleus = new THREE.Mesh(
            new THREE.SphereGeometry(3, 6, 4),
            new THREE.MeshBasicMaterial({ color: 0x555533 })
          );
          this._root.add(this._nucleus);

          /* coma */
          var CN = 500;
          var cPts = new Float32Array(CN * 3);
          for (var ci = 0; ci < CN; ci++) {
            var cp = Math.acos(2*Math.random()-1), ca = Math.random()*2*Math.PI;
            var cr = Math.random()*22;
            cPts[ci*3  ] = cr*Math.sin(cp)*Math.cos(ca);
            cPts[ci*3+1] = cr*Math.cos(cp);
            cPts[ci*3+2] = cr*Math.sin(cp)*Math.sin(ca);
          }
          var cGeo = new THREE.BufferGeometry();
          cGeo.setAttribute("position", new THREE.BufferAttribute(cPts, 3));
          this._comaMat = new THREE.PointsMaterial({
            color: 0x66ffcc, size: 2.0, transparent: true, opacity: 0.50,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(cGeo, this._comaMat));

          /* dust tail */
          var DTN = 400;
          var dtPts = new Float32Array(DTN * 3);
          for (var dti = 0; dti < DTN; dti++) {
            var dtT = dti/DTN;
            dtPts[dti*3  ] = (Math.random()-0.5)*30*(1+dtT);
            dtPts[dti*3+1] = (Math.random()-0.5)*15*(1+dtT*0.5);
            dtPts[dti*3+2] = -dtT*80 + (Math.random()-0.5)*15;
          }
          var dtGeo = new THREE.BufferGeometry();
          dtGeo.setAttribute("position", new THREE.BufferAttribute(dtPts, 3));
          this._root.add(new THREE.Points(dtGeo, new THREE.PointsMaterial({
            color: 0xffeeaa, size: 1.8, transparent: true, opacity: 0.30,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ion tail */
          var ITN = 300;
          var itPts = new Float32Array(ITN * 3);
          for (var iti = 0; iti < ITN; iti++) {
            var itT = iti/ITN;
            itPts[iti*3  ] = (Math.random()-0.5)*8;
            itPts[iti*3+1] = (Math.random()-0.5)*8;
            itPts[iti*3+2] = -itT*120 + (Math.random()-0.5)*6;
          }
          var itGeo = new THREE.BufferGeometry();
          itGeo.setAttribute("position", new THREE.BufferAttribute(itPts, 3));
          this._root.add(new THREE.Points(itGeo, new THREE.PointsMaterial({
            color: 0x0099ff, size: 1.5, transparent: true, opacity: 0.30,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* 3 outburst jets */
          var jetColors = [0xffffff, 0xaaffee, 0xffff88];
          for (var ji = 0; ji < 3; ji++) {
            var JN = 200;
            var jPts = new Float32Array(JN * 3);
            var jBaseAngle = (ji/3)*2*Math.PI;
            for (var jk = 0; jk < JN; jk++) {
              var jT = jk/JN;
              jPts[jk*3  ] = Math.cos(jBaseAngle)*(1+jT*12) + (Math.random()-0.5)*3;
              jPts[jk*3+1] = jT*15 + (Math.random()-0.5)*3;
              jPts[jk*3+2] = Math.sin(jBaseAngle)*(1+jT*12) + (Math.random()-0.5)*3;
            }
            var jGeo = new THREE.BufferGeometry();
            jGeo.setAttribute("position", new THREE.BufferAttribute(jPts, 3));
            this._root.add(new THREE.Points(jGeo, new THREE.PointsMaterial({
              color: jetColors[ji], size: 1.8, transparent: true, opacity: 0.45,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* extended halo */
          var EHN = 200;
          var ehPts = new Float32Array(EHN * 3);
          for (var ehi = 0; ehi < EHN; ehi++) {
            var ehp = Math.acos(2*Math.random()-1), eha = Math.random()*2*Math.PI;
            var ehr = 28 + Math.random()*10;
            ehPts[ehi*3  ] = ehr*Math.sin(ehp)*Math.cos(eha);
            ehPts[ehi*3+1] = ehr*Math.cos(ehp);
            ehPts[ehi*3+2] = ehr*Math.sin(ehp)*Math.sin(eha);
          }
          var ehGeo = new THREE.BufferGeometry();
          ehGeo.setAttribute("position", new THREE.BufferAttribute(ehPts, 3));
          this._root.add(new THREE.Points(ehGeo, new THREE.PointsMaterial({
            color: 0x66ffcc, size: 1.5, transparent: true, opacity: 0.10,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._icTime = 0;
          console.log("[interstellar-comet-outburst] loaded at (-300,100,600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._icTime += dt;

          /* nucleus tumble */
          this._nucleus.rotation.x += 0.4 * dt;
          this._nucleus.rotation.y += 0.7 * dt;

          /* coma brightness pulses with outburst */
          this._comaMat.opacity = 0.40 + 0.20*Math.abs(Math.sin(this._icTime * 0.3));

          this._root.rotation.y += 0.0003 * dt;
        },
      });

      /* ====================================================================
         MAGNETAR ATMOSPHERE — a magnetar (ultra-magnetised neutron star) has
         a unique solid crust that can quake. The atmosphere is a thin plasma
         bounded by 10^15 G magnetic field. Shows crustal quake ring, QPO
         oscillation standing waves, polar cap hot spots, and magnetosphere.
         Position: (-900, -400, 200).
         Components:
           - NS surface: small dense sphere with polar hot-spot color
           - Quake ring: bright expanding equatorial ring after quake event
           - QPO standing waves: 4 field-aligned oscillation modes (rings on B field lines)
           - Polar cap hot spots: two bright patches at poles
           - Magnetosphere: outer elongated field cage (sparse points)
           - Burst ejecta: short-lived burst spray from surface
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("magnetar-atmosphere", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-900, -400, 200);
          scene.add(this._root);

          /* NS surface */
          this._ns = new THREE.Mesh(
            new THREE.SphereGeometry(8, 12, 10),
            new THREE.MeshBasicMaterial({ color: 0xaaddff })
          );
          this._root.add(this._ns);

          /* polar hot spots */
          var hotColors = [0xffffff, 0xffaaaa];
          for (var pi = 0; pi < 2; pi++) {
            var hm = new THREE.Mesh(
              new THREE.SphereGeometry(2, 6, 4),
              new THREE.MeshBasicMaterial({
                color: hotColors[pi], transparent: true, opacity: 0.8,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            hm.position.y = (pi===0?1:-1)*8.5;
            this._root.add(hm);
          }

          /* quake ring */
          this._quakeRingMat = new THREE.MeshBasicMaterial({
            color: 0xffff44, transparent: true, opacity: 0.0,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._quakeRing = new THREE.Mesh(
            new THREE.TorusGeometry(9, 0.8, 4, 40),
            this._quakeRingMat
          );
          this._root.add(this._quakeRing);

          /* QPO rings — 4 oscillation modes on B-field lines */
          this._qpoRings = [];
          for (var qi = 0; qi < 4; qi++) {
            var qGeo = new THREE.TorusGeometry(10 + qi*6, 0.5, 4, 36);
            var qMat = new THREE.MeshBasicMaterial({
              color: 0x00ffaa, transparent: true, opacity: 0.20,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var qMesh = new THREE.Mesh(qGeo, qMat);
            qMesh.rotation.x = Math.PI*(0.2 + qi*0.15);
            this._root.add(qMesh);
            this._qpoRings.push({ mesh: qMesh, mat: qMat, phase: qi*1.6 });
          }

          /* magnetosphere sparse field cage */
          var MN = 500;
          var mPts = new Float32Array(MN * 3);
          for (var mi = 0; mi < MN; mi++) {
            var mth = Math.random()*2*Math.PI;
            var mph = (Math.random()-0.5)*Math.PI;
            var mr = 20 + Math.random()*60;
            mPts[mi*3  ] = mr*Math.cos(mth)*Math.cos(mph);
            mPts[mi*3+1] = mr*2*Math.sin(mph); /* elongated along axis */
            mPts[mi*3+2] = mr*Math.sin(mth)*Math.cos(mph);
          }
          var mGeo = new THREE.BufferGeometry();
          mGeo.setAttribute("position", new THREE.BufferAttribute(mPts, 3));
          this._root.add(new THREE.Points(mGeo, new THREE.PointsMaterial({
            color: 0x4488ff, size: 1.5, transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* burst ejecta */
          this._burst = [];
          for (var bi = 0; bi < 150; bi++) {
            var bp = Math.acos(2*Math.random()-1), ba = Math.random()*2*Math.PI;
            this._burst.push({
              dir: new THREE.Vector3(Math.sin(bp)*Math.cos(ba), Math.cos(bp), Math.sin(bp)*Math.sin(ba)),
              speed: 8 + Math.random()*20,
              life: Math.random(),
            });
          }
          var burstPts = new Float32Array(150 * 3);
          var burstGeo = new THREE.BufferGeometry();
          burstGeo.setAttribute("position", new THREE.BufferAttribute(burstPts, 3));
          this._burstMat = new THREE.PointsMaterial({
            color: 0xffffff, size: 2.0, transparent: true, opacity: 0.0,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._burstGeo = burstGeo;
          this._root.add(new THREE.Points(burstGeo, this._burstMat));

          this._maTime = 0;
          this._quakeTimer = 0;
          this._burstActive = false;
          console.log("[magnetar-atmosphere] loaded at (-900,-400,200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._maTime += dt;
          this._quakeTimer += dt;

          /* QPO oscillations */
          for (var qi = 0; qi < this._qpoRings.length; qi++) {
            var qr = this._qpoRings[qi];
            qr.mat.opacity = 0.12 + 0.14*Math.sin(this._maTime*5.0*(1+qi*0.5) + qr.phase);
            qr.mesh.rotation.y += 0.001*(qi+1) * dt;
          }

          /* quake event every 8 seconds */
          if (this._quakeTimer > 8) {
            this._quakeTimer = 0;
            this._burstActive = true;
          }

          if (this._burstActive) {
            var qp = Math.min(1, (8 - this._quakeTimer) / 8);
            this._quakeRingMat.opacity = qp > 0.95 ? (1-qp)*20 : 0;
            this._quakeRing.scale.setScalar(1 + (1 - qp)*3);
          }

          this._root.rotation.y += 0.0001 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 41 injected! Lines:", lineCount);
