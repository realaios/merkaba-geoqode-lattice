'use strict';
/**
 * inject-w14.cjs — wave 14: quasar-lens + rogue-planet
 *
 * quasar-lens: Blazing quasar with gravitational lensing.
 *   Position: (-850, 400, -200). The quasar itself is a brilliant white-blue
 *   point source (jet from AGN). Four Einstein-arc particle arcs curve around
 *   it (lensed background galaxy images). Outer diffuse halo of 500 particles.
 *   The relativistic jet: 200 bright blue-white elongated streak particles
 *   shooting in two opposite directions.
 *
 * rogue-planet: Lightless planet drifting through the interstellar void.
 *   Position: (150, -700, 350). No star — only faint infrared glow (deep red).
 *   Planet body: large sphere (r=28). IR halo: dim red-brown atmosphere limb.
 *   Micro-moon orbiting at r=65 with eccentric path.
 *   Trailing heat plume (200 IR particles slowly drifting).
 *   Slowly tumbling as it drifts.
 */
const fs   = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

let ok = 0;
const errors = [];

/* ── 1. HTML ENTITIES ──────────────────────────────────────────────────────── */
const HTML_ANCHOR = '      <a-entity merkaba-starship></a-entity>';

if (html.includes('<a-entity quasar-lens>')) {
  console.log('[1/2] HTML entities already present'); ok++;
} else if (html.includes(HTML_ANCHOR)) {
  html = html.replace(
    HTML_ANCHOR,
    HTML_ANCHOR + '\n' +
    '      <!-- \u2500\u2500 QUASAR LENS \u2014 blazing quasar with gravitational Einstein-ring lensing \u2500\u2500 -->\n' +
    '      <a-entity quasar-lens></a-entity>\n' +
    '      <!-- \u2500\u2500 ROGUE PLANET \u2014 lightless drifting world with IR glow + micro-moon \u2500\u2500 -->\n' +
    '      <a-entity rogue-planet></a-entity>',
  );
  ok++; console.log('[1/2] HTML entities injected');
} else {
  errors.push('[1/2] FAIL \u2014 HTML anchor not found (merkaba-starship)');
}

/* ── 2. JS COMPONENTS ──────────────────────────────────────────────────────── */
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

