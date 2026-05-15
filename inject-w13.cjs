'use strict';
/**
 * inject-w13.cjs — wave 13: merkaba-starship
 *
 * Enterprise-class starship that autonomously flies through the cosmos and
 * periodically jumps to hyperspace.
 *
 * Geometry:
 *   - Saucer section (r=30, h=7) + bridge dome + bottom sensor platform
 *   - Connecting neck strut
 *   - Secondary hull (cylinder along Z, h=55) + nose cap + rear cap
 *   - Deflector dish (large glowing blue circle, front of secondary hull)
 *   - Twin nacelle pylons (angular struts)
 *   - Twin warp nacelles (r=4.5, len=52) with inner cyan glow tubes
 *   - Bussard collectors (red glowing domes, nacelle fronts)
 *   - Exhaust glows (cyan circles, nacelle rears)
 *   - Window particles (90 warm yellow dots on saucer rim)
 *   - Running lights (red/green/white, blinking)
 *
 * Flight:
 *   - 12 waypoints spread through scene
 *   - lookAt-based orientation (nose = -Z direction)
 *   - Gentle banking roll
 *   - Cruise speed: 85 u/s
 *
 * Warp:
 *   - PRE_WARP (2.2s): nacelles glow white-hot, ship accelerates
 *   - WARP (1.4s): 180 line-streak tunnel, white flash sphere, mid-point teleport
 *   - POST_WARP (2.0s): streaks fade, nacelles cool, resume cruise
 *   - Warp fires every 38-66 seconds
 */
const fs   = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

let ok = 0;
const errors = [];

/* ── 1. HTML ENTITY ──────────────────────────────────────────────────────── */
const HTML_ANCHOR = '      <a-entity magnetohydrodynamic-jet></a-entity>';

if (html.includes('<a-entity merkaba-starship>')) {
  console.log('[1/2] HTML entity already present'); ok++;
} else if (html.includes(HTML_ANCHOR)) {
  html = html.replace(
    HTML_ANCHOR,
    HTML_ANCHOR + '\n' +
    '      <!-- \u2500\u2500 MERKABA STARSHIP \u2014 autonomous starship with hyperspace warp \u2500\u2500 -->\n' +
    '      <a-entity merkaba-starship></a-entity>',
  );
  ok++; console.log('[1/2] HTML entity injected');
} else {
  errors.push('[1/2] FAIL \u2014 HTML anchor not found (magnetohydrodynamic-jet)');
}

/* ── 2. JS COMPONENT ─────────────────────────────────────────────────────── */
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

if (html.includes('AFRAME.registerComponent("merkaba-starship",')) {
  console.log('[2/2] JS already present'); ok++;
} else if (html.includes(JS_ANCHOR)) {
  html = html.replace(JS_ANCHOR, buildStarshipJS() + JS_ANCHOR);
  ok++; console.log('[2/2] merkaba-starship JS injected');
} else {
  errors.push('[2/2] FAIL \u2014 JS anchor not found (asteroid-belt)');
}

/* ── summary ─────────────────────────────────────────────────────────────── */
console.log('\nDone! ok=' + ok + '/2, errors=' + errors.length);
if (errors.length) { errors.forEach(function(e){ console.error(e); }); process.exit(1); }
const lineCount = html.split('\n').length;
if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
console.log('File written: ' + lineCount + ' lines');

