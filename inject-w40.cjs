'use strict';
// inject-w40.cjs — Wave 40: cosmic-nanohertz-gw-background + stellar-mass-bh-binary
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("cosmic-nanohertz-gw-background"')) {
  console.log('Wave 40 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity stellar-bow-wind></a-entity>';
const HTML_INSERT = `      <a-entity stellar-bow-wind></a-entity>
      <!-- ── COSMIC NANOHERTZ GW BACKGROUND — pulsar timing array stochastic background ── -->
      <a-entity cosmic-nanohertz-gw-background></a-entity>
      <!-- ── STELLAR MASS BH BINARY — compact binary inspiraling toward merger ── -->
      <a-entity stellar-mass-bh-binary></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         COSMIC NANOHERTZ GW BACKGROUND — the stochastic gravitational-wave
         background detected by Pulsar Timing Arrays (PTA). Supermassive black
         hole binaries throughout the Universe create a low-frequency GW soup.
         Visualised as a set of pulsars arranged in a sphere plus ripple waves
         emanating outward representing the GW strain imprinting on pulsar ToAs.
         Position: (-600, 300, 800).
         Components:
           - Pulsar array: 30 pulsars on sphere surface (bright dots)
           - GW strain waves: 5 expanding rings (pulsating, low opacity)
           - SMBHB sources: 8 distant red blobs suggesting progenitor binaries
           - Timing residual stripes: phase-shifted lines across pulsar pair links
           - Background haze: diffuse glow representing the GW signal floor
         @alignment 8→26→48:480  @frequency 963  @domain systems-design
      ==================================================================== */
      AFRAME.registerComponent("cosmic-nanohertz-gw-background", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-600, 300, 800);
          scene.add(this._root);

          /* 30 pulsars on a sphere */
          var pulsarMeshes = [];
          var PHI_PTA = (1+Math.sqrt(5))/2;
          for (var pi2 = 0; pi2 < 30; pi2++) {
            var pPhi = Math.acos(1 - 2*(pi2+0.5)/30);
            var pTheta = 2*Math.PI*pi2/PHI_PTA;
            var pR = 80;
            var pm = new THREE.Mesh(
              new THREE.SphereGeometry(1.5, 4, 3),
              new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            pm.position.set(pR*Math.sin(pPhi)*Math.cos(pTheta), pR*Math.cos(pPhi), pR*Math.sin(pPhi)*Math.sin(pTheta));
            this._root.add(pm);
            pulsarMeshes.push(pm);
          }
          this._pulsars = pulsarMeshes;

          /* GW strain rings */
          this._rings = [];
          for (var ri = 0; ri < 5; ri++) {
            var rGeo = new THREE.TorusGeometry(30 + ri*22, 1.5, 4, 40);
            var rMat = new THREE.MeshBasicMaterial({
              color: 0x44aaff, transparent: true, opacity: 0.15,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            var rMesh = new THREE.Mesh(rGeo, rMat);
            rMesh.rotation.x = Math.PI*0.3*ri;
            rMesh.rotation.z = Math.PI*0.2*ri;
            this._root.add(rMesh);
            this._rings.push({ mesh: rMesh, mat: rMat, phase: ri*1.3 });
          }

          /* 8 SMBHB source blobs */
          for (var si = 0; si < 8; si++) {
            var sAngle = (si/8)*2*Math.PI;
            var sm = new THREE.Mesh(
              new THREE.SphereGeometry(4, 5, 4),
              new THREE.MeshBasicMaterial({
                color: 0xff2200, transparent: true, opacity: 0.35,
                blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            sm.position.set(120*Math.cos(sAngle), (Math.random()-0.5)*40, 120*Math.sin(sAngle));
            this._root.add(sm);
          }

          /* background diffuse haze */
          var HN = 600;
          var hPts = new Float32Array(HN * 3);
          for (var hi = 0; hi < HN; hi++) {
            var hp = Math.acos(2*Math.random()-1), ha = Math.random()*2*Math.PI;
            var hr = 50 + Math.random()*60;
            hPts[hi*3  ] = hr*Math.sin(hp)*Math.cos(ha);
            hPts[hi*3+1] = hr*Math.cos(hp);
            hPts[hi*3+2] = hr*Math.sin(hp)*Math.sin(ha);
          }
          var hGeo = new THREE.BufferGeometry();
          hGeo.setAttribute("position", new THREE.BufferAttribute(hPts, 3));
          this._root.add(new THREE.Points(hGeo, new THREE.PointsMaterial({
            color: 0x2255aa, size: 1.5, transparent: true, opacity: 0.08,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._ngwTime = 0;
          console.log("[cosmic-nanohertz-gw-background] loaded at (-600,300,800)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._ngwTime += dt;

          /* pulsars twinkle */
          for (var i = 0; i < this._pulsars.length; i++) {
            var tw = 0.6 + 0.4*Math.sin(this._ngwTime*3.0 + i*0.8);
            this._pulsars[i].material.opacity = tw;
          }

          /* rings pulse in and out */
          for (var ri = 0; ri < this._rings.length; ri++) {
            var r = this._rings[ri];
            r.mat.opacity = 0.08 + 0.12*Math.sin(this._ngwTime*0.6 + r.phase);
            r.mesh.rotation.y += 0.0003 * dt;
          }

          this._root.rotation.y += 0.0002 * dt;
        },
      });

      /* ====================================================================
         STELLAR MASS BH BINARY — two stellar-mass black holes inspiraling
         toward merger. Shows the two compact objects orbiting, an accretion
         disk streamer, chirp signal increasing in frequency, and the merger
         flash at coalescence.
         Position: (400, 200, -1100).
         Components:
           - BH1 and BH2: two dark spheres orbiting a shared center
           - Accretion disk tidal streamer: gas torn from BH2 onto BH1
           - Chirp track: helix of points tightening as inspiral progresses
           - Merger flash: bright burst at center when BHs coincide
           - Ringdown halo: damped oscillation rings after merger
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-mass-bh-binary", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(400, 200, -1100);
          scene.add(this._root);

          /* BH1 */
          this._bh1 = new THREE.Mesh(
            new THREE.SphereGeometry(5, 8, 6),
            new THREE.MeshBasicMaterial({ color: 0x111111 })
          );
          this._root.add(this._bh1);

          /* BH2 */
          this._bh2 = new THREE.Mesh(
            new THREE.SphereGeometry(3.5, 8, 6),
            new THREE.MeshBasicMaterial({ color: 0x222222 })
          );
          this._root.add(this._bh2);

          /* accretion streamer */
          var ASN = 400;
          var asPts = new Float32Array(ASN * 3);
          for (var asi = 0; asi < ASN; asi++) {
            var asT = asi/ASN;
            var asA = asT*2*Math.PI*3;
            var asr = (1-asT*0.5)*28;
            asPts[asi*3  ] = asr*Math.cos(asA);
            asPts[asi*3+1] = (Math.random()-0.5)*4;
            asPts[asi*3+2] = asr*Math.sin(asA);
          }
          var asGeo = new THREE.BufferGeometry();
          asGeo.setAttribute("position", new THREE.BufferAttribute(asPts, 3));
          this._root.add(new THREE.Points(asGeo, new THREE.PointsMaterial({
            color: 0xff8800, size: 1.8, transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* chirp helix */
          var CHN = 500;
          var chPts = new Float32Array(CHN * 3);
          for (var chi = 0; chi < CHN; chi++) {
            var chT = chi/CHN;
            var chFreq = 1 + chT*8; /* increasing freq */
            var chA = chT*2*Math.PI*chFreq;
            var chR = (1-chT)*50;
            chPts[chi*3  ] = chR*Math.cos(chA);
            chPts[chi*3+1] = (chT-0.5)*60;
            chPts[chi*3+2] = chR*Math.sin(chA);
          }
          var chGeo = new THREE.BufferGeometry();
          chGeo.setAttribute("position", new THREE.BufferAttribute(chPts, 3));
          this._root.add(new THREE.Points(chGeo, new THREE.PointsMaterial({
            color: 0x00ffcc, size: 1.5, transparent: true, opacity: 0.30,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* merger flash mesh */
          this._flash = new THREE.Mesh(
            new THREE.SphereGeometry(8, 6, 4),
            new THREE.MeshBasicMaterial({
              color: 0xffffff, transparent: true, opacity: 0.0,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })
          );
          this._root.add(this._flash);

          /* ringdown rings */
          this._rdrings = [];
          for (var rdi = 0; rdi < 3; rdi++) {
            var rdGeo = new THREE.TorusGeometry(8 + rdi*10, 1, 4, 32);
            var rdMat = new THREE.MeshBasicMaterial({
              color: 0xaaffff, transparent: true, opacity: 0.0,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            this._root.add(new THREE.Mesh(rdGeo, rdMat));
            this._rdrings.push({ mat: rdMat, phase: rdi*2.1 });
          }

          this._smbhTime = 0;
          console.log("[stellar-mass-bh-binary] loaded at (400,200,-1100)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._smbhTime += dt;

          /* orbital motion — slowly shrinking */
          var orb = 30;
          var angle = this._smbhTime * 0.9;
          this._bh1.position.set(orb*Math.cos(angle), 0, orb*Math.sin(angle));
          this._bh2.position.set(-orb*Math.cos(angle+Math.PI*0.1), 0, -orb*Math.sin(angle+Math.PI*0.1));

          /* merger flash pulse every ~12 seconds */
          var flashPhase = (this._smbhTime % 12.0) / 12.0;
          var fo = flashPhase < 0.05 ? (flashPhase/0.05) : (flashPhase < 0.15 ? 1-(flashPhase-0.05)/0.10 : 0);
          this._flash.material.opacity = fo * 0.9;

          /* ringdown */
          for (var rdi = 0; rdi < this._rdrings.length; rdi++) {
            var rdr = this._rdrings[rdi];
            rdr.mat.opacity = fo > 0.1 ? fo * (0.4 - rdi*0.1) : 0;
          }

          this._root.rotation.y += 0.0004 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 40 injected! Lines:', lineCount);
