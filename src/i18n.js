// Language and theme state. The choice is remembered per browser; ?lang=uz or ?theme=dark in the
// address overrides it. The first language in DECK.languages is the reference: any text missing in
// another language shows in the reference, and the dev server lists what is missing in the console.
import { DECK } from './deck.js';
import uz from './lang/uz.js';

// Every language this deck has. To add one, write src/lang/<code>.js with the same keys as uz.js,
// import it here, add it to ALL and list its code in DECK.languages.
const ALL = { uz };
const BASE = DECK.languages[0];
export const LANG_ORDER = DECK.languages.filter((l) => ALL[l]);

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
// A language over the reference: a missing key, or an array item left empty, falls back.
function over(base, top) {
  if (top === undefined || top === null || top === '') return base;
  if (Array.isArray(base) && Array.isArray(top)) return base.map((b, i) => over(b, top[i]));
  if (isObj(base) && isObj(top)) {
    const out = { ...base };
    for (const k of Object.keys(top)) out[k] = over(base[k], top[k]);
    return out;
  }
  return top;
}
function missing(base, top, path = '') {
  if (top === undefined || top === null || top === '') return [path];
  if (Array.isArray(base)) return base.flatMap((b, i) => missing(b, top?.[i], `${path}[${i}]`));
  if (isObj(base)) return Object.keys(base).flatMap((k) => missing(base[k], top?.[k], path ? `${path}.${k}` : k));
  return [];
}

export const LANGS = Object.fromEntries(LANG_ORDER.map((l) => [l, l === BASE ? ALL[l] : over(ALL[BASE], ALL[l])]));
if (import.meta.env.DEV) {
  for (const l of LANG_ORDER) {
    if (l === BASE) continue;
    const gaps = missing(ALL[BASE], ALL[l]);
    if (gaps.length) console.warn(`[lang] ${l}: ${gaps.length} text(s) still in ${BASE}:`, gaps);
  }
}

const params = new URLSearchParams(window.location.search);
const store = {
  get(k) { try { return window.localStorage.getItem(`${DECK.storageKey}.${k}`); } catch { return null; } },
  set(k, v) { try { window.localStorage.setItem(`${DECK.storageKey}.${k}`, v); } catch { /* private mode */ } },
};

let lang = [params.get('lang'), store.get('lang')].find((l) => l && LANGS[l]) || LANG_ORDER[0];
let theme = [params.get('theme'), store.get('theme')].find((t) => t === 'light' || t === 'dark') || DECK.theme || 'light';

const subs = new Set();
const emit = () => subs.forEach((f) => f({ lang, theme }));

/** All text of the current language (the reference language filling any gaps). */
export const T = () => LANGS[lang];
export const getLang = () => lang;
export const getTheme = () => theme;
export const onChange = (f) => { subs.add(f); return () => subs.delete(f); };

function applyDocument() {
  document.documentElement.lang = lang;
  document.documentElement.dataset.theme = theme;
  document.title = T().title || DECK.name;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#fff8f0' : '#172131');
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme);
}
applyDocument();

export function setLang(l) {
  if (!LANGS[l] || l === lang) return;
  lang = l;
  store.set('lang', l);
  applyDocument();
  emit();
}
export const cycleLang = () => setLang(LANG_ORDER[(LANG_ORDER.indexOf(lang) + 1) % LANG_ORDER.length]);
export function setTheme(t) {
  if ((t !== 'light' && t !== 'dark') || t === theme) return;
  theme = t;
  store.set('theme', t);
  applyDocument();
  emit();
}
export const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

/** A number in the current language's style: 180 000 (uz, ru) or 180,000 (en). */
export function fmt(n, digits = 0) {
  const loc = { uz: 'uz-Latn-UZ', ru: 'ru-RU', en: 'en-GB' }[lang] || 'en-GB';
  return new Intl.NumberFormat(loc, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
}
