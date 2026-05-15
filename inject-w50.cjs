"use strict";
// inject-w50.cjs — Wave 50: protostellar-disk-gap + heliopause-boundary
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("protostellar-disk-gap"')) {
  console.log("Wave 50 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity cosmic-neutrino-haze></a-entity>";
const HTML_INSERT = `      <a-entity cosmic-neutrino-haze></a-entity>
      <!-- ── PROTOSTELLAR DISK GAP — ALMA ring-gap carved by a forming planet ── -->
      <a-entity protostellar-disk-gap></a-entity>
      <!-- ── HELIOPAUSE BOUNDARY — stellar wind termination shock bubble ── -->
      <a-entity heliopause-boundary></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         PROTOSTELLAR DISK GAP — ALMA radio observations of protoplanetary
         disks reveal concentric bright rings separated by dark gaps. Each gap
         is carved by a forming planet sweeping its orbital lane clear of dust.
         The HL Tau system shows this beautifully: a young star with ~7 rings
         and 4 gaps at radii 13–100 AU. We render concentric ring-disk pairs
         (bright annuli + dark gaps) in dust-scatter orange/tan.
         Position: (-700, 200, -500).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("protostellar-disk-gap", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-700, 200, -500);
          /* tilt disk to ~60 deg inclination for ALMA-like view */
          this._root.rotation.x = -1.05;
          scene.add(this._root);

          /* ring parameters: [innerR, outerR, color, opacity] */
          var rings = [
            [10,  20,  0xffbb44, 0.55],
            [22,  28,  0x221100, 0.15], /* gap */
            [28,  42,  0xffcc66, 0.50],
            [44,  50,  0x221100, 0.12], /* gap */
            [50,  70,  0xffaa33, 0.48],
            [72,  78,  0x221100, 0.10], /* gap */
            [78, 100,  0xffcc77, 0.42],
            [102, 108, 0x221100, 0.10], /* gap */
            [108, 130, 0xffbb55, 0.35],
          ];

          for (var ri = 0; ri < rings.length; ri++) {
            var rr = rings[ri];
            var rg = new THREE.RingGeometry(rr[0], rr[1], 128);
            var rm = new THREE.MeshBasicMaterial({
              color: rr[2], transparent: true, opacity: rr[3],
              side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
            });
            this._root.add(new THREE.Mesh(rg, rm));
          }

          /* central protostar */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(8, 8, 6),
            new THREE.MeshBasicMaterial({
              color: 0xff8800, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          this._pdgTime = 0;
          console.log("[protostellar-disk-gap] loaded at (-700,200,-500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._pdgTime += dt;
          /* very slow disk rotation */
          this._root.rotation.z += 0.00008 * dt;
        },
      });

      /* ====================================================================
         HELIOPAUSE BOUNDARY — every star blows a bubble of stellar wind into
         the interstellar medium. At ~120 AU (for the Sun) the solar wind
         hits the ISM head-on and decelerates supersonically at the termination
         shock. Beyond that lies the heliosheath, then the heliopause where
         solar plasma meets ISM plasma. Voyager 1 crossed it at 121.6 AU in
         2012. We render an oblate shock-compressed bubble with a bow shock
         nose and a stretched magnetotail.
         Position: (300, -100, 700).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("heliopause-boundary", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(300, -100, 700);
          scene.add(this._root);

          /* heliosphere: oblate sphere compressed on nose side */
          var hShell = new THREE.Mesh(
            new THREE.SphereGeometry(90, 16, 12),
            new THREE.MeshBasicMaterial({
              color: 0x2255aa, transparent: true, opacity: 0.06,
              side: THREE.FrontSide, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          hShell.scale.set(0.75, 0.80, 1.0); /* compress nose */
          this._root.add(hShell);

          /* termination shock inner shell */
          var tsShell = new THREE.Mesh(
            new THREE.SphereGeometry(65, 12, 10),
            new THREE.MeshBasicMaterial({
              color: 0x4488ff, transparent: true, opacity: 0.05,
              side: THREE.FrontSide, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          tsShell.scale.set(0.75, 0.80, 1.0);
          this._root.add(tsShell);

          /* bow shock nose ring */
          var bsRing = new THREE.Mesh(
            new THREE.TorusGeometry(85, 4, 6, 40, Math.PI * 0.6),
            new THREE.MeshBasicMaterial({
              color: 0x88aaff, transparent: true, opacity: 0.18,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          bsRing.rotation.y = -Math.PI * 0.7;
          this._root.add(bsRing);

          /* magnetotail: long cylinder dragging opposite the ISM flow */
          var tail = new THREE.Mesh(
            new THREE.CylinderGeometry(35, 15, 300, 6, 1, true),
            new THREE.MeshBasicMaterial({
              color: 0x3366cc, transparent: true, opacity: 0.04,
              side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          tail.position.set(0, 0, 150);
          tail.rotation.x = Math.PI / 2;
          this._root.add(tail);

          /* parent star */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(6, 8, 6),
            new THREE.MeshBasicMaterial({
              color: 0xffffaa, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          /* voyager position dot */
          var vDot = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 4, 3),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          vDot.position.set(0, 0, -67); /* ~121 AU scaled into scene */
          this._root.add(vDot);

          this._hpTime = 0;
          console.log("[heliopause-boundary] loaded at (300,-100,700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._hpTime += dt;
          /* slow drift of the whole heliosphere as star moves through ISM */
          this._root.position.x = 300 + 0.5 * Math.sin(this._hpTime * 0.05);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 50 injected! Lines:", lineCount);
