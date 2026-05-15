/**
 * inject-w11.cjs — wave 11: stellar-stream + cosmic-tornado
 * stellar-stream: 1600-particle tidal debris arc from disrupted globular cluster.
 *   Position: (0, 1100, -500). Bezier arc ~700 units. Gold→pale blue. Precesses.
 * cosmic-tornado: 1000-particle spiraling Bok globule / funnel cloud.
 *   Position: (-500, 700, 400). Funnel shape top-wide, bottom-narrow. Dark dust + protostar.
 */
"use strict";
var fs = require("fs");
var FILE = "public/cosmos-infinite.html";
var html = fs.readFileSync(FILE, "utf8");
var usesCRLF = html.includes("\r\n");
if (usesCRLF) html = html.replace(/\r\n/g, "\n");
var ok = 0;
var errors = [];

/* ── 1. HTML ENTITIES ──────────────────────────────────────────────────────── */
var HTML_ANCHOR = "      <a-entity cosmos-audio></a-entity>";

if (html.includes("<a-entity stellar-stream>")) {
  console.log("[1/2] HTML entities already present");
  ok++;
} else if (html.includes(HTML_ANCHOR)) {
  html = html.replace(
    HTML_ANCHOR,
    HTML_ANCHOR +
      "\n      <!-- \u2500\u2500 STELLAR STREAM \u2014 tidal debris arc from disrupted globular cluster \u2500\u2500 -->" +
      "\n      <a-entity stellar-stream></a-entity>" +
      "\n      <!-- \u2500\u2500 COSMIC TORNADO \u2014 spiraling Bok globule funnel cloud + protostar \u2500\u2500 -->" +
      "\n      <a-entity cosmic-tornado></a-entity>",
  );
  ok++;
  console.log("[1/2] HTML entities injected");
} else {
  errors.push("[1/2] FAIL \u2014 HTML anchor not found");
}

/* ── 2. JS COMPONENTS ──────────────────────────────────────────────────────── */
var JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

if (html.includes('AFRAME.registerComponent("stellar-stream",')) {
  console.log("[2/2] JS components already present");
  ok++;
} else if (html.includes(JS_ANCHOR)) {
  var JS = buildComponents();
  html = html.replace(JS_ANCHOR, JS + JS_ANCHOR);
  ok++;
  console.log("[2/2] stellar-stream + cosmic-tornado JS injected");
} else {
  errors.push("[2/2] FAIL \u2014 JS anchor not found");
}

/* summary */
console.log("\nDone! ok=" + ok + "/2, errors=" + errors.length);
if (errors.length) {
  errors.forEach(function (e) {
    console.error(e);
  });
  process.exit(1);
}
var lineCount = html.split("\n").length;
if (usesCRLF) html = html.replace(/\n/g, "\r\n");
fs.writeFileSync(FILE, html, "utf8");
console.log("File written: " + lineCount + " lines");

/* ══════════════════════════════════════════════════════════════════════════ */
function buildComponents() {
  return stellarStream() + cosmicTornado();
}

