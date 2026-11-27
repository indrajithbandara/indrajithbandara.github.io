import { readFileSync } from 'node:fs';

const sw = readFileSync('sw.js', 'utf8');
const expectedSw = (sw.match(/const\s+VERSION\s*=\s*['"]([^'"]+)['"]/) || [])[1] || '';
const strict = process.argv.includes('--strict');

const targets = [
  { name: 'GitHub Pages (Primary)', url: 'https://indrajithbandara.is-a.dev/', role: 'primary' },
  { name: 'GitHub Pages (Provider)', url: 'https://indrajithbandara.github.io/', role: 'redirect' },
  { name: 'Cloudflare Pages', url: 'https://indrajithbandara.pages.dev/', role: 'mirror' },
  { name: 'Netlify', url: 'https://indrajithbandara.netlify.app/', role: 'mirror' },
  { name: 'Vercel', url: 'https://indrajith-portfolio-weld.vercel.app/', role: 'mirror' },
  { name: 'Surge', url: 'https://indrajithbandara.surge.sh/', role: 'mirror' },
  { name: 'Redirect (go-live.me)', url: 'https://indrajithbandara.go-live.me/', role: 'redirect' },
  { name: 'Redirect (is-pro.dev)', url: 'https://indrajithbandara.is-pro.dev/', role: 'redirect' },
  { name: 'Redirect (thedev.id)', url: 'https://indrajithbandara.thedev.id/', role: 'pending' }
];

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(12000) });
  const text = await res.text();
  return { ok: res.ok, status: res.status, finalUrl: res.url, text };
}

async function checkHost(t) {
  const row = {
    name: t.name,
    url: t.url,
    role: t.role,
    status: 0,
    finalUrl: '',
    hasOverview: false,
    has36Recs: false,
    swVersion: '',
    synced: false,
    error: ''
  };
  try {
    const home = await fetchText(t.url);
    row.status = home.status;
    row.finalUrl = home.finalUrl;
    row.hasOverview = home.text.includes('id="overview"');
    row.has36Recs = home.text.includes('36 published');

    if (t.role === 'primary' || t.role === 'mirror') {
      const base = new URL(t.url).origin + '/';
      const [swRes, cssRes, jsRes, credRes, recRes] = await Promise.all([
        fetchText(base + 'sw.js').catch(() => ({ ok: false, text: '' })),
        fetchText(base + 'assets/css/style.css').catch(() => ({ ok: false })),
        fetchText(base + 'assets/js/motion.js').catch(() => ({ ok: false })),
        fetchText(base + 'credential-directory.json').catch(() => ({ ok: false })),
        fetchText(base + 'recommendations/').catch(() => ({ ok: false, text: '' }))
      ]);
      row.swVersion = (swRes.text.match(/const\s+VERSION\s*=\s*['"]([^'"]+)['"]/) || [])[1] || '';
      const assetsOk = cssRes.ok && jsRes.ok && credRes.ok && recRes.ok;
      row.synced = home.ok && assetsOk && row.hasOverview && row.has36Recs && (!expectedSw || row.swVersion === expectedSw);
    } else {
      row.synced = home.ok && row.finalUrl.startsWith('https://indrajithbandara.is-a.dev');
    }
  } catch (err) {
    row.error = err.message || String(err);
  }
  return row;
}

const results = await Promise.all(targets.map(checkHost));
console.table(results.map(({ name, status, hasOverview, has36Recs, swVersion, synced, error }) => ({
  name, status, hasOverview, has36Recs, swVersion, synced, error: error.slice(0, 48)
})));

const primaryOk = results.find(r => r.role === 'primary')?.synced;
if (!primaryOk) {
  console.error('Primary production deployment verification failed.');
  process.exit(1);
}
if (strict && results.some(r => r.role === 'mirror' && !r.synced)) {
  console.error('Strict mode: one or more mirror platforms are out of sync.');
  process.exit(1);
}
