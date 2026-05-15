"use strict";
// inject-w34.cjs — Wave 34: stellar-occultation + radio-jet-knots
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");

if (html.includes('AFRAME.registerComponent("stellar-occultation"')) {
  console.log("Wave 34 already injected — skipping");
  process.exit(0);
}

const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = "      <a-entity cosmic-void-spider></a-entity>";
const HTML_INSERT = `      <a-entity cosmic-void-spider></a-entity>
      <!-- ── STELLAR OCCULTATION — moon/body transiting a stellar disk ── -->
      <a-entity stellar-occultation></a-entity>
      <!-- ── RADIO JET KNOTS — VLBI-resolved bright knots in an AGN jet ── -->
      <a-entity radio-jet-knots></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         STELLAR OCCULTATION — a small moon or KBO passing in front of a
         distant bright star, producing a sharp light curve dip. Shown as
         an occulting disc transiting a glowing limb-darkened star disk with
         a diffraction fringe around the shadow edge.
         Position: (300, 700, -300).
         Components:
           - Star disk: glowing ring of pts (r=25), limb-darkened (dimmer edge)
           - Occulter: dark sphere moving across star in 10s, then looping
           - Shadow cone: 300 pts behind occulter (fan of shadow rays)
           - Fresnel diffraction rings: 200 pts around occulter edge (bright arcs)
           - Light curve bar: vertical bar showing flux (bright/dimmed dynamically)
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("stellar-occultation", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(300, 700, -300);
          scene.add(this._root);

          /* star disk: ring of pts representing stellar limb */
          var SDN = 600;
          var sdPts = new Float32Array(SDN * 3);
          var sdColors = new Float32Array(SDN * 3);
          for (var sdi = 0; sdi < SDN; sdi++) {
            var sang = (sdi / SDN) * 2 * Math.PI;
            var sr = 20 + (Math.random()-0.5)*4;
            sdPts[sdi*3  ] = sr * Math.cos(sang);
            sdPts[sdi*3+1] = sr * Math.sin(sang);
            sdPts[sdi*3+2] = (Math.random()-0.5)*1;
            /* limb darkening: dimmer away from center ring */
            var ldFrac = Math.abs(sr - 22) / 4;
            sdColors[sdi*3  ] = 1.0 - ldFrac*0.5;
            sdColors[sdi*3+1] = 0.88 - ldFrac*0.3;
            sdColors[sdi*3+2] = 0.60 - ldFrac*0.2;
          }
          var sdGeo = new THREE.BufferGeometry();
          sdGeo.setAttribute("position", new THREE.BufferAttribute(sdPts, 3));
          sdGeo.setAttribute("color", new THREE.BufferAttribute(sdColors, 3));
          this._sdMat = new THREE.PointsMaterial({
            vertexColors: true, size: 2.5, transparent: true, opacity: 0.80,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(sdGeo, this._sdMat));

          /* also interior fill */
          var SIN = 500;
          var siPts = new Float32Array(SIN * 3);
          for (var sii = 0; sii < SIN; sii++) {
            var sir = Math.random() * 19;
            var sia = Math.random() * 2 * Math.PI;
            siPts[sii*3  ] = sir * Math.cos(sia);
            siPts[sii*3+1] = sir * Math.sin(sia);
            siPts[sii*3+2] = 0;
          }
          var siGeo = new THREE.BufferGeometry();
          siGeo.setAttribute("position", new THREE.BufferAttribute(siPts, 3));
          this._siMat = new THREE.PointsMaterial({
            color: 0xffe8aa, size: 1.8, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(siGeo, this._siMat));

          /* occulter: dark sphere */
          this._occulter = new THREE.Mesh(
            new THREE.SphereGeometry(7, 8, 5),
            new THREE.MeshBasicMaterial({ color: 0x050510 })
          );
          this._occulter.position.z = 2;
          this._root.add(this._occulter);

          /* Fresnel diffraction rings around occulter */
          var FRN = 200;
          var frPts = new Float32Array(FRN * 3);
          for (var fri = 0; fri < FRN; fri++) {
            var fra = Math.random() * 2 * Math.PI;
            var frr = 7.5 + Math.random() * 4;
            frPts[fri*3  ] = frr * Math.cos(fra);
            frPts[fri*3+1] = frr * Math.sin(fra);
            frPts[fri*3+2] = 1.5;
          }
          var frGeo = new THREE.BufferGeometry();
          frGeo.setAttribute("position", new THREE.BufferAttribute(frPts, 3));
          this._frMat = new THREE.PointsMaterial({
            color: 0xffffff, size: 2.0, transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._frMesh = new THREE.Points(frGeo, this._frMat);
          this._frMesh.position.z = 0;
          this._root.add(this._frMesh);

          /* shadow cone */
          var SCN = 300;
          var scPts = new Float32Array(SCN * 3);
          for (var sci = 0; sci < SCN; sci++) {
            var scz = Math.random() * 60 + 5;
            var scr = (scz / 80) * 7;
            var sca = Math.random() * 2 * Math.PI;
            scPts[sci*3  ] = scr * Math.cos(sca);
            scPts[sci*3+1] = scr * Math.sin(sca);
            scPts[sci*3+2] = -scz;
          }
          var scGeo = new THREE.BufferGeometry();
          scGeo.setAttribute("position", new THREE.BufferAttribute(scPts, 3));
          this._scMat = new THREE.PointsMaterial({
            color: 0x221122, size: 1.5, transparent: true, opacity: 0.15,
            blending: THREE.NormalBlending, depthWrite: false,
          });
          this._scMesh = new THREE.Points(scGeo, this._scMat);
          this._root.add(this._scMesh);

          this._ocTime = 0;
          this._TRANSIT = 10.0;
          console.log("[stellar-occultation] loaded at (300,700,-300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._ocTime += dt;

          /* occulter sweeps from x=-50 to x=+50 and loops */
          var t = (this._ocTime % this._TRANSIT) / this._TRANSIT;
          var xPos = -50 + t * 100;
          this._occulter.position.x = xPos;
          this._scMesh.position.x = xPos;
          this._frMesh.position.x = xPos;

          /* Fresnel rings visible only during transit */
          var onStar = Math.abs(xPos) < 22;
          this._frMat.opacity = onStar ? 0.55 + 0.15 * Math.sin(this._ocTime * 8) : 0;

          /* stellar flux dimming based on overlap */
          var overlap = Math.max(0, 1 - Math.abs(xPos) / 22);
          this._sdMat.opacity = 0.80 * (1 - overlap * 0.6);
          this._siMat.opacity = 0.35 * (1 - overlap * 0.75);

          this._root.rotation.z += 0.0002 * dt;
        },
      });

      /* ====================================================================
         RADIO JET KNOTS — VLBI-resolved bright knots in an AGN relativistic
         jet, showing superluminal apparent motion as the jet beams toward us.
         The jet spine has a bright inner beam, and knots propagate outward.
         Position: (-200, 800, 400).
         Components:
           - Jet spine: 1000 pts along Z (hot blue-white, tapered)
           - 8 knots: bright clusters propagating outward at different speeds
           - Counter-jet: 300 pts (very dim, opposite side, barely visible)
           - Cocoon: 400 pts around jet (slower, shocked material)
           - Core: bright central ellipsoid
         Each knot starts at core and moves to tip then resets.
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("radio-jet-knots", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-200, 800, 400);
          scene.add(this._root);

          /* jet spine */
          var JSN = 1000;
          var jsPts = new Float32Array(JSN * 3);
          var jsColors = new Float32Array(JSN * 3);
          for (var jsi = 0; jsi < JSN; jsi++) {
            var jt = jsi / JSN;
            var jr = (1 - jt) * 6 + 0.5;
            var ja = Math.random() * 2 * Math.PI;
            jsPts[jsi*3  ] = jr * Math.cos(ja);
            jsPts[jsi*3+1] = jr * Math.sin(ja);
            jsPts[jsi*3+2] = jt * 200;
            /* brighter near base */
            jsColors[jsi*3  ] = 0.5 + 0.5 * (1 - jt);
            jsColors[jsi*3+1] = 0.7 + 0.3 * (1 - jt);
            jsColors[jsi*3+2] = 1.0;
          }
          var jsGeo = new THREE.BufferGeometry();
          jsGeo.setAttribute("position", new THREE.BufferAttribute(jsPts, 3));
          jsGeo.setAttribute("color", new THREE.BufferAttribute(jsColors, 3));
          this._root.add(new THREE.Points(jsGeo, new THREE.PointsMaterial({
            vertexColors: true, size: 1.8, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* 8 knots with varying speeds */
          this._knots = [];
          for (var ki = 0; ki < 8; ki++) {
            var kn = 80;
            var knPts = new Float32Array(kn * 3);
            for (var kni = 0; kni < kn; kni++) {
              var ka = Math.random() * 2 * Math.PI;
              var kr = Math.random() * 5;
              knPts[kni*3  ] = kr * Math.cos(ka);
              knPts[kni*3+1] = kr * Math.sin(ka);
              knPts[kni*3+2] = (Math.random()-0.5)*6;
            }
            var knGeo = new THREE.BufferGeometry();
            knGeo.setAttribute("position", new THREE.BufferAttribute(knPts, 3));
            var knMat = new THREE.PointsMaterial({
              color: 0xffffff, size: 3.0, transparent: true, opacity: 0.80,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var knMesh = new THREE.Points(knGeo, knMat);
            var kSpeed = 8 + ki * 3;
            var kPhase = ki / 8;
            this._knots.push({ mesh: knMesh, speed: kSpeed, phase: kPhase });
            this._root.add(knMesh);
          }

          /* counter-jet (opposite direction, very dim) */
          var CJN = 300;
          var cjPts = new Float32Array(CJN * 3);
          for (var cji = 0; cji < CJN; cji++) {
            var ct = cji / CJN;
            var ca = Math.random()*2*Math.PI;
            var cr = (1-ct)*3+0.5;
            cjPts[cji*3  ] = cr*Math.cos(ca);
            cjPts[cji*3+1] = cr*Math.sin(ca);
            cjPts[cji*3+2] = -ct*60;
          }
          var cjGeo = new THREE.BufferGeometry();
          cjGeo.setAttribute("position", new THREE.BufferAttribute(cjPts, 3));
          this._root.add(new THREE.Points(cjGeo, new THREE.PointsMaterial({
            color: 0x6688ff, size: 1.2, transparent: true, opacity: 0.07,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* cocoon */
          var CON = 400;
          var coPts = new Float32Array(CON * 3);
          for (var coi = 0; coi < CON; coi++) {
            var cot = coi / CON;
            var cor = 6 + Math.random()*20;
            var coa = Math.random()*2*Math.PI;
            coPts[coi*3  ] = cor*Math.cos(coa);
            coPts[coi*3+1] = cor*Math.sin(coa);
            coPts[coi*3+2] = cot*200;
          }
          var coGeo = new THREE.BufferGeometry();
          coGeo.setAttribute("position", new THREE.BufferAttribute(coPts, 3));
          this._root.add(new THREE.Points(coGeo, new THREE.PointsMaterial({
            color: 0xff5533, size: 1.5, transparent: true, opacity: 0.10,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* core */
          this._core = new THREE.Mesh(
            new THREE.SphereGeometry(5, 7, 4),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          this._root.add(this._core);

          this._rjTime = 0;
          console.log("[radio-jet-knots] loaded at (-200,800,400)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._rjTime += dt;

          /* propagate knots along jet */
          for (var ki = 0; ki < this._knots.length; ki++) {
            var k = this._knots[ki];
            var kz = ((this._rjTime * k.speed * 0.3 + k.phase * 200) % 200);
            k.mesh.position.z = kz;
            /* fade as knot moves out */
            k.mesh.material.opacity = 0.80 * (1 - kz / 200) + 0.10;
          }

          /* core pulse */
          var corePulse = 0.7 + 0.3 * Math.sin(this._rjTime * 4.1);
          this._core.scale.setScalar(corePulse);

          this._root.rotation.y += 0.0004 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
const lineCount = html.split(usesCRLF ? "\r\n" : "\n").length;
console.log("Wave 34 injected! Lines:", lineCount);
