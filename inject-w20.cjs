"use strict";
// inject-w20.cjs — Wave 20: neutron-collision + dark-flow
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("neutron-collision"')) {
  console.log("Wave 20 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity cosmic-tsunami></a-entity>";
const HTML_INSERT = `      <a-entity cosmic-tsunami></a-entity>
      <!-- ── NEUTRON COLLISION — binary neutron star merger, kilonova flash ── -->
      <a-entity neutron-collision></a-entity>
      <!-- ── DARK FLOW — mysterious large-scale bulk flow pulling galaxy clusters ── -->
      <a-entity dark-flow></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         NEUTRON COLLISION — two compact neutron stars spiralling inward
         and merging in a kilonova: a brief blinding flash + heavy-element jet.
         Position: (-700, 400, 200).
         Cycle: 12s spiral → 0.5s merge flash → 4s jet → 7.5s cooldown → repeat.
         Components:
           - Star A and B: small bright spheres (r=8) orbiting each other
           - Inspiral dust: 400 particles trailing the stars in tightening spirals
           - Merge flash: SphereGeometry r=1 scaling 0→300, intense white-gold
           - Heavy-element jet: two narrow cones of r-process material (gold/platinum hue)
             shooting in opposite directions along the polar axis after merger
           - Afterglow cloud: 200 dim expanding particles fading over 7.5s
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("neutron-collision", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-700, 400, 200);
          scene.add(this._root);

          /* ── star meshes ── */
          var sMat = new THREE.MeshBasicMaterial({ color: 0xeeeeff });
          this._starA = new THREE.Mesh(new THREE.SphereGeometry(8, 8, 6), sMat.clone());
          this._starB = new THREE.Mesh(new THREE.SphereGeometry(8, 8, 6), sMat.clone());
          this._root.add(this._starA);
          this._root.add(this._starB);

          /* ── inspiral trail particles (400) ── */
          var TN = 400;
          var tPts = new Float32Array(TN * 3);
          /* start at random positions — will be updated each tick */
          for (var ti = 0; ti < TN; ti++) {
            tPts[ti*3] = tPts[ti*3+1] = tPts[ti*3+2] = 0;
          }
          var tGeo = new THREE.BufferGeometry();
          tGeo.setAttribute("position", new THREE.BufferAttribute(tPts, 3));
          this._trailMat = new THREE.PointsMaterial({
            color: 0x88aaff, size: 2.2, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._trail = new THREE.Points(tGeo, this._trailMat);
          this._root.add(this._trail);

          /* ── merge flash sphere ── */
          this._flashMat = new THREE.MeshBasicMaterial({
            color: 0xffffaa, transparent: true, opacity: 0.0, depthWrite: false,
          });
          this._flash = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), this._flashMat);
          this._root.add(this._flash);

          /* ── jets (two opposite cones of Points) ── */
          var JN = 150;
          var jetPtsUp = new Float32Array(JN * 3);
          var jetPtsDn = new Float32Array(JN * 3);
          for (var ji = 0; ji < JN; ji++) {
            var jt = ji / (JN - 1);
            var jR = jt * 12;
            var jA = Math.random() * 2 * Math.PI;
            var jY = jt * 280 + (Math.random() - 0.5) * 15;
            jetPtsUp[ji*3  ] = jR * Math.cos(jA);
            jetPtsUp[ji*3+1] = jY;
            jetPtsUp[ji*3+2] = jR * Math.sin(jA);
            jetPtsDn[ji*3  ] = jR * Math.cos(jA);
            jetPtsDn[ji*3+1] = -jY;
            jetPtsDn[ji*3+2] = jR * Math.sin(jA);
          }
          var jGeoUp = new THREE.BufferGeometry();
          jGeoUp.setAttribute("position", new THREE.BufferAttribute(jetPtsUp, 3));
          var jGeoDn = new THREE.BufferGeometry();
          jGeoDn.setAttribute("position", new THREE.BufferAttribute(jetPtsDn, 3));
          this._jetMat = new THREE.PointsMaterial({
            color: 0xffcc44, size: 3.5, transparent: true, opacity: 0.0,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._jetUp = new THREE.Points(jGeoUp, this._jetMat);
          this._jetDn = new THREE.Points(jGeoDn, this._jetMat);
          this._root.add(this._jetUp);
          this._root.add(this._jetDn);

          this._ncTime = 0;
          this._CYCLE = 24.0; /* full cycle period */
          this._SPIRAL = 12.0;
          this._FLASH_END = 12.5;
          this._JET_END = 16.5;
          console.log("[neutron-collision] spiralling at (-700,400,200) cycle=" + this._CYCLE + "s");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._ncTime += dt;
          var THREE = AFRAME.THREE;
          var t = this._ncTime % this._CYCLE;

          if (t < this._SPIRAL) {
            /* ── inspiral phase ── */
            var prog = t / this._SPIRAL;
            var orbitR = 80 * (1 - prog * 0.88); /* shrinks from 80→10 */
            var omega = (1 + prog * 6) * 2.0; /* speeds up */
            var angle = this._ncTime * omega;
            this._starA.position.set(orbitR * Math.cos(angle), 0, orbitR * Math.sin(angle));
            this._starB.position.set(-orbitR * Math.cos(angle), 0, -orbitR * Math.sin(angle));
            this._starA.visible = this._starB.visible = true;
            this._trailMat.opacity = 0.55;

            /* trail particles orbit along a multi-wrap spiral */
            var tPos = this._trail.geometry.attributes.position.array;
            for (var ti = 0; ti < 400; ti++) {
              var tFrac = ti / 399;
              var tR = 80 * (1 - (prog * 0.88 + tFrac * 0.08));
              var tA = angle - tFrac * 6;
              tPos[ti*3  ] = tR * Math.cos(tA) * (ti % 2 === 0 ? 1 : -1);
              tPos[ti*3+1] = (Math.random() - 0.5) * 8;
              tPos[ti*3+2] = tR * Math.sin(tA) * (ti % 2 === 0 ? 1 : -1);
            }
            this._trail.geometry.attributes.position.needsUpdate = true;
            this._flashMat.opacity = 0;
            this._jetMat.opacity = 0;

          } else if (t < this._FLASH_END) {
            /* ── merge flash ── */
            var fp = (t - this._SPIRAL) / (this._FLASH_END - this._SPIRAL);
            this._starA.visible = this._starB.visible = false;
            this._trailMat.opacity = 0;
            this._flash.scale.setScalar(fp < 0.5 ? fp * 600 : (1 - fp) * 600);
            this._flashMat.opacity = fp < 0.5 ? fp * 2 : (1 - fp) * 2;
            this._jetMat.opacity = 0;

          } else if (t < this._JET_END) {
            /* ── kilonova jet ── */
            var jp = (t - this._FLASH_END) / (this._JET_END - this._FLASH_END);
            this._flashMat.opacity = 0;
            this._flash.scale.setScalar(1);
            this._jetMat.opacity = jp < 0.2 ? jp * 5 : (jp > 0.75 ? (1 - jp) * 4 : 1.0);

          } else {
            /* ── cooldown ── */
            this._flashMat.opacity = 0;
            this._jetMat.opacity = 0;
            this._trailMat.opacity = 0;
            this._starA.visible = this._starB.visible = false;
          }
        },
      });

      /* ====================================================================
         DARK FLOW — an anomalous large-scale streaming motion pulling clusters
         of galaxies toward an unseen attractor beyond the observable horizon.
         Visualised as 1200 dim arrow-like streaks all drifting in one direction.
         Position: (400, 300, -500).
         Components:
           - 1200 elongated streak particles drifting +X toward attractor
           - Particles wrap after 600 units, reset to the left side
           - Brightness inversely proportional to distance from attractor plane
           - 10 galaxy-cluster blobs: dim spheres being pulled along
           - Very faint convergence marker: glow at far edge (+X)
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("dark-flow", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(400, 300, -500);
          scene.add(this._root);

          /* ── stream particles (1200 streaks) ── */
          var SN = 1200;
          var sPts = new Float32Array(SN * 3);
          this._streamVels = new Float32Array(SN);
          var spreadY = 300, spreadZ = 300, rangeX = 600;
          for (var si = 0; si < SN; si++) {
            sPts[si*3  ] = (Math.random() - 0.5) * rangeX;
            sPts[si*3+1] = (Math.random() - 0.5) * spreadY;
            sPts[si*3+2] = (Math.random() - 0.5) * spreadZ;
            this._streamVels[si] = 30 + Math.random() * 50; /* km/s analogue */
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(sPts, 3));
          this._streamMat = new THREE.PointsMaterial({
            color: 0x8866bb, size: 2.0, transparent: true, opacity: 0.30,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._stream = new THREE.Points(sGeo, this._streamMat);
          this._root.add(this._stream);
          this._streamPts = sPts;
          this._RANGE_X = rangeX;

          /* ── galaxy cluster blobs (10) ── */
          this._clusters = [];
          for (var ci = 0; ci < 10; ci++) {
            var cMesh = new THREE.Mesh(
              new THREE.SphereGeometry(12 + Math.random() * 18, 6, 5),
              new THREE.MeshBasicMaterial({
                color: 0xaa99dd, transparent: true,
                opacity: 0.12 + Math.random() * 0.10, depthWrite: false,
              })
            );
            cMesh.position.set(
              (Math.random() - 0.5) * this._RANGE_X,
              (Math.random() - 0.5) * spreadY * 0.8,
              (Math.random() - 0.5) * spreadZ * 0.8
            );
            this._root.add(cMesh);
            this._clusters.push({ mesh: cMesh, vel: 18 + Math.random() * 22 });
          }

          /* ── convergence glow at attractor edge ── */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(40, 10, 8),
            new THREE.MeshBasicMaterial({
              color: 0xcc88ff, transparent: true, opacity: 0.08, depthWrite: false,
            })
          ).position.set(350, 0, 0));

          this._dfTime = 0;
          console.log("[dark-flow] streaming at (400,300,-500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._dfTime += dt;
          var half = this._RANGE_X * 0.5;

          /* ── stream drifts +X ── */
          var sPos = this._stream.geometry.attributes.position.array;
          for (var si = 0; si < 1200; si++) {
            sPos[si*3] += this._streamVels[si] * dt;
            if (sPos[si*3] > half) sPos[si*3] -= this._RANGE_X;
          }
          this._stream.geometry.attributes.position.needsUpdate = true;

          /* ── cluster blobs drift +X ── */
          for (var ci = 0; ci < this._clusters.length; ci++) {
            this._clusters[ci].mesh.position.x += this._clusters[ci].vel * dt;
            if (this._clusters[ci].mesh.position.x > half) {
              this._clusters[ci].mesh.position.x -= this._RANGE_X;
            }
          }

          /* ── subtle opacity breath ── */
          this._streamMat.opacity = 0.22 + 0.12 * Math.sin(this._dfTime * 0.5);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 20 injected! Lines:", lineCount);
