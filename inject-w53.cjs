"use strict";
// inject-w53.cjs — Wave 53: circumstellar-debris-disk + cosmic-sheet-supercluster
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("circumstellar-debris-disk"')) {
  console.log("Wave 53 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity polar-ring-galaxy></a-entity>";
const HTML_INSERT = `      <a-entity polar-ring-galaxy></a-entity>
      <!-- ── CIRCUMSTELLAR DEBRIS DISK — Fomalhaut-style collisional ring ── -->
      <a-entity circumstellar-debris-disk></a-entity>
      <!-- ── COSMIC SHEET SUPERCLUSTER — filament-sheet node like Laniakea ── -->
      <a-entity cosmic-sheet-supercluster></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         CIRCUMSTELLAR DEBRIS DISK — mature stars like Fomalhaut are surrounded
         by collisional debris rings: remnant planetesimals grinding down to
         dust, stirred by unseen planets. The narrow ring at 133-158 AU around
         Fomalhaut shows sharp inner edges (shepherded by Fomalhaut b) and
         produces thermal dust emission visible in Herschel images. We render
         a narrow eccentric ring with dust clumps and a shepherding planet dot.
         Position: (500, 300, 500).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("circumstellar-debris-disk", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(500, 300, 500);
          this._root.rotation.x = -0.4;
          scene.add(this._root);

          /* host star */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(7, 8, 6),
            new THREE.MeshBasicMaterial({
              color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          /* narrow debris ring */
          this._debrisRing = new THREE.Mesh(
            new THREE.TorusGeometry(85, 4, 4, 200),
            new THREE.MeshBasicMaterial({
              color: 0xddaa55, transparent: true, opacity: 0.30,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._debrisRing.rotation.x = Math.PI / 2;
          this._root.add(this._debrisRing);

          /* outer dust halo */
          this._root.add(new THREE.Mesh(
            new THREE.TorusGeometry(85, 10, 4, 100),
            new THREE.MeshBasicMaterial({
              color: 0xcc8833, transparent: true, opacity: 0.06,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ).position||0, (function(){ var m = new THREE.Mesh(
            new THREE.TorusGeometry(85,10,4,100),
            new THREE.MeshBasicMaterial({color:0xcc8833,transparent:true,opacity:0.06,blending:THREE.AdditiveBlending,depthWrite:false})
          ); m.rotation.x=Math.PI/2; this._root.add(m); }.bind(this))());

          /* dust clumps along the ring */
          for (var dc = 0; dc < 30; dc++) {
            var da = (dc / 30) * 2 * Math.PI + (Math.random()-0.5)*0.3;
            var clump = new THREE.Mesh(
              new THREE.SphereGeometry(1.5 + Math.random()*2, 3, 2),
              new THREE.MeshBasicMaterial({
                color: 0xffcc66, transparent: true, opacity: 0.5 + Math.random()*0.3,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            clump.position.set(85*Math.cos(da), 0, 85*Math.sin(da));
            this._root.add(clump);
          }

          /* shepherding planet (Fomalhaut b) */
          this._planet = new THREE.Mesh(
            new THREE.SphereGeometry(2.5, 5, 4),
            new THREE.MeshBasicMaterial({ color: 0xaaccff, depthWrite: false })
          );
          this._root.add(this._planet);
          this._pAngle = 0;

          this._cddTime = 0;
          console.log("[circumstellar-debris-disk] loaded at (500,300,500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cddTime += dt;
          this._debrisRing.rotation.z += 0.00004 * dt;
          /* planet orbits just inside the ring */
          this._pAngle += 0.0003 * dt;
          this._planet.position.set(75*Math.cos(this._pAngle), 0, 75*Math.sin(this._pAngle));
        },
      });

      /* ====================================================================
         COSMIC SHEET SUPERCLUSTER — the cosmic web includes 2D sheet-like
         structures (walls) connecting filaments, enclosing vast voids. The
         Sloan Great Wall is ~1.38 billion light-years long. Laniakea, our own
         supercluster, spans ~520 Mly. We render a flat attractor-basin sheet
         with galaxy-cluster nodes and flowing velocity field streamlines showing
         matter falling inward from both sides.
         Position: (-200, 600, -1000).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("cosmic-sheet-supercluster", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-200, 600, -1000);
          scene.add(this._root);

          /* sheet plane */
          this._root.add(new THREE.Mesh(
            new THREE.PlaneGeometry(700, 700, 1, 1),
            new THREE.MeshBasicMaterial({
              color: 0x223366, transparent: true, opacity: 0.04,
              side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          /* sheet grid lines */
          var gGrid = new THREE.GridHelper(700, 14, 0x334488, 0x334488);
          gGrid.material.transparent = true; gGrid.material.opacity = 0.07;
          this._root.add(gGrid);

          /* galaxy clusters on sheet */
          var GC = 35;
          for (var gi = 0; gi < GC; gi++) {
            var gx = (Math.random()-0.5)*650, gz = (Math.random()-0.5)*650;
            var gm = new THREE.Mesh(
              new THREE.SphereGeometry(5 + Math.random()*12, 5, 4),
              new THREE.MeshBasicMaterial({
                color: 0x8899ff, transparent: true, opacity: 0.30 + Math.random()*0.20,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            gm.position.set(gx, 0, gz);
            this._root.add(gm);
          }

          /* velocity streamlines — matter falling toward sheet */
          var SL = 50;
          var sPts = new Float32Array(SL * 6);
          for (var si = 0; si < SL; si++) {
            var sx = (Math.random()-0.5)*600, sz = (Math.random()-0.5)*600;
            var sy = 80 + Math.random()*120;
            sPts[si*6  ]=sx; sPts[si*6+1]= sy; sPts[si*6+2]=sz;
            sPts[si*6+3]=sx; sPts[si*6+4]=  0; sPts[si*6+5]=sz;
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(sPts, 3));
          this._root.add(new THREE.LineSegments(sGeo, new THREE.LineBasicMaterial({
            color: 0x6688cc, transparent: true, opacity: 0.06,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* attractor core */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(18, 8, 6),
            new THREE.MeshBasicMaterial({
              color: 0x4466ff, transparent: true, opacity: 0.12,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          this._cssTime = 0;
          console.log("[cosmic-sheet-supercluster] loaded at (-200,600,-1000)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cssTime += dt;
          this._root.rotation.y += 0.00003 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 53 injected! Lines:", lineCount);
