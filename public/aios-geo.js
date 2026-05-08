/*!
 * aios-geo.js — AIOS GeoQode Embed SDK
 * Version: 1.0.0
 * Load from: <script src="https://realaios.com/aios-geo.js"></script>
 *
 * Quick start:
 *   <div id="my-aios" style="width:400px;height:300px"></div>
 *   <script src="https://realaios.com/aios-geo.js"></script>
 *   <script>AIOS.init({ target: '#my-aios' });</script>
 *
 * Or data-attribute auto-init:
 *   <div data-aios style="width:400px;height:300px"></div>
 *   <script src="https://realaios.com/aios-geo.js"></script>
 */
(function (global) {
  'use strict';

  var API_BASE = 'https://realaios.com';

  // ── Merkaba handshake renderer (default visualisation) ───────────────────
  function MerkabaRenderer(canvas, opts) {
    opts = opts || {};
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.running = false;
    this.frame = 0;
    this.phi = 1.618;
    this.freq = opts.frequency || 528;
    this.label = opts.label || '';
  }

  MerkabaRenderer.prototype.start = function () {
    this.running = true;
    this._loop();
  };

  MerkabaRenderer.prototype.stop = function () {
    this.running = false;
  };

  MerkabaRenderer.prototype._loop = function () {
    if (!this.running) return;
    this._draw();
    this.frame++;
    requestAnimationFrame(this._loop.bind(this));
  };

  MerkabaRenderer.prototype._draw = function () {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    var t = this.frame * 0.012;
    var cx = w / 2;
    var cy = h / 2;
    var r = Math.min(w, h) * 0.38;

    // Trailing fade
    ctx.fillStyle = 'rgba(3, 5, 13, 0.18)';
    ctx.fillRect(0, 0, w, h);

    // Merkaba — two counter-rotating interlocked triangles
    var colors = ['rgba(0, 229, 255, 0.75)', 'rgba(124, 58, 237, 0.75)'];
    for (var layer = 0; layer < 2; layer++) {
      var dir = layer === 0 ? 1 : -1;
      var rot = t * dir * this.phi;
      ctx.beginPath();
      for (var i = 0; i < 3; i++) {
        var a = rot + (i * Math.PI * 2) / 3 - Math.PI / 2;
        var x = cx + r * Math.cos(a);
        var y = cy + r * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = colors[layer];
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 14;
      ctx.shadowColor = colors[layer];
      ctx.stroke();
    }

    // Centre coherence node
    var pulse = 0.5 + 0.5 * Math.sin(t * this.freq / 80);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.07 * (0.8 + pulse * 0.4), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 245, 212, ' + (0.4 + pulse * 0.45) + ')';
    ctx.shadowBlur = 22;
    ctx.shadowColor = '#00f5d4';
    ctx.fill();
    ctx.shadowBlur = 0;

    // AIOS watermark
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
    ctx.textAlign = 'center';
    var labelText = this.label ? this.label + ' · \u2B21 AIOS' : '\u2B21 AIOS';
    ctx.fillText(labelText, cx, h - 10);
  };

  // ── .geo programme renderer ──────────────────────────────────────────────
  function GeoRenderer(canvas, programme) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.programme = programme;
    this.running = false;
    this.frame = 0;
    this.phi = 1.618;
  }

  GeoRenderer.prototype.start = function () {
    this.running = true;
    this._loop();
  };

  GeoRenderer.prototype.stop = function () {
    this.running = false;
  };

  GeoRenderer.prototype._loop = function () {
    if (!this.running) return;
    this._draw();
    this.frame++;
    requestAnimationFrame(this._loop.bind(this));
  };

  GeoRenderer.prototype._draw = function () {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    var prog = this.programme;
    var t = this.frame * 0.01;
    var cx = w / 2;
    var cy = h / 2;
    var scene = (prog.scenes && prog.scenes[0]) || {};
    var freq = scene.frequency || 528;
    var nodes = Math.max(3, Math.min(scene.nodes || 6, 24));
    var r = Math.min(w, h) * 0.34;

    ctx.fillStyle = 'rgba(3, 5, 13, 0.15)';
    ctx.fillRect(0, 0, w, h);

    // Node ring
    for (var i = 0; i < nodes; i++) {
      var a = (i / nodes) * Math.PI * 2 + t * this.phi;
      var x = cx + r * Math.cos(a);
      var y = cy + r * Math.sin(a);
      var pulse = 0.5 + 0.5 * Math.sin(t * freq / 200 + i * 0.8);
      // Spoke
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(0, 229, 255, ' + (0.06 + pulse * 0.1) + ')';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.stroke();
      // Node dot
      ctx.beginPath();
      ctx.arc(x, y, 3 + pulse * 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 229, 255, ' + (0.4 + pulse * 0.5) + ')';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00f5d4';
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Title
    if (prog.title) {
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = 'rgba(226, 232, 240, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(prog.title, cx, h - 24);
    }
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
    ctx.fillText('\u2B21 AIOS', cx, h - 10);
  };

  // ── AIOS public API ──────────────────────────────────────────────────────
  var AIOS = {
    version: '1.0.0',
    _instances: [],

    /**
     * Initialise AIOS in a container element.
     *
     * @param {object}          options
     * @param {string|Element}  options.target     CSS selector or DOM element
     * @param {string}         [options.mode]      'merkaba' | 'geo'  (default: 'merkaba')
     * @param {string}         [options.geoId]     Programme ID — fetches from /api/geo/:id
     * @param {object}         [options.geo]       Inline .geo programme object
     * @param {number}         [options.frequency] Hz override for merkaba mode (default: 528)
     * @param {string}         [options.label]     Label shown in watermark
     * @param {boolean}        [options.autoplay]  Start immediately (default: true)
     * @param {number}         [options.width]     Canvas px width  (default: container width || 400)
     * @param {number}         [options.height]    Canvas px height (default: container height || 300)
     * @returns {object|null}  Instance handle
     */
    init: function (options) {
      options = options || {};
      var target = options.target;
      if (typeof target === 'string') target = document.querySelector(target);
      if (!target) {
        console.warn('[AIOS] Target not found:', options.target);
        return null;
      }

      var width  = options.width  || target.offsetWidth  || 400;
      var height = options.height || target.offsetHeight || 300;
      var mode   = options.mode   || 'merkaba';
      var autoplay = options.autoplay !== false;

      // Build canvas
      var canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;
      canvas.style.cssText = 'display:block;width:100%;height:100%;border-radius:inherit;background:#03050d';
      target.style.background = '#03050d';
      target.style.overflow = 'hidden';
      target.appendChild(canvas);

      var instance = { canvas: canvas, renderer: null, mode: mode, target: target };

      if (mode === 'geo') {
        if (options.geo) {
          // Inline programme supplied
          instance.renderer = new GeoRenderer(canvas, options.geo);
          if (autoplay) instance.renderer.start();
        } else if (options.geoId) {
          // Fetch from API
          var self = this;
          fetch(API_BASE + '/api/geo/' + encodeURIComponent(options.geoId))
            .then(function (r) { return r.json(); })
            .then(function (data) {
              if (data.ok && data.programme) {
                instance.renderer = new GeoRenderer(canvas, data.programme);
              } else {
                instance.renderer = new MerkabaRenderer(canvas, options);
              }
              if (autoplay) instance.renderer.start();
            })
            .catch(function () {
              instance.renderer = new MerkabaRenderer(canvas, options);
              if (autoplay) instance.renderer.start();
            });
        } else {
          // geo mode but no data — fall back
          instance.renderer = new MerkabaRenderer(canvas, options);
          if (autoplay) instance.renderer.start();
        }
      } else {
        // Default: Merkaba handshake animation
        instance.renderer = new MerkabaRenderer(canvas, options);
        if (autoplay) instance.renderer.start();
      }

      this._instances.push(instance);
      return instance;
    },

    /** Embed AIOS into all elements matching a CSS selector */
    embed: function (selector, options) {
      var elements = document.querySelectorAll(selector);
      var results = [];
      for (var i = 0; i < elements.length; i++) {
        var inst = this.init(Object.assign({}, options || {}, { target: elements[i] }));
        if (inst) results.push(inst);
      }
      return results;
    },

    /** Stop all running instances */
    stop: function () {
      this._instances.forEach(function (inst) {
        if (inst.renderer) inst.renderer.stop();
      });
    },

    /** Resume all stopped instances */
    play: function () {
      this._instances.forEach(function (inst) {
        if (inst.renderer && !inst.renderer.running) inst.renderer.start();
      });
    },
  };

  // Expose on window
  global.AIOS = AIOS;

  // Auto-init elements with data-aios attribute after DOM is ready
  function autoInit() {
    var els = document.querySelectorAll('[data-aios]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el._aiosInitDone) continue;
      el._aiosInitDone = true;
      AIOS.init({
        target:    el,
        mode:      el.getAttribute('data-aios-mode')  || 'merkaba',
        geoId:     el.getAttribute('data-aios-id')    || undefined,
        label:     el.getAttribute('data-aios-label') || '',
        frequency: parseInt(el.getAttribute('data-aios-freq') || '0', 10) || undefined,
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

}(typeof window !== 'undefined' ? window : this));