function stellarStream() {
  return `      /* ==================================================================
         STELLAR STREAM — tidal debris arc from disrupted globular cluster.
         Position: (0, 1100, -500).
         1600 gold-to-pale-blue particles following a cubic Bezier arc.
         Arc length ~700 units, gently curving, slowly precessing (5°/min).
         Particle density is clumped at both ends (remnants) and sparse mid.
         Old population: red-orange stars. Mid: gold. Trailing edge: pale blue.
         200 halo scatter particles for fluffy appearance.
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ================================================================== */
      AFRAME.registerComponent("stellar-stream", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          var PI = Math.PI;

          this._ssRoot = new THREE.Group();
          this._ssRoot.position.set(0, 1100, -500);
          scene.add(this._ssRoot);
          this._ssTime = 0;
          this._precRate = 0.005; /* rad/s */

          /* Cubic Bezier control points (relative to ssRoot) */
          var P0 = new THREE.Vector3(-340, -20, 60);
          var P1 = new THREE.Vector3(-100, 80, -120);
          var P2 = new THREE.Vector3(140, -50, 80);
          var P3 = new THREE.Vector3(360, 30, -60);

          var evalBez = function (t) {
            var u = 1 - t;
            return new THREE.Vector3(
              u*u*u*P0.x + 3*u*u*t*P1.x + 3*u*t*t*P2.x + t*t*t*P3.x,
              u*u*u*P0.y + 3*u*u*t*P1.y + 3*u*t*t*P2.y + t*t*t*P3.y,
              u*u*u*P0.z + 3*u*u*t*P1.z + 3*u*t*t*P2.z + t*t*t*P3.z
            );
          };

          /* 1600 main stream particles */
          var N = 1600;
          var pos = new Float32Array(N * 3);
          var col = new Float32Array(N * 3);
          /* density: clump at both ends, sparse in middle */
          for (var i = 0; i < N; i++) {
            var t;
            var r = Math.random();
            if (r < 0.35) { t = Math.random() * 0.28; }          /* leading clump */
            else if (r < 0.65) { t = 0.72 + Math.random() * 0.28; } /* trailing clump */
            else { t = Math.random(); }                             /* full arc fill */
            var bp = evalBez(t);
            /* scatter perpendicular to arc — tighter near clumps */
            var spread = 8 + 30 * Math.sin(t * PI);
            pos[i*3  ] = bp.x + (Math.random()-0.5)*spread;
            pos[i*3+1] = bp.y + (Math.random()-0.5)*spread*0.7;
            pos[i*3+2] = bp.z + (Math.random()-0.5)*spread;
            /* colour: red-orange at t=0, gold at t=0.5, pale blue at t=1 */
            if (t < 0.35) {
              col[i*3  ] = 0.95; col[i*3+1] = 0.48+t; col[i*3+2] = 0.15;
            } else if (t < 0.65) {
              var tm = (t - 0.35) / 0.3;
              col[i*3  ] = 0.95 - tm*0.25; col[i*3+1] = 0.85; col[i*3+2] = 0.35 + tm*0.55;
            } else {
              var tb = (t - 0.65) / 0.35;
              col[i*3  ] = 0.68 - tb*0.35; col[i*3+1] = 0.78 - tb*0.1; col[i*3+2] = 0.88 + tb*0.12;
            }
          }
          var geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
          geo.setAttribute("color",    new THREE.BufferAttribute(col, 3));
          var mat = new THREE.PointsMaterial({
            size: 3.2, vertexColors: true, transparent: true, opacity: 0.72,
            sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
          });
          this._ssRoot.add(new THREE.Points(geo, mat));
          this._streamMat = mat;

          /* 200 halo scatter (fluffy outer envelope) */
          var HN = 200;
          var hPos = new Float32Array(HN * 3);
          var hCol = new Float32Array(HN * 3);
          for (var hi = 0; hi < HN; hi++) {
            var ht = Math.random();
            var hbp = evalBez(ht);
            var hsp = 40 + 60 * Math.random();
            hPos[hi*3  ] = hbp.x + (Math.random()-0.5)*hsp;
            hPos[hi*3+1] = hbp.y + (Math.random()-0.5)*hsp*0.5;
            hPos[hi*3+2] = hbp.z + (Math.random()-0.5)*hsp;
            hCol[hi*3  ] = 0.8; hCol[hi*3+1] = 0.78; hCol[hi*3+2] = 0.9;
          }
          var hGeo = new THREE.BufferGeometry();
          hGeo.setAttribute("position", new THREE.BufferAttribute(hPos, 3));
          hGeo.setAttribute("color",    new THREE.BufferAttribute(hCol, 3));
          var hMat = new THREE.PointsMaterial({
            size: 5.5, vertexColors: true, transparent: true, opacity: 0.18,
            sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
          });
          this._ssRoot.add(new THREE.Points(hGeo, hMat));

          /* two bright remnant nucleus glows */
          [[P0.x, P0.y, P0.z, 0xff6622], [P3.x, P3.y, P3.z, 0x99aaff]].forEach(function(d) {
            var nGlow = new THREE.Mesh(
              new THREE.SphereGeometry(6, 8, 6),
              new THREE.MeshBasicMaterial({ color: d[3], transparent: true, opacity: 0.55 })
            );
            nGlow.position.set(d[0], d[1], d[2]);
            this._ssRoot.add(nGlow);
          }.bind(this));
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._ssTime += dt;
          /* slow precession around Y (tidal precession of orbital plane) */
          this._ssRoot.rotation.y += this._precRate * dt;
          /* gentle opacity pulse (stellar scintillation) */
          if (this._streamMat) {
            this._streamMat.opacity = 0.68 + 0.06 * Math.sin(this._ssTime * 0.4);
          }
        }
      });

`;
}

