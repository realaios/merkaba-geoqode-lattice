"use strict";
// inject-w45.cjs — Wave 45: quasar-broad-line-region + cosmic-magnetic-reconnection-sheet
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("quasar-broad-line-region"')) {
  console.log("Wave 45 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity starburst-superwind></a-entity>";
const HTML_INSERT = `      <a-entity starburst-superwind></a-entity>
      <!-- ── QUASAR BROAD LINE REGION — BLR clouds rapidly orbiting AGN ── -->
      <a-entity quasar-broad-line-region></a-entity>
      <!-- ── COSMIC MAGNETIC RECONNECTION SHEET — plasmoid-unstable current sheet ── -->
      <a-entity cosmic-magnetic-reconnection-sheet></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         QUASAR BROAD LINE REGION — the BLR consists of fast-orbiting gas
         clouds (v~5000-10000 km/s) very close to the AGN. They see the
         continuum and re-emit broad emission lines. Clouds form a
         flattened distribution with radial infall/outflow components.
         Position: (-700, 300, 400).
         Components:
           - AGN accretion disk: flat glowing disk
           - Ionizing continuum source: bright central UV/X-ray point
           - BLR cloud swarm: 400 orbiting clouds (fast random orbits)
           - NLR halo: outer narrower-line region clouds (200 pts, slower)
           - Dust torus: obscuring torus (ring, brownish)
           - Jet knot: inner jet base (column of points above disk)
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("quasar-broad-line-region", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-700, 300, 400);
          scene.add(this._root);

          /* accretion disk */
          this._root.add(new THREE.Mesh(
            new THREE.TorusGeometry(20, 6, 6, 60),
            new THREE.MeshBasicMaterial({ color: 0xff8822, transparent: true, opacity: 0.70, depthWrite: false })
          ));

          /* central AGN */
          this._agn = new THREE.Mesh(
            new THREE.SphereGeometry(3, 8, 6),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          this._root.add(this._agn);

          /* BLR clouds — 400 orbiting clouds */
          this._blrClouds = [];
          for (var bi = 0; bi < 400; bi++) {
            var br = 8 + Math.random()*35;
            var ba = Math.random()*2*Math.PI;
            var bInc = (Math.random()-0.5)*0.8; /* inclination from equatorial */
            var cm = new THREE.Mesh(
              new THREE.SphereGeometry(0.8+Math.random()*1.4, 4, 3),
              new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.08+Math.random()*0.15, 1, 0.7),
                transparent: true, opacity: 0.55 + Math.random()*0.25,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            cm.position.set(br*Math.cos(ba), br*bInc, br*Math.sin(ba));
            this._root.add(cm);
            var angSpeed = 0.5 + 1.0/Math.sqrt(br); /* Keplerian-ish */
            this._blrClouds.push({ mesh: cm, r: br, angle: ba, inc: bInc, speed: angSpeed });
          }

          /* NLR outer halo */
          var NLN = 200;
          var nlPts = new Float32Array(NLN * 3);
          for (var nli = 0; nli < NLN; nli++) {
            var nlp = Math.acos(2*Math.random()-1), nla = Math.random()*2*Math.PI;
            var nlr = 60 + Math.random()*40;
            nlPts[nli*3  ] = nlr*Math.sin(nlp)*Math.cos(nla);
            nlPts[nli*3+1] = nlr*Math.cos(nlp)*0.4;
            nlPts[nli*3+2] = nlr*Math.sin(nlp)*Math.sin(nla);
          }
          var nlGeo = new THREE.BufferGeometry();
          nlGeo.setAttribute("position", new THREE.BufferAttribute(nlPts, 3));
          this._root.add(new THREE.Points(nlGeo, new THREE.PointsMaterial({
            color: 0xaaffaa, size: 1.8, transparent: true, opacity: 0.20,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* dust torus */
          this._root.add(new THREE.Mesh(
            new THREE.TorusGeometry(38, 12, 6, 40),
            new THREE.MeshBasicMaterial({ color: 0x442200, transparent: true, opacity: 0.60, depthWrite: false })
          ));

          /* jet base */
          var JBN = 100;
          var jbPts = new Float32Array(JBN * 3);
          for (var jbi = 0; jbi < JBN; jbi++) {
            jbPts[jbi*3  ] = (Math.random()-0.5)*4;
            jbPts[jbi*3+1] = jbi * 0.7;
            jbPts[jbi*3+2] = (Math.random()-0.5)*4;
          }
          var jbGeo = new THREE.BufferGeometry();
          jbGeo.setAttribute("position", new THREE.BufferAttribute(jbPts, 3));
          this._root.add(new THREE.Points(jbGeo, new THREE.PointsMaterial({
            color: 0x88aaff, size: 2.0, transparent: true, opacity: 0.50,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._blrTime = 0;
          console.log("[quasar-broad-line-region] loaded at (-700,300,400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._blrTime += dt;

          /* AGN continuum flicker */
          var af = 0.7 + 0.3*Math.sin(this._blrTime * 15.0);
          this._agn.material.opacity = af;

          /* BLR orbital motion (update every other tick for perf) */
          for (var bi = 0; bi < this._blrClouds.length; bi += 2) {
            var bc = this._blrClouds[bi];
            bc.angle += bc.speed * dt;
            bc.mesh.position.set(bc.r*Math.cos(bc.angle), bc.r*bc.inc, bc.r*Math.sin(bc.angle));
          }

          this._root.rotation.y += 0.0001 * dt;
        },
      });

      /* ====================================================================
         COSMIC MAGNETIC RECONNECTION SHEET — a current sheet becomes
         plasmoid-unstable (Lundquist number > 10^4) and fragments into a
         chain of magnetic islands (plasmoids) that merge and are ejected.
         Seen in solar flares, magnetosphere, and astrophysical jets.
         Position: (100, 500, -600).
         Components:
           - Current sheet: thin flat region (line of points)
           - Plasmoid chain: 12 flux ropes / magnetic islands (O-points)
           - X-point current layers: bright reconnection sites between plasmoids
           - Exhaust jets: bi-directional outflow jets from X-points
           - Energetic particles: accelerated particle cloud from X-points
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("cosmic-magnetic-reconnection-sheet", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(100, 500, -600);
          scene.add(this._root);

          /* current sheet — flat layer of points */
          var CSN = 300;
          var csPts = new Float32Array(CSN * 3);
          for (var csi = 0; csi < CSN; csi++) {
            csPts[csi*3  ] = (Math.random()-0.5)*150;
            csPts[csi*3+1] = (Math.random()-0.5)*4;
            csPts[csi*3+2] = (Math.random()-0.5)*40;
          }
          var csGeo = new THREE.BufferGeometry();
          csGeo.setAttribute("position", new THREE.BufferAttribute(csPts, 3));
          this._root.add(new THREE.Points(csGeo, new THREE.PointsMaterial({
            color: 0xffdd44, size: 1.8, transparent: true, opacity: 0.30,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* 12 plasmoids (magnetic islands = torus shapes) */
          this._plasmoids = [];
          for (var pi = 0; pi < 12; pi++) {
            var px = -75 + pi*14;
            var pR = 4 + Math.random()*5;
            var pm = new THREE.Mesh(
              new THREE.TorusGeometry(pR, pR*0.35, 4, 20),
              new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(pi/12, 1, 0.7),
                transparent: true, opacity: 0.60,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            pm.position.x = px;
            pm.rotation.x = Math.PI/2;
            this._root.add(pm);
            this._plasmoids.push({ mesh: pm, px0: px, vy: (Math.random()-0.5)*0.5 });
          }

          /* X-point reconnection sites (bright flashes between plasmoids) */
          for (var xi = 0; xi < 11; xi++) {
            var xm = new THREE.Mesh(
              new THREE.SphereGeometry(1.5, 4, 3),
              new THREE.MeshBasicMaterial({
                color: 0xffffff, transparent: true, opacity: 0.80,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            xm.position.x = -75 + xi*14 + 7;
            this._root.add(xm);
          }

          /* exhaust jets from X-points */
          var EJN = 200;
          var ejPts = new Float32Array(EJN * 3);
          for (var eji = 0; eji < EJN; eji++) {
            var ejSign = Math.random() < 0.5 ? 1 : -1;
            ejPts[eji*3  ] = (Math.random()-0.5)*130;
            ejPts[eji*3+1] = ejSign*(5 + Math.random()*25);
            ejPts[eji*3+2] = (Math.random()-0.5)*20;
          }
          var ejGeo = new THREE.BufferGeometry();
          ejGeo.setAttribute("position", new THREE.BufferAttribute(ejPts, 3));
          this._root.add(new THREE.Points(ejGeo, new THREE.PointsMaterial({
            color: 0xff6600, size: 2.2, transparent: true, opacity: 0.40,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* energetic particles */
          var EPN = 250;
          var epPts = new Float32Array(EPN * 3);
          for (var epi = 0; epi < EPN; epi++) {
            epPts[epi*3  ] = (Math.random()-0.5)*160;
            epPts[epi*3+1] = (Math.random()-0.5)*60;
            epPts[epi*3+2] = (Math.random()-0.5)*60;
          }
          var epGeo = new THREE.BufferGeometry();
          epGeo.setAttribute("position", new THREE.BufferAttribute(epPts, 3));
          this._root.add(new THREE.Points(epGeo, new THREE.PointsMaterial({
            color: 0x00ffaa, size: 1.5, transparent: true, opacity: 0.18,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._csTime = 0;
          console.log("[cosmic-magnetic-reconnection-sheet] loaded at (100,500,-600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._csTime += dt;

          /* plasmoids drift and bounce */
          for (var pi = 0; pi < this._plasmoids.length; pi++) {
            var pm = this._plasmoids[pi];
            pm.mesh.position.y += pm.vy * dt;
            if (Math.abs(pm.mesh.position.y) > 8) pm.vy = -pm.vy;
            pm.mesh.rotation.z += 0.5 * dt;
          }

          this._root.rotation.y += 0.0002 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 45 injected! Lines:", lineCount);
