"use strict";
// inject-w86.cjs — Wave 86: stellar-corona-plasmoid-ejection + cosmic-mirror-instability-patch
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes('AFRAME.registerComponent("stellar-corona-plasmoid-ejection"')
) {
  console.log("Wave 86 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR = "      <a-entity cosmic-reaccretion-infall></a-entity>";
const HTML_INSERT = `      <a-entity cosmic-reaccretion-infall></a-entity>
      <!-- ── STELLAR CORONA PLASMOID EJECTION — magnetic flux ropes snap and launch plasmoids ── -->
      <a-entity stellar-corona-plasmoid-ejection></a-entity>
      <!-- ── COSMIC MIRROR INSTABILITY PATCH — pressure-anisotropic plasma patch in ICM ── -->
      <a-entity cosmic-mirror-instability-patch></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         STELLAR CORONA PLASMOID EJECTION — current sheets in the stellar
         corona pinch off into discrete plasmoids that propagate outward.
         Renders: the star, looping flux-rope arcs, and spherical plasmoid
         blobs that accelerate outward and fade.
         Position: (-500, -200, -700).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-corona-plasmoid-ejection", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-500, -200, -700);
          scene.add(this._root);

          /* star */
          this._star2 = new THREE.Mesh(
            new THREE.SphereGeometry(7, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0xffdd88 })
          );
          this._root.add(this._star2);

          /* corona halo */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(12, 12, 10),
            new THREE.MeshBasicMaterial({
              color: 0xff9900,
              transparent: true, opacity: 0.08,
              blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
            })
          ));

          /* plasmoid pool */
          this._plasm = [];
          for (var pi = 0; pi < 14; pi++) {
            var pm = new THREE.Mesh(
              new THREE.SphereGeometry(1.2 + Math.random()*1.5, 8, 6),
              new THREE.MeshBasicMaterial({
                color: 0xff6600,
                transparent: true, opacity: 0,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            this._root.add(pm);
            this._plasm.push({
              mesh: pm,
              dir: new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize(),
              r: 12, speed: 8 + Math.random()*12, life: Math.random(),
              maxLife: 0.8 + Math.random()*1.5,
            });
          }

          /* flux rope arcs */
          for (var ri = 0; ri < 6; ri++) {
            var rAngle = (ri/6)*Math.PI*2;
            var arcPts = [];
            for (var ai = 0; ai <= 20; ai++) {
              var af = ai/20;
              var ah = 15*Math.sin(af*Math.PI);
              arcPts.push(
                10*Math.cos(rAngle + af*0.8), ah,
                10*Math.sin(rAngle + af*0.8)
              );
            }
            var aGeo = new THREE.BufferGeometry();
            aGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(arcPts), 3));
            this._root.add(new THREE.Line(aGeo, new THREE.LineBasicMaterial({
              color: 0xffaa00, transparent: true, opacity: 0.2,
              blending: THREE.AdditiveBlending,
            })));
          }

          this._scpTime = 0;
          console.log("[stellar-corona-plasmoid-ejection] loaded at (-500,-200,-700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._scpTime += dt;
          var t = this._scpTime;
          for (var pi = 0; pi < this._plasm.length; pi++) {
            var p = this._plasm[pi];
            p.life += dt;
            if (p.life > p.maxLife) {
              p.life = 0;
              p.dir.set(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
              p.r = 12; p.speed = 8 + Math.random()*12;
              p.maxLife = 0.8 + Math.random()*1.5;
            }
            p.r += p.speed * dt;
            p.mesh.position.copy(p.dir).multiplyScalar(p.r);
            var f = p.life/p.maxLife;
            p.mesh.material.opacity = 0.6*(1-f);
          }
          this._star2.material.color.setHSL(0.1, 1, 0.65 + 0.15*Math.sin(t*3));
        },
      });

      /* ====================================================================
         COSMIC MIRROR INSTABILITY PATCH — a region of the intracluster
         medium where the magnetic pressure anisotropy triggers the mirror
         instability: magnetic mirrors trap particles, forming a patchwork
         of alternating high/low field regions.
         Renders: alternating compressed / rarefied field patches as two
         interleaved particle layers of different brightness.
         Position: (1100, -100, 500).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-mirror-instability-patch", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(1100, -100, 500);
          scene.add(this._root);

          /* compressed (bright) patches */
          var NB = 4000;
          var bPts = new Float32Array(NB*3);
          this._bPts = bPts; this._NB = NB;
          for (var bi = 0; bi < NB; bi++) {
            var ba = Math.random()*2*Math.PI;
            var be = Math.random()*Math.PI;
            var br = 10 + Math.random()*50;
            bPts[bi*3  ] = br*Math.sin(be)*Math.cos(ba);
            bPts[bi*3+1] = br*Math.cos(be)*0.4;
            bPts[bi*3+2] = br*Math.sin(be)*Math.sin(ba);
          }
          var bGeo = new THREE.BufferGeometry();
          bGeo.setAttribute("position", new THREE.BufferAttribute(bPts, 3));
          this._brightMesh = new THREE.Points(bGeo, new THREE.PointsMaterial({
            color: 0xaaddff, size: 1.1,
            transparent: true, opacity: 0.4,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._brightMesh);

          /* rarefied (dim) patches */
          var ND2 = 3000;
          var dPts = new Float32Array(ND2*3);
          this._dPts = dPts; this._ND2 = ND2;
          for (var di2 = 0; di2 < ND2; di2++) {
            var da2 = Math.random()*2*Math.PI;
            var de2 = Math.random()*Math.PI;
            var dr2 = 10 + Math.random()*50;
            dPts[di2*3  ] = dr2*Math.sin(de2)*Math.cos(da2);
            dPts[di2*3+1] = dr2*Math.cos(de2)*0.4;
            dPts[di2*3+2] = dr2*Math.sin(de2)*Math.sin(da2);
          }
          var dGeo2 = new THREE.BufferGeometry();
          dGeo2.setAttribute("position", new THREE.BufferAttribute(dPts, 3));
          this._dimMesh = new THREE.Points(dGeo2, new THREE.PointsMaterial({
            color: 0x334455, size: 0.8,
            transparent: true, opacity: 0.2,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._dimMesh);

          this._cmipTime = 0;
          console.log("[cosmic-mirror-instability-patch] loaded at (1100,-100,500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cmipTime += dt;
          var t = this._cmipTime;
          /* oscillate field strength — bright pulses in antiphase with dim */
          this._brightMesh.material.opacity = 0.3 + 0.15*Math.sin(t*1.4);
          this._dimMesh.material.opacity   = 0.2 + 0.1*Math.sin(t*1.4 + Math.PI);
          this._root.rotation.y += 0.005*dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 86 injected! Lines:", lineCount);
