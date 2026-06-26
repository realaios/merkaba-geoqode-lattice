/**
 * merkaba-pilot-system.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal A-Frame 6DOF spaceflight system for any Merkaba / universe scene.
 *
 * WHAT'S INSIDE
 * ─────────────
 *  MerkabaFLM                   Neural-network flight learning model (pure JS).
 *  cosmos-pilot-controls        A-Frame component: keyboard 6DOF + VR-safe thrust.
 *  merkaba-pilot-agent          A-Frame component: R2-D2 autopilot using FLM.
 *  initMerkabaMobileNav(opts)   Sets up dual-joystick mobile controls.
 *
 * X-WING CONTROL MODEL
 * ─────────────────────
 *  • Pilot visor / VR HMD  — free look only, NEVER steers the craft.
 *  • Throttle (left stick Y) — thrust along CRAFT NOSE (rig -Z), not head look.
 *  • Rudder  (left stick X)  — yaw around CRAFT local up.
 *  • Stick Y (right stick Y) — pitch around CRAFT local right.
 *  • Stick X (right stick X) — roll (feeds _joyRollDelta bridge).
 *  • FIRE                    — raycasts along CRAFT NOSE, not camera look.
 *
 * QUICK START
 * ───────────
 *  1. Include A-Frame in your page.
 *  2. <script src="merkaba-pilot-system.js"></script>
 *  3. Add components to your scene:
 *
 *     <a-entity id="cameraRig" position="0 0 0">
 *       <a-camera look-controls></a-camera>
 *     </a-entity>
 *     <a-entity cosmos-pilot-controls merkaba-pilot-agent></a-entity>
 *
 *  4. (Optional) Mobile joysticks:
 *     Create two divs with IDs "leftJoy" and "rightJoy" (and optionally "fire-btn"),
 *     then call: initMerkabaMobileNav();
 *
 * API
 * ───
 *  window.MERKABA_FLM                 — FLM instance (save/load/reset/forward)
 *  window._pilotAgentActive           — toggle autopilot (P key also toggles)
 *  window._joyRollDelta               — roll bridge (write from any input source)
 *  window._inv_thrust/yaw/pitch/roll  — invert flags for each axis
 *
 * @alignment 8→26→48:480  @frequency 963  @domain pilot-system
 * @version 1.0.0  @author AIOS / Brains4Ai
 */
