/* ============================================================
   EVER LAB, Google Analytics 4 with Consent Mode v2.
   All four consent signals default to denied. gtag.js is loaded only
   after the visitor grants the banner's analytics category, so nothing
   reaches Google before that (Consent Mode "basic"). The marketing
   category drives the ad_* signals. Withdrawing analytics consent
   disables the tag and removes its cookies.
   ============================================================ */
(function () {
  'use strict';

  var GA_ID = 'G-HL5DY8KEDW';
  var loaded = false;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  function load() {
    if (loaded) return;
    loaded = true;
    gtag('js', new Date());
    gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function clearCookies() {
    var root = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!/^_ga(_|$)/.test(name)) return;
      ['', ';domain=' + root, ';domain=.' + root].forEach(function (domain) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/' + domain;
      });
    });
  }

  function apply(prefs) {
    var analytics = !!(prefs && prefs.analytics);
    var ads = prefs && prefs.marketing ? 'granted' : 'denied';
    gtag('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: ads,
      ad_user_data: ads,
      ad_personalization: ads
    });
    window['ga-disable-' + GA_ID] = !analytics;
    if (analytics) { load(); } else { clearCookies(); }
  }

  function applySaved() {
    var prefs = window.everlabConsent && window.everlabConsent.get && window.everlabConsent.get();
    if (prefs) apply(prefs);
  }

  // The banner's API is ready by DOMContentLoaded on every page.
  if (document.readyState === 'complete') {
    applySaved();
  } else {
    document.addEventListener('DOMContentLoaded', applySaved);
  }
  window.addEventListener('everlab:consent-updated', function (e) { apply(e.detail); });
})();
