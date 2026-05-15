'use strict';
/**
 * inject-w15.cjs — wave 15: pulsar-beacon + dark-matter-web
 *
 * pulsar-beacon: Rotating neutron star emitting sweeping gamma-ray beams.
 *   Position: (900, -200, -500). Neutron star: tiny dense r=6 white sphere.
 *   Two opposite polar beams: each is a cone of 300 bright particles sweeping
 *   in a circle as the pulsar rotates (period: ~1.4s realistic, game: 3.2s).
 *   Magnetosphere: torus-shaped particle cloud around equator.
 *   Beam glow halos: two bright ellipsoid glows that sweep with the rotation.
 *   The whole neutron star is tiny but its beams arc across hundreds of units.
 *
 * dark-matter-web: Cosmic large-scale structure — the invisible scaffold of
 *   the universe made visible. Three intersecting filaments of faint blue
 *   nodes connected by dim lines. Each filament: 60 node-clusters strung
 *   along a Bezier curve with void bubbles between them.
 *   Position: centred near (0, 0, 0) but spans ~±600 units.
 *   The nodes pulse with a subtle Merkaba resonance frequency (72 Hz visual).
 */
const fs   = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

let ok = 0;
const errors = [];

/* ── 1. HTML ENTITIES ───────────────────────────────────────────────────── */
const HTML_ANCHOR = '      <a-entity rogue-planet></a-entity>';

if (html.includes('<a-entity pulsar-beacon>')) {
  console.log('[1/2] HTML entities already present'); ok++;
} else if (html.includes(HTML_ANCHOR)) {
  html = html.replace(
    HTML_ANCHOR,
    HTML_ANCHOR + '\n' +
    '      <!-- \u2500\u2500 PULSAR BEACON \u2014 neutron star rotating gamma-ray beam \u2500\u2500 -->\n' +
    '      <a-entity pulsar-beacon></a-entity>\n' +
    '      <!-- \u2500\u2500 DARK MATTER WEB \u2014 cosmic large-scale structure filaments \u2500\u2500 -->\n' +
    '      <a-entity dark-matter-web></a-entity>',
  );
  ok++; console.log('[1/2] HTML entities injected');
} else {
  errors.push('[1/2] FAIL \u2014 HTML anchor not found (rogue-planet)');
}

/* ── 2. JS COMPONENTS ───────────────────────────────────────────────────── */
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';

if (html.includes('AFRAME.registerComponent("pulsar-beacon",')) {
  console.log('[2/2] JS already present'); ok++;
} else if (html.includes(JS_ANCHOR)) {
  html = html.replace(JS_ANCHOR, buildComponents() + JS_ANCHOR);
  ok++; console.log('[2/2] pulsar-beacon + dark-matter-web JS injected');
} else {
  errors.push('[2/2] FAIL \u2014 JS anchor not found (asteroid-belt)');
}

/* ── summary ────────────────────────────────────────────────────────────── */
console.log('\nDone! ok=' + ok + '/2, errors=' + errors.length);
if (errors.length) { errors.forEach(function(e){ console.error(e); }); process.exit(1); }
const lineCount = html.split('\n').length;
if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
console.log('File written: ' + lineCount + ' lines');

/* ══════════════════════════════════════════════════════════════════════════ */
function buildComponents() { return pulsarBeacon() + darkMatterWeb(); }

