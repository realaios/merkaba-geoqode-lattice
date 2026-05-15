"use strict";
// inject-w59.cjs — Wave 59: fast-nova-shell + cosmic-magnon-wave
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("fast-nova-shell"')) {
  console.log("Wave 59 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity circumstellar-maser-shell></a-entity>";
const HTML_INSERT = `      <a-entity circumstellar-maser-shell></a-entity>
      <!-- ── FAST NOVA SHELL — classical nova remnant expanding shock + neon flash ── -->
      <a-entity fast-nova-shell></a-entity>
      <!-- ── COSMIC MAGNON WAVE — large-scale spin-wave analog in magnetized cosmic plasma ── -->
      <a-entity cosmic-magnon-wave></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         FAST NOVA SHELL — classical novae (white dwarf thermonuclear runaways)
         eject ~10^-4 solar masses at 500-2000 km/s. The expanding shell cools
         and recombines, forming intricate ring + clump morphologies visible
         years later in Hα. Neon novae (ONe WDs) show bright [Ne II] lines.
         GK Persei (1901) still has a detectable expanding shock. We render the
         WD, the initial fireball, and an expanding clumpy ionic shell.
         Position: (200, 700, -500).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("fast-nova-shell", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(200, 700, -500);
          scene.add(this._root);

          /* white dwarf */
          this._wd = new THREE.Mesh(
            new THREE.SphereGeometry(3, 5, 4),
            new THREE.MeshBasicMaterial({
              color: 0xddeeff, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._wd);

          /* expanding shell radius tracker */
          this._shellR = 30;

          /* shell glow */
          this._shell = new THREE.Mesh(
            new THREE.SphereGeometry(1, 8, 7),
            new THREE.MeshBasicMaterial({
              color: 0xff4400, transparent: true, opacity: 0.07,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._shell);

          /* clumpy ejecta particles fixed in shell */
          var CP = 300;
          this._clumpBase = new Float32Array(CP * 3);
          for (var ci = 0; ci < CP; ci++) {
            var cth = Math.random() * 2 * Math.PI;
            var cphi = Math.random() * Math.PI;
            /* bias to equatorial/bipolar rings */
            if (Math.random() < 0.35) cphi = Math.PI/2 + (Math.random()-0.5)*0.4;
            this._clumpBase[ci*3  ] = Math.sin(cphi)*Math.cos(cth);
            this._clumpBase[ci*3+1] = Math.sin(cphi)*Math.sin(cth);
            this._clumpBase[ci*3+2] = Math.cos(cphi);
          }
          var clumpsGeo = new THREE.BufferGeometry();
          this._clumpPos = new Float32Array(CP * 3);
          clumpsGeo.setAttribute("position", new THREE.BufferAttribute(this._clumpPos, 3));
          this._clumps = new THREE.Points(clumpsGeo, new THREE.PointsMaterial({
            color: 0xff8844, size: 3,
            transparent: true, opacity: 0.7,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._clumps);

          /* neon emission ring */
          this._neon = new THREE.Mesh(
            new THREE.TorusGeometry(1, 1.5, 6, 60),
            new THREE.MeshBasicMaterial({
              color: 0x88ffdd, transparent: true, opacity: 0.45,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._neon);

          this._fnsTime = 0;
          console.log("[fast-nova-shell] loaded at (200,700,-500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._fnsTime += dt;

          /* shell slowly expands, resets every ~60s */
          this._shellR += 0.8 * dt;
          if (this._shellR > 200) this._shellR = 30;

          var r = this._shellR;
          this._shell.scale.setScalar(r);
          this._shell.material.opacity = Math.max(0.02, 0.12 - r/2000);

          /* update clump positions */
          var CP = this._clumpBase.length/3;
          for (var ci = 0; ci < CP; ci++) {
            var scatter = (Math.random()-0.5)*0.06;
            this._clumpPos[ci*3  ] = this._clumpBase[ci*3  ] * (r + scatter*r);
            this._clumpPos[ci*3+1] = this._clumpBase[ci*3+1] * (r + scatter*r);
            this._clumpPos[ci*3+2] = this._clumpBase[ci*3+2] * (r + scatter*r);
          }
          this._clumps.geometry.attributes.position.needsUpdate = true;

          /* neon ring matches shell equator */
          this._neon.scale.setScalar(r * 0.0143);
          this._neon.rotation.y += 0.00015 * dt;

          /* WD flicker */
          this._wd.material.color.setHSL(0.57, 1, 0.6 + 0.3*Math.abs(Math.sin(this._fnsTime*2.3)));
        },
      });

      /* ====================================================================
         COSMIC MAGNON WAVE — in magnetized plasmas (neutron star surfaces,
         ICM magnetic fields) spin waves (magnons) can propagate along the
         field direction. At large scales the helical magnetic field of galaxy
         clusters or the IGM can sustain these modes. We render a helical
         magnetic flux tube with a traveling wave pattern and charged particle
         oscillations perpendicular to the propagation axis.
         Position: (-600, 200, 1000).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-magnon-wave", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-600, 200, 1000);
          scene.add(this._root);

          /* axis spine */
          var axPts = new Float32Array(2*3);
          axPts[0]=-250; axPts[3]=250;
          var axGeo = new THREE.BufferGeometry();
          axGeo.setAttribute("position", new THREE.BufferAttribute(axPts, 3));
          this._root.add(new THREE.Line(axGeo, new THREE.LineBasicMaterial({
            color: 0x4477ff, transparent: true, opacity: 0.1,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* helix coil geometry — field line */
          var HN = 200;
          var helPts = new Float32Array(HN * 3);
          for (var hi = 0; hi < HN; hi++) {
            var ht = (hi/(HN-1)-0.5)*500;
            var ha = (hi/(HN-1)) * 8 * Math.PI;
            helPts[hi*3  ] = ht;
            helPts[hi*3+1] = 18*Math.cos(ha);
            helPts[hi*3+2] = 18*Math.sin(ha);
          }
          var helGeo = new THREE.BufferGeometry();
          helGeo.setAttribute("position", new THREE.BufferAttribute(helPts, 3));
          this._helix = new THREE.Line(helGeo, new THREE.LineBasicMaterial({
            color: 0x6699ff, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._helix);

          /* magnon oscillating particles */
          var MP = 150;
          this._magBase = new Float32Array(MP * 3);
          for (var mi = 0; mi < MP; mi++) {
            this._magBase[mi*3  ] = -240 + mi*(480/MP);
            this._magBase[mi*3+1] = 0;
            this._magBase[mi*3+2] = 0;
          }
          var magGeo = new THREE.BufferGeometry();
          this._magPos = new Float32Array(MP * 3);
          magGeo.setAttribute("position", new THREE.BufferAttribute(this._magPos, 3));
          this._magnons = new THREE.Points(magGeo, new THREE.PointsMaterial({
            color: 0xaabbff, size: 3,
            transparent: true, opacity: 0.65,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._magnons);

          this._cmwTime = 0;
          console.log("[cosmic-magnon-wave] loaded at (-600,200,1000)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cmwTime += dt;

          var speed = 1.2;
          var kwave = 0.035;
          var MP = this._magBase.length/3;
          for (var mi = 0; mi < MP; mi++) {
            var mx = this._magBase[mi*3];
            var phase = kwave*mx - speed*this._cmwTime;
            this._magPos[mi*3  ] = mx;
            this._magPos[mi*3+1] = 22*Math.cos(phase);
            this._magPos[mi*3+2] = 22*Math.sin(phase);
          }
          this._magnons.geometry.attributes.position.needsUpdate = true;
          this._helix.rotation.x += 0.000015 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 59 injected! Lines:", lineCount);
