/**
 * MAL Loader — MASSIVE_ASSET-LIBRARY.geoassets scene builder
 * Reads MAL JSON, builds A-Frame HTML for any scene ID.
 * Used by vr.html to render cinematic VR scenes.
 *
 * Usage (from vr.html):
 *   import { buildMALScene } from '/public/geoassets/mal-loader.js';
 *   const sceneHTML = await buildMALScene('the_simulation');
 *   container.innerHTML = sceneHTML;
 */

const MAL_PATH = "/public/geoassets/MASSIVE_ASSET-LIBRARY.geoassets";
let _malCache = null;

async function loadMAL() {
  if (_malCache) return _malCache;
  const res = await fetch(MAL_PATH);
  if (!res.ok) throw new Error(`MAL fetch failed: ${res.status}`);
  _malCache = await res.json();
  return _malCache;
}

// ─── Utility helpers ───────────────────────────────────────────────

function rand(min, max) {
  return min + Math.random() * (max - min);
}
function randItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function animDelay(fn) {
  if (!fn) return 0;
  const m = fn.match(/random_(\d+)_(\d+)/);
  return m ? Math.floor(rand(+m[1], +m[2])) : 0;
}

// ─── Material → A-Frame attribute string ───────────────────────────

function matAttr(matId, materials, override) {
  const base = (typeof matId === "string" ? materials[matId] : matId) || {};
  const m = override ? { ...base, ...override } : base;
  const parts = [];
  if (m.color) parts.push(`color: ${m.color}`);
  if (m.emissive) parts.push(`emissive: ${m.emissive}`);
  if (m.emissiveIntensity !== undefined)
    parts.push(`emissiveIntensity: ${m.emissiveIntensity}`);
  if (m.opacity !== undefined && m.opacity < 1) {
    parts.push(`opacity: ${m.opacity}`);
    parts.push(`transparent: true`);
  }
  if (m.transparent) parts.push(`transparent: true`);
  if (m.metalness !== undefined) parts.push(`metalness: ${m.metalness}`);
  if (m.roughness !== undefined) parts.push(`roughness: ${m.roughness}`);
  if (m.wireframe) parts.push(`wireframe: true`);
  if (m.shader) parts.push(`shader: ${m.shader}`);
  return parts.join("; ");
}

// ─── Animation → A-Frame attribute string ──────────────────────────

function animAttr(animId, animations, delay, positionBase) {
  if (!animId) return "";
  const a = animations[animId];
  if (!a) return "";

  // For position animations, make the "to" relative to the element's actual position
  let to = a.to;
  if (a.property === "position" && positionBase && to) {
    const parts = to.trim().split(/\s+/).map(Number);
    if (parts.length === 3 && positionBase.length === 3) {
      to = positionBase.map((v, i) => v + parts[i]).join(" ");
    }
  }

  const parts = [
    `property: ${a.property}`,
    `to: ${to}`,
    `dur: ${a.dur}`,
    `easing: ${a.easing}`,
    `loop: ${a.loop ? "true" : "false"}`,
  ];
  if (a.from !== undefined) parts.push(`from: ${a.from}`);
  if (a.dir) parts.push(`dir: ${a.dir}`);
  if (delay) parts.push(`delay: ${delay}`);
  return parts.join("; ");
}

// ─── Primitive builders ─────────────────────────────────────────────

function makeEl(type, attrs, animStr, extraAttrs = "") {
  const animPart = animStr ? ` animation="${animStr}"` : "";
  const extra = extraAttrs ? ` ${extraAttrs}` : "";
  return `<a-${type} ${attrs}${animPart}${extra}></a-${type}>`;
}

function sphere(pos, r, matStr, animStr) {
  const p = Array.isArray(pos) ? pos.join(" ") : pos;
  return makeEl(
    "sphere",
    `position="${p}" radius="${r}" material="${matStr}"`,
    animStr,
  );
}

