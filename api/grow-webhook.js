// Grow (payment links) → Meta Conversions API bridge (Vercel Serverless Function).
//
// Grow calls https://ever-lab.co/api/grow-webhook after each payment on the gift-card
// payment pages. We forward one Purchase event to the EVER LAB dataset server-to-server,
// so purchases are counted even when the buyer declined cookies, blocks trackers, or
// never comes back to /thank-you.
//
// PRIVACY: must match privacy-policy.html §15 ("העברת נתוני רכישה ל-Meta"). We send ONLY
// amount, currency, product name, time, and SHA-256 hashes of email + phone. Never the
// buyer's name, address or card data. Nothing personal is ever logged.
//
// Env vars (Vercel → Settings → Environment Variables, Production):
//   META_CAPI_TOKEN       required. Access token from Events Manager (dataset settings).
//   GROW_WEBHOOK_SECRET   recommended. When set, a request must carry it as ?key=… in the
//                         webhook URL (or as webhookKey in the body), else it is rejected.
//   META_TEST_EVENT_CODE  optional, temporary. While set, EVERY event goes to Events
//                         Manager → Test events only (it does not count in ads), and
//                         GET /api/grow-webhook?selftest=1 sends one synthetic test event.
//                         Remove it after testing.
//   META_GRAPH_VERSION    optional, default v26.0.

const crypto = require('crypto');

const PIXEL_ID = '1249727762563006';
const SOURCE_URL = 'https://ever-lab.co/giftcard';
// Only gift-card purchases are forwarded. Checked against the product names/description.
// Includes "יום כיף" so renaming the Grow products to match the ads keeps them counted.
const PRODUCT_MATCH = /התחדשות|שובר|יום כיף|gift/i;
const MAX_BODY = 256 * 1024;
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/* ---------------- helpers ---------------- */

function sha256(s) { return crypto.createHash('sha256').update(s, 'utf8').digest('hex'); }

function normEmail(e) {
  e = String(e || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : '';
}

// Meta wants digits only, with country code: 050-1234567 → 972501234567
function normPhone(p) {
  let d = String(p || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = '972' + d.slice(1);
  else if (d.length === 9 && d[0] === '5') d = '972' + d;
  return d.length >= 11 && d.length <= 15 ? d : '';
}

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

function log(obj) { console.log(JSON.stringify(Object.assign({ fn: 'grow-webhook' }, obj))); }

// Read the stream ourselves instead of touching req.body: Vercel's lazy body parser
// throws on malformed JSON, and Grow's exact payload format is not fully documented.
async function readRaw(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX_BODY) throw new Error('body too large');
    chunks.push(typeof c === 'string' ? Buffer.from(c) : c);
  }
  return Buffer.concat(chunks).toString('utf8');
}

// "data[productData][0][name]" → obj.data.productData["0"].name
function setDeep(obj, key, val) {
  const parts = String(key).replace(/\]/g, '').split('[').filter((p) => p !== '');
  if (!parts.length || parts.some((p) => UNSAFE_KEYS.has(p))) return;
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (typeof o[k] !== 'object' || o[k] === null) o[k] = {};
    o = o[k];
  }
  o[parts[parts.length - 1]] = val;
}

function parseJSON(s) {
  try { return JSON.parse(s); } catch (_) {}
  try { return JSON.parse(s.replace(/,\s*([}\]])/g, '$1')); } catch (_) {}   // trailing commas
  return null;
}

function parseBody(raw, contentType) {
  const ct = String(contentType || '').toLowerCase();
  const t = raw.trim();
  let out = null;

  if (ct.includes('json') || t.startsWith('{')) out = parseJSON(t);

  if (!out && ct.includes('multipart/form-data')) {
    // boundary is case-sensitive, so read it from the original header, not the lowercased copy
    const m = String(contentType).match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
    const boundary = m && (m[1] || m[2]);
    if (boundary) {
      out = {};
      for (const part of raw.split('--' + boundary)) {
        const i = part.indexOf('\r\n\r\n');
        if (i < 0) continue;
        const name = (part.slice(0, i).match(/name="([^"]*)"/) || [])[1];
        if (name) setDeep(out, name, part.slice(i + 4).replace(/\r\n$/, ''));
      }
    }
  }

  if (!out && t && !t.startsWith('{')) {
    out = {};
    for (const [k, v] of new URLSearchParams(t)) setDeep(out, k, v);
  }

  out = out && typeof out === 'object' ? out : {};
  if (typeof out.data === 'string' && out.data.trim().startsWith('{')) out.data = parseJSON(out.data) || out.data;
  return out;
}

function toList(x) {
  if (Array.isArray(x)) return x;
  if (x && typeof x === 'object') return Object.values(x);
  return [];
}

