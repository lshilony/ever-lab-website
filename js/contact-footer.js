/* ============================================================
   EVER LAB, shared "leave your details" footer form.
   Injects the same closing contact band the homepage has (manifesto +
   lead form) into any page that does NOT already contain one, right
   before the <footer class="site-footer">. Fully self-contained (its
   own CSS with literal brand values), so it works on pages that do not
   load home.css. Mirrors the homepage form 1:1, including validation,
   honeypot, UTM attribution and the Make.com webhook.
   Include on a page with: <script src="/js/contact-footer.js" defer></script>
   ============================================================ */
(function () {
  'use strict';

  // If the page already has the closing band (the homepage), do nothing.
  if (document.querySelector('.closing-band')) { return; }

  var WEBHOOK = 'https://hook.eu1.make.com/r5rcmhps5s5agakxo3c07t8khfs8ausp';

  var CSS = '' +
    '.closing-band{background:#E1DDD6;padding:72px 32px 110px;text-align:center;position:relative;overflow:hidden}' +
    '.closing-inner{position:relative;z-index:1;max-width:820px;margin:0 auto}' +
    '.closing-band .chapter-eyebrow{font-family:"Poppins","Assistant",monospace;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#76726C;margin-bottom:28px;display:flex;justify-content:center;align-items:center;gap:14px}' +
    '.closing-band .chapter-eyebrow .eyebrow-line{display:inline-block;width:40px;height:1px;background:#6B8B70;opacity:.5}' +
    '.closing-manifesto{font-family:"Poppins","Assistant",serif;font-weight:300;font-size:clamp(28px,3.2vw,40px);line-height:1.35;letter-spacing:-.022em;margin-bottom:48px;color:#141414}' +
    '.closing-form{max-width:540px;margin:0 auto;text-align:right;direction:rtl;background:#fff;border:1px solid rgba(20,20,20,.06);border-radius:22px;padding:clamp(26px,4vw,40px);box-shadow:0 26px 60px -30px rgba(60,52,40,.42)}' +
    '.closing-form .cf-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}' +
    '.closing-form .cf-field{display:block;margin-bottom:14px;position:relative}' +
    '.closing-form .cf-row .cf-field{margin-bottom:0}' +
    '.closing-form .cf-label{display:block;font-family:"Poppins","Assistant",sans-serif;font-size:12px;font-weight:300;color:#3a3a36;margin-bottom:6px;letter-spacing:-.005em}' +
    '.closing-form .cf-field input{width:100%;box-sizing:border-box;font-family:"Poppins","Assistant",sans-serif;font-size:15px;font-weight:300;color:#141414;background:#F4F0EB;border:1px solid rgba(20,20,20,.14);border-radius:12px;padding:12px 14px;direction:rtl;text-align:right;transition:border-color .25s ease,box-shadow .25s ease;outline:none}' +
    '.closing-form .cf-field input:focus-visible{border-color:#6B8B70;box-shadow:0 0 0 3px rgba(107,139,112,.18)}' +
    '.closing-form .cf-consent{display:grid;grid-template-columns:22px 1fr;gap:12px;align-items:start;margin:24px 0 28px;cursor:pointer;text-align:right}' +
    '.closing-form .cf-consent input[type="checkbox"]{position:absolute;opacity:0;pointer-events:none}' +
    '.closing-form .cf-consent-mark{display:inline-block;width:18px;height:18px;border:1px solid rgba(20,20,20,.3);border-radius:5px;background:transparent;transition:all .2s ease;flex-shrink:0;margin-top:2px;position:relative}' +
    '.closing-form .cf-consent input[type="checkbox"]:checked~.cf-consent-mark{background:#6B8B70;border-color:#6B8B70}' +
    '.closing-form .cf-consent input[type="checkbox"]:checked~.cf-consent-mark::after{content:"";position:absolute;left:5px;top:1px;width:5px;height:10px;border:solid #F4F0EB;border-width:0 2px 2px 0;transform:rotate(45deg)}' +
    '.closing-form .cf-consent input[type="checkbox"]:focus-visible~.cf-consent-mark{box-shadow:0 0 0 3px rgba(107,139,112,.25)}' +
    '.closing-form .cf-consent-text{font-family:"Poppins","Assistant",sans-serif;font-size:12.5px;font-weight:300;line-height:1.55;color:#3a3a36;letter-spacing:-.003em}' +
    '.closing-form .cf-link{color:#6B8B70;text-decoration:underline;text-underline-offset:2px}' +
    '.closing-form .cf-link:hover{color:#141414}' +
    '.closing-form .cf-submit{display:inline-flex;align-items:center;justify-content:center;gap:12px;width:100%;background:#6B8B70;color:#F4F0EB;border:none;padding:16px 28px;border-radius:14px;font-family:"Poppins","Assistant",sans-serif;font-size:clamp(16px,1.4vw,18px);letter-spacing:.04em;font-weight:500;cursor:pointer;transition:all .3s ease;box-shadow:0 12px 30px rgba(20,20,20,.1)}' +
    '.closing-form .cf-submit:hover{background:#141414;color:#F4F0EB;transform:translateY(-2px)}' +
    '.closing-form .cf-submit[disabled]{opacity:.6;cursor:default;transform:none}' +
    '.closing-form .cf-status{margin-top:18px;font-family:"Poppins","Assistant",sans-serif;font-size:15px;line-height:1.5;text-align:center;padding:12px 18px;border-radius:8px}' +
    '.closing-form .cf-status.is-success{color:#6B8B70;background:rgba(205,223,183,.4);border:1px solid rgba(107,139,112,.35)}' +
    '.closing-form .cf-status.is-error{color:#8a3a3a;background:rgba(180,90,90,.08);border:1px solid rgba(180,90,90,.3)}' +
    '@media(max-width:700px){.closing-band{padding:56px 20px 84px}.closing-manifesto{margin-bottom:36px}}' +
    '@media(max-width:600px){.closing-form .cf-row{grid-template-columns:1fr;gap:14px}}';

  var HTML = '' +
    '<section class="closing-band" id="contact">' +
      '<div class="closing-inner">' +
        '<h2 class="closing-manifesto">את הגיל הכרונולוגי אי אפשר לעצור.<br>על הגיל הביולוגי אפשר להשפיע.<br>ואף פעם לא מאוחר להתחיל.</h2>' +
        '<form class="closing-form" novalidate data-webhook="' + WEBHOOK + '">' +
          '<div aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"><label>אל תמלאו שדה זה<input type="text" name="company_website" tabindex="-1" autocomplete="off"></label></div>' +
          '<div class="cf-row">' +
            '<label class="cf-field"><span class="cf-label">שם מלא</span><input type="text" name="name" autocomplete="name" required></label>' +
            '<label class="cf-field"><span class="cf-label">טלפון</span><input type="tel" name="phone" autocomplete="tel" required></label>' +
          '</div>' +
          '<label class="cf-field"><span class="cf-label">אימייל</span><input type="email" name="email" autocomplete="email" required></label>' +
          '<label class="cf-consent"><input type="checkbox" name="consent" required><span class="cf-consent-mark" aria-hidden="true"></span><span class="cf-consent-text">אני מאשר/ת קבלת דיוור פרסומי מ-EVER LAB ומסכים/ה ל<a href="/terms-and-conditions.html" class="cf-link" target="_blank" rel="noopener noreferrer">תנאי השימוש</a> ול<a href="/privacy-policy.html" class="cf-link" target="_blank" rel="noopener noreferrer">מדיניות הפרטיות</a>.</span></label>' +
          '<button type="submit" class="cf-submit">לתיאום שיחת התאמה ←</button>' +
          '<p class="cf-status" role="status" aria-live="polite" hidden></p>' +
        '</form>' +
      '</div>' +
    '</section>';

  function attachHandler(form) {
    if (!form) { return; }
    var webhook = form.dataset.webhook;
    var btn = form.querySelector('.cf-submit');
    var status = form.querySelector('.cf-status');
    var btnLabel = btn ? btn.textContent.trim() : '';

    function showStatus(msg, type) {
      if (!status) { return; }
      status.textContent = msg;
      status.className = 'cf-status is-' + type;
      status.hidden = false;
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!webhook) { return; }

      // Honeypot: if the hidden field is filled it's a bot. Fake success, send nothing.
      var trap = form.querySelector('[name="company_website"]');
      if (trap && trap.value) {
        form.querySelectorAll('.cf-row, .cf-field, .cf-consent').forEach(function (el) { el.style.display = 'none'; });
        btn.style.display = 'none';
        showStatus('תודה! קיבלנו את הפרטים ונחזור אליכם בהקדם.', 'success');
        return;
      }

      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var email = form.email.value.trim();
      var consent = form.consent.checked;

      if (!name || !phone || !email) { showStatus('נא למלא שם, טלפון ואימייל.', 'error'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showStatus('כתובת האימייל אינה תקינה.', 'error'); return; }
      if (!/\d{7,}/.test(phone.replace(/\D/g, ''))) { showStatus('מספר הטלפון אינו תקין.', 'error'); return; }
      if (!consent) { showStatus('יש לאשר את קבלת הדיוור ותנאי השימוש.', 'error'); return; }

      btn.disabled = true;
      btn.textContent = 'שולח...';
      if (status) { status.hidden = true; }

      var utm = (window.everlabUTM && window.everlabUTM.get) ? window.everlabUTM.get() : {};
      var payload = {
        name: name, phone: phone, email: email, consent: consent,
        utm_source: utm.utm_source || '', utm_medium: utm.utm_medium || '',
        utm_campaign: utm.utm_campaign || '', utm_term: utm.utm_term || '', utm_content: utm.utm_content || '',
        source: 'ever-lab.co footer form',
        page: window.location.href,
        page_title: document.title,
        submitted_at: new Date().toISOString(),
      };

      try {
        var res = await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) { throw new Error('HTTP ' + res.status); }
        form.querySelectorAll('.cf-row, .cf-field, .cf-consent').forEach(function (el) { el.style.display = 'none'; });
        btn.style.display = 'none';
        showStatus('תודה! קיבלנו את הפרטים ונחזור אליכם בהקדם.', 'success');
      } catch (err) {
        btn.disabled = false;
        btn.textContent = btnLabel;
        showStatus('אירעה שגיאה בשליחה. נסו שוב, או פנו אלינו בוואטסאפ.', 'error');
      }
    });
  }

  function init() {
    if (document.querySelector('.closing-band')) { return; }

    var style = document.createElement('style');
    style.id = 'contact-footer-css';
    style.textContent = CSS;
    document.head.appendChild(style);

    var holder = document.createElement('div');
    holder.innerHTML = HTML;
    var section = holder.firstElementChild;

    var footer = document.querySelector('footer.site-footer');
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(section, footer);
    } else {
      document.body.appendChild(section);
    }

    attachHandler(section.querySelector('.closing-form'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