function pulsarBeacon() {
  return `      /* ==================================================================
         PULSAR BEACON \u2014 rotating neutron star with sweeping gamma-ray beams.
         Position: (900, -200, -500). Rotation period: 3.2 s.
         Neutron star: r=6 brilliant white sphere.
         Two polar beams (top and bottom): each a cone of 300 bright particles.
           As pulsar rotates, beams sweep in arcs through the scene.
           Beams are 280 units long, collimated to ~15 degree half-angle.
         Magnetosphere: 400 particles in a squashed torus (equatorial wind).
         Beam halos: two glowing ellipsoid meshes co-rotating with beams.
         @alignment 8\u219226\u219248:480  @frequency 852  @domain quantum-arch
      ================================================================== */
      AFRAME.registerComponent("pulsar-beacon", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene  = this.el.sceneEl.object3D;
          var PI     = Math.PI;
          var self   = this;

          this._pbRoot = new THREE.Group();
          this._pbRoot.position.set(900, -200, -500);
          scene.add(this._pbRoot);
          this._pbTime  = 0;
          this._pbPeriod = 3.2; /* seconds per full rotation */

          /* Neutron star: tiny brilliant white sphere */
          this._pbRoot.add(new THREE.Mesh(
            new THREE.SphereGeometry(6, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          ));
          /* NS inner glow */
          this._nsGlowMat = new THREE.MeshBasicMaterial({
            color: 0xaaccff, transparent: true, opacity: 0.6,
            blending: THREE.AdditiveBlending, depthWrite: false
          });
          this._pbRoot.add(new THREE.Mesh(
            new THREE.SphereGeometry(14, 10, 8), this._nsGlowMat
          ));

          /* Polar beams: two Groups that rotate around Y with pulsar */
          this._beamGroup = new THREE.Group();
          this._pbRoot.add(this._beamGroup);

          var BN = 300;
          [1, -1].forEach(function (pole) {
            var bPos = new Float32Array(BN * 3);
            var bCol = new Float32Array(BN * 3);
            for (var bi = 0; bi < BN; bi++) {
              /* Random point within a narrow cone along polar axis */
              var bt    = Math.pow(Math.random(), 0.6);
              var bDist = 12 + bt * 280;
              var bHalfAngle = 0.24; /* ~14 deg */
              var bTheta = Math.random() * bHalfAngle;
              var bPhi   = Math.random() * PI * 2;
              var bx = bDist * Math.sin(bTheta) * Math.cos(bPhi);
              var by = pole * bDist * Math.cos(bTheta);
              var bz = bDist * Math.sin(bTheta) * Math.sin(bPhi);
              bPos[bi * 3    ] = bx;
              bPos[bi * 3 + 1] = by;
              bPos[bi * 3 + 2] = bz;
              /* Color: bright blue-white near star, fading to teal at tip */
              var bc = 1.0 - bt * 0.55;
              bCol[bi * 3    ] = bc * 0.65;
              bCol[bi * 3 + 1] = bc * 0.85;
              bCol[bi * 3 + 2] = bc;
            }
            var bGeo = new THREE.BufferGeometry();
            bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
            bGeo.setAttribute('color',    new THREE.BufferAttribute(bCol, 3));
            self._beamGroup.add(new THREE.Points(bGeo, new THREE.PointsMaterial({
              size: 2.8, vertexColors: true, transparent: true, opacity: 0.82,
              blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
            })));
          });

          /* Beam halo cones (one per pole) — broad glow volumes */
          [1, -1].forEach(function (pole) {
            var hMat = new THREE.MeshBasicMaterial({
              color: 0x44aaff, transparent: true, opacity: 0.12,
              blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
            });
            var hCone = new THREE.Mesh(
              new THREE.ConeGeometry(65, 260, 12, 1, true),
              hMat
            );
            hCone.position.set(0, pole * 140, 0);
            if (pole < 0) hCone.rotation.z = PI;
            self._beamGroup.add(hCone);
          });

          /* Magnetosphere: 400 particles in equatorial torus */
          var MN = 400;
          var mPos = new Float32Array(MN * 3);
          var mCol = new Float32Array(MN * 3);
          for (var mi = 0; mi < MN; mi++) {
            var mPhi  = Math.random() * PI * 2;
            var mR    = 30 + Math.random() * 55;
            var mH    = (Math.random() - 0.5) * 20;
            mPos[mi * 3    ] = mR * Math.cos(mPhi);
            mPos[mi * 3 + 1] = mH;
            mPos[mi * 3 + 2] = mR * Math.sin(mPhi);
            var mc = 0.6 + Math.random() * 0.4;
            mCol[mi * 3    ] = mc * 0.5;
            mCol[mi * 3 + 1] = mc * 0.75;
            mCol[mi * 3 + 2] = mc;
          }
          var mGeo = new THREE.BufferGeometry();
          mGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
          mGeo.setAttribute('color',    new THREE.BufferAttribute(mCol, 3));
          this._pbRoot.add(new THREE.Points(mGeo, new THREE.PointsMaterial({
            size: 1.8, vertexColors: true, transparent: true, opacity: 0.48,
            blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
          })));
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._pbTime += dt;
          var t = this._pbTime;
          /* Beam group rotates around Y with pulsar period */
          this._beamGroup.rotation.y = (t / this._pbPeriod) * Math.PI * 2;
          /* Also tilt slightly (precession) */
          this._beamGroup.rotation.z = 0.18 * Math.sin(t * 0.12);
          /* NS glow pulses at twice the spin rate (magnetar-like) */
          if (this._nsGlowMat) {
            this._nsGlowMat.opacity = 0.4 + 0.35 * Math.abs(Math.sin((t / this._pbPeriod) * Math.PI * 2));
          }
        }
      });

`;
}

