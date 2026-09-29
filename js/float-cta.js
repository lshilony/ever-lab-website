/* ============================================================
   EVER LAB, floating "book a call" CTA
   A pill that stays fixed on every page and opens WhatsApp with
   a pre-filled message. Replaces the small "שאלות?" WhatsApp float
   so there is a single, clear floating call-to-action.
   ============================================================ */
(function () {
  'use strict';

  var PHONE = '972796299299';
  var MESSAGE = 'הגעתי מהאתר. אשמח לקבל פרטים נוספים.';
  var HREF = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(MESSAGE);

  var WA_ICON = '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16.001 0.001c-8.836 0-16 7.164-16 16 0 2.823 0.733 5.594 2.127 8.041l-2.262 8.262 8.461-2.219c2.353 1.283 5.013 1.961 7.718 1.961h0.006c8.836 0 16-7.164 16-16s-7.164-16.045-16.05-16.045zM16.001 29.336h-0.005c-2.414 0-4.78-0.65-6.847-1.876l-0.491-0.292-5.085 1.334 1.359-4.961-0.32-0.508c-1.346-2.141-2.058-4.616-2.057-7.154 0-7.414 6.034-13.448 13.453-13.448 3.591 0 6.965 1.4 9.504 3.942 2.539 2.541 3.937 5.916 3.935 9.508 0 7.414-6.034 13.453-13.448 13.453zM23.382 19.226c-0.404-0.202-2.393-1.181-2.764-1.317-0.371-0.135-0.641-0.202-0.911 0.203-0.27 0.404-1.045 1.317-1.281 1.587-0.236 0.27-0.472 0.304-0.876 0.101-0.404-0.202-1.708-0.629-3.252-2.006-1.202-1.073-2.014-2.398-2.25-2.803-0.236-0.404-0.025-0.624 0.178-0.825 0.182-0.181 0.404-0.472 0.607-0.708 0.202-0.236 0.27-0.404 0.404-0.674 0.135-0.27 0.067-0.506-0.034-0.708-0.101-0.202-0.911-2.194-1.248-3.003-0.328-0.787-0.662-0.68-0.911-0.692-0.236-0.012-0.506-0.014-0.776-0.014-0.27 0-0.708 0.101-1.079 0.506-0.371 0.404-1.416 1.384-1.416 3.376 0 1.992 1.45 3.916 1.652 4.186 0.202 0.27 2.853 4.356 6.913 6.111 0.966 0.417 1.72 0.666 2.307 0.853 0.969 0.308 1.852 0.265 2.55 0.161 0.778-0.116 2.393-0.978 2.731-1.923 0.337-0.945 0.337-1.756 0.236-1.923-0.101-0.169-0.371-0.27-0.776-0.472z"/></svg>';

  var CSS = '' +
    '.fcta{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:1200;display:inline-flex;align-items:center;gap:6px;' +
      'background:rgba(244,240,235,.97);-webkit-backdrop-filter:blur(10px) saturate(140%);backdrop-filter:blur(10px) saturate(140%);' +
      'border:1px solid rgba(20,20,20,.08);border-radius:999px;padding:7px 22px 7px 7px;box-shadow:0 14px 44px -14px rgba(20,20,20,.4);' +
      "text-decoration:none;font-family:'Poppins','Assistant',sans-serif;max-width:calc(100vw - 28px);" +
      'transition:transform .25s ease,box-shadow .25s ease}' +
    '.fcta:hover{transform:translateX(-50%) translateY(-3px);box-shadow:0 20px 52px -14px rgba(20,20,20,.46)}' +
    '.fcta:focus-visible{outline:2px solid var(--sage-deep,#6B8B70);outline-offset:3px}' +
    '.fcta-label{font-size:15px;font-weight:500;color:var(--ink,#141414);white-space:nowrap}' +
    '.fcta-btn{display:inline-flex;align-items:center;gap:8px;background:var(--sage-deep,#6B8B70);color:#fff;font-size:14.5px;font-weight:500;' +
      'letter-spacing:.01em;padding:12px 22px;border-radius:999px;white-space:nowrap;transition:background-color .25s ease}' +
    '.fcta:hover .fcta-btn{background:var(--ink,#141414)}' +
    '.fcta-btn svg{width:17px;height:17px;flex:none}' +
    '@media(max-width:600px){' +
      '.fcta{padding:6px;gap:0;bottom:16px}' +
      '.fcta-label{display:none}' +
      '.fcta-btn{font-size:13.5px;padding:12px 20px}' +
    '}' +
    '@media(prefers-reduced-motion:reduce){.fcta{transition:none}.fcta:hover{transform:translateX(-50%)}}';

  var HTML = '<a class="fcta" href="' + HREF + '" target="_blank" rel="noopener noreferrer" aria-label="לתיאום שיחת התאמה בוואטסאפ">' +
      '<span class="fcta-label">רוצים לשמוע עוד?</span>' +
      '<span class="fcta-btn">' + WA_ICON + 'לתיאום שיחת התאמה</span>' +
    '</a>';

  function init() {
    if (document.querySelector('.fcta')) { return; }
    var style = document.createElement('style');
    style.id = 'float-cta-css';
    style.textContent = CSS;
    document.head.appendChild(style);

    // hide the small "שאלות?" WhatsApp float so there is one clear floating CTA
    var wa = document.querySelector('.wa-float');
    if (wa) { wa.style.display = 'none'; }

    var holder = document.createElement('div');
    holder.innerHTML = HTML;
    document.body.appendChild(holder.firstElementChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
