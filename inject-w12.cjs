"use strict";
/**
 * inject-w12.cjs — wave 12: interstellar-shock + magnetohydrodynamic-jet
 *
 * interstellar-shock: Runaway O/B star (blue supergiant) racing through ISM.
 *   Position: (-700, -300, -800). Bow shock parabolic arc + turbulent wake.
 *   Star: dazzling blue-white. Shock front: glowing teal-white arc of 800 pts.
 *   Wake: 600 trailing particles (ionized gas, yellowing toward red). Turbulent.
 *
 * magnetohydrodynamic-jet: Bipolar jet from active galactic nucleus.
 *   Position: (700, -500, 600). Twin helical jets extending 320 units each way.
 *   Helix: 300 pts per pole (neon blue-violet, rotating). Flux rings: 5 per pole.
 *   Hot spot knots at jet termination points (shock diamond structure).
 */
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "public", "cosmos-infinite.html");
let html = fs.readFileSync(FILE, "utf8");
const usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");

let ok = 0;
const errors = [];

/* ── 1. HTML ENTITIES ──────────────────────────────────────────────────────── */
const HTML_ANCHOR = "      <a-entity cosmic-tornado></a-entity>";

if (html.includes("<a-entity interstellar-shock>")) {
  console.log("[1/2] HTML entities already present");
  ok++;
} else if (html.includes(HTML_ANCHOR)) {
  html = html.replace(
    HTML_ANCHOR,
    HTML_ANCHOR +
      "\n      <!-- \u2500\u2500 INTERSTELLAR SHOCK \u2014 runaway O/B star bow shock + turbulent wake \u2500\u2500 -->" +
      "\n      <a-entity interstellar-shock></a-entity>" +
      "\n      <!-- \u2500\u2500 MHD JET \u2014 bipolar helical magnetohydrodynamic jet from AGN \u2500\u2500 -->" +
      "\n      <a-entity magnetohydrodynamic-jet></a-entity>",
  );
  ok++;
  console.log("[1/2] HTML entities injected");
} else {
  errors.push(
    "[1/2] FAIL \u2014 HTML anchor not found (cosmic-tornado entity)",
  );
}

/* ── 2. JS COMPONENTS ──────────────────────────────────────────────────────── */
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

if (html.includes('AFRAME.registerComponent("interstellar-shock",')) {
  console.log("[2/2] JS components already present");
  ok++;
} else if (html.includes(JS_ANCHOR)) {
  html = html.replace(JS_ANCHOR, buildComponents() + JS_ANCHOR);
  ok++;
  console.log("[2/2] interstellar-shock + magnetohydrodynamic-jet JS injected");
} else {
  errors.push("[2/2] FAIL \u2014 JS anchor not found (asteroid-belt)");
}

/* ── summary ───────────────────────────────────────────────────────────────── */
console.log("\nDone! ok=" + ok + "/2, errors=" + errors.length);
if (errors.length) {
  errors.forEach((e) => console.error(e));
  process.exit(1);
}
const lineCount = html.split("\n").length;
if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
console.log("File written: " + lineCount + " lines");

/* ══════════════════════════════════════════════════════════════════════════ */
function buildComponents() {
  return interstellarShock() + mhdJet();
}