function box(pos, w, h, d, matStr, animStr, rot = "") {
  const p = Array.isArray(pos) ? pos.join(" ") : pos;
  const rotPart = rot ? ` rotation="${rot}"` : "";
  return makeEl(
    "box",
    `position="${p}" width="${w}" height="${h}" depth="${d}" material="${matStr}"${rotPart}`,
    animStr,
  );
}

function cylinder(pos, r, h, matStr, animStr, rot = "") {
  const p = Array.isArray(pos) ? pos.join(" ") : pos;
  const rotPart = rot ? ` rotation="${rot}"` : "";
  return makeEl(
    "cylinder",
    `position="${p}" radius="${r}" height="${h}" material="${matStr}"${rotPart}`,
    animStr,
  );
}

function torus(pos, r, rt, matStr, animStr, rot = "") {
  const p = Array.isArray(pos) ? pos.join(" ") : pos;
  const rotPart = rot ? ` rotation="${rot}"` : "";
  return makeEl(
    "torus",
    `position="${p}" radius="${r}" radius-tubular="${rt}" material="${matStr}"${rotPart}`,
    animStr,
  );
}

function plane(pos, w, h, matStr, animStr, rot = "-90 0 0") {
  const p = Array.isArray(pos) ? pos.join(" ") : pos;
  return makeEl(
    "plane",
    `position="${p}" width="${w}" height="${h}" rotation="${rot}" material="${matStr}"`,
    animStr,
  );
}

// ─── Distribution helpers ───────────────────────────────────────────

function phiSphere(count, radius) {
  const PHI = 1.618;
  const points = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = (2 * Math.PI * i) / PHI;
    points.push([
      r * Math.cos(theta) * radius,
      y * radius,
      r * Math.sin(theta) * radius,
    ]);
  }
  return points;
}

function harmonicRing(count, radius) {
  return Array.from({ length: count }, (_, i) => {
    const theta = (2 * Math.PI * i) / count;
    const phi = (Math.PI * i) / count;
    return [
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    ];
  });
}

function gaussianVolume(count, sigma) {
  const points = [];
  for (let i = 0; i < count; i++) {
    // Box-Muller
    const u = Math.random(),
      v = Math.random();
    const n1 = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    const n2 = Math.sqrt(-2 * Math.log(u)) * Math.sin(2 * Math.PI * v);
    const n3 =
      Math.sqrt(-2 * Math.log(Math.random() || 0.001)) *
      Math.cos(2 * Math.PI * Math.random());
    points.push([n1 * sigma, n2 * sigma, n3 * sigma]);
  }
  return points;
}

function sphericalShell(count, rMin, rMax) {
  return Array.from({ length: count }, () => {
    const r = rand(rMin, rMax);
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    return [
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    ];
  });
}

function phiSpiral3D(count, radius) {
  const PHI = 1.618;
  return Array.from({ length: count }, (_, i) => {
    const t = i / count;
    const angle = 2 * Math.PI * PHI * i;
    return [
      radius * t * Math.cos(angle),
      radius * (t - 0.5) * 0.5,
      radius * t * Math.sin(angle),
    ];
  });
}

function spreadRandom(spread) {
  return [
    rand(spread.x[0], spread.x[1]),
    rand(spread.y ? spread.y[0] : 0, spread.y ? spread.y[1] : 0),
    rand(spread.z[0], spread.z[1]),
  ];
}

// ─── Range value helper ─────────────────────────────────────────────

function rv(val, range_key, el) {
  const k = range_key;
  if (el[k + "_range"]) return rand(...el[k + "_range"]);
  return el[k] !== undefined ? el[k] : val;
}

// ─── Layer renderers ────────────────────────────────────────────────

