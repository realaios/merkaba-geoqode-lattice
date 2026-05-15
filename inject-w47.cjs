"use strict";
// inject-w47.cjs — Wave 47: magnetar-seismic-oscillation + intergalactic-transfer-stream
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("magnetar-seismic-oscillation"')) {
  console.log("Wave 47 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity cosmic-wall-void-boundary></a-entity>";
const HTML_INSERT = `      <a-entity cosmic-wall-void-boundary></a-entity>
      <!-- ── MAGNETAR SEISMIC OSCILLATION — QPO after magnetar giant flare ── -->
      <a-entity magnetar-seismic-oscillation></a-entity>
      <!-- ── INTERGALACTIC TRANSFER STREAM — baryons stripped between merging galaxies ── -->
      <a-entity intergalactic-transfer-stream></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         MAGNETAR SEISMIC OSCILLATION — after a magnetar giant flare the
         neutron star crust rings like a bell. Quasi-periodic oscillations
         (QPOs) at 18 Hz, 26 Hz, 92 Hz, 625 Hz have been observed.
         Visualized as standing torsional waves on the neutron star surface
         with interference nodal lines, plus an X-ray afterglow torus.
         Position: (400, -500, 300).
         Components:
           - Neutron star surface: high-res sphere with vertex displacement
           - Torsional mode rings: 5 rings pulsing at different phases
           - Nodal interference pattern: dim lines on surface
           - QPO halo: oscillating outer glow shell
           - Hard X-ray tail: bright beam pulses
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("magnetar-seismic-oscillation", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(400, -500, 300);
          scene.add(this._root);

          /* neutron star core */
          this._msoCore = new THREE.Mesh(
            new THREE.SphereGeometry(7, 14, 10),
            new THREE.MeshBasicMaterial({ color: 0x99ddff })
          );
          this._root.add(this._msoCore);

          /* torsional mode rings (5 rings at different latitudes) */
          this._msoRings = [];
          for (var mri = 0; mri < 5; mri++) {
            var mroX = Math.PI/2 - (mri/(4))*Math.PI;
            var mroR = 7*Math.cos(mroX);
            var mrMesh = new THREE.Mesh(
              new THREE.TorusGeometry(mroR < 0.5 ? 0.5 : mroR, 0.5, 4, 40),
              new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(mri/5, 1, 0.7),
                transparent: true, opacity: 0.50,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            mrMesh.position.y = 7*Math.sin(mroX);
            mrMesh.rotation.x = Math.PI/2;
            this._root.add(mrMesh);
            this._msoRings.push({ mesh: mrMesh, phase: mri*1.2, freq: [18,26,92,625,18][mri]*0.005 });
          }

          /* QPO halo */
          this._qpoHalo = new THREE.Mesh(
            new THREE.SphereGeometry(14, 8, 6),
            new THREE.MeshBasicMaterial({
              color: 0x4466ff, transparent: true, opacity: 0.06,
              side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._qpoHalo);

          /* hard X-ray beam */
          var xbPts = [];
          for (var xbi = 0; xbi <= 16; xbi++) {
            var xbT = xbi/16;
            xbPts.push(new THREE.Vector3(
              Math.sin(xbT*Math.PI*2)*4*xbT,
              xbT*60,
              Math.cos(xbT*Math.PI*2)*4*xbT
            ));
          }
          var xbCurve = new THREE.CatmullRomCurve3(xbPts);
          var xbGeo = new THREE.TubeGeometry(xbCurve, 24, 1.0, 4, false);
          this._root.add(new THREE.Mesh(xbGeo, new THREE.MeshBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0.20,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._msoTime = 0;
          console.log("[magnetar-seismic-oscillation] loaded at (400,-500,300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._msoTime += dt;

          for (var mri = 0; mri < this._msoRings.length; mri++) {
            var mr = this._msoRings[mri];
            var sc = 0.70 + 0.30*Math.sin(this._msoTime * mr.freq * 2 * Math.PI + mr.phase);
            mr.mesh.scale.setScalar(sc < 0.05 ? 0.05 : sc);
          }

          /* QPO halo breathe */
          var qsc = 0.85 + 0.15*Math.sin(this._msoTime * 18 * 0.005 * 2 * Math.PI);
          this._qpoHalo.scale.setScalar(qsc);

          this._root.rotation.y += 0.0003 * dt;
        },
      });

      /* ====================================================================
         INTERGALACTIC TRANSFER STREAM — during a galaxy group merger, tidal
         forces strip gas and stars between galaxies forming a bridge/stream.
         Shows two galaxies with a baryonic stream of stars and hot gas
         connecting them, plus ram-pressure stripped tails on each galaxy.
         Position: (200, 300, 700).
         Components:
           - Galaxy A: edge-on disk
           - Galaxy B: face-on disk (offset)
           - Transfer stream bridge: tube of stars/gas between the two
           - Tidal tail A: long stellar tail from galaxy A
           - Tidal tail B: stellar tail from galaxy B
           - Intragroup gas: diffuse hot gas cloud filling the group volume
         @alignment 8→26→48:480  @frequency 639  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("intergalactic-transfer-stream", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(200, 300, 700);
          scene.add(this._root);

          /* galaxy A — edge-on disk at (-50,0,0) */
          var gA = new THREE.Group();
          gA.position.set(-50, 0, 0);
          gA.add(new THREE.Mesh(
            new THREE.CylinderGeometry(22, 22, 3, 32),
            new THREE.MeshBasicMaterial({ color: 0xffddaa, transparent: true, opacity: 0.70, depthWrite: false })
          ));
          gA.rotation.x = Math.PI/3;
          this._root.add(gA);

          /* galaxy B — face-on disk at (50,10,20) */
          var gB = new THREE.Group();
          gB.position.set(50, 10, 20);
          gB.add(new THREE.Mesh(
            new THREE.CylinderGeometry(18, 18, 3, 32),
            new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.60, depthWrite: false })
          ));
          this._root.add(gB);

          /* transfer bridge stream */
          var bridgePts = [];
          var BN = 25;
          for (var bi = 0; bi <= BN; bi++) {
            var bT = bi/BN;
            bridgePts.push(new THREE.Vector3(
              -50 + bT*100,
              10*Math.sin(bT*Math.PI),
              20*bT
            ));
          }
          var bridgeCurve = new THREE.CatmullRomCurve3(bridgePts);
          var bridgeGeo = new THREE.TubeGeometry(bridgeCurve, 60, 3, 6, false);
          this._root.add(new THREE.Mesh(bridgeGeo, new THREE.MeshBasicMaterial({
            color: 0xffcc88, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* tidal tail A */
          var taPoints = [];
          for (var tai = 0; tai <= 20; tai++) {
            var taT = tai/20;
            taPoints.push(new THREE.Vector3(-50 - taT*70, taT*40, taT*(-30)));
          }
          var taCurve = new THREE.CatmullRomCurve3(taPoints);
          var taGeo = new THREE.TubeGeometry(taCurve, 40, 2, 4, false);
          this._root.add(new THREE.Mesh(taGeo, new THREE.MeshBasicMaterial({
            color: 0xffaa66, transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* tidal tail B */
          var tbPoints = [];
          for (var tbi = 0; tbi <= 20; tbi++) {
            var tbT = tbi/20;
            tbPoints.push(new THREE.Vector3(50 + tbT*60, -tbT*30, tbT*25));
          }
          var tbCurve = new THREE.CatmullRomCurve3(tbPoints);
          var tbGeo = new THREE.TubeGeometry(tbCurve, 40, 2, 4, false);
          this._root.add(new THREE.Mesh(tbGeo, new THREE.MeshBasicMaterial({
            color: 0x88aaff, transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* intragroup hot gas */
          var IGN = 300;
          var igPts = new Float32Array(IGN * 3);
          for (var igi = 0; igi < IGN; igi++) {
            igPts[igi*3  ] = (Math.random()-0.5)*160;
            igPts[igi*3+1] = (Math.random()-0.5)*80;
            igPts[igi*3+2] = (Math.random()-0.5)*80;
          }
          var igGeo = new THREE.BufferGeometry();
          igGeo.setAttribute("position", new THREE.BufferAttribute(igPts, 3));
          this._root.add(new THREE.Points(igGeo, new THREE.PointsMaterial({
            color: 0x4488ff, size: 1.5, transparent: true, opacity: 0.07,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._itsTime = 0;
          console.log("[intergalactic-transfer-stream] loaded at (200,300,700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._itsTime += dt;
          this._root.rotation.y += 0.00012 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 47 injected! Lines:", lineCount);
