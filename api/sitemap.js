// Dynamic sitemap for EVER LAB — generated on each request (Vercel Serverless Function).
// Served at https://ever-lab.co/sitemap.xml via the rewrite in vercel.json.
//
// It auto-discovers the site's .html pages from the filesystem (bundled via
// vercel.json > functions.includeFiles). Per-page priority/changefreq/canonical
// come from META below; anything discovered but not listed still gets sensible
// defaults, and if the filesystem can't be read it falls back to the META list —
// so the sitemap is never empty.

const fs = require('fs');
const path = require('path');

const ORIGIN = 'https://ever-lab.co';

// Canonical path + SEO hints per page. lastmod is a fallback; the live file's
// modification time is preferred when available.
const META = {
  'index.html':                { url: '/',                          priority: '1.0', changefreq: 'weekly',  lastmod: '2026-07-27' },
  'experiences.html':          { url: '/experiences.html',          priority: '0.9', changefreq: 'weekly',  lastmod: '2026-07-23' },
  'bio-age.html':              { url: '/bio-age.html',              priority: '0.9', changefreq: 'monthly', lastmod: '2026-07-26' },
  'training.html':             { url: '/training.html',             priority: '0.8', changefreq: 'monthly', lastmod: '2026-07-23' },
  'recovery.html':             { url: '/recovery.html',             priority: '0.8', changefreq: 'monthly', lastmod: '2026-07-23' },
  'womenprogram.html':         { url: '/womenprogram',              priority: '0.8', changefreq: 'monthly', lastmod: '2026-07-23' },
  'terms-and-conditions.html': { url: '/terms-and-conditions.html', priority: '0.3', changefreq: 'yearly',  lastmod: '2026-07-23' },
  'privacy-policy.html':       { url: '/privacy-policy.html',       priority: '0.3', changefreq: 'yearly',  lastmod: '2026-07-23' },
  'refund-policy.html':        { url: '/refund-policy.html',        priority: '0.3', changefreq: 'yearly',  lastmod: '2026-07-23' },
  'cancellation.html':         { url: '/cancellation.html',         priority: '0.3', changefreq: 'yearly',  lastmod: '2026-07-23' },
  'lab-regulations.html':      { url: '/lab-regulations.html',      priority: '0.3', changefreq: 'yearly',  lastmod: '2026-07-23' },
};

// Never expose: drafts/variants and pages disallowed in robots.txt.
const EXCLUDE = new Set([
  'index.v1-journey-architecture.html',
  'accessibility.html',
  '404.html',
  '500.html',
]);

function discover() {
  for (const base of [process.cwd(), path.join(__dirname, '..'), '/var/task']) {
    try {
      const files = fs.readdirSync(base).filter((f) => f.endsWith('.html') && !EXCLUDE.has(f));
      if (files.length) return { files, base };
    } catch (_) { /* try next base */ }
  }
  return { files: Object.keys(META), base: null };
}

function mtimeISO(base, file) {
  if (!base) return null;
  try { return fs.statSync(path.join(base, file)).mtime.toISOString().slice(0, 10); }
  catch (_) { return null; }
}

function xmlEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

module.exports = (req, res) => {
  const { files, base } = discover();

  const entries = files
    .filter((f) => !EXCLUDE.has(f))
    .map((f) => {
      const m = META[f] || { url: '/' + f, priority: '0.6', changefreq: 'monthly' };
      return {
        loc: ORIGIN + m.url,
        priority: m.priority,
        changefreq: m.changefreq,
        // Prefer the accurate baked per-page date; fall back to file mtime for
        // newly-added pages not yet listed in META.
        lastmod: m.lastmod || mtimeISO(base, f) || null,
      };
    })
    .sort((a, b) => Number(b.priority) - Number(a.priority) || a.loc.localeCompare(b.loc));

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries
      .map((e) =>
        '  <url>\n' +
        `    <loc>${xmlEscape(e.loc)}</loc>\n` +
        (e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : '') +
        `    <changefreq>${e.changefreq}</changefreq>\n` +
        `    <priority>${e.priority}</priority>\n` +
        '  </url>'
      )
      .join('\n') +
    '\n</urlset>\n';

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(body);
};