function cosmicTornado() {
  return `      /* ==================================================================
         COSMIC TORNADO — spiraling Bok globule / interstellar funnel cloud.
         Position: (-500, 700, 400).
         Funnel: top-wide (r=180), bottom-narrow (r=18), height=400.
         1000 dark dust particles (dark brown/red) with differential rotation.
         200 bright blue-white scattered photons (ionization front).
         3 embedded protostellar objects (bright white/blue) orbiting at mid-funnel.
         The whole structure slowly rotates and the funnel tip occasionally flares.
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ================================================================== */
      AFRAME.registerComponent("cosmic-tornado", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;
          var PI = Math.PI;

          this._ctRoot = new THREE.Group();
          this._ctRoot.position.set(-500, 700, 400);
          scene.add(this._ctRoot);
          this._ctTime = 0;

          /* dust funnel particles */
          var DN = 1000;
          var dPos = new Float32Array(DN * 3);
          var dCol = new Float32Array(DN * 3);
          this._dustH  = new Float32Array(DN);  /* normalised height 0=top 1=bottom */
          this._dustA  = new Float32Array(DN);  /* starting angle */
          this._dustR  = new Float32Array(DN);  /* radius at this height */
          var FUNNEL_H = 400;
          var R_TOP = 180, R_BOT = 18;
          for (var di = 0; di < DN; di++) {
            var dh = Math.pow(Math.random(), 0.7); /* bias toward top (wider) */
            var dr = R_TOP + (R_BOT - R_TOP) * dh + (Math.random()-0.5) * (8 + 30*(1-dh));
            dr = Math.max(4, dr);
            var da = Math.random() * PI * 2;
            this._dustH[di] = dh;
            this._dustA[di] = da;
            this._dustR[di] = dr;
            dPos[di*3  ] = dr * Math.cos(da);
            dPos[di*3+1] = FUNNEL_H * 0.5 - dh * FUNNEL_H;
            dPos[di*3+2] = dr * Math.sin(da);
            /* dark brown-red dust, brighter toward ionization front at edges */
            var edgeFrac = Math.min(1, (dr - (R_TOP*(1-dh) + R_BOT*dh - 30)) / 40);
            edgeFrac = Math.max(0, edgeFrac);
            dCol[di*3  ] = 0.28 + edgeFrac * 0.42;
            dCol[di*3+1] = 0.10 + edgeFrac * 0.18;
            dCol[di*3+2] = 0.08 + edgeFrac * 0.38;
          }
          this._dustGeo = new THREE.BufferGeometry();
          this._dustGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
          this._dustGeo.setAttribute("color",    new THREE.BufferAttribute(dCol, 3));
          this._dustPos = dPos;
          this._dustMat = new THREE.PointsMaterial({
            size: 6, vertexColors: true, transparent: true, opacity: 0.82,
            sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
          });
          this._ctRoot.add(new THREE.Points(this._dustGeo, this._dustMat));

          /* ionization front photon scatter — bright blue-white */
          var PN = 220;
          var pPos = new Float32Array(PN * 3);
          var pCol = new Float32Array(PN * 3);
          this._photH = new Float32Array(PN);
          this._photA = new Float32Array(PN);
          for (var pi = 0; pi < PN; pi++) {
            var ph = Math.random();
            var pr = R_TOP + (R_BOT - R_TOP) * ph + (Math.random()-0.5)*12;
            pr = Math.max(4, pr);
            var pa = Math.random() * PI * 2;
            this._photH[pi] = ph;
            this._photA[pi] = pa;
            pPos[pi*3  ] = pr * Math.cos(pa);
            pPos[pi*3+1] = FUNNEL_H * 0.5 - ph * FUNNEL_H;
            pPos[pi*3+2] = pr * Math.sin(pa);
            pCol[pi*3  ] = 0.6 + Math.random()*0.4;
            pCol[pi*3+1] = 0.7 + Math.random()*0.3;
            pCol[pi*3+2] = 1.0;
          }
          this._photGeo = new THREE.BufferGeometry();
          this._photGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
          this._photGeo.setAttribute("color",    new THREE.BufferAttribute(pCol, 3));
          this._photPos = pPos;
          this._photMat = new THREE.PointsMaterial({
            size: 3.5, vertexColors: true, transparent: true, opacity: 0.55,
            sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
          });
          this._ctRoot.add(new THREE.Points(this._photGeo, this._photMat));

          /* 3 embedded protostellar objects */
          this._protos = [];
          var protoData = [
            { r: 55, h: 0.45, a: 0,            col: 0xffffff, sz: 5,  spd: 0.6 },
            { r: 30, h: 0.62, a: PI*2/3,        col: 0xaaccff, sz: 3.5, spd: 0.9 },
            { r: 70, h: 0.35, a: PI*4/3,        col: 0xffeecc, sz: 4,  spd: 0.45 }
          ];
          protoData.forEach(function(pd) {
            var pm = new THREE.Mesh(
              new THREE.SphereGeometry(pd.sz, 8, 6),
              new THREE.MeshBasicMaterial({ color: pd.col, transparent: true, opacity: 0.9 })
            );
            var glow = new THREE.Mesh(
              new THREE.SphereGeometry(pd.sz * 2.2, 8, 6),
              new THREE.MeshBasicMaterial({ color: pd.col, transparent: true, opacity: 0.2 })
            );
            var g = new THREE.Group();
            g.add(pm); g.add(glow);
            g._protoR   = pd.r;
            g._protoH   = pd.h;
            g._protoA   = pd.a;
            g._protoSpd = pd.spd;
            var y = FUNNEL_H * 0.5 - pd.h * FUNNEL_H;
            g.position.set(pd.r * Math.cos(pd.a), y, pd.r * Math.sin(pd.a));
            this._ctRoot.add(g);
            this._protos.push(g);
          }.bind(this));

          /* narrow bright jet from tip */
          var JN = 60;
          var jPos = new Float32Array(JN * 3);
          var jCol = new Float32Array(JN * 3);
          for (var ji = 0; ji < JN; ji++) {
            var jt = ji / JN;
            jPos[ji*3  ] = (Math.random()-0.5) * 6;
            jPos[ji*3+1] = -FUNNEL_H*0.5 - jt * 120;
            jPos[ji*3+2] = (Math.random()-0.5) * 6;
            jCol[ji*3  ] = 0.5 + jt*0.5; jCol[ji*3+1] = 0.8; jCol[ji*3+2] = 1.0;
          }
          var jGeo = new THREE.BufferGeometry();
          jGeo.setAttribute("position", new THREE.BufferAttribute(jPos, 3));
          jGeo.setAttribute("color",    new THREE.BufferAttribute(jCol, 3));
          this._ctRoot.add(new THREE.Points(jGeo, new THREE.PointsMaterial({
            size: 2.8, vertexColors: true, transparent: true, opacity: 0.6,
            sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
          })));

          this._FUNNEL_H = FUNNEL_H;
          this._R_TOP = R_TOP; this._R_BOT = R_BOT;
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._ctTime += dt;
          var t = this._ctTime;
          var PI = Math.PI;
          var FH = this._FUNNEL_H;
          var dPos = this._dustPos;
          var pPos = this._photPos;
          var DN = this._dustH.length;
          var PN = this._photH.length;

          /* rotate dust — differential: base rotation + faster near bottom */
          var baseRot = 0.28 * dt;
          for (var di = 0; di < DN; di++) {
            var dh = this._dustH[di];
            this._dustA[di] += (baseRot + 0.55 * dh * dt);
            var dr = this._dustR[di];
            dPos[di*3  ] = dr * Math.cos(this._dustA[di]);
            dPos[di*3+2] = dr * Math.sin(this._dustA[di]);
          }
          this._dustGeo.attributes.position.needsUpdate = true;

          /* rotate photons slightly faster */
          var photRot = 0.4 * dt;
          for (var pi = 0; pi < PN; pi++) {
            var ph = this._photH[pi];
            this._photA[pi] += (photRot + 0.65 * ph * dt);
            var r2 = this._R_TOP + (this._R_BOT - this._R_TOP) * ph;
            pPos[pi*3  ] = r2 * Math.cos(this._photA[pi]);
            pPos[pi*3+2] = r2 * Math.sin(this._photA[pi]);
          }
          this._photGeo.attributes.position.needsUpdate = true;

          /* orbit protostellar objects */
          for (var pk = 0; pk < this._protos.length; pk++) {
            var g = this._protos[pk];
            g._protoA += g._protoSpd * dt;
            var y = FH * 0.5 - g._protoH * FH;
            g.position.set(
              g._protoR * Math.cos(g._protoA), y,
              g._protoR * Math.sin(g._protoA)
            );
          }

          /* slow global tilt of funnel (like a precessing tornado) */
          this._ctRoot.rotation.x = 0.12 * Math.sin(t * 0.07);
          this._ctRoot.rotation.z = 0.08 * Math.sin(t * 0.05 + 1.2);
        }
      });

`;
}
