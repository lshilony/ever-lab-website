/* ============================================================
   EVER LAB, Meta (Facebook) Pixel, consent-gated.
   Fires ONLY after the visitor grants marketing-cookie consent
   (window.everlabConsent.get().marketing === true), matching the
   site's cookie banner. Tracks the purchase funnel:
     PageView         every page
     ViewContent      gift-card / shop pages
     InitiateCheckout click on an Arbox "לרכישה אונליין" buy button
     Lead             WhatsApp purchase click + contact-form submit
   NOTE: the actual Purchase happens off-site on Arbox, so it is NOT
   captured here. To record purchases, the pixel must also sit on
   Arbox's post-payment page, or use Meta's Conversions API.
   ============================================================ */
(function () {
  'use strict';

  var PIXEL_ID = '120249484434340250';
  var started = false;

  function marketingOK() {
    try {
      var p = window.everlabConsent && window.everlabConsent.get && window.everlabConsent.get();
      return !!(p && p.marketing);
    } catch (e) { return false; }
  }

  function initPixel() {
    if (started) return;
    started = true;

    // Meta Pixel base code
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');

    var isShop = /\/giftcard/.test(location.pathname) || !!document.querySelector('.packs, .cat-grid-2');
    if (isShop) {
      try { fbq('track', 'ViewContent', { content_category: 'gift-card', content_name: document.title }); } catch (e) {}
    }
  }

  // Pull a ₪ amount from the nearest product card, for event value (helps ad optimization).
  function priceNear(el) {
    var card = el.closest && el.closest('.pack, .cat-card, article');
    var p = card && card.querySelector && card.querySelector('.price, .cat-card-desc');
    var m = p && (p.textContent || '').match(/([\d,]+)\s*₪/);
    return m ? Number(m[1].replace(/,/g, '')) : null;
  }

  // Buy-intent clicks (listener always attached; fbq only exists after consent).
  document.addEventListener('click', function (e) {
    if (!window.fbq) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/arbox\.link/.test(href)) {
      var data = { currency: 'ILS' };
      var v = priceNear(a); if (v) data.value = v;
      try { fbq('track', 'InitiateCheckout', data); } catch (_) {}
    } else if (/wa\.me/.test(href) && /(לרכוש|רכישה|שובר)/.test((a.textContent || '') + ' ' + (a.getAttribute('aria-label') || ''))) {
      try { fbq('track', 'Lead', { content_category: 'whatsapp-purchase' }); } catch (_) {}
    }
  }, true);

  // Contact-form submit = Lead.
  document.addEventListener('submit', function (e) {
    if (!window.fbq) return;
    if (e.target && e.target.closest && e.target.closest('.closing-form')) {
      try { fbq('track', 'Lead', { content_category: 'contact-form' }); } catch (_) {}
    }
  }, true);

  function maybeStart() { if (marketingOK()) initPixel(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', maybeStart);
  } else {
    maybeStart();
  }
  // Fire as soon as consent is granted, and re-check in case the consent API inits slightly later.
  window.addEventListener('everlab:consent-updated', maybeStart);
  setTimeout(maybeStart, 1200);
})();
