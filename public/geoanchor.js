/**
 * GeoAnchor MAL \u2014 Merkaba Asset Library v1.0.0
 * @alignment 8\u219226\u219248:480
 *
 * GeoQode operator interpreter for WebXR / A-Frame 1.4.0 / Three.js
 * Binds .geo resonance operators to GLTF models in VR.
 *
 * Operators:
 *   phi    (\u03A6) \u2014 orbital rotation around lattice node (ACTION @ 528 Hz)
 *   otimes (\u2297) \u2014 handshake glow / dual-verification pulse (PHYSICS @ 852 Hz)
 *   delta  (\u0394) \u2014 compression pulse, breathe shrink/expand (EMOTION @ 741 Hz)
 *   wave   (~)      \u2014 harmonic ripple across surface material (HOLOGRAPHIC @ 72 Hz)
 *
 * Usage:
 *   <a-gltf-model geoanchor="operator: otimes; frequency: 852; latticeNode: 0; proximityRadius: 10">
 *
 * SWARM events (listen on document):
 *   geoanchor:enter  { entity, operator, frequency, latticeNode, distance }
 *   geoanchor:exit   { entity, operator, frequency, latticeNode }
 *   geoanchor:pulse  { entity, operator, frequency }
 *   geoanchor:zoom   { distance }
 *
 * VR SWARM: Multiple geoanchor entities coordinate via the event bus.
 * When one entity triggers \u2297, all otimes entities within swarm range pulse sympathetically.
 *
 * CANONICAL_ARCHITECTURE = "8,26,48:480"
 * COPYRIGHT \u00A9 2026 Brains4Ai / S4Ai. Merkaba Dimensional OS.
 */
"use strict";

