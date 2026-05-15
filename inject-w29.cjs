'use strict';
// inject-w29.cjs — Wave 29: sungrazing-comet + plasma-double-layer
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("sungrazing-comet"')) {
  console.log('Wave 29 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity interstellar-cloud-collapse></a-entity>';
const HTML_INSERT = `      <a-entity interstellar-cloud-collapse></a-entity>
      <!-- ── SUNGRAZING COMET — comet on extreme elliptical orbit with bright sunward tail ── -->
      <a-entity sungrazing-comet></a-entity>
      <!-- ── PLASMA DOUBLE LAYER — electrostatic charge boundary in a plasma jet ── -->
      <a-entity plasma-double-layer></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         SUNGRAZING COMET — a Kreutz-family sungrazer on a near-parabolic
         orbit. The nucleus skims within a stellar radius. At perihelion the
         coma expands rapidly and the ion/dust tail stretches thousands of km
         pointed anti-sun.
         Position: (0, -500, 600).
         Components:
           - Host star (r=20, yellow-white at origin of component space)
           - Nucleus: r=3 grey/icy sphere on extreme elliptical orbit (a=400)
           - Coma: 800 expanding gas pts around nucleus — brightness peaks at perihelion
           - Ion tail: 1200 pts streaming directly away from star (cyan-blue)
           - Dust tail: 900 pts in a broad curved sweep (yellowish)
           - Perihelion flash: brief bright surge when nucleus at r<30
           - Orbital period ~18 s; speed peaks at perihelion (vis-viva)
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("sungrazing-comet", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(0, -500, 600);
          scene.add(this._root);

          /* ── host star ── */
          this._root.add(new THREE.Mesh(
            new THREE.SphereGeometry(20, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0xffeebb })
          ));

          /* ── nucleus ── */
          this._nucleusMat = new THREE.MeshBasicMaterial({ color: 0x888899 });
          this._nucleusMesh = new THREE.Mesh(
            new THREE.SphereGeometry(3, 6, 4),
            this._nucleusMat
          );
          this._root.add(this._nucleusMesh);

          /* ── coma (800 pts — positions updated in tick) ── */
          var CN = 800;
          this._comaPts = new Float32Array(CN * 3);
          this._comaRnd = new Float32Array(CN * 3);
          for (var ci = 0; ci < CN; ci++) {
            this._comaRnd[ci*3  ] = (Math.random()-0.5);
            this._comaRnd[ci*3+1] = (Math.random()-0.5);
            this._comaRnd[ci*3+2] = (Math.random()-0.5);
          }
          var comaGeo = new THREE.BufferGeometry();
          comaGeo.setAttribute("position", new THREE.BufferAttribute(this._comaPts, 3));
          this._comaGeo = comaGeo;
          this._comaMat = new THREE.PointsMaterial({
            color: 0x88ccff, size: 2.2, transparent: true, opacity: 0.40,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(comaGeo, this._comaMat));

          /* ── ion tail (1200 pts, pointing away from star) ── */
          var ITN = 1200;
          this._ionRnd = new Float32Array(ITN * 3);
          this._ionPts = new Float32Array(ITN * 3);
          for (var ii = 0; ii < ITN; ii++) {
            this._ionRnd[ii*3  ] = (Math.random()-0.5) * 12;
            this._ionRnd[ii*3+1] = (Math.random()-0.5) * 12;
            this._ionRnd[ii*3+2] = Math.random();  /* 0-1, scaled in tick */
          }
          var ionGeo = new THREE.BufferGeometry();
          ionGeo.setAttribute("position", new THREE.BufferAttribute(this._ionPts, 3));
          this._ionGeo = ionGeo;
          this._ionMat = new THREE.PointsMaterial({
            color: 0x44aaff, size: 2.0, transparent: true, opacity: 0.40,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(ionGeo, this._ionMat));

          /* ── dust tail (900 pts, broader curved sweep) ── */
          var DTN2 = 900;
          this._dustPts = new Float32Array(DTN2 * 3);
          this._dustRnd = new Float32Array(DTN2 * 3);
          for (var di = 0; di < DTN2; di++) {
            this._dustRnd[di*3  ] = (Math.random()-0.5) * 30;
            this._dustRnd[di*3+1] = (Math.random()-0.5) * 30;
            this._dustRnd[di*3+2] = Math.random();
          }
          var dustGeo = new THREE.BufferGeometry();
          dustGeo.setAttribute("position", new THREE.BufferAttribute(this._dustPts, 3));
          this._dustGeo = dustGeo;
          this._dustMat = new THREE.PointsMaterial({
            color: 0xffee99, size: 2.5, transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(dustGeo, this._dustMat));

          /* orbital params */
          this._a = 400;   /* semi-major axis */
          this._e = 0.96;  /* high eccentricity */
          this._period = 18.0; /* seconds */
          this._sgTime = 0;

          console.log("[sungrazing-comet] orbiting at (0,-500,600)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._sgTime += dt;

          /* ── Kepler solve (mean anomaly → eccentric → true anomaly) ── */
          var M = (this._sgTime / this._period) * 2 * Math.PI;
          M = M % (2 * Math.PI);
          var E = M;
          for (var ki = 0; ki < 6; ki++) E = M + this._e * Math.sin(E);
          var cosE = Math.cos(E), sinE = Math.sin(E);
          var r = this._a * (1 - this._e * cosE);
          var theta = 2 * Math.atan2(
            Math.sqrt(1+this._e) * Math.sin(E/2),
            Math.sqrt(1-this._e) * Math.cos(E/2)
          );
          var nx = r * Math.cos(theta);
          var ny = 0;
          var nz = r * Math.sin(theta);

          this._nucleusMesh.position.set(nx, ny, nz);

          /* ── anti-sun direction ── */
          var starToNuc = new AFRAME.THREE.Vector3(nx, ny, nz).normalize();
          var tailDir = starToNuc.clone().negate();

          /* ── coma size: larger near perihelion ── */
          var periDist = this._a * (1 - this._e);
          var comaR = 5 + Math.max(0, (50 - r) / 50) * 60;
          this._comaMat.opacity = 0.2 + 0.6 * Math.max(0, (60-r)/60);
          var caArr = this._comaGeo.attributes.position.array;
          for (var ci = 0; ci < 800; ci++) {
            caArr[ci*3  ] = nx + this._comaRnd[ci*3  ] * 2 * comaR;
            caArr[ci*3+1] = ny + this._comaRnd[ci*3+1] * 2 * comaR;
            caArr[ci*3+2] = nz + this._comaRnd[ci*3+2] * 2 * comaR;
          }
          this._comaGeo.attributes.position.needsUpdate = true;

          /* ── ion tail along tailDir ── */
          var tailLen = 200 + Math.max(0, (80-r)/80) * 600;
          var iaArr = this._ionGeo.attributes.position.array;
          for (var ii = 0; ii < 1200; ii++) {
            var td = this._ionRnd[ii*3+2] * tailLen;
            iaArr[ii*3  ] = nx + tailDir.x * td + this._ionRnd[ii*3  ];
            iaArr[ii*3+1] = ny + tailDir.y * td + this._ionRnd[ii*3+1];
            iaArr[ii*3+2] = nz + tailDir.z * td + this._ionRnd[ii*3+2];
          }
          this._ionGeo.attributes.position.needsUpdate = true;
          this._ionMat.opacity = 0.20 + 0.50 * Math.max(0, (100-r)/100);

          /* ── dust tail — slightly curved (bend 20°) ── */
          var dArr = this._dustGeo.attributes.position.array;
          for (var di = 0; di < 900; di++) {
            var dtd = this._dustRnd[di*3+2] * (tailLen * 0.7);
            var ang = dtd * 0.002;
            dArr[di*3  ] = nx + (tailDir.x*Math.cos(ang)+0.3*Math.sin(ang))*dtd + this._dustRnd[di*3  ];
            dArr[di*3+1] = ny + this._dustRnd[di*3+1];
            dArr[di*3+2] = nz + (tailDir.z*Math.cos(ang)+0.1*Math.sin(ang))*dtd + this._dustRnd[di*3+1];
          }
          this._dustGeo.attributes.position.needsUpdate = true;
        },
      });

      /* ====================================================================
         PLASMA DOUBLE LAYER — a sharp electrostatic charge boundary within
         a plasma jet. Two layers of opposite charge create a strong electric
         field that accelerates particles, producing bright auroral arcs and
         a sharp luminous boundary.
         Position: (400, -800, -200).
         Components:
           - Jet body: 1500 pts flowing along Y axis (blue-white plasma)
           - Negative layer: 400 pts in a thin slab (blue-purple, r~60)
           - Positive layer: 400 pts 8 units above (red-orange, r~60)
           - Accelerated electron beam: 600 pts downstream shooting past boundary
           - Field lines: 12 vertical line segments spanning the double layer
           - Auroral arc: 300 pts spiralling out from boundary in ±X direction
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("plasma-double-layer", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(400, -800, -200);
          scene.add(this._root);

          /* ── jet body (1500 pts along Y) ── */
          var JN = 1500;
          this._jetPts = new Float32Array(JN * 3);
          this._jetV = new Float32Array(JN);
          for (var ji = 0; ji < JN; ji++) {
            this._jetPts[ji*3  ] = (Math.random()-0.5) * 30;
            this._jetPts[ji*3+1] = -300 + Math.random() * 600;
            this._jetPts[ji*3+2] = (Math.random()-0.5) * 30;
            this._jetV[ji] = 50 + Math.random() * 80;
          }
          var jGeo = new THREE.BufferGeometry();
          jGeo.setAttribute("position", new THREE.BufferAttribute(this._jetPts, 3));
          this._jetGeo = jGeo;
          this._root.add(new THREE.Points(jGeo, new THREE.PointsMaterial({
            color: 0x55aaff, size: 2.0, transparent: true, opacity: 0.30,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── negative layer (slab at y=-4) ── */
          var NLN = 400;
          var nlPts = new Float32Array(NLN * 3);
          for (var ni = 0; ni < NLN; ni++) {
            var nr = Math.random() * 60;
            var na = Math.random() * 2 * Math.PI;
            nlPts[ni*3  ] = nr * Math.cos(na);
            nlPts[ni*3+1] = -4 + (Math.random()-0.5) * 3;
            nlPts[ni*3+2] = nr * Math.sin(na);
          }
          var nlGeo = new THREE.BufferGeometry();
          nlGeo.setAttribute("position", new THREE.BufferAttribute(nlPts, 3));
          this._root.add(new THREE.Points(nlGeo, new THREE.PointsMaterial({
            color: 0x5533ff, size: 3.0, transparent: true, opacity: 0.70,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── positive layer (slab at y=+4) ── */
          var PLN = 400;
          var plPts = new Float32Array(PLN * 3);
          for (var pli = 0; pli < PLN; pli++) {
            var pr = Math.random() * 60;
            var pa = Math.random() * 2 * Math.PI;
            plPts[pli*3  ] = pr * Math.cos(pa);
            plPts[pli*3+1] = 4 + (Math.random()-0.5) * 3;
            plPts[pli*3+2] = pr * Math.sin(pa);
          }
          var plGeo = new THREE.BufferGeometry();
          plGeo.setAttribute("position", new THREE.BufferAttribute(plPts, 3));
          this._root.add(new THREE.Points(plGeo, new THREE.PointsMaterial({
            color: 0xff6633, size: 3.0, transparent: true, opacity: 0.70,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── accelerated beam (600 pts downstream, y > 0) ── */
          var ABN = 600;
          this._beamPts = new Float32Array(ABN * 3);
          this._beamV = new Float32Array(ABN);
          for (var abi = 0; abi < ABN; abi++) {
            this._beamPts[abi*3  ] = (Math.random()-0.5)*10;
            this._beamPts[abi*3+1] = 4 + Math.random() * 300;
            this._beamPts[abi*3+2] = (Math.random()-0.5)*10;
            this._beamV[abi] = 150 + Math.random() * 100;
          }
          var abGeo = new THREE.BufferGeometry();
          abGeo.setAttribute("position", new THREE.BufferAttribute(this._beamPts, 3));
          this._beamGeo = abGeo;
          this._root.add(new THREE.Points(abGeo, new THREE.PointsMaterial({
            color: 0x00ffff, size: 2.0, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ── auroral arcs (300 pts each side) ── */
          for (var ai = 0; ai < 2; ai++) {
            var sign2 = ai === 0 ? 1 : -1;
            var arcPts = new Float32Array(300 * 3);
            for (var arci = 0; arci < 300; arci++) {
              var t = arci / 299;
              var ang2 = t * Math.PI;
              arcPts[arci*3  ] = sign2 * (20 + t * 80);
              arcPts[arci*3+1] = (t - 0.5) * 60 + Math.sin(t*Math.PI)*20;
              arcPts[arci*3+2] = (Math.random()-0.5) * 10;
            }
            var arcGeo = new THREE.BufferGeometry();
            arcGeo.setAttribute("position", new THREE.BufferAttribute(arcPts, 3));
            this._root.add(new THREE.Points(arcGeo, new THREE.PointsMaterial({
              color: 0x88ff99, size: 2.5, transparent: true, opacity: 0.50,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          this._pdlTime = 0;
          console.log("[plasma-double-layer] sparking at (400,-800,-200)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._pdlTime += dt;

          /* ── jet streams along Y ── */
          var jArr = this._jetGeo.attributes.position.array;
          for (var ji = 0; ji < 1500; ji++) {
            jArr[ji*3+1] += this._jetV[ji] * dt;
            if (jArr[ji*3+1] > 300) jArr[ji*3+1] = -300;
          }
          this._jetGeo.attributes.position.needsUpdate = true;

          /* ── beam shoots downstream ── */
          var bArr = this._beamGeo.attributes.position.array;
          for (var abi = 0; abi < 600; abi++) {
            bArr[abi*3+1] += this._beamV[abi] * dt;
            if (bArr[abi*3+1] > 310) bArr[abi*3+1] = 4 + Math.random() * 5;
          }
          this._beamGeo.attributes.position.needsUpdate = true;
          this._root.rotation.y += 0.005 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 29 injected! Lines:', lineCount);
