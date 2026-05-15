"use strict";
// inject-w43.cjs — Wave 43: solar-corona-loop-arcade + galactic-center-minispiral
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("solar-corona-loop-arcade"')) {
  console.log("Wave 43 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity cosmic-ice-giant-storm></a-entity>";
const HTML_INSERT = `      <a-entity cosmic-ice-giant-storm></a-entity>
      <!-- ── SOLAR CORONA LOOP ARCADE — post-flare coronal loop arcade above active region ── -->
      <a-entity solar-corona-loop-arcade></a-entity>
      <!-- ── GALACTIC CENTER MINISPIRAL — ionized gas minispiral orbiting Sgr A* ── -->
      <a-entity galactic-center-minispiral></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         SOLAR CORONA LOOP ARCADE — after a large solar flare, an arcade of
         post-flare coronal loops forms above the polarity inversion line.
         Loops are filled with hot plasma that cools and drains over hours.
         Bright in EUV / X-ray — beautiful arch structures above the solar limb.
         Position: (300, 600, 300).
         Components:
           - Solar active region: bright active patch on photosphere
           - Flare ribbon N and S: two bright ribbons on surface
           - 8 coronal loop arches: bright arcs of varying heights
           - Hot plasma rain: condensation draining down loops (animated)
           - Cusp/current sheet: pointed cusp above the loop tops
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("solar-corona-loop-arcade", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(300, 600, 300);
          scene.add(this._root);

          /* active region patch */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(18, 20, 16),
            new THREE.MeshBasicMaterial({ color: 0xff8800 })
          ));

          /* flare ribbons N and S */
          for (var ri = 0; ri < 2; ri++) {
            var sign = ri===0 ? 1 : -1;
            var RN = 150;
            var rPts = new Float32Array(RN * 3);
            for (var rk = 0; rk < RN; rk++) {
              var rT = (rk/RN - 0.5)*2;
              rPts[rk*3  ] = rT*20;
              rPts[rk*3+1] = 18.5;
              rPts[rk*3+2] = sign*5 + (Math.random()-0.5)*2;
            }
            var rGeo = new THREE.BufferGeometry();
            rGeo.setAttribute("position", new THREE.BufferAttribute(rPts, 3));
            this._root.add(new THREE.Points(rGeo, new THREE.PointsMaterial({
              color: ri===0 ? 0xff3300 : 0x0088ff, size: 2.5, transparent: true, opacity: 0.80,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* 8 coronal loop arches */
          this._rainPts = [];
          for (var li = 0; li < 8; li++) {
            var lHeight = 12 + li*7;
            var lWidth = 12 + li*3;
            var LN = 120;
            var lPts = new Float32Array(LN * 3);
            for (var lk = 0; lk < LN; lk++) {
              var lT = lk/LN;
              var lA = lT*Math.PI;
              lPts[lk*3  ] = (lT-0.5)*lWidth*2;
              lPts[lk*3+1] = 18 + Math.sin(lA)*lHeight;
              lPts[lk*3+2] = (Math.random()-0.5)*3;
            }
            var lGeo = new THREE.BufferGeometry();
            lGeo.setAttribute("position", new THREE.BufferAttribute(lPts, 3));
            var lHue = 0.6 + 0.3*(li/8); /* blue to white */
            var lColor = new THREE.Color().setHSL(lHue, 1.0, 0.7);
            this._root.add(new THREE.Points(lGeo, new THREE.PointsMaterial({
              color: lColor, size: 2.2, transparent: true, opacity: 0.55,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));

            /* rain particles for each loop */
            var rainData = [];
            for (var ri2 = 0; ri2 < 20; ri2++) {
              rainData.push({ t: Math.random(), side: Math.random() < 0.5 ? 1 : -1, height: lHeight, width: lWidth });
            }
            this._rainPts.push(rainData);
          }

          /* cusp / current sheet above */
          var CUN = 150;
          var cuPts = new Float32Array(CUN * 3);
          for (var cui = 0; cui < CUN; cui++) {
            var cuT = cui/CUN;
            cuPts[cui*3  ] = (Math.random()-0.5)*8;
            cuPts[cui*3+1] = 18 + 80 + cuT*60;
            cuPts[cui*3+2] = (Math.random()-0.5)*5;
          }
          var cuGeo = new THREE.BufferGeometry();
          cuGeo.setAttribute("position", new THREE.BufferAttribute(cuPts, 3));
          this._root.add(new THREE.Points(cuGeo, new THREE.PointsMaterial({
            color: 0xffffff, size: 1.8, transparent: true, opacity: 0.20,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._sclTime = 0;
          console.log("[solar-corona-loop-arcade] loaded at (300,600,300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._sclTime += dt;
          this._root.rotation.y += 0.0002 * dt;
        },
      });

      /* ====================================================================
         GALACTIC CENTER MINISPIRAL — the central parsec of the Milky Way
         contains a three-arm ionized gas minispiral (Northern Arm, Eastern
         Arm, Western Arc) orbiting Sgr A*. Hot gas streamers fall toward
         the SMBH and fuel its accretion. Stars of the S-cluster surround it.
         Position: (-500, 0, -500).
         Components:
           - Sgr A* position: bright central compact dot
           - Northern Arm: curved gas stream (300 pts, orange)
           - Eastern Arm: another infall stream (250 pts, yellow)
           - Western Arc: broad arc (300 pts, red)
           - S-cluster stars: 30 bright stars close to center
           - CND (Circumnuclear Disk): outer torus of molecular gas
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("galactic-center-minispiral", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-500, 0, -500);
          scene.add(this._root);

          /* Sgr A* */
          this._sgrA = new THREE.Mesh(
            new THREE.SphereGeometry(2.5, 6, 4),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          this._root.add(this._sgrA);

          /* Northern Arm */
          var NAN = 300;
          var naPts = new Float32Array(NAN * 3);
          for (var nai = 0; nai < NAN; nai++) {
            var naT = nai/NAN;
            var naA = naT*Math.PI*1.2 - 0.3;
            var naR = 10 + naT*40;
            naPts[nai*3  ] = naR*Math.cos(naA) + (Math.random()-0.5)*5;
            naPts[nai*3+1] = naT*15 + (Math.random()-0.5)*4;
            naPts[nai*3+2] = naR*Math.sin(naA)*0.6 + (Math.random()-0.5)*5;
          }
          var naGeo = new THREE.BufferGeometry();
          naGeo.setAttribute("position", new THREE.BufferAttribute(naPts, 3));
          this._root.add(new THREE.Points(naGeo, new THREE.PointsMaterial({
            color: 0xff8833, size: 2.0, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* Eastern Arm */
          var EAN = 250;
          var eaPts = new Float32Array(EAN * 3);
          for (var eai = 0; eai < EAN; eai++) {
            var eaT = eai/EAN;
            var eaA = eaT*Math.PI*1.0 + Math.PI*0.8;
            var eaR = 8 + eaT*35;
            eaPts[eai*3  ] = eaR*Math.cos(eaA) + (Math.random()-0.5)*5;
            eaPts[eai*3+1] = -eaT*10 + (Math.random()-0.5)*4;
            eaPts[eai*3+2] = eaR*Math.sin(eaA)*0.7 + (Math.random()-0.5)*5;
          }
          var eaGeo = new THREE.BufferGeometry();
          eaGeo.setAttribute("position", new THREE.BufferAttribute(eaPts, 3));
          this._root.add(new THREE.Points(eaGeo, new THREE.PointsMaterial({
            color: 0xffee55, size: 2.0, transparent: true, opacity: 0.50,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* Western Arc */
          var WAN = 300;
          var waPts = new Float32Array(WAN * 3);
          for (var wai = 0; wai < WAN; wai++) {
            var waT = wai/WAN;
            var waA = waT*Math.PI*1.5 - Math.PI*0.3;
            var waR = 35 + (Math.random()-0.5)*8;
            waPts[wai*3  ] = waR*Math.cos(waA) + (Math.random()-0.5)*6;
            waPts[wai*3+1] = (Math.random()-0.5)*8;
            waPts[wai*3+2] = waR*Math.sin(waA)*0.8 + (Math.random()-0.5)*6;
          }
          var waGeo = new THREE.BufferGeometry();
          waGeo.setAttribute("position", new THREE.BufferAttribute(waPts, 3));
          this._root.add(new THREE.Points(waGeo, new THREE.PointsMaterial({
            color: 0xff4422, size: 1.8, transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* S-cluster stars: 30 bright close stars */
          for (var sci = 0; sci < 30; sci++) {
            var scr = 2 + Math.random()*12;
            var sca = Math.random()*2*Math.PI;
            var scph = Math.acos(2*Math.random()-1);
            var scm = new THREE.Mesh(
              new THREE.SphereGeometry(0.5, 4, 3),
              new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            scm.position.set(scr*Math.sin(scph)*Math.cos(sca), scr*Math.cos(scph), scr*Math.sin(scph)*Math.sin(sca));
            this._root.add(scm);
          }

          /* CND outer torus */
          this._root.add(new THREE.Mesh(
            new THREE.TorusGeometry(60, 8, 6, 60),
            new THREE.MeshBasicMaterial({
              color: 0x886600, transparent: true, opacity: 0.18,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          this._gcmTime = 0;
          console.log("[galactic-center-minispiral] loaded at (-500,0,-500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._gcmTime += dt;

          /* Sgr A* flicker */
          var gf = 0.70 + 0.30*Math.sin(this._gcmTime * 8.0);
          this._sgrA.material.opacity = gf;

          this._root.rotation.y += 0.0001 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 43 injected! Lines:", lineCount);
