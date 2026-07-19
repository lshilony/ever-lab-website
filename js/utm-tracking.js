/* ═══════════════════════════════════════════════════════════════════════
   EVER LAB — lead-source attribution (UTM capture)

   Runs on every page. Captures UTM parameters from the landing URL into
   first-party cookies (30 days) so that if a visitor lands via an ad on
   any page, then later fills the contact form on the homepage, the
   original source is still known.

   The contact form's submit handler reads these via window.everlabUTM.get()
   and includes them in the JSON payload sent to the Make.com webhook →
   which routes the lead (with its source) into Arbox.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var COOKIE_DAYS = 30;

  function getCookie(name) {
    var nameEQ = name + '=';
    var parts = document.cookie.split(';');
    for (var i = 0; i < parts.length; i++) {
      var c = parts[i];
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  }

  function setCookie(name, value, days) {
    var expires = '';
    if (days) {
      var d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + d.toUTCString();
    }
    // Secure requires HTTPS (production). On http://localhost the cookie
    // simply won't be set — that's expected; production is HTTPS.
    document.cookie = name + '=' + (encodeURIComponent(value) || '') + expires + '; path=/; SameSite=Lax; Secure';
  }

  // 1) Capture any UTM params present on this landing URL into cookies.
  try {
    var params = new URLSearchParams(window.location.search);
    UTM_KEYS.forEach(function (key) {
      if (params.has(key)) {
        var val = params.get(key);
        if (val) setCookie(key, val, COOKIE_DAYS);
      }
    });
  } catch (e) { /* URLSearchParams unsupported — ignore */ }

  // 2) Expose the stored attribution for the form submit handler to read.
  window.everlabUTM = {
    get: function () {
      var out = {};
      UTM_KEYS.forEach(function (key) { out[key] = getCookie(key) || ''; });
      return out;
    }
  };
})();