/* ══════════════════════════════════════════════════════════════════════════ */
function buildStarshipJS() {
  return (
    '      /* ==================================================================\n' +
    '         MERKABA STARSHIP \u2014 autonomous Enterprise-class starship.\n' +
    '         Saucer r=30, secondary hull, twin warp nacelles, deflector dish.\n' +
    '         Cruises 12 waypoints @ 85 u/s. Warps every 38-66 s:\n' +
    '           PRE_WARP (2.2s) \u2192 WARP (1.4s, streak tunnel + teleport)\n' +
    '           \u2192 POST_WARP (2.0s, cool-down emerge).\n' +
    '         Ship forward = -Z. lookAt orients nose toward waypoint.\n' +
    '         @alignment 8\u219226\u219248:480  @frequency 963  @domain systems-design\n' +
    '      ================================================================== */\n' +
    '      AFRAME.registerComponent("merkaba-starship", {\n' +

    /* ── init ── */
    '        init: function () {\n' +
    '          var THREE = AFRAME.THREE;\n' +
    '          var scene  = this.el.sceneEl.object3D;\n' +
    '          var PI     = Math.PI;\n' +
    '          var self   = this;\n' +
    '          this._t    = 0;\n' +
    '\n' +
    '          /* Root group — lives in world space */\n' +
    '          this._ship = new THREE.Group();\n' +
    '          this._ship.position.set(300, 200, -400);\n' +
    '          scene.add(this._ship);\n' +
    '\n' +
    '          /* Materials */\n' +
    '          var hullMat = new THREE.MeshBasicMaterial({ color: 0xbcc8d4 });\n' +
    '          var darkMat = new THREE.MeshBasicMaterial({ color: 0x778899 });\n' +
    '\n' +
    '          /* ── SAUCER ───────────────────────────────────────────── */\n' +
    '          /* Main disc */\n' +
    '          this._ship.add(new THREE.Mesh(\n' +
    '            new THREE.CylinderGeometry(30, 30, 7, 42), hullMat\n' +
    '          ));\n' +
    '          /* Bridge dome (top, forward) */\n' +
    '          var topDome = new THREE.Mesh(\n' +
    '            new THREE.SphereGeometry(10, 18, 8, 0, PI * 2, 0, PI / 2),\n' +
    '            new THREE.MeshBasicMaterial({ color: 0xddeeff })\n' +
    '          );\n' +
    '          topDome.position.set(0, 5.5, -6);\n' +
    '          this._ship.add(topDome);\n' +
    '          /* Bottom sensor platform */\n' +
    '          var botPlat = new THREE.Mesh(\n' +
    '            new THREE.CylinderGeometry(10, 12, 3.5, 20), darkMat\n' +
    '          );\n' +
    '          botPlat.position.set(0, -5.5, 0);\n' +
    '          this._ship.add(botPlat);\n' +
    '\n' +
    '          /* ── NECK ─────────────────────────────────────────────── */\n' +
    '          var neck = new THREE.Mesh(\n' +
    '            new THREE.CylinderGeometry(4.5, 5.5, 18, 14), darkMat\n' +
    '          );\n' +
    '          neck.position.set(0, -12, 16);\n' +
    '          neck.rotation.x = PI * 0.14;\n' +
    '          this._ship.add(neck);\n' +
    '\n' +
    '          /* ── SECONDARY HULL ───────────────────────────────────── */\n' +
    '          /* Cylinder oriented along Z axis (forward = -Z) */\n' +
    '          var secHull = new THREE.Mesh(\n' +
    '            new THREE.CylinderGeometry(8, 10, 55, 20), hullMat\n' +
    '          );\n' +
    '          secHull.rotation.x = PI / 2;\n' +
    '          secHull.position.set(0, -16, 20);\n' +
    '          this._ship.add(secHull);\n' +
    '          /* Front nose cap (faces -Z) */\n' +
    '          var secNose = new THREE.Mesh(\n' +
    '            new THREE.SphereGeometry(10, 14, 8, 0, PI * 2, 0, PI / 2), hullMat\n' +
    '          );\n' +
    '          secNose.rotation.x = PI;\n' +
    '          secNose.position.set(0, -16, -7);\n' +
    '          this._ship.add(secNose);\n' +
    '          /* Rear cap */\n' +
    '          var secRear = new THREE.Mesh(\n' +
    '            new THREE.SphereGeometry(10, 14, 8, 0, PI * 2, 0, PI / 2), darkMat\n' +
    '          );\n' +
    '          secRear.position.set(0, -16, 47);\n' +
    '          this._ship.add(secRear);\n' +
    '\n' +
    '          /* ── DEFLECTOR DISH ───────────────────────────────────── */\n' +
    '          this._deflMat = new THREE.MeshBasicMaterial({\n' +
    '            color: 0x0088ff, transparent: true, opacity: 0.92,\n' +
    '            blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide\n' +
    '          });\n' +
    '          var defl = new THREE.Mesh(new THREE.CircleGeometry(9, 32), this._deflMat);\n' +
    '          defl.position.set(0, -16, -8);\n' +
    '          this._ship.add(defl);\n' +
    '          this._deflRingMat = new THREE.MeshBasicMaterial({\n' +
    '            color: 0x44ccff, transparent: true, opacity: 0.5,\n' +
    '            blending: THREE.AdditiveBlending, depthWrite: false\n' +
    '          });\n' +
    '          var deflRing = new THREE.Mesh(\n' +
    '            new THREE.TorusGeometry(9, 1.5, 7, 32), this._deflRingMat\n' +
    '          );\n' +
    '          deflRing.position.set(0, -16, -8);\n' +
    '          this._ship.add(deflRing);\n' +
    '\n' +
    '          /* ── NACELLES ─────────────────────────────────────────── */\n' +
    '          this._warpGlows    = [];\n' +
    '          this._bussardMats  = [];\n' +
    '          this._exhaustMats  = [];\n' +
    '          [-1, 1].forEach(function (sx) {\n' +
    '            var xOff = sx * 36;\n' +
    '            /* Pylon */\n' +
    '            var pylon = new THREE.Mesh(\n' +
    '              new THREE.BoxGeometry(3, 19, 26), darkMat\n' +
    '            );\n' +
    '            pylon.position.set(xOff * 0.72, -10, 18);\n' +
    '            pylon.rotation.z = sx * PI * 0.09;\n' +
    '            pylon.rotation.x = -PI * 0.06;\n' +
    '            self._ship.add(pylon);\n' +
    '\n' +
    '            /* Main nacelle cylinder */\n' +
    '            var nacelle = new THREE.Mesh(\n' +
    '              new THREE.CylinderGeometry(4.5, 4.5, 52, 18), hullMat\n' +
    '            );\n' +
    '            nacelle.rotation.x = PI / 2;\n' +
    '            nacelle.position.set(xOff, -4, 18);\n' +
    '            self._ship.add(nacelle);\n' +
    '\n' +
    '            /* Inner warp glow tube */\n' +
    '            var wgMat = new THREE.MeshBasicMaterial({\n' +
    '              color: 0x00ccff, transparent: true, opacity: 0.62,\n' +
    '              blending: THREE.AdditiveBlending, depthWrite: false\n' +
    '            });\n' +
    '            var wgMesh = new THREE.Mesh(\n' +
    '              new THREE.CylinderGeometry(2.8, 2.8, 48, 14), wgMat\n' +
    '            );\n' +
    '            wgMesh.rotation.x = PI / 2;\n' +
    '            wgMesh.position.set(xOff, -4, 18);\n' +
    '            self._ship.add(wgMesh);\n' +
    '            self._warpGlows.push(wgMat);\n' +
    '\n' +
    '            /* Bussard collector — red dome, front of nacelle (z = 18-26 = -8) */\n' +
    '            var bMat = new THREE.MeshBasicMaterial({\n' +
    '              color: 0xff2200, transparent: true, opacity: 0.95,\n' +
    '              blending: THREE.AdditiveBlending, depthWrite: false\n' +
    '            });\n' +
    '            var bMesh = new THREE.Mesh(new THREE.SphereGeometry(5, 14, 8), bMat);\n' +
    '            bMesh.position.set(xOff, -4, -8);\n' +
    '            self._ship.add(bMesh);\n' +
    '            self._bussardMats.push(bMat);\n' +
    '\n' +
    '            /* Exhaust glow — cyan circle, rear of nacelle (z = 18+26 = 44) */\n' +
    '            var eMat = new THREE.MeshBasicMaterial({\n' +
    '              color: 0x88eeff, transparent: true, opacity: 0.9,\n' +
    '              blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide\n' +
    '            });\n' +
    '            var eMesh = new THREE.Mesh(new THREE.CircleGeometry(4.5, 16), eMat);\n' +
    '            eMesh.position.set(xOff, -4, 44);\n' +
    '            self._ship.add(eMesh);\n' +
    '            self._exhaustMats.push(eMat);\n' +
    '\n' +
    '            /* Outer exhaust halo */\n' +
    '            var eHalo = new THREE.Mesh(\n' +
    '              new THREE.CircleGeometry(11, 14),\n' +
    '              new THREE.MeshBasicMaterial({\n' +
    '                color: 0x003388, transparent: true, opacity: 0.22,\n' +
    '                blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide\n' +
    '              })\n' +
    '            );\n' +
    '            eHalo.position.set(xOff, -4, 44.5);\n' +
    '            self._ship.add(eHalo);\n' +
    '          });\n' +
    '\n' +
    '          /* ── RUNNING LIGHTS ───────────────────────────────────── */\n' +
    '          this._runLights = [];\n' +
    '          var lightDefs = [\n' +
    '            { p: [-30,  0,   0], c: 0xff0000, f: 1.4 },\n' +
    '            { p: [ 30,  0,   0], c: 0x00ff44, f: 1.4 },\n' +
    '            { p: [  0,  6, -20], c: 0xffffff, f: 2.8 },\n' +
    '            { p: [  0, -4,  -8], c: 0xffffff, f: 1.9 },\n' +
    '          ];\n' +
    '          lightDefs.forEach(function (ld) {\n' +
    '            var m = new THREE.Mesh(\n' +
    '              new THREE.SphereGeometry(1.9, 6, 5),\n' +
    '              new THREE.MeshBasicMaterial({ color: ld.c, transparent: true })\n' +
    '            );\n' +
    '            m.position.set(ld.p[0], ld.p[1], ld.p[2]);\n' +
    '            self._ship.add(m);\n' +
    '            self._runLights.push({ mat: m.material, freq: ld.f, phase: Math.random() * PI * 2 });\n' +
    '          });\n' +
    '\n' +
    '          /* ── WINDOW PARTICLES (saucer rim) ────────────────────── */\n' +
    '          var WN = 90;\n' +
    '          var wP  = new Float32Array(WN * 3);\n' +
    '          var wC  = new Float32Array(WN * 3);\n' +
    '          for (var wi = 0; wi < WN; wi++) {\n' +
    '            var wa = (wi / WN) * PI * 2;\n' +
    '            var wr = 26 + (Math.random() - 0.5) * 5;\n' +
    '            var wl = Math.random() < 0.5 ? 2.5 : -2.5;\n' +
    '            wP[wi * 3    ] = wr * Math.cos(wa);\n' +
    '            wP[wi * 3 + 1] = wl;\n' +
    '            wP[wi * 3 + 2] = wr * Math.sin(wa);\n' +
    '            var brt = 0.82 + Math.random() * 0.18;\n' +
    '            wC[wi * 3    ] = brt;\n' +
    '            wC[wi * 3 + 1] = brt * 0.92;\n' +
    '            wC[wi * 3 + 2] = brt * 0.45;\n' +
    '          }\n' +
    '          var wGeo = new THREE.BufferGeometry();\n' +
    '          wGeo.setAttribute("position", new THREE.BufferAttribute(wP, 3));\n' +
    '          wGeo.setAttribute("color",    new THREE.BufferAttribute(wC, 3));\n' +
    '          this._ship.add(new THREE.Points(wGeo, new THREE.PointsMaterial({\n' +
    '            size: 2.2, vertexColors: true, transparent: true, opacity: 0.9,\n' +
    '            blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true\n' +
    '          })));\n' +
    '\n' +
    '          /* ── WARP STREAKS (180 line-segments, hidden until warp) ─ */\n' +
    '          var SN = 180;\n' +
    '          var sLP  = new Float32Array(SN * 6);\n' +
    '          var sLC  = new Float32Array(SN * 6);\n' +
    '          this._streakData = new Array(SN);\n' +
    '          for (var si = 0; si < SN; si++) {\n' +
    '            var sang = Math.random() * PI * 2;\n' +
    '            var srad = 35 + Math.random() * 230;\n' +
    '            var sx2  = srad * Math.cos(sang);\n' +
    '            var sy2  = (Math.random() - 0.5) * 180;\n' +
    '            var sz2  = (Math.random() - 0.5) * 900;\n' +
    '            var slen = 28 + Math.random() * 95;\n' +
    '            this._streakData[si] = { x: sx2, y: sy2, z: sz2, len: slen };\n' +
    '            sLP[si * 6    ] = sx2; sLP[si * 6 + 1] = sy2; sLP[si * 6 + 2] = sz2;\n' +
    '            sLP[si * 6 + 3] = sx2; sLP[si * 6 + 4] = sy2; sLP[si * 6 + 5] = sz2 + slen;\n' +
    '            var bc = 0.68 + Math.random() * 0.32;\n' +
    '            sLC[si * 6    ] = bc * 0.72; sLC[si * 6 + 1] = bc * 0.86; sLC[si * 6 + 2] = bc;\n' +
    '            sLC[si * 6 + 3] = bc * 0.72; sLC[si * 6 + 4] = bc * 0.86; sLC[si * 6 + 5] = bc;\n' +
    '          }\n' +
    '          var sGeo = new THREE.BufferGeometry();\n' +
    '          sGeo.setAttribute("position", new THREE.BufferAttribute(sLP, 3));\n' +
    '          sGeo.setAttribute("color",    new THREE.BufferAttribute(sLC, 3));\n' +
    '          this._streakMat = new THREE.LineBasicMaterial({\n' +
    '            vertexColors: true, transparent: true, opacity: 0,\n' +
    '            blending: THREE.AdditiveBlending, depthWrite: false\n' +
    '          });\n' +
    '          this._streakGeo = sGeo;\n' +
    '          this._streakPos = sLP;\n' +
    '          this._ship.add(new THREE.LineSegments(sGeo, this._streakMat));\n' +
    '\n' +
    '          /* Flash sphere — white bloom during warp jump */\n' +
    '          this._flashMat = new THREE.MeshBasicMaterial({\n' +
    '            color: 0xffffff, transparent: true, opacity: 0,\n' +
    '            blending: THREE.AdditiveBlending, depthWrite: false\n' +
    '          });\n' +
    '          this._ship.add(new THREE.Mesh(\n' +
    '            new THREE.SphereGeometry(380, 6, 5), this._flashMat\n' +
    '          ));\n' +
    '\n' +
    '          /* ── FLIGHT STATE ─────────────────────────────────────── */\n' +
    '          this._waypoints = [\n' +
    '            new THREE.Vector3( 300,  200, -400),\n' +
    '            new THREE.Vector3(-250,   50,  180),\n' +
    '            new THREE.Vector3( 550,  -80,  280),\n' +
    '            new THREE.Vector3(-420,  280, -180),\n' +
    '            new THREE.Vector3(  50, -180, -550),\n' +
    '            new THREE.Vector3( 650,  120, -180),\n' +
    '            new THREE.Vector3(-520,  -80,  480),\n' +
    '            new THREE.Vector3( 180,  380,   80),\n' +
    '            new THREE.Vector3(-320,   20, -680),\n' +
    '            new THREE.Vector3( 420, -280,  420),\n' +
    '            new THREE.Vector3(-640,  180, -280),\n' +
    '            new THREE.Vector3( 120, -380, -220),\n' +
    '          ];\n' +
    '          this._curWP      = 0;\n' +
    '          this._speed      = 85;\n' +
    '          this._warpState  = "CRUISE";\n' +
    '          this._warpTimer  = 0;\n' +
    '          this._nextWarpAt = 45 + Math.random() * 20;\n' +
    '          this._warpPhase  = 0;\n' +
    '          this._teleported = false;\n' +
    '        },\n' +

    /* ── tick ── */
    '\n' +
    '        tick: function (time, delta) {\n' +
    '          var dt = Math.min(delta, 200) * 0.001;\n' +
    '          this._t += dt;\n' +
    '          var t  = this._t;\n' +
    '          var PI = Math.PI;\n' +
    '\n' +
    '          /* Running lights blink */\n' +
    '          for (var li = 0; li < this._runLights.length; li++) {\n' +
    '            var rl = this._runLights[li];\n' +
    '            rl.mat.opacity = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(t * rl.freq * PI * 2 + rl.phase));\n' +
    '          }\n' +
    '          /* Deflector dish pulse */\n' +
    '          if (this._deflMat) {\n' +
    '            var dp = 0.78 + 0.22 * Math.sin(t * 2.7);\n' +
    '            this._deflMat.opacity     = dp;\n' +
    '            this._deflRingMat.opacity = dp * 0.55;\n' +
    '          }\n' +
    '          /* Bussard collectors pulse + color-shift (simulate spinning red intake) */\n' +
    '          var bTime = t * 3.8;\n' +
    '          for (var bi = 0; bi < this._bussardMats.length; bi++) {\n' +
    '            var bMat2 = this._bussardMats[bi];\n' +
    '            bMat2.opacity = 0.78 + 0.22 * Math.sin(bTime + bi * PI);\n' +
    '            bMat2.color.setHSL(0.02 + 0.04 * (0.5 + 0.5 * Math.sin(bTime + bi * PI)), 1, 0.5);\n' +
    '          }\n' +
    '\n' +
    '          switch (this._warpState) {\n' +
    '            case "CRUISE":    this._doCruise(dt, t);   break;\n' +
    '            case "PRE_WARP":  this._doPreWarp(dt, t);  break;\n' +
    '            case "WARP":      this._doWarp(dt, t);     break;\n' +
    '            case "POST_WARP": this._doPostWarp(dt, t); break;\n' +
    '          }\n' +
    '        },\n' +

    /* ── _doCruise ── */
    '\n' +
    '        _doCruise: function (dt, t) {\n' +
    '          var THREE = AFRAME.THREE;\n' +
    '          this._warpTimer += dt;\n' +
    '          /* Normal warp glow */\n' +
    '          for (var gi = 0; gi < this._warpGlows.length; gi++) {\n' +
    '            this._warpGlows[gi].opacity = 0.56 + 0.14 * Math.sin(t * 1.9 + gi * 1.2);\n' +
    '            this._warpGlows[gi].color.setHex(0x00ccff);\n' +
    '          }\n' +
    '          for (var ei = 0; ei < this._exhaustMats.length; ei++) {\n' +
    '            this._exhaustMats[ei].opacity = 0.80 + 0.12 * Math.sin(t * 2.3 + ei * 0.9);\n' +
    '          }\n' +
    '          /* Navigate toward current waypoint */\n' +
    '          var wp   = this._waypoints[this._curWP];\n' +
    '          var pos  = this._ship.position;\n' +
    '          var dir  = new THREE.Vector3().subVectors(wp, pos);\n' +
    '          var dist = dir.length();\n' +
    '          if (dist < 25) {\n' +
    '            this._curWP = (this._curWP + 1) % this._waypoints.length;\n' +
    '          } else {\n' +
    '            dir.normalize();\n' +
    '            pos.addScaledVector(dir, this._speed * dt);\n' +
    '            /* lookAt: makes ship -Z axis face the waypoint (nose = forward = -Z) */\n' +
    '            this._ship.lookAt(wp);\n' +
    '            /* Gentle banking roll around local Z */\n' +
    '            this._ship.rotateZ(Math.sin(t * 0.22) * 0.07);\n' +
    '          }\n' +
    '          /* Time to warp? */\n' +
    '          if (this._warpTimer >= this._nextWarpAt) {\n' +
    '            this._warpState = "PRE_WARP";\n' +
    '            this._warpTimer = 0;\n' +
    '            this._warpPhase = 0;\n' +
    '          }\n' +
    '        },\n' +

    /* ── _doPreWarp ── */
    '\n' +
    '        _doPreWarp: function (dt, t) {\n' +
    '          var THREE = AFRAME.THREE;\n' +
    '          this._warpPhase += dt;\n' +
    '          var prog = Math.min(this._warpPhase / 2.2, 1.0);\n' +
    '          /* Nacelles ramp to white-hot */\n' +
    '          for (var gi = 0; gi < this._warpGlows.length; gi++) {\n' +
    '            this._warpGlows[gi].opacity = 0.62 + prog * 0.38;\n' +
    '            this._warpGlows[gi].color.setHSL(0.55 - prog * 0.05, 1.0, 0.5 + prog * 0.28);\n' +
    '          }\n' +
    '          for (var ei = 0; ei < this._exhaustMats.length; ei++) {\n' +
    '            this._exhaustMats[ei].opacity = 0.85 + prog * 0.15;\n' +
    '          }\n' +
    '          /* Accelerate toward waypoint */\n' +
    '          var spd = 85 + prog * 260;\n' +
    '          var wp  = this._waypoints[this._curWP];\n' +
    '          var pos = this._ship.position;\n' +
    '          var dir = new THREE.Vector3().subVectors(wp, pos);\n' +
    '          if (dir.length() > 5) { dir.normalize(); pos.addScaledVector(dir, spd * dt); }\n' +
    '          this._ship.lookAt(wp);\n' +
    '          /* Transition to warp */\n' +
    '          if (this._warpPhase >= 2.2) {\n' +
    '            this._warpState  = "WARP";\n' +
    '            this._warpPhase  = 0;\n' +
    '            this._teleported = false;\n' +
    '            /* Pick random new destination */\n' +
    '            this._curWP = Math.floor(Math.random() * this._waypoints.length);\n' +
    '          }\n' +
    '        },\n' +

    /* ── _doWarp ── */
    '\n' +
    '        _doWarp: function (dt, t) {\n' +
    '          this._warpPhase += dt;\n' +
    '          var prog = this._warpPhase / 1.4; // 0→1 over 1.4 s\n' +
    '          /* Flash arc: bell curve */\n' +
    '          var flashArc = Math.sin(prog * Math.PI);\n' +
    '          if (this._flashMat) this._flashMat.opacity = flashArc * 0.36;\n' +
    '          /* Streak line-tunnel */\n' +
    '          this._streakMat.opacity = flashArc * 0.92;\n' +
    '          var warpSpd = 1800 + prog * 2200;\n' +
    '          var SN = this._streakData.length;\n' +
    '          for (var si = 0; si < SN; si++) {\n' +
    '            var sd = this._streakData[si];\n' +
    '            sd.z += warpSpd * dt;\n' +
    '            if (sd.z > 550) sd.z -= 1100;\n' +
    '            this._streakPos[si * 6 + 2] = sd.z;\n' +
    '            this._streakPos[si * 6 + 5] = sd.z + sd.len;\n' +
    '          }\n' +
    '          this._streakGeo.attributes.position.needsUpdate = true;\n' +
    '          /* Nacelles at peak brightness */\n' +
    '          for (var gi = 0; gi < this._warpGlows.length; gi++) {\n' +
    '            this._warpGlows[gi].opacity = 1.0;\n' +
    '            this._warpGlows[gi].color.setHex(0xaaeeff);\n' +
    '          }\n' +
    '          /* Teleport at midpoint */\n' +
    '          if (this._warpPhase >= 0.7 && !this._teleported) {\n' +
    '            this._teleported = true;\n' +
    '            this._ship.position.copy(this._waypoints[this._curWP]);\n' +
    '            for (var si2 = 0; si2 < SN; si2++) {\n' +
    '              this._streakData[si2].z = (Math.random() - 0.5) * 1100;\n' +
    '            }\n' +
    '          }\n' +
    '          if (this._warpPhase >= 1.4) {\n' +
    '            this._warpState  = "POST_WARP";\n' +
    '            this._warpPhase  = 0;\n' +
    '            this._teleported = false;\n' +
    '          }\n' +
    '        },\n' +

    /* ── _doPostWarp ── */
    '\n' +
    '        _doPostWarp: function (dt, t) {\n' +
    '          var THREE = AFRAME.THREE;\n' +
    '          this._warpPhase += dt;\n' +
    '          var prog = this._warpPhase / 2.0; // 0→1 over 2.0 s\n' +
    '          /* Streaks and flash fade out */\n' +
    '          this._streakMat.opacity = Math.max(0, 0.88 * (1 - prog * 1.6));\n' +
    '          if (this._flashMat) this._flashMat.opacity = Math.max(0, 0.22 * (1 - prog * 2.5));\n' +
    '          /* Nacelles cool down */\n' +
    '          for (var gi = 0; gi < this._warpGlows.length; gi++) {\n' +
    '            this._warpGlows[gi].opacity = Math.max(0.58, 1.0 - prog * 0.42);\n' +
    '            this._warpGlows[gi].color.setHex(0x00ccff);\n' +
    '          }\n' +
    '          /* Resume cruise toward waypoint */\n' +
    '          var wp  = this._waypoints[this._curWP];\n' +
    '          var pos = this._ship.position;\n' +
    '          var dir = new THREE.Vector3().subVectors(wp, pos);\n' +
    '          if (dir.length() > 15) {\n' +
    '            dir.normalize();\n' +
    '            pos.addScaledVector(dir, 85 * dt);\n' +
    '            this._ship.lookAt(wp);\n' +
    '          }\n' +
    '          if (this._warpPhase >= 2.0) {\n' +
    '            this._warpState = "CRUISE";\n' +
    '            this._speed     = 85;\n' +
    '            this._streakMat.opacity  = 0;\n' +
    '            if (this._flashMat) this._flashMat.opacity = 0;\n' +
    '            this._nextWarpAt = 38 + Math.random() * 28;\n' +
    '          }\n' +
    '        }\n' +

    '      });\n\n'
  );
}
