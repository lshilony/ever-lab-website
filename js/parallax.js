/* ============================================================
   EVER LAB, mobile-reliable parallax. background-attachment: fixed does
   NOT parallax on phones (where most of our traffic is), so on narrow
   viewports we drive a real parallax off native scroll. Two band types:
     A) .section-divider  -> translate an inner .section-divider-img layer
                             (grown taller than its overflow-hidden band).
     B) .photo-band       -> the photo is painted on the element itself, so
                             we animate its background-position-y instead
                             (only the image layer moves, the dark gradient
                             overlay stays pinned so no un-tinted edge shows).
   Desktop keeps the CSS fixed-attachment effect and this stays idle.
   Include with: <script src="/js/parallax.js" defer></script>
   ============================================================ */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }
  // Modern engines run a smoother compositor-driven parallax straight from CSS
  // (@supports animation-timeline: view()); this JS is only the fallback.
  try { if (window.CSS && CSS.supports && CSS.supports('animation-timeline: view()')) { return; } } catch (e) {}
  var mq = window.matchMedia('(max-width: 768px)');

  var layerBands = []; // group A
  var posBands = [];   // group B
  var ticking = false;

  function collect() {
    // Group A covers every band that has a dedicated image layer we can translate.
    layerBands = [];
    [['.section-divider', '.section-divider-img'], ['.about-band', '.about-band-img'], ['.gc-band', '.gc-band-img']].forEach(function (cfg) {
      [].slice.call(document.querySelectorAll(cfg[0])).forEach(function (b) {
        var img = b.querySelector(cfg[1]);
        if (img) { layerBands.push({ band: b, img: img }); }
      });
    });

    posBands = [].slice.call(document.querySelectorAll('.photo-band')).map(function (b) {
      // read the image layer's base vertical position (last layer of the computed value)
      var layers = getComputedStyle(b).backgroundPosition.split(',');
      var last = layers[layers.length - 1].trim().split(/\s+/);
      var baseY = parseFloat(last[1] != null ? last[1] : last[0]);
      if (isNaN(baseY)) { baseY = 50; }
      return { band: b, baseY: baseY };
    });
  }

  function enable() {
    for (var i = 0; i < layerBands.length; i++) {
      var s = layerBands[i].img.style;
      s.backgroundAttachment = 'scroll';
      s.top = '-30%'; s.bottom = 'auto'; s.height = '160%';
      s.willChange = 'transform';
    }
    for (var j = 0; j < posBands.length; j++) {
      posBands[j].band.style.backgroundAttachment = 'scroll';
      posBands[j].band.style.willChange = 'background-position';
    }
  }

  function disable() {
    for (var i = 0; i < layerBands.length; i++) {
      var s = layerBands[i].img.style;
      s.backgroundAttachment = ''; s.top = ''; s.bottom = ''; s.height = ''; s.transform = ''; s.willChange = '';
    }
    for (var j = 0; j < posBands.length; j++) {
      var b = posBands[j].band.style;
      b.backgroundAttachment = ''; b.backgroundPosition = ''; b.willChange = '';
    }
  }

  function progress(el) {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var r = el.getBoundingClientRect();
    if (r.bottom < -60 || r.top > vh + 60) { return null; }
    var p = (vh - r.top) / (vh + r.height);   // 0 entering bottom -> 1 leaving top
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }

  function update() {
    ticking = false;
    if (!mq.matches) { return; }
    for (var i = 0; i < layerBands.length; i++) {
      var p = progress(layerBands[i].band);
      if (p === null) { continue; }
      layerBands[i].img.style.transform = 'translate3d(0,' + ((p - 0.5) * 36).toFixed(2) + '%,0)';
    }
    for (var j = 0; j < posBands.length; j++) {
      var q = progress(posBands[j].band);
      if (q === null) { continue; }
      var y = posBands[j].baseY + (q - 0.5) * 16; // baseY ±8%
      // gradient overlay pinned (center center), only the image layer drifts
      posBands[j].band.style.backgroundPosition = 'center center, center ' + y.toFixed(2) + '%';
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  function apply() {
    if (mq.matches) { enable(); update(); } else { disable(); }
  }

  function init() {
    collect();
    if (!layerBands.length && !posBands.length) { return; }
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { apply(); onScroll(); }, { passive: true });
    if (mq.addEventListener) { mq.addEventListener('change', apply); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