function darkMatterWeb() {
  return `      /* ==================================================================
         DARK MATTER WEB \u2014 cosmic large-scale structure.
         Three Bezier filaments spanning ~1200 units, intersecting near origin.
         Each filament: 60 node-clusters (glowing blue-violet blobs) strung
         along the curve with 400 line-segment skeleton connections between
         adjacent nodes.
         Node clusters: 8 particles each, at each of 60 node positions.
         Void bubbles: large dark transparent spheres between filament nodes
         (not rendered, void is simply absence of light — implied by spacing).
         The entire web slowly breathes (scale pulsing) at 72 Hz visual analog
         (Merkaba base frequency), implying dark matter isn't perfectly static.
         @alignment 8\u219226\u219248:480  @frequency 72  @domain self-evolve
      ================================================================== */
      AFRAME.registerComponent("dark-matter-web", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene  = this.el.sceneEl.object3D;
          var PI     = Math.PI;

          this._dmRoot = new THREE.Group();
          scene.add(this._dmRoot);
          this._dmTime = 0;

          /* Three filament Bezier curves */
          var filamentDefs = [
            /* Filament 1: X-axis dominant (spanning -600 to +600 in X) */
            {
              p0: new THREE.Vector3(-580, -80, 120),
              p1: new THREE.Vector3(-180, 280, -200),
              p2: new THREE.Vector3( 200,-180,  300),
              p3: new THREE.Vector3( 580, 120, -150),
              color: [0.35, 0.28, 0.82]
            },
            /* Filament 2: diagonal */
            {
              p0: new THREE.Vector3(-400, 500, -350),
              p1: new THREE.Vector3(-100,-200,  150),
              p2: new THREE.Vector3( 200, 300, -100),
              p3: new THREE.Vector3( 450,-500,  380),
              color: [0.28, 0.38, 0.90]
            },
            /* Filament 3: crossing filaments 1&2 */
            {
              p0: new THREE.Vector3(-200,-400,  550),
              p1: new THREE.Vector3( 100, 250, -180),
              p2: new THREE.Vector3(-150,-300,  100),
              p3: new THREE.Vector3( 300, 500, -500),
              color: [0.42, 0.22, 0.75]
            },
          ];

          this._filamentRoots = [];

          var self = this;
          filamentDefs.forEach(function (fd) {
            var filRoot = new THREE.Group();
            self._dmRoot.add(filRoot);
            self._filamentRoots.push(filRoot);

            /* Sample 60 points along the cubic Bezier */
            var N = 60;
            var pts = [];
            for (var ni = 0; ni < N; ni++) {
              var u = ni / (N - 1);
              var v = 1 - u;
              /* Cubic Bezier: B(t) = v^3*p0 + 3v^2u*p1 + 3vu^2*p2 + u^3*p3 */
              var px = v*v*v*fd.p0.x + 3*v*v*u*fd.p1.x + 3*v*u*u*fd.p2.x + u*u*u*fd.p3.x;
              var py = v*v*v*fd.p0.y + 3*v*v*u*fd.p1.y + 3*v*u*u*fd.p2.y + u*u*u*fd.p3.y;
              var pz = v*v*v*fd.p0.z + 3*v*v*u*fd.p1.z + 3*v*u*u*fd.p2.z + u*u*u*fd.p3.z;
              pts.push({ x: px, y: py, z: pz });
            }

            /* Node clusters: 8 particles per node */
            var CN  = 8;
            var TN  = N * CN;
            var nPos = new Float32Array(TN * 3);
            var nCol = new Float32Array(TN * 3);
            for (var ni2 = 0; ni2 < N; ni2++) {
              var p = pts[ni2];
              for (var ci = 0; ci < CN; ci++) {
                var idx = (ni2 * CN + ci);
                var spread = 18 + 12 * (ni2 / N);
                nPos[idx * 3    ] = p.x + (Math.random() - 0.5) * spread;
                nPos[idx * 3 + 1] = p.y + (Math.random() - 0.5) * spread;
                nPos[idx * 3 + 2] = p.z + (Math.random() - 0.5) * spread;
                var nc = 0.30 + Math.random() * 0.25;
                nCol[idx * 3    ] = nc * fd.color[0];
                nCol[idx * 3 + 1] = nc * fd.color[1];
                nCol[idx * 3 + 2] = nc * fd.color[2];
              }
            }
            var nGeo = new THREE.BufferGeometry();
            nGeo.setAttribute('position', new THREE.BufferAttribute(nPos, 3));
            nGeo.setAttribute('color',    new THREE.BufferAttribute(nCol, 3));
            filRoot.add(new THREE.Points(nGeo, new THREE.PointsMaterial({
              size: 5.5, vertexColors: true, transparent: true, opacity: 0.38,
              blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
            })));

            /* Skeleton line-segments connecting adjacent node centers */
            var linePos = new Float32Array((N - 1) * 6);
            var lineCol = new Float32Array((N - 1) * 6);
            for (var ni3 = 0; ni3 < N - 1; ni3++) {
              var pA = pts[ni3], pB = pts[ni3 + 1];
              linePos[ni3 * 6    ] = pA.x; linePos[ni3 * 6 + 1] = pA.y; linePos[ni3 * 6 + 2] = pA.z;
              linePos[ni3 * 6 + 3] = pB.x; linePos[ni3 * 6 + 4] = pB.y; linePos[ni3 * 6 + 5] = pB.z;
              var lc = 0.22;
              lineCol[ni3 * 6    ] = lc * fd.color[0]; lineCol[ni3 * 6 + 1] = lc * fd.color[1]; lineCol[ni3 * 6 + 2] = lc * fd.color[2];
              lineCol[ni3 * 6 + 3] = lc * fd.color[0]; lineCol[ni3 * 6 + 4] = lc * fd.color[1]; lineCol[ni3 * 6 + 5] = lc * fd.color[2];
            }
            var lGeo = new THREE.BufferGeometry();
            lGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
            lGeo.setAttribute('color',    new THREE.BufferAttribute(lineCol, 3));
            filRoot.add(new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({
              vertexColors: true, transparent: true, opacity: 0.28,
              blending: THREE.AdditiveBlending, depthWrite: false
            })));
          });
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._dmTime += dt;
          var t = this._dmTime;
          /* Merkaba base frequency: 72 Hz visual analog (slow breathing at 1/72 scale) */
          /* Scale breathes very subtly: 0.996 to 1.004 */
          var breathe = 1.0 + 0.004 * Math.sin(t * 72 * 0.02 * Math.PI * 2);
          this._dmRoot.scale.setScalar(breathe);
          /* Very slow rotation of the whole web (dark matter halos orbit too) */
          this._dmRoot.rotation.y = t * 0.005;
        }
      });

`;
}
