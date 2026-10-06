/* ============================================================
   EVER LAB, accessibility widget (Israeli law / תקנה 35, WCAG-aligned)
   Self-contained: injects its own CSS + floating toggle + settings panel
   and wires the logic, so any page gets it with a single tag:
     <script src="/js/a11y-widget.js" defer></script>
   Mirrors the homepage widget that used to live inline in index.html.
   Preferences persist in localStorage ('everlab-a11y'); window.everlabA11y
   exposes get()/reset()/open(). Image-correction rules are generalized so
   invert/contrast look right on image-heavy pages too (gift card etc.).
   ============================================================ */
(function () {
  'use strict';

  if (document.querySelector('.a11y-toggle')) { return; } // already on the page (e.g. inline homepage)

  var CSS = '' +
'.a11y-toggle{position:fixed;bottom:28px;left:28px;width:56px;height:56px;border-radius:50%;background:#1E40AF;color:#fff;border:none;cursor:pointer;' +
  'box-shadow:0 6px 20px rgba(30,64,175,.32),0 2px 6px rgba(20,20,20,.14);z-index:99;display:flex;align-items:center;justify-content:center;' +
  'transition:transform .3s cubic-bezier(.2,.8,.2,1),background-color .25s ease}' +
'.a11y-toggle:hover{background:#1E3A8A;transform:scale(1.06)}' +
'.a11y-toggle:focus-visible{outline:3px solid rgba(30,64,175,.5);outline-offset:3px}' +
'.a11y-toggle svg{width:26px;height:26px}' +
'.a11y-panel{position:fixed;bottom:100px;left:28px;width:320px;max-height:calc(100vh - 140px);overflow-y:auto;background:var(--paper,#F4F0EB);' +
  'border:1px solid rgba(20,20,20,.08);border-radius:16px;box-shadow:0 24px 60px rgba(20,20,20,.22),0 4px 12px rgba(20,20,20,.10);padding:20px 22px;' +
  'z-index:100;opacity:0;transform:translateY(20px) scale(.96);pointer-events:none;transition:opacity .3s ease,transform .3s cubic-bezier(.2,.8,.2,1);' +
  "direction:rtl;font-family:'Poppins','Assistant',sans-serif}" +
'.a11y-panel.is-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}' +
'.a11y-panel-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}' +
".a11y-panel-head h2{font-family:'Poppins','Assistant',serif;font-weight:300;font-size:20px;margin:0;color:var(--ink,#141414)}" +
'.a11y-close{width:30px;height:30px;border-radius:50%;background:transparent;border:none;color:var(--ink-soft,#3a3a3a);cursor:pointer;' +
  'display:flex;align-items:center;justify-content:center;transition:background-color .2s}' +
'.a11y-close:hover{background:rgba(20,20,20,.06);color:var(--ink,#141414)}' +
'.a11y-close svg{width:14px;height:14px}' +
'.a11y-section{margin-bottom:16px}' +
".a11y-section-title{font-weight:500;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--sage-deep,#6B8B70);margin:0 0 8px}" +
'.a11y-button-row{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}' +
'.a11y-button-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}' +
'.a11y-btn{font-family:inherit;font-weight:400;font-size:12.5px;background:rgba(20,20,20,.04);color:var(--ink,#141414);border:1px solid transparent;' +
  'padding:9px 10px;border-radius:8px;cursor:pointer;text-align:center;transition:background-color .2s,border-color .2s,color .2s}' +
'.a11y-btn:hover{background:rgba(20,20,20,.08)}' +
'.a11y-btn.is-active{background:var(--sage-deep,#6B8B70);color:#fff;border-color:var(--sage-deep,#6B8B70)}' +
'.a11y-btn:focus-visible{outline:2px solid var(--sage-deep,#6B8B70);outline-offset:2px}' +
'.a11y-btn-reset{width:100%;background:transparent;border-color:rgba(20,20,20,.15);color:var(--ink-soft,#3a3a3a);font-size:13px}' +
'.a11y-btn-reset:hover{background:rgba(20,20,20,.04);color:var(--ink,#141414)}' +
'.a11y-panel-foot{display:flex;flex-direction:column;gap:10px;padding-top:14px;border-top:1px solid rgba(20,20,20,.08);margin-top:12px}' +
'.a11y-statement-link{font-size:12.5px;color:var(--sage-deep,#6B8B70);text-decoration:underline;text-underline-offset:2px;text-align:center}' +
'@media(max-width:768px){.a11y-toggle{bottom:22px;left:18px;width:50px;height:50px}.a11y-toggle svg{width:22px;height:22px}' +
  '.a11y-panel{left:18px;right:18px;width:auto;bottom:86px}}' +
/* effects */
'body.a11y-font-large{font-size:117%}body.a11y-font-xlarge{font-size:135%}' +
'body.a11y-high-contrast{background:#000 !important;color:#FFF200 !important}' +
'body.a11y-high-contrast *:not(.a11y-toggle):not(.a11y-toggle *){background-color:#000 !important;color:#FFF200 !important;border-color:#FFF200 !important;box-shadow:none !important}' +
'body.a11y-high-contrast a,body.a11y-high-contrast a *{color:#00FFFF !important}' +
'body.a11y-high-contrast img,body.a11y-high-contrast .gc-band-img,body.a11y-high-contrast .section-divider-img,body.a11y-high-contrast [class*="-img"]{filter:grayscale(1) contrast(1.4)}' +
'body.a11y-grayscale{filter:grayscale(1)}' +
'body.a11y-invert{filter:invert(1) hue-rotate(180deg)}' +
'body.a11y-invert img,body.a11y-invert video,body.a11y-invert .gc-band-img,body.a11y-invert .section-divider-img,body.a11y-invert .hero-img,body.a11y-invert .logo-img,body.a11y-invert .plan-card-img,body.a11y-invert .tech-img,body.a11y-invert [class*="-img"]{filter:invert(1) hue-rotate(180deg)}' +
'body.a11y-highlight-links a{text-decoration:underline !important;text-underline-offset:3px !important;outline:1px dashed currentColor;outline-offset:2px;background:rgba(255,235,0,.18)}' +
'body.a11y-highlight-headings h1,body.a11y-highlight-headings h2,body.a11y-highlight-headings h3,body.a11y-highlight-headings h4{outline:2px dashed var(--sage-deep,#6B8B70);outline-offset:4px;background:rgba(141,174,146,.10)}' +
"body.a11y-readable-font,body.a11y-readable-font *{font-family:Arial,'Poppins','Assistant',sans-serif !important;font-style:normal !important;letter-spacing:.01em !important}" +
'body.a11y-no-motion *,body.a11y-no-motion *::before,body.a11y-no-motion *::after{animation:none !important;transition:none !important}' +
'body.a11y-no-motion .gc-band-img,body.a11y-no-motion .section-divider-img{background-attachment:scroll !important}' +
"body.a11y-big-cursor,body.a11y-big-cursor *{cursor:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'><polygon points='10,8 38,24 22,28 18,42' fill='black' stroke='white' stroke-width='2'/></svg>\") 10 8,auto !important}";

  var A11Y_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="3.5" r="1.6"/><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M7 7.5 L17 7.5"/><path d="M12 7.5 L12 13"/><path d="M12 13 L8 21"/><path d="M12 13 L16 21"/><path d="M8 11 L9 13"/><path d="M16 11 L15 13"/></g></svg>';
  var X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';

  var HTML = '' +
'<button type="button" class="a11y-toggle" aria-label="פתח הגדרות נגישות" aria-controls="a11y-panel" aria-expanded="false">' + A11Y_ICON + '</button>' +
'<aside id="a11y-panel" class="a11y-panel" aria-hidden="true" role="dialog" aria-modal="false" aria-labelledby="a11y-panel-title">' +
  '<header class="a11y-panel-head"><h2 id="a11y-panel-title">הגדרות נגישות</h2>' +
    '<button type="button" class="a11y-close" data-action="close" aria-label="סגור">' + X + '</button></header>' +
  '<section class="a11y-section"><h3 class="a11y-section-title">גודל טקסט</h3>' +
    '<div class="a11y-button-row" role="group" aria-label="גודל טקסט">' +
      '<button type="button" class="a11y-btn" data-font="normal">רגיל</button>' +
      '<button type="button" class="a11y-btn" data-font="large">גדול</button>' +
      '<button type="button" class="a11y-btn" data-font="xlarge">ענק</button></div></section>' +
  '<section class="a11y-section"><h3 class="a11y-section-title">צבעים וניגודיות</h3>' +
    '<div class="a11y-button-grid">' +
      '<button type="button" class="a11y-btn" data-toggle="high-contrast">ניגודיות גבוהה</button>' +
      '<button type="button" class="a11y-btn" data-toggle="grayscale">גווני אפור</button>' +
      '<button type="button" class="a11y-btn" data-toggle="invert">היפוך צבעים</button></div></section>' +
  '<section class="a11y-section"><h3 class="a11y-section-title">קריאות</h3>' +
    '<div class="a11y-button-grid">' +
      '<button type="button" class="a11y-btn" data-toggle="highlight-links">הדגשת קישורים</button>' +
      '<button type="button" class="a11y-btn" data-toggle="highlight-headings">הדגשת כותרות</button>' +
      '<button type="button" class="a11y-btn" data-toggle="readable-font">גופן קריא</button></div></section>' +
  '<section class="a11y-section"><h3 class="a11y-section-title">תנועה</h3>' +
    '<div class="a11y-button-grid">' +
      '<button type="button" class="a11y-btn" data-toggle="no-motion">עצירת אנימציות</button>' +
      '<button type="button" class="a11y-btn" data-toggle="big-cursor">סמן גדול</button></div></section>' +
  '<footer class="a11y-panel-foot">' +
    '<button type="button" class="a11y-btn a11y-btn-reset" data-action="reset">איפוס הגדרות</button>' +
    '<a href="/accessibility.html" class="a11y-statement-link">הצהרת נגישות</a></footer>' +
'</aside>';

  function build() {
    var style = document.createElement('style');
    style.id = 'a11y-widget-css';
    style.textContent = CSS;
    document.head.appendChild(style);
    var holder = document.createElement('div');
    holder.innerHTML = HTML;
    while (holder.firstElementChild) { document.body.appendChild(holder.firstElementChild); }
  }

  function init() {
    build();
    var STORAGE_KEY = 'everlab-a11y';
    var toggle = document.querySelector('.a11y-toggle');
    var panel = document.getElementById('a11y-panel');
    if (!toggle || !panel) return;

    var TOGGLES = ['high-contrast', 'grayscale', 'invert', 'highlight-links', 'highlight-headings', 'readable-font', 'no-motion', 'big-cursor'];
    var FONT_SIZES = ['normal', 'large', 'xlarge'];

    var readState = function () { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; } };
    var writeState = function (state) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} };

    var apply = function (state) {
      var body = document.body;
      TOGGLES.forEach(function (k) { body.classList.remove('a11y-' + k); });
      FONT_SIZES.forEach(function (s) { body.classList.remove('a11y-font-' + s); });
      TOGGLES.forEach(function (k) { if (state[k]) body.classList.add('a11y-' + k); });
      if (state.font && state.font !== 'normal') { body.classList.add('a11y-font-' + state.font); }
      panel.querySelectorAll('[data-toggle]').forEach(function (btn) {
        btn.classList.toggle('is-active', !!state[btn.dataset.toggle]);
        btn.setAttribute('aria-pressed', state[btn.dataset.toggle] ? 'true' : 'false');
      });
      panel.querySelectorAll('[data-font]').forEach(function (btn) {
        var active = btn.dataset.font === (state.font || 'normal');
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    };

    var openPanel = function () { panel.classList.add('is-open'); panel.removeAttribute('aria-hidden'); toggle.setAttribute('aria-expanded', 'true'); };
    var closePanel = function () { panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true'); toggle.setAttribute('aria-expanded', 'false'); };

    var state = readState();
    apply(state);

    toggle.addEventListener('click', function () {
      if (panel.classList.contains('is-open')) closePanel(); else openPanel();
    });
    panel.querySelector('[data-action="close"]').addEventListener('click', closePanel);
    document.addEventListener('click', function (e) {
      if (panel.classList.contains('is-open') && !panel.contains(e.target) && !toggle.contains(e.target)) { closePanel(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) { closePanel(); toggle.focus(); }
    });

    panel.querySelectorAll('[data-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.toggle;
        state = readState();
        state[key] = !state[key];
        writeState(state);
        apply(state);
      });
    });
    panel.querySelectorAll('[data-font]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state = readState();
        state.font = btn.dataset.font;
        writeState(state);
        apply(state);
      });
    });
    panel.querySelector('[data-action="reset"]').addEventListener('click', function () { writeState({}); apply({}); });

    window.everlabA11y = { get: readState, reset: function () { writeState({}); apply({}); }, open: openPanel };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
