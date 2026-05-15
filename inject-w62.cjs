"use strict";
// inject-w62.cjs — Wave 62: gamma-ray-burst-afterglow + magnetized-accretion-column
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("gamma-ray-burst-afterglow"')) {
  console.log("Wave 62 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity stellar-population-gradient></a-entity>";
const HTML_INSERT = `      <a-entity stellar-population-gradient></a-entity>
      <!-- ── GAMMA RAY BURST AFTERGLOW — multi-wavelength fading glow from GRB jet ── -->
      <a-entity gamma-ray-burst-afterglow></a-entity>
      <!-- ── MAGNETIZED ACCRETION COLUMN — pulsar polar accretion column with B-field funneling ── -->
      <a-entity magnetized-accretion-column></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         GAMMA RAY BURST AFTERGLOW — the afterglow of a GRB is produced by the
         collimated jet decelerating into the ISM (Blandford-McKee self-similar
         solution). The afterglow fades as a power law: F~t^-alpha*nu^-beta.
         It transitions from X-ray bright → optical → radio over hours to months.
         GRB 221009A (2022) was the brightest ever. We render the initial prompt
         spike + fading multi-wavelength expanding synchrotron bubble.
         Position: (-700, -300, -1000).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("gamma-ray-burst-afterglow", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-700, -300, -1000);
          scene.add(this._root);

          /* central engine (compact star) */
          this._engine = new THREE.Mesh(
            new THREE.SphereGeometry(3, 5, 4),
            new THREE.MeshBasicMaterial({
              color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._engine);

          /* jet cone beams */
          for (var ji = 0; ji < 2; ji++) {
            var jSign = ji===0 ? 1 : -1;
            var jCone = new THREE.Mesh(
              new THREE.ConeGeometry(22, 90, 10, 1, true),
              new THREE.MeshBasicMaterial({
                color: 0xff6600, transparent: true, opacity: 0.15,
                blending: THREE.AdditiveBlending, depthWrite: false,
                side: THREE.DoubleSide,
              })
            );
            jCone.position.y = jSign*45;
            jCone.rotation.z = jSign===1 ? 0 : Math.PI;
            this._root.add(jCone);
          }

          /* expanding afterglow shell — X-ray (blue-white) */
          this._agX = new THREE.Mesh(
            new THREE.SphereGeometry(1, 8, 7),
            new THREE.MeshBasicMaterial({
              color: 0x88ccff, transparent: true, opacity: 0.09,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._agX);

          /* optical (orange) shell offset */
          this._agO = new THREE.Mesh(
            new THREE.SphereGeometry(1, 8, 7),
            new THREE.MeshBasicMaterial({
              color: 0xff9944, transparent: true, opacity: 0.07,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._agO);

          /* radio (red) — largest */
          this._agR = new THREE.Mesh(
            new THREE.SphereGeometry(1, 8, 7),
            new THREE.MeshBasicMaterial({
              color: 0xff2200, transparent: true, opacity: 0.05,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._agR);

          /* ejecta particles */
          var EP = 250;
          var ePts = new Float32Array(EP * 3);
          this._ejectBase = new Float32Array(EP * 3);
          for (var ei = 0; ei < EP; ei++) {
            var eth = Math.random()*2*Math.PI;
            var ephi = Math.random()*Math.PI;
            /* concentrate near jet axis */
            ephi = ephi * 0.5;
            if (Math.random()<0.5) ephi = Math.PI - ephi;
            ePts[ei*3  ] = Math.sin(ephi)*Math.cos(eth);
            ePts[ei*3+1] = Math.cos(ephi);
            ePts[ei*3+2] = Math.sin(ephi)*Math.sin(eth);
            this._ejectBase.set([ePts[ei*3], ePts[ei*3+1], ePts[ei*3+2]], ei*3);
          }
          var eGeo = new THREE.BufferGeometry();
          this._ejectPos = new Float32Array(EP * 3);
          eGeo.setAttribute("position", new THREE.BufferAttribute(this._ejectPos, 3));
          this._ejecta = new THREE.Points(eGeo, new THREE.PointsMaterial({
            color: 0xffaa44, size: 2,
            transparent: true, opacity: 0.6,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._ejecta);

          this._grbR = 20;
          this._grbTime = 0;
          console.log("[gamma-ray-burst-afterglow] loaded at (-700,-300,-1000)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._grbTime += dt;
          this._grbR += 1.2 * dt;
          if (this._grbR > 280) this._grbR = 20;
          var r = this._grbR;
          this._agX.scale.setScalar(r);
          this._agO.scale.setScalar(r * 1.15);
          this._agR.scale.setScalar(r * 1.35);
          this._agX.material.opacity = Math.max(0.015, 0.12 - r/2500);
          this._agO.material.opacity = Math.max(0.01, 0.09 - r/3000);
          this._agR.material.opacity = Math.max(0.008, 0.07 - r/3500);
          var EP = this._ejectBase.length/3;
          for (var ei = 0; ei < EP; ei++) {
            var sc = r * (0.8 + 0.4*Math.abs(Math.sin(ei*0.9)));
            this._ejectPos[ei*3  ] = this._ejectBase[ei*3  ] * sc;
            this._ejectPos[ei*3+1] = this._ejectBase[ei*3+1] * sc;
            this._ejectPos[ei*3+2] = this._ejectBase[ei*3+2] * sc;
          }
          this._ejecta.geometry.attributes.position.needsUpdate = true;
          this._root.rotation.y += 0.00003 * dt;
        },
      });

      /* ====================================================================
         MAGNETIZED ACCRETION COLUMN — X-ray pulsars (e.g. Hercules X-1,
         V0332+53) have surface B fields of 10^12-10^13 G that funnel accreting
         plasma from the inner disk along field lines to the magnetic poles,
         forming luminous accretion columns at ~50 km height. The column
         emission is visible as X-ray pulse peaks. We render the neutron star
         with twin magnetic poles, field-line arcs, and streaming plasma columns.
         Position: (1100, 400, 300).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("magnetized-accretion-column", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(1100, 400, 300);
          scene.add(this._root);

          /* NS */
          this._ns = new THREE.Mesh(
            new THREE.SphereGeometry(9, 7, 6),
            new THREE.MeshBasicMaterial({
              color: 0xaaccff, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._ns);

          /* inner disk truncated at magnetospheric radius */
          this._innerDisk = new THREE.Mesh(
            new THREE.TorusGeometry(45, 4, 6, 60),
            new THREE.MeshBasicMaterial({
              color: 0xff8822, transparent: true, opacity: 0.25,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._innerDisk.rotation.x = Math.PI/2;
          this._root.add(this._innerDisk);

          /* magnetic dipole field arcs */
          var ARCS = 8;
          for (var ai = 0; ai < ARCS; ai++) {
            var aAngle = (ai/ARCS)*2*Math.PI;
            var arcPts = new Float32Array(60*3);
            for (var axi = 0; axi < 60; axi++) {
              var at = axi/(59);
              var aTheta = at*Math.PI;
              var ar = 35*Math.pow(Math.sin(aTheta), 2);
              arcPts[axi*3  ] = ar*Math.sin(aTheta)*Math.cos(aAngle);
              arcPts[axi*3+1] = 35*Math.cos(aTheta);
              arcPts[axi*3+2] = ar*Math.sin(aTheta)*Math.sin(aAngle);
            }
            var arcGeo = new THREE.BufferGeometry();
            arcGeo.setAttribute("position", new THREE.BufferAttribute(arcPts, 3));
            this._root.add(new THREE.Line(arcGeo, new THREE.LineBasicMaterial({
              color: 0x4477dd, transparent: true, opacity: 0.2,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* twin accretion columns */
          this._columns = [];
          for (var ci = 0; ci < 2; ci++) {
            var colSign = ci===0 ? 1 : -1;
            var CP = 40;
            var cPts = new Float32Array(CP * 3);
            this._columns.push({ pts: cPts, sign: colSign });
            var cGeo = new THREE.BufferGeometry();
            cGeo.setAttribute("position", new THREE.BufferAttribute(cPts, 3));
            this._root.add(new THREE.Points(cGeo, new THREE.PointsMaterial({
              color: 0x66aaff, size: 2.5,
              transparent: true, opacity: 0.65,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          this._macTime = 0;
          console.log("[magnetized-accretion-column] loaded at (1100,400,300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._macTime += dt;
          /* NS spin */
          this._root.rotation.y += 0.0005 * dt;
          /* column plasma streaming downward */
          for (var ci = 0; ci < this._columns.length; ci++) {
            var col = this._columns[ci];
            var CP = col.pts.length/3;
            for (var pi = 0; pi < CP; pi++) {
              var frac = pi/(CP-1);
              var phase = (frac + this._macTime*0.6) % 1;
              col.pts[pi*3  ] = (Math.random()-0.5)*3;
              col.pts[pi*3+1] = col.sign*(9 + phase*(35-9));
              col.pts[pi*3+2] = (Math.random()-0.5)*3;
            }
          }
          this._innerDisk.rotation.z += 0.00018 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 62 injected! Lines:", lineCount);
