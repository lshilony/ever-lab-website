/* ============================================================
   EVER LAB, About-page band parallax (mobile-reliable)
   background-attachment: fixed does not parallax on most phones, so on
   narrow viewports we drive a transform-based parallax off native scroll.
   The .about-band-img layer is set (in CSS) to 128% height / top:-14%, so
   it can drift within its frame without ever exposing an edge. Desktop keeps
   the CSS fixed-attachment effect and this script stays idle.
   ============================================================ */
(function () {
  'use strict';

  var mq = window.matchMedia('(max-width: 768px)');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var bands = [];
  var ticking = false;

  function collect() {
    bands = [].slice.call(document.querySelectorAll('.about-band')).map(function (b) {
      return { band: b, img: b.querySelector('.about-band-img') };
    }).filter(function (x) { return x.img; });
  }

  function reset() {
    for (var i = 0; i < bands.length; i++) { bands[i].img.style.transform = ''; }
  }

  function update() {
    ticking = false;
    if (!mq.matches) { return; }
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = 0; i < bands.length; i++) {
      var r = bands[i].band.getBoundingClientRect();
      if (r.bottom < -40 || r.top > vh + 40) { continue; }
      var p = (vh - r.top) / (vh + r.height);   // 0 entering bottom -> 1 leaving top
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      var shift = (p - 0.5) * 16;                // -8% .. +8% of image height
      bands[i].img.style.transform = 'translate3d(0,' + shift.toFixed(2) + '%,0)';
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  function init() {
    collect();
    if (!bands.length) { return; }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    if (mq.addEventListener) {
      mq.addEventListener('change', function () { if (!mq.matches) { reset(); } else { onScroll(); } });
    }
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