function renderLayer(layer, mal) {
  const { materials, animations } = mal;
  const parts = [];
  const el = layer.element || {};

  // Resolve distribution points
  let points = [];
  if (layer.distribution === "phi_sphere")
    points = phiSphere(layer.count, layer.radius);
  else if (layer.distribution === "harmonic_ring")
    points = harmonicRing(layer.count, layer.radius);
  else if (layer.distribution === "gaussian_volume")
    points = gaussianVolume(layer.count, layer.sigma || 5);
  else if (layer.distribution === "spherical_shell")
    points = sphericalShell(
      layer.count,
      (layer.radius_range || [10, 20])[0],
      (layer.radius_range || [10, 20])[1],
    );
  else if (layer.distribution === "phi_spiral_3d")
    points = phiSpiral3D(layer.count, layer.radius);
  else if (layer.spread && layer.count) {
    for (let i = 0; i < layer.count; i++)
      points.push(spreadRandom(layer.spread));
  }

  // Instances array (explicit positions)
  if (layer.instances && !layer.element) {
    // Top-level type (e.g. server_blocks)
    for (const inst of layer.instances) {
      const mStr = matAttr(
        layer.element
          ? el.material
          : inst.material_override || layer.material || "steel_dark",
        materials,
      );
      const p = Array.isArray(inst.position) ? inst.position : [0, 0, 0];
      const s = inst.scale || [1, 1, 1];
      const r = inst.rotation ? inst.rotation.join(" ") : "0 0 0";
      const a = animAttr(
        inst.animation_override || layer.element?.animation || layer.animation,
        animations,
        animDelay(layer.element?.animDelayFn),
        p,
      );
      parts.push(
        `<a-box position="${p.join(" ")}" scale="${s.join(" ")}" rotation="${r}" material="${mStr}" ${a ? `animation="${a}"` : ""}></a-box>`,
      );
    }
    return parts.join("\n");
  }

  if (layer.instances && layer.element) {
    for (const inst of layer.instances) {
      const p = Array.isArray(inst.position) ? inst.position : [0, 0, 0];
      const s = inst.scale ? inst.scale.join(" ") : "1 1 1";
      const r = inst.rotation ? inst.rotation.join(" ") : "0 0 0";
      const mat = matAttr(
        inst.material_override || el.material,
        materials,
        inst.material_override,
      );
      const a = animAttr(
        el.animation,
        animations,
        animDelay(el.animDelayFn),
        p,
      );
      const animS = a ? `animation="${a}"` : "";
      switch (el.type) {
        case "box":
          parts.push(
            `<a-box position="${p.join(" ")}" scale="${s}" rotation="${r}" material="${mat}" ${animS}></a-box>`,
          );
          break;
        case "sphere":
          parts.push(
            `<a-sphere position="${p.join(" ")}" radius="${rv(1, "r", el)}" scale="${s}" material="${mat}" ${animS}></a-sphere>`,
          );
          break;
        case "torus":
          parts.push(
            `<a-torus position="${p.join(" ")}" radius="${el.r || 1}" radius-tubular="${el.rt || 0.05}" rotation="${r}" material="${mat}" ${animS}></a-torus>`,
          );
          break;
        case "plane":
          parts.push(
            `<a-plane position="${p.join(" ")}" width="${inst.scale ? inst.scale[0] : el.w || 10}" height="${inst.scale ? inst.scale[1] : el.h || 10}" rotation="${r}" material="${mat}"></a-plane>`,
          );
          break;
        default:
          parts.push(
            `<a-box position="${p.join(" ")}" scale="${s}" material="${mat}" ${animS}></a-box>`,
          );
      }
    }
    return parts.join("\n");
  }

  // Distributed count-based instances
  for (const pos of points) {
    const mat = matAttr(el.material, materials);
    const delay = animDelay(el.animDelayFn);
    const a = animAttr(el.animation, animations, delay, pos);
    const animS = a ? `animation="${a}"` : "";
    const r_val = rv(0.1, "r", el);

    switch (el.type) {
      case "sphere":
        parts.push(sphere(pos, r_val, mat, a));
        break;
      case "torus":
        parts.push(
          `<a-torus position="${pos.join(" ")}" radius="${el.r || 0.5}" radius-tubular="${el.rt || 0.05}" material="${mat}" ${animS}></a-torus>`,
        );
        break;
      case "cylinder":
        parts.push(cylinder(pos, rv(0.3, "r", el), rv(8, "h", el), mat, a));
        break;
      case "box":
        parts.push(
          box(pos, rv(1, "w", el), rv(1, "h", el), rv(1, "d", el), mat, a),
        );
        break;
      default:
        parts.push(sphere(pos, r_val, mat, a));
    }
  }

  // Text panel (code rain column)
  if (layer.element?.type === "text_panel") {
    // Render as tall, narrow text-geometry if A-Frame supports it,
    // otherwise use a translucent box column as stand-in.
    for (const pos of points) {
      const mat = matAttr(el.material, materials);
      const delay = animDelay(el.animDelayFn);
      const destY = (pos[1] || 0) - 30;
      const a = `property: position; to: ${pos[0].toFixed(2)} ${destY} ${pos[2].toFixed(2)}; dur: ${el.animation === "code_fall_fast" ? 2500 : el.animation === "code_fall_slow" ? 7000 : 4000}; easing: linear; loop: true; delay: ${delay}`;
      parts.push(
        `<a-box position="${pos.join(" ")}" width="${el.width || 0.22}" height="${el.height || 28}" depth="0.01" material="${mat}" animation="${a}"></a-box>`,
      );
    }
  }

  // Character (composite parts)
  if (layer.parts) {
    const anchor = layer.anchor?.position || [0, 0, 0];
    const groupAnim = animAttr(layer.animation, animations, 0, anchor);
    parts.push(
      `<a-entity position="${anchor.join(" ")}" ${groupAnim ? `animation="${groupAnim}"` : ""}>`,
    );
    for (const part of layer.parts) {
      const mat = matAttr(part.material, materials);
      const a = animAttr(
        part.animation,
        animations,
        0,
        part.position || [0, 0, 0],
      );
      const animS = a ? `animation="${a}"` : "";
      const rot = Array.isArray(part.rotation)
        ? part.rotation.join(" ")
        : part.rotation || "0 0 0";
      const p = (part.position || [0, 0, 0]).join(" ");
      switch (part.type) {
        case "sphere":
          parts.push(
            `  <a-sphere position="${p}" radius="${part.r}" rotation="${rot}" material="${mat}" ${animS}></a-sphere>`,
          );
          break;
        case "cylinder":
          parts.push(
            `  <a-cylinder position="${p}" radius="${part.r}" height="${part.h}" rotation="${rot}" material="${mat}" ${animS}></a-cylinder>`,
          );
          break;
        case "box":
          parts.push(
            `  <a-box position="${p}" width="${part.w}" height="${part.h}" depth="${part.d}" rotation="${rot}" material="${mat}" ${animS}></a-box>`,
          );
          break;
        case "torus":
          parts.push(
            `  <a-torus position="${p}" radius="${part.r}" radius-tubular="${part.rt}" rotation="${rot}" material="${mat}" ${animS}></a-torus>`,
          );
          break;
      }
    }
    parts.push(`</a-entity>`);
  }

  // Orbit ring (data orbs)
  if (layer.orbitRadius && layer.orbitCenter && layer.count) {
    const c = layer.orbitCenter;
    const or = layer.orbitRadius;
    const mat = matAttr(el.material, materials);
    const a = animAttr(layer.orbitSpeed, animations, 0, null);
    parts.push(`<a-entity position="${c.join(" ")}" animation="${a}">`);
    for (let i = 0; i < layer.count; i++) {
      const angle = (2 * Math.PI * i) / layer.count;
      const x = or * Math.cos(angle);
      const z = or * Math.sin(angle);
      const r_val = rv(0.055, "r", el);
      const delA = animAttr(
        el.animation,
        animations,
        animDelay(el.animDelayFn),
        [x, 0, z],
      );
      parts.push(
        `  <a-sphere position="${x.toFixed(3)} 0 ${z.toFixed(3)}" radius="${r_val}" material="${mat}" ${delA ? `animation="${delA}"` : ""}></a-sphere>`,
      );
    }
    parts.push(`</a-entity>`);
  }

  // Direct type (floor, sky, etc.)
  if (layer.type === "plane" || layer.type === "floor") {
    const mat = matAttr(layer.material, materials);
    parts.push(
      plane(
        layer.position || [0, 0, 0],
        layer.w || 200,
        layer.h || 200,
        mat,
        null,
        (layer.rotation || [-90, 0, 0]).join(" "),
      ),
    );
  }
  if (layer.type === "torus") {
    const mat = matAttr(layer.material, materials);
    const a = animAttr(
      layer.animation,
      animations,
      0,
      layer.position || [0, 0, 0],
    );
    parts.push(
      torus(
        layer.position || [0, 0, 0],
        layer.r,
        layer.rt,
        mat,
        a,
        Array.isArray(layer.rotation)
          ? layer.rotation.join(" ")
          : layer.rotation || "0 0 0",
      ),
    );
  }

  return parts.join("\n");
}