(function (root) {
  "use strict";

  /* ══════════════════════════════════════════════════════════════════════════
     MERKABA FLIGHT LEARNING MODEL
     2-layer tanh network: 12 → H → 4
     Inputs:  [pos/D(3), craftFwd(3), toMerkaba(3), proximity, rollSin, distNorm]
     Outputs: [thrust, yaw, pitch, roll] ∈ [-1, 1]
     Training: REINFORCE policy gradient with advantage normalisation.
     Persistence: localStorage keys flm_W1/W2/b1/b2.
  ══════════════════════════════════════════════════════════════════════════ */
  function MerkabaFLM(hiddenSize) {
    var IN = 12,
      H = hiddenSize || 24,
      OUT = 4;
    var self = this;
    this.IN = IN;
    this.H = H;
    this.OUT = OUT;

    function randn() {
      var u = Math.random() + 1e-10;
      return (
        Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random())
      );
    }
    function initW(n, fan) {
      var a = new Float32Array(n),
        s = Math.sqrt(2.0 / fan);
      for (var i = 0; i < n; i++) a[i] = randn() * s;
      return a;
    }
    this.W1 = initW(IN * H, IN);
    this.b1 = new Float32Array(H);
    this.W2 = initW(H * OUT, H);
    this.b2 = new Float32Array(OUT);

    /* Forward pass — returns Float32Array[4] of actions */
    this.forward = function (obs) {
      var h = new Float32Array(H);
      for (var j = 0; j < H; j++) {
        var s = self.b1[j];
        for (var i = 0; i < IN; i++) s += obs[i] * self.W1[i * H + j];
        h[j] = Math.tanh(s);
      }
      var out = new Float32Array(OUT);
      for (var k = 0; k < OUT; k++) {
        var s2 = self.b2[k];
        for (var j2 = 0; j2 < H; j2++) s2 += h[j2] * self.W2[j2 * OUT + k];
        out[k] = Math.tanh(s2);
      }
      self._lastH = h;
      return out;
    };

    /* REINFORCE policy gradient update over a trajectory */
    this.trainREINFORCE = function (traj, lr, gamma) {
      if (!traj.length) return;
      var G = new Array(traj.length);
      G[traj.length - 1] = traj[traj.length - 1].r;
      for (var t = traj.length - 2; t >= 0; t--)
        G[t] = traj[t].r + gamma * G[t + 1];
      var mu = 0;
      for (var i = 0; i < G.length; i++) mu += G[i];
      mu /= G.length;
      var variance = 1e-8;
      for (var i = 0; i < G.length; i++) variance += (G[i] - mu) * (G[i] - mu);
      var std = Math.sqrt(variance / G.length);
      var sigma = 0.4;

      for (var t = 0; t < traj.length; t++) {
        var adv = (G[t] - mu) / std;
        var obs = traj[t].o,
          act = traj[t].a;
        /* Recompute forward */
        var h = new Float32Array(H);
        for (var j = 0; j < H; j++) {
          var s = self.b1[j];
          for (var i = 0; i < IN; i++) s += obs[i] * self.W1[i * H + j];
          h[j] = Math.tanh(s);
        }
        var out = new Float32Array(OUT);
        for (var k = 0; k < OUT; k++) {
          var s2 = self.b2[k];
          for (var j2 = 0; j2 < H; j2++) s2 += h[j2] * self.W2[j2 * OUT + k];
          out[k] = Math.tanh(s2);
        }
        /* Gaussian log-pi gradient × advantage */
        var dOut = new Float32Array(OUT);
        for (var k = 0; k < OUT; k++)
          dOut[k] =
            ((act[k] - out[k]) / (sigma * sigma)) * (1 - out[k] * out[k]);
        /* Update W2, b2 */
        for (var k = 0; k < OUT; k++) {
          var g = lr * adv * dOut[k];
          for (var j2 = 0; j2 < H; j2++) self.W2[j2 * OUT + k] += g * h[j2];
          self.b2[k] += g;
        }
        /* Hidden gradients → W1, b1 */
        var dH = new Float32Array(H);
        for (var j = 0; j < H; j++) {
          var hs = 0;
          for (var k = 0; k < OUT; k++) hs += dOut[k] * self.W2[j * OUT + k];
          dH[j] = hs * (1 - h[j] * h[j]);
        }
        for (var j = 0; j < H; j++) {
          var g2 = lr * adv * dH[j];
          for (var i = 0; i < IN; i++) self.W1[i * H + j] += g2 * obs[i];
          self.b1[j] += g2;
        }
      }
    };

    this.save = function () {
      try {
        localStorage.setItem("flm_W1", JSON.stringify(Array.from(self.W1)));
        localStorage.setItem("flm_W2", JSON.stringify(Array.from(self.W2)));
        localStorage.setItem("flm_b1", JSON.stringify(Array.from(self.b1)));
        localStorage.setItem("flm_b2", JSON.stringify(Array.from(self.b2)));
      } catch (e) {}
    };
    this.load = function () {
      try {
        var W1 = JSON.parse(localStorage.getItem("flm_W1"));
        var W2 = JSON.parse(localStorage.getItem("flm_W2"));
        var b1 = JSON.parse(localStorage.getItem("flm_b1"));
        var b2 = JSON.parse(localStorage.getItem("flm_b2"));
        if (W1 && W1.length === self.W1.length) self.W1 = new Float32Array(W1);
        if (W2 && W2.length === self.W2.length) self.W2 = new Float32Array(W2);
        if (b1 && b1.length === self.b1.length) self.b1 = new Float32Array(b1);
        if (b2 && b2.length === self.b2.length) self.b2 = new Float32Array(b2);
      } catch (e) {}
    };
    this.reset = function () {
      self.W1 = initW(IN * H, IN);
      self.b1 = new Float32Array(H);
      self.W2 = initW(H * OUT, H);
      self.b2 = new Float32Array(OUT);
      try {
        ["flm_W1", "flm_W2", "flm_b1", "flm_b2"].forEach(function (k) {
          localStorage.removeItem(k);
        });
      } catch (e) {}
    };
  }

  root.MerkabaFLM = MerkabaFLM;

  /* ══════════════════════════════════════════════════════════════════════════
     COSMOS-PILOT-CONTROLS — A-Frame component
     Keyboard 6DOF spacecraft controls. VR-safe: thrust + yaw/pitch axes all
     derived from the RIG quaternion, never the camera/HMD look direction.

     Keys:  W/S  — accelerate/decelerate   |  A/D   — yaw (craft local up)
            Q/E  — roll left/right          |  R/F   — ascend/descend
            Shift — HYPERBOOST (4.5×)       |  Space  — hard brake
  ══════════════════════════════════════════════════════════════════════════ */
  AFRAME.registerComponent("cosmos-pilot-controls", {
    init: function () {
      var camEl = document.querySelector("a-camera");
      if (camEl) camEl.setAttribute("wasd-controls", "enabled: false");
      this._keys = {};
      this._speed = 0;
      this._roll = 0;
      root._cosmosPilotBoost = false;
      var self = this;
      this._kd = function (e) {
        self._keys[e.code] = true;
      };
      this._ku = function (e) {
        self._keys[e.code] = false;
      };
      window.addEventListener("keydown", this._kd);
      window.addEventListener("keyup", this._ku);
    },
    remove: function () {
      window.removeEventListener("keydown", this._kd);
      window.removeEventListener("keyup", this._ku);
    },
    tick: function (time, delta) {
      var dt = Math.min(delta, 200) * 0.001;
      var K = this._keys;
      var THREE = AFRAME.THREE;
      var rigEl = document.getElementById("cameraRig");
      var camEl = document.querySelector("a-camera");
      if (!rigEl || !camEl) return;
      var rigObj = rigEl.object3D;
      var camObj = camEl.object3D;

      var uttEl = document.querySelector("[universe-tour]");
      var uttActive =
        uttEl &&
        uttEl.components["universe-tour"] &&
        uttEl.components["universe-tour"]._active;

      var boost = !!(K["ShiftLeft"] || K["ShiftRight"]);
      root._cosmosPilotBoost = boost;

      var BASE = 1800,
        LIMIT = BASE * (boost ? 4.5 : 1),
        BACK_LIM = BASE * 0.35;
      if (!uttActive) {
        if (K["KeyW"] || K["ArrowUp"]) this._speed += LIMIT * 3.0 * dt;
        else if (K["KeyS"] || K["ArrowDown"]) this._speed -= BASE * 2.0 * dt;
        else if (K["Space"]) this._speed *= Math.max(0, 1 - dt * 9);
        else this._speed *= Math.max(0, 1 - dt * 0.55);
      } else {
        this._speed *= Math.max(0, 1 - dt * 2.5);
      }
      this._speed = Math.max(-BACK_LIM, Math.min(LIMIT, this._speed));

      /* Thrust along CRAFT NOSE (rig -Z). Pilot look never steers. */
      if (Math.abs(this._speed) > 0.5) {
        var fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(
          rigObj.getWorldQuaternion(new THREE.Quaternion()),
        );
        rigObj.position.addScaledVector(fwd, this._speed * dt);
      }

      /* Yaw (A/D) — craft local up */
      if (!uttActive) {
        var bankBoost = 1.0 + Math.abs(Math.sin(this._roll)) * 1.3;
        var speedFactor = Math.min(1.0, Math.abs(this._speed) / BASE);
        var yawRate = 0.85 * bankBoost * (0.25 + speedFactor * 0.75);
        var craftUp = new THREE.Vector3(0, 1, 0)
          .applyQuaternion(rigObj.getWorldQuaternion(new THREE.Quaternion()))
          .normalize();
        if (K["KeyA"] || K["ArrowLeft"])
          rigObj.rotateOnWorldAxis(craftUp, yawRate * dt);
        if (K["KeyD"] || K["ArrowRight"])
          rigObj.rotateOnWorldAxis(craftUp, -yawRate * dt);
      }

      /* Roll (Q/E) + joystick bridge */
      if (!uttActive) {
        var rollRate = 1.5;
        if (K["KeyQ"]) this._roll += rollRate * dt;
        if (K["KeyE"]) this._roll -= rollRate * dt;
        if (root._joyRollDelta) {
          this._roll += root._joyRollDelta;
          root._joyRollDelta = 0;
        }
      } else {
        this._roll *= Math.max(0, 1 - dt * 2);
      }
      camObj.rotation.z = this._roll;

      /* Altitude (R/F) */
      if (!uttActive) {
        var altSpeed = (boost ? BASE * 2.5 : BASE) * dt;
        if (K["KeyR"] || K["PageUp"]) rigObj.position.y += altSpeed;
        if (K["KeyF"] || K["PageDown"]) rigObj.position.y -= altSpeed;
      }
    },
  });

  /* ══════════════════════════════════════════════════════════════════════════
     MERKABA PILOT AGENT — A-Frame component
     Autonomous R2-D2 autopilot: navigates toward Merkaba beacons, trains FLM
     via REINFORCE, auto-saves weights to localStorage every 200 steps.
     Toggle: P key  |  window._pilotAgentActive = true/false
  ══════════════════════════════════════════════════════════════════════════ */
  AFRAME.registerComponent("merkaba-pilot-agent", {
    init: function () {
      this.flm = new MerkabaFLM(24);
      this.flm.load();
      root.MERKABA_FLM = this.flm;
      root._pilotAgentActive = false;
      this._traj = [];
      this._steps = 0;
      this._trainCount = 0;
      this._prevDist = null;
      this._merkabas = [];
      this._cacheStep = -9999;
      var self = this;
      window.addEventListener("keydown", function (e) {
        if (e.code === "KeyP" && !e.repeat) {
          root._pilotAgentActive = !root._pilotAgentActive;
          self._traj = [];
          self._steps = 0;
          self._prevDist = null;
          self._toast(
            root._pilotAgentActive
              ? "R2 · AUTOPILOT ENGAGED"
              : "R2 · MANUAL CONTROL",
          );
        }
      });
    },

    tick: function (time, delta) {
      if (!root._pilotAgentActive) return;
      var dt = Math.min(delta, 200) * 0.001;
      var THREE = AFRAME.THREE;
      var rig = document.getElementById("cameraRig");
      if (!rig || !rig.object3D) return;
      var rigO = rig.object3D;

      var obs = this._observe(rigO, THREE);
      var action = this.flm.forward(obs);
      this._applyAction(action, rigO, THREE, dt);
      var reward = this._reward(rigO, THREE);
      this._traj.push({ o: Array.from(obs), a: Array.from(action), r: reward });
      this._steps++;

      if (this._steps >= 200) {
        this.flm.trainREINFORCE(this._traj, 0.0008, 0.97);
        this._traj = [];
        this._steps = 0;
        this.flm.save();
        this._toast("R2 · FLM UPDATE #" + ++this._trainCount);
      }
    },

    _observe: function (rigO, THREE) {
      var pos = rigO.position,
        D = 48000;
      var fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(rigO.quaternion);
      var mPos = this._nearestMerkaba(pos, THREE);
      var toM = new THREE.Vector3().subVectors(mPos, pos);
      var distToM = toM.length();
      toM.normalize();
      return [
        pos.x / D,
        pos.y / D,
        pos.z / D,
        fwd.x,
        fwd.y,
        fwd.z,
        toM.x,
        toM.y,
        toM.z,
        Math.max(0, 1 - distToM / (D * 0.3)),
        Math.sin(rigO.rotation.z),
        Math.min(1, pos.length() / D),
      ];
    },

    _nearestMerkaba: function (pos, THREE) {
      if (this._steps - this._cacheStep > 200 || !this._merkabas.length) {
        this._cacheStep = this._steps;
        this._merkabas = [];
        var sc = document.querySelector("a-scene"),
          arr = this._merkabas;
        if (sc) {
          sc.object3D.traverse(function (o) {
            if (o.el && o.el.components && o.el.components["merkaba-core"]) {
              var p = new THREE.Vector3();
              o.el.object3D.getWorldPosition(p);
              arr.push(p.clone());
            }
          });
        }
        if (!arr.length) arr.push(new THREE.Vector3(0, 0, 0));
      }
      var best = this._merkabas[0],
        bestD = pos.distanceTo(best);
      for (var i = 1; i < this._merkabas.length; i++) {
        var d = pos.distanceTo(this._merkabas[i]);
        if (d < bestD) {
          bestD = d;
          best = this._merkabas[i];
        }
      }
      return best;
    },

    _applyAction: function (action, rigO, THREE, dt) {
      var dist = rigO.position.length();
      var SPEED =
        dist >= 16000 ? 400 : dist >= 8000 ? 200 : dist >= 3000 ? 80 : 20;
      var fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(rigO.quaternion);
      rigO.position.addScaledVector(fwd, action[0] * SPEED * dt * 60);
      if (Math.abs(action[1]) > 0.04) {
        var up = new THREE.Vector3(0, 1, 0)
          .applyQuaternion(rigO.getWorldQuaternion(new THREE.Quaternion()))
          .normalize();
        rigO.rotateOnWorldAxis(up, action[1] * 0.032);
      }
      if (Math.abs(action[2]) > 0.04) {
        var rgt = new THREE.Vector3(1, 0, 0)
          .applyQuaternion(rigO.getWorldQuaternion(new THREE.Quaternion()))
          .normalize();
        rigO.rotateOnWorldAxis(rgt, action[2] * 0.064);
      }
      if (Math.abs(action[3]) > 0.04)
        root._joyRollDelta = (root._joyRollDelta || 0) + action[3] * 0.08;
      if (typeof root._updateScaleHUD === "function")
        root._updateScaleHUD(rigO.position.length(), null);
    },

    _reward: function (rigO, THREE) {
      var pos = rigO.position;
      if (pos.length() > 48000 * 0.92) return -2.0;
      var mPos = this._nearestMerkaba(pos, THREE);
      var d = pos.distanceTo(mPos);
      var progress = this._prevDist !== null ? (this._prevDist - d) * 0.005 : 0;
      this._prevDist = d;
      return (
        progress + Math.max(0, 1 - d / 500) * 0.1 + (d < 20 ? 5.0 : 0) - 0.002
      );
    },

    _toast: function (msg) {
      var el = document.getElementById("agent-status");
      if (!el) return;
      el.textContent = msg;
      el.style.opacity = "1";
      clearTimeout(this._timer);
      this._timer = setTimeout(function () {
        if (el) el.style.opacity = "0";
      }, 2400);
    },
  });

  /* ══════════════════════════════════════════════════════════════════════════
     initMerkabaMobileNav(opts)
     Sets up dual-joystick touch controls. Call after DOM is ready.

     opts = {
       rigId:        "cameraRig",   // ID of the rig entity
       leftJoyId:    "leftJoy",     // ID of left joystick container
       rightJoyId:   "rightJoy",    // ID of right joystick container
       fireBtnId:    "fire-btn",    // ID of fire button (optional)
       maxDist:      48000,         // universe boundary
       minDist:      2,             // minimum approach distance
     }

     Joystick container elements must have CSS: position:absolute or fixed,
     and a known width/height so touch offsets can be normalised.

     The fire button, when tapped, dispatches window event "cosmos-fire".
  ══════════════════════════════════════════════════════════════════════════ */
  function initMerkabaMobileNav(opts) {
    opts = opts || {};
    var RIG_ID = opts.rigId || "cameraRig";
    var LJ_ID = opts.leftJoyId || "leftJoy";
    var RJ_ID = opts.rightJoyId || "rightJoy";
    var FIRE_ID = opts.fireBtnId || "fire-btn";
    var MAX_DIST = opts.maxDist || 48000;
    var MIN_DIST = opts.minDist || 2;
    var DEAD = 0.08;

    var leftJoy = document.getElementById(LJ_ID);
    var rightJoy = document.getElementById(RJ_ID);
    var fireBtn = document.getElementById(FIRE_ID);

    /* Per-joystick touch state */
    var joyActive = false,
      joyDX = 0,
      joyDY = 0,
      joyTouchId = null;
    var joy2Active = false,
      joy2DX = 0,
      joy2DY = 0,
      joy2TouchId = null;

    function normOffset(el, touch) {
      var r = el.getBoundingClientRect();
      var cx = ((touch.clientX - r.left) / r.width) * 2 - 1;
      var cy = ((touch.clientY - r.top) / r.height) * 2 - 1;
      return {
        x: Math.max(-1, Math.min(1, cx)),
        y: Math.max(-1, Math.min(1, cy)),
      };
    }

    function bindJoy(el, getId, setActive, setDelta, setId) {
      if (!el) return;
      el.addEventListener(
        "touchstart",
        function (e) {
          e.preventDefault();
          if (getId() !== null) return;
          var t = e.changedTouches[0];
          setId(t.identifier);
          setActive(true);
          var o = normOffset(el, t);
          setDelta(o.x, o.y);
        },
        { passive: false },
      );
      el.addEventListener(
        "touchmove",
        function (e) {
          e.preventDefault();
          for (var i = 0; i < e.changedTouches.length; i++) {
            var t = e.changedTouches[i];
            if (t.identifier === getId()) {
              var o = normOffset(el, t);
              setDelta(o.x, o.y);
            }
          }
        },
        { passive: false },
      );
      var endFn = function (e) {
        for (var i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === getId()) {
            setActive(false);
            setDelta(0, 0);
            setId(null);
          }
        }
      };
      el.addEventListener("touchend", endFn, { passive: false });
      el.addEventListener("touchcancel", endFn, { passive: false });
    }

    bindJoy(
      leftJoy,
      function () {
        return joyTouchId;
      },
      function (v) {
        joyActive = v;
      },
      function (x, y) {
        joyDX = x;
        joyDY = y;
      },
      function (id) {
        joyTouchId = id;
      },
    );
    bindJoy(
      rightJoy,
      function () {
        return joy2TouchId;
      },
      function (v) {
        joy2Active = v;
      },
      function (x, y) {
        joy2DX = x;
        joy2DY = y;
      },
      function (id) {
        joy2TouchId = id;
      },
    );

    /* Fire button */
    if (fireBtn) {
      fireBtn.addEventListener(
        "touchstart",
        function (e) {
          e.preventDefault();
          try {
            var ac = new (window.AudioContext || window.webkitAudioContext)();
            var o = ac.createOscillator(),
              g = ac.createGain();
            o.type = "sine";
            o.frequency.setValueAtTime(1200, ac.currentTime);
            o.frequency.exponentialRampToValueAtTime(
              220,
              ac.currentTime + 0.18,
            );
            g.gain.setValueAtTime(0.38, ac.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.22);
            o.connect(g);
            g.connect(ac.destination);
            o.start();
            o.stop(ac.currentTime + 0.25);
          } catch (err) {}
          window.dispatchEvent(new CustomEvent("cosmos-fire"));
        },
        { passive: false },
      );
    }

    /* ── Mobile control loop (RAF) ── */
    function mobileLoop() {
      var rig = document.getElementById(RIG_ID);
      var camEl = document.querySelector("[look-controls]");
      if (rig && rig.object3D && camEl) {
        var THREE = AFRAME.THREE;
        var dist = rig.object3D.position.length();
        var SPEED =
          dist >= 16000 ? 400 : dist >= 8000 ? 200 : dist >= 3000 ? 80 : 20;

        /* Left stick: thrust along craft nose + yaw around craft up */
        if (joyActive && (Math.abs(joyDX) > DEAD || Math.abs(joyDY) > DEAD)) {
          var fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(
            rig.object3D.quaternion,
          );
          var thr = root._inv_thrust ? -joyDY : joyDY;
          rig.object3D.position.addScaledVector(fwd, thr * SPEED);
          if (Math.abs(joyDX) > DEAD) {
            var yw = root._inv_yaw ? joyDX : -joyDX;
            var craftUp = new THREE.Vector3(0, 1, 0)
              .applyQuaternion(
                rig.object3D.getWorldQuaternion(new THREE.Quaternion()),
              )
              .normalize();
            rig.object3D.rotateOnWorldAxis(craftUp, yw * 0.032);
          }
        }
        root._thrustLevel = joyActive ? Math.abs(joyDY) : 0;

        /* Right stick: pitch (craft right) + roll */
        var lc = camEl.components && camEl.components["look-controls"];
        if (
          joy2Active &&
          (Math.abs(joy2DX) > DEAD || Math.abs(joy2DY) > DEAD)
        ) {
          if (Math.abs(joy2DY) > DEAD) {
            var pit = root._inv_pitch ? -joy2DY : joy2DY;
            var rq = rig.object3D.getWorldQuaternion(new THREE.Quaternion());
            var rgt = new THREE.Vector3(1, 0, 0)
              .applyQuaternion(rq)
              .normalize();
            rig.object3D.rotateOnWorldAxis(rgt, pit * 0.064);
            if (lc && lc.pitchObject) lc.pitchObject.rotation.x = 0;
          }
          var rl = root._inv_roll ? -joy2DX : joy2DX;
          root._joyRollDelta = (root._joyRollDelta || 0) - rl * 0.08;
        }
        root._joyRollActive = joy2Active && Math.abs(joy2DX) > DEAD;

        /* Clamp to universe bounds */
        var curDist = rig.object3D.position.length();
        if (curDist > MAX_DIST) {
          rig.object3D.position.multiplyScalar(MAX_DIST / curDist);
        }
      }
      requestAnimationFrame(mobileLoop);
    }
    requestAnimationFrame(mobileLoop);
  }

  root.initMerkabaMobileNav = initMerkabaMobileNav;
})(window);
