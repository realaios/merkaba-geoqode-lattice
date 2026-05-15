"use strict";
// inject-w48.cjs — Wave 48: cosmic-infrared-background + stellar-age-gradient
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("cosmic-infrared-background"')) {
  console.log("Wave 48 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity intergalactic-transfer-stream></a-entity>";
const HTML_INSERT = `      <a-entity intergalactic-transfer-stream></a-entity>
      <!-- ── COSMIC INFRARED BACKGROUND — cumulative dust-reprocessed starlight from all galaxies ── -->
      <a-entity cosmic-infrared-background></a-entity>
      <!-- ── STELLAR AGE GRADIENT — galaxy showing old-red bulge → young-blue disk ── -->
      <a-entity stellar-age-gradient></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC INFRARED BACKGROUND — the CIB is the integrated emission from
         all dust-enshrouded starbursts and AGN across cosmic time. It carries
         as much energy as the optical background. Visualized as an omnipresent
         warm glow of dusty galaxies filling the sky, with a few resolved
         bright SMGs (submillimetre galaxies) and a heatmap-tinted fog.
         Position: (0, -600, -500).
         Components:
           - SMG swarm: 80 bright dusty galaxies (warm orange blobs)
           - CIB fog: omnidirectional warm IR background cloud
           - Dust emission rings: 10 overlapping diffuse dust shells
           - Faint galaxy background: 500 faint background points
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("cosmic-infrared-background", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(0, -600, -500);
          scene.add(this._root);

          /* SMG bright blobs */
          this._smgs = [];
          for (var si = 0; si < 80; si++) {
            var sp = Math.acos(2*Math.random()-1), sa = Math.random()*2*Math.PI;
            var sr = 80 + Math.random()*120;
            var sm = new THREE.Mesh(
              new THREE.SphereGeometry(2+Math.random()*4, 5, 4),
              new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.07+Math.random()*0.08, 1, 0.5+Math.random()*0.3),
                transparent: true, opacity: 0.55+Math.random()*0.25,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            sm.position.set(sr*Math.sin(sp)*Math.cos(sa), sr*Math.cos(sp), sr*Math.sin(sp)*Math.sin(sa));
            this._root.add(sm);
            this._smgs.push({ mesh: sm, phase: Math.random()*Math.PI*2 });
          }

          /* CIB fog */
          var FN = 500;
          var fPts = new Float32Array(FN * 3);
          for (var fi = 0; fi < FN; fi++) {
            var fp = Math.acos(2*Math.random()-1), fa = Math.random()*2*Math.PI;
            var fr = 60 + Math.random()*160;
            fPts[fi*3  ] = fr*Math.sin(fp)*Math.cos(fa);
            fPts[fi*3+1] = fr*Math.cos(fp);
            fPts[fi*3+2] = fr*Math.sin(fp)*Math.sin(fa);
          }
          var fGeo = new THREE.BufferGeometry();
          fGeo.setAttribute("position", new THREE.BufferAttribute(fPts, 3));
          this._root.add(new THREE.Points(fGeo, new THREE.PointsMaterial({
            color: 0xff8833, size: 1.8, transparent: true, opacity: 0.09,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* dust emission shells */
          for (var di = 0; di < 10; di++) {
            this._root.add(new THREE.Mesh(
              new THREE.SphereGeometry(30+di*20, 6, 5),
              new THREE.MeshBasicMaterial({
                color: 0xdd5500, transparent: true, opacity: 0.015,
                side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
              })
            ));
          }

          /* faint background galaxies */
          var BGN = 500;
          var bgPts = new Float32Array(BGN * 3);
          for (var bgi = 0; bgi < BGN; bgi++) {
            var bgp = Math.acos(2*Math.random()-1), bga = Math.random()*2*Math.PI;
            var bgr = 150 + Math.random()*80;
            bgPts[bgi*3  ] = bgr*Math.sin(bgp)*Math.cos(bga);
            bgPts[bgi*3+1] = bgr*Math.cos(bgp);
            bgPts[bgi*3+2] = bgr*Math.sin(bgp)*Math.sin(bga);
          }
          var bgGeo = new THREE.BufferGeometry();
          bgGeo.setAttribute("position", new THREE.BufferAttribute(bgPts, 3));
          this._root.add(new THREE.Points(bgGeo, new THREE.PointsMaterial({
            color: 0xffaa77, size: 1.0, transparent: true, opacity: 0.18,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._cibTime = 0;
          console.log("[cosmic-infrared-background] loaded at (0,-600,-500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cibTime += dt;

          for (var si = 0; si < this._smgs.length; si += 3) {
            var sm = this._smgs[si];
            sm.mesh.material.opacity = 0.40 + 0.30*Math.abs(Math.sin(this._cibTime*1.5 + sm.phase));
          }

          this._root.rotation.y += 0.00006 * dt;
        },
      });

      /* ====================================================================
         STELLAR AGE GRADIENT — within a late-type galaxy the bulge hosts old
         red/yellow stars (10+ Gyr) while the disk arms host young blue stars
         (<100 Myr) and the outermost disk has intermediate-age red giants.
         Shows a galaxy face-on with a colour-age gradient from center out.
         Position: (-400, 200, -800).
         Components:
           - Old bulge: warm yellow-red central sphere cluster
           - Intermediate disk: orange ring band of aged disk stars
           - Young spiral arms: two bright blue arm arcs
           - HII regions: 20 bright blue-violet star-forming knots
           - Outer disk: faint red extended disk population
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-age-gradient", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-400, 200, -800);
          scene.add(this._root);

          /* old bulge */
          var OBN = 150;
          var obPts = new Float32Array(OBN * 3);
          for (var obi = 0; obi < OBN; obi++) {
            var obr = Math.random()*15;
            var obp2 = Math.acos(2*Math.random()-1), oba = Math.random()*2*Math.PI;
            obPts[obi*3  ] = obr*Math.sin(obp2)*Math.cos(oba);
            obPts[obi*3+1] = obr*Math.cos(obp2)*0.3;
            obPts[obi*3+2] = obr*Math.sin(obp2)*Math.sin(oba);
          }
          var obGeo = new THREE.BufferGeometry();
          obGeo.setAttribute("position", new THREE.BufferAttribute(obPts, 3));
          this._root.add(new THREE.Points(obGeo, new THREE.PointsMaterial({
            color: 0xff9933, size: 2.5, transparent: true, opacity: 0.65,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* intermediate disk ring */
          var IDN = 300;
          var idPts = new Float32Array(IDN * 3);
          for (var idi = 0; idi < IDN; idi++) {
            var ida = Math.random()*2*Math.PI;
            var idr = 18 + Math.random()*20;
            idPts[idi*3  ] = idr*Math.cos(ida);
            idPts[idi*3+1] = (Math.random()-0.5)*2;
            idPts[idi*3+2] = idr*Math.sin(ida);
          }
          var idGeo = new THREE.BufferGeometry();
          idGeo.setAttribute("position", new THREE.BufferAttribute(idPts, 3));
          this._root.add(new THREE.Points(idGeo, new THREE.PointsMaterial({
            color: 0xffbb55, size: 1.8, transparent: true, opacity: 0.40,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* two blue spiral arms */
          for (var arm = 0; arm < 2; arm++) {
            var armPts = [];
            var armBase = arm * Math.PI;
            for (var ak = 0; ak <= 40; ak++) {
              var at = ak/40;
              var aa = armBase + at*2.5;
              var ar = 30 + at*35;
              armPts.push(new THREE.Vector3(ar*Math.cos(aa), (Math.random()-0.5)*2, ar*Math.sin(aa)));
            }
            var armCurve = new THREE.CatmullRomCurve3(armPts);
            var armGeo = new THREE.TubeGeometry(armCurve, 60, 1.5, 4, false);
            this._root.add(new THREE.Mesh(armGeo, new THREE.MeshBasicMaterial({
              color: 0x4488ff, transparent: true, opacity: 0.40,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* HII regions */
          for (var hi = 0; hi < 20; hi++) {
            var hia = Math.random()*2*Math.PI;
            var hir = 30 + Math.random()*35;
            var hm = new THREE.Mesh(
              new THREE.SphereGeometry(2+Math.random()*3, 4, 3),
              new THREE.MeshBasicMaterial({
                color: 0x8844ff, transparent: true, opacity: 0.70,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            hm.position.set(hir*Math.cos(hia), 0, hir*Math.sin(hia));
            this._root.add(hm);
          }

          /* outer disk */
          var ODN = 200;
          var odPts = new Float32Array(ODN * 3);
          for (var odi = 0; odi < ODN; odi++) {
            var oda = Math.random()*2*Math.PI;
            var odr = 65 + Math.random()*30;
            odPts[odi*3  ] = odr*Math.cos(oda);
            odPts[odi*3+1] = (Math.random()-0.5)*4;
            odPts[odi*3+2] = odr*Math.sin(oda);
          }
          var odGeo = new THREE.BufferGeometry();
          odGeo.setAttribute("position", new THREE.BufferAttribute(odPts, 3));
          this._root.add(new THREE.Points(odGeo, new THREE.PointsMaterial({
            color: 0xcc6633, size: 1.5, transparent: true, opacity: 0.20,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._sagTime = 0;
          console.log("[stellar-age-gradient] loaded at (-400,200,-800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._sagTime += dt;
          this._root.rotation.y += 0.00015 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 48 injected! Lines:", lineCount);
