'use strict';
// inject-w39.cjs — Wave 39: fast-radio-burst-afterglow + stellar-bow-wind
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("fast-radio-burst-afterglow"')) {
  console.log('Wave 39 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity circumgalactic-fountain></a-entity>';
const HTML_INSERT = `      <a-entity circumgalactic-fountain></a-entity>
      <!-- ── FAST RADIO BURST AFTERGLOW — expanding multi-wavelength afterglow shell ── -->
      <a-entity fast-radio-burst-afterglow></a-entity>
      <!-- ── STELLAR BOW WIND — bow shock from a high-velocity runaway star ── -->
      <a-entity stellar-bow-wind></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         FAST RADIO BURST AFTERGLOW — a millisecond FRB leaves behind an
         expanding electromagnetic afterglow shell. The burst itself is
         instantaneous but the afterglow persists across radio, optical, X-ray.
         Position: (0, -350, -900).
         Components:
           - FRB source: tiny strobe (millisecond pulse effect)
           - Radio shell: expanding sphere (outer, red-orange, large radius)
           - Optical afterglow: mid-radius shell (white-yellow)
           - X-ray afterglow: inner bright compact shell (blue-white)
           - Plasma streak: elongated lobe from source anisotropy
           - Dispersion trail: DM-smeared streak showing frequency delay
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("fast-radio-burst-afterglow", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(0, -350, -900);
          scene.add(this._root);

          /* FRB source */
          this._src = new THREE.Mesh(
            new THREE.SphereGeometry(2, 4, 3),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          this._root.add(this._src);

          /* X-ray afterglow: inner compact bright shell */
          var XN = 400;
          var xPts = new Float32Array(XN * 3);
          for (var xi = 0; xi < XN; xi++) {
            var xp = Math.acos(2*Math.random()-1), xa = Math.random()*2*Math.PI;
            var xr = 14 + (Math.random()-0.5)*4;
            xPts[xi*3  ] = xr*Math.sin(xp)*Math.cos(xa);
            xPts[xi*3+1] = xr*Math.cos(xp);
            xPts[xi*3+2] = xr*Math.sin(xp)*Math.sin(xa);
          }
          var xGeo = new THREE.BufferGeometry();
          xGeo.setAttribute("position", new THREE.BufferAttribute(xPts, 3));
          this._xMat = new THREE.PointsMaterial({
            color: 0x99ccff, size: 2.5, transparent: true, opacity: 0.65,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(xGeo, this._xMat));

          /* optical afterglow: mid-radius */
          var ON = 500;
          var oPts = new Float32Array(ON * 3);
          for (var oi = 0; oi < ON; oi++) {
            var op = Math.acos(2*Math.random()-1), oa = Math.random()*2*Math.PI;
            var or2 = 28 + (Math.random()-0.5)*5;
            oPts[oi*3  ] = or2*Math.sin(op)*Math.cos(oa);
            oPts[oi*3+1] = or2*Math.cos(op);
            oPts[oi*3+2] = or2*Math.sin(op)*Math.sin(oa);
          }
          var oGeo = new THREE.BufferGeometry();
          oGeo.setAttribute("position", new THREE.BufferAttribute(oPts, 3));
          this._root.add(new THREE.Points(oGeo, new THREE.PointsMaterial({
            color: 0xffffaa, size: 2.0, transparent: true, opacity: 0.40,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* radio shell: outer expanding */
          var RN = 600;
          var rPts = new Float32Array(RN * 3);
          for (var ri = 0; ri < RN; ri++) {
            var rp = Math.acos(2*Math.random()-1), ra = Math.random()*2*Math.PI;
            var rr = 50 + (Math.random()-0.5)*8;
            rPts[ri*3  ] = rr*Math.sin(rp)*Math.cos(ra);
            rPts[ri*3+1] = rr*Math.cos(rp);
            rPts[ri*3+2] = rr*Math.sin(rp)*Math.sin(ra);
          }
          var rGeo = new THREE.BufferGeometry();
          rGeo.setAttribute("position", new THREE.BufferAttribute(rPts, 3));
          this._root.add(new THREE.Points(rGeo, new THREE.PointsMaterial({
            color: 0xff7744, size: 1.8, transparent: true, opacity: 0.20,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* plasma streak lobe */
          var PSN = 300;
          var psPts = new Float32Array(PSN * 3);
          for (var psi = 0; psi < PSN; psi++) {
            var pst = psi/PSN;
            psPts[psi*3  ] = (Math.random()-0.5)*20;
            psPts[psi*3+1] = pst*70 + (Math.random()-0.5)*10;
            psPts[psi*3+2] = (Math.random()-0.5)*20;
          }
          var psGeo = new THREE.BufferGeometry();
          psGeo.setAttribute("position", new THREE.BufferAttribute(psPts, 3));
          this._root.add(new THREE.Points(psGeo, new THREE.PointsMaterial({
            color: 0xcc99ff, size: 2.0, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* dispersion trail */
          var DTN = 200;
          var dtPts = new Float32Array(DTN * 3);
          for (var dti = 0; dti < DTN; dti++) {
            var dtt = dti/DTN;
            dtPts[dti*3  ] = -dtt*60 + (Math.random()-0.5)*8;
            dtPts[dti*3+1] = (Math.random()-0.5)*6;
            dtPts[dti*3+2] = (Math.random()-0.5)*6;
          }
          var dtGeo = new THREE.BufferGeometry();
          dtGeo.setAttribute("position", new THREE.BufferAttribute(dtPts, 3));
          this._root.add(new THREE.Points(dtGeo, new THREE.PointsMaterial({
            color: 0xffffff, size: 1.5, transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._frbTime = 0;
          console.log("[fast-radio-burst-afterglow] loaded at (0,-350,-900)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._frbTime += dt;

          /* millisecond strobe on source */
          var p = Math.sin(this._frbTime * 40.0);
          this._src.material.opacity = p > 0.97 ? 1.0 : 0.0;

          /* X-ray fade */
          this._xMat.opacity = 0.50 + 0.20*Math.sin(this._frbTime * 1.3);

          this._root.rotation.y += 0.0002 * dt;
        },
      });

      /* ====================================================================
         STELLAR BOW WIND — a runaway star moving supersonically through the
         ISM creates a bow shock ahead of it. Hot gas piles up in a forward
         arc while the star trails a wind wake behind it.
         Position: (700, -200, 500).
         Components:
           - Runaway star: bright yellow dot (moving object)
           - Bow shock arc: forward parabolic shock (300 pts, orange-red)
           - Ram-pressure compressed ISM: just inside arc (200 pts, yellow)
           - Wind bubble: stellar wind region behind star (400 pts, blue-white)
           - Wake trail: turbulent material in star's wake (300 pts, faint)
           - ISM ambient: background ISM ahead of star (200 pts, dark red)
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("stellar-bow-wind", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(700, -200, 500);
          scene.add(this._root);

          /* runaway star */
          this._star = new THREE.Mesh(
            new THREE.SphereGeometry(4, 6, 4),
            new THREE.MeshBasicMaterial({ color: 0xfff0aa })
          );
          this._star.position.set(0, 0, 0);
          this._root.add(this._star);

          /* bow shock arc — parabolic in XZ plane, opens toward +z */
          var BSN = 300;
          var bsPts = new Float32Array(BSN * 3);
          for (var bsi = 0; bsi < BSN; bsi++) {
            var bsA = (bsi/BSN - 0.5)*Math.PI*1.3;
            var bsR = 40;
            bsPts[bsi*3  ] = bsR*Math.sin(bsA);
            bsPts[bsi*3+1] = (Math.random()-0.5)*18;
            bsPts[bsi*3+2] = bsR*(1-Math.cos(bsA))*0.6 + 30 + (Math.random()-0.5)*6;
          }
          var bsGeo = new THREE.BufferGeometry();
          bsGeo.setAttribute("position", new THREE.BufferAttribute(bsPts, 3));
          this._root.add(new THREE.Points(bsGeo, new THREE.PointsMaterial({
            color: 0xff7722, size: 2.8, transparent: true, opacity: 0.60,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* compressed ISM inside arc */
          var CIN = 200;
          var ciPts = new Float32Array(CIN * 3);
          for (var cii = 0; cii < CIN; cii++) {
            var ciA = (Math.random()-0.5)*Math.PI*1.2;
            var ciR = 25 + (Math.random()-0.5)*8;
            ciPts[cii*3  ] = ciR*Math.sin(ciA);
            ciPts[cii*3+1] = (Math.random()-0.5)*12;
            ciPts[cii*3+2] = ciR*(1-Math.cos(ciA))*0.5 + 20 + (Math.random()-0.5)*5;
          }
          var ciGeo = new THREE.BufferGeometry();
          ciGeo.setAttribute("position", new THREE.BufferAttribute(ciPts, 3));
          this._root.add(new THREE.Points(ciGeo, new THREE.PointsMaterial({
            color: 0xffee66, size: 2.0, transparent: true, opacity: 0.40,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* wind bubble behind star */
          var WBN = 400;
          var wbPts = new Float32Array(WBN * 3);
          for (var wbi = 0; wbi < WBN; wbi++) {
            var wbp = Math.acos(2*Math.random()-1), wba = Math.random()*2*Math.PI;
            var wbr = 8 + Math.random()*22;
            wbPts[wbi*3  ] = wbr*Math.sin(wbp)*Math.cos(wba);
            wbPts[wbi*3+1] = wbr*Math.cos(wbp);
            wbPts[wbi*3+2] = -Math.abs(wbr*Math.sin(wbp)*Math.sin(wba))-5;
          }
          var wbGeo = new THREE.BufferGeometry();
          wbGeo.setAttribute("position", new THREE.BufferAttribute(wbPts, 3));
          this._root.add(new THREE.Points(wbGeo, new THREE.PointsMaterial({
            color: 0xaaddff, size: 2.2, transparent: true, opacity: 0.40,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* wake trail */
          var WTN = 300;
          var wtPts = new Float32Array(WTN * 3);
          for (var wti = 0; wti < WTN; wti++) {
            var wtt = wti/WTN;
            wtPts[wti*3  ] = (Math.random()-0.5)*30*(1+wtt);
            wtPts[wti*3+1] = (Math.random()-0.5)*20*(1+wtt);
            wtPts[wti*3+2] = -wtt*80 + (Math.random()-0.5)*10;
          }
          var wtGeo = new THREE.BufferGeometry();
          wtGeo.setAttribute("position", new THREE.BufferAttribute(wtPts, 3));
          this._root.add(new THREE.Points(wtGeo, new THREE.PointsMaterial({
            color: 0x88aacc, size: 1.8, transparent: true, opacity: 0.18,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* ISM ambient */
          var ISMN = 200;
          var ismPts = new Float32Array(ISMN * 3);
          for (var ismi = 0; ismi < ISMN; ismi++) {
            ismPts[ismi*3  ] = (Math.random()-0.5)*120;
            ismPts[ismi*3+1] = (Math.random()-0.5)*60;
            ismPts[ismi*3+2] = 35 + Math.random()*80;
          }
          var ismGeo = new THREE.BufferGeometry();
          ismGeo.setAttribute("position", new THREE.BufferAttribute(ismPts, 3));
          this._root.add(new THREE.Points(ismGeo, new THREE.PointsMaterial({
            color: 0xcc3300, size: 1.5, transparent: true, opacity: 0.10,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._sbwTime = 0;
          console.log("[stellar-bow-wind] loaded at (700,-200,500)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._sbwTime += dt;

          /* star gentle oscillation */
          this._star.position.x = 4*Math.sin(this._sbwTime * 0.3);
          this._star.position.y = 2*Math.sin(this._sbwTime * 0.5);

          this._root.rotation.y += 0.0003 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 39 injected! Lines:', lineCount);