// ─── Narrative overlay HTML ─────────────────────────────────────────

function narrativePanel(scene) {
  if (!scene.narrativeBeats || !scene.narrativeBeats.length) return "";
  const beats = scene.narrativeBeats;
  const first = beats[0];
  return `
<div id="mal-narrative" style="
  position:fixed; bottom:32px; left:50%; transform:translateX(-50%);
  background:rgba(0,10,0,0.82); border:1px solid #00ff41; border-radius:8px;
  padding:18px 28px; max-width:560px; width:90%; color:#00ff41;
  font-family:'Courier New',monospace; font-size:14px; line-height:1.7;
  white-space:pre-wrap; z-index:9999; pointer-events:none;
  text-shadow:0 0 8px #00ff41; box-shadow:0 0 20px rgba(0,255,65,0.2);
  transition:opacity 0.8s ease;
" data-beat="0" data-beats='${JSON.stringify(beats).replace(/'/g, "&apos;")}'>
  <div style="font-size:10px;opacity:0.55;margin-bottom:6px;letter-spacing:2px;">AIOS VR — ${scene.title.toUpperCase()}</div>
  <div id="mal-narrative-text">${first.text}</div>
</div>
<script>
(function(){
  var el = document.getElementById('mal-narrative');
  if (!el) return;
  function dismiss() {
    el.style.opacity = '0';
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 850);
  }
  setTimeout(dismiss, 5000);
})();
<\/script>`;
}

