'use strict';
// inject-w57.cjs — Wave 57: cosmic-web-pancake-collapse + stellar-wind-bow-nebula
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-web-pancake-collapse"')) {
  console.log('Wave 57 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity intergalactic-bridge-filament></a-entity>';
const HTML_INSERT = `      <a-entity intergalactic-bridge-filament></a-entity>
      <!-- ── COSMIC WEB PANCAKE COLLAPSE — Zeldovich sheet/pancake formation ── -->
      <a-entity cosmic-web-pancake-collapse></a-entity>
      <!-- ── STELLAR WIND BOW NEBULA — runaway star with IR bow shock ── -->
      <a-entity stellar-wind-bow-nebula></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC WEB PANCAKE COLLAPSE — in the Zeldovich approximation dark
         matter collapses first into sheets ("pancakes"), then filaments, then
         halos. A pancake is a thin flat overdensity visible edge-on as a wall.
         The cosmic web is built of these intersecting sheets and the halos that
         live at their intersections. We render a large thin flat overdensity
         sheet with halos at intersections and voids behind it.
         Position: (-900, -300, 600).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("cosmic-web-pancake-collapse", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-900, -300, 600);
          scene.add(this._root);

          /* main pancake/wall sheet */
          this._sheet = new THREE.Mesh(
            new THREE.PlaneGeometry(600, 400, 30, 20),
            new THREE.MeshBasicMaterial({
              color: 0x2244aa, transparent: true, opacity: 0.04,
              blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
            })
          );
          this._root.add(this._sheet);

          /* sheet wireframe overlay */
          var wfGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(600, 400, 30, 20));
          this._root.add(new THREE.LineSegments(wfGeo, new THREE.LineBasicMaterial({
            color: 0x3355cc, transparent: true, opacity: 0.015,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* halos at intersections — random on the plane */
          for (var hi = 0; hi < 20; hi++) {
            var hm = new THREE.Mesh(
              new THREE.SphereGeometry(5 + Math.random()*10, 4, 3),
              new THREE.MeshBasicMaterial({
                color: 0xffddaa, transparent: true, opacity: 0.3,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            hm.position.set(
              (Math.random()-0.5)*560,
              (Math.random()-0.5)*360,
              (Math.random()-0.5)*10
            );
            this._root.add(hm);
          }

          /* perpendicular filaments emanating from halos */
          var FN = 12;
          var fPts = new Float32Array(FN * 6);
          for (var fi = 0; fi < FN; fi++) {
            var fx = (Math.random()-0.5)*520, fy = (Math.random()-0.5)*340;
            var fLen = 80 + Math.random()*80;
            fPts[fi*6  ]=fx; fPts[fi*6+1]=fy; fPts[fi*6+2]=-fLen/2;
            fPts[fi*6+3]=fx; fPts[fi*6+4]=fy; fPts[fi*6+5]=fLen/2;
          }
          var fGeo = new THREE.BufferGeometry();
          fGeo.setAttribute("position", new THREE.BufferAttribute(fPts, 3));
          this._root.add(new THREE.LineSegments(fGeo, new THREE.LineBasicMaterial({
            color: 0x4466cc, transparent: true, opacity: 0.05,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._cwpcTime = 0;
          console.log("[cosmic-web-pancake-collapse] loaded at (-900,-300,600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cwpcTime += dt;
          this._sheet.material.opacity = 0.03 + 0.015*Math.abs(Math.sin(this._cwpcTime * 0.18));
          this._root.rotation.y += 0.000025 * dt;
        },
      });

      /* ====================================================================
         STELLAR WIND BOW NEBULA — runaway O/B stars moving supersonically
         through the ISM create IR bow shocks ahead of them where their stellar
         wind piles up the surrounding material. Zeta Ophiuchi is a classic
         example — a runaway star ejected from a binary after its companion
         went supernova, now plowing through the ISM at ~26 km/s. We render
         the star, a parabolic bow shock arc, and a wake behind.
         Position: (400, -700, 400).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-wind-bow-nebula", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(400, -700, 400);
          scene.add(this._root);

          /* runaway star */
          this._star = new THREE.Mesh(
            new THREE.SphereGeometry(5, 7, 6),
            new THREE.MeshBasicMaterial({
              color: 0x88ccff, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._star);

          /* parabolic bow shock arc — points ahead in +X direction */
          var ARC = 80;
          var arcPts = new Float32Array(ARC * 3);
          for (var ai = 0; ai < ARC; ai++) {
            var ath = (ai/(ARC-1) - 0.5) * Math.PI * 1.3;
            /* parabola: x = R0 - r^2/2R0, y = r */
            var R0 = 45;
            var aw = R0 * Math.sin(ath);
            var adist = R0 * (1 - Math.cos(ath));
            arcPts[ai*3  ] = 45 + adist;
            arcPts[ai*3+1] = aw;
            arcPts[ai*3+2] = 0;
          }
          var arcGeo = new THREE.BufferGeometry();
          arcGeo.setAttribute("position", new THREE.BufferAttribute(arcPts, 3));
          this._bow = new THREE.Line(arcGeo, new THREE.LineBasicMaterial({
            color: 0xffaa44, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._bow);

          /* bow shock glow shell — half sphere facing motion direction */
          this._bowGlow = new THREE.Mesh(
            new THREE.SphereGeometry(50, 8, 8, 0, Math.PI),
            new THREE.MeshBasicMaterial({
              color: 0xff8833, transparent: true, opacity: 0.06,
              blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
            })
          );
          this._bowGlow.rotation.y = -Math.PI/2;
          this._bowGlow.position.x = 45;
          this._root.add(this._bowGlow);

          /* wake / trailing ISM column */
          var WP = 100;
          var wPts = new Float32Array(WP * 3);
          for (var wi = 0; wi < WP; wi++) {
            var wt = wi/(WP-1);
            wPts[wi*3  ] = -wt * 160 + (Math.random()-0.5)*12;
            wPts[wi*3+1] = (Math.random()-0.5)*18;
            wPts[wi*3+2] = (Math.random()-0.5)*18;
          }
          var wGeo = new THREE.BufferGeometry();
          wGeo.setAttribute("position", new THREE.BufferAttribute(wPts, 3));
          this._root.add(new THREE.Points(wGeo, new THREE.PointsMaterial({
            color: 0xaaaaff, size: 2,
            transparent: true, opacity: 0.15,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._swbnTime = 0;
          console.log("[stellar-wind-bow-nebula] loaded at (400,-700,400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._swbnTime += dt;
          this._bow.material.opacity = 0.4 + 0.2*Math.abs(Math.sin(this._swbnTime * 1.1));
          this._bowGlow.material.opacity = 0.04 + 0.03*Math.abs(Math.sin(this._swbnTime * 0.7));
          this._root.rotation.z += 0.000008 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 57 injected! Lines:', lineCount);
