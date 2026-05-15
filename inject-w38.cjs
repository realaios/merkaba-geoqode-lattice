'use strict';
// inject-w38.cjs — Wave 38: neutron-star-merger-ejecta + circumgalactic-fountain
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'public', 'cosmos-infinite.html');
let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('AFRAME.registerComponent("neutron-star-merger-ejecta"')) {
  console.log('Wave 38 already injected — skipping');
  process.exit(0);
}

const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');

// ─── HTML entities ────────────────────────────────────────────────────────
const HTML_ANCHOR = '      <a-entity tidal-tail-bridge></a-entity>';
const HTML_INSERT = `      <a-entity tidal-tail-bridge></a-entity>
      <!-- ── NEUTRON STAR MERGER EJECTA — kilonova-like expanding r-process cloud ── -->
      <a-entity neutron-star-merger-ejecta></a-entity>
      <!-- ── CIRCUMGALACTIC FOUNTAIN — recycled gas fountain above a galaxy disk ── -->
      <a-entity circumgalactic-fountain></a-entity>`;

html = html.replace(HTML_ANCHOR, HTML_INSERT);

// ─── JS components ────────────────────────────────────────────────────────
const JS_ANCHOR = '      AFRAME.registerComponent("asteroid-belt", {';
const JS_INSERT = `
      /* ====================================================================
         NEUTRON STAR MERGER EJECTA — kilonova-like r-process ejecta cloud
         from a neutron star-neutron star merger. This is the heavy-element
         nucleosynthesis site: gold, platinum, lanthanides from r-process.
         Position: (-800, -100, 300).
         Components:
           - Merger remnant: central bright compact object (pulsing)
           - Blue ejecta: fast dynamical ejecta (electron fraction Ye<0.25) — blue/violet
           - Red ejecta: slow wind ejecta (Ye~0.4) — red/infrared
           - Lanthanide curtain: mid-latitude ejecta (dark red, high opacity)
           - Relativistic jet: collimated GRB jet N/S (white-blue, fast)
           - Shock cocoon: wider cocoon around jet (purple, diffuse)
           - Expanding shell: overall outer shock expanding spherically
         @alignment 8→26→48:480  @frequency 852  @domain quantum-arch
      ==================================================================== */
      AFRAME.registerComponent("neutron-star-merger-ejecta", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(-800, -100, 300);
          scene.add(this._root);

          /* merger remnant */
          this._remnant = new THREE.Mesh(
            new THREE.SphereGeometry(4, 6, 4),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          this._root.add(this._remnant);

          /* blue fast ejecta — polar */
          var BN = 500;
          var bPts = new Float32Array(BN * 3);
          for (var bi = 0; bi < BN; bi++) {
            var bphi = Math.acos(2*Math.random()-1);
            var btheta = Math.random()*2*Math.PI;
            /* polar preference */
            var blatFav = Math.abs(Math.cos(bphi));
            var br = 25 + Math.random()*30 * blatFav;
            bPts[bi*3  ] = br*Math.sin(bphi)*Math.cos(btheta);
            bPts[bi*3+1] = br*Math.cos(bphi);
            bPts[bi*3+2] = br*Math.sin(bphi)*Math.sin(btheta);
          }
          var bGeo = new THREE.BufferGeometry();
          bGeo.setAttribute("position", new THREE.BufferAttribute(bPts, 3));
          this._blueMat = new THREE.PointsMaterial({
            color: 0x8899ff, size: 2.5, transparent: true, opacity: 0.55,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(bGeo, this._blueMat));

          /* red slow wind ejecta — equatorial */
          var RN = 500;
          var rPts = new Float32Array(RN * 3);
          for (var ri = 0; ri < RN; ri++) {
            var rphi = (Math.random()-0.5)*Math.PI*0.7 + Math.PI/2;
            var rtheta = Math.random()*2*Math.PI;
            var rr = 15 + Math.random()*25;
            rPts[ri*3  ] = rr*Math.sin(rphi)*Math.cos(rtheta);
            rPts[ri*3+1] = rr*Math.cos(rphi);
            rPts[ri*3+2] = rr*Math.sin(rphi)*Math.sin(rtheta);
          }
          var rGeo = new THREE.BufferGeometry();
          rGeo.setAttribute("position", new THREE.BufferAttribute(rPts, 3));
          this._root.add(new THREE.Points(rGeo, new THREE.PointsMaterial({
            color: 0xff6622, size: 2.8, transparent: true, opacity: 0.50,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* lanthanide curtain — dark red mid-latitude */
          var LN = 300;
          var lPts = new Float32Array(LN * 3);
          for (var li = 0; li < LN; li++) {
            var lphi = (Math.random()-0.5)*Math.PI*0.5 + Math.PI/2;
            var ltheta = Math.random()*2*Math.PI;
            var lr = 20 + Math.random()*15;
            lPts[li*3  ] = lr*Math.sin(lphi)*Math.cos(ltheta);
            lPts[li*3+1] = lr*Math.cos(lphi);
            lPts[li*3+2] = lr*Math.sin(lphi)*Math.sin(ltheta);
          }
          var lGeo = new THREE.BufferGeometry();
          lGeo.setAttribute("position", new THREE.BufferAttribute(lPts, 3));
          this._root.add(new THREE.Points(lGeo, new THREE.PointsMaterial({
            color: 0x881100, size: 3.0, transparent: true, opacity: 0.45,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* relativistic jet N+S */
          for (var jj = 0; jj < 2; jj++) {
            var jsign = jj===0 ? 1 : -1;
            var JN = 150;
            var jPts = new Float32Array(JN * 3);
            for (var ji = 0; ji < JN; ji++) {
              var jlen = (ji/JN)*70 + 5;
              var jr = (1-ji/JN)*3;
              var ja = Math.random()*2*Math.PI;
              jPts[ji*3  ] = jr*Math.cos(ja);
              jPts[ji*3+1] = jsign*jlen;
              jPts[ji*3+2] = jr*Math.sin(ja);
            }
            var jGeo = new THREE.BufferGeometry();
            jGeo.setAttribute("position", new THREE.BufferAttribute(jPts, 3));
            this._root.add(new THREE.Points(jGeo, new THREE.PointsMaterial({
              color: 0xccddff, size: 2.2, transparent: true, opacity: 0.70,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* shock cocoon */
          var CON = 300;
          var coPts = new Float32Array(CON * 3);
          for (var coi = 0; coi < CON; coi++) {
            var cop = Math.acos(2*Math.random()-1);
            var coa = Math.random()*2*Math.PI;
            var cor = 45 + (Math.random()-0.5)*10;
            coPts[coi*3  ] = cor*Math.sin(cop)*Math.cos(coa)*0.6;
            coPts[coi*3+1] = cor*Math.cos(cop)*1.8;
            coPts[coi*3+2] = cor*Math.sin(cop)*Math.sin(coa)*0.6;
          }
          var coGeo = new THREE.BufferGeometry();
          coGeo.setAttribute("position", new THREE.BufferAttribute(coPts, 3));
          this._root.add(new THREE.Points(coGeo, new THREE.PointsMaterial({
            color: 0xaa55cc, size: 2.0, transparent: true, opacity: 0.22,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* outer expanding shell */
          var SN = 400;
          var sPts = new Float32Array(SN * 3);
          for (var si = 0; si < SN; si++) {
            var sp = Math.acos(2*Math.random()-1);
            var sa = Math.random()*2*Math.PI;
            var sr = 68 + (Math.random()-0.5)*8;
            sPts[si*3  ] = sr*Math.sin(sp)*Math.cos(sa);
            sPts[si*3+1] = sr*Math.cos(sp);
            sPts[si*3+2] = sr*Math.sin(sp)*Math.sin(sa);
          }
          var sGeo = new THREE.BufferGeometry();
          sGeo.setAttribute("position", new THREE.BufferAttribute(sPts, 3));
          this._root.add(new THREE.Points(sGeo, new THREE.PointsMaterial({
            color: 0xffaa66, size: 1.5, transparent: true, opacity: 0.12,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._nmeTime = 0;
          console.log("[neutron-star-merger-ejecta] loaded at (-800,-100,300)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._nmeTime += dt;

          /* remnant pulse */
          var rp = 0.7 + 0.3*Math.abs(Math.sin(this._nmeTime * 8.5));
          this._remnant.scale.setScalar(rp);

          /* blue ejecta shimmer */
          this._blueMat.opacity = 0.45 + 0.15*Math.sin(this._nmeTime * 2.1);

          this._root.rotation.y += 0.0003 * dt;
        },
      });

      /* ====================================================================
         CIRCUMGALACTIC FOUNTAIN — gas ejected from the galaxy disk by
         supernova feedback rises, cools, and rains back down as the "galactic
         fountain". Shows upwelling hot plumes, cooling arcs, and cold
         infall rain.
         Position: (200, 500, 700).
         Components:
           - Galaxy disk: 400 pts flat disk (yellowish)
           - Hot outflow plumes: 8 upwelling columns N+S (600 pts each half)
           - Cooling arcs: 5 arcs at high z (gas turning over), green-blue
           - Infall rain: 300 pts streaming back down, cool blue
           - Warm phase halo: 300 pts diffuse warm gas at intermediate z
         @alignment 8→26→48:480  @frequency 528  @domain code-eng
      ==================================================================== */
      AFRAME.registerComponent("circumgalactic-fountain", {
        init: function () {
          var THREE = AFRAME.THREE;
          var scene = this.el.sceneEl.object3D;

          this._root = new THREE.Group();
          this._root.position.set(200, 500, 700);
          scene.add(this._root);

          /* galaxy disk */
          var DN = 400;
          var dPts = new Float32Array(DN * 3);
          for (var di = 0; di < DN; di++) {
            var da = Math.random()*2*Math.PI;
            var dr = Math.sqrt(Math.random())*80;
            dPts[di*3  ] = dr*Math.cos(da);
            dPts[di*3+1] = (Math.random()-0.5)*5;
            dPts[di*3+2] = dr*Math.sin(da);
          }
          var dGeo = new THREE.BufferGeometry();
          dGeo.setAttribute("position", new THREE.BufferAttribute(dPts, 3));
          this._root.add(new THREE.Points(dGeo, new THREE.PointsMaterial({
            color: 0xffdd88, size: 1.8, transparent: true, opacity: 0.35,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          /* hot outflow plumes: N+S, each 300 pts */
          this._plumePts = [];
          for (var pp = 0; pp < 2; pp++) {
            var psign = pp===0 ? 1 : -1;
            var PN = 300;
            var pPts = new Float32Array(PN * 3);
            for (var pi = 0; pi < PN; pi++) {
              var pt = pi/PN;
              var pa = Math.random()*2*Math.PI;
              var pr = (1-pt)*20 + Math.random()*8;
              pPts[pi*3  ] = pr*Math.cos(pa);
              pPts[pi*3+1] = psign*(pt*100 + Math.random()*10);
              pPts[pi*3+2] = pr*Math.sin(pa);
            }
            var pGeo = new THREE.BufferGeometry();
            pGeo.setAttribute("position", new THREE.BufferAttribute(pPts, 3));
            var pMat = new THREE.PointsMaterial({
              color: 0xff5511, size: 2.5, transparent: true, opacity: 0.45,
              blending: THREE.AdditiveBlending, depthWrite: false,
            });
            this._plumePts.push({ pos: pGeo.getAttribute("position"), mat: pMat });
            this._root.add(new THREE.Points(pGeo, pMat));
          }

          /* cooling arcs at high z */
          var arcColors = [0x44ffaa, 0x44ddff, 0x88ffdd, 0x66aaff, 0x33ddcc];
          for (var arc = 0; arc < 5; arc++) {
            var AN = 150;
            var aPts = new Float32Array(AN * 3);
            var arcH = 70 + arc*10;
            var arcR = 15 + arc*8;
            for (var ani = 0; ani < AN; ani++) {
              var at2 = ani/AN;
              var aa2 = at2*Math.PI + arc*1.2;
              aPts[ani*3  ] = arcR*Math.cos(aa2);
              aPts[ani*3+1] = arcH + arcR*Math.sin(at2*Math.PI)*0.4 + (Math.random()-0.5)*5;
              aPts[ani*3+2] = arcR*Math.sin(aa2)*0.5 + (Math.random()-0.5)*5;
            }
            var aGeo = new THREE.BufferGeometry();
            aGeo.setAttribute("position", new THREE.BufferAttribute(aPts, 3));
            this._root.add(new THREE.Points(aGeo, new THREE.PointsMaterial({
              color: arcColors[arc], size: 2.0, transparent: true, opacity: 0.40,
              blending: THREE.AdditiveBlending, depthWrite: false,
            })));
          }

          /* infall rain */
          var IRN = 300;
          var irPts = new Float32Array(IRN * 3);
          this._irPos = irPts;
          this._irInitZ = new Float32Array(IRN);
          for (var iri = 0; iri < IRN; iri++) {
            var ira = Math.random()*2*Math.PI;
            var irr = Math.random()*55;
            irPts[iri*3  ] = irr*Math.cos(ira);
            irPts[iri*3+1] = Math.random()*120 - 10;
            irPts[iri*3+2] = irr*Math.sin(ira);
            this._irInitZ[iri] = irPts[iri*3+1];
          }
          var irGeo = new THREE.BufferGeometry();
          irGeo.setAttribute("position", new THREE.BufferAttribute(irPts, 3));
          this._irAttr = irGeo.getAttribute("position");
          var irMat = new THREE.PointsMaterial({
            color: 0x88aaff, size: 2.0, transparent: true, opacity: 0.40,
            blending: THREE.AdditiveBlending, depthWrite: false,
          });
          this._root.add(new THREE.Points(irGeo, irMat));

          /* warm halo */
          var WN = 300;
          var wPts = new Float32Array(WN * 3);
          for (var wi = 0; wi < WN; wi++) {
            wPts[wi*3  ] = (Math.random()-0.5)*160;
            wPts[wi*3+1] = (Math.random()-0.5)*120;
            wPts[wi*3+2] = (Math.random()-0.5)*160;
          }
          var wGeo = new THREE.BufferGeometry();
          wGeo.setAttribute("position", new THREE.BufferAttribute(wPts, 3));
          this._root.add(new THREE.Points(wGeo, new THREE.PointsMaterial({
            color: 0xffbb55, size: 1.5, transparent: true, opacity: 0.08,
            blending: THREE.AdditiveBlending, depthWrite: false,
          })));

          this._cgfTime = 0;
          console.log("[circumgalactic-fountain] loaded at (200,500,700)");
        },

        tick: function (time, delta) {
          var dt = Math.min(delta, 200) * 0.001;
          this._cgfTime += dt;

          /* animate infall rain downward */
          var irPos = this._irAttr;
          var iCount = irPos.count;
          for (var ii = 0; ii < iCount; ii++) {
            var iy = irPos.getY(ii) - 8 * dt;
            if (iy < -10) iy = 110;
            irPos.setY(ii, iy);
          }
          irPos.needsUpdate = true;

          this._root.rotation.y += 0.0002 * dt;
        },
      });

      AFRAME.registerComponent("asteroid-belt", {`;

html = html.replace(JS_ANCHOR, JS_INSERT);

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
const lineCount = html.split(usesCRLF ? '\r\n' : '\n').length;
console.log('Wave 38 injected! Lines:', lineCount);