function interstellarShock() {
  return `      /* ==================================================================
         INTERSTELLAR SHOCK — runaway O/B supergiant racing through the ISM.
         Position: (-700, -300, -800).
         The star itself is a bright blue-white point with a glow halo.
         Bow shock: parabolic arc of 800 teal-white ionized particles ahead of star.
         Turbulent wake: 600 particles trailing behind, yellowing→red (cooling gas).
         The shock arc slowly oscillates (Kelvin-Helmholtz instability breathing).
         The star drifts slowly in -Z direction (runaway motion).
         @alignment 8\u219226\u219248:480  @frequency 852  @domain quantum-arch
      ================================================================== */
      AFRAME.registerComponent("interstellar-shock", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          var PI = Math.PI;

          this._isRoot = new THREE.Group();
          this._isRoot.position.set(-700, -300, -800);
          scene.add(this._isRoot);
          this._isTime = 0;

          /* Star: bright blue-white core + halo */
          var starCore = new THREE.Mesh(
            new THREE.SphereGeometry(7, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.98 })
          );
          var starHalo = new THREE.Mesh(
            new THREE.SphereGeometry(22, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0x7799ff, transparent: true, opacity: 0.18 })
          );
          this._isRoot.add(starCore);
          this._isRoot.add(starHalo);
          this._starHalo = starHalo;

          /* Bow shock: parabolic arc of particles ahead of the star (+Z side).
             Parabola: x^2 / (2*f) where f=focal parameter.
             Arc spans angle -PI*0.62 to +PI*0.62 in the x-y plane, offset +120 in z. */
          var SN = 800;
          var sPos = new Float32Array(SN * 3);
          var sCol = new Float32Array(SN * 3);
          this._shockPos = sPos;
          this._shockH   = new Float32Array(SN); /* angle parameter */
          var F = 90, AMP = 110;
          for (var si = 0; si < SN; si++) {
            var ang = (si / (SN - 1) - 0.5) * PI * 1.22;
            this._shockH[si] = ang;
            var sx = AMP * Math.sin(ang);
            var sy = AMP * 0.35 * Math.sin(ang * 1.5) + (Math.random() - 0.5) * 12;
            var sz = 120 - (sx * sx) / (2 * F) + (Math.random() - 0.5) * 8;
            sPos[si*3  ] = sx;
            sPos[si*3+1] = sy;
            sPos[si*3+2] = sz;
            /* Color: teal-white near apex, blue-white at wings */
            var edgeFrac = Math.abs(ang) / (PI * 0.61);
            sCol[si*3  ] = 0.5 + edgeFrac * 0.5;
            sCol[si*3+1] = 0.88 + edgeFrac * 0.12;
            sCol[si*3+2] = 0.9;
          }
          this._shockGeo = new THREE.BufferGeometry();
          this._shockGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
          this._shockGeo.setAttribute('color',    new THREE.BufferAttribute(sCol, 3));
          this._shockMat = new THREE.PointsMaterial({
            size: 2.8, vertexColors: true, transparent: true, opacity: 0.78,
            sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
          });
          this._isRoot.add(new THREE.Points(this._shockGeo, this._shockMat));
          this._shockAMP = AMP;
          this._shockF = F;

          /* Turbulent wake: trailing behind star (−Z direction).
             600 particles in a cone expanding as z decreases.
             Colors: gold→orange→red (cooling ionized gas). */
          var WN = 600;
          var wPos = new Float32Array(WN * 3);
          var wCol = new Float32Array(WN * 3);
          this._wakePos = wPos;
          this._wakeT   = new Float32Array(WN);
          this._wakeA   = new Float32Array(WN);
          this._wakeR   = new Float32Array(WN);
          for (var wi = 0; wi < WN; wi++) {
            var wt = Math.pow(Math.random(), 0.6); /* bias toward near star */
            var wa = Math.random() * PI * 2;
            var wr = 10 + 60 * wt + (Math.random() - 0.5) * 30;
            this._wakeT[wi] = wt;
            this._wakeA[wi] = wa;
            this._wakeR[wi] = wr;
            wPos[wi*3  ] = wr * Math.cos(wa);
            wPos[wi*3+1] = wr * Math.sin(wa) * 0.55;
            wPos[wi*3+2] = -30 - wt * 260 + (Math.random() - 0.5) * 40;
            /* color: gold at t=0, orange at t=0.5, dim red at t=1 */
            wCol[wi*3  ] = 1.0 - wt * 0.35;
            wCol[wi*3+1] = 0.75 - wt * 0.55;
            wCol[wi*3+2] = 0.05;
          }
          this._wakeGeo = new THREE.BufferGeometry();
          this._wakeGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3));
          this._wakeGeo.setAttribute('color',    new THREE.BufferAttribute(wCol, 3));
          this._wakeMat = new THREE.PointsMaterial({
            size: 3.5, vertexColors: true, transparent: true, opacity: 0.55,
            sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
          });
          this._isRoot.add(new THREE.Points(this._wakeGeo, this._wakeMat));
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._isTime += dt;
          var t = this._isTime;
          var PI = Math.PI;
          var SN = this._wakeT.length;
          var sPos = this._shockPos;
          var wPos = this._wakePos;
          var AMP = this._shockAMP;
          var F   = this._shockF;

          /* Kelvin-Helmholtz breathing of bow shock */
          var breathe = 1.0 + 0.06 * Math.sin(t * 0.9);
          var SN2 = this._shockH.length;
          for (var si = 0; si < SN2; si++) {
            var ang = this._shockH[si];
            var sx = AMP * breathe * Math.sin(ang);
            var sz = 120 * breathe - (sx * sx) / (2 * F);
            sPos[si*3  ] = sx;
            sPos[si*3+2] = sz;
          }
          this._shockGeo.attributes.position.needsUpdate = true;

          /* Turbulent wake: gentle swirl */
          for (var wi = 0; wi < SN; wi++) {
            this._wakeA[wi] += 0.12 * dt * (1 - this._wakeT[wi]);
            var wr = this._wakeR[wi];
            wPos[wi*3  ] = wr * Math.cos(this._wakeA[wi]);
            wPos[wi*3+1] = wr * Math.sin(this._wakeA[wi]) * 0.55;
          }
          this._wakeGeo.attributes.position.needsUpdate = true;

          /* Star halo pulse */
          if (this._starHalo) {
            this._starHalo.material.opacity = 0.14 + 0.08 * Math.sin(t * 1.7);
          }

          /* Slow drift of the entire system in -Z (runaway star motion) */
          this._isRoot.position.z = -800 - t * 0.8;
        }
      });

`;
}