if (html.includes('AFRAME.registerComponent("quasar-lens",')) {
  console.log('[2/2] JS already present'); ok++;
} else if (html.includes(JS_ANCHOR)) {
  html = html.replace(JS_ANCHOR, buildComponents() + JS_ANCHOR);
  ok++; console.log('[2/2] quasar-lens + rogue-planet JS injected');
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

/* ═══════════════════════════════════════════════════════════════════════════ */
function buildComponents() {
  return quasarLens() + roguePlanet();
}

function quasarLens() {
  return `      /* ==================================================================
         QUASAR LENS \u2014 blazing quasi-stellar object with gravitational lensing.
         Position: (-850, 400, -200).
         Quasar core: brilliant white-blue sphere + two-pole relativistic jets.
         Einstein arcs: 4 arcs of 120 particles each curving around the core,
           representing lensed images of a background galaxy.
         Outer halo: 500 diffuse blue-white particles (broad quasar emission).
         Jets: 200 bright particles per pole shooting outward.
         The arcs slowly precess (rotation of lensing frame).
         @alignment 8\u219226\u219248:480  @frequency 852  @domain quantum-arch
      ================================================================== */
      AFRAME.registerComponent("quasar-lens", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene  = this.el.sceneEl.object3D;
          var PI     = Math.PI;
          var self   = this;

          this._qlRoot = new THREE.Group();
          this._qlRoot.position.set(-850, 400, -200);
          scene.add(this._qlRoot);
          this._qlTime = 0;

          /* Quasar core: brilliant white-blue */
          var core = new THREE.Mesh(
            new THREE.SphereGeometry(12, 12, 10),
            new THREE.MeshBasicMaterial({ color: 0xeeeeff })
          );
          this._qlRoot.add(core);
          /* Core glow halo */
          this._coreHaloMat = new THREE.MeshBasicMaterial({
            color: 0x88aaff, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false
          });
          this._qlRoot.add(new THREE.Mesh(
            new THREE.SphereGeometry(32, 12, 10), this._coreHaloMat
          ));

          /* Relativistic jets: two poles (+Y and -Y), 200 particles each */
          var JN = 200;
          var jetPositions = [1, -1].map(function (pole) {
            var jPos = new Float32Array(JN * 3);
            var jCol = new Float32Array(JN * 3);
            for (var ji = 0; ji < JN; ji++) {
              var jt  = Math.pow(Math.random(), 0.55);
              var jr  = 3 * (1 - jt) * (Math.random() - 0.5);
              var jrz = 3 * (1 - jt) * (Math.random() - 0.5);
              jPos[ji * 3    ] = jr;
              jPos[ji * 3 + 1] = pole * (18 + jt * 260);
              jPos[ji * 3 + 2] = jrz;
              var jc = 0.7 + jt * 0.3;
              jCol[ji * 3    ] = jc * 0.72;
              jCol[ji * 3 + 1] = jc * 0.85;
              jCol[ji * 3 + 2] = jc;
            }
            var jGeo = new THREE.BufferGeometry();
            jGeo.setAttribute('position', new THREE.BufferAttribute(jPos, 3));
            jGeo.setAttribute('color',    new THREE.BufferAttribute(jCol, 3));
            self._qlRoot.add(new THREE.Points(jGeo, new THREE.PointsMaterial({
              size: 3.2, vertexColors: true, transparent: true, opacity: 0.78,
              blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
            })));
            return { geo: jGeo, pos: jPos };
          });
          this._jetData = jetPositions;

          /* Einstein arcs: 4 arcs of 120 pts, at lensing radius ~100u */
          /* Each arc is a partial circle (subtending ~80\u00b0) around the core */
          /* placed at 0\u00b0, 90\u00b0, 180\u00b0, 270\u00b0 with angular offset and tilt */
          var AN = 120;
          var ARC_R = 100;
          var arcGroups = [];
          for (var ai = 0; ai < 4; ai++) {
            var arcPos = new Float32Array(AN * 3);
            var arcCol = new Float32Array(AN * 3);
            var arcBase = (ai / 4) * PI * 2;  /* base angle of arc center */
            var arcTilt = (ai % 2 === 0) ? PI * 0.18 : -PI * 0.18; /* alternate tilt */
            for (var ari = 0; ari < AN; ari++) {
              var aa = arcBase + (ari / AN - 0.5) * PI * 0.88; /* arc spans ~80\u00b0 */
              var ax = ARC_R * Math.cos(aa);
              var az = ARC_R * Math.sin(aa);
              /* slight Y displacement = tilt of the arc (it's not planar) */
              var ay = Math.sin(aa + arcBase) * ARC_R * 0.15 + Math.sin(arcTilt) * 20;
              arcPos[ari * 3    ] = ax + (Math.random() - 0.5) * 6;
              arcPos[ari * 3 + 1] = ay + (Math.random() - 0.5) * 6;
              arcPos[ari * 3 + 2] = az + (Math.random() - 0.5) * 6;
              /* Color: warm orange-yellow — lensed galaxy light */
              arcCol[ari * 3    ] = 1.0;
              arcCol[ari * 3 + 1] = 0.72 + Math.random() * 0.18;
              arcCol[ari * 3 + 2] = 0.25 + Math.random() * 0.15;
            }
            var aGeo = new THREE.BufferGeometry();
            aGeo.setAttribute('position', new THREE.BufferAttribute(arcPos, 3));
            aGeo.setAttribute('color',    new THREE.BufferAttribute(arcCol, 3));
            var aMat = new THREE.PointsMaterial({
              size: 2.8, vertexColors: true, transparent: true, opacity: 0.72,
              blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
            });
            this._qlRoot.add(new THREE.Points(aGeo, aMat));
            arcGroups.push({ base: arcBase, tilt: arcTilt, geo: aGeo, pos: arcPos, mat: aMat, N: AN });
          }
          this._arcGroups = arcGroups;
          this._ARC_R = ARC_R;

          /* Outer diffuse halo: 500 blue-white particles at r=120-350 */
          var HN = 500;
          var hPos = new Float32Array(HN * 3);
          var hCol = new Float32Array(HN * 3);
          for (var hi = 0; hi < HN; hi++) {
            var hr    = 120 + Math.pow(Math.random(), 0.5) * 230;
            var hThe  = Math.acos(2 * Math.random() - 1);
            var hPhi  = Math.random() * PI * 2;
            hPos[hi * 3    ] = hr * Math.sin(hThe) * Math.cos(hPhi);
            hPos[hi * 3 + 1] = hr * Math.cos(hThe) * 0.45;
            hPos[hi * 3 + 2] = hr * Math.sin(hThe) * Math.sin(hPhi);
            var hc = 0.55 + Math.random() * 0.45;
            hCol[hi * 3    ] = hc * 0.75;
            hCol[hi * 3 + 1] = hc * 0.88;
            hCol[hi * 3 + 2] = hc;
          }
          var hGeo = new THREE.BufferGeometry();
          hGeo.setAttribute('position', new THREE.BufferAttribute(hPos, 3));
          hGeo.setAttribute('color',    new THREE.BufferAttribute(hCol, 3));
          this._qlRoot.add(new THREE.Points(hGeo, new THREE.PointsMaterial({
            size: 2.0, vertexColors: true, transparent: true, opacity: 0.42,
            blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
          })));
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._qlTime += dt;
          var t  = this._qlTime;
          var PI = Math.PI;
          var ARC_R = this._ARC_R;

          /* Core halo pulse */
          if (this._coreHaloMat) {
            this._coreHaloMat.opacity = 0.28 + 0.12 * Math.sin(t * 2.1);
          }
          /* Einstein arcs slowly precess */
          var precRate = 0.018; /* rad/s */
          for (var ai = 0; ai < this._arcGroups.length; ai++) {
            var ag   = this._arcGroups[ai];
            var base = ag.base + t * precRate;
            var N    = ag.N;
            for (var ari = 0; ari < N; ari++) {
              var aa = base + (ari / N - 0.5) * PI * 0.88;
              var ax = ARC_R * Math.cos(aa);
              var az = ARC_R * Math.sin(aa);
              var ay = Math.sin(aa + base) * ARC_R * 0.15 + Math.sin(ag.tilt) * 20;
              ag.pos[ari * 3    ] = ax;
              ag.pos[ari * 3 + 1] = ay;
              ag.pos[ari * 3 + 2] = az;
            }
            ag.geo.attributes.position.needsUpdate = true;
            /* Arcs shimmer */
            ag.mat.opacity = 0.60 + 0.18 * Math.sin(t * 1.4 + ai * PI * 0.5);
          }
          /* Slow whole-system rotation around Y */
          this._qlRoot.rotation.y = t * 0.04;
        }
      });

`;
}

function roguePlanet() {
  return `      /* ==================================================================
         ROGUE PLANET \u2014 lightless gas giant drifting through the void.
         Position: (150, -700, 350).
         Planet body: r=28, dark grey-brown sphere with subtle IR atmosphere limb.
         IR atmosphere halo: faint deep-red glow (thermal emission, T~100K).
         Micro-moon: r=5, eccentrically orbiting at r=65-90, captured.
         IR heat plume: 200 dim red-brown particles trailing behind drift path.
         The planet slowly rotates and tumbles. Drifts slightly in +X over time.
         @alignment 8\u219226\u219248:480  @frequency 396  @domain data-structs
      ================================================================== */
      AFRAME.registerComponent("rogue-planet", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene  = this.el.sceneEl.object3D;
          var PI     = Math.PI;
          var self   = this;

          this._rpRoot = new THREE.Group();
          this._rpRoot.position.set(150, -700, 350);
          scene.add(this._rpRoot);
          this._rpTime = 0;

          /* Planet body: dark grey-brown (like a cold gas giant) */
          this._planetMesh = new THREE.Mesh(
            new THREE.SphereGeometry(28, 22, 16),
            new THREE.MeshBasicMaterial({ color: 0x3a3028 })
          );
          this._rpRoot.add(this._planetMesh);

          /* IR atmosphere limb glow (thin outer shell, deep red) */
          this._irHaloMat = new THREE.MeshBasicMaterial({
            color: 0x661100, transparent: true, opacity: 0.22,
            blending: THREE.AdditiveBlending, depthWrite: false
          });
          this._rpRoot.add(new THREE.Mesh(
            new THREE.SphereGeometry(32, 18, 14), this._irHaloMat
          ));
          /* Secondary faint outer halo */
          this._rpRoot.add(new THREE.Mesh(
            new THREE.SphereGeometry(40, 14, 10),
            new THREE.MeshBasicMaterial({
              color: 0x330800, transparent: true, opacity: 0.08,
              blending: THREE.AdditiveBlending, depthWrite: false
            })
          ));

          /* Micro-moon */
          this._moonMesh = new THREE.Mesh(
            new THREE.SphereGeometry(5, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0x5a5550 })
          );
          this._moonOrbitAngle = Math.random() * PI * 2;
          this._rpRoot.add(this._moonMesh);

          /* IR heat plume: 200 dim particles trailing in -X direction */
          var PN = 200;
          var pPos = new Float32Array(PN * 3);
          var pCol = new Float32Array(PN * 3);
          this._plumePos = pPos;
          this._plumeA   = new Float32Array(PN);
          this._plumeR   = new Float32Array(PN);
          this._plumeT   = new Float32Array(PN);
          for (var pi2 = 0; pi2 < PN; pi2++) {
            var pt   = Math.pow(Math.random(), 0.65);
            var pa   = Math.random() * PI * 2;
            var pr   = 5 + 18 * (1 - pt);
            this._plumeT[pi2] = pt;
            this._plumeA[pi2] = pa;
            this._plumeR[pi2] = pr;
            pPos[pi2 * 3    ] = -30 - pt * 180 + (Math.random() - 0.5) * 30;
            pPos[pi2 * 3 + 1] = pr * Math.sin(pa) * 0.6;
            pPos[pi2 * 3 + 2] = pr * Math.cos(pa) * 0.6;
            /* Deep red-brown thermal emission */
            var pc = 0.35 + pt * 0.25;
            pCol[pi2 * 3    ] = pc;
            pCol[pi2 * 3 + 1] = pc * 0.35;
            pCol[pi2 * 3 + 2] = pc * 0.05;
          }
          var pGeo = new THREE.BufferGeometry();
          pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
          pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));
          this._plumeGeo = pGeo;
          this._rpRoot.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
            size: 4.5, vertexColors: true, transparent: true, opacity: 0.38,
            blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
          })));

          /* Very faint background star field exclusion (dark "shadow" zone in
             planet direction) — simulated by a slightly dark sphere just larger */
          /* Actually, skip — the dark planet already occludes naturally */
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._rpTime += dt;
          var t  = this._rpTime;
          var PI = Math.PI;

          /* Planet slow tumble */
          this._planetMesh.rotation.y += 0.06 * dt;
          this._planetMesh.rotation.x  = 0.08 * Math.sin(t * 0.07);

          /* IR halo pulse (thermal breathing) */
          if (this._irHaloMat) {
            this._irHaloMat.opacity = 0.18 + 0.06 * Math.sin(t * 0.55);
          }

          /* Micro-moon eccentric orbit */
          this._moonOrbitAngle += 0.32 * dt;
          var moonA = this._moonOrbitAngle;
          /* Eccentric: r varies between 65 and 90 (e~0.16) */
          var moonR = 77.5 + 12.5 * Math.sin(moonA * 0.5);
          this._moonMesh.position.set(
            moonR * Math.cos(moonA),
            15 * Math.sin(moonA * 0.7),  /* slight inclination */
            moonR * Math.sin(moonA)
          );

          /* Plume gentle drift */
          var PN = this._plumeT.length;
          for (var pi2 = 0; pi2 < PN; pi2++) {
            this._plumeA[pi2] += 0.08 * dt * (1 - this._plumeT[pi2]);
            var pr = this._plumeR[pi2];
            this._plumePos[pi2 * 3 + 1] = pr * Math.sin(this._plumeA[pi2]) * 0.6;
            this._plumePos[pi2 * 3 + 2] = pr * Math.cos(this._plumeA[pi2]) * 0.6;
          }
          this._plumeGeo.attributes.position.needsUpdate = true;

          /* Slow drift of the whole rogue planet in +X (interstellar motion) */
          this._rpRoot.position.x = 150 + t * 0.5;
        }
      });

`;
}
