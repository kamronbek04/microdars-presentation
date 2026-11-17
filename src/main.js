// Wires the deck together. Usually left as it is.
import '@fontsource-variable/geologica';
import '@fontsource-variable/martian-mono';
import './styles.css';
import { gsap } from 'gsap';
import { DECK } from './deck.js';
import { createBackdrop } from './backdrop.js';
import { createRail } from './rail.js';
import { createEngine } from './engine.js';
import { buildSteps } from './steps.js';
import { icon } from './icons.js';
import { LANG_ORDER, T, getLang, getTheme, onChange, setLang, cycleLang, toggleTheme } from './i18n.js';

// Screenshots (?shot) may run in software rendering: keep animations on the clock there.
if (new URLSearchParams(window.location.search).has('shot')) gsap.ticker.lagSmoothing(0);

const $ = (s) => document.querySelector(s);

// The top bar: logo and name (hidden on hero steps), language and theme controls, step counter.
$('#mark').innerHTML = `<img src="${import.meta.env.BASE_URL}${DECK.logo}" alt="" /><span>${DECK.name}</span>`;
const ctl = $('#ctl');
ctl.innerHTML = `
  ${LANG_ORDER.length > 1 ? `<div class="ctl-lang" role="group">${LANG_ORDER.map((l) => `<button type="button" data-lang="${l}">${l.toUpperCase()}</button>`).join('')}</div>` : ''}
  <button type="button" class="ctl-theme" data-theme-toggle><span class="t-dark">${icon('moon')}</span><span class="t-light">${icon('sun')}</span></button>`;
ctl.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.lang) setLang(b.dataset.lang);
  if ('themeToggle' in b.dataset) toggleTheme();
  b.blur();
});

// Everything outside the steps that has words: the cue, the credits, the controls' labels.
function chrome() {
  const t = T();
  $('#cue').innerHTML = `<span>${t.ui.next}</span><span class="key">${icon('arrowRight')}</span>`;
  $('#credits').textContent = t.credits || '';
  ctl.querySelector('.ctl-lang')?.setAttribute('aria-label', t.ui.lang);
  ctl.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === getLang())));
  const tb = ctl.querySelector('.ctl-theme');
  tb.setAttribute('aria-label', t.ui.theme);
  tb.title = t.ui.theme;
}
chrome();

const bg = createBackdrop($('#bg'));
const engine = createEngine({
  steps: buildSteps(),
  stage: $('#stage'),
  cardSlot: $('#card-slot'),
  visualSlot: $('#visual-slot'),
  rail: createRail($('#rail')),
  bg,
  count: $('#count'),
  cue: $('#cue'),
  mark: $('#mark'),
  onKey: (k) => {
    if (k === 'l' || k === 'L') cycleLang();
    else if (k === 't' || k === 'T') toggleTheme();
  },
});

let lastLang = getLang();
let lastTheme = getTheme();
onChange(({ lang, theme }) => {
  if (lang !== lastLang) {
    lastLang = lang;
    chrome();
    bg.relocalize();
    engine.refresh(buildSteps());
  }
  if (theme !== lastTheme) {
    lastTheme = theme;
    bg.setTheme(theme);
  }
});

// #12 in the address opens step 12 directly.
const start = parseInt(window.location.hash.slice(1), 10);
engine.go(Number.isFinite(start) ? start - 1 : 0, { instant: Number.isFinite(start) && start > 1 });
if (import.meta.env.DEV) window.__engine = engine;
