"use strict";
// inject-w95.cjs — Wave 95: cosmic-flux-tube-wave-packet + stellar-opacity-ionization-front
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("cosmic-flux-tube-wave-packet"')) {
  console.log("Wave 95 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

const HTML_ANCHOR =
  "      <a-entity interstellar-alf-speed-mach-cone></a-entity>";
const HTML_INSERT = `      <a-entity interstellar-alf-speed-mach-cone></a-entity>
      <!-- ── COSMIC FLUX TUBE WAVE PACKET — wave packet propagating along flux tube ── -->
      <a-entity cosmic-flux-tube-wave-packet></a-entity>
      <!-- ── STELLAR OPACITY IONIZATION FRONT — radiative ionization front advance ── -->
      <a-entity stellar-opacity-ionization-front></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC FLUX TUBE WAVE PACKET — in solar/stellar atmospheres,
         magnetic flux tubes guide Alfven wave packets that heat the corona.
         Renders: a glowing tube with a propagating brightness wave packet.
         Position: (0, 1200, 0).
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("cosmic-flux-tube-wave-packet", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(0, 1200, 0);
          scene.add(this._root);

          /* tube outline as line strip */
          var NT2 = 200;
          var tPts2 = [];
          for (var ti3 = 0; ti3 < NT2; ti3++) {
            var tv = ti3/(NT2-1);
            tPts2.push(8*Math.sin(tv*Math.PI*3), -40+tv*80, 8*Math.cos(tv*Math.PI*3));
          }
          var tGeo3 = new THREE.BufferGeometry();
          tGeo3.setAttribute("position", new THREE.BufferAttribute(new Float32Array(tPts2), 3));
          this._tube = new THREE.Line(tGeo3, new THREE.LineBasicMaterial({
            color: 0xffaa22, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending,
          }));
          this._root.add(this._tube);
          this._tubeArr = tPts2;
          this._NT2 = NT2;

          /* wave packet particles along tube */
          var NWP = 300;
          var wpPts = new Float32Array(NWP*3);
          this._wpPts = wpPts; this._NWP = NWP;
          var wGeo2 = new THREE.BufferGeometry();
          wGeo2.setAttribute("position", new THREE.BufferAttribute(wpPts, 3));
          this._wp = new THREE.Points(wGeo2, new THREE.PointsMaterial({
            color: 0xffeebb, size: 1.5,
            transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._wp);
          this._cftwpTime = 0;
          console.log("[cosmic-flux-tube-wave-packet] loaded at (0,1200,0)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._cftwpTime += dt;
          var t = this._cftwpTime;
          var NT2 = this._NT2, NWP = this._NWP;
          /* packet center oscillates along tube */
          var center = (Math.sin(t*0.5)*0.5+0.5);
          for (var wi = 0; wi < NWP; wi++) {
            var wf = Math.random();
            var tv = center + (Math.random()-0.5)*0.12;
            tv = Math.max(0, Math.min(1, tv));
            var xi = Math.round(tv*(NT2-1))*3;
            this._wpPts[wi*3  ] = this._tubeArr[xi  ] + (Math.random()-0.5)*2;
            this._wpPts[wi*3+1] = this._tubeArr[xi+1] + (Math.random()-0.5)*2;
            this._wpPts[wi*3+2] = this._tubeArr[xi+2] + (Math.random()-0.5)*2;
          }
          this._wp.geometry.attributes.position.needsUpdate = true;
          this._wp.material.opacity = 0.7;
        },
      });

      /* ====================================================================
         STELLAR OPACITY IONIZATION FRONT — radiative ionization sweeps
         outward from a newly-born hot star, heating and ionizing neutral
         gas in a thin advancing shell.
         Renders: expanding translucent sphere with glowing edge.
         Position: (-600, 400, 700).
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("stellar-opacity-ionization-front", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          this._root = new THREE.Group();
          this._root.position.set(-600, 400, 700);
          scene.add(this._root);

          /* ionized interior haze */
          var NH = 3000;
          var hPts = new Float32Array(NH*3);
          for (var hi = 0; hi < NH; hi++) {
            var ha = Math.random()*2*Math.PI, hb = Math.random()*Math.PI;
            var hr = Math.random()*20;
            hPts[hi*3  ] = hr*Math.sin(hb)*Math.cos(ha);
            hPts[hi*3+1] = hr*Math.cos(hb);
            hPts[hi*3+2] = hr*Math.sin(hb)*Math.sin(ha);
          }
          var hGeo = new THREE.BufferGeometry();
          hGeo.setAttribute("position", new THREE.BufferAttribute(hPts, 3));
          this._haze = new THREE.Points(hGeo, new THREE.PointsMaterial({
            color: 0x88ffcc, size: 0.5, transparent: true, opacity: 0.06,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._haze);

          /* front shell */
          var NF2 = 4000;
          var fPts2 = new Float32Array(NF2*3);
          this._fPts2 = fPts2;
          for (var fi2 = 0; fi2 < NF2; fi2++) {
            var fa = Math.random()*2*Math.PI, fb = Math.random()*Math.PI;
            fPts2[fi2*3  ] = Math.sin(fb)*Math.cos(fa);
            fPts2[fi2*3+1] = Math.cos(fb);
            fPts2[fi2*3+2] = Math.sin(fb)*Math.sin(fa);
          }
          var fGeo2 = new THREE.BufferGeometry();
          fGeo2.setAttribute("position", new THREE.BufferAttribute(fPts2, 3));
          this._front = new THREE.Points(fGeo2, new THREE.PointsMaterial({
            color: 0x22ffee, size: 0.8, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          }));
          this._root.add(this._front);

          /* central star */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 8, 7),
            new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false })
          ));

          this._soifTime = 0; this._radius = 5;
          console.log("[stellar-opacity-ionization-front] loaded at (-600,400,700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200)*0.001;
          this._soifTime += dt;
          var r = 5 + (this._soifTime % 12) * 1.5;
          this._front.scale.set(r, r, r);
          this._haze.scale.set(r*0.9, r*0.9, r*0.9);
          this._front.material.opacity = 0.35 * Math.max(0, 1 - (this._soifTime%12)/12);
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 95 injected! Lines:", lineCount);