// ─── Environment builder ────────────────────────────────────────────

// Photo-realistic equirectangular skybox images (Polyhaven tonemapped JPGs)
const SKY_IMGS = {
  // Wave 1 — original 14 scenes
  forest_528: "/geoassets/skies/forest_528.jpg",
  rainforest_trail: "/geoassets/skies/rainforest_trail.jpg",
  colosseum_time_gate: "/geoassets/skies/colosseum_time_gate.jpg",
  pyramids_giza: "/geoassets/skies/pyramids_giza.jpg",
  deep_space: "/geoassets/skies/deep_space_sky.jpg",
  arctic_tundra: "/geoassets/skies/arctic_tundra.jpg",
  volcanic_summit: "/geoassets/skies/volcanic_summit.jpg",
  gothic_cathedral: "/geoassets/skies/gothic_cathedral.jpg",
  abandoned_factory: "/geoassets/skies/abandoned_factory.jpg",
  grand_canyon: "/geoassets/skies/grand_canyon.jpg",
  city_night_streets: "/geoassets/skies/city_night_streets.jpg",
  football_stadium: "/geoassets/skies/football_stadium.jpg",
  ocean_beach: "/geoassets/skies/ocean_beach.jpg",
  dikhololo_night: "/geoassets/skies/dikhololo_night.jpg",
  // Wave 2 — 4 solid-color scenes upgraded to photo HDRIs
  tron_grid: "/geoassets/skies/tron_sky.jpg",
  nano_bloodstream: "/geoassets/skies/nano_cave.jpg",
  spacex_capsule: "/geoassets/skies/moonlit_night.jpg",
  earth_orbit: "/geoassets/skies/starfield_night.jpg",
  // Wave 2 — 16 brand new photo-realistic scenes
  night_bridge_vr: "/geoassets/skies/night_bridge.jpg",
  venice_dawn_vr: "/geoassets/skies/venice_dawn.jpg",
  urban_street_vr: "/geoassets/skies/urban_street.jpg",
  rooftop_cityscape: "/geoassets/skies/rooftop_night.jpg",
  snowy_forest_vr: "/geoassets/skies/snowy_forest.jpg",
  safari_sunset_vr: "/geoassets/skies/safari_sunset.jpg",
  stone_alley_vr: "/geoassets/skies/stone_alley.jpg",
  moon_laboratory: "/geoassets/skies/moon_lab.jpg",
  autumn_meadow_vr: "/geoassets/skies/autumn_meadow.jpg",
  waterfall_valley_vr: "/geoassets/skies/waterfall_valley.jpg",
  neon_tunnel_vr: "/geoassets/skies/neon_tunnel.jpg",
  victorian_market: "/geoassets/skies/leadenhall_market.jpg",
  red_hills_vr: "/geoassets/skies/red_hills.jpg",
  ancient_ruins_vr: "/geoassets/skies/ancient_ruins.jpg",
  lakeside_dawn_vr: "/geoassets/skies/lakeside_dawn.jpg",
  bamboo_forest_vr: "/geoassets/skies/bamboo_tunnel.jpg",
  // Wave 3 — 15 new photo-realistic scenes
  concrete_tunnel_vr: "/geoassets/skies/concrete_tunnel.jpg",
  cobblestone_night_vr: "/geoassets/skies/cobblestone_night.jpg",
  evening_street_vr: "/geoassets/skies/evening_street.jpg",
  autumn_forest_vr: "/geoassets/skies/autumn_forest.jpg",
  frozen_lake_vr: "/geoassets/skies/frozen_lake.jpg",
  coastal_cliff_vr: "/geoassets/skies/coastal_cliff.jpg",
  white_cliffs_vr: "/geoassets/skies/white_cliffs.jpg",
  industrial_sunset_vr: "/geoassets/skies/industrial_sunset.jpg",
  blouberg_sunrise_vr: "/geoassets/skies/blouberg_sunrise.jpg",
  simons_harbour_vr: "/geoassets/skies/simons_harbour.jpg",
  rock_castle_vr: "/geoassets/skies/rock_castle.jpg",
  abandoned_church_vr: "/geoassets/skies/abandoned_church.jpg",
  church_square_vr: "/geoassets/skies/church_square.jpg",
  railway_bridge_vr: "/geoassets/skies/railway_bridge.jpg",
  ornate_gardens_vr: "/geoassets/skies/ornate_gardens.jpg",
  // Wave 4 — existing sky files, new scenes
  abandoned_factory_vr:    "/geoassets/skies/abandoned_factory.jpg",
  arctic_tundra_vr:        "/geoassets/skies/arctic_tundra.jpg",
  city_night_streets_vr:   "/geoassets/skies/city_night_streets.jpg",
  colosseum_time_gate_vr:  "/geoassets/skies/colosseum_time_gate.jpg",
  deep_space_vr:           "/geoassets/skies/deep_space_sky.jpg",
  dikhololo_night_vr:      "/geoassets/skies/dikhololo_night.jpg",
  football_stadium_vr:     "/geoassets/skies/football_stadium.jpg",
  forest_528hz_vr:         "/geoassets/skies/forest_528.jpg",
  gothic_cathedral_vr:     "/geoassets/skies/gothic_cathedral.jpg",
  grand_canyon_vr:         "/geoassets/skies/grand_canyon.jpg",
  leadenhall_market_vr:    "/geoassets/skies/leadenhall_market.jpg",
  moon_lab_vr:             "/geoassets/skies/moon_lab.jpg",
  moonlit_night_vr:        "/geoassets/skies/moonlit_night.jpg",
  ocean_beach_vr:          "/geoassets/skies/ocean_beach.jpg",
  volcanic_summit_vr:      "/geoassets/skies/volcanic_summit.jpg",
};