(function (global) {
  /* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
     CANONICAL CONSTANTS
  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  var PHI = 1.618033988749895;
  var PSI = 1.4142135623730951;
  var BASE_HZ = 72;
  var GOLDEN_BAND = PHI + PSI; // 3.032
  var CANONICAL_ARCHITECTURE = "8,26,48:480";

  /* Semantic frequency map */
  var FREQ_MAP = {
    ENTITY: 396,
    LOCATION: 417,
    ACTION: 528,
    DIALOGUE: 639,
    EMOTION: 741,
    PHYSICS: 852,
    NARRATIVE: 963,
    HOLOGRAPHIC: 72,
  };

  /* Hex colors per frequency */
  var FREQ_COLORS = {
    396: 0xef4444,
    417: 0xf59e0b,
    528: 0x22c55e,
    639: 0x00d4ff,
    741: 0x8b5cf6,
    852: 0xe879f9,
    963: 0xfbbf24,
    72: 0x60a5fa,
  };

  /* Operator \u2192 semantic type */
  var OP_SEMANTIC = {
    phi: "ACTION",
    otimes: "PHYSICS",
    delta: "EMOTION",
    wave: "HOLOGRAPHIC",
  };

  /* Operator \u2192 default frequency */
  var OP_DEFAULT_HZ = {
    phi: 528,
    otimes: 852,
    delta: 741,
    wave: 72,
  };

  /* Swarm radius: entities within this distance sympathetically pulse together */
  var SWARM_RADIUS = 60;

  /* ── SWARM registry ─────────────────────────────────────────────────────── */
  var _swarm = []; /* all active geoanchor component instances */

  /* ── GeoQode coordinate builder ─────────────────────────────────────────── */
  function buildCoordinate(operator, frequency, latticeNode, domain) {
    var hz = frequency || OP_DEFAULT_HZ[operator] || BASE_HZ;
    var ln = latticeNode === undefined ? 0 : latticeNode;
    return {
      architectureSignature: CANONICAL_ARCHITECTURE,
      semanticType: OP_SEMANTIC[operator] || "ACTION",
      frequency: hz,
      latticeNode: ln,
      harmonicNode: ln * 10,
      phiCoefficient: PHI,
      psiCoefficient: PSI,
      coherence: 1.0,
      domain: domain || "self-evolve",
      source: "geoanchor-mal-v1",
      d48Expansion: "CANONICAL",
      d480Expansion: "FULL_HARMONIC",
      operator: operator,
    };
  }

  /* ── SWARM event bus ────────────────────────────────────────────────────── */
  function swarmEmit(type, detail) {
    try {
      var ev = new CustomEvent("geoanchor:" + type, {
        detail: detail,
        bubbles: true,
      });
      document.dispatchEvent(ev);
    } catch (e) {
      /* silent */
    }
  }

  function freqToColor(hz) {
    return FREQ_COLORS[hz] || FREQ_COLORS[72];
  }

  /* ══════════════════════════════════════════════════════════════════════════
     AFRAME COMPONENT: geoanchor
  ══════════════════════════════════════════════════════════════════════════ */
  AFRAME.registerComponent("geoanchor", {
    schema: {
      operator: { type: "string", default: "phi" },
      frequency: { type: "number", default: 72 },
      latticeNode: { type: "number", default: 0 },
      proximityRadius: { type: "number", default: 8 },
      label: { type: "string", default: "" },
      swarmSync: { type: "boolean", default: true },
    },

    init: function () {
      var self = this;
      var THREE = AFRAME.THREE;
      this.THREE = THREE;

      /* Three.js working vectors */
      this._camPos = new THREE.Vector3();
      this._entPos = new THREE.Vector3();

      /* State */
      this.inProximity = false;
      this.t = 0;
      this.overlays = []; /* Three.js objects we added */
      this.orbitRings = [];
      this.pulseRings = [];
      this._markerAngle = 0;
      this._idleT = 0;
      this._deltaPhase = 0;
      this._wavePhase = 0;
      this._freqKeys = [396, 528, 741, 852, 963, 72, 417, 639];
      this._freqIdx = 0;
      this._freqTimer = 0;
      this._childMeshes = [];
      this._built = false;

      /* Fill default frequency from operator if not specified */
      if (this.data.frequency === 72 && this.data.operator !== "wave") {
        this.data.frequency = OP_DEFAULT_HZ[this.data.operator] || 72;
      }

      /* GeoQode coordinate envelope for this anchor */
      this.geoCoord = buildCoordinate(
        this.data.operator,
        this.data.frequency,
        this.data.latticeNode,
      );

      /* Register in SWARM */
      _swarm.push(this);

      /* Listen for sympathetic SWARM pulses */
      this._onSwarmEnter = function (ev) {
        if (!self.data.swarmSync) return;
        if (ev.detail.entity === self.el) return;
        /* Sympathetic pulse if same operator and within SWARM_RADIUS */
        self.el.object3D.getWorldPosition(self._entPos);
        ev.detail.entity.object3D.getWorldPosition(
          self._camPos,
        ); /* reuse as source pos */
        var d = self._entPos.distanceTo(self._camPos);
        if (d < SWARM_RADIUS && self.data.operator === ev.detail.operator) {
          self._triggerSwarmSympathy();
        }
      };
      document.addEventListener("geoanchor:enter", this._onSwarmEnter);

      /* Build operator overlays after model loads */
      var modelComp = this.el.components["gltf-model"];
      if (modelComp && !this.el.getObject3D("mesh")) {
        this.el.addEventListener("model-loaded", function () {
          setTimeout(function () {
            self._buildOperator();
          }, 50);
        });
      } else {
        setTimeout(function () {
          self._buildOperator();
        }, 120);
      }
    },

    /* ── Build operator-specific Three.js overlays ─────────────────────── */
    _buildOperator: function () {
      if (this._built) return;
      this._built = true;
      var op = this.data.operator;
      if (op === "phi") this._buildPhi();
      if (op === "otimes") this._buildOtimes();
      if (op === "delta") this._buildDelta();
      if (op === "wave") this._buildWave();
    },

    /* ────────────────────────────────────────────────────────────────────
       \u03A6 PHI — orbital rings + marker orbiting at phi-speed
    ──────────────────────────────────────────────────────────────────── */
    _buildPhi: function () {
      var THREE = this.THREE;
      var col = freqToColor(this.data.frequency);

      /* Primary equatorial ring */
      var r1 = new THREE.Mesh(
        new THREE.TorusGeometry(4.2, 0.055, 8, 80),
        new THREE.MeshPhongMaterial({
          color: col,
          emissive: col,
          emissiveIntensity: 1.1,
          transparent: true,
          opacity: 0.48,
        }),
      );
      r1.rotation.x = Math.PI / 2;

      /* Secondary tilted ring (PSI angle) */
      var r2 = new THREE.Mesh(
        new THREE.TorusGeometry(3.6, 0.038, 8, 64),
        new THREE.MeshPhongMaterial({
          color: col,
          emissive: col,
          emissiveIntensity: 0.7,
          transparent: true,
          opacity: 0.3,
        }),
      );
      r2.rotation.x = (Math.PI * PSI) / 4;
      r2.rotation.z = Math.PI / 6;

      /* Orbit marker sphere (small gold sphere riding the ring) */
      var mk = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 14, 14),
        new THREE.MeshPhongMaterial({
          color: 0xfbbf24,
          emissive: 0xfbbf24,
          emissiveIntensity: 2.2,
          transparent: true,
          opacity: 0.95,
        }),
      );
      mk.position.set(4.2, 0, 0);

      /* PHI label glow plane — two faint opposing discs */
      var disc = new THREE.Mesh(
        new THREE.CircleGeometry(5.0, 32),
        new THREE.MeshPhongMaterial({
          color: col,
          emissive: col,
          emissiveIntensity: 0.15,
          transparent: true,
          opacity: 0.05,
          side: THREE.DoubleSide,
        }),
      );
      disc.rotation.x = -Math.PI / 2;

      this.el.object3D.add(r1);
      this.el.object3D.add(r2);
      this.el.object3D.add(mk);
      this.el.object3D.add(disc);

      this.orbitRings = [r1, r2];
      this._marker = mk;
      this.overlays.push(r1, r2, mk, disc);
    },

    /* ────────────────────────────────────────────────────────────────────
       \u2297 OTIMES — handshake glow + expanding dual verification rings
    ──────────────────────────────────────────────────────────────────── */
    _buildOtimes: function () {
      var THREE = this.THREE;

      /* Idle aura (BackSide sphere — glows around entire model) */
      var aura = new THREE.Mesh(
        new THREE.SphereGeometry(5.5, 20, 20),
        new THREE.MeshPhongMaterial({
          color: 0x00d4ff,
          emissive: 0x00d4ff,
          emissiveIntensity: 0.6,
          side: THREE.BackSide,
          transparent: true,
          opacity: 0.0,
        }),
      );
      this._aura = aura;
      this.el.object3D.add(aura);

      /* Dual pulse rings — expand outward on handshake (alpha/omega poles) */
      this.pulseRings = [];
      var pColors = [0x00d4ff, 0xe879f9]; /* alpha cyan, omega magenta */
      for (var i = 0; i < 2; i++) {
        var pr = new THREE.Mesh(
          new THREE.TorusGeometry(1.0, 0.07, 8, 72),
          new THREE.MeshPhongMaterial({
            color: pColors[i],
            emissive: pColors[i],
            emissiveIntensity: 2.5,
            transparent: true,
            opacity: 0.0,
          }),
        );
        pr.rotation.x = i === 0 ? Math.PI / 2 : 0;
        pr._active = false;
        pr._t = 0;
        this.el.object3D.add(pr);
        this.pulseRings.push(pr);
      }

      /* Secondary standing ring (always visible, slow idle pulse) */
      var standRing = new THREE.Mesh(
        new THREE.TorusGeometry(3.0, 0.042, 8, 56),
        new THREE.MeshPhongMaterial({
          color: 0x00d4ff,
          emissive: 0x00d4ff,
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.18,
        }),
      );
      standRing.rotation.x = Math.PI / 2;
      this._standRing = standRing;
      this.el.object3D.add(standRing);

      this.overlays.push(
        aura,
        this.pulseRings[0],
        this.pulseRings[1],
        standRing,
      );
    },

    /* ────────────────────────────────────────────────────────────────────
       \u0394 DELTA — compression breathe + burst on proximity
    ──────────────────────────────────────────────────────────────────── */
    _buildDelta: function () {
      var THREE = this.THREE;
      var col = freqToColor(this.data.frequency);

      /* Compression aura sphere */
      var aura = new THREE.Mesh(
        new THREE.SphereGeometry(3.2, 22, 22),
        new THREE.MeshPhongMaterial({
          color: col,
          emissive: col,
          emissiveIntensity: 0.5,
          side: THREE.BackSide,
          transparent: true,
          opacity: 0.08,
        }),
      );
      this._deltaAura = aura;
      this._deltaPhase = 0;
      this.el.object3D.add(aura);

      /* Compression node (small core indicator) */
      var node = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.55, 0),
        new THREE.MeshPhongMaterial({
          color: col,
          emissive: col,
          emissiveIntensity: 1.8,
          transparent: true,
          opacity: 0.82,
        }),
      );
      node.position.set(0, 3.5, 0);
      this._deltaNode = node;
      this.el.object3D.add(node);

      /* Store base scale of the entity so we can breathe it */
      this._baseScale = this.el.object3D.scale.clone();

      this.overlays.push(aura, node);
    },

    /* ────────────────────────────────────────────────────────────────────
       ~WAVE — harmonic ripple, color cycles through frequency spectrum
    ──────────────────────────────────────────────────────────────────── */
    _buildWave: function () {
      var THREE = this.THREE;
      var col = freqToColor(this.data.frequency);

      /* Outer wireframe shell — ripples */
      var shell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(9.0, 2),
        new THREE.MeshPhongMaterial({
          color: 0x00d4ff,
          emissive: 0x00d4ff,
          emissiveIntensity: 0.05,
          wireframe: true,
          transparent: true,
          opacity: 0.03,
        }),
      );
      this._waveShell = shell;
      this._wavePhase = 0;
      /* Cycle only neon blues and lime greens */
      this._freqKeys = [528, 72, 639, 72, 528, 639, 528, 72];
      this.el.object3D.add(shell);

      /* Harmonic ring that pulses frequency */
      var hRing = new THREE.Mesh(
        new THREE.TorusGeometry(7.5, 0.07, 8, 60),
        new THREE.MeshPhongMaterial({
          color: 0x39ff14,
          emissive: 0x39ff14,
          emissiveIntensity: 0.08,
          transparent: true,
          opacity: 0.04,
        }),
      );
      hRing.rotation.y = Math.PI / 4;
      this._hRing = hRing;
      this.el.object3D.add(hRing);

      this.overlays.push(shell, hRing);

      /* Gather child meshes for emissive modulation */
      var self = this;
      this.el.object3D.traverse(function (o) {
        if (o.isMesh && self.overlays.indexOf(o) === -1) {
          /* Clone so we don't modify shared materials */
          if (o.material && !o.material._geoCloned) {
            o.material = o.material.clone();
            o.material._geoCloned = true;
          }
          if (o.material) {
            o._origEmissive = o.material.emissive
              ? o.material.emissive.clone()
              : new THREE.Color(0);
            o._origEmissiveIntensity = o.material.emissiveIntensity || 0;
            self._childMeshes.push(o);
          }
        }
      });
    },

    /* ══════════════════════════════════════════════════════════════════════
       TICK — runs every frame
    ══════════════════════════════════════════════════════════════════════ */
    tick: function (time, delta) {
      this.t = time * 0.001;
      var dt = Math.min((delta || 16) * 0.001, 0.1); /* cap at 100ms */
      var sceneEl = this.el.sceneEl;
      if (!sceneEl || !sceneEl.camera) return;

      /* Proximity check */
      sceneEl.camera.getWorldPosition(this._camPos);
      this.el.object3D.getWorldPosition(this._entPos);
      var dist = this._camPos.distanceTo(this._entPos);
      var wasIn = this.inProximity;
      this.inProximity = dist <= this.data.proximityRadius;

      if (!wasIn && this.inProximity) this._onProximityEnter(dist);
      if (wasIn && !this.inProximity) this._onProximityExit();

      /* Tick operator */
      var op = this.data.operator;
      if (op === "phi") this._tickPhi(dt);
      if (op === "otimes") this._tickOtimes(dt);
      if (op === "delta") this._tickDelta(dt);
      if (op === "wave") this._tickWave(dt);
    },

    /* ── phi tick ──────────────────────────────────────────────────────── */
    _tickPhi: function (dt) {
      if (!this.orbitRings.length) return;
      var sp = this.inProximity ? PHI * 2.6 : 1.0;

      this.orbitRings[0].rotation.z += dt * 0.52 * sp;
      this.orbitRings[1].rotation.z -= dt * 0.36 * sp;

      var op0 = 0.3 + Math.sin(this.t * 1.7) * 0.17;
      var op1 = 0.18 + Math.sin(this.t * 2.3 + 1) * 0.1;
      this.orbitRings[0].material.opacity = this.inProximity ? op0 + 0.28 : op0;
      this.orbitRings[1].material.opacity = this.inProximity ? op1 + 0.18 : op1;
      this.orbitRings[0].material.emissiveIntensity = this.inProximity
        ? 2.2
        : 1.1;

      /* Marker rides the primary ring */
      if (this._marker) {
        this._markerAngle += dt * 0.85 * sp * PHI;
        this._marker.position.set(
          4.2 * Math.cos(this._markerAngle),
          0,
          4.2 * Math.sin(this._markerAngle),
        );
        this._marker.material.emissiveIntensity = this.inProximity ? 3.8 : 2.2;
        var ms = 0.22 + Math.sin(this.t * 4.5) * 0.06;
        this._marker.scale.setScalar(this.inProximity ? ms * 1.6 : ms);
      }
    },

    /* ── otimes tick ───────────────────────────────────────────────────── */
    _tickOtimes: function (dt) {
      this._idleT += dt;

      /* Idle aura breath */
      if (this._aura) {
        if (!this.inProximity) {
          this._aura.material.opacity =
            0.03 + Math.sin(this._idleT * 0.7) * 0.025;
        } else {
          this._aura.material.opacity =
            0.38 + Math.sin(this._idleT * 2.8) * 0.18;
        }
      }

      /* Standing ring idle rotation + pulse */
      if (this._standRing) {
        this._standRing.rotation.z += dt * (this.inProximity ? 0.9 : 0.22);
        this._standRing.material.opacity = this.inProximity
          ? 0.55 + Math.sin(this._idleT * 3.2) * 0.3
          : 0.12 + Math.sin(this._idleT * 1.1) * 0.06;
        this._standRing.material.emissiveIntensity = this.inProximity
          ? 2.8
          : 0.8;
      }

      /* Expand active pulse rings */
      for (var i = 0; i < this.pulseRings.length; i++) {
        var pr = this.pulseRings[i];
        if (!pr._active) continue;
        pr._t += dt * 1.4;
        var sc = 1.0 + pr._t * 4.5;
        pr.scale.set(sc, sc, sc);
        pr.material.opacity = Math.max(0, 0.9 - pr._t * 0.95);
        if (pr._t >= 0.95) {
          pr._active = false;
          pr.material.opacity = 0;
        }
      }
    },

    /* ── delta tick ────────────────────────────────────────────────────── */
    _tickDelta: function (dt) {
      if (!this._deltaAura) return;
      this._deltaPhase += dt * (this.inProximity ? 2.4 : 0.9);

      /* Aura breathe */
      var breath =
        0.06 + Math.abs(Math.sin(this._deltaPhase * PHI * 0.5)) * 0.1;
      this._deltaAura.material.opacity = this.inProximity
        ? breath * 2.2
        : breath;
      var as = 1.0 + Math.sin(this._deltaPhase * 0.7) * 0.14;
      this._deltaAura.scale.setScalar(as);
      this._deltaAura.material.emissiveIntensity = this.inProximity ? 1.2 : 0.5;

      /* Indicator node bobs */
      if (this._deltaNode) {
        this._deltaNode.rotation.y += dt * 1.8;
        this._deltaNode.rotation.x += dt * 0.9;
        var ns = 0.55 + Math.sin(this._deltaPhase * 2.1) * 0.2;
        this._deltaNode.scale.setScalar(this.inProximity ? ns * 1.5 : ns);
        this._deltaNode.material.emissiveIntensity = this.inProximity
          ? 3.5
          : 1.8;
      }

      /* Breathe the entire entity scale when in proximity */
      if (this.inProximity && this._baseScale) {
        var bf = 1.0 + Math.sin(this._deltaPhase * 1.5) * 0.035;
        this.el.object3D.scale.set(
          this._baseScale.x * bf,
          this._baseScale.y * bf,
          this._baseScale.z * bf,
        );
      } else if (!this.inProximity && this._baseScale) {
        /* Restore base scale smoothly */
        this.el.object3D.scale.lerp(this._baseScale, dt * 3.0);
      }
    },

    /* ── wave tick ─────────────────────────────────────────────────────── */
    _tickWave: function (dt) {
      if (!this._waveShell) return;
      this._wavePhase += dt * (this.inProximity ? 2.8 : 1.2);

      /* Cycle frequency color */
      this._freqTimer += dt;
      var cycleTime = this.inProximity ? 0.55 : 2.0;
      if (this._freqTimer >= cycleTime) {
        this._freqTimer = 0;
        this._freqIdx = (this._freqIdx + 1) % this._freqKeys.length;
        var nc = freqToColor(this._freqKeys[this._freqIdx]);
        this._waveShell.material.color.setHex(nc);
        this._waveShell.material.emissive.setHex(nc);
        if (this._hRing) {
          this._hRing.material.color.setHex(nc);
          this._hRing.material.emissive.setHex(nc);
        }
      }

      /* Shell ripple */
      var ws =
        1.0 +
        Math.sin(this._wavePhase * 2.0) * (this.inProximity ? 0.16 : 0.055);
      this._waveShell.scale.setScalar(ws);
      this._waveShell.material.opacity =
        0.02 +
        Math.abs(Math.sin(this._wavePhase)) * (this.inProximity ? 0.18 : 0.02);
      this._waveShell.material.emissiveIntensity =
        0.04 +
        Math.abs(Math.sin(this._wavePhase * 0.7)) *
          (this.inProximity ? 0.55 : 0.05);
      this._waveShell.rotation.y += dt * (this.inProximity ? 0.7 : 0.22);
      this._waveShell.rotation.x += dt * 0.14;

      /* Harmonic ring rotate */
      if (this._hRing) {
        this._hRing.rotation.z += dt * (this.inProximity ? 1.4 : 0.45);
        this._hRing.material.opacity =
          0.03 +
          Math.abs(Math.sin(this._wavePhase * 1.8)) *
            (this.inProximity ? 0.15 : 0.03);
        this._hRing.material.emissiveIntensity =
          0.06 +
          Math.abs(Math.sin(this._wavePhase * 0.9)) *
            (this.inProximity ? 0.65 : 0.06);
      }

      /* Modulate child mesh emissive when in proximity */
      if (this._childMeshes.length) {
        var ci = this.inProximity;
        var ei = ci ? 0.7 + Math.sin(this._wavePhase * 3.5) * 0.55 : 0;
        var ec = ci ? freqToColor(this._freqKeys[this._freqIdx]) : null;
        for (var i = 0; i < this._childMeshes.length; i++) {
          var m = this._childMeshes[i];
          if (!m.material || !m.material.emissive) continue;
          if (ci && ec !== null) {
            m.material.emissive.setHex(ec);
            m.material.emissiveIntensity = ei;
          } else if (!ci) {
            m.material.emissive.copy(m._origEmissive);
            m.material.emissiveIntensity = m._origEmissiveIntensity;
          }
        }
      }
    },

    /* ══════════════════════════════════════════════════════════════════════
       PROXIMITY EVENTS
    ══════════════════════════════════════════════════════════════════════ */
    _onProximityEnter: function (dist) {
      swarmEmit("enter", {
        entity: this.el,
        operator: this.data.operator,
        frequency: this.data.frequency,
        latticeNode: this.data.latticeNode,
        distance: dist,
        geoCoord: this.geoCoord,
        label: this.data.label,
      });

      /* Operator entry effects */
      if (this.data.operator === "otimes") this._triggerHandshake();
      if (this.data.operator === "delta") this._triggerCompressionBurst();
      if (this.data.operator === "phi") this._triggerPhiBoost();

      /* Trigger audio pulse in cosmos-infinite */
      if (typeof window.firePulse === "function") window.firePulse();

      /* Update scale HUD if present */
      if (typeof window._updateScaleHUD === "function") {
        window._updateScaleHUD(
          null,
          this.data.label || this.data.operator.toUpperCase(),
        );
      }
    },

    _onProximityExit: function () {
      swarmEmit("exit", {
        entity: this.el,
        operator: this.data.operator,
        frequency: this.data.frequency,
        latticeNode: this.data.latticeNode,
      });

      /* Restore wave child emissives */
      if (this.data.operator === "wave") {
        for (var i = 0; i < this._childMeshes.length; i++) {
          var m = this._childMeshes[i];
          if (m._origEmissive && m.material && m.material.emissive) {
            m.material.emissive.copy(m._origEmissive);
            m.material.emissiveIntensity = m._origEmissiveIntensity;
          }
        }
      }

      /* Restore delta scale */
      if (this.data.operator === "delta" && this._baseScale) {
        this.el.object3D.scale.copy(this._baseScale);
      }
    },

    /* ── Operator trigger methods ────────────────────────────────────────── */
    _triggerHandshake: function () {
      /* Fire alpha (cyan) ring first, then omega (magenta) ring offset */
      for (var i = 0; i < this.pulseRings.length; i++) {
        (function (ring, delay) {
          setTimeout(function () {
            ring._active = true;
            ring._t = 0;
            ring.scale.set(1, 1, 1);
            ring.material.opacity = 0.92;
          }, delay);
        })(this.pulseRings[i], i * 320);
      }
      if (this._aura) {
        this._aura.material.opacity = 0.7;
        this._aura.material.emissiveIntensity = 3.0;
      }
    },

    _triggerCompressionBurst: function () {
      if (!this._deltaAura) return;
      var self = this;
      var phase = 0;
      var burst = setInterval(function () {
        phase += 0.18;
        var sc = 1.0 + Math.sin(phase * Math.PI * 5.0) * 0.45;
        if (self._deltaAura) self._deltaAura.scale.setScalar(sc);
        if (phase >= 1.0) clearInterval(burst);
      }, 28);
    },

    _triggerPhiBoost: function () {
      /* Temporary emissive boost on orbit rings */
      if (!this.orbitRings.length) return;
      var self = this;
      var rings = this.orbitRings;
      rings.forEach(function (r) {
        r.material.emissiveIntensity = 4.0;
      });
      setTimeout(function () {
        if (self.orbitRings.length)
          self.orbitRings.forEach(function (r) {
            r.material.emissiveIntensity = 1.1;
          });
      }, 900);
    },

    /* Sympathetic pulse from SWARM broadcast */
    _triggerSwarmSympathy: function () {
      if (this.data.operator === "otimes") {
        /* Half-intensity handshake */
        for (var i = 0; i < this.pulseRings.length; i++) {
          var pr = this.pulseRings[i];
          pr._active = true;
          pr._t = 0.3; /* start mid-expansion */
          pr.scale.set(2, 2, 2);
          pr.material.opacity = 0.45;
        }
      }
    },

    remove: function () {
      for (var i = 0; i < this.overlays.length; i++) {
        this.el.object3D.remove(this.overlays[i]);
      }
      document.removeEventListener("geoanchor:enter", this._onSwarmEnter);
      var idx = _swarm.indexOf(this);
      if (idx !== -1) _swarm.splice(idx, 1);
    },
  });

  /* ══════════════════════════════════════════════════════════════════════════
     PUBLIC NAMESPACE — window.GeoAnchor
  ══════════════════════════════════════════════════════════════════════════ */
  global.GeoAnchor = {
    version: "1.0.0",
    PHI: PHI,
    PSI: PSI,
    BASE_HZ: BASE_HZ,
    GOLDEN_BAND: GOLDEN_BAND,
    CANONICAL_ARCHITECTURE: CANONICAL_ARCHITECTURE,
    FREQ_MAP: FREQ_MAP,
    OPERATORS: ["phi", "otimes", "delta", "wave"],

    /** Build a GeoQode coordinate envelope for any operator/frequency */
    buildCoordinate: buildCoordinate,

    /** All active geoanchor component instances (the VR SWARM) */
    getSwarm: function () {
      return _swarm.slice();
    },

    /** Notify zoom level to all SWARM entities */
    notifyZoom: function (dist) {
      swarmEmit("zoom", { distance: dist });
    },

    /** Manually trigger a pulse on all entities with matching operator */
    pulseSector: function (operator) {
      for (var i = 0; i < _swarm.length; i++) {
        if (_swarm[i].data.operator === operator) {
          _swarm[i]._onProximityEnter(0);
        }
      }
    },

    /** Listen for proximity enter events */
    onEnter: function (fn) {
      document.addEventListener("geoanchor:enter", fn);
      return GeoAnchor;
    },
    onExit: function (fn) {
      document.addEventListener("geoanchor:exit", fn);
      return GeoAnchor;
    },
    onZoom: function (fn) {
      document.addEventListener("geoanchor:zoom", fn);
      return GeoAnchor;
    },
  };

  /* Freeze canonical signature assertion */
  if (CANONICAL_ARCHITECTURE !== "8,26,48:480") {
    throw new Error(
      "[GeoAnchor] Architecture invariant violated: " + CANONICAL_ARCHITECTURE,
    );
  }
})(window);
