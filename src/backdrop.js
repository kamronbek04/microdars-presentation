// The background, in place of the kit's map: an exercise-book page (light theme) or a chalkboard
// (dark theme). A step names a place on the page with bg: { view: 'c2' }; between chapters the page
// slides there, and once it lands it sways very slowly, the way the map decks fly and drift.
//
// What a step's bg: { ... } can say (every key is optional):
//   view   a place from VIEWS below                    (default: stays where it is)
//   dur    slide time in ms                            (default 1900)
//   grid   strength of the squares, 0 to 1             (default 1)
//   marks  strength of the pupil's pencil marks, 0-1   (default 0: only bare pages show them)
//   sway   slow sway once landed, 0 = still            (default 1)
//
// The page is drawn in two layers: the squares (one cell larger than the screen on every side,
// moved by less than a cell, so sliding never repaints) and the marks (the margin lines and a
// pupil's practice rows, placed in cells on an endless page).
import { gsap } from 'gsap';
import { hand } from './hand.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// ?still freezes the sway (for screenshots).
const STILL = new URLSearchParams(window.location.search).has('still');

// Places on the page: the cell at the centre of the screen. Each chapter has a page of its own,
// one screen apart (a screen is 52 cells wide at 16:9), so the story turns pages left to right.
const PAGE = 52;
const ORDER = ['cover', 'c1', 'c2', 'c3', 'order', 'g1', 'g2', 'g3', 'g4', 'c5', 'c6', 'c7', 'end'];
const LIFT = [0, -1, 1, 0, 1, -1, 0, 1, -1, 0, 1, -1, 0];
export const VIEWS = Object.fromEntries(ORDER.map((id, k) => [id, { x: k * PAGE, y: LIFT[k] }]));

// The pupil's marks, in cells. Every page has its red margin line just left of the content, as in
// an exercise book. The pencil practice rows sit around the words of the pages that show them
// (the opening, the statements, the close: bg.marks on the step).
const MARGIN = -25;
const ROWS = {
  cover: [[9, -10.6, '1  1  1  1  1'], [14, 10.9, '2  2  2  2'], [-21, 10.4, '1 + 1 = 2']],
  c1: [[-19, -10.2, '3  3  3  3'], [13, 9.4, '2 + 3 = 5'], [-16, 9.8, '4  4  4']],
  c7: [[12, -10.4, '5  5  5  5'], [-19, 9.8, '1 + 4 = 5'], [14, 10.2, '3  3  3']],
  end: [[9, -10.6, '1, 2, 3, 4, 5'], [-21, -10.4, '2  2  2  2'], [3, 10.6, '5 = 2 + 3'], [-21, 10.4, '3  3  3']],
};
const MARGINS = ORDER.map((id) => VIEWS[id].x + MARGIN);
const MARKS = Object.entries(ROWS).flatMap(([id, rows]) => rows.map(([x, y, t]) => [VIEWS[id].x + x, VIEWS[id].y + y, t]));

const DEF = { view: null, dur: null, grid: 1, marks: 0, sway: 1 };

export function createBackdrop(el) {
  el.innerHTML = `
    <div class="bg-grid"></div>
    <div class="bg-marks">
      ${MARGINS.map((x) => `<i class="bg-margin" style="left:calc(${x} * var(--cell))"></i>`).join('')}
      ${MARKS.map(([x, y, t], k) => `<span class="bg-row" style="left:calc(${x} * var(--cell));top:calc(${y} * var(--cell))">${hand(t, { seed: k + 2 })}</span>`).join('')}
    </div>
    <div class="bg-grain"></div>`;
  const grid = el.querySelector('.bg-grid');
  const marks = el.querySelector('.bg-marks');

  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const cellPx = () => parseFloat(getComputedStyle(el).getPropertyValue('--cell')) * rem() || 36;
  // The cell in pixels follows the screen (one rem follows its height); read again on resize, with
  // the screen's centre, so the squares line up with the marks drawn in cells from that centre.
  let C = cellPx();
  let HW = window.innerWidth / 2;
  let HH = window.innerHeight / 2;

  // The camera: the page cell at the centre of the screen, plus the sway on top of it.
  const cam = { x: 0, y: 0 };
  let current = null;
  let swayK = 0;
  const swayO = { k: 0 };
  const t0 = performance.now();

  function render(now) {
    const c = C;
    const s = swayO.k * c;
    const t = (now - t0) / 1000;
    const dx = s * 0.32 * Math.sin((t / 41) * Math.PI * 2);
    const dy = s * 0.22 * Math.sin((t / 57) * Math.PI * 2 + 1.3);
    const px = -cam.x * c + dx;
    const py = -cam.y * c + dy;
    const mx = (((px + HW) % c) + c) % c;
    const my = (((py + HH) % c) + c) % c;
    grid.style.transform = `translate3d(${(mx - c).toFixed(2)}px, ${(my - c).toFixed(2)}px, 0)`;
    marks.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`;
  }
  gsap.ticker.add(() => render(performance.now()));

  const fade = (prop, to, dur) => {
    if (!dur) gsap.set(el, { [prop]: to });
    else gsap.to(el, { [prop]: to, duration: dur, ease: 'power2.inOut', overwrite: 'auto' });
  };

  function apply(spec = {}, { instant = false } = {}) {
    const s = { ...DEF, ...spec };
    const v = s.view && VIEWS[s.view];
    if (s.view && !v) console.warn(`[bg] unknown view "${s.view}": add it to VIEWS in src/backdrop.js`);
    if (v && s.view !== current) {
      current = s.view;
      gsap.killTweensOf(cam);
      if (instant || REDUCED) {
        cam.x = v.x;
        cam.y = v.y;
      } else {
        gsap.to(cam, { x: v.x, y: v.y, duration: (s.dur ?? 1900) / 1000, ease: 'power3.inOut' });
      }
    }
    const d = instant ? 0 : 1.2;
    fade('--grid-k', s.grid, d);
    fade('--marks-k', s.marks, instant ? 0 : 0.6); // the pencil marks come and go quickly
    swayK = REDUCED || STILL ? 0 : s.sway;
    gsap.to(swayO, { k: swayK, duration: instant ? 0 : 2.4, ease: 'sine.inOut', overwrite: true });
  }

  return {
    apply,
    // A new language: nothing on the page has words.
    relocalize() {},
    // A new theme: the page's colours are CSS tokens, so nothing to redraw.
    setTheme() {},
    // After a window resize the cell size changes with the rem; the next frame uses the new one.
    refit() {
      C = cellPx();
      HW = window.innerWidth / 2;
      HH = window.innerHeight / 2;
    },
  };
}
