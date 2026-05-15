'use strict';
// inject-w16.cjs — Wave 16: nebula-protostar + magnetar-flare
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

// Idempotency check
if (html.includes('AFRAME.registerComponent("nebula-protostar"')) {
  console.log('Wave 16 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities (inject after the last rogue-planet entity) ─────────────
const HTML_ANCHOR = '      <a-entity rogue-planet></a-entity>';
const HTML_INSERT = `      <a-entity rogue-planet></a-entity>
      <!-- ── NEBULA PROTOSTAR — young star forming in its birth cloud with bipolar jets ── -->
      <a-entity nebula-protostar></a-entity>
      <!-- ── MAGNETAR FLARE — periodic X-ray/gamma burst expanding ring shock ── -->
      <a-entity magnetar-flare></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components (inject before asteroid-belt) ──────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         NEBULA PROTOSTAR — star-forming cloud with embedded protostellar core.
         Position: (500, 400, 500).
         Components:
           - Outer dust envelope: 600-particle amber cloud, r~200, opaque 0.15
           - Inner hot core: SphereGeometry r=18, bright orange-yellow emission
           - Protostellar disk: flat torus of 300 particles rotating in X-Z plane
           - Bipolar outflow jets: two opposing particle streams along Y axis
               2 × 200 particles, teal-blue, expanding outward, looping
           - Core glow pulses gently (1.5 period brightness oscillation)
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("nebula-protostar", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(500, 400, 500);
          scene.add(this._root);

          /* ── outer dust envelope (600 amber particles) ── */
          var EN = 600;
          var ePts = new Float32Array(EN * 3);
          for (var i = 0; i < EN; i++) {
            var r = 60 + Math.pow(Math.random(), 0.4) * 140;
            var theta = Math.random() * 2 * Math.PI;
            var phi = (Math.random() - 0.5) * Math.PI * 0.7;
            ePts[i*3  ] = r * Math.cos(theta) * Math.cos(phi);
            ePts[i*3+1] = r * Math.sin(phi) * 0.45;
            ePts[i*3+2] = r * Math.sin(theta) * Math.cos(phi);
          }
          var eGeo = new THREE.BufferGeometry();
          eGeo.setAttribute("position", new THREE.BufferAttribute(ePts, 3));
          this._envMat = new THREE.PointsMaterial({
            color: 0x8b4a1a, size: 3.5, transparent: true, opacity: 0.18,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(eGeo, this._envMat));

          /* ── protostellar core ── */
          this._core = new THREE.Mesh(
            new THREE.SphereGeometry(18, 12, 10),
            new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.92 })
          );
          this._root.add(this._core);

          /* ── inner glow shell ── */
          this._glow = new THREE.Mesh(
            new THREE.SphereGeometry(28, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.18, depthWrite: false })
          );
          this._root.add(this._glow);

          /* ── protostellar disk (300 particles in X-Z plane) ── */
          var DN = 300;
          var dPts = new Float32Array(DN * 3);
          for (var di = 0; di < DN; di++) {
            var dr = 22 + Math.random() * 55;
            var da = Math.random() * 2 * Math.PI;
            dPts[di*3  ] = dr * Math.cos(da);
            dPts[di*3+1] = (Math.random() - 0.5) * 6;
            dPts[di*3+2] = dr * Math.sin(da);
          }
          var dGeo = new THREE.BufferGeometry();
          dGeo.setAttribute("position", new THREE.BufferAttribute(dPts, 3));
          this._disk = new THREE.Points(dGeo, new THREE.PointsMaterial({
            color: 0xffaa44, size: 2.0, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._disk);

          /* ── bipolar outflow jets (two streams, +Y and -Y) ── */
          this._jets = [];
          [1, -1].forEach(function (dir) {
            var JN = 200;
            var jPts = new Float32Array(JN * 3);
            for (var ji = 0; ji < JN; ji++) {
              var jd = 20 + Math.pow(Math.random(), 0.6) * 120;
              var spread = 6 + jd * 0.06;
              jPts[ji*3  ] = (Math.random() - 0.5) * spread;
              jPts[ji*3+1] = dir * jd;
              jPts[ji*3+2] = (Math.random() - 0.5) * spread;
            }
            var jGeo = new THREE.BufferGeometry();
            jGeo.setAttribute("position", new THREE.BufferAttribute(jPts, 3));
            var jMat = new THREE.PointsMaterial({
              color: 0x44ccff, size: 2.2, transparent: true, opacity: 0.45,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var jet = new THREE.Points(jGeo, jMat);
            this._root.add(jet);
            this._jets.push({ mesh: jet, mat: jMat, dir: dir });
          }.bind(this));

          this._npTime = 0;
          console.log("[nebula-protostar] born at (500, 400, 500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._npTime += dt;

          /* core brightness oscillation */
          var pulse = 0.80 + 0.20 * Math.sin(this._npTime * 2 * Math.PI / 1.5);
          this._core.material.opacity = 0.88 * pulse;
          this._glow.material.opacity = 0.18 * pulse;

          /* disk rotation */
          this._disk.rotation.y += 0.018 * dt;

          /* jet fade-cycle (jets dim and brighten every 8s) */
          var jBreath = 0.35 + 0.25 * Math.sin(this._npTime * 2 * Math.PI / 8);
          for (var ji = 0; ji < this._jets.length; ji++) {
            this._jets[ji].mat.opacity = jBreath;
          }

          /* slow rotation of the whole cloud */
          this._root.rotation.y += 0.003 * dt;
        },
      });

      /* ====================================================================
         MAGNETAR FLARE — periodic X-ray/gamma-ray burst with expanding ring shock.
         Position: (300, 600, -700).
         Components:
           - Compact magnetar body: r=10, ultra-white, intense glow halo
           - Expanding ring shock: flat TorusGeometry scales from r=12 to r=280,
               then resets — resets every 6 seconds (one flare period)
           - Second ring delayed by 3s for staggered bursts
           - B-field arc lines: 6 arcing Line segments in dipole pattern (static)
           - Afterglow sphere: expands with ring, fades out
           - Particle burst: 300 particles ejected radially on each flare
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("magnetar-flare", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(300, 600, -700);
          scene.add(this._root);

          /* ── compact magnetar body ── */
          this._body = new THREE.Mesh(
            new THREE.SphereGeometry(10, 14, 12),
            new THREE.MeshBasicMaterial({ color: 0xddeeff })
          );
          this._root.add(this._body);

          /* ── inner intense glow ── */
          this._innerGlow = new THREE.Mesh(
            new THREE.SphereGeometry(16, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0x88bbff, transparent: true, opacity: 0.55, depthWrite: false })
          );
          this._root.add(this._innerGlow);

          /* ── B-field arc lines (6 dipole arcs, static) ── */
          var arcMat = new THREE.LineBasicMaterial({ color: 0x4466ff, transparent: true, opacity: 0.35 });
          for (var ai = 0; ai < 6; ai++) {
            var angle = (ai / 6) * 2 * Math.PI;
            var arcPts = [];
            for (var as = 0; as <= 24; as++) {
              var t = (as / 24) * Math.PI;
              var rArc = 45 * Math.sin(t) * Math.sin(t);
              arcPts.push(new THREE.Vector3(
                rArc * Math.cos(angle),
                55 * Math.cos(t),
                rArc * Math.sin(angle)
              ));
            }
            var arcGeo = new THREE.BufferGeometry().setFromPoints(arcPts);
            this._root.add(new THREE.Line(arcGeo, arcMat));
          }

          /* ── expanding ring shocks (2 staggered rings) ── */
          this._rings = [];
          var ringMat0 = new THREE.MeshBasicMaterial({ color: 0x66aaff, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide });
          var ringMat1 = new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.40, depthWrite: false, side: THREE.DoubleSide });
          [ringMat0, ringMat1].forEach(function (mat, idx) {
            var ring = new THREE.Mesh(
              new THREE.TorusGeometry(12, 2.5, 6, 64),
              mat
            );
            ring.rotation.x = Math.PI / 2;
            this._root.add(ring);
            this._rings.push({ mesh: ring, mat: mat, phase: idx * 3.0 });
          }.bind(this));

          /* ── afterglow sphere ── */
          this._afterglow = new THREE.Mesh(
            new THREE.SphereGeometry(12, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.0, depthWrite: false })
          );
          this._root.add(this._afterglow);

          /* ── burst particles (300, ejected radially) ── */
          var BN = 300;
          var bPts = new Float32Array(BN * 3);
          this._burstVels = new Float32Array(BN * 3);
          for (var bi = 0; bi < BN; bi++) {
            var bTheta = Math.random() * 2 * Math.PI;
            var bPhi = (Math.random() - 0.5) * Math.PI;
            var spd = 30 + Math.random() * 80;
            this._burstVels[bi*3  ] = spd * Math.cos(bTheta) * Math.cos(bPhi);
            this._burstVels[bi*3+1] = spd * Math.sin(bPhi);
            this._burstVels[bi*3+2] = spd * Math.sin(bTheta) * Math.cos(bPhi);
            bPts[bi*3] = 0; bPts[bi*3+1] = 0; bPts[bi*3+2] = 0;
          }
          var bGeo = new THREE.BufferGeometry();
          bGeo.setAttribute("position", new THREE.BufferAttribute(bPts, 3));
          this._burstMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.5, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false });
          this._burstPoints = new THREE.Points(bGeo, this._burstMat);
          this._root.add(this._burstPoints);
          this._burstPos = bPts;

          this._mfTime = 0;
          this._PERIOD = 6.0;
          console.log("[magnetar-flare] flaring at (300, 600, -700) period=" + this._PERIOD + "s");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._mfTime += dt;
          var T = this._PERIOD;

          /* ── expand rings ── */
          for (var ri = 0; ri < this._rings.length; ri++) {
            var phase = (this._mfTime + this._rings[ri].phase) % T;
            var prog = phase / T; /* 0→1 over one period */
            var rScale = 12 + prog * 268; /* 12 → 280 */
            this._rings[ri].mesh.scale.set(rScale / 12, rScale / 12, 1);
            var opRing = prog < 0.1 ? (prog / 0.1) * 0.55 : 0.55 * (1 - (prog - 0.1) / 0.9);
            this._rings[ri].mat.opacity = Math.max(0, opRing);
          }

          /* ── afterglow follows first ring ── */
          var agProg = (this._mfTime % T) / T;
          var agScale = 12 + agProg * 120;
          this._afterglow.scale.set(agScale / 12, agScale / 12, agScale / 12);
          this._afterglow.material.opacity = agProg < 0.12 ? (agProg / 0.12) * 0.4 : 0.4 * Math.exp(-(agProg - 0.12) * 5);

          /* ── burst particles ── */
          var bProg = (this._mfTime % T) / T;
          var bScale = bProg;
          this._burstMat.opacity = bProg < 0.08 ? (bProg / 0.08) * 0.65 : 0.65 * Math.exp(-(bProg - 0.08) * 4);
          var posArr = this._burstPoints.geometry.attributes.position.array;
          for (var bi = 0; bi < 300; bi++) {
            posArr[bi*3  ] = this._burstVels[bi*3  ] * bScale;
            posArr[bi*3+1] = this._burstVels[bi*3+1] * bScale;
            posArr[bi*3+2] = this._burstVels[bi*3+2] * bScale;
          }
          this._burstPoints.geometry.attributes.position.needsUpdate = true;

          /* ── core pulse ── */
          var cPulse = 0.75 + 0.25 * Math.abs(Math.sin(this._mfTime * Math.PI / (T * 0.1)));
          this._innerGlow.material.opacity = Math.min(0.75, cPulse * 0.55);

          /* ── slow self-rotation ── */
          this._root.rotation.y += 0.01 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 16 injected! Lines:', lineCount);