function pick(o, ...keys) {
  if (!o || typeof o !== 'object') return undefined;
  for (const k of keys) {
    const v = o[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  return undefined;
}

function extract(root) {
  const d = root.data && typeof root.data === 'object' ? root.data : root;
  const products = toList(d.productData || d.products).filter((p) => p && typeof p === 'object');
  const names = products.map((p) => String(p.name || p.productName || '').trim()).filter(Boolean);
  const qty = products.reduce((n, p) => n + (parseInt(p.quantity, 10) || 1), 0) || 1;
  return {
    id: String(pick(d, 'transactionId', 'transaction_id', 'transactionCode') || ''),
    statusCode: String(pick(d, 'statusCode', 'status_code') || ''),
    status: String(d.status || ''),
    sum: parseFloat(String(pick(d, 'sum', 'amount', 'paymentSum') || '').replace(/[^\d.]/g, '')),
    description: String(d.description || '').trim(),
    names,
    qty,
    email: pick(d, 'payerEmail', 'email'),
    phone: pick(d, 'payerPhone', 'phone'),
    key: pick(root, 'webhookKey') || pick(d, 'webhookKey'),
    // for debugging unknown formats: field NAMES only, never values
    shape: { top: Object.keys(root).slice(0, 30), data: d === root ? [] : Object.keys(d).slice(0, 60) },
  };
}

function authorized(req, ex) {
  const secret = process.env.GROW_WEBHOOK_SECRET;
  if (!secret) return true;
  const url = new URL(req.url, 'https://ever-lab.co');
  const a = Buffer.from(String(url.searchParams.get('key') || ex.key || ''));
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function buildEvent(ex, eventId) {
  const user_data = {};
  const em = normEmail(ex.email);
  const ph = normPhone(ex.phone);
  if (em) user_data.em = [sha256(em)];
  if (ph) user_data.ph = [sha256(ph)];
  return {
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: 'website',
    event_source_url: SOURCE_URL,
    user_data,
    custom_data: {
      currency: 'ILS',
      value: Math.round(ex.sum * 100) / 100,
      content_name: (ex.names.join(', ') || ex.description || 'שובר מתנה').slice(0, 200),
      content_type: 'product',
      num_items: ex.qty,
    },
  };
}

async function sendToMeta(events) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) { const e = new Error('META_CAPI_TOKEN is not set'); e.meta = { config: true }; throw e; }
  const v = /^v\d+\.\d+$/.test(process.env.META_GRAPH_VERSION || '') ? process.env.META_GRAPH_VERSION : 'v26.0';
  const body = { data: events, access_token: token };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(`https://graph.facebook.com/${v}/${PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) {
      const e = new Error('Meta rejected the event');
      e.meta = j.error
        ? { status: r.status, message: j.error.message, code: j.error.code, subcode: j.error.error_subcode,
            user_msg: j.error.error_user_msg, trace: j.error.fbtrace_id }
        : { status: r.status };
      throw e;
    }
    return { received: j.events_received, trace: j.fbtrace_id, test: !!body.test_event_code };
  } finally {
    clearTimeout(timer);
  }
}

// GET ?selftest=1 → one synthetic event, ONLY while META_TEST_EVENT_CODE is set
// (test events never count in ads or reports).
async function selfTest(res) {
  if (!process.env.META_TEST_EVENT_CODE) return send(res, 404, { ok: false });
  const ev = buildEvent(
    { sum: 1, names: ['בדיקת חיבור'], description: '', qty: 1, email: 'capi-selftest@ever-lab.co', phone: '' },
    'selftest_' + Date.now()
  );
  try {
    const r = await sendToMeta([ev]);
    log({ result: 'selftest-sent', meta: r });
    return send(res, 200, { ok: true, meta: r });
  } catch (e) {
    log({ result: 'selftest-error', error: e.message, meta: e.meta });
    return send(res, 502, { ok: false, error: e.message, meta: e.meta });
  }
}

/* ---------------- handler ---------------- */

module.exports = async (req, res) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    const url = new URL(req.url, 'https://ever-lab.co');
    if (url.searchParams.get('selftest') === '1') return selfTest(res);
    return send(res, 200, { ok: true });
  }
  if (req.method !== 'POST') return send(res, 405, { ok: false });

  let raw = '';
  try { raw = await readRaw(req); } catch (e) { return send(res, 413, { ok: false }); }
  if (!raw) { try { raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}); } catch (_) {} }

  const ex = extract(parseBody(raw, req.headers['content-type']));

  if (!authorized(req, ex)) {
    log({ result: 'unauthorized' });
    return send(res, 401, { ok: false });
  }

  const paid = ex.statusCode ? ex.statusCode === '2' : /שולם/.test(ex.status);
  if (!paid) {
    log({ result: 'ignored', reason: 'not-paid', statusCode: ex.statusCode, shape: ex.shape });
    return send(res, 200, { ok: true, ignored: 'not-paid' });
  }
  if (!(ex.sum > 0 && ex.sum < 20000)) {
    log({ result: 'ignored', reason: 'no-valid-sum', shape: ex.shape });
    return send(res, 200, { ok: true, ignored: 'no-valid-sum' });
  }
  const productText = (ex.names.join(' ') + ' ' + ex.description).trim();
  if (productText && !PRODUCT_MATCH.test(productText)) {
    log({ result: 'ignored', reason: 'not-gift-card', product: productText.slice(0, 80) });
    return send(res, 200, { ok: true, ignored: 'not-gift-card' });
  }

  // Same transaction → same event_id, so a Grow retry is de-duplicated by Meta.
  const eventId = 'grow_' + (ex.id || sha256(raw).slice(0, 32));
  const event = buildEvent(ex, eventId);
  const info = {
    tx: ex.id || null, value: event.custom_data.value, product: event.custom_data.content_name,
    hasEmail: !!event.user_data.em, hasPhone: !!event.user_data.ph,
  };

  try {
    const r = await sendToMeta([event]);
    log(Object.assign({ result: 'sent', meta: r }, info));
    return send(res, 200, { ok: true });
  } catch (e) {
    log(Object.assign({ result: 'meta-error', error: e.message, meta: e.meta }, info));
    // 502 lets Grow retry if it supports retries; event_id keeps that from double counting.
    return send(res, 502, { ok: false });
  }
};