function buildEnvironment(env, palette, sceneId) {
  const parts = [];
  // Sky — photo-realistic skybox takes priority over solid-color fallback
  const skyImg = SKY_IMGS[sceneId];
  if (skyImg) {
    parts.push(`<a-sky src="${skyImg}" radius="500"></a-sky>`);
  } else if (env.sky) {
    if (env.sky.type === "gradient") {
      parts.push(
        `<a-sky color="${env.sky.topColor || palette.secondary || palette.bg}"></a-sky>`,
      );
    } else {
      parts.push(
        `<a-sky color="${palette.secondary || env.sky.color || palette.bg}"></a-sky>`,
      );
    }
  }
  // Fog via scene fog attribute — returned as scene-level attr
  // Floor
  if (env.floor) {
    const f = env.floor;
    const mat =
      typeof f.material === "string"
        ? `color: #001100; wireframe: true; opacity: 0.4; transparent: true`
        : `color: ${palette.secondary || "#111"}`;
    parts.push(
      `<a-box position="${(f.position || [0, -0.5, 0]).join(" ")}" width="${f.w || 200}" height="${f.h || 0.1}" depth="${f.d || 200}" material="${mat}"></a-box>`,
    );
  }
  return parts.join("\n");
}

// ─── Main builder ───────────────────────────────────────────────────

