/* ============================================================
   EVER LAB, cookie consent (GDPR / Israeli privacy law compliant)
   Self-contained: injects its own CSS + banner + settings modal and
   wires the logic, so any page gets it with a single tag:
     <script src="/js/cookie-consent.js" defer></script>
   Mirrors the homepage banner that used to live inline in index.html.
   Stores the choice in localStorage ('everlab-cookie-consent') and fires
   a window 'everlab:consent-updated' event. window.everlabConsent exposes
   get()/reset()/openSettings(). Colors use the brand tokens with literal
   fallbacks so the file is drop-in on pages that don't define them.
   ============================================================ */
(function () {
  'use strict';

  if (document.getElementById('cookie-banner')) { return; } // already on the page (e.g. inline homepage)

  var CSS = '' +
/* Slim consent bar: a floating strip on desktop, a compact sheet pinned to the bottom on
   mobile (about 15% of the screen instead of half), so the first screen stays visible.
   "אישור" and "סירוב" are the same size, side by side. */
'.cookie-banner{position:fixed;bottom:16px;left:50%;transform:translate(-50%,16px);width:calc(100% - 32px);max-width:860px;' +
  'background:var(--paper,#F4F0EB);border:1px solid rgba(20,20,20,.1);border-radius:16px;' +
  'box-shadow:0 12px 40px rgba(20,20,20,.16),0 2px 8px rgba(20,20,20,.06);padding:14px 18px;z-index:1300;opacity:0;' +
  'transition:opacity .35s ease,transform .35s cubic-bezier(.2,.8,.2,1);pointer-events:none;direction:rtl;' +
  "display:flex;align-items:center;gap:18px;font-family:'Poppins','Assistant',sans-serif}" +
'.cookie-banner.is-visible{opacity:1;transform:translate(-50%,0);pointer-events:auto}' +
".cookie-banner-text{flex:1;margin:0;font-weight:400;font-size:13.5px;line-height:1.55;color:var(--ink-soft,#3a3a3a);text-align:right}" +
'.cookie-banner-text a,.cookie-link{font:inherit;color:var(--sage-deep,#6B8B70);text-decoration:underline;text-underline-offset:2px;' +
  'background:none;border:0;padding:0;cursor:pointer;white-space:nowrap}' +
'.cookie-banner-actions{display:flex;gap:8px;flex:none}' +
'.cookie-banner-actions .cookie-btn{min-width:96px;padding:10px 20px}' +
'.cookie-btn{font-family:inherit;font-weight:500;font-size:14px;letter-spacing:.01em;padding:11px 18px;border-radius:999px;border:1px solid;cursor:pointer;' +
  'transition:background-color .2s ease,color .2s ease,transform .2s ease;white-space:nowrap}' +
'.cookie-btn-primary{background:var(--sage-deep,#6B8B70);color:#fff;border-color:var(--sage-deep,#6B8B70)}' +
'.cookie-btn-primary:hover{background:#5c7860;border-color:#5c7860}' +
'.cookie-btn-secondary{background:transparent;color:var(--ink,#141414);border-color:rgba(20,20,20,.18)}' +
'.cookie-btn-secondary:hover{background:rgba(20,20,20,.04);border-color:rgba(20,20,20,.3)}' +
'.cookie-btn:focus-visible{outline:2px solid var(--sage-deep,#6B8B70);outline-offset:2px}' +
/* While the bar is showing, lift the floating buttons (WhatsApp, accessibility) above it */
'html.has-cookie-bar .fcta,html.has-cookie-bar .wa-float,html.has-cookie-bar .a11y-toggle{bottom:calc(var(--cookie-bar-h,0px) + 12px)}' +
'.cookie-modal{position:fixed;inset:0;z-index:1400;background:rgba(20,20,20,.4);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);' +
  'display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;visibility:hidden;transition:opacity .3s ease,visibility 0s .3s;' +
  "font-family:'Poppins','Assistant',sans-serif}" +
'.cookie-modal.is-open{opacity:1;visibility:visible;transition:opacity .3s ease,visibility 0s}' +
'.cookie-modal-card{background:var(--paper,#F4F0EB);border-radius:20px;max-width:580px;width:100%;max-height:calc(100vh - 48px);overflow-y:auto;' +
  'padding:32px 36px;box-shadow:0 28px 80px rgba(20,20,20,.32);direction:rtl;transform:translateY(20px) scale(.98);transition:transform .35s cubic-bezier(.2,.8,.2,1)}' +
'.cookie-modal.is-open .cookie-modal-card{transform:translateY(0) scale(1)}' +
'.cookie-modal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}' +
".cookie-modal-title{font-family:'Poppins','Assistant',serif;font-weight:300;font-size:28px;color:var(--ink,#141414);margin:0}" +
'.cookie-modal-close{width:36px;height:36px;border-radius:50%;background:rgba(20,20,20,.04);border:none;color:var(--ink-soft,#3a3a3a);cursor:pointer;' +
  'display:flex;align-items:center;justify-content:center;transition:background-color .2s,color .2s}' +
'.cookie-modal-close:hover{background:rgba(20,20,20,.08);color:var(--ink,#141414)}' +
'.cookie-modal-close svg{width:16px;height:16px}' +
'.cookie-modal-intro{font-weight:300;font-size:15px;line-height:1.7;color:var(--ink-soft,#3a3a3a);margin:0 0 24px}' +
'.cookie-category{padding:18px 0;border-top:1px solid rgba(20,20,20,.08)}' +
'.cookie-category-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}' +
'.cookie-category-name{font-weight:500;font-size:16px;color:var(--ink,#141414)}' +
'.cookie-category-badge{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--sage-deep,#6B8B70);' +
  'background:rgba(141,174,146,.18);padding:4px 10px;border-radius:999px}' +
'.cookie-category-desc{font-weight:300;font-size:13.5px;line-height:1.65;color:var(--ink-soft,#3a3a3a);margin:0}' +
'.cookie-switch{position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;cursor:pointer}' +
'.cookie-switch input{opacity:0;width:0;height:0}' +
'.cookie-switch-track{position:absolute;inset:0;background:rgba(20,20,20,.15);border-radius:999px;transition:background-color .25s}' +
".cookie-switch-track::before{content:'';position:absolute;width:18px;height:18px;background:#fff;border-radius:50%;top:3px;left:3px;" +
  'transition:transform .25s cubic-bezier(.2,.8,.2,1);box-shadow:0 1px 3px rgba(20,20,20,.18)}' +
'.cookie-switch input:checked + .cookie-switch-track{background:var(--sage-deep,#6B8B70)}' +
'.cookie-switch input:checked + .cookie-switch-track::before{transform:translateX(20px)}' +
'.cookie-switch input:focus-visible + .cookie-switch-track{box-shadow:0 0 0 3px rgba(107,139,112,.25)}' +
'.cookie-modal-foot{display:flex;justify-content:flex-end;gap:10px;margin-top:26px;padding-top:22px;border-top:1px solid rgba(20,20,20,.08)}' +
'@media(max-width:768px){' +
  '.cookie-banner{left:0;right:0;bottom:0;width:100%;max-width:none;transform:translateY(16px);border-radius:16px 16px 0 0;border-width:1px 0 0;' +
    'flex-direction:column;align-items:stretch;gap:10px;padding:12px 16px calc(12px + env(safe-area-inset-bottom,0px))}' +
  '.cookie-banner.is-visible{transform:translateY(0)}' +
  '.cookie-banner-text{font-size:13px;text-align:center}' +
  '.cookie-banner-actions .cookie-btn{flex:1;min-width:0;padding:10px 12px}' +
  '.cookie-modal-card{padding:26px 22px;max-height:calc(100vh - 32px)}.cookie-modal-title{font-size:24px}' +
  '.cookie-modal-foot{flex-direction:column-reverse}.cookie-modal-foot .cookie-btn{width:100%}' +
'}';

  var X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';

  var BANNER = '' +
'<aside id="cookie-banner" class="cookie-banner" aria-hidden="true" aria-label="הסכמה לשימוש בעוגיות">' +
  '<p class="cookie-banner-text">אנחנו משתמשים בעוגיות לשיפור האתר ולמדידת הפרסום שלנו. ' +
    '<a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">מדיניות הפרטיות</a> · ' +
    '<button type="button" class="cookie-link" data-action="customize">הגדרות</button></p>' +
  '<div class="cookie-banner-actions">' +
    '<button type="button" class="cookie-btn cookie-btn-primary" data-action="accept-all">אישור</button>' +
    '<button type="button" class="cookie-btn cookie-btn-secondary" data-action="reject-all">סירוב</button>' +
  '</div>' +
'</aside>';

  var MODAL = '' +
'<div id="cookie-modal" class="cookie-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">' +
  '<div class="cookie-modal-card">' +
    '<header class="cookie-modal-head">' +
      '<h2 id="cookie-modal-title" class="cookie-modal-title">הגדרות עוגיות</h2>' +
      '<button type="button" class="cookie-modal-close" data-action="close" aria-label="סגור">' + X + '</button>' +
    '</header>' +
    '<p class="cookie-modal-intro">בחרו אילו עוגיות יופעלו. ההגדרות נשמרות במכשיר ואפשר לשנות אותן בכל עת.</p>' +
    '<div class="cookie-category"><div class="cookie-category-head"><span class="cookie-category-name">חיוניות</span>' +
      '<span class="cookie-category-badge">תמיד פעיל</span></div>' +
      '<p class="cookie-category-desc">עוגיות שמאפשרות לאתר לפעול, שמירת העדפות, מצב טופס, ביטחון. בלעדיהן האתר לא יעבוד תקין.</p></div>' +
    '<div class="cookie-category"><div class="cookie-category-head"><span class="cookie-category-name">אנליטיקה</span>' +
      '<label class="cookie-switch"><input type="checkbox" id="cookie-toggle-analytics"><span class="cookie-switch-track"></span></label></div>' +
      '<p class="cookie-category-desc">עוזרות לנו להבין כיצד האתר נמצא בשימוש (Google Analytics וכדומה), דפים נצפים, זמני שהייה, כדי לשפר אותו.</p></div>' +
    '<div class="cookie-category"><div class="cookie-category-head"><span class="cookie-category-name">שיווק</span>' +
      '<label class="cookie-switch"><input type="checkbox" id="cookie-toggle-marketing"><span class="cookie-switch-track"></span></label></div>' +
      '<p class="cookie-category-desc">מאפשרות להציג מודעות מותאמות אישית ולמדוד את אפקטיביות הקמפיינים שלנו (Meta Pixel וכדומה).</p></div>' +
    '<footer class="cookie-modal-foot">' +
      '<button type="button" class="cookie-btn cookie-btn-secondary" data-action="save">שמירת הבחירה</button>' +
      '<button type="button" class="cookie-btn cookie-btn-primary" data-action="accept-all">אישור הכל</button>' +
    '</footer>' +
  '</div>' +
'</div>';

  function build() {
    var style = document.createElement('style');
    style.id = 'cookie-consent-css';
    style.textContent = CSS;
    document.head.appendChild(style);
    var holder = document.createElement('div');
    holder.innerHTML = BANNER + MODAL;
    while (holder.firstElementChild) { document.body.appendChild(holder.firstElementChild); }
  }

  function init() {
    build();
    var STORAGE_KEY = 'everlab-cookie-consent';
    var banner = document.getElementById('cookie-banner');
    var modal = document.getElementById('cookie-modal');
    if (!banner || !modal) return;

    var readPrefs = function () {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch (e) { return null; }
    };
    // Keep the floating buttons just above the bar while it is showing.
    var root = document.documentElement;
    var syncBarHeight = function () {
      var mobile = window.matchMedia('(max-width: 768px)').matches;
      root.style.setProperty('--cookie-bar-h', (banner.offsetHeight + (mobile ? 0 : 16)) + 'px');
    };
    var showBanner = function () {
      banner.classList.add('is-visible'); banner.removeAttribute('aria-hidden');
      syncBarHeight(); root.classList.add('has-cookie-bar');
      window.addEventListener('resize', syncBarHeight);
    };
    var hideBanner = function () {
      banner.classList.remove('is-visible'); banner.setAttribute('aria-hidden', 'true');
      root.classList.remove('has-cookie-bar');
      window.removeEventListener('resize', syncBarHeight);
    };
    var openModal = function () {
      modal.classList.add('is-open');
      modal.removeAttribute('aria-hidden');
      var prefs = readPrefs() || {};
      modal.querySelector('#cookie-toggle-analytics').checked = !!prefs.analytics;
      modal.querySelector('#cookie-toggle-marketing').checked = !!prefs.marketing;
      document.body.style.overflow = 'hidden';
    };
    var closeModal = function () {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    var savePrefs = function (prefs) {
      var data = {
        necessary: true,
        analytics: !!prefs.analytics,
        marketing: !!prefs.marketing,
        timestamp: new Date().toISOString()
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
      window.dispatchEvent(new CustomEvent('everlab:consent-updated', { detail: data }));
      hideBanner();
      closeModal();
    };

    if (!readPrefs()) { setTimeout(showBanner, 800); }

    banner.querySelector('[data-action="accept-all"]').addEventListener('click', function () { savePrefs({ analytics: true, marketing: true }); });
    banner.querySelectorAll('[data-action="reject-all"]').forEach(function (el) {
      el.addEventListener('click', function () { savePrefs({ analytics: false, marketing: false }); });
    });
    banner.querySelector('[data-action="customize"]').addEventListener('click', openModal);

    modal.querySelector('[data-action="save"]').addEventListener('click', function () {
      savePrefs({
        analytics: modal.querySelector('#cookie-toggle-analytics').checked,
        marketing: modal.querySelector('#cookie-toggle-marketing').checked
      });
    });
    modal.querySelector('[data-action="accept-all"]').addEventListener('click', function () { savePrefs({ analytics: true, marketing: true }); });
    modal.querySelector('[data-action="close"]').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });

    document.querySelectorAll('[data-cookie-prefs]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
    });

    window.everlabConsent = {
      get: readPrefs,
      reset: function () { localStorage.removeItem(STORAGE_KEY); showBanner(); },
      openSettings: openModal
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
