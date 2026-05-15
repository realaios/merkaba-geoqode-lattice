'use strict';
// inject-w28.cjs — Wave 28: quasar-host-galaxy + interstellar-cloud-collapse
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("quasar-host-galaxy"')) {
  console.log('Wave 28 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity magnetopause-flux></a-entity>';
const HTML_INSERT = `      <a-entity magnetopause-flux></a-entity>
      <!-- ── QUASAR HOST GALAXY — diffuse galaxy hosting a hyper-luminous quasar core ── -->
      <a-entity quasar-host-galaxy></a-entity>
      <!-- ── INTERSTELLAR CLOUD COLLAPSE — giant molecular cloud collapsing to form stars ── -->
      <a-entity interstellar-cloud-collapse></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         QUASAR HOST GALAXY — a high-redshift galaxy whose nucleus blazes at
         10,000× the luminosity of the Milky Way. The galactic disk appears
         almost washed out by the quasar glare at its centre.
         Position: (600, 600, -700).
         Components:
           - Quasar nucleus: tiny brilliant point source, blazing white-blue strobe
           - Broad-line region: 200 rapidly-orbiting gas clumps (r=10-30, yellow)
           - Narrow-line cone: two ionisation cones (1200 pts each) extending ±200
           - Host disk: 3000 pts in a ~200-radius flat disk, heavily outshone
           - Extended halo: 600 pts of faint old stellar population
           - Dust torus: 400 pts in compact ring at r=20-40 around nucleus (dark red)
           - Nucleus strobe: flickering at ~2 Hz (accretion variability)
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("quasar-host-galaxy", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(600, 600, -700);
          scene.add(this._root);

          /* ── nucleus ── */
          this._nucleusMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          this._nucleus = new THREE.Mesh(
            new THREE.SphereGeometry(5, 6, 4),
            this._nucleusMat
          );
          this._root.add(this._nucleus);

          /* ── broad-line region gas (200 pts) ── */
          var BLN = 200;
          this._blrA = new Float32Array(BLN);
          this._blrR = new Float32Array(BLN);
          var blrPts = new Float32Array(BLN * 3);
          for (var bi = 0; bi < BLN; bi++) {
            this._blrR[bi] = 10 + Math.random() * 20;
            this._blrA[bi] = Math.random() * 2 * Math.PI;
            blrPts[bi*3  ] = this._blrR[bi] * Math.cos(this._blrA[bi]);
            blrPts[bi*3+1] = (Math.random()-0.5) * 6;
            blrPts[bi*3+2] = this._blrR[bi] * Math.sin(this._blrA[bi]);
          }
          var blrGeo = new THREE.BufferGeometry();
          blrGeo.setAttribute("position", new THREE.BufferAttribute(blrPts, 3));
          this._blrGeo = blrGeo;
          this._root.add(new THREE.Points(blrGeo, new THREE.PointsMaterial({
            color: 0xffdd00, size: 3.0, transparent: true, opacity: 0.70,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── ionisation cones (2 × 1200 pts) ── */
          for (var ci = 0; ci < 2; ci++) {
            var sign = ci === 0 ? 1 : -1;
            var cPts = new Float32Array(1200 * 3);
            for (var cpi = 0; cpi < 1200; cpi++) {
              var dist = Math.random() * 200;
              var coneR = dist * 0.25;
              var cAng = Math.random() * 2 * Math.PI;
              cPts[cpi*3  ] = coneR * Math.cos(cAng);
              cPts[cpi*3+1] = sign * dist;
              cPts[cpi*3+2] = coneR * Math.sin(cAng);
            }
            var cGeo = new THREE.BufferGeometry();
            cGeo.setAttribute("position", new THREE.BufferAttribute(cPts, 3));
            this._root.add(new THREE.Points(cGeo, new THREE.PointsMaterial({
              color: 0x44aaff, size: 1.8, transparent: true, opacity: 0.25,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* ── host disk (3000 pts) ── */
          var HN = 3000;
          var hPts = new Float32Array(HN * 3);
          for (var hi = 0; hi < HN; hi++) {
            var hr = 20 + Math.random() * 200;
            var ha = Math.random() * 2 * Math.PI;
            hPts[hi*3  ] = hr * Math.cos(ha);
            hPts[hi*3+1] = (Math.random()-0.5) * 15;
            hPts[hi*3+2] = hr * Math.sin(ha) * 0.3;
          }
          var hGeo = new THREE.BufferGeometry();
          hGeo.setAttribute("position", new THREE.BufferAttribute(hPts, 3));
          this._root.add(new THREE.Points(hGeo, new THREE.PointsMaterial({
            color: 0xffeedd, size: 1.5, transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── dust torus (400 pts) ── */
          var DTN = 400;
          var dtPts = new Float32Array(DTN * 3);
          for (var dti = 0; dti < DTN; dti++) {
            var dtr = 20 + Math.random() * 20;
            var dta = Math.random() * 2 * Math.PI;
            dtPts[dti*3  ] = dtr * Math.cos(dta);
            dtPts[dti*3+1] = (Math.random()-0.5) * 8;
            dtPts[dti*3+2] = dtr * Math.sin(dta);
          }
          var dtGeo = new THREE.BufferGeometry();
          dtGeo.setAttribute("position", new THREE.BufferAttribute(dtPts, 3));
          this._root.add(new THREE.Points(dtGeo, new THREE.PointsMaterial({
            color: 0x661100, size: 3.5, transparent: true, opacity: 0.50,
            blending: THREE.NormalBlending, depthWrite: false,
          })));

          /* ── halo ── */
          var HALN = 600;
          var halPts = new Float32Array(HALN * 3);
          for (var hali = 0; hali < HALN; hali++) {
            var rh = 200 + Math.random() * 100;
            var ph = Math.acos(2*Math.random()-1);
            var th = Math.random()*2*Math.PI;
            halPts[hali*3  ] = rh*Math.sin(ph)*Math.cos(th);
            halPts[hali*3+1] = rh*Math.cos(ph)*0.4;
            halPts[hali*3+2] = rh*Math.sin(ph)*Math.sin(th)*0.3;
          }
          var halGeo = new THREE.BufferGeometry();
          halGeo.setAttribute("position", new THREE.BufferAttribute(halPts, 3));
          this._root.add(new THREE.Points(halGeo, new THREE.PointsMaterial({
            color: 0xffcc99, size: 1.5, transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._qTime = 0;
          this._blrA_arr = this._blrA;
          this._blrR_arr = this._blrR;
          console.log("[quasar-host-galaxy] blazing at (600,600,-700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._qTime += dt;

          /* ── nucleus strobe ~2 Hz ── */
          this._nucleusMat.opacity = 0.7 + 0.3 * Math.abs(Math.sin(this._qTime * 2 * Math.PI * 2));
          this._nucleus.scale.setScalar(1 + 0.5 * Math.abs(Math.sin(this._qTime * 6.28 * 1.7)));

          /* ── broad-line region fast orbit ── */
          var bArr = this._blrGeo.attributes.position.array;
          for (var bi = 0; bi < 200; bi++) {
            this._blrA_arr[bi] += dt * 1.5 / Math.pow(this._blrR_arr[bi] / 10, 1.5);
            bArr[bi*3  ] = this._blrR_arr[bi] * Math.cos(this._blrA_arr[bi]);
            bArr[bi*3+2] = this._blrR_arr[bi] * Math.sin(this._blrA_arr[bi]);
          }
          this._blrGeo.attributes.position.needsUpdate = true;
          this._root.rotation.y += 0.002 * dt;
        },
      });

      /* ====================================================================
         INTERSTELLAR CLOUD COLLAPSE — a giant molecular cloud (GMC) undergoing
         gravitational collapse to form a stellar cluster. Dense filaments
         converge on a bright protostellar cluster at the centre.
         Position: (-800, 300, -300).
         Components:
           - GMC body: 2500 pts in irregular lumpy cloud (r=0-180)
           - Filaments: 6 dense radial filaments converging on centre (150 pts each)
           - Protostellar cluster: 300 bright pink/white pts at r<20
           - Shock front: 800 pts forming an irregular boundary shell
           - Infalling material: 500 pts with velocity field toward centre
           - HII glow: 400 pts of ionised hydrogen near the bright protos
         @alignment 8→26→48:480  @frequency 396  @domain data-structs
      ==================================================================== */
      AFRAME.registerComponent("interstellar-cloud-collapse", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-800, 300, -300);
          scene.add(this._root);

          /* ── GMC body (2500 pts) ── */
          var GN = 2500;
          var gPts = new Float32Array(GN * 3);
          for (var gi = 0; gi < GN; gi++) {
            var gr = 20 + Math.pow(Math.random(), 2) * 180;
            var gp = Math.acos(2*Math.random()-1);
            var gt = Math.random()*2*Math.PI;
            gPts[gi*3  ] = gr*Math.sin(gp)*Math.cos(gt) + (Math.random()-0.5)*30;
            gPts[gi*3+1] = gr*Math.cos(gp) + (Math.random()-0.5)*20;
            gPts[gi*3+2] = gr*Math.sin(gp)*Math.sin(gt) + (Math.random()-0.5)*30;
          }
          var gGeo = new THREE.BufferGeometry();
          gGeo.setAttribute("position", new THREE.BufferAttribute(gPts, 3));
          this._root.add(new THREE.Points(gGeo, new THREE.PointsMaterial({
            color: 0x334422, size: 3.5, transparent: true, opacity: 0.30,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── filaments (6 × 150 pts) ── */
          var filDirs = [];
          for (var fi = 0; fi < 6; fi++) {
            filDirs.push(new THREE.Vector3(
              Math.sin(fi/6*2*Math.PI), (Math.random()-0.5)*0.6, Math.cos(fi/6*2*Math.PI)
            ).normalize());
            var fPts = new Float32Array(150 * 3);
            for (var fpi = 0; fpi < 150; fpi++) {
              var fd = Math.random() * 200;
              fPts[fpi*3  ] = filDirs[fi].x * fd + (Math.random()-0.5)*15;
              fPts[fpi*3+1] = filDirs[fi].y * fd + (Math.random()-0.5)*15;
              fPts[fpi*3+2] = filDirs[fi].z * fd + (Math.random()-0.5)*15;
            }
            var fGeo = new THREE.BufferGeometry();
            fGeo.setAttribute("position", new THREE.BufferAttribute(fPts, 3));
            this._root.add(new THREE.Points(fGeo, new THREE.PointsMaterial({
              color: 0x667744, size: 2.5, transparent: true, opacity: 0.45,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* ── protostellar cluster (300 pts) ── */
          var PN = 300;
          var pPts = new Float32Array(PN * 3);
          for (var pi = 0; pi < PN; pi++) {
            var pr = Math.random() * 20;
            var pp = Math.acos(2*Math.random()-1);
            var pt = Math.random()*2*Math.PI;
            pPts[pi*3  ] = pr*Math.sin(pp)*Math.cos(pt);
            pPts[pi*3+1] = pr*Math.cos(pp);
            pPts[pi*3+2] = pr*Math.sin(pp)*Math.sin(pt);
          }
          var pGeo = new THREE.BufferGeometry();
          pGeo.setAttribute("position", new THREE.BufferAttribute(pPts, 3));
          this._protoMat = new THREE.PointsMaterial({
            color: 0xffbbdd, size: 3.5, transparent: true, opacity: 0.90,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(pGeo, this._protoMat));

          /* ── shock front (800 pts) ── */
          var SN = 800;
          var sPts = new Float32Array(SN * 3);
          for (var si = 0; si < SN; si++) {
            var sr = 150 + (Math.random()-0.5)*30;
            var sp2 = Math.acos(2*Math.random()-1);
            var st = Math.random()*2*Math.PI;
            sPts[si*3  ] = sr*Math.sin(sp2)*Math.cos(st);
            sPts[si*3+1] = sr*Math.cos(sp2);
            sPts[si*3+2] = sr*Math.sin(sp2)*Math.sin(st);
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(sPts, 3));
          this._root.add(new THREE.Points(sGeo, new THREE.PointsMaterial({
            color: 0x88ffaa, size: 2.0, transparent: true, opacity: 0.20,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── HII region glow (400 pts) ── */
          var HN2 = 400;
          var hPts2 = new Float32Array(HN2 * 3);
          for (var hii = 0; hii < HN2; hii++) {
            var hr = 5 + Math.random() * 60;
            var hp = Math.acos(2*Math.random()-1);
            var ht = Math.random()*2*Math.PI;
            hPts2[hii*3  ] = hr*Math.sin(hp)*Math.cos(ht);
            hPts2[hii*3+1] = hr*Math.cos(hp);
            hPts2[hii*3+2] = hr*Math.sin(hp)*Math.sin(ht);
          }
          var hGeo2 = new THREE.BufferGeometry();
          hGeo2.setAttribute("position", new THREE.BufferAttribute(hPts2, 3));
          this._root.add(new THREE.Points(hGeo2, new THREE.PointsMaterial({
            color: 0xff88aa, size: 2.8, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._iccTime = 0;
          console.log("[interstellar-cloud-collapse] collapsing at (-800,300,-300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._iccTime += dt;
          /* ── protostellar cluster pulse ── */
          this._protoMat.opacity = 0.75 + 0.20 * Math.abs(Math.sin(this._iccTime * 2.3));
          this._root.rotation.y += 0.004 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 28 injected! Lines:', lineCount);
