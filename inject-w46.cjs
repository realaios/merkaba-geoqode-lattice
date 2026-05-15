"use strict";
// inject-w46.cjs — Wave 46: pulsar-glitch-recovery + cosmic-wall-void-boundary
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("pulsar-glitch-recovery"')) {
  console.log("Wave 46 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR =
  "      <a-entity cosmic-magnetic-reconnection-sheet></a-entity>";
const HTML_INSERT = `      <a-entity cosmic-magnetic-reconnection-sheet></a-entity>
      <!-- ── PULSAR GLITCH RECOVERY — neutron star vortex avalanche post-glitch ── -->
      <a-entity pulsar-glitch-recovery></a-entity>
      <!-- ── COSMIC WALL VOID BOUNDARY — shell-wall interface of large-scale structure ── -->
      <a-entity cosmic-wall-void-boundary></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         PULSAR GLITCH RECOVERY — a pulsar glitch is a sudden spin-up caused
         by an avalanche of superfluid vortices in the neutron star interior
         coupling to the crust. After the glitch the pulsar slowly recovers
         its pre-glitch spin-down rate (relaxation). Visualized as a glowing
         neutron star with a rotating beam, vortex streamers, and a
         post-glitch spin-down relaxation ring.
         Position: (-300, -400, 600).
         Components:
           - Neutron star: small bright sphere
           - Rotating emission beam: two antipodal beam cones (sweeping)
           - Vortex streamers: 16 vortex lines from core
           - Crust-superfluid interface ring: spinning ring at transition
           - Spin-down relaxation cloud: outer relaxation halo
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("pulsar-glitch-recovery", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-300, -400, 600);
          scene.add(this._root);

          /* neutron star */
          this._ns = new THREE.Mesh(
            new THREE.SphereGeometry(5, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0xddeeff })
          );
          this._root.add(this._ns);

          /* emission beams (two cones antipodal) */
          this._beamGroup = new THREE.Group();
          for (var bd = 0; bd < 2; bd++) {
            var bSign = bd===0 ? 1 : -1;
            var bCone = new THREE.Mesh(
              new THREE.ConeGeometry(8, 50, 8, 1, true),
              new THREE.MeshBasicMaterial({
                color: 0x88ccff, transparent: true, opacity: 0.25, side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            bCone.position.y = bSign*25;
            bCone.rotation.z = bd===0 ? 0 : Math.PI;
            this._beamGroup.add(bCone);
          }
          this._root.add(this._beamGroup);

          /* vortex streamers (16 lines from core outward) */
          for (var vi = 0; vi < 16; vi++) {
            var va = (vi/16)*2*Math.PI;
            var vLen = 20 + Math.random()*20;
            var vPts = [];
            for (var vk = 0; vk <= 10; vk++) {
              var vT = vk/10;
              vPts.push(new THREE.Vector3(
                Math.cos(va)*vT*vLen*(0.9+Math.random()*0.2),
                (Math.random()-0.5)*6*vT,
                Math.sin(va)*vT*vLen*(0.9+Math.random()*0.2)
              ));
            }
            var vCurve = new THREE.CatmullRomCurve3(vPts);
            var vGeo = new THREE.TubeGeometry(vCurve, 12, 0.4, 3, false);
            this._root.add(new THREE.Mesh(vGeo, new THREE.MeshBasicMaterial({
              color: new THREE.Color().setHSL(vi/16, 0.8, 0.7),
              transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* crust-superfluid ring */
          this._crustRing = new THREE.Mesh(
            new THREE.TorusGeometry(22, 1.5, 4, 60),
            new THREE.MeshBasicMaterial({ color: 0xffddaa, transparent: true, opacity: 0.55, depthWrite: false })
          );
          this._crustRing.rotation.x = Math.PI/2;
          this._root.add(this._crustRing);

          /* relaxation halo */
          var RHN = 250;
          var rhPts = new Float32Array(RHN * 3);
          for (var rhi = 0; rhi < RHN; rhi++) {
            var rhp = Math.acos(2*Math.random()-1), rha = Math.random()*2*Math.PI;
            var rhr = 50 + Math.random()*20;
            rhPts[rhi*3  ] = rhr*Math.sin(rhp)*Math.cos(rha);
            rhPts[rhi*3+1] = rhr*Math.cos(rhp);
            rhPts[rhi*3+2] = rhr*Math.sin(rhp)*Math.sin(rha);
          }
          var rhGeo = new THREE.BufferGeometry();
          rhGeo.setAttribute("position", new THREE.BufferAttribute(rhPts, 3));
          this._root.add(new THREE.Points(rhGeo, new THREE.PointsMaterial({
            color: 0x6699ff, size: 1.5, transparent: true, opacity: 0.10,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._pgrTime = 0;
          console.log("[pulsar-glitch-recovery] loaded at (-300,-400,600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._pgrTime += dt;

          /* rapid beam sweep (pulsar period ~0.03 s, animate slowly for visibility) */
          this._beamGroup.rotation.y += 1.8 * dt;

          /* crust ring spin */
          this._crustRing.rotation.y += 0.4 * dt;

          /* ns brightness pulse */
          var nbr = 0.6 + 0.4*Math.abs(Math.sin(this._pgrTime * 4.0));
          this._ns.material.opacity = nbr;
        },
      });

      /* ====================================================================
         COSMIC WALL VOID BOUNDARY — large-scale structure consists of walls
         (galaxy-dense sheets) bordering voids (nearly empty regions). The
         boundary is where galaxies stream from voids into the wall under
         gravity. Shows a sheet of clustered galaxies on one side and
         emptiness on the other.
         Position: (-800, 0, 200).
         Components:
           - Void side: sparse scattered galaxy points (faint)
           - Wall sheet: dense galaxy sheet (bright cluster)
           - Filament tendril: one filament connecting wall to off-screen
           - Peculiar velocity vectors: tiny arrow streaks toward wall
           - Boundary glow: diffuse glow marking the transition zone
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("cosmic-wall-void-boundary", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-800, 0, 200);
          scene.add(this._root);

          /* void side — very sparse */
          var VN = 120;
          var vPts = new Float32Array(VN * 3);
          for (var vi = 0; vi < VN; vi++) {
            vPts[vi*3  ] = -40 - Math.random()*80;
            vPts[vi*3+1] = (Math.random()-0.5)*120;
            vPts[vi*3+2] = (Math.random()-0.5)*120;
          }
          var vGeo = new THREE.BufferGeometry();
          vGeo.setAttribute("position", new THREE.BufferAttribute(vPts, 3));
          this._root.add(new THREE.Points(vGeo, new THREE.PointsMaterial({
            color: 0xaaaaff, size: 1.2, transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* wall sheet — dense galaxies */
          var WN = 400;
          var wPts = new Float32Array(WN * 3);
          for (var wi = 0; wi < WN; wi++) {
            wPts[wi*3  ] = (Math.random()-0.5)*8; /* thin sheet */
            wPts[wi*3+1] = (Math.random()-0.5)*130;
            wPts[wi*3+2] = (Math.random()-0.5)*130;
          }
          var wGeo = new THREE.BufferGeometry();
          wGeo.setAttribute("position", new THREE.BufferAttribute(wPts, 3));
          this._root.add(new THREE.Points(wGeo, new THREE.PointsMaterial({
            color: 0xffddaa, size: 2.0, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* filament tendril */
          var tfPts = [];
          for (var tfi = 0; tfi <= 20; tfi++) {
            var tfT = tfi/20;
            tfPts.push(new THREE.Vector3(0, -60 + tfT*120, 60*(1-tfT)));
          }
          var tfCurve = new THREE.CatmullRomCurve3(tfPts);
          var tfGeo = new THREE.TubeGeometry(tfCurve, 30, 2, 4, false);
          this._root.add(new THREE.Mesh(tfGeo, new THREE.MeshBasicMaterial({
            color: 0xffcc88, transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* peculiar velocity streaks (lines from void to wall) */
          var PVN = 80;
          var pvPts = new Float32Array(PVN * 6);
          for (var pvi = 0; pvi < PVN; pvi++) {
            var px = -15 - Math.random()*40;
            var py = (Math.random()-0.5)*100;
            var pz = (Math.random()-0.5)*100;
            pvPts[pvi*6  ] = px;      pvPts[pvi*6+1] = py;      pvPts[pvi*6+2] = pz;
            pvPts[pvi*6+3] = px+12;   pvPts[pvi*6+4] = py;      pvPts[pvi*6+5] = pz;
          }
          var pvGeo = new THREE.BufferGeometry();
          pvGeo.setAttribute("position", new THREE.BufferAttribute(pvPts, 3));
          this._root.add(new THREE.LineSegments(pvGeo, new THREE.LineBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0.15,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* boundary glow */
          this._root.add(new THREE.Mesh(
            new THREE.PlaneGeometry(8, 140),
            new THREE.MeshBasicMaterial({
              color: 0x8888ff, transparent: true, opacity: 0.08,
              side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          this._cwvTime = 0;
          console.log("[cosmic-wall-void-boundary] loaded at (-800,0,200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cwvTime += dt;
          this._root.rotation.y += 0.00008 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 46 injected! Lines:", lineCount);
