/* ============================================================
   EVER LAB, shared site navigation
   ONE nav, identical on every page, reproduced exactly from the
   homepage nav. Injects it on every sub-page and replaces the old
   minimal "back to home + logo" bars, so visitors can jump between
   pages without returning home.
   ============================================================ */
(function () {
  'use strict';

  var LOGO = '/img/EVERLAB_LOGO.png';

  var CSS = '' +
    // ---- bar (= homepage <nav>) ----
    '.site-nav{position:fixed;top:0;left:0;right:0;z-index:1000;display:flex;align-items:center;justify-content:flex-start;gap:14px;' +
      'padding:22px 40px;background:rgba(237,232,227,.7);backdrop-filter:blur(18px) saturate(140%);' +
      '-webkit-backdrop-filter:blur(18px) saturate(140%);border-bottom:1px solid rgba(20,20,20,.06);' +
      "font-family:'Poppins','Assistant',sans-serif;transition:padding .3s ease,background .3s ease,box-shadow .3s ease}" +
    '.site-nav.scrolled{padding:14px 40px;background:rgba(237,232,227,.92);box-shadow:0 6px 24px -12px rgba(20,20,20,.2)}' +
    // ---- centered logo (= .logo / .logo-img) ----
    '.site-nav .sn-logo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;direction:ltr;line-height:1;text-decoration:none}' +
    '.site-nav .sn-logo img{height:96px;width:auto;display:block;margin:-24px 0;mix-blend-mode:multiply}' +
    // ---- default (below 1024px): hamburger only ----
    '.sn-links{display:none}' +
    '.sn-right{display:none}' +
    '.sn-toggle{display:flex;width:48px;height:48px;border:none;border-radius:50%;background:var(--sage-deep,#6B8B70);' +
      'color:#fff;cursor:pointer;align-items:center;justify-content:center;padding:0;flex:none;' +
      'box-shadow:0 4px 14px rgba(20,20,20,.15),0 1px 3px rgba(20,20,20,.08)}' +
    '.sn-toggle svg{width:20px;height:20px}' +
    '.sn-toggle .sn-x{display:none}.site-nav.sn-open .sn-toggle .sn-x{display:block}.site-nav.sn-open .sn-toggle .sn-bars{display:none}' +
    // ---- mobile panel ----
    '.sn-panel{position:absolute;top:100%;left:14px;right:14px;margin-top:10px;background:rgba(244,240,235,.99);' +
      'border:1px solid rgba(20,20,20,.08);border-radius:16px;box-shadow:0 26px 50px -22px rgba(20,20,20,.4);' +
      'padding:12px;display:none;flex-direction:column;gap:2px}' +
    '.site-nav.sn-open .sn-panel{display:flex}' +
    '.sn-panel a{display:block;padding:13px 16px;border-radius:10px;font-size:16px;font-weight:500;color:var(--ink,#141414);text-decoration:none}' +
    '.sn-panel a.sn-sub{font-size:14.5px;font-weight:400;padding-inline-start:30px;color:var(--ink-soft,#3a3a3a)}' +
    '.sn-panel a:hover{background:var(--sage-soft,#CDDFB7)}' +
    '.sn-panel .sn-panel-cta{margin-top:8px;background:var(--sage-deep,#6B8B70);color:var(--paper,#F4F0EB);text-align:center}' +
    // ---- desktop links (= .topnav / .topnav-link) ----
    '.sn-links>li{position:relative}' +
    ".sn-links>li>a{font-family:'Poppins','Assistant',sans-serif;font-size:14.5px;font-weight:500;letter-spacing:.01em;" +
      'color:var(--ink,#141414);text-decoration:none;white-space:nowrap;position:relative;padding:6px 0;' +
      'display:inline-flex;align-items:center;transition:color .2s ease}' +
    ".sn-links>li>a::after{content:'';position:absolute;left:0;right:0;bottom:-3px;height:1.5px;background:var(--sage-deep,#6B8B70);" +
      'transform:scaleX(0);transform-origin:center;transition:transform .25s ease}' +
    '.sn-links>li>a:hover,.sn-links>li.sn-active>a{color:var(--sage-deep,#6B8B70)}' +
    '.sn-links>li>a:hover::after,.sn-links>li.sn-active>a::after{transform:scaleX(1)}' +
    // ---- dropdown (= .topnav-has-menu / .topnav-submenu) ----
    '.sn-caret{font-size:.68em;opacity:.7;margin-right:3px;display:inline-block;transition:transform .2s ease}' +
    '.sn-has-menu:hover .sn-caret,.sn-has-menu:focus-within .sn-caret{transform:rotate(180deg)}' +
    '.sn-submenu{position:absolute;top:100%;right:0;margin:12px 0 0;padding:8px;list-style:none;min-width:210px;' +
      'background:var(--paper,#F4F0EB);border:1px solid rgba(20,20,20,.08);border-radius:14px;' +
      'box-shadow:0 20px 44px -22px rgba(60,80,65,.55);opacity:0;visibility:hidden;transform:translateY(-6px);' +
      'transition:opacity .2s ease,transform .2s ease,visibility .2s ease;z-index:130}' +
    ".sn-submenu::before{content:'';position:absolute;top:-12px;left:0;right:0;height:12px}" +
    '.sn-has-menu:hover .sn-submenu,.sn-has-menu:focus-within .sn-submenu{opacity:1;visibility:visible;transform:translateY(0)}' +
    '.sn-submenu li{margin:0}' +
    ".sn-submenu a{display:block;padding:11px 15px;border-radius:9px;white-space:nowrap;font-family:'Assistant',sans-serif;" +
      'font-size:15px;font-weight:500;color:var(--ink,#141414);text-decoration:none;transition:background-color .18s ease,color .18s ease}' +
    '.sn-submenu a:hover{background:var(--sage-soft,#CDDFB7);color:var(--ink,#141414)}' +
    // ---- cart + CTA (= .nav-cart / .nav-cta) ----
    '.sn-cart{display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;' +
      'color:var(--ink,#141414);text-decoration:none;flex-shrink:0;transition:background-color .2s ease,color .2s ease}' +
    '.sn-cart svg{width:23px;height:23px}' +
    '.sn-cart:hover{background:rgba(107,139,112,.14);color:var(--sage-deep,#6B8B70)}' +
    '.sn-cta{position:relative;display:inline-flex;align-items:center;gap:8px;background:var(--sage-deep,#6B8B70);' +
      'color:var(--paper,#F4F0EB);border:1px solid var(--sage-deep,#6B8B70);padding:13px 26px;border-radius:14px;' +
      "font-family:'Poppins','Assistant',sans-serif;font-size:15px;font-weight:500;letter-spacing:.04em;text-decoration:none;" +
      'white-space:nowrap;box-shadow:0 12px 28px rgba(107,139,112,.32),0 4px 8px rgba(20,20,20,.1);' +
      'transition:background-color .25s ease,transform .28s ease}' +
    '.sn-cta:hover{background:var(--ink,#141414);transform:translateY(-2px)}' +
    '.sn-cta .arr{font-size:16px;transition:transform .25s ease}.sn-cta:hover .arr{transform:translateX(-4px)}' +
    // ---- >=1024px: horizontal nav, hide hamburger (same breakpoint as homepage) ----
    '@media(min-width:1024px){' +
      '.site-nav{gap:22px}' +
      '.sn-toggle{display:none}.sn-panel{display:none!important}' +
      '.sn-links{display:flex;align-items:center;gap:18px;list-style:none;margin:0;padding:0}' +
      '.sn-right{display:flex;align-items:center;gap:16px;margin-inline-start:auto}' +
    '}' +
    // ---- small screens: shrink logo like the homepage ----
    '@media(max-width:768px){' +
      '.site-nav{padding:16px 18px}.site-nav.scrolled{padding:12px 18px}' +
      '.site-nav .sn-logo img{height:72px;margin:-18px 0}' +
    '}';

  var CART_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';

  var HTML = '' +
    '<div class="site-nav" role="navigation" aria-label="ניווט ראשי">' +
      '<button type="button" class="sn-toggle" aria-label="תפריט" aria-expanded="false">' +
        '<svg class="sn-bars" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>' +
        '<svg class="sn-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>' +
      '</button>' +
      '<a class="sn-logo" href="/" aria-label="EVER LAB, לדף הבית"><img src="' + LOGO + '" alt="EVER LAB"></a>' +
      '<ul class="sn-links">' +
        // הכותרת בסרגל שונתה מתפריט נפתח "תוכניות" לקישור ישיר לתוכנית לונג'ביטי. להחזרת התפריט הנפתח: החליפי את השורה הבאה בבלוק שבהערה למטה.
        '<li><a href="/longevity-program.html">תוכנית לונג’ביטי</a></li>' +
        // --- מקור: תפריט נפתח "תוכניות" (להחזרה, כולל תוכנית נשים במידת הצורך) ---
        // '<li class="sn-has-menu"><a href="/longevity-program.html">תוכניות <span class="sn-caret" aria-hidden="true">▾</span></a>' +
        //   '<ul class="sn-submenu">' +
        //     '<li><a href="/longevity-program.html">תוכנית לונג’ביטי</a></li>' +
        //     '<li><a href="/womenprogram.html">תוכנית נשים 40+</a></li>' +
        //   '</ul></li>' +
        // מסלולי היכרות הוסתר מהניווט. הדף נשמר לשימוש עתידי (tracks.html). להחזרה: בטלי את ההערה מהשורה הבאה.
        // '<li><a href="/tracks.html">מסלולי היכרות</a></li>' +
        '<li><a href="/bio-age.html">מבדק גיל ביולוגי</a></li>' +
        '<li><a href="/about.html">אודות</a></li>' +
        '<li><a href="/blog.html">בלוג</a></li>' +
        '<li><a href="/experiences.html">חבילות ומחירים</a></li>' +
        '<li><a href="/#faq">שאלות נפוצות</a></li>' +
        '<li><a href="/#contact">יצירת קשר</a></li>' +
      '</ul>' +
      '<div class="sn-right">' +
        '<a class="sn-cta" href="/experiences.html">לפרטים נוספים ורכישה <span class="arr" aria-hidden="true">←</span></a>' +
      '</div>' +
      '<div class="sn-panel">' +
        '<a href="/longevity-program.html">תוכנית לונג’ביטי</a>' +
        // תוכנית נשים 40+ הוסתרה מהניווט. הדף נשמר לשימוש עתידי (womenprogram.html). להחזרה: בטלי את ההערה מהשורה הבאה.
        // '<a href="/womenprogram.html">תוכנית נשים 40+</a>' +
        // מסלולי היכרות הוסתר מהניווט. הדף נשמר לשימוש עתידי (tracks.html). להחזרה: בטלי את ההערה מהשורה הבאה.
        // '<a href="/tracks.html">מסלולי היכרות</a>' +
        '<a href="/bio-age.html">מבדק גיל ביולוגי</a>' +
        '<a href="/about.html">אודות</a>' +
        '<a href="/blog.html">בלוג</a>' +
        '<a href="/experiences.html">חבילות ומחירים</a>' +
        '<a href="/#faq">שאלות נפוצות</a>' +
        '<a href="/#contact">יצירת קשר</a>' +
        '<a class="sn-panel-cta" href="/experiences.html">לפרטים נוספים ורכישה</a>' +
      '</div>' +
    '</div>';

  function init() {
    var style = document.createElement('style');
    style.id = 'site-nav-css';
    style.textContent = CSS;
    document.head.appendChild(style);

    // remove the old minimal bars (graceful: if JS is off, they remain)
    ['.lp-topbar', '.detail-bar', '.wp-bar', '.legal-bar'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) { el.remove(); }
    });
    var bth = document.querySelector('.back-to-home');
    if (bth) { var n = bth.closest('nav') || bth.parentElement; if (n) { n.remove(); } }

    var holder = document.createElement('div');
    holder.innerHTML = HTML;
    var nav = holder.firstElementChild;
    // keep a "skip to content" link first for accessibility, if present
    var skip = document.querySelector('.skip-to-content');
    if (skip && skip.parentNode === document.body) {
      document.body.insertBefore(nav, skip.nextSibling);
    } else {
      document.body.insertBefore(nav, document.body.firstChild);
    }

    // offset page content so it is not hidden under the fixed nav
    function pad() { document.body.style.paddingTop = nav.offsetHeight + 'px'; }
    pad();
    window.addEventListener('resize', pad);

    // condensed style on scroll
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });

    // mobile hamburger
    var toggle = nav.querySelector('.sn-toggle');
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('sn-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      pad();
    });

    // mark the current page's link active
    var path = location.pathname.replace(/\/index\.html$/, '/');
    nav.querySelectorAll('.sn-links > li > a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href && href !== '/' && href.charAt(0) === '/' && href.indexOf('#') === -1) {
        if (path === href || path === href.replace(/\.html$/, '')) {
          var li = a.closest('li');
          if (li) { li.classList.add('sn-active'); }
        }
      }
    });
    // also light up "תוכניות" when on one of the program pages
    if (/longevity-program|womenprogram/.test(path)) {
      var menu = nav.querySelector('.sn-has-menu');
      if (menu) { menu.classList.add('sn-active'); }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