/**
 * buildMALScene(sceneId) → { sceneHTML, narrativeHTML, palette, title, logline }
 * sceneHTML goes inside <a-scene>…</a-scene>
 * narrativeHTML goes outside the canvas, overlaid with CSS
 */
export async function buildMALScene(sceneId) {
  const mal = await loadMAL();
  const scene = mal.scenes[sceneId];
  if (!scene)
    throw new Error(
      `MAL: unknown scene "${sceneId}". Available: ${Object.keys(mal.scenes).join(", ")}`,
    );

  const palette = mal.palettes[scene.palette] || mal.palettes.simulation;
  const sceneParts = [];

  // Environment (pass sceneId for photo skybox lookup)
  sceneParts.push(buildEnvironment(scene.environment || {}, palette, sceneId));

  // Layers
  for (const layer of scene.layers || []) {
    try {
      sceneParts.push(`<!-- ${layer.label || layer.id} -->`);
      sceneParts.push(renderLayer(layer, mal));
    } catch (e) {
      console.warn(`MAL: layer "${layer.id}" render error:`, e);
    }
  }

  // Ambient light
  sceneParts.push(
    `<a-ambient-light color="${palette.primary}" intensity="0.35"></a-ambient-light>`,
  );
  sceneParts.push(
    `<a-directional-light color="${palette.accent || "#ffffff"}" intensity="0.6" position="2 4 -1"></a-directional-light>`,
  );
  if (palette.bg !== "#e0f4ff") {
    sceneParts.push(
      `<a-point-light color="${palette.primary}" intensity="0.8" position="0 4 -4" distance="18" decay="2"></a-point-light>`,
    );
  }

  const fogAttr = `fog: type: exponential; color: ${palette.fog || palette.bg}; density: ${palette.fogDensity || 0.015}`;

  return {
    title: scene.title,
    logline: scene.logline,
    palette,
    fogAttr,
    sound: scene.sound ? mal.sounds[scene.sound] : null,
    sceneHTML: sceneParts.join("\n"),
    narrativeHTML: narrativePanel(scene),
  };
}

/**
 * listScenes() → array of { id, title, logline, palette }
 */
export async function listScenes() {
  const mal = await loadMAL();
  return Object.values(mal.scenes).map((s) => ({
    id: s.id,
    title: s.title,
    logline: s.logline,
    palette: s.palette,
    sound: s.sound,
  }));
}

/**
 * getMAL() — raw MAL access for advanced use
 */
export async function getMAL() {
  return loadMAL();
}