function mhdJet() {
  return `      /* ==================================================================
         MAGNETOHYDRODYNAMIC JET — bipolar helical jet from active galactic nucleus.
         Position: (700, -500, 600).
         Central AGN: bright yellow-white sphere with hot accretion-disk ring.
         Twin helical jets: 300 pts per pole, neon blue-violet, rotating helices.
         Each jet extends 320 units outward (+Y and -Y poles).
         5 flux-ring tori per pole (magnetic field topology markers).
         Termination hotspot knots at jet tips (shock-diamond structure).
         The helices counter-rotate (opposite poles).
         @alignment 8\u219226\u219248:480  @frequency 528  @domain code-eng
      ================================================================== */
      AFRAME.registerComponent("magnetohydrodynamic-jet", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          var PI = Math.PI;

          this._mhdRoot = new THREE.Group();
          this._mhdRoot.position.set(700, -500, 600);
          scene.add(this._mhdRoot);
          this._mhdTime = 0;

          /* Central AGN core */
          var agn = new THREE.Mesh(
            new THREE.SphereGeometry(10, 12, 10),
            new THREE.MeshBasicMaterial({ color: 0xffee88 })
          );
          this._mhdRoot.add(agn);
          this._agnGlow = new THREE.Mesh(
            new THREE.SphereGeometry(22, 12, 10),
            new THREE.MeshBasicMaterial({ color: 0xff9922, transparent: true, opacity: 0.22 })
          );
          this._mhdRoot.add(this._agnGlow);

          /* Accretion disk ring */
          var diskGeo = new THREE.TorusGeometry(38, 5, 8, 40);
          var diskMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
          var disk = new THREE.Mesh(diskGeo, diskMat);
          disk.rotation.x = Math.PI / 2;
          this._mhdRoot.add(disk);
          this._diskMesh = disk;

          /* Build helical jets: two poles (+Y north, -Y south) */
          this._jetGroups = [];
          var JET_LEN = 320, N_PER_JET = 300, N_TURNS = 5;
          var poles = [
            { dir: 1,  baseCol: [0.3, 0.5, 1.0], tipCol: [0.9, 0.3, 1.0] },
            { dir: -1, baseCol: [0.5, 0.3, 1.0], tipCol: [0.3, 0.8, 1.0] }
          ];
          var self = this;
          poles.forEach(function(pole, pi) {
            var jPos = new Float32Array(N_PER_JET * 3);
            var jCol = new Float32Array(N_PER_JET * 3);
            var angles = new Float32Array(N_PER_JET);
            var sign = (pi === 0) ? 1 : -1; /* counter-rotate */
            for (var ji = 0; ji < N_PER_JET; ji++) {
              var jt = ji / (N_PER_JET - 1);
              var ang = sign * jt * PI * 2 * N_TURNS;
              angles[ji] = ang;
              var jr = 4 + 22 * (1 - jt * jt); /* narrowing with height */
              var jy = pole.dir * jt * JET_LEN;
              jPos[ji*3  ] = jr * Math.cos(ang);
              jPos[ji*3+1] = jy;
              jPos[ji*3+2] = jr * Math.sin(ang);
              /* color: base → tip gradient */
              jCol[ji*3  ] = pole.baseCol[0] + jt * (pole.tipCol[0] - pole.baseCol[0]);
              jCol[ji*3+1] = pole.baseCol[1] + jt * (pole.tipCol[1] - pole.baseCol[1]);
              jCol[ji*3+2] = pole.baseCol[2] + jt * (pole.tipCol[2] - pole.baseCol[2]);
            }
            var jGeo = new THREE.BufferGeometry();
            jGeo.setAttribute('position', new THREE.BufferAttribute(jPos, 3));
            jGeo.setAttribute('color',    new THREE.BufferAttribute(jCol, 3));
            var jMat = new THREE.PointsMaterial({
              size: 2.5, vertexColors: true, transparent: true, opacity: 0.8,
              sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
            });
            var jPts = new THREE.Points(jGeo, jMat);
            self._mhdRoot.add(jPts);
            self._jetGroups.push({ geo: jGeo, pos: jPos, angles: angles, pole: pole, poleDir: pole.dir, sign: sign, mat: jMat });
          });

          /* Flux rings: 5 tori per pole marking magnetic field lines */
          var RING_COLS = [0x4466ff, 0x6644ff, 0x8833ff, 0xaa22ff, 0xcc11ff];
          poles.forEach(function(pole) {
            for (var ri = 0; ri < 5; ri++) {
              var rFrac = (ri + 1) / 6;
              var ry = pole.dir * rFrac * JET_LEN * 0.85;
              var rr = 3 + 16 * (1 - rFrac * rFrac);
              var torus = new THREE.Mesh(
                new THREE.TorusGeometry(rr, 1.2, 6, 30),
                new THREE.MeshBasicMaterial({ color: RING_COLS[ri], transparent: true, opacity: 0.45, side: THREE.DoubleSide })
              );
              torus.position.y = ry;
              self._mhdRoot.add(torus);
            }
          });

          /* Termination hotspot knots at jet tips */
          var hotspotCols = [0xffffff, 0xaaffff];
          poles.forEach(function(pole, pi) {
            var hGeo = new THREE.SphereGeometry(8, 8, 6);
            var hMat = new THREE.MeshBasicMaterial({ color: hotspotCols[pi], transparent: true, opacity: 0.75 });
            var hMesh = new THREE.Mesh(hGeo, hMat);
            hMesh.position.y = pole.dir * JET_LEN;
            self._mhdRoot.add(hMesh);
            /* shock diamond ring around hotspot */
            var sdTorus = new THREE.Mesh(
              new THREE.TorusGeometry(18, 2.5, 6, 28),
              new THREE.MeshBasicMaterial({ color: 0xffeebb, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
            );
            sdTorus.position.y = pole.dir * JET_LEN;
            self._mhdRoot.add(sdTorus);
          });

          this._N_PER_JET = N_PER_JET;
          this._JET_LEN = JET_LEN;
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._mhdTime += dt;
          var t = this._mhdTime;
          var PI = Math.PI;
          var N = this._N_PER_JET;
          var JL = this._JET_LEN;

          /* Rotate helices */
          for (var ji = 0; ji < this._jetGroups.length; ji++) {
            var jg = this._jetGroups[ji];
            var rotDelta = jg.sign * 0.55 * dt;
            var pos = jg.pos;
            for (var k = 0; k < N; k++) {
              var kt = k / (N - 1);
              jg.angles[k] += rotDelta;
              var jr = 4 + 22 * (1 - kt * kt);
              pos[k*3  ] = jr * Math.cos(jg.angles[k]);
              pos[k*3+2] = jr * Math.sin(jg.angles[k]);
            }
            jg.geo.attributes.position.needsUpdate = true;
            /* pulsing opacity — jets flicker like real MHD bursts */
            jg.mat.opacity = 0.7 + 0.15 * Math.sin(t * 2.1 + ji * PI);
          }

          /* Slowly rotate accretion disk */
          if (this._diskMesh) {
            this._diskMesh.rotation.z += 0.18 * dt;
          }

          /* AGN glow pulse */
          if (this._agnGlow) {
            this._agnGlow.material.opacity = 0.16 + 0.1 * Math.sin(t * 3.5);
          }

          /* Slow whole-system precession */
          this._mhdRoot.rotation.z = 0.06 * Math.sin(t * 0.08);
        }
      });

`;
}
