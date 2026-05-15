'use strict';
// inject-w61.cjs — Wave 61: pulsar-timing-array-gw + stellar-population-gradient
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("pulsar-timing-array-gw"')) {
  console.log('Wave 61 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity cosmic-spiderweb-nodes></a-entity>';
const HTML_INSERT = `      <a-entity cosmic-spiderweb-nodes></a-entity>
      <!-- ── PULSAR TIMING ARRAY GW — nanohertz GW background sensed by PTA pulsars ── -->
      <a-entity pulsar-timing-array-gw></a-entity>
      <!-- ── STELLAR POPULATION GRADIENT — blue disk vs red bulge color gradient ── -->
      <a-entity stellar-population-gradient></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         PULSAR TIMING ARRAY GW — NANOGrav, PPTA, EPTA, InPTA have now detected
         a stochastic gravitational wave background at nanohertz frequencies
         (2023 milestone). The signal comes from SMBH binaries and possibly
         cosmic strings. The PTA uses pulsars as clocks — correlated timing
         residuals reveal the GW. We render an array of millisecond pulsars
         with connecting GW correlation arcs (Hellings-Downs curve) and a
         slow ripple propagating through their positions.
         Position: (400, -700, 500).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("pulsar-timing-array-gw", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(400, -700, 500);
          scene.add(this._root);

          /* 12 MSP pulsars in a sphere around the origin */
          var NP = 12;
          this._pulsars = [];
          this._pulsarBase = [];
          for (var pi = 0; pi < NP; pi++) {
            var pth = (pi/NP)*2*Math.PI + 0.5;
            var pphi = Math.acos(1 - 2*(pi+0.5)/NP);
            var pr = 120 + (Math.random()-0.5)*30;
            var pp = new THREE.Vector3(
              pr*Math.sin(pphi)*Math.cos(pth),
              pr*Math.sin(pphi)*Math.sin(pth),
              pr*Math.cos(pphi)
            );
            this._pulsarBase.push(pp.clone());
            var pm = new THREE.Mesh(
              new THREE.SphereGeometry(2, 4, 3),
              new THREE.MeshBasicMaterial({
                color: 0xaaddff, blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            pm.position.copy(pp);
            this._root.add(pm);
            this._pulsars.push(pm);
          }

          /* Hellings-Downs correlation arcs between pairs */
          var arcLines = [];
          for (var ai = 0; ai < NP; ai++) {
            for (var bi = ai+1; bi < NP; bi++) {
              /* only close-angle pairs for HD curve visual */
              var ang = this._pulsarBase[ai].angleTo(this._pulsarBase[bi]);
              if (ang < Math.PI*0.55) {
                arcLines.push(
                  this._pulsarBase[ai].x, this._pulsarBase[ai].y, this._pulsarBase[ai].z,
                  this._pulsarBase[bi].x, this._pulsarBase[bi].y, this._pulsarBase[bi].z
                );
              }
            }
          }
          var arcArr = new Float32Array(arcLines);
          var arcGeo = new THREE.BufferGeometry();
          arcGeo.setAttribute("position", new THREE.BufferAttribute(arcArr, 3));
          this._hdArcs = new THREE.LineSegments(arcGeo, new THREE.LineBasicMaterial({
            color: 0x6699cc, transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._hdArcs);

          /* GW ripple reference sphere */
          this._gwSphere = new THREE.Mesh(
            new THREE.SphereGeometry(120, 10, 8),
            new THREE.MeshBasicMaterial({
              color: 0x3355aa, transparent: true, opacity: 0.025,
              blending: THREE.AdditiveBlending, depthWrite: false,
              wireframe: true,
            })
          );
          this._root.add(this._gwSphere);

          this._ptaTime = 0;
          console.log("[pulsar-timing-array-gw] loaded at (400,-700,500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._ptaTime += dt;
          /* GW timing residuals — oscillate each pulsar along radial direction */
          for (var pi = 0; pi < this._pulsars.length; pi++) {
            var base = this._pulsarBase[pi];
            var phase = this._ptaTime * 0.18 + pi * 0.9;
            var disp = 5*Math.sin(phase);
            var dir = base.clone().normalize();
            this._pulsars[pi].position.copy(base).addScaledVector(dir, disp);
            /* flicker brightness */
            this._pulsars[pi].material.color.setHSL(
              0.55, 1, 0.5 + 0.4*Math.abs(Math.sin(this._ptaTime*8 + pi))
            );
          }
          this._hdArcs.material.opacity = 0.07 + 0.07*Math.abs(Math.sin(this._ptaTime*0.5));
          this._gwSphere.rotation.y += 0.00008 * dt;
        },
      });

      /* ====================================================================
         STELLAR POPULATION GRADIENT — elliptical galaxies and bulges are
         dominated by old red (K/M giant) stars while disk spiral arms are
         blue (O/B stars + HII regions). This inside-out formation gradient
         records star formation history. We render a disk-bulge galaxy with
         an explicit blue-to-red radial color gradient on its particle field.
         Position: (-300, -500, 900).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("stellar-population-gradient", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-300, -500, 900);
          scene.add(this._root);

          /* red bulge */
          this._bulge = new THREE.Mesh(
            new THREE.SphereGeometry(18, 7, 6),
            new THREE.MeshBasicMaterial({
              color: 0xff8844, transparent: true, opacity: 0.38,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._bulge);

          /* disk stellar field with radial color gradient */
          var SP = 1400;
          var sPts = new Float32Array(SP * 3);
          var sCol = new Float32Array(SP * 3);
          for (var si = 0; si < SP; si++) {
            var sR = 5 + Math.pow(Math.random(),0.6)*130;
            var sA = Math.random()*2*Math.PI;
            /* spiral arm bias */
            var sarmAng = sA + 0.012*sR;
            var sArmBias = 0.35 * Math.exp(-Math.pow(Math.sin(sarmAng*2),2)*3);
            if (Math.random() < sArmBias) sR *= 0.7;
            var sHeight = (Math.random()-0.5)*(8-0.05*sR);
            sPts[si*3  ] = sR*Math.cos(sA);
            sPts[si*3+1] = sHeight;
            sPts[si*3+2] = sR*Math.sin(sA);
            /* color: bulge=orange/red, outer disk=blue-white */
            var frac = Math.min(sR/120, 1);
            /* red component: 1→0.4 outward */
            sCol[si*3  ] = 1 - frac*0.7;
            /* green: 0.4→0.6 */
            sCol[si*3+1] = 0.4 + frac*0.25;
            /* blue: 0.1→1 */
            sCol[si*3+2] = 0.1 + frac*0.9;
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(sPts, 3));
          sGeo.setAttribute("color", new THREE.BufferAttribute(sCol, 3));
          this._disk = new THREE.Points(sGeo, new THREE.PointsMaterial({
            size: 2, vertexColors: true,
            transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._disk);

          /* central AGN glow */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(4, 5, 4),
            new THREE.MeshBasicMaterial({
              color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          this._spgTime = 0;
          console.log("[stellar-population-gradient] loaded at (-300,-500,900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._spgTime += dt;
          this._root.rotation.y += 0.000025 * dt;
          this._disk.material.opacity = 0.45 + 0.1*Math.abs(Math.sin(this._spgTime*0.3));
          this._bulge.material.opacity = 0.3 + 0.1*Math.abs(Math.sin(this._spgTime*0.7));
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 61 injected! Lines:', lineCount);
