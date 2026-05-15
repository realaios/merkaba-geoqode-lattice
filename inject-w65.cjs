"use strict";
// inject-w65.cjs — Wave 65: cosmic-dust-spiral-arm + binary-pulsar-periastron-advance
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("cosmic-dust-spiral-arm"')) {
  console.log("Wave 65 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR = "      <a-entity stellar-tidal-oscillation></a-entity>";
const HTML_INSERT = `      <a-entity stellar-tidal-oscillation></a-entity>
      <!-- ── COSMIC DUST SPIRAL ARM — interstellar dust lanes in a spiral arm ── -->
      <a-entity cosmic-dust-spiral-arm></a-entity>
      <!-- ── BINARY PULSAR PERIASTRON ADVANCE — GR-induced orbital precession trace ── -->
      <a-entity binary-pulsar-periastron-advance></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC DUST SPIRAL ARM — in spiral galaxies, dark dust lanes run along
         the leading edges of spiral arms (density wave compression). Dust
         emission at infrared wavelengths traces star formation, while optical
         images show it as dark absorption lanes. We render one grand-design
         spiral arm with an embedded dust lane (dark particles), a chain of
         OB star-forming clumps, and a diffuse ionized gas glow (HII emission).
         Position: (200, -800, -300).
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("cosmic-dust-spiral-arm", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(200, -800, -300);
          scene.add(this._root);

          /* spiral arm star particles */
          var NS = 1800;
          var sPts = new Float32Array(NS*3);
          for (var si = 0; si < NS; si++) {
            var sT = Math.pow(Math.random(), 0.5);
            var sR = 30 + sT * 200;
            var sA = sT * 3.5 + (Math.random()-0.5)*0.35;
            var sW = (Math.random()-0.5)*(8-0.025*sR);
            sPts[si*3  ] = sR*Math.cos(sA);
            sPts[si*3+1] = sW;
            sPts[si*3+2] = sR*Math.sin(sA);
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(sPts, 3));
          this._armStars = new THREE.Points(sGeo, new THREE.PointsMaterial({
            color: 0xddccff, size: 1.5,
            transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._armStars);

          /* dust lane — slightly inward of arm ridge */
          var ND = 800;
          var dPts = new Float32Array(ND*3);
          for (var di = 0; di < ND; di++) {
            var dT = Math.pow(Math.random(), 0.5);
            var dR = 28 + dT * 195;
            var dA = dT * 3.5 - 0.15 + (Math.random()-0.5)*0.15;
            var dW = (Math.random()-0.5)*2;
            dPts[di*3  ] = dR*Math.cos(dA);
            dPts[di*3+1] = dW;
            dPts[di*3+2] = dR*Math.sin(dA);
          }
          var dGeo = new THREE.BufferGeometry();
          dGeo.setAttribute("position", new THREE.BufferAttribute(dPts, 3));
          this._dustLane = new THREE.Points(dGeo, new THREE.PointsMaterial({
            color: 0x442211, size: 2,
            transparent: true, opacity: 0.3,
            blending: THREE.NormalBlending, depthWrite: false,
          }));
          this._root.add(this._dustLane);

          /* HII region glows — star-forming knots */
          var HII = 8;
          this._hiiMeshes = [];
          for (var hi = 0; hi < HII; hi++) {
            var hT = (hi+0.5)/HII;
            var hR = 35 + hT * 185;
            var hA = hT * 3.5;
            var hm = new THREE.Mesh(
              new THREE.SphereGeometry(6 + Math.random()*4, 5, 4),
              new THREE.MeshBasicMaterial({
                color: 0xff4488, transparent: true, opacity: 0.15,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            hm.position.set(hR*Math.cos(hA), 0, hR*Math.sin(hA));
            this._root.add(hm);
            this._hiiMeshes.push(hm);
          }

          this._dsaTime = 0;
          console.log("[cosmic-dust-spiral-arm] loaded at (200,-800,-300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._dsaTime += dt;
          this._root.rotation.y += 0.000015*dt;
          for (var hi = 0; hi < this._hiiMeshes.length; hi++) {
            this._hiiMeshes[hi].material.opacity =
              0.1 + 0.08*Math.abs(Math.sin(this._dsaTime*0.8 + hi*1.3));
          }
        },
      });

      /* ====================================================================
         BINARY PULSAR PERIASTRON ADVANCE — the Hulse-Taylor binary pulsar
         PSR B1913+16 provided the first indirect evidence for gravitational waves:
         its orbital period decays due to GW emission, exactly as GR predicts.
         The system also shows relativistic periastron advance (4.2 deg/yr).
         PSR J0737-3039 is the double pulsar. We render an eccentric binary
         orbit whose periastron point (apsidal line) rotates, traceable via a
         fading orbital trail.
         Position: (800, -400, 900).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("binary-pulsar-periastron-advance", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(800, -400, 900);
          scene.add(this._root);

          /* central NS-NS system glow */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(3, 5, 4),
            new THREE.MeshBasicMaterial({
              color: 0x88bbff, blending: THREE.AdditiveBlending, depthWrite: false,
            })
          ));

          /* orbital trail — 5 faded ellipses at different periastron angles */
          var NE = 5;
          this._orbElts = [];
          for (var ei = 0; ei < NE; ei++) {
            var eOmega = (ei/NE)*2*Math.PI;
            var ecc = 0.617;
            var aPts = new Float32Array(64*3);
            for (var oi = 0; oi < 64; oi++) {
              var ot = (oi/63)*2*Math.PI;
              var ex = 55*Math.cos(ot) - 55*ecc;
              var ey = 55*Math.sqrt(1-ecc*ecc)*Math.sin(ot);
              aPts[oi*3  ] = ex*Math.cos(eOmega) - ey*Math.sin(eOmega);
              aPts[oi*3+1] = 0;
              aPts[oi*3+2] = ex*Math.sin(eOmega) + ey*Math.cos(eOmega);
            }
            var aGeo = new THREE.BufferGeometry();
            aGeo.setAttribute("position", new THREE.BufferAttribute(aPts, 3));
            var aLine = new THREE.Line(aGeo, new THREE.LineBasicMaterial({
              color: 0x4488cc,
              transparent: true,
              opacity: (ei+1)/NE * 0.25,
              blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            this._root.add(aLine);
            this._orbElts.push({ omega: eOmega, line: aLine });
          }

          /* pulsar A */
          this._pA = new THREE.Mesh(
            new THREE.SphereGeometry(2, 4, 3),
            new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false })
          );
          this._root.add(this._pA);
          /* pulsar B */
          this._pB = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 4, 3),
            new THREE.MeshBasicMaterial({ color: 0xaaccff, blending: THREE.AdditiveBlending, depthWrite: false })
          );
          this._root.add(this._pB);

          /* periastron marker */
          this._peri = new THREE.Mesh(
            new THREE.SphereGeometry(1, 4, 3),
            new THREE.MeshBasicMaterial({ color: 0xff6600, blending: THREE.AdditiveBlending, depthWrite: false })
          );
          this._root.add(this._peri);

          this._bppTime = 0;
          this._orbOmega = 0;
          this._eccAnom = 0;
          console.log("[binary-pulsar-periastron-advance] loaded at (800,-400,900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._bppTime += dt;
          /* periastron advance */
          this._orbOmega += 0.004*dt;
          /* eccentric anomaly advance */
          this._eccAnom += 0.5*dt;
          var E = this._eccAnom % (2*Math.PI);
          var ecc = 0.617;
          var a = 55;
          var x = a*(Math.cos(E) - ecc);
          var y = a*Math.sqrt(1-ecc*ecc)*Math.sin(E);
          var px = x*Math.cos(this._orbOmega) - y*Math.sin(this._orbOmega);
          var pz = x*Math.sin(this._orbOmega) + y*Math.cos(this._orbOmega);
          this._pA.position.set(px*0.5, 0, pz*0.5);
          this._pB.position.set(-px*0.5, 0, -pz*0.5);
          /* periastron point — advances with omega */
          var pRA = (a*(1-ecc));
          this._peri.position.set(
            pRA*Math.cos(this._orbOmega), 0, pRA*Math.sin(this._orbOmega)
          );
          this._root.rotation.y += 0.00002*dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 65 injected! Lines:", lineCount);
