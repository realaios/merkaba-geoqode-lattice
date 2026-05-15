"use strict";
// inject-w91.cjs — Wave 91: magnetospheric-mirror-bounce-loss-cone + cosmic-anisotropic-synchrotron-ridge
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (
  html.includes(
    'AFRAME.registerComponent("magnetospheric-mirror-bounce-loss-cone"',
  )
) {
  console.log("Wave 91 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity interstellar-turbulence-kolmogorov-cascade></a-entity>";
const HTML_INSERT = `      <a-entity interstellar-turbulence-kolmogorov-cascade></a-entity>
      <!-- ── MAGNETOSPHERIC MIRROR BOUNCE LOSS CONE — trapped particle bounce shells ── -->
      <a-entity magnetospheric-mirror-bounce-loss-cone></a-entity>
      <!-- ── COSMIC ANISOTROPIC SYNCHROTRON RIDGE — edge-on synchrotron ridge in lobe ── -->
      <a-entity cosmic-anisotropic-synchrotron-ridge></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         MAGNETOSPHERIC MIRROR BOUNCE LOSS CONE — relativistic electrons
         trapped in a dipole field bounce between magnetic mirror points;
         those with pitch angles inside the loss cone precipitate.
         Renders: dipole field shell + bouncing particle traces spiraling
         along field lines + a glowing loss-cone precipitation patch.
         Position: (400, 600, 400).
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("magnetospheric-mirror-bounce-loss-cone", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(400, 600, 400);
          scene.add(this._root);

          /* dipole field lines */
          for (var fi = 0; fi < 8; fi++) {
            var fa = fi/8 * 2*Math.PI;
            var fPts = [];
            for (var ft = -80; ft <= 80; ft++) {
              var ftheta = (ft/80) * Math.PI*0.45 + Math.PI*0.5;
              var fr = 30 * Math.pow(Math.sin(ftheta), 2);
              fPts.push(fr*Math.sin(ftheta)*Math.cos(fa), fr*Math.cos(ftheta), fr*Math.sin(ftheta)*Math.sin(fa));
            }
            var fGeo = new THREE.BufferGeometry();
            fGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(fPts), 3));
            this._root.add(new THREE.Line(fGeo, new THREE.LineBasicMaterial({
              color: 0x335588, transparent: true, opacity: 0.25,
              blending: THREE.AdditiveBlending,
            })));
          }

          /* bouncing particles */
          this._particles = [];
          for (var pi = 0; pi < 30; pi++) {
            var pAngle = pi/30 * 2*Math.PI;
            var pPts = new Float32Array(80*3);
            var pGeo = new THREE.BufferGeometry();
            pGeo.setAttribute("position", new THREE.BufferAttribute(pPts, 3));
            var pMesh = new THREE.Line(pGeo, new THREE.LineBasicMaterial({
              color: 0x00ccff, transparent: true, opacity: 0.4,
              blending: THREE.AdditiveBlending,
            }));
            this._root.add(pMesh);
            this._particles.push({ pts: pPts, angle: pAngle, phase: Math.random()*Math.PI*2, speed: 0.8+Math.random()*0.8, r: 20+Math.random()*15 });
          }

          /* loss cone precipitation */
          var NL2 = 1500;
          var lPts = new Float32Array(NL2*3);
          this._lPts = lPts; this._NL2 = NL2;
          for (var li = 0; li < NL2; li++) {
            lPts[li*3  ] = (Math.random()-0.5)*10;
            lPts[li*3+1] = -28 + Math.random()*8;
            lPts[li*3+2] = (Math.random()-0.5)*10;
          }
          var lGeo = new THREE.BufferGeometry();
          lGeo.setAttribute("position", new THREE.BufferAttribute(lPts, 3));
          this._lossCone = new THREE.Points(lGeo, new THREE.PointsMaterial({
            color: 0xffaa00, size: 0.5,
            transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._lossCone);

          this._mblcTime = 0;
          console.log("[magnetospheric-mirror-bounce-loss-cone] loaded at (400,600,400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._mblcTime += dt;
          var t = this._mblcTime;
          for (var pi = 0; pi < this._particles.length; pi++) {
            var p = this._particles[pi];
            for (var k = 0; k < 80; k++) {
              var kf = k/79;
              var theta = Math.PI*0.5 + (kf - 0.5)*Math.PI*0.45;
              var r = p.r * Math.pow(Math.sin(theta), 2);
              var spiralAngle = p.angle + kf*6 - t*p.speed + p.phase;
              p.pts[k*3  ] = r*Math.sin(theta)*Math.cos(spiralAngle);
              p.pts[k*3+1] = r*Math.cos(theta);
              p.pts[k*3+2] = r*Math.sin(theta)*Math.sin(spiralAngle);
            }
            p.phase += dt * p.speed * 3;
            p.mesh_ref && (p.mesh_ref.geometry.attributes.position.needsUpdate = true);
            /* direct ref */
            this._root.children[8 + pi] && (this._root.children[8 + pi].geometry.attributes.position.needsUpdate = true);
          }
          this._lossCone.material.opacity = 0.4 + 0.2*Math.sin(t*3.2);
          /* drift precipitation */
          for (var li = 0; li < this._NL2; li++) {
            this._lPts[li*3+1] -= 8*dt;
            if (this._lPts[li*3+1] < -36) this._lPts[li*3+1] = -28;
          }
          this._lossCone.geometry.attributes.position.needsUpdate = true;
        },
      });

      /* ====================================================================
         COSMIC ANISOTROPIC SYNCHROTRON RIDGE — a radio lobe seen nearly
         edge-on shows a bright synchrotron ridge: electrons gyrating in
         a compressed field along the cocoon wall produce a limb-brightened
         arc.
         Renders: curved bright synchrotron arc + diffuse lobe haze.
         Position: (-800, 100, -200).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("cosmic-anisotropic-synchrotron-ridge", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-800, 100, -200);
          scene.add(this._root);

          /* synchrotron arc */
          var NA = 180;
          var aPts = [];
          for (var ai = 0; ai < NA; ai++) {
            var af = ai/(NA-1);
            var aa = (-0.6 + af*1.2)*Math.PI;
            aPts.push(60*Math.sin(aa), 0, 60*Math.cos(aa));
          }
          var aGeo = new THREE.BufferGeometry();
          aGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(aPts), 3));
          this._arc = new THREE.Line(aGeo, new THREE.LineBasicMaterial({
            color: 0xff6600, transparent: true, opacity: 0.7,
            blending: THREE.AdditiveBlending,
          }));
          this._root.add(this._arc);

          /* lobe haze */
          var NL3 = 7000;
          var lPts3 = new Float32Array(NL3*3);
          this._lPts3 = lPts3; this._NL3 = NL3;
          for (var li3 = 0; li3 < NL3; li3++) {
            var la = (Math.random()-0.5)*Math.PI*1.2;
            var lr = 10 + Math.random()*55;
            lPts3[li3*3  ] = lr*Math.sin(la);
            lPts3[li3*3+1] = (Math.random()-0.5)*20;
            lPts3[li3*3+2] = lr*Math.cos(la);
          }
          var lGeo3 = new THREE.BufferGeometry();
          lGeo3.setAttribute("position", new THREE.BufferAttribute(lPts3, 3));
          this._lobe = new THREE.Points(lGeo3, new THREE.PointsMaterial({
            color: 0xff8833, size: 0.5,
            transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._lobe);

          this._casrTime = 0;
          console.log("[cosmic-anisotropic-synchrotron-ridge] loaded at (-800,100,-200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._casrTime += dt;
          var t = this._casrTime;
          this._arc.material.opacity = 0.6 + 0.15*Math.sin(t*1.4);
          this._lobe.material.opacity = 0.1 + 0.04*Math.sin(t*0.9);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 91 injected! Lines:", lineCount);
