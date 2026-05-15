"use strict";
// inject-w69.cjs — Wave 69: runaway-stellar-wind-bow + cosmic-ram-pressure-stripping
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("runaway-stellar-wind-bow"')) {
  console.log("Wave 69 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR = "      <a-entity dark-energy-void-expansion></a-entity>";
const HTML_INSERT = `      <a-entity dark-energy-void-expansion></a-entity>
      <!-- ── RUNAWAY STELLAR WIND BOW — O-star ejected at high velocity plowing ISM ── -->
      <a-entity runaway-stellar-wind-bow></a-entity>
      <!-- ── COSMIC RAM PRESSURE STRIPPING — galaxy falling into cluster, gas stripped ── -->
      <a-entity cosmic-ram-pressure-stripping></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         RUNAWAY STELLAR WIND BOW — a massive O or B star ejected from its
         birth cluster at 100–200 km/s collides with the ambient ISM. The
         stellar wind terminates in a standoff bow shock, heated to 10^6 K,
         visible in infrared (Spitzer 24 µm). The shock is an asymmetric
         paraboloid ahead of the star; the tail extends downstream. Wind bubbles
         pile up on the upstream side. Position: (900, 300, 1100).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("runaway-stellar-wind-bow", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(900, 300, 1100);
          scene.add(this._root);

          /* the runaway star */
          this._rStar = new THREE.Mesh(
            new THREE.SphereGeometry(8, 10, 10),
            new THREE.MeshBasicMaterial({
              color: 0x6699ff, transparent: true, opacity: 0.8,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._rStar);

          /* bow shock paraboloid — generated as points on r = R0/(1+cos(theta)) */
          var NB = 48;
          var bPts = [];
          var R0 = 40;
          for (var bi = 0; bi < NB; bi++) {
            for (var bj = 0; bj <= 32; bj++) {
              var theta = (bj / 32) * Math.PI * 0.9;
              var phi = (bi / NB) * 2 * Math.PI;
              var r = R0 / (1 + Math.cos(theta));
              if (r > 200) continue;
              var bx = -r * Math.cos(theta); // upstream direction -x
              var by = r * Math.sin(theta) * Math.cos(phi);
              var bz = r * Math.sin(theta) * Math.sin(phi);
              bPts.push(new THREE.Vector3(bx, by, bz));
            }
          }
          var bGeo = new THREE.BufferGeometry().setFromPoints(bPts);
          this._bowShock = new THREE.Points(bGeo, new THREE.PointsMaterial({
            color: 0xff6600, size: 1.8,
            transparent: true, opacity: 0.4,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._bowShock);

          /* downstream tail */
          var NT = 300;
          var tPts = new Float32Array(NT*3);
          this._tailPts = tPts;
          this._tailPhase = new Float32Array(NT);
          this._tailR = new Float32Array(NT);
          for (var ti = 0; ti < NT; ti++) {
            this._tailPhase[ti] = Math.random();
            this._tailR[ti] = Math.random()*20;
          }
          var tGeo = new THREE.BufferGeometry();
          tGeo.setAttribute("position", new THREE.BufferAttribute(tPts, 3));
          this._tail = new THREE.Points(tGeo, new THREE.PointsMaterial({
            color: 0xff9933, size: 1.3,
            transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._tail);

          /* stellar wind glow */
          this._windGlow = new THREE.Mesh(
            new THREE.SphereGeometry(25, 8, 8),
            new THREE.MeshBasicMaterial({
              color: 0x3366ff, transparent: true, opacity: 0.04,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._windGlow);

          this._rswTime = 0;
          this._NT = NT;
          console.log("[runaway-stellar-wind-bow] loaded at (900,300,1100)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._rswTime += dt;
          var t = this._rswTime;
          /* bow shock flicker */
          this._bowShock.material.opacity = 0.35 + 0.1*Math.sin(t*3);
          this._windGlow.material.opacity = 0.03 + 0.02*Math.sin(t*2.3);
          /* tail advection */
          for (var ti = 0; ti < this._NT; ti++) {
            this._tailPhase[ti] = (this._tailPhase[ti] + 0.08*dt) % 1;
            var dist = this._tailPhase[ti]*160;
            var phi2 = (ti/this._NT)*2*Math.PI;
            this._tailPts[ti*3  ] = dist + 8; // downstream = +x
            this._tailPts[ti*3+1] = this._tailR[ti]*Math.cos(phi2)*(1+dist*0.01);
            this._tailPts[ti*3+2] = this._tailR[ti]*Math.sin(phi2)*(1+dist*0.01);
          }
          this._tail.geometry.attributes.position.needsUpdate = true;
        },
      });

      /* ====================================================================
         COSMIC RAM PRESSURE STRIPPING — galaxies falling into cluster
         potential at 1000+ km/s experience ram pressure P = rho*v^2 from
         the hot ICM. The ISM is stripped from the outer disk first, then
         progressively inner regions, leaving a long trailing gas tail
         (jellyfish galaxy). We show a disk galaxy with ISM particles being
         stripped into a trailing wake. Position: (-400, 700, -900).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("cosmic-ram-pressure-stripping", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-400, 700, -900);
          scene.add(this._root);

          /* galaxy disk — stellar component */
          var NGS = 400;
          var gsPts = new Float32Array(NGS*3);
          this._gsAngle = new Float32Array(NGS);
          this._gsRad = new Float32Array(NGS);
          for (var gi = 0; gi < NGS; gi++) {
            this._gsAngle[gi] = Math.random()*2*Math.PI;
            this._gsRad[gi] = 5 + Math.random()*50;
            gsPts[gi*3  ] = this._gsRad[gi]*Math.cos(this._gsAngle[gi]);
            gsPts[gi*3+1] = (Math.random()-0.5)*4;
            gsPts[gi*3+2] = this._gsRad[gi]*Math.sin(this._gsAngle[gi]);
          }
          var gsGeo = new THREE.BufferGeometry();
          gsGeo.setAttribute("position", new THREE.BufferAttribute(gsPts, 3));
          this._galStars = new THREE.Points(gsGeo, new THREE.PointsMaterial({
            color: 0xffffcc, size: 1.2,
            transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._galStars);
          this._gsPts = gsPts;
          this._NGS = NGS;

          /* stripped gas tail — jellyfish streamers */
          var NJF = 500;
          var jPts = new Float32Array(NJF*3);
          this._jPts = jPts;
          this._jPhase = new Float32Array(NJF);
          this._jStartR = new Float32Array(NJF);
          this._jStartA = new Float32Array(NJF);
          for (var ji = 0; ji < NJF; ji++) {
            this._jPhase[ji] = Math.random();
            this._jStartR[ji] = 30 + Math.random()*20;
            this._jStartA[ji] = Math.random()*2*Math.PI;
          }
          var jGeo = new THREE.BufferGeometry();
          jGeo.setAttribute("position", new THREE.BufferAttribute(jPts, 3));
          this._jellyfishTail = new THREE.Points(jGeo, new THREE.PointsMaterial({
            color: 0x44aaff, size: 1.5,
            transparent: true, opacity: 0.4,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._jellyfishTail);

          this._crpTime = 0;
          this._NJF = NJF;
          console.log("[cosmic-ram-pressure-stripping] loaded at (-400,700,-900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._crpTime += dt;
          var t = this._crpTime;
          /* disk stars orbit */
          for (var gi = 0; gi < this._NGS; gi++) {
            this._gsAngle[gi] += 0.3 / Math.sqrt(this._gsRad[gi]) * dt;
            this._gsPts[gi*3  ] = this._gsRad[gi]*Math.cos(this._gsAngle[gi]);
            this._gsPts[gi*3+2] = this._gsRad[gi]*Math.sin(this._gsAngle[gi]);
          }
          this._galStars.geometry.attributes.position.needsUpdate = true;
          /* jellyfish streamers */
          for (var ji = 0; ji < this._NJF; ji++) {
            this._jPhase[ji] = (this._jPhase[ji] + 0.07*dt) % 1;
            var trailing = this._jPhase[ji]*120;
            var jx = this._jStartR[ji]*Math.cos(this._jStartA[ji]);
            var jz = this._jStartR[ji]*Math.sin(this._jStartA[ji]);
            /* ram direction = +y (galaxy falling downward) */
            this._jPts[ji*3  ] = jx + (Math.random()-0.5)*6;
            this._jPts[ji*3+1] = trailing + (Math.random()-0.5)*8;
            this._jPts[ji*3+2] = jz + (Math.random()-0.5)*6;
          }
          this._jellyfishTail.geometry.attributes.position.needsUpdate = true;
          this._root.rotation.y += 0.00005*dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 69 injected! Lines:", lineCount);
