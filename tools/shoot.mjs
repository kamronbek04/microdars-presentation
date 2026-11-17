// Photographs every step of the deck in every language, and lists console errors and warnings.
//
//   npm run shots                                   every step, every language (dev server running)
//   npm run shots -- --lang en --steps 3-7           some steps, one language
//   npm run shots -- --theme both                    dark and light
//   npm run shots -- --url http://localhost:4180     a built deck (npm run preview)
//
// Pictures go to shots/<lang>-<theme>-<step>.png; open shots/index.html to look through them.
// Needs Google Chrome or Microsoft Edge. Set CHROME to its path if it is not found.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DECK } from '../src/deck.js';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
};
const URL_ = arg('url', 'http://localhost:5180').replace(/\/+$/, '');
const LANGS = arg('lang', DECK.languages.join(',')).split(',');
const THEMES = arg('theme', 'dark') === 'both' ? ['dark', 'light'] : [arg('theme', 'dark')];
const WAIT = Number(arg('wait', 2500));
const OUT = path.resolve(arg('out', 'shots'));
const [W, H] = arg('size', '1920x1080').split('x').map(Number);

const CANDIDATES = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const chrome = CANDIDATES.find((p) => fs.existsSync(p));
if (!chrome) {
  console.error('Chrome or Edge was not found. Set CHROME to its path, e.g. set CHROME=C:\\path\\to\\chrome.exe');
  process.exit(1);
}

function parseSteps(spec, total) {
  if (!spec) return Array.from({ length: total }, (_, i) => i + 1);
  return spec.split(',').flatMap((part) => {
    const [a, b] = part.split('-').map(Number);
    return b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a];
  }).filter((n) => n >= 1 && n <= total);
}

fs.mkdirSync(OUT, { recursive: true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'deck-shots-'));
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  userDataDir: profile,
  args: [...(process.platform === 'win32' ? ['--use-angle=d3d11'] : []), '--ignore-gpu-blocklist', '--hide-scrollbars', `--window-size=${W},${H}`],
  defaultViewport: { width: W, height: H, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
let current = '';
const notes = [];
page.on('pageerror', (e) => notes.push({ at: current, kind: 'error', text: String(e).slice(0, 300) }));
page.on('console', (m) => {
  const t = m.text();
  if (m.type() === 'error' || (m.type() === 'warning' && /^\[(lang|icons|card|visuals|map)\]/.test(t))) {
    notes.push({ at: current, kind: m.type(), text: t.slice(0, 300) });
  }
});
// Map tiles in flight: a step is photographed once they have settled.
let inflight = 0;
const isTile = (u) => /arcgisonline|amazonaws/.test(u);
page.on('request', (r) => { if (isTile(r.url())) inflight++; });
const done = (r) => { if (isTile(r.url())) inflight = Math.max(0, inflight - 1); };
page.on('requestfinished', done);
page.on('requestfailed', done);
async function settle(min, max = 15000) {
  const t0 = Date.now();
  let quiet = Date.now();
  while (Date.now() - t0 < max) {
    await new Promise((r) => setTimeout(r, 200));
    if (inflight > 0) quiet = Date.now();
    if (Date.now() - t0 > min && Date.now() - quiet > 800) break;
  }
}

const shots = [];
for (const lang of LANGS) {
  for (const theme of THEMES) {
    current = `${lang}-${theme}`;
    await page.goto(`${URL_}/?lang=${lang}&theme=${theme}&still&shot#1`, { waitUntil: 'load', timeout: 90000 });
    await settle(8000, 25000); // the first view, then the terrain
    const total = await page.evaluate(() => Number(document.querySelector('#count')?.textContent.split('/')[1]) || 0);
    for (const n of parseSteps(arg('steps'), total)) {
      current = `${lang}-${theme} step ${n}`;
      await page.evaluate((k) => { window.location.hash = `#${k}`; }, n);
      await settle(WAIT);
      const file = `${lang}-${theme}-${String(n).padStart(2, '0')}.png`;
      await page.screenshot({ path: path.join(OUT, file) });
      shots.push({ lang, theme, n, file });
      process.stdout.write(`${file} `);
    }
  }
}
console.log();
await browser.close();
fs.rmSync(profile, { recursive: true, force: true });

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Deck shots</title>
<style>body{margin:24px;font:14px system-ui;background:#0b1015;color:#dfe8ec}h2{margin:28px 0 10px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:14px}figure{margin:0}
img{width:100%;border:1px solid #2a3540;border-radius:6px}figcaption{padding:4px 2px;color:#9fb0ba}
ul{color:#f3b09f}</style>
<h1>${esc(DECK.name)}: ${shots.length} shots</h1>
${notes.length ? `<h2>Console: ${notes.length}</h2><ul>${notes.map((x) => `<li><b>${esc(x.at)}</b> ${esc(x.kind)}: ${esc(x.text)}</li>`).join('')}</ul>` : '<p>No console errors or warnings.</p>'}
${[...new Set(shots.map((s) => `${s.lang}-${s.theme}`))].map((g) => `<h2>${g}</h2><div class="g">${shots.filter((s) => `${s.lang}-${s.theme}` === g).map((s) => `<figure><img loading="lazy" src="${s.file}"><figcaption>Step ${s.n}</figcaption></figure>`).join('')}</div>`).join('')}`);
console.log(`${shots.length} shots in ${OUT}. Open index.html to look through them.`);
if (notes.length) {
  console.log(`${notes.length} console message(s):`);
  for (const x of notes.slice(0, 20)) console.log(`  ${x.at} · ${x.kind}: ${x.text}`);
}
